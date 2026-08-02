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

  it('normalizes a 10-digit number missing the mobile 9 to the same result as the 11-digit form', () => {
    expect(normalizeBrazilPhone('(81) 9999-8888')).toBe(normalizeBrazilPhone('(81) 99999-8888'));
    expect(normalizeBrazilPhone('8199998888')).toBe('+5581999998888');
  });
});
