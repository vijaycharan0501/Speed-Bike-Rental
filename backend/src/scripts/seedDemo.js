import { connectDB, disconnectDB } from '../config/db.js';
import { Bike } from '../models/Bike.js';
import { getOrCreateSettings } from '../services/settingsService.js';

/**
 * SPEED BIKE RENTAL OFFICIAL 5-BIKE FLEET
 * Standard verified Indian motorcycle collection with specified daily/weekly rates and included distances:
 * 1. ACTIVA: Daily ₹399 (120 KM), Weekly ₹2,499 (749 KM)
 * 2. JUPITER: Daily ₹499 (120 KM), Weekly ₹3,150 (749 KM)
 * 3. PULSAR: Daily ₹599 (200 KM)
 * 4. FZ: Daily ₹699 (150 KM)
 * 5. GLAMOUR: Daily ₹399 (120 KM)
 */
export const DEMO_BIKES = [
  {
    name: 'Honda Activa 6G',
    slug: 'activa',
    brand: 'Honda',
    category: 'Scooter',
    description:
      "India's most trusted and fuel-efficient family scooter. Smooth 109cc HET engine, comfortable telescopic suspension, external fuel lid, and combi-braking for effortless city commuting across Vijayawada.",
    pricePerDay: 399,
    dailyDistanceKm: 120,
    pricePerWeek: 2499,
    weeklyDistanceKm: 749,
    specifications: {
      engineCC: '109.5 cc',
      power: '7.79 PS @ 8000 rpm',
      mileage: '50 km/l',
      transmission: 'Automatic (CVT)',
      fuelType: 'Petrol',
      seats: '2 Seats',
    },
    features: [
      '120 KM Daily Included (749 KM Weekly)',
      'Combi Brake System (CBS)',
      'Telescopic Front Suspension',
      'External Fuel Fill',
      'Silent ACG Starter',
      'Helmet Storage Space',
    ],
    rentalTerms:
      'Valid driving license & original government photo ID required at pickup. Daily rate includes 120 KM; weekly plan includes 749 KM.',
    images: [
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Front View', view: 'Front', isDemo: false },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Left Side View', view: 'Left', isDemo: false },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Right Side View', view: 'Right', isDemo: false },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Rear View', view: 'Rear', isDemo: false },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Front Angle', view: 'Front Angle', isDemo: false },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Rear Angle', view: 'Rear Angle', isDemo: false },
    ],
    primaryImage: {
      url: '/demo/bike-activa.jpg',
      alt: 'Honda Activa 6G automatic scooter in silver',
      isDemo: false,
    },
    availabilityStatus: 'available',
    isPublished: true,
    isArchived: false,
    isDemo: false,
  },
  {
    name: 'TVS Jupiter 110',
    slug: 'jupiter',
    brand: 'TVS',
    category: 'Scooter',
    description:
      'Zyada ka fayda — exceptionally comfortable commuter scooter with plush seating, all-metal body panels, external fuel filling, superior ride comfort, and generous 120 KM daily allowance.',
    pricePerDay: 499,
    dailyDistanceKm: 120,
    pricePerWeek: 3150,
    weeklyDistanceKm: 749,
    specifications: {
      engineCC: '109.7 cc',
      power: '7.88 PS @ 7500 rpm',
      mileage: '52 km/l',
      transmission: 'Automatic (CVT)',
      fuelType: 'Petrol',
      seats: '2 Seats',
    },
    features: [
      '120 KM Daily Included (749 KM Weekly)',
      'Econometer Fuel Indicator',
      'Synchronized Braking Technology',
      'Large 21L Under-seat Storage',
      'All-Metal Sturdy Body',
      'Plush Dual-Tone Seat',
    ],
    rentalTerms:
      'Valid driving license & original government photo ID required at pickup. Daily rate includes 120 KM; weekly plan includes 749 KM.',
    images: [
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Front View', view: 'Front', isDemo: false },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Left Side View', view: 'Left', isDemo: false },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Right Side View', view: 'Right', isDemo: false },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Rear View', view: 'Rear', isDemo: false },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Front Angle', view: 'Front Angle', isDemo: false },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Rear Angle', view: 'Rear Angle', isDemo: false },
    ],
    primaryImage: {
      url: '/demo/bike-jupiter.jpg',
      alt: 'TVS Jupiter 110 scooter in royal blue',
      isDemo: false,
    },
    availabilityStatus: 'available',
    isPublished: true,
    isArchived: false,
    isDemo: false,
  },
  {
    name: 'Bajaj Pulsar 150',
    slug: 'pulsar',
    brand: 'Bajaj',
    category: 'Sports',
    description:
      'The definitive Indian sporty commuter. Aggressive wolf-eyed styling, punchy 150cc DTS-i twin-spark engine, front disc brake with ABS, and 200 KM generous daily distance limit for highway & city rides.',
    pricePerDay: 599,
    dailyDistanceKm: 200,
    pricePerWeek: null,
    weeklyDistanceKm: null,
    specifications: {
      engineCC: '149.5 cc',
      power: '14 PS @ 8500 rpm',
      mileage: '48 km/l',
      transmission: '5-Speed Manual',
      fuelType: 'Petrol',
      seats: '2 Seats',
    },
    features: [
      '200 KM Daily Included',
      'DTS-i Twin Spark Engine',
      'Front Disc Brake with ABS',
      'Sporty Clip-on Handlebars',
      'Twin Nitrox Shock Absorbers',
      'Tubeless Alloy Wheels',
    ],
    rentalTerms:
      'Valid motorcycle driving license & government photo ID required at pickup. Daily rate includes 200 KM.',
    images: [
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Front View', view: 'Front', isDemo: false },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Left Side View', view: 'Left', isDemo: false },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Right Side View', view: 'Right', isDemo: false },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Rear View', view: 'Rear', isDemo: false },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Front Angle', view: 'Front Angle', isDemo: false },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Rear Angle', view: 'Rear Angle', isDemo: false },
    ],
    primaryImage: {
      url: '/demo/bike-pulsar.jpg',
      alt: 'Bajaj Pulsar 150 motorcycle in black and red',
      isDemo: false,
    },
    availabilityStatus: 'available',
    isPublished: true,
    isArchived: false,
    isDemo: false,
  },
  {
    name: 'Yamaha FZ-S FI',
    slug: 'fz',
    brand: 'Yamaha',
    category: 'Sports',
    description:
      'Muscular street presence with legendary Japanese handling and precision. Fuel-injected Blue Core engine, wide 140mm radial rear tire, single-channel ABS, and 150 KM included daily distance.',
    pricePerDay: 699,
    dailyDistanceKm: 150,
    pricePerWeek: null,
    weeklyDistanceKm: null,
    specifications: {
      engineCC: '149 cc',
      power: '12.4 PS @ 7250 rpm',
      mileage: '45 km/l',
      transmission: '5-Speed Manual',
      fuelType: 'Petrol',
      seats: '2 Seats',
    },
    features: [
      '150 KM Daily Included',
      'Blue Core Fuel Injection',
      'Single-Channel Bosch ABS',
      '140mm Wide Radial Rear Tire',
      'Monocross Rear Suspension',
      'Negative LCD Instrument Cluster',
    ],
    rentalTerms:
      'Valid motorcycle driving license & government photo ID required at pickup. Daily rate includes 150 KM.',
    images: [
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Front View', view: 'Front', isDemo: false },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Left Side View', view: 'Left', isDemo: false },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Right Side View', view: 'Right', isDemo: false },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Rear View', view: 'Rear', isDemo: false },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Front Angle', view: 'Front Angle', isDemo: false },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Rear Angle', view: 'Rear Angle', isDemo: false },
    ],
    primaryImage: {
      url: '/demo/bike-fz.jpg',
      alt: 'Yamaha FZ-S FI naked street motorcycle in racing blue',
      isDemo: false,
    },
    availabilityStatus: 'available',
    isPublished: true,
    isArchived: false,
    isDemo: false,
  },
  {
    name: 'Hero Glamour 125',
    slug: 'glamour',
    brand: 'Hero',
    category: 'Sports',
    description:
      "Stylish, super-reliable 125cc commuter motorcycle featuring Hero's i3S smart idle stop-start technology, upright relaxed riding posture, and outstanding real-world mileage with 120 KM included daily.",
    pricePerDay: 399,
    dailyDistanceKm: 120,
    pricePerWeek: null,
    weeklyDistanceKm: null,
    specifications: {
      engineCC: '124.7 cc',
      power: '10.7 PS @ 7500 rpm',
      mileage: '55 km/l',
      transmission: '5-Speed Manual',
      fuelType: 'Petrol',
      seats: '2 Seats',
    },
    features: [
      '120 KM Daily Included',
      'i3S Smart Idle Stop-Start System',
      'Integrated Braking System (IBS)',
      'Digital-Analog Instrument Console',
      'Upright Relaxed Seating Posture',
      'High Ground Clearance',
    ],
    rentalTerms:
      'Valid motorcycle driving license & government photo ID required at pickup. Daily rate includes 120 KM.',
    images: [
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Front View', view: 'Front', isDemo: false },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Left Side View', view: 'Left', isDemo: false },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Right Side View', view: 'Right', isDemo: false },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Rear View', view: 'Rear', isDemo: false },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Front Angle', view: 'Front Angle', isDemo: false },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Rear Angle', view: 'Rear Angle', isDemo: false },
    ],
    primaryImage: {
      url: '/demo/bike-glamour.jpg',
      alt: 'Hero Glamour 125 commuter motorcycle in candy red and black',
      isDemo: false,
    },
    availabilityStatus: 'available',
    isPublished: true,
    isArchived: false,
    isDemo: false,
  },
];

