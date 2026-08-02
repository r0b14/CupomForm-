export function cleanPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatPhone(raw: string): string {
  let digits = cleanPhone(raw);

  // Strip country code (+55 or 55) if pasted full international number
  if (digits.length >= 12 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  // Check if Brazilian mobile / WhatsApp number (starts with 9 after DDD or has 11 digits)
  const isMobile =
    digits.length === 11 || (digits.length >= 3 && digits[2] === "9");

  if (isMobile) {
    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  // 10-digit landline number
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
}

