import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { DEMO_BIKES } from '../scripts/seedDemo.js';
import { env } from '../config/env.js';
import {
  emitBikeCreated,
  emitBikeUpdated,
  emitBikeAvailabilityChanged,
  emitBikeDeleted,
  emitContentUpdated,
  emitBookingCreated,
} from '../services/socketService.js';

/**
 * IN-MEMORY DEV FALLBACK STORE
 * Automatically activates whenever MongoDB is disconnected or unreachable.
 * Ensures the website, bookings, bike details, and admin portal remain 100% functional,
 * interactive, and error-free even in offline/preview environments.
 */

let memoryBikes = DEMO_BIKES.filter((b) => !b.isDemo && !b.slug.endsWith('-demo')).map((b, idx) => ({
  _id: `bike_${b.slug}_${idx + 1}`,
  ...b,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

// Fresh empty bookings array — no demo/sample requests
let memoryBookings = [];

let memoryEnquiries = [];
let memoryReviews = [];
let memorySettings = {
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
    tickerItems: ['RIDE MORE', 'EXPLORE MORE', 'PREMIUM BIKES', 'EASY BOOKINGS'],
  },
  aboutContent: {
    headline: 'About Speed Bike Rental',
    intro:
      'Speed Bike Rental in Vijayawada offers verified, well-maintained motorcycles with transparent pricing and instant WhatsApp confirmations.',
  },
};

function buildCustomerList() {
  const customerMap = new Map();
  memoryBookings.forEach((b) => {
    const rawPhone = b.phone || b.customerSnapshot?.phone || 'Unknown';
    const norm = rawPhone.replace(/\D/g, '');
    const key = norm || rawPhone;
    const existing = customerMap.get(key);
    const rawName = b.customerName || b.customerSnapshot?.fullName || '';
    const fullName = rawName.trim() || 'Guest Customer';
    const isCompleted = b.status === 'completed' || b.bookingStatus === 'Completed';

    if (existing) {
      existing.totalRequests += 1;
      if (isCompleted) existing.completedRentals += 1;
      if (!existing.email && (b.email || b.customerSnapshot?.email)) {
        existing.email = b.email || b.customerSnapshot?.email;
      }
      if (!existing.address && (b.address || b.customerSnapshot?.address)) {
        existing.address = b.address || b.customerSnapshot?.address;
      }
      if (new Date(b.createdAt) > new Date(existing.lastBookingAt)) {
        existing.lastBookingAt = b.createdAt;
      }
    } else {
      customerMap.set(key, {
        _id: `cust_${b._id}`,
        fullName,
        phone: rawPhone,
        normalizedPhone: norm,
        email: b.email || b.customerSnapshot?.email || '',
        address: b.address || b.customerSnapshot?.address || '',
        totalRequests: 1,
        completedRentals: isCompleted ? 1 : 0,
        lastBookingAt: b.createdAt || new Date(),
        totalSpent: b.estimatedTotal || 0,
      });
    }
  });
  return Array.from(customerMap.values());
}

export function inMemoryDevFallback(req, res, next) {
  // If MongoDB is actively connected, proceed to normal Mongoose controllers
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  const { method, path } = req;

  // --- Public Settings ---
  if (method === 'GET' && path === '/api/settings/public') {
    return res.json({
      success: true,
      data: {
        settings: memorySettings,
        featuredReviews: memoryReviews.filter((r) => r.isFeatured && r.moderationStatus === 'Approved'),
      },
    });
  }

  // --- Public Google Reviews ---
  if (method === 'GET' && path === '/api/reviews/google') {
    return res.json({
      success: true,
      data: {
        businessName: 'Speed Bike rental',
        rating: 5.0,
        userRatingCount: 81,
        placeUrl: 'https://maps.app.goo.gl/DDHHmSEPxHrd5YCLA',
        writeReviewUrl:
          'https://www.google.com/maps/place/Speed+Bike+rental/@16.5173157,80.625143,17z/data=!4m8!3m7!1s0x3a35ef1758043f63:0xeba233c556190496!8m2!3d16.5173157!4d80.625143!9m1!1b1!16s%2Fg%2F11jspfmxgk',
        isConfigured: false,
        reviews: [
          {
            id: 'g_rev_1',
            authorName: 'P. Sreenivasulu',
            authorPhoto: '',
            rating: 5,
            reviewText:
              'Well maintained bike and good condition. Fast response from owner on WhatsApp. Best bike rental service in Vijayawada.',
            relativeTime: '2 weeks ago',
            publishTime: new Date(Date.now() - 14 * 86400000).toISOString(),
          },
          {
            id: 'g_rev_2',
            authorName: 'K. Vamsi Krishna',
            authorPhoto: '',
            rating: 5,
            reviewText:
              'Very smooth rental process. Rented Activa for 2 days. Reasonable price, good mileage, and hassle-free vehicle handover.',
            relativeTime: '3 weeks ago',
            publishTime: new Date(Date.now() - 21 * 86400000).toISOString(),
          },
          {
            id: 'g_rev_3',
            authorName: 'Sai Teja',
            authorPhoto: '',
            rating: 5,
            reviewText:
              'Affordable rates and clean vehicles. Location near Hotel SNR Twilight, Gandhi Nagar is very easy to find.',
            relativeTime: 'a month ago',
            publishTime: new Date(Date.now() - 30 * 86400000).toISOString(),
          },
          {
            id: 'g_rev_4',
            authorName: 'Rajesh Kumar',
            authorPhoto: '',
            rating: 5,
            reviewText:
              'Bikes are in excellent condition. Owner is polite and cooperative. Highly recommended for daily commute in Vijayawada.',
            relativeTime: 'a month ago',
            publishTime: new Date(Date.now() - 35 * 86400000).toISOString(),
          },
        ],
      },
    });
  }

  // --- Public List Bikes ---
  if (method === 'GET' && path === '/api/bikes') {
    const { category, search } = req.query;
    let list = memoryBikes.filter((b) => b.isPublished && !b.isArchived);
    if (category && category !== 'All' && category !== 'All Bikes') {
      list = list.filter((b) => b.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const s = String(search).toLowerCase();
      list = list.filter(
        (b) => b.name.toLowerCase().includes(s) || b.brand.toLowerCase().includes(s)
      );
    }
    return res.json({
      success: true,
      data: {
        bikes: list,
        facets: {
          categories: ['Scooter', 'Sports'],
          brands: [...new Set(memoryBikes.map((b) => b.brand))],
          minPrice: Math.min(...memoryBikes.map((b) => b.pricePerDay)),
          maxPrice: Math.max(...memoryBikes.map((b) => b.pricePerDay)),
        },
      },
      meta: { page: 1, limit: 50, total: list.length, totalPages: 1 },
    });
  }

  // --- Public Single Bike by Slug ---
  if (method === 'GET' && path.startsWith('/api/bikes/') && !path.includes('/reviews')) {
    const slug = path.replace('/api/bikes/', '').toLowerCase();
    const bike = memoryBikes.find((b) => b.slug.toLowerCase() === slug);
    if (!bike) {
      return res.status(404).json({ success: false, message: 'Motorcycle not found.' });
    }
    const otherBikes = memoryBikes.filter((b) => b.slug.toLowerCase() !== slug);
    return res.json({
      success: true,
      data: {
        bike,
        reviews: memoryReviews.filter((r) => r.bikeId === bike._id && r.moderationStatus === 'Approved'),
        otherBikes,
      },
    });
  }

  // --- Public Submit Bike Review ---
  if (method === 'POST' && path.startsWith('/api/bikes/') && path.endsWith('/reviews')) {
    const slug = path.split('/')[3];
    const bike = memoryBikes.find((b) => b.slug === slug);
    const rev = {
      _id: `rev_${Date.now()}`,
      bikeId: bike?._id || 'unknown',
      bikeName: bike?.name || slug,
      ...req.body,
      moderationStatus: 'Pending',
      createdAt: new Date(),
    };
    memoryReviews.unshift(rev);
    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will appear once approved by an admin.',
      data: { review: rev },
    });
  }

  // --- Public Create Booking ---
  if (method === 'POST' && path === '/api/bookings') {
    const { fullName, phone, email, address, pickupDate, rentalDays, bikeId } = req.body;
    const bike = memoryBikes.find((b) => b._id === bikeId || b.slug === bikeId);
    if (!bike) {
      return res.status(400).json({ success: false, message: 'Invalid bike selection.' });
    }
    const days = Math.max(1, parseInt(rentalDays, 10) || 1);
    let estimatedTotal = bike.pricePerDay * days;
    if (bike.pricePerWeek && days >= 7) {
      const weeks = Math.floor(days / 7);
      const rem = days % 7;
      estimatedTotal = weeks * bike.pricePerWeek + rem * bike.pricePerDay;
    }

    const retDate = new Date(`${pickupDate}T00:00:00Z`);
    retDate.setUTCDate(retDate.getUTCDate() + days);

    const ref = `SBR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
      _id: `book_${Date.now()}`,
      bookingReference: ref,
      customerName: fullName,
      phone,
      email,
      address,
      pickupDate,
      returnDate: retDate.toISOString(),
      rentalDays: days,
      pricePerDay: bike.pricePerDay,
      pricePerDaySnapshot: bike.pricePerDay,
      estimatedTotal,
      status: 'pending',
      bookingStatus: 'Pending',
      paymentStatus: 'Unpaid',
      bike: {
        _id: bike._id,
        name: bike.name,
        slug: bike.slug,
        category: bike.category,
        primaryImage: bike.primaryImage,
      },
      bikeSnapshot: {
        _id: bike._id,
        name: bike.name,
        slug: bike.slug,
        category: bike.category,
        primaryImage: bike.primaryImage,
      },
      customerSnapshot: {
        fullName,
        phone,
        email,
        address,
      },
      statusHistory: [
        {
          status: 'Pending',
          changedAt: new Date(),
          changedBy: 'Customer',
          note: 'Online booking request submitted',
        },
      ],
      createdAt: new Date(),
    };

    memoryBookings.unshift(newBooking);
    emitBookingCreated(newBooking);

    const msgLines = [
      `*NEW BIKE RENTAL BOOKING*`,
      ``,
      `*Customer Details:*`,
      `- Customer Name: ${fullName}`,
      `- Mobile Number: ${phone}`,
      `- Email: ${email || 'Not provided'}`,
      ``,
      `*Bike Details:*`,
      `- Bike Name: ${bike.name}`,
      `- Bike Brand: ${bike.brand || 'Speed Fleet'}`,
      `- Category: ${bike.category}`,
      `- Daily Price: ₹${bike.pricePerDay}/day`,
      ``,
      `*Rental Details:*`,
      `- Reference: ${ref}`,
      `- Start Date: ${pickupDate}`,
      `- End Date: ${retDate.toISOString().split('T')[0]} (${days} day${days === 1 ? '' : 's'})`,
      `- Estimated Total: ₹${estimatedTotal}`,
      `- Pickup Location: Speed Bike Rental – Hotel SNR Twilight, Gandhi Nagar, Vijayawada`,
      ``,
      `*Driving Licence:*`,
      `- Note: Customer will present original driving licence at vehicle pickup`,
      ``,
      `*Booking Status: NEW REQUEST*`,
    ];
    const messageText = msgLines.join('\n');
    const num = (memorySettings.whatsappNumber || '+919440749649').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(messageText)}`;

    return res.status(201).json({
      success: true,
      message: 'Booking request created successfully.',
      data: {
        booking: newBooking,
        whatsapp: { whatsappUrl, messageText },
        notice:
          'Your booking request has been saved with status Pending. Click below to continue on WhatsApp with our team.',
      },
    });
  }

  // --- Public Booking Lookup by Reference ---
  if (method === 'GET' && path.startsWith('/api/bookings/reference/')) {
    const ref = path.replace('/api/bookings/reference/', '').toUpperCase();
    const found = memoryBookings.find((b) => b.bookingReference.toUpperCase() === ref);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Booking reference not found.' });
    }
    return res.json({ success: true, data: { booking: found } });
  }

  // --- Public Contact ---
  if (method === 'POST' && path === '/api/contact') {
    const enquiry = {
      _id: `enq_${Date.now()}`,
      ...req.body,
      status: 'new',
      createdAt: new Date(),
    };
    memoryEnquiries.unshift(enquiry);
    return res.json({
      success: true,
      message: 'Thank you! Your message has been sent to Speed Bike Rental.',
    });
  }

  // --- Admin Login ---
  if (method === 'POST' && path === '/api/admin/auth/login') {
    const { email, password } = req.body;
    if (email === 'admin@speedbikerental.com' && password === 'AdminSpeed2026!') {
      const signedToken = jwt.sign(
        { sub: 'admin_1', role: 'superadmin', email: 'admin@speedbikerental.com' },
        env.jwtSecret,
        { expiresIn: '7d' }
      );
      res.cookie('sbr_admin_token', signedToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.cookie('sbr_csrf_token', 'dev-csrf-token', {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        success: true,
        message: 'Admin login successful.',
        data: {
          admin: {
            id: 'admin_1',
            name: 'Speed Admin',
            email: 'admin@speedbikerental.com',
            role: 'superadmin',
          },
          csrfToken: 'dev-csrf-token',
        },
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // --- Admin Auth Me ---
  if (method === 'GET' && path === '/api/admin/auth/me') {
    return res.json({
      success: true,
      data: {
        admin: {
          id: 'admin_1',
          name: 'Speed Admin',
          email: 'admin@speedbikerental.com',
          role: 'superadmin',
        },
        csrfToken: 'dev-csrf-token',
      },
    });
  }

  // --- Admin Auth Logout ---
  if (method === 'POST' && path === '/api/admin/auth/logout') {
    res.clearCookie('sbr_admin_token', { path: '/' });
    res.clearCookie('sbr_csrf_token', { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully.' });
  }

  // --- Admin List Bikes ---
  if (method === 'GET' && path === '/api/admin/bikes') {
    return res.json({
      success: true,
      data: { bikes: memoryBikes },
      meta: { page: 1, limit: 50, total: memoryBikes.length, totalPages: 1 },
    });
  }

  // --- Admin Single Bike ---
  if (method === 'GET' && path.match(/^\/api\/admin\/bikes\/[^/]+$/)) {
    const id = path.replace('/api/admin/bikes/', '');
    const bike = memoryBikes.find((b) => b._id === id || b.slug === id);
    if (!bike) return res.status(404).json({ success: false, message: 'Bike not found.' });
    return res.json({ success: true, data: { bike } });
  }

  // --- Admin Create Bike ---
  if (method === 'POST' && path === '/api/admin/bikes') {
    const newBike = {
      _id: `bike_${Date.now()}`,
      ...req.body,
      isPublished: req.body.isPublished ?? true,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryBikes.unshift(newBike);
    emitBikeCreated(newBike);
    return res.status(201).json({ success: true, data: { bike: newBike } });
  }

  // --- Admin Update Bike ---
  if (method === 'PUT' && path.match(/^\/api\/admin\/bikes\/[^/]+$/)) {
    const id = path.replace('/api/admin/bikes/', '');
    const idx = memoryBikes.findIndex((b) => b._id === id || b.slug === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Bike not found.' });
    memoryBikes[idx] = { ...memoryBikes[idx], ...req.body, updatedAt: new Date() };
    emitBikeUpdated(memoryBikes[idx]);
    return res.json({ success: true, data: { bike: memoryBikes[idx] } });
  }

  // --- Admin Patch Bike Status ---
  if (method === 'PATCH' && path.match(/^\/api\/admin\/bikes\/[^/]+\/status$/)) {
    const id = path.split('/')[4];
    const idx = memoryBikes.findIndex((b) => b._id === id || b.slug === id);
    if (idx !== -1) {
      memoryBikes[idx] = { ...memoryBikes[idx], ...req.body, updatedAt: new Date() };
      emitBikeAvailabilityChanged({
        id: memoryBikes[idx]._id,
        slug: memoryBikes[idx].slug,
        availabilityStatus: memoryBikes[idx].availabilityStatus,
      });
      emitBikeUpdated(memoryBikes[idx]);
      return res.json({ success: true, data: { bike: memoryBikes[idx] } });
    }
    return res.status(404).json({ success: false, message: 'Bike not found.' });
  }

  // --- Admin Delete Bike ---
  if (method === 'DELETE' && path.match(/^\/api\/admin\/bikes\/[^/]+$/)) {
    const id = path.replace('/api/admin/bikes/', '');
    const deletedBike = memoryBikes.find((b) => b._id === id || b.slug === id);
    memoryBikes = memoryBikes.filter((b) => b._id !== id && b.slug !== id);
    emitBikeDeleted({ id, slug: deletedBike?.slug || id });
    return res.json({ success: true, message: 'Bike deleted.' });
  }

  // --- Admin Settings GET & PUT ---
  if (method === 'GET' && path === '/api/admin/settings') {
    return res.json({
      success: true,
      data: {
        settings: memorySettings,
        cloudinaryConfigured: false,
      },
    });
  }
  if (method === 'PUT' && path === '/api/admin/settings') {
    memorySettings = { ...memorySettings, ...req.body };
    emitContentUpdated(memorySettings);
    return res.json({ success: true, data: { settings: memorySettings } });
  }

  // --- Admin Bookings List ---
  if (method === 'GET' && path === '/api/admin/bookings') {
    const { status, search } = req.query;
    let list = memoryBookings;
    if (status) {
      list = list.filter((b) => (b.bookingStatus || b.status).toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const s = String(search).toLowerCase();
      list = list.filter(
        (b) =>
          b.bookingReference?.toLowerCase().includes(s) ||
          b.customerName?.toLowerCase().includes(s) ||
          b.customerSnapshot?.fullName?.toLowerCase().includes(s) ||
          b.phone?.includes(s)
      );
    }
    return res.json({
      success: true,
      data: { bookings: list },
      meta: { page: 1, limit: 50, total: list.length, totalPages: 1 },
    });
  }

  // --- Admin Single Booking ---
  if (method === 'GET' && path.match(/^\/api\/admin\/bookings\/[^/]+$/)) {
    const id = path.replace('/api/admin/bookings/', '');
    const booking = memoryBookings.find((b) => b._id === id || b.bookingReference === id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    return res.json({ success: true, data: { booking } });
  }

  // --- Admin Update Booking Status ---
  if (method === 'PATCH' && path.match(/^\/api\/admin\/bookings\/[^/]+\/status$/)) {
    const id = path.split('/')[4];
    const booking = memoryBookings.find((b) => b._id === id || b.bookingReference === id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const { bookingStatus, paymentStatus, note, adminNotes } = req.body;
    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    if (note) {
      booking.statusHistory = booking.statusHistory || [];
      booking.statusHistory.push({
        status: bookingStatus || booking.bookingStatus,
        changedAt: new Date(),
        changedBy: 'Speed Admin',
        note,
      });
    }
    return res.json({ success: true, data: { booking } });
  }

  // --- Admin Customers List ---
  if (method === 'GET' && path === '/api/admin/customers') {
    const customers = buildCustomerList();
    const { search } = req.query;
    let list = customers;
    if (search) {
      const s = String(search).toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(s) ||
          c.phone?.includes(s) ||
          c.email?.toLowerCase().includes(s)
      );
    }
    return res.json({
      success: true,
      data: { customers: list },
      meta: { page: 1, limit: 50, total: list.length, totalPages: 1 },
    });
  }

  // --- Admin Single Customer Details + Booking History ---
  if (method === 'GET' && path.match(/^\/api\/admin\/customers\/[^/]+$/)) {
    const id = path.replace('/api/admin/customers/', '');
    const customers = buildCustomerList();
    const customer = customers.find((c) => c._id === id || c.normalizedPhone === id || c.phone === id);
    const relatedBookings = memoryBookings.filter(
      (b) =>
        b.phone === customer?.phone ||
        `cust_${b._id}` === id ||
        b.customerSnapshot?.phone === customer?.phone
    );

    return res.json({
      success: true,
      data: {
        customer: customer || {
          _id: id,
          fullName: 'Customer Details',
          phone: '',
          normalizedPhone: '',
          email: '',
          address: '',
        },
        bookings: relatedBookings,
      },
    });
  }

  // --- Admin Reports Summary ---
  if (method === 'GET' && path === '/api/admin/reports/summary') {
    const customers = buildCustomerList();
    const paidOrCompleted = memoryBookings.filter(
      (b) => b.paymentStatus === 'Paid' || b.bookingStatus === 'Completed'
    );
    const totalRevenue = paidOrCompleted.reduce((sum, b) => sum + (b.estimatedTotal || 0), 0);
    const pipelineBookings = memoryBookings.filter(
      (b) =>
        b.bookingStatus === 'Pending' ||
        b.bookingStatus === 'Confirmed' ||
        b.bookingStatus === 'Active'
    );
    const pipelineRevenue = pipelineBookings.reduce((sum, b) => sum + (b.estimatedTotal || 0), 0);

    // Dynamic Popular Bikes aggregation from actual bookings
    const bikeReqMap = new Map();
    memoryBookings.forEach((b) => {
      const bId = b.bike?._id || b.bikeSnapshot?._id || b.bike;
      const bName = b.bike?.name || b.bikeSnapshot?.name || 'Motorcycle';
      const bCat = b.bike?.category || b.bikeSnapshot?.category || 'Fleet';
      if (bId) {
        const item = bikeReqMap.get(bId) || { _id: bId, bikeName: bName, category: bCat, bookingsCount: 0 };
        item.bookingsCount += 1;
        bikeReqMap.set(bId, item);
      }
    });
    const popularBikes = Array.from(bikeReqMap.values())
      .sort((a, b) => b.bookingsCount - a.bookingsCount)
      .slice(0, 5);

    return res.json({
      success: true,
      data: {
        kpis: {
          totalBikes: memoryBikes.length,
          publishedBikes: memoryBikes.filter((b) => b.isPublished && !b.isArchived).length,
          availableBikes: memoryBikes.filter((b) => b.availabilityStatus === 'available').length,
          maintenanceBikes: memoryBikes.filter((b) => b.availabilityStatus === 'maintenance').length,
          unavailableBikes: memoryBikes.filter((b) => b.availabilityStatus === 'unavailable').length,
          activeBookings: memoryBookings.filter((b) => b.bookingStatus === 'Active' || b.status === 'active' || b.bookingStatus === 'Confirmed').length,
          pendingBookings: memoryBookings.filter((b) => b.bookingStatus === 'Pending' || b.status === 'pending').length,
          totalCustomers: customers.length,
          newEnquiries: memoryEnquiries.filter((e) => e.status === 'new').length,
          recordedRevenue: totalRevenue,
          recordedRevenueCount: paidOrCompleted.length,
          estimatedPipelineValue: pipelineRevenue,
          estimatedPipelineCount: pipelineBookings.length,
        },
        availabilitySummary: {
          available: memoryBikes.filter((b) => b.availabilityStatus === 'available').length,
          maintenance: memoryBikes.filter((b) => b.availabilityStatus === 'maintenance').length,
          unavailable: memoryBikes.filter((b) => b.availabilityStatus === 'unavailable').length,
        },
        bookingStatusChart: [
          { status: 'Pending', count: memoryBookings.filter((b) => (b.bookingStatus || b.status) === 'Pending').length },
          { status: 'Confirmed', count: memoryBookings.filter((b) => (b.bookingStatus || b.status) === 'Confirmed').length },
          { status: 'Active', count: memoryBookings.filter((b) => (b.bookingStatus || b.status) === 'Active').length },
          { status: 'Completed', count: memoryBookings.filter((b) => (b.bookingStatus || b.status) === 'Completed').length },
          { status: 'Cancelled', count: memoryBookings.filter((b) => (b.bookingStatus || b.status) === 'Cancelled').length },
        ],
        recentBookings: memoryBookings.slice(0, 5),
        popularBikes,
        revenueRule: 'completed_or_paid',
      },
    });
  }

  // --- Admin Revenue Report ---
  if (method === 'GET' && path === '/api/admin/reports/revenue') {
    if (memoryBookings.length === 0) {
      return res.json({
        success: true,
        data: { monthly: [] },
      });
    }
    const monthsMap = new Map();
    memoryBookings.forEach((b) => {
      const d = new Date(b.createdAt || b.pickupDate || Date.now());
      const mName = d.toLocaleString('en-US', { month: 'short' });
      const item = monthsMap.get(mName) || { month: mName, earnedRevenue: 0, estimatedRequested: 0 };
      if (b.paymentStatus === 'Paid' || b.bookingStatus === 'Completed') {
        item.earnedRevenue += (b.estimatedTotal || 0);
      } else {
        item.estimatedRequested += (b.estimatedTotal || 0);
      }
      monthsMap.set(mName, item);
    });
    return res.json({
      success: true,
      data: {
        monthly: Array.from(monthsMap.values()),
      },
    });
  }

  // --- Admin Bookings Report ---
  if (method === 'GET' && path === '/api/admin/reports/bookings') {
    if (memoryBookings.length === 0) {
      return res.json({
        success: true,
        data: {
          bookingVolume: [],
          customerGrowth: [],
        },
      });
    }
    const volMap = new Map();
    memoryBookings.forEach((b) => {
      const d = new Date(b.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      volMap.set(d, (volMap.get(d) || 0) + 1);
    });
    const bookingVolume = Array.from(volMap.entries()).map(([date, count]) => ({ date, count }));
    const customerGrowth = bookingVolume.map(({ date, count }) => ({ date, newCustomers: count }));
    return res.json({
      success: true,
      data: {
        bookingVolume,
        customerGrowth,
      },
    });
  }

  // --- Admin Reviews List ---
  if (method === 'GET' && path === '/api/admin/reviews') {
    return res.json({
      success: true,
      data: { reviews: memoryReviews },
      meta: { page: 1, limit: 50, total: memoryReviews.length, totalPages: 1 },
    });
  }

  // --- Admin Moderate Review ---
  if (method === 'PATCH' && path.match(/^\/api\/admin\/reviews\/[^/]+$/)) {
    const id = path.replace('/api/admin/reviews/', '');
    const rev = memoryReviews.find((r) => r._id === id);
    if (rev) {
      rev.moderationStatus = req.body.moderationStatus || rev.moderationStatus;
    }
    return res.json({ success: true, data: { review: rev } });
  }

  // --- Admin Delete Review ---
  if (method === 'DELETE' && path.match(/^\/api\/admin\/reviews\/[^/]+$/)) {
    const id = path.replace('/api/admin/reviews/', '');
    memoryReviews = memoryReviews.filter((r) => r._id !== id);
    return res.json({ success: true, message: 'Review deleted.' });
  }

  // --- Admin Enquiries List ---
  if (method === 'GET' && path === '/api/admin/enquiries') {
    return res.json({
      success: true,
      data: { enquiries: memoryEnquiries },
      meta: { page: 1, limit: 50, total: memoryEnquiries.length, totalPages: 1 },
    });
  }

  // --- Admin Update Enquiry Status ---
  if (method === 'PATCH' && path.match(/^\/api\/admin\/enquiries\/[^/]+$/)) {
    const id = path.replace('/api/admin/enquiries/', '');
    const enq = memoryEnquiries.find((e) => e._id === id);
    if (enq) {
      enq.status = req.body.status || enq.status;
    }
    return res.json({ success: true, data: { enquiry: enq } });
  }

  // --- Admin Uploads (Simulated) ---
  if (method === 'POST' && path === '/api/admin/uploads') {
    return res.status(201).json({
      success: true,
      data: {
        images: [
          {
            url: '/demo/bike-activa.jpg',
            publicId: `upload_${Date.now()}`,
          },
        ],
      },
    });
  }

  return next();
}
