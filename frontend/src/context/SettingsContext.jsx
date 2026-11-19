import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { publicApi } from '../services/api';
import { subscribeToRealtimeEvent } from '../services/socket';

const DEFAULT_SETTINGS = {
  businessName: 'SPEED BIKE RENTAL',
  currencyCode: 'INR',
  currencySymbol: '₹',
  logo: { url: '', publicId: '' },
  whatsappNumber: '+91 94407 49649',
  phone: '+91 94407 49649',
  email: 'info@speedbikerental.com',
  address:
    'Hotel SNR Twilight, Narravari St, Opp. Building, Gandhi Nagar, Vijayawada, Andhra Pradesh 520003, India',
  pickupLocations: [
    'Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada',
  ],
  mapEmbedUrl:
    'https://maps.google.com/maps?q=16.5173157,80.625143&t=&z=16&ie=UTF8&iwloc=&output=embed',
  mapLinkUrl:
    'https://maps.app.goo.gl/DDHHmSEPxHrd5YCLA',
  operatingHours: 'Mon–Sun: 7:00 AM – 10:00 PM',
  heroContent: {
    badge: 'PREMIUM MOTORCYCLE RENTAL',
    headline: 'Ride More.',
    headlineAccent: 'Worry Less.',
    subtitle: 'Premium Bike Rentals for Trips, Daily Use & Adventures.',
    imageUrl: '/demo/hero-bike-cutout.png',
    featureBullets: [
      'Wide Range of Bikes',
      'Flexible Rental Plans',
      'Well Maintained & Insured',
      '24/7 Customer Support',
    ],
    tickerItems: [
      'RIDE MORE',
      'EXPLORE MORE',
      'PREMIUM BIKES',
      'EASY BOOKINGS',
      'WHATSAPP SUPPORT',
    ],
  },
  aboutContent: {
    headline: 'About Speed Bike Rental',
    intro: '',
    mission: '',
    vision: '',
    maintenanceStandards: '',
    supportSummary: '',
    values: [],
  },
  footerContent: {
    brandSummary:
      'Premium motorcycle rentals with transparent daily pricing, inspected machines, and fast WhatsApp booking handoff.',
    copyrightText: 'Speed Bike Rental. All rights reserved.',
  },
  socialLinks: { instagram: '', facebook: '', youtube: '', x: '' },
  legalContent: {
    termsDraftNotice: '',
    termsSections: [],
    privacyDraftNotice: '',
    privacySections: [],
  },
};

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  featuredReviews: [],
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await publicApi.getSettings();
      if (res.data?.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
      if (Array.isArray(res.data?.featuredReviews)) {
        setFeaturedReviews(res.data.featuredReviews);
      }
    } catch {
      // Keep graceful defaults if API is temporarily unreachable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();

    // Listen to real-time content / settings updates from admin
    const unsub = subscribeToRealtimeEvent('content:updated', (updatedSettings) => {
      if (updatedSettings) {
        setSettings((prev) => ({ ...prev, ...updatedSettings }));
      }
    });

    const unsubReconnected = subscribeToRealtimeEvent('realtime:reconnected', () => {
      refreshSettings();
    });

    return () => {
      unsub();
      unsubReconnected();
    };
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, featuredReviews, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
