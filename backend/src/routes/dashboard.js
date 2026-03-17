'use strict';
const router = require('express').Router();
const db     = require('../db/pool');
const { authenticate, authorize, centerScope } = require('../middleware/auth');

router.use(authenticate);

// ─── GET /dashboard/kpis ─────────────────────────────────
// Main KPI cards: bookings today, revenue today, customers, active centers
router.get('/kpis', centerScope, async (req, res) => {
  const cid = req.scopedCenterId;
  const and = cid ? 'AND center_id=$1' : '';
  const params = cid ? [cid] : [];

  const [bookings, revenue, customers, centers] = await Promise.all([
    // Bookings today
    db.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status='confirmed') AS confirmed,
             COUNT(*) FILTER (WHERE status='completed') AS completed,
             COUNT(*) FILTER (WHERE status='pending')   AS pending,
             COUNT(*) FILTER (WHERE status='cancelled') AS cancelled
      FROM bookings
      WHERE DATE(booked_at)=CURRENT_DATE ${and}
    `, params),

    // Revenue today (from completed bookings)
    db.query(`
      SELECT COALESCE(SUM(final_price),0) AS today,
             COALESCE(SUM(final_price) FILTER (
               WHERE booked_at >= DATE_TRUNC('month',NOW())
             ),0) AS this_month
      FROM bookings
      WHERE status='completed' ${and}
    `, params),

    // Total active customers
    db.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '30 days') AS new_30d
      FROM customers WHERE is_active=true
    `),

    // Active centers
    db.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status='active') AS active,
             COUNT(*) FILTER (WHERE status='setup')  AS setup
      FROM centers ${cid ? 'WHERE id=$1' : ''}
    `, cid ? [cid] : []),
  ]);

  res.json({
    bookings:  bookings.rows[0],
    revenue:   revenue.rows[0],
    customers: customers.rows[0],
    centers:   centers.rows[0]
  });
});

// ─── GET /dashboard/chart/revenue ────────────────────────
// Last 12 months revenue for line chart
router.get('/chart/revenue', centerScope, async (req, res) => {
  const cid = req.scopedCenterId;
  const { rows } = await db.query(`
    SELECT TO_CHAR(booked_at,'YYYY-MM') AS period,
           COALESCE(SUM(final_price),0) AS revenue,
           COUNT(*) AS sessions
    FROM bookings
    WHERE status='completed'
      AND booked_at >= NOW()-INTERVAL '12 months'
      ${cid ? 'AND center_id=$1' : ''}
    GROUP BY period ORDER BY period
  `, cid ? [cid] : []);
  res.json(rows);
});

// ─── GET /dashboard/chart/centers ────────────────────────
// Revenue per center (donut chart)
router.get('/chart/centers', authorize('superadmin','admin','manager'), async (req, res) => {
  const { rows } = await db.query(`
    SELECT c.id, c.code, c.name, c.city,
           COALESCE(SUM(b.final_price),0) AS revenue,
           COUNT(b.id) AS sessions
    FROM centers c
    LEFT JOIN bookings b ON b.center_id=c.id AND b.status='completed'
      AND b.booked_at >= DATE_TRUNC('month',NOW())
    GROUP BY c.id
    ORDER BY revenue DESC
  `);
  res.json(rows);
});

// ─── GET /dashboard/activity ─────────────────────────────
// Recent activity feed
router.get('/activity', centerScope, async (req, res) => {
  const cid    = req.scopedCenterId;
  const limit  = Math.min(Number(req.query.limit) || 20, 50);
  const { rows } = await db.query(`
    (SELECT 'booking' AS type, b.id, b.code,
            cu.full_name AS subject, s.name AS detail,
            b.status, b.created_at AS ts, c.name AS center
     FROM bookings b
     JOIN customers cu ON cu.id=b.customer_id
     JOIN services s   ON s.id=b.service_id
     JOIN centers c    ON c.id=b.center_id
     ${cid ? 'WHERE b.center_id=$1' : ''}
     ORDER BY b.created_at DESC LIMIT ${ cid ? '$2' : '$1' })
    UNION ALL
    (SELECT 'order' AS type, o.id, o.code,
            cu.full_name AS subject, o.total::text AS detail,
            o.status, o.created_at AS ts, '' AS center
     FROM orders o JOIN customers cu ON cu.id=o.customer_id
     ORDER BY o.created_at DESC LIMIT ${ cid ? '$2' : '$1' })
    ORDER BY ts DESC LIMIT ${ cid ? '$2' : '$1' }
  `, cid ? [cid, limit] : [limit]);
  res.json(rows);
});

// ─── GET /dashboard/stock-alerts ─────────────────────────
router.get('/stock-alerts', async (req, res) => {
  const { rows } = await db.query(`
    SELECT i.id, p.sku, p.name, i.qty, i.qty_min, i.alert,
           c.name AS center
    FROM inventory i
    JOIN products p ON p.id=i.product_id
    LEFT JOIN centers c ON c.id=i.center_id
    WHERE i.alert IN ('low','critical','out')
    ORDER BY CASE i.alert WHEN 'out' THEN 0 WHEN 'critical' THEN 1 ELSE 2 END
  `);
  res.json(rows);
});

// ─── GET /dashboard/today-bookings ───────────────────────
router.get('/today-bookings', centerScope, async (req, res) => {
  const cid = req.scopedCenterId;
  const { rows } = await db.query(`
    SELECT b.id, b.code, cu.full_name AS customer, cu.phone,
           s.name AS service, b.booked_at, b.status,
           COALESCE(t.full_name,'—') AS technician,
           c.name AS center
    FROM bookings b
    JOIN customers cu ON cu.id=b.customer_id
    JOIN services  s  ON s.id=b.service_id
    JOIN centers   c  ON c.id=b.center_id
    LEFT JOIN technicians t ON t.id=b.technician_id
    WHERE DATE(b.booked_at)=CURRENT_DATE
    ${cid ? 'AND b.center_id=$1' : ''}
    ORDER BY b.booked_at
  `, cid ? [cid] : []);
  res.json(rows);
});

module.exports = router;
