import { normalizePhone } from './phone.js';

export function formatDateISO(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function buildBookingWhatsAppPayload({
  whatsappNumber,
  currencySymbol = '₹',
  bookingReference,
  customerName,
  phone,
  email,
  address,
  bikeName,
  bikeBrand,
  category,
  pickupDate,
  returnDate,
  rentalDays,
  pricePerDay,
  estimatedTotal,
  licenceFileName,
  additionalMessage,
}) {
  const digits = normalizePhone(whatsappNumber || '');
  const formattedPickup = formatDateISO(pickupDate);
  const formattedReturn = returnDate ? formatDateISO(returnDate) : '';

  const lines = [
    `*NEW BIKE RENTAL BOOKING*`,
    ``,
    `*Customer Details:*`,
    `- Customer Name: ${customerName}`,
    `- Mobile Number: ${phone}`,
    email ? `- Email: ${email}` : null,
    address ? `- Address: ${address}` : null,
    ``,
    `*Bike Details:*`,
    `- Bike Name: ${bikeName}`,
    bikeBrand ? `- Bike Brand: ${bikeBrand}` : null,
    category ? `- Category: ${category}` : null,
    `- Daily Price: ${currencySymbol}${Number(pricePerDay).toLocaleString('en-IN')}/day`,
    ``,
    `*Rental Details:*`,
    `- Reference: ${bookingReference}`,
    `- Start Date: ${formattedPickup}`,
    formattedReturn
      ? `- End Date: ${formattedReturn} (${rentalDays} day${rentalDays === 1 ? '' : 's'})`
      : `- Duration: ${rentalDays} day${rentalDays === 1 ? '' : 's'}`,
    `- Estimated Total: ${currencySymbol}${Number(estimatedTotal).toLocaleString('en-IN')}`,
    `- Pickup Location: Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada`,
    ``,
    `*Driving Licence:*`,
    licenceFileName
      ? `- File: ${licenceFileName} (Customer will present original at pickup)`
      : `- Note: Customer will present original driving licence at vehicle pickup`,
    additionalMessage ? `\n*Additional Notes:*\n${additionalMessage}` : null,
    ``,
    `*Booking Status: NEW REQUEST*`,
  ].filter((l) => l !== null);

  const messageText = lines.join('\n');
  const url = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(messageText)}`
    : null;

  return {
    configured: Boolean(digits),
    whatsappUrl: url,
    messageText,
  };
}
