/**
 * CENTRALIZED SPEED BIKE RENTAL OFFICIAL 5-BIKE FLEET
 * Standardized data used consistently across Home, Bikes, BikeDetails, Booking and fallback states.
 *
 * 1. ACTIVA: Daily ₹399 (120 KM), Weekly ₹2,499 (749 KM)
 * 2. JUPITER: Daily ₹499 (120 KM), Weekly ₹3,150 (749 KM)
 * 3. PULSAR: Daily ₹599 (200 KM)
 * 4. FZ: Daily ₹699 (150 KM)
 * 5. GLAMOUR: Daily ₹399 (120 KM)
 */

export const OFFICIAL_5_BIKES = [
  {
    _id: 'bike-activa-6g',
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
    ],
    rentalTerms:
      'Valid driving license & original government photo ID required at pickup. Daily rate includes 120 KM; weekly plan includes 749 KM.',
    images: [
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Front View', view: 'Front' },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Left Side View', view: 'Left' },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Right Side View', view: 'Right' },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Rear View', view: 'Rear' },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Front Angle', view: 'Front Angle' },
      { url: '/demo/bike-activa.jpg', alt: 'Honda Activa 6G – Rear Angle', view: 'Rear Angle' },
    ],
    primaryImage: {
      url: '/demo/bike-activa.jpg',
      alt: 'Honda Activa 6G automatic scooter in silver',
    },
    availabilityStatus: 'available',
    isPublished: true,
  },
  {
    _id: 'bike-tvs-jupiter',
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
    ],
    rentalTerms:
      'Valid driving license & original government photo ID required at pickup. Daily rate includes 120 KM; weekly plan includes 749 KM.',
    images: [
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Front View', view: 'Front' },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Left Side View', view: 'Left' },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Right Side View', view: 'Right' },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Rear View', view: 'Rear' },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Front Angle', view: 'Front Angle' },
      { url: '/demo/bike-jupiter.jpg', alt: 'TVS Jupiter 110 – Rear Angle', view: 'Rear Angle' },
    ],
    primaryImage: {
      url: '/demo/bike-jupiter.jpg',
      alt: 'TVS Jupiter 110 scooter in royal blue',
    },
    availabilityStatus: 'available',
    isPublished: true,
  },
  {
    _id: 'bike-pulsar-150',
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
    ],
    rentalTerms:
      'Valid motorcycle driving license & government photo ID required at pickup. Daily rate includes 200 KM.',
    images: [
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Front View', view: 'Front' },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Left Side View', view: 'Left' },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Right Side View', view: 'Right' },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Rear View', view: 'Rear' },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Front Angle', view: 'Front Angle' },
      { url: '/demo/bike-pulsar.jpg', alt: 'Bajaj Pulsar 150 – Rear Angle', view: 'Rear Angle' },
    ],
    primaryImage: {
      url: '/demo/bike-pulsar.jpg',
      alt: 'Bajaj Pulsar 150 motorcycle in black and red',
    },
    availabilityStatus: 'available',
    isPublished: true,
  },
  {
    _id: 'bike-yamaha-fz',
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
    ],
    rentalTerms:
      'Valid motorcycle driving license & government photo ID required at pickup. Daily rate includes 150 KM.',
    images: [
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Front View', view: 'Front' },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Left Side View', view: 'Left' },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Right Side View', view: 'Right' },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Rear View', view: 'Rear' },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Front Angle', view: 'Front Angle' },
      { url: '/demo/bike-fz.jpg', alt: 'Yamaha FZ-S FI – Rear Angle', view: 'Rear Angle' },
    ],
    primaryImage: {
      url: '/demo/bike-fz.jpg',
      alt: 'Yamaha FZ-S FI naked street motorcycle in racing blue',
    },
    availabilityStatus: 'available',
    isPublished: true,
  },
  {
    _id: 'bike-hero-glamour',
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
    ],
    rentalTerms:
      'Valid motorcycle driving license & government photo ID required at pickup. Daily rate includes 120 KM.',
    images: [
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Front View', view: 'Front' },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Left Side View', view: 'Left' },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Right Side View', view: 'Right' },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Rear View', view: 'Rear' },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Front Angle', view: 'Front Angle' },
      { url: '/demo/bike-glamour.jpg', alt: 'Hero Glamour 125 – Rear Angle', view: 'Rear Angle' },
    ],
    primaryImage: {
      url: '/demo/bike-glamour.jpg',
      alt: 'Hero Glamour 125 commuter motorcycle in candy red and black',
    },
    availabilityStatus: 'available',
    isPublished: true,
  },
];
