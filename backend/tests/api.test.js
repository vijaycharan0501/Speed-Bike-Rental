import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import request from 'supertest';

// Enable in-memory MongoDB strictly for automated test execution
process.env.USE_MEMORY_DB = 'true';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret-key-at-least-32-chars';

const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { createApp } = await import('../src/app.js');
const { Admin } = await import('../src/models/Admin.js');
const { Bike } = await import('../src/models/Bike.js');
const { seedDemoData } = await import('../src/scripts/seedDemo.js');

const app = createApp();
let adminAgent;
let csrfToken = '';
let sampleBike;

function extractCookie(setCookies = [], name) {
  for (const cookie of setCookies) {
    if (cookie.startsWith(`${name}=`)) {
      return cookie.split(';')[0].split('=')[1];
    }
  }
  return '';
}

function futureDateISO(daysFromNow = 5) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

describe('Speed Bike Rental Full-Stack API & Security Tests', () => {
  before(async () => {
    await connectDB();
    await seedDemoData();

    // Create a test admin (not hardcoded in app code)
    const hash = await bcrypt.hash('TestAdminPass#2026', 10);
    await Admin.create({
      name: 'QA Admin',
      email: 'qa-admin@example.test',
      passwordHash: hash,
      role: 'superadmin',
      isActive: true,
    });

    // Also add an unpublished draft bike to verify public isolation
    await Bike.create({
      name: 'Secret Draft Bike',
      slug: 'secret-draft-bike',
      brand: 'DraftCo',
      category: 'Sports',
      description: 'Should never appear in public catalogue when unpublished.',
      pricePerDay: 120,
      isPublished: false,
      availabilityStatus: 'available',
    });

    sampleBike = await Bike.findOne({ slug: 'apex-r600-supersport-demo' }).lean();
    adminAgent = request.agent(app);
  });

  after(async () => {
    await disconnectDB();
  });

  it('GET /api/bikes returns only published bikes with filters & pagination', async () => {
    const res = await request(app).get('/api/bikes?category=Sports&sort=price_asc');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.bikes.length >= 1);
    assert.ok(res.body.data.bikes.every((b) => b.isPublished === true));
    assert.ok(!res.body.data.bikes.some((b) => b.slug === 'secret-draft-bike'));
  });

  it('GET /api/bikes/:slug returns details and excludes current bike from otherBikes', async () => {
    const res = await request(app).get(`/api/bikes/${sampleBike.slug}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.bike.slug, sampleBike.slug);
    assert.ok(res.body.data.otherBikes.length > 0);
    assert.ok(!res.body.data.otherBikes.some((b) => b.slug === sampleBike.slug));

    const draftRes = await request(app).get('/api/bikes/secret-draft-bike');
    assert.equal(draftRes.status, 404);
  });

  it('blocks unauthenticated access to all /api/admin endpoints', async () => {
    const endpoints = [
      '/api/admin/bikes',
      '/api/admin/bookings',
      '/api/admin/customers',
      '/api/admin/reviews',
      '/api/admin/reports/summary',
      '/api/admin/settings',
    ];
    for (const ep of endpoints) {
      const res = await request(app).get(ep);
      assert.equal(res.status, 401, `Expected 401 on ${ep}`);
    }
  });

  it('logs in admin using HttpOnly cookie and enforces CSRF on mutations', async () => {
    const loginRes = await adminAgent
      .post('/api/admin/auth/login')
      .send({ email: 'qa-admin@example.test', password: 'TestAdminPass#2026' });

    assert.equal(loginRes.status, 200);
    const setCookies = loginRes.headers['set-cookie'] || [];
    const authCookie = setCookies.find((c) => c.startsWith('sbr_admin_token='));
    assert.ok(authCookie, 'Auth cookie must be set');
    assert.ok(authCookie.includes('HttpOnly'), 'Auth cookie must be HttpOnly');
    csrfToken = extractCookie(setCookies, 'sbr_csrf_token');
    assert.ok(csrfToken, 'CSRF cookie must be set');

    // Mutation without CSRF header must be blocked with 403
    const noCsrfRes = await adminAgent
      .put('/api/admin/settings')
      .send({ whatsappNumber: '+15550192834' });
    assert.equal(noCsrfRes.status, 403);

    // Mutation with CSRF header succeeds & reflects on public settings
    const okRes = await adminAgent
      .put('/api/admin/settings')
      .set('X-CSRF-Token', csrfToken)
      .send({ whatsappNumber: '+1 555 019 2834', phone: '+1 555 019 2834' });
    assert.equal(okRes.status, 200);

    const pubSettings = await request(app).get('/api/settings/public');
    assert.equal(pubSettings.body.data.settings.whatsappNumber, '+1 555 019 2834');
  });

  it('validates bookings, ignores client price tampering, persists Pending booking, and builds WhatsApp URL', async () => {
    // Reject past date
    const pastRes = await request(app).post('/api/bookings').send({
      fullName: 'Alex Rider',
      phone: '+1 555 222 3333',
      address: '123 Track Lane, Motor City',
      pickupDate: '2020-01-01',
      rentalDays: 3,
      bikeId: sampleBike._id.toString(),
    });
    assert.equal(pastRes.status, 400);

    // Valid booking with client-side tampered price/total (must be ignored by server!)
    const pickup = futureDateISO(10);
    const res = await request(app).post('/api/bookings').send({
      fullName: 'Alex Rider',
      phone: '+1 555 222 3333',
      address: '123 Track Lane, Motor City',
      pickupDate: pickup,
      rentalDays: 3,
      bikeId: sampleBike._id.toString(),
      pricePerDay: 1,
      estimatedTotal: 3,
    });

    assert.equal(res.status, 201);
    const { booking, whatsapp } = res.body.data;
    assert.equal(booking.bookingStatus, 'Pending');
    assert.equal(booking.pricePerDay, sampleBike.pricePerDay);
    assert.equal(booking.estimatedTotal, sampleBike.pricePerDay * 3);
    assert.match(booking.bookingReference, /^SBR-\d{8}-[A-F0-9]{6}$/);
    assert.ok(whatsapp.whatsappUrl.startsWith('https://wa.me/15550192834?text='));
    assert.ok(whatsapp.messageText.includes(booking.bookingReference));
    assert.ok(whatsapp.messageText.includes('Alex Rider'));
    assert.ok(whatsapp.messageText.includes(sampleBike.name));

    // Public reference lookup returns limited safe fields only (no customer phone/address)
    const lookup = await request(app).get(`/api/bookings/reference/${booking.bookingReference}`);
    assert.equal(lookup.status, 200);
    assert.equal(lookup.body.data.bookingReference, booking.bookingReference);
    assert.equal(lookup.body.data.phone, undefined);
    assert.equal(lookup.body.data.address, undefined);
  });

  it('prevents overlapping Confirmed/Active bookings for the same bike', async () => {
    const pickup = futureDateISO(20);
    // Create two pending requests with overlapping dates
    const b1 = await request(app).post('/api/bookings').send({
      fullName: 'Rider One',
      phone: '+1 555 111 0001',
      address: '10 First St',
      pickupDate: pickup,
      rentalDays: 4,
      bikeId: sampleBike._id.toString(),
    });
    const b2 = await request(app).post('/api/bookings').send({
      fullName: 'Rider Two',
      phone: '+1 555 111 0002',
      address: '20 Second St',
      pickupDate: futureDateISO(22),
      rentalDays: 3,
      bikeId: sampleBike._id.toString(),
    });
    assert.equal(b1.status, 201);
    assert.equal(b2.status, 201);

    const listRes = await adminAgent.get('/api/admin/bookings');
    const booking1 = listRes.body.data.bookings.find(
      (x) => x.bookingReference === b1.body.data.booking.bookingReference
    );
    const booking2 = listRes.body.data.bookings.find(
      (x) => x.bookingReference === b2.body.data.booking.bookingReference
    );

    // Confirm booking 1 -> succeeds
    const confirm1 = await adminAgent
      .patch(`/api/admin/bookings/${booking1._id}/status`)
      .set('X-CSRF-Token', csrfToken)
      .send({ bookingStatus: 'Confirmed', note: 'Confirmed first request' });
    assert.equal(confirm1.status, 200);

    // Confirm overlapping booking 2 -> MUST fail with 409 Conflict
    const confirm2 = await adminAgent
      .patch(`/api/admin/bookings/${booking2._id}/status`)
      .set('X-CSRF-Token', csrfToken)
      .send({ bookingStatus: 'Confirmed' });
    assert.equal(confirm2.status, 409);

    // Complete booking 1 and verify recorded revenue reflects it while Pending does NOT
    const complete1 = await adminAgent
      .patch(`/api/admin/bookings/${booking1._id}/status`)
      .set('X-CSRF-Token', csrfToken)
      .send({ bookingStatus: 'Completed', paymentStatus: 'Paid' });
    assert.equal(complete1.status, 200);

    const reportRes = await adminAgent.get('/api/admin/reports/summary');
    assert.equal(reportRes.status, 200);
    assert.equal(reportRes.body.data.kpis.recordedRevenue, sampleBike.pricePerDay * 4);
    assert.ok(reportRes.body.data.kpis.estimatedPipelineValue > 0);
  });

  it('moderates reviews so only approved reviews appear publicly, and persists contact enquiries', async () => {
    const revRes = await request(app)
      .post(`/api/bikes/${sampleBike.slug}/reviews`)
      .send({
        customerName: 'Sam Tester',
        rating: 5,
        reviewText: 'Clean motorcycle and smooth pickup experience.',
      });
    assert.equal(revRes.status, 201);

    // Before approval: not public
    const beforePublic = await request(app).get(`/api/bikes/${sampleBike.slug}`);
    assert.equal(beforePublic.body.data.reviews.length, 0);

    // Approve via admin
    const approveRes = await adminAgent
      .patch(`/api/admin/reviews/${revRes.body.data.id}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ moderationStatus: 'approved' });
    assert.equal(approveRes.status, 200);

    // After approval: visible publicly
    const afterPublic = await request(app).get(`/api/bikes/${sampleBike.slug}`);
    assert.equal(afterPublic.body.data.reviews.length, 1);

    // Contact form persists enquiry
    const contactRes = await request(app).post('/api/contact').send({
      name: 'Jordan',
      phone: '+1 555 444 5555',
      email: 'jordan@example.test',
      subject: 'Weekend Group Rental',
      message: 'Do you offer helmet rentals alongside weekend bike bookings?',
    });
    assert.equal(contactRes.status, 201);

    const enqList = await adminAgent.get('/api/admin/enquiries');
    assert.equal(enqList.status, 200);
    assert.equal(enqList.body.data.enquiries.length, 1);
  });
});
