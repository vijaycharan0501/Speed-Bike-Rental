import { z } from 'zod';

const safeUrlOptional = z
  .string()
  .trim()
  .refine((v) => v === '' || v.startsWith('https://') || v.startsWith('http://') || v.startsWith('/'), {
    message: 'URL must start with https://, http://, or /',
  })
  .optional();

export const updateSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120).optional(),
  currencyCode: z.string().trim().min(1).max(10).optional(),
  currencySymbol: z.string().trim().min(1).max(6).optional(),
  logo: z
    .object({
      url: safeUrlOptional.default(''),
      publicId: z.string().trim().optional().default(''),
    })
    .optional(),
  whatsappNumber: z.string().trim().max(30).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email('Invalid business email').optional().or(z.literal('')),
  address: z.string().trim().max(500).optional(),
  pickupLocations: z.array(z.string().trim().min(1).max(150)).max(20).optional(),
  mapEmbedUrl: safeUrlOptional,
  mapLinkUrl: safeUrlOptional,
  operatingHours: z.string().trim().max(300).optional(),
  revenueRule: z.enum(['completed_only', 'completed_or_paid']).optional(),
  heroContent: z
    .object({
      badge: z.string().trim().max(100).optional(),
      headline: z.string().trim().max(120).optional(),
      headlineAccent: z.string().trim().max(120).optional(),
      subtitle: z.string().trim().max(600).optional(),
      imageUrl: safeUrlOptional,
      imagePublicId: z.string().trim().optional(),
      featureBullets: z.array(z.string().trim().min(1).max(140)).max(6).optional(),
      tickerItems: z.array(z.string().trim().min(1).max(80)).max(12).optional(),
    })
    .optional(),
  aboutContent: z
    .object({
      headline: z.string().trim().max(160).optional(),
      intro: z.string().trim().max(2500).optional(),
      mission: z.string().trim().max(1500).optional(),
      vision: z.string().trim().max(1500).optional(),
      maintenanceStandards: z.string().trim().max(2000).optional(),
      supportSummary: z.string().trim().max(1500).optional(),
      values: z
        .array(
          z.object({
            title: z.string().trim().min(1).max(100),
            description: z.string().trim().min(1).max(500),
          })
        )
        .max(10)
        .optional(),
    })
    .optional(),
  footerContent: z
    .object({
      brandSummary: z.string().trim().max(500).optional(),
      copyrightText: z.string().trim().max(200).optional(),
    })
    .optional(),
  socialLinks: z
    .object({
      instagram: safeUrlOptional,
      facebook: safeUrlOptional,
      youtube: safeUrlOptional,
      x: safeUrlOptional,
    })
    .optional(),
  legalContent: z
    .object({
      termsDraftNotice: z.string().trim().max(600).optional(),
      termsSections: z
        .array(
          z.object({
            heading: z.string().trim().min(1).max(160),
            body: z.string().trim().min(1).max(3000),
          })
        )
        .max(20)
        .optional(),
      privacyDraftNotice: z.string().trim().max(600).optional(),
      privacySections: z
        .array(
          z.object({
            heading: z.string().trim().min(1).max(160),
            body: z.string().trim().min(1).max(3000),
          })
        )
        .max(20)
        .optional(),
    })
    .optional(),
});
