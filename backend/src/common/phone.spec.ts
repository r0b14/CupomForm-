// Unit tests for phone normalization.
import { describe, expect, it } from 'vitest';
import { normalizeBrazilPhone } from './phone';

describe('normalizeBrazilPhone', () => {
  it('normalizes common Brazilian WhatsApp formats', () => {
    expect(normalizeBrazilPhone('(11) 99999-1234')).toBe('+5511999991234');
    expect(normalizeBrazilPhone('+55 11 99999-1234')).toBe('+5511999991234');
  });

  it('rejects invalid values', () => {
    expect(normalizeBrazilPhone('123')).toBeNull();
    expect(normalizeBrazilPhone('abc')).toBeNull();
  });
});
