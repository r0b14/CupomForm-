import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('informa que API e banco estão disponíveis', async () => {
    const prisma = { $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]) } as any;
    const controller = new HealthController(prisma);

    await expect(controller.check()).resolves.toMatchObject({
      status: 'ok',
      database: 'connected',
    });
  });

  it('responde indisponível quando o banco falha', async () => {
    const prisma = { $queryRaw: vi.fn().mockRejectedValue(new Error('offline')) } as any;
    const controller = new HealthController(prisma);

    await expect(controller.check()).rejects.toThrow(ServiceUnavailableException);
  });
});
