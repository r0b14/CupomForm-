import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SubmissionService } from './submission.service';

describe('SubmissionService Validation', () => {
  const mockPrisma = {
    campaign: {
      findFirst: vi.fn(),
    },
    submission: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  } as any;

  const service = new SubmissionService(mockPrisma);

  it('deve rejeitar telefones inválidos', async () => {
    await expect(
      service.create({
        name: 'Ana Silva',
        phone: '123',
        answers: {},
        consent: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar nomes curtos', async () => {
    await expect(
      service.create({
        name: 'A',
        phone: '(11) 99999-8888',
        answers: {},
        consent: true,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
