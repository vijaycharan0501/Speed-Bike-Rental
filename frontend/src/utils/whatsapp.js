/**
 * CENTRALIZED SPEED BIKE RENTAL WHATSAPP UTILITY
 * Configured Business WhatsApp: 9440749649
 */

export const DEFAULT_BUSINESS_WHATSAPP = '9440749649';

export function normalizeWhatsAppDigits(raw = '') {
  return String(raw).replace(/\D/g, '');
}

/**
 * Validates if the phone number appears incomplete (e.g. fewer than 10 digits for Indian mobiles).
 */
export function isPotentiallyIncompletePhone(raw = '') {
  const digits = normalizeWhatsAppDigits(raw);
  return digits.length > 0 && digits.length < 10;
}

export function formatWhatsAppTarget(whatsappNumber) {
  const digits = normalizeWhatsAppDigits(whatsappNumber || DEFAULT_BUSINESS_WHATSAPP);
  if (!digits) return '';
  // If provided as 9 digits or 10 digits without country code, prefix 91 for Indian WhatsApp routing
  if (digits.length <= 10 && !digits.startsWith('91')) {
    return `91${digits}`;
  }
  return digits;
}

export function buildGeneralWhatsAppUrl(whatsappNumber, message = '') {
  const target = formatWhatsAppTarget(whatsappNumber);
  if (!target) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${target}${query}`;
}

export function buildBookingWhatsAppUrl(whatsappNumber, booking = {}) {
  const target = formatWhatsAppTarget(whatsappNumber);
  if (!target) return null;

  const lines = [
    `*NEW BIKE RENTAL BOOKING*`,
    ``,
    `*Customer Details:*`,
    `- Customer Name: ${booking.customerName || 'Customer'}`,
    `- Mobile Number: ${booking.phone || 'Not provided'}`,
    booking.email ? `- Email: ${booking.email}` : null,
    ``,
    `*Bike Details:*`,
    `- Bike Name: ${booking.bike?.name || 'Motorcycle'}`,
    booking.bike?.brand ? `- Bike Brand: ${booking.bike.brand}` : null,
    booking.bike?.category ? `- Category: ${booking.bike.category}` : null,
    booking.bike?.pricePerDay ? `- Daily Price: ₹${booking.bike.pricePerDay}/day` : null,
    ``,
    `*Rental Details:*`,
    booking.bookingReference ? `- Reference: ${booking.bookingReference}` : null,
    booking.pickupDate ? `- Start Date: ${booking.pickupDate}` : null,
    booking.rentalDays ? `- Duration: ${booking.rentalDays} day(s)` : null,
    booking.estimatedTotal ? `- Estimated Total: ₹${booking.estimatedTotal}` : null,
    `- Pickup Location: Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada`,
    ``,
    `*Driving Licence:*`,
    booking.licenceFileName
      ? `- File: ${booking.licenceFileName} (Customer will present original at pickup)`
      : `- Note: Customer will present original driving licence at vehicle pickup`,
    booking.additionalMessage ? `\n*Additional Notes:*\n${booking.additionalMessage}` : null,
    ``,
    `*Booking Status: NEW REQUEST*`,
  ].filter((line) => line !== null);

  return `https://wa.me/${target}?text=${encodeURIComponent(lines.join('\n'))}`;
}
