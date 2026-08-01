import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminTokenGuard } from './admin.guard';

function context(authorization?: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization } }),
    }),
  } as any;
}

describe('AdminTokenGuard', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('rejeita acesso quando o token não foi configurado', () => {
    vi.stubEnv('ADMIN_API_TOKEN', '');
    expect(() => new AdminTokenGuard().canActivate(context())).toThrow(ServiceUnavailableException);
  });

  it('rejeita bearer token inválido', () => {
    vi.stubEnv('ADMIN_API_TOKEN', 'segredo-administrativo');
    expect(() => new AdminTokenGuard().canActivate(context('Bearer outro-segredo'))).toThrow(
      UnauthorizedException,
    );
  });

  it('aceita bearer token válido', () => {
    vi.stubEnv('ADMIN_API_TOKEN', 'segredo-administrativo');
    expect(
      new AdminTokenGuard().canActivate(context('Bearer segredo-administrativo')),
    ).toBe(true);
  });
});
