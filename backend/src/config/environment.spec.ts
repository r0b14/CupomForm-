import { describe, expect, it } from 'vitest';
import { validateEnvironment } from './environment';

describe('validateEnvironment', () => {
  it('aceita ambiente local mínimo', () => {
    expect(
      validateEnvironment({ DATABASE_URL: 'postgresql://user:pass@localhost:5432/db' }),
    ).toMatchObject({ PORT: 3001, FRONTEND_URL: 'http://localhost:3000' });
  });

  it('rejeita produção sem integração n8n', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://user:pass@postgres:5432/db',
        FRONTEND_URL: 'https://cupom.example.com',
      }),
    ).toThrow('N8N_DELIVERY_WEBHOOK_URL');
  });

  it('rejeita segredos iguais em produção', () => {
    const repeatedSecret = 'a'.repeat(32);
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://user:pass@postgres:5432/db',
        FRONTEND_URL: 'https://cupom.example.com',
        N8N_DELIVERY_WEBHOOK_URL: 'https://n8n.example.com/webhook/cupom-delivery',
        N8N_SHARED_SECRET: repeatedSecret,
        INTERNAL_CALLBACK_SECRET: repeatedSecret,
      }),
    ).toThrow('devem ser diferentes');
  });

  it('aceita mais de uma origem de frontend', () => {
    const result = validateEnvironment({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      FRONTEND_URL: 'https://cupom.example.com, https://preview.example.com',
    });
    expect(result.FRONTEND_URL).toBe('https://cupom.example.com,https://preview.example.com');
  });
});
