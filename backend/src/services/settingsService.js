import { WebsiteSettings } from '../models/WebsiteSettings.js';

export async function getOrCreateSettings() {
  let settings = await WebsiteSettings.findOne({ singletonKey: 'default' });
  if (!settings) {
    settings = await WebsiteSettings.create({ singletonKey: 'default' });
  }
  return settings;
}

export async function updateWebsiteSettings(updates) {
  const settings = await getOrCreateSettings();

  const topLevelFields = [
    'businessName',
    'currencyCode',
    'currencySymbol',
    'whatsappNumber',
    'phone',
    'email',
    'address',
    'pickupLocations',
    'mapEmbedUrl',
    'mapLinkUrl',
    'operatingHours',
    'revenueRule',
  ];

  for (const field of topLevelFields) {
    if (updates[field] !== undefined) {
      settings[field] = updates[field];
    }
  }

  const nestedObjects = ['logo', 'heroContent', 'aboutContent', 'footerContent', 'socialLinks', 'legalContent'];
  for (const key of nestedObjects) {
    if (updates[key] && typeof updates[key] === 'object') {
      const current = settings[key]?.toObject ? settings[key].toObject() : settings[key] || {};
      settings[key] = { ...current, ...updates[key] };
      settings.markModified(key);
    }
  }

  await settings.save();
  return settings;
}
