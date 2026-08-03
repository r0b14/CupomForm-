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

  /** Amostras de texto livre devolvidas por pergunta aberta. */
  private static readonly TEXT_SAMPLE_LIMIT = 60;

  /**
   * Estatísticas por pergunta, opcionalmente restritas a um recorte.
   *
   * Nada aqui conhece uma pergunta específica: tudo é derivado da tabela
   * Question, então perguntas novas, removidas ou com tipo trocado passam a
   * valer sem alterar este código nem o painel.
   */
  async responses(rawFilters?: string) {
    const campaign = await this.campaign();
    const [questions, submissions] = await Promise.all([
      this.prisma.question.findMany({
        where: { campaignId: campaign.id },
        orderBy: { position: 'asc' },
        select: {
          key: true,
          label: true,
          type: true,
          required: true,
          options: true,
          maxSelections: true,
          section: true,
        },
      }),
      this.prisma.submission.findMany({
        where: { campaignId: campaign.id },
        orderBy: { createdAt: 'desc' },
        select: { answers: true },
      }),
    ]);

    const filters = this.parseResponseFilters(rawFilters, questions.map((q) => q.key));
    const filterEntries = Object.entries(filters);
    const selected = filterEntries.length
      ? submissions.filter(({ answers }) =>
          filterEntries.every(([key, accepted]) => {
            const values = this.answerValues(answers, key);
            return values.some((value) => accepted.includes(value));
          }),
        )
      : submissions;

    const filtered = selected.length;

    return {
      total: submissions.length,
      filtered,
      filters,
      questions: questions.map((question) => {
        const options = this.questionOptions(question.options);
        const responseValues = selected
          .map(({ answers }) => this.answerValues(answers, question.key))
          .filter((values) => values.length > 0);
        const values = responseValues.flat();

        const counts = new Map<string, number>();
        values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));

        const base = {
          key: question.key,
          label: question.label,
          type: question.type,
          required: question.required,
          options,
          maxSelections: question.maxSelections,
          section: question.section,
          answered: responseValues.length,
        };

        // Texto livre não tem distribuição útil: cada resposta é única.
        if (question.type === 'TEXT') {
          return {
            ...base,
            average: null,
            distribution: [],
            samples: values.slice(0, AdminService.TEXT_SAMPLE_LIMIT),
          };
        }

        // Opções declaradas vêm sempre, mesmo com zero — some-las esconderia
        // que ninguém escolheu aquela alternativa. Valores fora da lista
        // (respostas gravadas antes de a opção ser renomeada) vêm depois,
        // marcados, em vez de desaparecerem do relatório.
        const declared = options ?? [];
        const extras = [...counts.keys()].filter((value) => !declared.includes(value));
        const ordered = [...declared, ...extras.sort()];

        const distribution = ordered.map((value) => {
          const count = counts.get(value) ?? 0;
          return {
            value,
            count,
            percentage: filtered ? Math.round((count / filtered) * 10_000) / 100 : 0,
            inOptions: declared.includes(value),
          };
        });

        return {
          ...base,
          average: question.type === 'SCALE' ? this.scaleAverage(values, declared) : null,
          distribution,
          samples: [],
        };
      }),
    };
  }

  /**
   * Recorte pedido pelo painel: `{"bairro":["Afogados"],"idade":["18 a 20"]}`.
   * Vários valores na mesma pergunta somam (OU); perguntas diferentes
   * restringem (E). Chaves desconhecidas são descartadas e o recorte
   * efetivamente aplicado volta na resposta, para o painel não exibir um
   * filtro que o backend ignorou.
   */
  private parseResponseFilters(raw: string | undefined, validKeys: string[]): Record<string, string[]> {
    if (!raw?.trim()) return {};

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestException('Filtro de respostas inválido.');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new BadRequestException('Filtro de respostas inválido.');
    }

    const filters: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!validKeys.includes(key)) continue;
      const values = (Array.isArray(value) ? value : [value])
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
      if (values.length) filters[key] = [...new Set(values)];
    }
    return filters;
  }

  private questionOptions(options: Prisma.JsonValue): string[] | null {
    if (!Array.isArray(options)) return null;
    const values = options.filter((option): option is string => typeof option === 'string');
    return values.length ? values : null;
  }

  /**
   * Média de uma escala. O número vem do rótulo (`"1 - Nada"` → 1) e, quando
   * ele não traz dígito, da posição na lista de opções — assim uma escala
   * rotulada só com palavras continua tendo média.
   */
  private scaleAverage(values: string[], options: string[]): number | null {
    if (!values.length) return null;
    const numbers = values
      .map((value) => {
        const fromLabel = /^\s*(\d+)/.exec(value)?.[1];
        if (fromLabel) return Number(fromLabel);
        const index = options.indexOf(value);
        return index >= 0 ? index + 1 : null;
      })
      .filter((number): number is number => number !== null);
    if (!numbers.length) return null;
    const sum = numbers.reduce((acc, number) => acc + number, 0);
    return Math.round((sum / numbers.length) * 100) / 100;
  }

  private answerValues(answers: Prisma.JsonValue, key: string): string[] {
    if (!answers || Array.isArray(answers) || typeof answers !== 'object') return [];
    const value = (answers as Prisma.JsonObject)[key];
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim());
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
