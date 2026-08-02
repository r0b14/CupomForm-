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
  function responsesPrisma() {
    const prisma = prismaMock();
    prisma.campaign.findFirst.mockResolvedValue({ id: 'campaign-1' });
    prisma.question.findMany.mockResolvedValue([
      {
        key: 'bairro',
        label: 'Qual bairro?',
        type: 'SINGLE_CHOICE',
        required: true,
        options: ['Torre', 'Madalena', 'Afogados'],
      },
      {
        key: 'confianca',
        label: 'Quanto confia?',
        type: 'SCALE',
        required: true,
        options: ['1 - Nada', '2', '3', '4', '5 - Muita'],
      },
      {
        key: 'motivo',
        label: 'Por quê?',
        type: 'TEXT',
        required: false,
        options: null,
      },
    ]);
    prisma.submission.findMany.mockResolvedValue([
      { answers: { bairro: 'Torre', confianca: '5 - Muita', motivo: 'gostei' } },
      { answers: { bairro: 'Torre', confianca: '1 - Nada' } },
      { answers: { bairro: 'Madalena', confianca: '3' } },
      { answers: {} },
    ]);
    return prisma;
  }

  it('agrega respostas por pergunta e mantém opções sem resposta', async () => {
    const result = await new AdminService(responsesPrisma()).responses();

    expect(result.total).toBe(4);
    expect(result.filtered).toBe(4);
    expect(result.filters).toEqual({});

    const bairro = result.questions[0];
    expect(bairro.answered).toBe(3);
    // Afogados nao teve resposta, mas continua no relatorio com zero.
    expect(bairro.distribution).toEqual([
      { value: 'Torre', count: 2, percentage: 50, inOptions: true },
      { value: 'Madalena', count: 1, percentage: 25, inOptions: true },
      { value: 'Afogados', count: 0, percentage: 0, inOptions: true },
    ]);
  });

  it('calcula media de escala e devolve amostras de texto livre', async () => {
    const result = await new AdminService(responsesPrisma()).responses();

    expect(result.questions[1].average).toBe(3);
    expect(result.questions[0].average).toBeNull();

    const texto = result.questions[2];
    expect(texto.distribution).toEqual([]);
    expect(texto.samples).toEqual(['gostei']);
  });

  it('preserva valores gravados fora da lista de opcoes atual', async () => {
    const prisma = responsesPrisma();
    prisma.submission.findMany.mockResolvedValue([
      { answers: { bairro: 'Joana Bezerra' } },
      { answers: { bairro: 'Torre' } },
    ]);

    const { distribution } = (await new AdminService(prisma).responses()).questions[0];
    const legado = distribution.find((item) => item.value === 'Joana Bezerra');
    expect(legado).toEqual({ value: 'Joana Bezerra', count: 1, percentage: 50, inOptions: false });
  });

  it('recorta a base pelos filtros e recalcula as demais perguntas', async () => {
    const result = await new AdminService(responsesPrisma()).responses(
      JSON.stringify({ bairro: ['Torre'] }),
    );

    expect(result.total).toBe(4);
    expect(result.filtered).toBe(2);
    expect(result.filters).toEqual({ bairro: ['Torre'] });
    // Media da escala considera apenas as duas submissoes de Torre.
    expect(result.questions[1].average).toBe(3);
    expect(result.questions[0].distribution[0]).toEqual({
      value: 'Torre',
      count: 2,
      percentage: 100,
      inOptions: true,
    });
  });

  it('descarta filtro de pergunta inexistente e informa o recorte aplicado', async () => {
    const result = await new AdminService(responsesPrisma()).responses(
      JSON.stringify({ pergunta_removida: ['x'], bairro: ['Torre'] }),
    );

    expect(result.filters).toEqual({ bairro: ['Torre'] });
    expect(result.filtered).toBe(2);
  });

  it('rejeita filtro que nao e JSON de objeto', async () => {
    await expect(new AdminService(responsesPrisma()).responses('nao-e-json')).rejects.toThrow(
      BadRequestException,
    );
    await expect(new AdminService(responsesPrisma()).responses('[1,2]')).rejects.toThrow(
      BadRequestException,
    );
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
