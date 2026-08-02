export type CouponDiscountPercent = 5 | 10;

export const COUPON_CODE_PATTERN = /^GENTE-(005|010)-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function couponDiscountPercent(code: string): CouponDiscountPercent | null {
  const normalized = normalizeCouponCode(code);
  const match = COUPON_CODE_PATTERN.exec(normalized);
  if (!match) return null;
  return match[1] === '010' ? 10 : 5;
}

export function isSupportedCouponCode(code: string): boolean {
  return couponDiscountPercent(code) !== null;
}

export function couponCodePrefix(discount: CouponDiscountPercent): string {
  return discount === 10 ? 'GENTE-010-' : 'GENTE-005-';
}
