// Brazilian phone normalization used by public endpoints.
export function normalizeBrazilPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  const nationalNumber = digits.startsWith('55') ? digits.slice(2) : digits;

  if (!/^[1-9]\d{9,10}$/.test(nationalNumber)) return null;
  return `+55${nationalNumber}`;
}
