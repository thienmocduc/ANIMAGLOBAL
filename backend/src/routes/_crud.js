'use strict';
// ════════════════════════════════════════════════════
// Centers Routes
// ════════════════════════════════════════════════════
const centersRouter = require('express').Router();
const db   = require('../db/pool');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

centersRouter.use(authenticate);

centersRouter.get('/', async (req, res) => {
  const { status, city } = req.query;
  let where = ['1=1'], params = [], i = 1;
  if (status) { where.push(`status=$${i++}`); params.push(status); }
  if (city)   { where.push(`city ILIKE $${i++}`); params.push(`%${city}%`); }
  const { rows } = await db.query(`
    SELECT c.*,
      (SELECT COUNT(*) FROM bookings b WHERE b.center_id=c.id AND DATE(b.booked_at)=CURRENT_DATE) AS bookings_today,
      (SELECT COUNT(*) FROM technicians t WHERE t.center_id=c.id AND t.status='active') AS ktv_active
    FROM centers c WHERE ${where.join(' AND ')} ORDER BY c.city,c.name
  `, params);
  res.json(rows);
});

centersRouter.get('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM centers WHERE id=$1',[req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

centersRouter.post('/', authorize('superadmin','admin'), async (req, res) => {
  const { code,name,city,district,address,lat,lng,type,rooms,phone,email } = req.body;
  const { rows } = await db.query(`
    INSERT INTO centers(code,name,city,district,address,lat,lng,type,rooms,phone,email)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
  `,[code,name,city,district,address,lat||null,lng||null,type||'franchise_lite',rooms||4,phone||null,email||null]);
  await logAudit(req.user.id,'create','centers',rows[0].id,null,rows[0],req);
  res.status(201).json(rows[0]);
});

centersRouter.put('/:id', authorize('superadmin','admin'), async (req, res) => {
  const f = req.body;
  const { rows } = await db.query(`
    UPDATE centers SET name=$1,city=$2,district=$3,address=$4,lat=$5,lng=$6,
    type=$7,status=$8,rooms=$9,phone=$10,email=$11 WHERE id=$12 RETURNING *
  `,[f.name,f.city,f.district,f.address,f.lat||null,f.lng||null,
     f.type,f.status,f.rooms,f.phone||null,f.email||null,req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports.centersRouter = centersRouter;

// ════════════════════════════════════════════════════
// Customers Routes
// ════════════════════════════════════════════════════
const customersRouter = require('express').Router();
customersRouter.use(authenticate);

customersRouter.get('/', async (req, res) => {
  const { constitution, search, tier } = req.query;
  const page = Math.max(1, Number(req.query.page)||1);
  const limit = Math.min(100, Number(req.query.limit)||20);
  let where=['1=1'], params=[], i=1;
  if (constitution) { where.push(`constitution=$${i++}`); params.push(constitution); }
  if (tier)         { where.push(`member_tier=$${i++}`);  params.push(tier); }
  if (search) {
    where.push(`(full_name ILIKE $${i} OR phone ILIKE $${i} OR email ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }
  const wStr = where.join(' AND ');
  const [data, count] = await Promise.all([
    db.query(`SELECT * FROM customers WHERE ${wStr} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...params, limit, (page-1)*limit]),
    db.query(`SELECT COUNT(*) FROM customers WHERE ${wStr}`, params)
  ]);
  res.json({ data: data.rows, total: Number(count.rows[0].count), page, limit });
});

customersRouter.get('/stats', async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE constitution='moc')   AS moc,
      COUNT(*) FILTER (WHERE constitution='hoa')   AS hoa,
      COUNT(*) FILTER (WHERE constitution='tho')   AS tho,
      COUNT(*) FILTER (WHERE constitution='kim')   AS kim,
      COUNT(*) FILTER (WHERE constitution='thuy')  AS thuy,
      COUNT(*) FILTER (WHERE member_tier='gold')   AS gold,
      COUNT(*) FILTER (WHERE member_tier='silver') AS silver,
      COUNT(*) FILTER (WHERE created_at >= NOW()-INTERVAL '30 days') AS new_30d
    FROM customers WHERE is_active=true
  `);
  res.json(rows[0]);
});

customersRouter.get('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM customers WHERE id=$1',[req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });

  // Also get last 5 bookings
  const bk = await db.query(`
    SELECT b.code, b.booked_at, b.status, s.name AS service, b.final_price
    FROM bookings b JOIN services s ON s.id=b.service_id
    WHERE b.customer_id=$1 ORDER BY b.booked_at DESC LIMIT 5
  `,[req.params.id]);
  res.json({ ...rows[0], recent_bookings: bk.rows });
});

customersRouter.post('/', async (req, res) => {
  const {full_name,phone,email,dob,gender,address,center_id,constitution,notes} = req.body;
  const code = `CU-${Date.now().toString(36).toUpperCase()}`;
  const { rows } = await db.query(`
    INSERT INTO customers(code,full_name,phone,email,dob,gender,address,center_id,constitution,notes)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
  `,[code,full_name,phone,email||null,dob||null,gender||null,address||null,
     center_id||null,constitution||'unknown',notes||null]);
  res.status(201).json(rows[0]);
});

customersRouter.put('/:id', async (req, res) => {
  const {full_name,phone,email,dob,gender,address,constitution,member_tier,notes} = req.body;
  const { rows } = await db.query(`
    UPDATE customers SET full_name=$1,phone=$2,email=$3,dob=$4,gender=$5,
    address=$6,constitution=$7,member_tier=$8,notes=$9 WHERE id=$10 RETURNING *
  `,[full_name,phone,email||null,dob||null,gender||null,address||null,
     constitution,member_tier||'bronze',notes||null,req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports.customersRouter = customersRouter;

// ════════════════════════════════════════════════════
// Technicians Routes
// ════════════════════════════════════════════════════
const techniciansRouter = require('express').Router();
techniciansRouter.use(authenticate);

techniciansRouter.get('/', async (req, res) => {
  const { center_id, level, status, search } = req.query;
  const page = Math.max(1, Number(req.query.page)||1);
  const limit = Math.min(100, Number(req.query.limit)||20);
  let where=['1=1'], params=[], i=1;
  if (center_id) { where.push(`t.center_id=$${i++}`); params.push(center_id); }
  if (level)     { where.push(`t.level=$${i++}`);     params.push(level); }
  if (status)    { where.push(`t.status=$${i++}`);    params.push(status); }
  if (search)    { where.push(`t.full_name ILIKE $${i++}`); params.push(`%${search}%`); }
  const wStr = where.join(' AND ');
  const [data, count] = await Promise.all([
    db.query(`
      SELECT t.*, c.name AS center_name
      FROM technicians t JOIN centers c ON c.id=t.center_id
      WHERE ${wStr} ORDER BY t.level DESC, t.rating DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...params, limit, (page-1)*limit]),
    db.query(`SELECT COUNT(*) FROM technicians t WHERE ${wStr}`, params)
  ]);
  res.json({ data: data.rows, total: Number(count.rows[0].count), page, limit });
});

