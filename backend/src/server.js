'use strict';
require('dotenv').config();
require('express-async-errors');

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const compression = require('compression');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const db         = require('./db/pool');
const logger     = require('./utils/logger');
const { errorHandler } = require('./middleware/error');

// ─── Routes ──────────────────────────────────────────────
const authRoutes       = require('./routes/auth');
const dashboardRoutes  = require('./routes/dashboard');
const centersRoutes    = require('./routes/centers');
const customersRoutes  = require('./routes/customers');
const bookingsRoutes   = require('./routes/bookings');
const techniciansRoutes = require('./routes/technicians');
const ordersRoutes     = require('./routes/orders');
const inventoryRoutes  = require('./routes/inventory');
const franchiseRoutes  = require('./routes/franchise');
const aiRoutes         = require('./routes/ai');
const academyRoutes    = require('./routes/academy');
const revenueRoutes    = require('./routes/revenue');
const blogRoutes       = require('./routes/blog');
const usersRoutes      = require('./routes/users');
const analyticsRoutes  = require('./routes/analytics');
const servicesRoutes   = require('./routes/services');
const paymentRoutes    = require('./routes/payment');

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ─── Rate limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max:      Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' }
});
app.use('/api/', limiter);

// Stricter limit on auth endpoints
app.use('/api/auth/login', rateLimit({ windowMs: 900000, max: 10 }));

// ─── Parsing & Compression ────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ─── Logging ─────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: msg => logger.info(msg.trim()) }
}));

// ─── Static uploads ──────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health check ─────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', ts: new Date().toISOString(), version: '1.0.0' });
  } catch {
    res.status(503).json({ status: 'error', detail: 'db unreachable' });
  }
});

// ─── API Routes ───────────────────────────────────────────
const api = '/api/v1';
app.use(`${api}/auth`,        authRoutes);
app.use(`${api}/dashboard`,   dashboardRoutes);
app.use(`${api}/centers`,     centersRoutes);
app.use(`${api}/customers`,   customersRoutes);
app.use(`${api}/bookings`,    bookingsRoutes);
app.use(`${api}/technicians`, techniciansRoutes);
app.use(`${api}/orders`,      ordersRoutes);
app.use(`${api}/inventory`,   inventoryRoutes);
app.use(`${api}/franchise`,   franchiseRoutes);
app.use(`${api}/ai`,          aiRoutes);
app.use(`${api}/academy`,     academyRoutes);
app.use(`${api}/revenue`,     revenueRoutes);
app.use(`${api}/blog`,        blogRoutes);
app.use(`${api}/users`,       usersRoutes);
app.use(`${api}/analytics`,   analyticsRoutes);
app.use(`${api}/services`,    servicesRoutes);
app.use(`${api}/payment`,     paymentRoutes);
app.use(`${api}`,             paymentRoutes); // public booking/order endpoints

// ─── 404 ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🌿 AnimaCare API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

module.exports = app;
