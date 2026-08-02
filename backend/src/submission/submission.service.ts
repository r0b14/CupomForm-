// Coupon reservation and delivery orchestration.
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CouponStatus, DeliveryStatus, Prisma, Question } from '@prisma/client';
import { normalizeBrazilPhone } from '../common/phone';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { DeliveryStatusDto } from './dto/delivery-status.dto';

type CreatedSubmission = {
  submissionId: string;
  couponCode: string | null;
  isExisting: boolean;
  soldOut: boolean;
};

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSubmissionDto): Promise<CreatedSubmission> {
    const phone = normalizeBrazilPhone(dto.phone);
    if (!phone) throw new BadRequestException('Informe um WhatsApp brasileiro válido.');
    const name = dto.name.trim();
    if (name.length < 2) throw new BadRequestException('Informe seu nome.');

    const campaign = await this.prisma.campaign.findFirst({
      where: { active: true },
      include: { questions: true },
    });
    if (!campaign) throw new NotFoundException('Nenhuma campanha ativa foi encontrada.');
    const answers = this.validateAnswers(campaign.questions, dto.answers);

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const existing = await tx.submission.findUnique({
            where: { campaignId_phone: { campaignId: campaign.id, phone } },
            include: { coupon: true },
          });
          if (existing) {
            return {
              submissionId: existing.id,
              couponCode: existing.coupon?.code ?? null,
              isExisting: true,
              soldOut: existing.couponId === null,
            };
          }

          const lockedCoupons = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
            SELECT "id" FROM "Coupon"
            WHERE "campaignId" = ${campaign.id} AND "status" = 'AVAILABLE'
            ORDER BY "createdAt" ASC
            FOR UPDATE SKIP LOCKED
            LIMIT 1
          `);
          const coupon = lockedCoupons[0];
          if (!coupon) {
            // Coupons ran out: keep the research answers, just don't assign a coupon.
            const submission = await tx.submission.create({
              data: {
                campaignId: campaign.id,
                name,
                phone,
                answers,
                consentAt: new Date(),
              },
            });
            return { submissionId: submission.id, couponCode: null, isExisting: false, soldOut: true };
          }

          await tx.coupon.update({
            where: { id: coupon.id },
            data: { status: CouponStatus.ASSIGNED, assignedAt: new Date() },
          });
          const submission = await tx.submission.create({
            data: {
              campaignId: campaign.id,
              couponId: coupon.id,
              name,
              phone,
              answers,
              consentAt: new Date(),
            },
            include: { coupon: true },
          });
          return {
            submissionId: submission.id,
            couponCode: submission.coupon?.code ?? null,
            isExisting: false,
            soldOut: false,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await this.prisma.submission.findUnique({
          where: { campaignId_phone: { campaignId: campaign.id, phone } },
          include: { coupon: true },
        });
        if (existing) {
          return {
            submissionId: existing.id,
            couponCode: existing.coupon?.code ?? null,
            isExisting: true,
            soldOut: existing.couponId === null,
          };
        }
      }
      throw error;
    }
  }

  async requestDelivery(submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { coupon: true, delivery: true },
    });
    if (!submission) throw new NotFoundException('Resposta não encontrada.');
    if (!submission.coupon) throw new BadRequestException('Este cadastro não possui cupom para envio.');

    if (submission.delivery?.status === DeliveryStatus.SENT || submission.delivery?.status === DeliveryStatus.DISPATCHED) {
      return { status: submission.delivery.status, deliveryId: submission.delivery.id };
    }

    const delivery = await this.prisma.deliveryRequest.upsert({
      where: { submissionId },
      create: { submissionId, status: DeliveryStatus.PENDING },
      update: { status: DeliveryStatus.PENDING, lastError: null },
    });

    const webhookUrl = process.env.N8N_DELIVERY_WEBHOOK_URL;
    const sharedSecret = process.env.N8N_SHARED_SECRET;
    if (!webhookUrl || !sharedSecret) {
      return { status: DeliveryStatus.PENDING, deliveryId: delivery.id, configured: false };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-cupomform-secret': sharedSecret },
        body: JSON.stringify({
          deliveryId: delivery.id,
          submissionId,
          name: submission.name,
          phone: submission.phone,
          couponCode: submission.coupon.code,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Webhook n8n respondeu ${response.status}`);
      await this.prisma.deliveryRequest.update({
        where: { id: delivery.id },
        data: { status: DeliveryStatus.DISPATCHED },
      });
      return { status: DeliveryStatus.DISPATCHED, deliveryId: delivery.id, configured: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao acionar o n8n';
      await this.prisma.deliveryRequest.update({
        where: { id: delivery.id },
        data: { status: DeliveryStatus.FAILED, lastError: message },
      });
      throw new BadGatewayException('Não foi possível solicitar o envio agora. Tente novamente.');
    }
  }

  async updateDeliveryStatus(id: string, dto: DeliveryStatusDto) {
    const delivery = await this.prisma.deliveryRequest.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Solicitação de envio não encontrada.');
    return this.prisma.deliveryRequest.update({
      where: { id },
      data: {
        status: dto.status,
        providerMessageId: dto.providerMessageId,
        lastError: dto.status === DeliveryStatus.FAILED ? dto.error ?? 'Falha no provedor' : null,
      },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  private validateAnswers(questions: Question[], submitted: Record<string, string>): Record<string, string> {
    if (Array.isArray(submitted)) throw new BadRequestException('Respostas inválidas.');
    const knownKeys = new Set(questions.map((question) => question.key));
    if (Object.keys(submitted).some((key) => !knownKeys.has(key))) {
      throw new BadRequestException('O formulário contém uma pergunta inválida.');
    }

    const sanitized: Record<string, string> = {};
    for (const question of questions) {
      const rawValue = submitted[question.key];
      if (rawValue !== undefined && typeof rawValue !== 'string') {
        throw new BadRequestException('Uma resposta possui formato inválido.');
      }
      const value = rawValue?.trim() ?? '';
      if (question.required && !value) {
        throw new BadRequestException(`Responda: ${question.label}`);
      }
      if ((question.type === 'SINGLE_CHOICE' || question.type === 'SCALE') && value) {
        const options = Array.isArray(question.options) ? question.options : [];
        if (!options.some((option) => option === value)) {
          throw new BadRequestException(`A resposta para "${question.label}" não é válida.`);
        }
      }
      if (question.type === 'TEXT' && value.length > 500) {
        throw new BadRequestException(`A resposta para "${question.label}" é longa demais.`);
      }
      if (value) sanitized[question.key] = value;
    }
    return sanitized;
  }
}
