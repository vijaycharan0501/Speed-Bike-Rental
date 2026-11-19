/**
 * Normalize phone numbers to digits-only string for deduplication and WhatsApp URLs.
 */
export function normalizePhone(rawPhone = '') {
  return String(rawPhone).replace(/\D/g, '');
}

/**
 * Validate general phone format (7 to 15 digits, allowing spaces, +, -, parentheses).
 */
export function isValidPhone(rawPhone = '') {
  const trimmed = String(rawPhone).trim();
  if (!/^[+\d\s().-]{7,24}$/.test(trimmed)) return false;
  const digits = normalizePhone(trimmed);
  return digits.length >= 7 && digits.length <= 15;
}
