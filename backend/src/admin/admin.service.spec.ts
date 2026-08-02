import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminService } from './admin.service';

function prismaMock() {
  return {
    campaign: { findFirst: vi.fn() },
    question: { findMany: vi.fn() },
    submission: { findMany: vi.fn() },
    coupon: { createMany: vi.fn() },
    adminAuditLog: { create: vi.fn() },
    $transaction: vi.fn(),
  } as any;
}

describe('AdminService', () => {
  it('agrega respostas reais por pergunta', async () => {
    const prisma = prismaMock();
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1' });
    prisma.question.findMany.mockResolvedValue([
      { key: 'bairro', label: 'Qual bairro?', type: 'SINGLE_CHOICE', required: true },
    ]);
    prisma.submission.findMany.mockResolvedValue([
      { answers: { bairro: 'Torre' } },
      { answers: { bairro: 'Torre' } },
      { answers: { bairro: 'Madalena' } },
      { answers: {} },
    ]);

    await expect(new AdminService(prisma).responses()).resolves.toEqual({
      total: 4,
      questions: [
        {
          key: 'bairro',
          label: 'Qual bairro?',
          type: 'SINGLE_CHOICE',
          required: true,
          answered: 3,
          distribution: [
            { value: 'Torre', count: 2, percentage: 50 },
            { value: 'Madalena', count: 1, percentage: 25 },
          ],
        },
      ],
    });
  });

  it('normaliza, remove duplicados e audita a importação na mesma transação', async () => {
    const prisma = prismaMock();
    const tx = {
      coupon: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
      adminAuditLog: { create: vi.fn().mockResolvedValue({}) },
    };
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1' });
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) => callback(tx));

    await expect(
      new AdminService(prisma).importCoupons({
        codes: [' gente-005-0001 ', 'GENTE-005-0001', 'gente-010-0001'],
      }),
    ).resolves.toEqual({ inserted: 2, ignored: 0 });
    expect(tx.coupon.createMany).toHaveBeenCalledWith({
      data: [
        { campaignId: 'campaign-1', code: 'GENTE-005-0001' },
        { campaignId: 'campaign-1', code: 'GENTE-010-0001' },
      ],
      skipDuplicates: true,
    });
    expect(tx.adminAuditLog.create).toHaveBeenCalledOnce();
  });

  it('rejeita lotes com nomenclatura de desconto inválida', async () => {
    const prisma = prismaMock();
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1' });

    await expect(
      new AdminService(prisma).importCoupons({ codes: ['GENTE-DEV-001'] }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
