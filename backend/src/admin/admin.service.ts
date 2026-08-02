import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CouponStatus, DeliveryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { isSupportedCouponCode, normalizeCouponCode } from '../common/coupon';
import { ImportCouponsDto, UpdateCampaignDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private async campaign() {
    const campaign = await this.prisma.campaign.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!campaign) throw new NotFoundException('Nenhuma campanha encontrada.');
    return campaign;
  }

  private audit(
    client: Prisma.TransactionClient | PrismaService,
    campaignId: string,
    action: string,
    metadata?: Prisma.InputJsonObject,
  ) {
    return client.adminAuditLog.create({ data: { campaignId, action, metadata } });
  }

  async dashboard() {
    const campaign = await this.campaign();
    const [submissions, available, assigned, deliveryGroups] = await Promise.all([
      this.prisma.submission.count({ where: { campaignId: campaign.id } }),
      this.prisma.coupon.count({ where: { campaignId: campaign.id, status: CouponStatus.AVAILABLE } }),
      this.prisma.coupon.count({ where: { campaignId: campaign.id, status: CouponStatus.ASSIGNED } }),
      this.prisma.deliveryRequest.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { submission: { campaignId: campaign.id } },
      }),
    ]);
    const deliveries = Object.fromEntries(
      Object.values(DeliveryStatus).map((status) => [status, 0]),
    ) as Record<DeliveryStatus, number>;
    deliveryGroups.forEach((item) => { deliveries[item.status] = item._count._all; });
    return {
      campaign: { slug: campaign.slug, title: campaign.title, active: campaign.active },
      submissions,
      coupons: { available, assigned },
      deliveries,
    };
  }

  async participants(query?: string, status?: DeliveryStatus) {
    const campaign = await this.campaign();
    return this.prisma.submission.findMany({
      where: {
        campaignId: campaign.id,
        ...(query
          ? { OR: [{ name: { contains: query, mode: 'insensitive' as const } }, { phone: { contains: query } }] }
          : {}),
        ...(status ? { delivery: { status } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      select: {
        id: true,
        name: true,
        phone: true,
        answers: true,
        createdAt: true,
        coupon: { select: { code: true } },
        delivery: { select: { status: true, updatedAt: true } },
      },
    });
  }

  async responses() {
    const campaign = await this.campaign();
    const [questions, submissions] = await Promise.all([
      this.prisma.question.findMany({
        where: { campaignId: campaign.id },
        orderBy: { position: 'asc' },
        select: { key: true, label: true, type: true, required: true },
      }),
      this.prisma.submission.findMany({
        where: { campaignId: campaign.id },
        select: { answers: true },
      }),
    ]);

    const total = submissions.length;
    return {
      total,
      questions: questions.map((question) => {
        const values = submissions
          .map(({ answers }) => this.answerValue(answers, question.key))
          .filter((value): value is string => Boolean(value));
        const counts = new Map<string, number>();
        values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
        return {
          ...question,
          answered: values.length,
          distribution: [...counts.entries()]
            .map(([value, count]) => ({
              value,
              count,
              percentage: total ? Math.round((count / total) * 10_000) / 100 : 0,
            }))
            .sort((left, right) => right.count - left.count),
        };
      }),
    };
  }

  private answerValue(answers: Prisma.JsonValue, key: string): string | undefined {
    if (!answers || Array.isArray(answers) || typeof answers !== 'object') return undefined;
    const value = (answers as Prisma.JsonObject)[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  async getCampaign() {
    const campaign = await this.campaign();
    return this.prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: { questions: { orderBy: { position: 'asc' } } },
    });
  }

  async updateCampaign(dto: UpdateCampaignDto) {
    const campaign = await this.campaign();
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.campaign.update({
        where: { id: campaign.id },
        data: {
          ...(dto.active === undefined ? {} : { active: dto.active }),
          ...(dto.title === undefined ? {} : { title: dto.title.trim() }),
          ...(dto.subtitle === undefined ? {} : { subtitle: dto.subtitle.trim() }),
        },
      });
      await this.audit(tx, campaign.id, 'CAMPAIGN_UPDATED', dto as Prisma.InputJsonObject);
      return updated;
    });
  }

  async coupons(query?: string, status?: CouponStatus) {
    const campaign = await this.campaign();
    return this.prisma.coupon.findMany({
      where: {
        campaignId: campaign.id,
        ...(status ? { status } : {}),
        ...(query ? { code: { contains: query, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: { submission: { select: { name: true, createdAt: true } } },
    });
  }

  async importCoupons(dto: ImportCouponsDto) {
    const campaign = await this.campaign();
    const codes = [...new Set(dto.codes.map(normalizeCouponCode).filter(Boolean))];
    if (!codes.length) throw new BadRequestException('Nenhum código válido foi informado.');
    if (codes.some((code) => !isSupportedCouponCode(code))) {
      throw new BadRequestException('Use apenas códigos no padrão GENTE-005-* ou GENTE-010-*.');
    }
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.coupon.createMany({
        data: codes.map((code) => ({ campaignId: campaign.id, code })),
        skipDuplicates: true,
      });
      await this.audit(tx, campaign.id, 'COUPONS_IMPORTED', {
        received: dto.codes.length,
        inserted: result.count,
      });
      return { inserted: result.count, ignored: codes.length - result.count };
    });
  }

  async deliveries(status?: DeliveryStatus) {
    const campaign = await this.campaign();
    return this.prisma.deliveryRequest.findMany({
      where: { submission: { campaignId: campaign.id }, ...(status ? { status } : {}) },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
      include: {
        submission: {
          select: { id: true, name: true, phone: true, coupon: { select: { code: true } } },
        },
      },
    });
  }

  async history() {
    const campaign = await this.campaign();
    return this.prisma.adminAuditLog.findMany({
      where: { campaignId: campaign.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async logResend(submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: { campaignId: true },
    });
    if (!submission) throw new NotFoundException('Participante não encontrado.');
    await this.audit(this.prisma, submission.campaignId, 'DELIVERY_RESEND_REQUESTED', { submissionId });
  }
}
