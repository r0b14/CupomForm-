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
          findUnique: vi.fn().mockResolvedValue({ id: 'submission-1', coupon: { code: 'GENTE10' } }),
        },
      }),
    );
    const service = new SubmissionService(prisma);

    await expect(service.create(validDto)).resolves.toEqual({
      submissionId: 'submission-1',
      couponCode: 'GENTE10',
      isExisting: true,
    });
  });

  it('deve rejeitar a emissão quando o estoque terminar', async () => {
    const prisma = createPrismaMock();
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', questions: [] });
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        submission: { findUnique: vi.fn().mockResolvedValue(null) },
        $queryRaw: vi.fn().mockResolvedValue([]),
      }),
    );
    const service = new SubmissionService(prisma);

    await expect(service.create(validDto)).rejects.toThrow('Os cupons desta campanha se esgotaram.');
  });

  it('deve reservar e atribuir um cupom em uma única transação', async () => {
    const prisma = createPrismaMock();
    const couponUpdate = vi.fn().mockResolvedValue({});
    const submissionCreate = vi.fn().mockResolvedValue({
      id: 'submission-1',
      coupon: { code: 'GENTE10' },
    });
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1', questions: [] });
    prisma.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        submission: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: submissionCreate,
        },
        coupon: { update: couponUpdate },
        $queryRaw: vi.fn().mockResolvedValue([{ id: 'coupon-1' }]),
      }),
    );
    const service = new SubmissionService(prisma);

    await expect(service.create(validDto)).resolves.toEqual({
      submissionId: 'submission-1',
      couponCode: 'GENTE10',
      isExisting: false,
    });
    expect(couponUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'coupon-1' } }),
    );
    expect(submissionCreate).toHaveBeenCalledOnce();
  });

  it('deve manter a entrega pendente quando o n8n não estiver configurado', async () => {
    const prisma = createPrismaMock();
    prisma.submission.findUnique.mockResolvedValue({
      id: 'submission-1',
      name: 'Ana Silva',
      phone: '+5581999998888',
      coupon: { code: 'GENTE10' },
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

  it('deve marcar a entrega como DISPATCHED quando o n8n aceitar o webhook', async () => {
    vi.stubEnv('N8N_DELIVERY_WEBHOOK_URL', 'https://n8n.example.com/webhook/cupom-delivery');
    vi.stubEnv('N8N_SHARED_SECRET', 'segredo-compartilhado');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const prisma = createPrismaMock();
    prisma.submission.findUnique.mockResolvedValue({
      id: 'submission-1',
      name: 'Ana Silva',
      phone: '+5581999998888',
      coupon: { code: 'GENTE10' },
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
      coupon: { code: 'GENTE10' },
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
