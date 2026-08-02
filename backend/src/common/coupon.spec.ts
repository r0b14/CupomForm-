import { describe, expect, it } from 'vitest';
import {
  couponCodePrefix,
  couponDiscountPercent,
  isSupportedCouponCode,
  normalizeCouponCode,
} from './coupon';

describe('coupon helpers', () => {
  it('normaliza e identifica cupons de 5% e 10%', () => {
    expect(normalizeCouponCode(' gente-005-0001 ')).toBe('GENTE-005-0001');
    expect(couponDiscountPercent('GENTE-005-0001')).toBe(5);
    expect(couponDiscountPercent('GENTE-010-LOTE-0001')).toBe(10);
    expect(couponCodePrefix(5)).toBe('GENTE-005-');
    expect(couponCodePrefix(10)).toBe('GENTE-010-');
  });

  it('rejeita códigos sem desconto reconhecido', () => {
    expect(isSupportedCouponCode('GENTE-DEV-001')).toBe(false);
    expect(isSupportedCouponCode('GENTE-015-001')).toBe(false);
    expect(isSupportedCouponCode('GENTE-010-')).toBe(false);
  });
});
