import mongoose from 'mongoose';

const valueItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const legalSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
  },
  { _id: false }
);

const websiteSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
    },
    businessName: {
      type: String,
      default: 'SPEED BIKE RENTAL',
      trim: true,
    },
    currencyCode: {
      type: String,
      default: 'INR',
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: '₹',
      trim: true,
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    whatsappNumber: {
      type: String,
      default: '+91 94407 49649',
      trim: true,
    },
    phone: {
      type: String,
      default: '+91 94407 49649',
      trim: true,
    },
    email: {
      type: String,
      default: 'info@speedbikerental.com',
      trim: true,
    },
    address: {
      type: String,
      default:
        'Hotel SNR Twilight, Narravari St, Opp. Building, Gandhi Nagar, Vijayawada, Andhra Pradesh 520003, India',
      trim: true,
    },
    pickupLocations: {
      type: [String],
      default: [
        'Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada',
      ],
    },
    mapEmbedUrl: {
      type: String,
      default:
        'https://maps.google.com/maps?q=16.5173157,80.625143&t=&z=16&ie=UTF8&iwloc=&output=embed',
      trim: true,
    },
    mapLinkUrl: {
      type: String,
      default:
        'https://maps.app.goo.gl/DDHHmSEPxHrd5YCLA',
      trim: true,
    },
    operatingHours: {
      type: String,
      default: 'Mon–Sun: 7:00 AM – 10:00 PM',
      trim: true,
    },
    revenueRule: {
      type: String,
      enum: ['completed_only', 'completed_or_paid'],
      default: 'completed_only',
    },
    heroContent: {
      badge: { type: String, default: 'PREMIUM MOTORCYCLE RENTAL' },
      headline: { type: String, default: 'Ride More.' },
      headlineAccent: { type: String, default: 'Worry Less.' },
      subtitle: {
        type: String,
        default: 'Premium Bike Rentals for Trips, Daily Use & Adventures.',
      },
      imageUrl: { type: String, default: '/demo/hero-bike-cutout.png' },
      imagePublicId: { type: String, default: '' },
      featureBullets: {
        type: [String],
        default: [
          'Wide Range of Bikes',
          'Flexible Rental Plans',
          'Well Maintained & Insured',
          '24/7 Customer Support',
        ],
      },
      tickerItems: {
        type: [String],
        default: [
          'RIDE MORE',
          'EXPLORE MORE',
          'PREMIUM BIKES',
          'EASY BOOKINGS',
        ],
      },
    },
    aboutContent: {
      headline: { type: String, default: 'About Speed Bike Rental' },
      intro: {
        type: String,
        default:
          'Speed Bike Rental is built for riders who appreciate quality motorcycles, honest pricing, and straightforward service. Update this story in Admin → Website Content to reflect your shop history and team.',
      },
      mission: {
        type: String,
        default:
          'Provide riders with reliable, thoroughly inspected motorcycles and a transparent booking process from first browse to return.',
      },
      vision: {
        type: String,
        default:
          'Become the most trusted motorcycle rental partner for weekend riders, travelers, and daily commuters in our service area.',
      },
      maintenanceStandards: {
        type: String,
        default:
          'Every motorcycle undergoes pre-ride safety checks covering tires, brakes, chain tension, fluids, and lighting before handover. Update with your actual shop inspection checklist.',
      },
      supportSummary: {
        type: String,
        default:
          'Direct owner communication via WhatsApp and phone during configured operating hours to coordinate pickup, extensions, and rider assistance.',
      },
      values: {
        type: [valueItemSchema],
        default: [
          {
            title: 'Safety First',
            description: 'Routine workshop servicing and pre-handover safety inspections.',
          },
          {
            title: 'Clear Pricing',
            description: 'Straightforward daily rates calculated upfront with no guesswork.',
          },
          {
            title: 'Rider-Focused Support',
            description: 'Direct human assistance via WhatsApp before and during your rental.',
          },
          {
            title: 'Curated Fleet',
            description: 'Diverse motorcycle categories matched to city rides and highway trips.',
          },
        ],
      },
    },
    footerContent: {
      brandSummary: {
        type: String,
        default:
          'Premium motorcycle rentals with transparent daily pricing, inspected machines, and fast WhatsApp booking handoff.',
      },
      copyrightText: {
        type: String,
        default: 'Speed Bike Rental. All rights reserved.',
      },
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
      x: { type: String, default: '' },
    },
    legalContent: {
      termsDraftNotice: {
        type: String,
        default:
          'DRAFT POLICY NOTICE: This text is a structured draft template and not legal advice. The business owner must review and update every section in Admin → Website Content before live operations.',
      },
      termsSections: {
        type: [legalSectionSchema],
        default: [
          {
            heading: '1. Rental Eligibility & Required Documents',
            body: 'Riders must meet minimum age requirements and present a valid motorcycle driving license and government-issued photo identification at pickup. Owner must configure exact local age, license class, and document requirements.',
          },
          {
            heading: '2. Booking Requests & Confirmation',
            body: 'Submitting a booking form creates a pending request and does not guarantee vehicle reservation until explicitly confirmed by Speed Bike Rental. Payment methods and any required security deposit will be communicated upon confirmation.',
          },
          {
            heading: '3. Security Deposit & Payments',
            body: 'Configure your business rules for refundable security deposits, accepted payment methods, and timing of full rental payment.',
          },
          {
            heading: '4. Permitted Use',
            body: 'Motorcycles must be operated safely in compliance with local traffic laws. Racing, stunting, off-road misuse (unless permitted for an adventure model), sub-leasing, or riding under the influence are strictly prohibited.',
          },
          {
            heading: '5. Damage, Theft & Liability',
            body: 'Riders are responsible for inspecting the motorcycle at pickup and reporting any existing marks. Specify your policy for accidental damage, third-party insurance coverage, deductibles, and loss/theft responsibility.',
          },
          {
            heading: '6. Late Returns & Extensions',
            body: 'Extensions must be requested and approved prior to the scheduled return time. Specify your grace period and late-return fee structure.',
          },
          {
            heading: '7. Cancellations & Refunds',
            body: 'Configure your cancellation notice window, rescheduling options, and refund eligibility rules.',
          },
          {
            heading: '8. Modifications & General Terms',
            body: 'Speed Bike Rental reserves the right to update these terms. Updated terms apply to new bookings once published.',
          },
        ],
      },
      privacyDraftNotice: {
        type: String,
        default:
          'DRAFT PRIVACY NOTICE: This page is an editable draft template and does not constitute legal advice. Review and adapt it to your jurisdiction in Admin → Website Content.',
      },
      privacySections: {
        type: [legalSectionSchema],
        default: [
          {
            heading: '1. Information We Collect',
            body: 'When you submit a booking request or contact enquiry, we collect your name, phone number, email (if provided), residential address, and booking preferences so we can process your rental request.',
          },
          {
            heading: '2. How We Use Your Information',
            body: 'We use your contact and booking details solely to confirm motorcycle availability, prepare rental agreements, coordinate handover via WhatsApp or phone, and maintain business records.',
          },
          {
            heading: '3. WhatsApp Click-to-Chat Handoff',
            body: 'Choosing to continue via WhatsApp opens WhatsApp with a prefilled booking summary. Sending that message is initiated by you and subject to WhatsApp privacy policies.',
          },
          {
            heading: '4. Data Access & Security',
            body: 'Customer records are stored securely in our database and restricted to authorized Speed Bike Rental administrators.',
          },
          {
            heading: '5. Data Retention & Your Rights',
            body: 'Contact us using the official details on our Contact page to request access to, correction of, or deletion of your personal records where applicable by law.',
          },
        ],
      },
    },
  },
  { timestamps: true }
);

export const WebsiteSettings = mongoose.model('WebsiteSettings', websiteSettingsSchema);