export async function seedDemoData() {
  await getOrCreateSettings();

  // Clean old sample demo bikes if any were seeded previously
  await Bike.deleteMany({
    slug: {
      $in: [
        'apex-r600-supersport-demo',
        'striker-750-streetfighter-demo',
        'iron-road-900-cruiser-demo',
        'summit-800-adv-tourer-demo',
        'metro-gt-300-scooter-demo',
      ],
    },
  });

  let inserted = 0;
  for (const bikeData of DEMO_BIKES) {
    const existing = await Bike.findOne({ slug: bikeData.slug });
    if (!existing) {
      await Bike.create(bikeData);
      inserted += 1;
    } else {
      // Update with correct official pricing, mileage, and images
      await Bike.updateOne({ _id: existing._id }, { $set: bikeData });
      inserted += 1;
    }
  }

  return { inserted, totalDemoBikes: DEMO_BIKES.length };
}

// Allow direct CLI execution: `npm run seed:demo`
if (process.argv[1] && process.argv[1].endsWith('seedDemo.js')) {
  connectDB()
    .then(seedDemoData)
    .then(({ inserted, totalDemoBikes }) => {
      console.log(`[Seed] Official 5-bike fleet ensured: ${inserted} processed (${totalDemoBikes} total bikes).`);
      return disconnectDB();
    })
    .catch(async (err) => {
      console.error('[Seed Error]', err);
      await disconnectDB().catch(() => {});
      process.exit(1);
    });
}
