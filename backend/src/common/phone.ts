// Brazilian phone normalization used by public endpoints.
export function normalizeBrazilPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  const nationalNumber = digits.startsWith('55') ? digits.slice(2) : digits;

  if (!/^[1-9]\d{9,10}$/.test(nationalNumber)) return null;
  // WhatsApp numbers always carry the mobile "9" after the DDD. Without this,
  // the same real phone typed with and without the leading 9 normalizes to
  // two different strings and can claim two coupons.
  const mobileNumber =
    nationalNumber.length === 10
      ? `${nationalNumber.slice(0, 2)}9${nationalNumber.slice(2)}`
      : nationalNumber;
  return `+55${mobileNumber}`;
}
