'use strict';
const router = require('express').Router();
const { body, query: qv, validationResult } = require('express-validator');
const db     = require('../db/pool');
const { authenticate, authorize, centerScope, logAudit } = require('../middleware/auth');
const mailer = require('../utils/mailer');

router.use(authenticate);

const BOOKING_FIELDS = `
  b.id, b.code, b.booked_at, b.status, b.notes, b.price, b.final_price,
  cu.id AS customer_id, cu.full_name AS customer_name, cu.phone AS customer_phone,
  s.id AS service_id,   s.name AS service_name, s.duration,
  c.id AS center_id,    c.name AS center_name,
  t.id AS technician_id,t.full_name AS technician_name,
  b.created_at, b.updated_at
`;

// ─── GET /bookings ────────────────────────────────────────
router.get('/', centerScope, async (req, res) => {
  const { status, date, date_from, date_to, search } = req.query;
  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const offset = (page-1)*limit;

  let where = ['1=1'];
  let params = [];
  let i = 1;

  if (req.scopedCenterId)       { where.push(`b.center_id=$${i++}`);     params.push(req.scopedCenterId); }
  if (status)                   { where.push(`b.status=$${i++}`);        params.push(status); }
  if (date)                     { where.push(`DATE(b.booked_at)=$${i++}`); params.push(date); }
  if (date_from)                { where.push(`b.booked_at>=$${i++}`);    params.push(date_from); }
  if (date_to)                  { where.push(`b.booked_at<=$${i++}`);    params.push(date_to); }
  if (search) {
    where.push(`(cu.full_name ILIKE $${i} OR cu.phone ILIKE $${i} OR b.code ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }

  const wStr = where.join(' AND ');

  const [data, count] = await Promise.all([
    db.query(`
      SELECT ${BOOKING_FIELDS}
      FROM bookings b
      JOIN customers  cu ON cu.id=b.customer_id
      JOIN services   s  ON s.id=b.service_id
      JOIN centers    c  ON c.id=b.center_id
      LEFT JOIN technicians t ON t.id=b.technician_id
      WHERE ${wStr}
      ORDER BY b.booked_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...params, limit, offset]),
    db.query(`
      SELECT COUNT(*) FROM bookings b
      JOIN customers cu ON cu.id=b.customer_id
      WHERE ${wStr}
    `, params)
  ]);

  res.json({
    data:  data.rows,
    total: Number(count.rows[0].count),
    page, limit
  });
});

// ─── GET /bookings/:id ────────────────────────────────────
router.get('/:id', async (req, res) => {
  const { rows } = await db.query(`
    SELECT ${BOOKING_FIELDS}
    FROM bookings b
    JOIN customers  cu ON cu.id=b.customer_id
    JOIN services   s  ON s.id=b.service_id
    JOIN centers    c  ON c.id=b.center_id
    LEFT JOIN technicians t ON t.id=b.technician_id
    WHERE b.id=$1
  `, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Booking not found' });
  res.json(rows[0]);
});

// ─── POST /bookings ───────────────────────────────────────
router.post('/', [
  body('customer_id').isUUID(),
  body('center_id').isUUID(),
  body('service_id').isUUID(),
  body('booked_at').isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { customer_id, center_id, service_id, technician_id, booked_at, notes } = req.body;

  // Get service price
  const svc = await db.query('SELECT price, duration FROM services WHERE id=$1', [service_id]);
  if (!svc.rows[0]) return res.status(400).json({ error: 'Service not found' });

  // Generate code
  const code = `BK-${Date.now().toString(36).toUpperCase()}`;

  const { rows } = await db.query(`
    INSERT INTO bookings(code,customer_id,center_id,service_id,technician_id,
                         booked_at,notes,price,final_price,duration,created_by)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10)
    RETURNING id,code,status,booked_at
  `, [code, customer_id, center_id, service_id, technician_id||null,
      booked_at, notes||null, svc.rows[0].price, svc.rows[0].duration, req.user.id]);

  await logAudit(req.user.id, 'create', 'bookings', rows[0].id, null, rows[0], req);

  // Email notification (non-blocking)
  try {
    const bkFull = await db.query(`
      SELECT b.*, cu.full_name AS customer_name, cu.email AS customer_email, cu.phone AS customer_phone,
             s.name AS service_name, c.name AS center_name, c.email AS center_email,
             t.full_name AS technician_name
      FROM bookings b
      JOIN customers cu ON cu.id=b.customer_id
      JOIN services s   ON s.id=b.service_id
      JOIN centers c    ON c.id=b.center_id
      LEFT JOIN technicians t ON t.id=b.technician_id
      WHERE b.id=$1
    `, [rows[0].id]);
    if (bkFull.rows[0]) {
      mailer.newBookingAlert(bkFull.rows[0], bkFull.rows[0].center_email).catch(() => {});
    }
  } catch {}

  res.status(201).json(rows[0]);
});

// ─── PATCH /bookings/:id/status ───────────────────────────
router.patch('/:id/status', [
  body('status').isIn(['pending','confirmed','in_progress','completed','cancelled','no_show'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { status, cancel_reason } = req.body;
  const old = await db.query('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
  if (!old.rows[0]) return res.status(404).json({ error: 'Not found' });

  const extras = status === 'cancelled'
    ? `, cancelled_by=$3, cancelled_at=NOW(), cancel_reason=$4`
    : status === 'completed' ? `, completed_at=NOW()` : '';

  const params = status === 'cancelled'
    ? [status, req.params.id, req.user.id, cancel_reason||null]
    : [status, req.params.id];

  const { rows } = await db.query(
    `UPDATE bookings SET status=$1${extras} WHERE id=$2 RETURNING *`,
    params
  );

  await logAudit(req.user.id, 'update_status', 'bookings', req.params.id,
    { status: old.rows[0].status }, { status }, req);

  // Email on status change (non-blocking)
  if (status === 'confirmed' || status === 'cancelled') {
    try {
      const bkFull = await db.query(`
        SELECT b.*, cu.full_name AS customer_name, cu.email AS customer_email,
               s.name AS service_name, c.name AS center_name, t.full_name AS technician_name
        FROM bookings b
        JOIN customers cu ON cu.id=b.customer_id
        JOIN services s   ON s.id=b.service_id
        JOIN centers c    ON c.id=b.center_id
        LEFT JOIN technicians t ON t.id=b.technician_id
        WHERE b.id=$1
      `, [req.params.id]);
      const bk = { ...bkFull.rows[0], cancel_reason };
      if (status === 'confirmed') mailer.bookingConfirmed(bk).catch(() => {});
      if (status === 'cancelled') mailer.bookingCancelled(bk).catch(() => {});
    } catch {}
  }

  res.json(rows[0]);
});

// ─── PUT /bookings/:id ────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { technician_id, booked_at, notes } = req.body;
  const { rows } = await db.query(`
    UPDATE bookings
    SET technician_id=$1, booked_at=$2, notes=$3
    WHERE id=$4 AND status NOT IN ('completed','cancelled')
    RETURNING id,code,booked_at,status
  `, [technician_id||null, booked_at, notes||null, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found or not editable' });
  res.json(rows[0]);
});

// ─── DELETE /bookings/:id ────────────────────────────────
router.delete('/:id', authorize('superadmin','admin'), async (req, res) => {
  const { rows } = await db.query(
    `DELETE FROM bookings WHERE id=$1 RETURNING id`, [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  await logAudit(req.user.id, 'delete', 'bookings', req.params.id, null, null, req);
  res.json({ message: 'Deleted' });
});

module.exports = router;
