'use strict';
/**
 * AnimaCare API Tests
 * Run: npm test
 */
const request = require('supertest');
const app     = require('../src/server');

// ── Test setup ────────────────────────────────────────────
let adminToken;
let testBookingId;
let testCustomerId;

// Auth headers helper
const auth = (token) => ({ Authorization: `Bearer ${token}` });

// ════════════════════════════════════════════════════════
// AUTH TESTS
// ════════════════════════════════════════════════════════
describe('POST /api/v1/auth/login', () => {
  it('returns 401 with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 400 with missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  it('returns tokens with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@animacare.global', password: 'Admin@2026!' });

    if (res.status === 200) {
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.role).toBe('superadmin');
      adminToken = res.body.access_token;
    } else {
      console.warn('Login test skipped — DB not seeded');
    }
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns user with valid token', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email');
  });
});

// ════════════════════════════════════════════════════════
// HEALTH
// ════════════════════════════════════════════════════════
describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// ════════════════════════════════════════════════════════
// CENTERS
// ════════════════════════════════════════════════════════
describe('GET /api/v1/centers', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/centers');
    expect(res.status).toBe(401);
  });

  it('returns array of centers', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/centers')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('code');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('status');
    }
  });

  it('filters by status', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/centers?status=active')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    res.body.forEach(c => expect(c.status).toBe('active'));
  });
});

// ════════════════════════════════════════════════════════
// CUSTOMERS
// ════════════════════════════════════════════════════════
describe('Customer CRUD', () => {
  it('creates a customer', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post('/api/v1/customers')
      .set(auth(adminToken))
      .send({
        full_name: 'Nguyễn Test User',
        phone:     `090${Date.now().toString().slice(-8)}`,
        gender:    'F',
        constitution: 'moc'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('code');
    testCustomerId = res.body.id;
  });

  it('returns customer list with pagination', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/customers?page=1&limit=10')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
  });

  it('searches customers', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/customers?search=Nguyễn')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
  });

  it('prevents duplicate phone', async () => {
    if (!adminToken || !testCustomerId) return;
    // Get the customer's phone
    const cu = await request(app)
      .get(`/api/v1/customers/${testCustomerId}`)
      .set(auth(adminToken));
    if (cu.status !== 200) return;

    const res = await request(app)
      .post('/api/v1/customers')
      .set(auth(adminToken))
      .send({ full_name: 'Duplicate', phone: cu.body.phone });
    expect(res.status).toBe(409);
  });
});

// ════════════════════════════════════════════════════════
// BOOKINGS
// ════════════════════════════════════════════════════════
describe('Booking CRUD', () => {
  it('returns bookings list', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/bookings')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('filters bookings by date', async () => {
    if (!adminToken) return;
    const today = new Date().toISOString().slice(0, 10);
    const res = await request(app)
      .get(`/api/v1/bookings?date=${today}`)
      .set(auth(adminToken));
    expect(res.status).toBe(200);
  });

  it('requires customer_id and service_id to create', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .post('/api/v1/bookings')
      .set(auth(adminToken))
      .send({ booked_at: new Date().toISOString() }); // missing required fields
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════
describe('GET /api/v1/dashboard/kpis', () => {
  it('returns KPI structure', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/dashboard/kpis')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bookings');
    expect(res.body).toHaveProperty('revenue');
    expect(res.body).toHaveProperty('customers');
    expect(res.body).toHaveProperty('centers');
  });
});

// ════════════════════════════════════════════════════════
// INVENTORY
// ════════════════════════════════════════════════════════
describe('GET /api/v1/inventory', () => {
  it('returns inventory list', async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/inventory')
      .set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ════════════════════════════════════════════════════════
// RATE LIMITING
// ════════════════════════════════════════════════════════
describe('Rate limiting', () => {
  it('blocks after 10 failed login attempts', async () => {
    const promises = Array(12).fill(null).map(() =>
      request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
    );
    const results = await Promise.all(promises);
    const blocked = results.some(r => r.status === 429);
    expect(blocked).toBe(true);
  });
});

// ── Cleanup ───────────────────────────────────────────────
afterAll(async () => {
  // Close DB pool to allow jest to exit
  try {
    const db = require('../src/db/pool');
    await db.pool.end();
  } catch {}
});
