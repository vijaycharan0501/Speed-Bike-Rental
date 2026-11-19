import crypto from 'crypto';

/**
 * Generate a unique human-readable booking reference e.g. SBR-20261118-4F9K2A
 */
export function generateBookingReference() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SBR-${y}${m}${d}-${randomPart}`;
}
