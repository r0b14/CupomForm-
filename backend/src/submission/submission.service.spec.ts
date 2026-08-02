import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SubmissionService } from './submission.service';

function createPrismaMock() {
  return {
    campaign: { findFirst: vi.fn() },
    submission: { findUnique: vi.fn() },
    deliveryRequest: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  } as any;
}

describe('SubmissionService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const validDto = {
    name: 'Ana Silva',
    phone: '(81) 99999-8888',
    answers: {},
    consent: true,
  };

  it('deve rejeitar telefones inválidos', async () => {
    const service = new SubmissionService(createPrismaMock());
    await expect(
      service.create({
        ...validDto,
        phone: '123',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar nomes curtos', async () => {
    const service = new SubmissionService(createPrismaMock());
    await expect(
      service.create({
        ...validDto,
        name: 'A',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve devolver o mesmo cupom para um telefone já cadastrado', async () => {
    const prisma = createPrismaMock();
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', questions: [] });
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        submission: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'submission-1',
            couponId: 'coupon-1',
            coupon: { code: 'GENTE-010-0001' },
          }),
        },
      }),
    );
    const service = new SubmissionService(prisma);

    await expect(service.create(validDto)).resolves.toEqual({
      submissionId: 'submission-1',
      couponCode: 'GENTE-010-0001',
      isExisting: true,
      soldOut: false,
    });
  });

  it('deve devolver a resposta existente sem cupom quando o telefone já se cadastrou num período esgotado', async () => {
    const prisma = createPrismaMock();
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', questions: [] });
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        submission: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'submission-1',
            couponId: null,
            coupon: null,
          }),
        },
      }),
    );
    const service = new SubmissionService(prisma);

    await expect(service.create(validDto)).resolves.toEqual({
      submissionId: 'submission-1',
      couponCode: null,
      isExisting: true,
      soldOut: true,
    });
  });

  it('deve salvar a resposta sem cupom quando o estoque terminar', async () => {
    const prisma = createPrismaMock();
    const submissionCreate = vi.fn().mockResolvedValue({ id: 'submission-1' });
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', questions: [] });
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        submission: { findUnique: vi.fn().mockResolvedValue(null), create: submissionCreate },
        $queryRaw: vi.fn().mockResolvedValue([]),
      }),
    );
    const service = new SubmissionService(prisma);

    await expect(service.create(validDto)).resolves.toEqual({
      submissionId: 'submission-1',
      couponCode: null,
      isExisting: false,
      soldOut: true,
    });
    expect(submissionCreate).toHaveBeenCalledOnce();
    expect(submissionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ couponId: expect.anything() }),
      }),
    );
  });

  it('deve reservar e atribuir um cupom em uma única transação', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const prisma = createPrismaMock();
    const couponUpdate = vi.fn().mockResolvedValue({});
    const queryRaw = vi.fn().mockResolvedValue([{ id: 'coupon-1' }]);
    const submissionCreate = vi.fn().mockResolvedValue({
      id: 'submission-1',
      coupon: { code: 'GENTE-010-0001' },
    });
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', questions: [] });
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        submission: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: submissionCreate,
        },
        coupon: { update: couponUpdate },
        $queryRaw: queryRaw,
      }),
    );
    const service = new SubmissionService(prisma);

    await expect(service.create(validDto)).resolves.toEqual({
      submissionId: 'submission-1',
      couponCode: 'GENTE-010-0001',
      isExisting: false,
      soldOut: false,
    });
    expect(couponUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'coupon-1' } }),
    );
    expect(submissionCreate).toHaveBeenCalledOnce();
    expect(queryRaw.mock.calls[0][0].values).toEqual([
      'campaign-1',
      'GENTE-005-%',
      'GENTE-010-%',
      'GENTE-005-%',
    ]);
  });

  it('sorteia 10% como primeira opção e mantém 5% como fallback', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const prisma = createPrismaMock();
    const queryRaw = vi.fn().mockResolvedValue([]);
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', questions: [] });
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        submission: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 'submission-1' }),
        },
        $queryRaw: queryRaw,
      }),
    );

    await new SubmissionService(prisma).create(validDto);

    expect(queryRaw.mock.calls[0][0].values).toEqual([
      'campaign-1',
      'GENTE-010-%',
      'GENTE-005-%',
      'GENTE-010-%',
    ]);
  });

  it('deve manter a entrega pendente quando o n8n não estiver configurado', async () => {
    const prisma = createPrismaMock();
    prisma.submission.findUnique.mockResolvedValue({
      id: 'submission-1',
      name: 'Ana Silva',
      phone: '+5581999998888',
      coupon: { code: 'GENTE-010-0001' },
      delivery: null,
    });
    prisma.deliveryRequest.upsert.mockResolvedValue({ id: 'delivery-1' });
    const service = new SubmissionService(prisma);

    await expect(service.requestDelivery('submission-1')).resolves.toEqual({
      status: 'PENDING',
      deliveryId: 'delivery-1',
      configured: false,
    });
  });

  it('deve rejeitar o envio de cupons legados sem percentual identificável', async () => {
    const prisma = createPrismaMock();
    prisma.submission.findUnique.mockResolvedValue({
      id: 'submission-1',
      name: 'Ana Silva',
      phone: '+5581999998888',
      coupon: { code: 'GENTE-DEV-001' },
      delivery: null,
    });

    await expect(new SubmissionService(prisma).requestDelivery('submission-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.deliveryRequest.upsert).not.toHaveBeenCalled();
  });

  it('deve marcar a entrega como DISPATCHED quando o n8n aceitar o webhook', async () => {
    vi.stubEnv('N8N_DELIVERY_WEBHOOK_URL', 'https://n8n.example.com/webhook/cupom-delivery');
    vi.stubEnv('N8N_SHARED_SECRET', 'segredo-compartilhado');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const prisma = createPrismaMock();
    prisma.submission.findUnique.mockResolvedValue({
      id: 'submission-1',
      name: 'Ana Silva',
      phone: '+5581999998888',
      coupon: { code: 'GENTE-010-0001' },
      delivery: null,
    });
    prisma.deliveryRequest.upsert.mockResolvedValue({ id: 'delivery-1' });
    prisma.deliveryRequest.update.mockResolvedValue({});
    const service = new SubmissionService(prisma);

    await expect(service.requestDelivery('submission-1')).resolves.toEqual({
      status: 'DISPATCHED',
      deliveryId: 'delivery-1',
      configured: true,
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://n8n.example.com/webhook/cupom-delivery',
      expect.objectContaining({
        body: expect.stringContaining('"discountPercent":10'),
      }),
    );
  });

  it('deve registrar FAILED quando o webhook do n8n falhar', async () => {
    vi.stubEnv('N8N_DELIVERY_WEBHOOK_URL', 'https://n8n.example.com/webhook/cupom-delivery');
    vi.stubEnv('N8N_SHARED_SECRET', 'segredo-compartilhado');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const prisma = createPrismaMock();
    prisma.submission.findUnique.mockResolvedValue({
      id: 'submission-1',
      name: 'Ana Silva',
      phone: '+5581999998888',
      coupon: { code: 'GENTE-005-0001' },
      delivery: null,
    });
    prisma.deliveryRequest.upsert.mockResolvedValue({ id: 'delivery-1' });
    prisma.deliveryRequest.update.mockResolvedValue({});
    const service = new SubmissionService(prisma);

    await expect(service.requestDelivery('submission-1')).rejects.toThrow(BadGatewayException);
    expect(prisma.deliveryRequest.update).toHaveBeenLastCalledWith({
      where: { id: 'delivery-1' },
      data: { status: 'FAILED', lastError: 'Webhook n8n respondeu 503' },
    });
  });
});
