import { describe, expect, it } from 'vitest';
import { secretsMatch } from './secret';

describe('secretsMatch', () => {
  it('aceita segredos idênticos', () => {
    expect(secretsMatch('segredo-longo-123', 'segredo-longo-123')).toBe(true);
  });

  it('rejeita segredos ausentes, diferentes ou de outro tamanho', () => {
    expect(secretsMatch(undefined, 'segredo')).toBe(false);
    expect(secretsMatch('segredo', undefined)).toBe(false);
    expect(secretsMatch('segredo-a', 'segredo-b')).toBe(false);
    expect(secretsMatch('curto', 'segredo-maior')).toBe(false);
  });
});