techniciansRouter.post('/', authorize('superadmin','admin','manager'), async (req, res) => {
  const {full_name,phone,email,center_id,level,specialties,joined_at} = req.body;
  const code = `KTV-${Date.now().toString(36).toUpperCase()}`;
  const { rows } = await db.query(`
    INSERT INTO technicians(code,full_name,phone,email,center_id,level,specialties,joined_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *
  `,[code,full_name,phone,email||null,center_id,level||'L1',
     specialties||[],joined_at||new Date().toISOString().slice(0,10)]);
  res.status(201).json(rows[0]);
});

module.exports.techniciansRouter = techniciansRouter;

// ════════════════════════════════════════════════════
// Orders Routes
// ════════════════════════════════════════════════════
const ordersRouter = require('express').Router();
ordersRouter.use(authenticate);

ordersRouter.get('/', async (req, res) => {
  const { status, search } = req.query;
  const page = Math.max(1, Number(req.query.page)||1);
  const limit = Math.min(100, Number(req.query.limit)||20);
  let where=['1=1'], params=[], i=1;
  if (status) { where.push(`o.status=$${i++}`); params.push(status); }
  if (search) {
    where.push(`(o.code ILIKE $${i} OR cu.full_name ILIKE $${i} OR cu.phone ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }
  const wStr = where.join(' AND ');
  const [data, count] = await Promise.all([
    db.query(`
      SELECT o.id,o.code,o.status,o.payment_method,o.total,o.created_at,
             cu.full_name AS customer_name, cu.phone
      FROM orders o JOIN customers cu ON cu.id=o.customer_id
      WHERE ${wStr} ORDER BY o.created_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...params, limit, (page-1)*limit]),
    db.query(`SELECT COUNT(*) FROM orders o JOIN customers cu ON cu.id=o.customer_id WHERE ${wStr}`, params)
  ]);
  res.json({ data: data.rows, total: Number(count.rows[0].count), page, limit });
});

ordersRouter.get('/:id', async (req, res) => {
  const [o, items] = await Promise.all([
    db.query(`
      SELECT o.*, cu.full_name AS customer_name, cu.phone
      FROM orders o JOIN customers cu ON cu.id=o.customer_id WHERE o.id=$1
    `, [req.params.id]),
    db.query(`
      SELECT oi.*, p.name, p.sku FROM order_items oi JOIN products p ON p.id=oi.product_id
      WHERE oi.order_id=$1
    `, [req.params.id])
  ]);
  if (!o.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json({ ...o.rows[0], items: items.rows });
});

ordersRouter.post('/', async (req, res) => {
  const { customer_id, center_id, items, payment_method, ship_name, ship_phone, ship_address, notes } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'items required' });

  await db.withTransaction(async (client) => {
    // Calc totals
    let subtotal = 0;
    const resolved = [];
    for (const item of items) {
      const p = await db.query('SELECT id,price FROM products WHERE id=$1',[item.product_id], client);
      if (!p.rows[0]) throw new Error(`Product ${item.product_id} not found`);
      const line = p.rows[0].price * item.qty;
      subtotal += line;
      resolved.push({ product_id: item.product_id, qty: item.qty, unit_price: p.rows[0].price, subtotal: line });
    }

    const code = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = await db.query(`
      INSERT INTO orders(code,customer_id,center_id,payment_method,subtotal,total,
        ship_name,ship_phone,ship_address,notes,created_by)
      VALUES($1,$2,$3,$4,$5,$5,$6,$7,$8,$9,$10) RETURNING *
    `,[code,customer_id,center_id||null,payment_method||'cod',subtotal,
       ship_name||null,ship_phone||null,ship_address||null,notes||null,req.user.id], client);

    for (const r of resolved) {
      await db.query(`INSERT INTO order_items(order_id,product_id,qty,unit_price,subtotal) VALUES($1,$2,$3,$4,$5)`,
        [order.rows[0].id, r.product_id, r.qty, r.unit_price, r.subtotal], client);
    }

    res.status(201).json(order.rows[0]);
  });
});

ordersRouter.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const valid = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const { rows } = await db.query(
    `UPDATE orders SET status=$1 WHERE id=$2 RETURNING id,code,status`, [status, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports.ordersRouter = ordersRouter;
