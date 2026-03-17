'use strict';
const router = require('express').Router();
const db     = require('../db/pool');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

router.use(authenticate);

// ─── GET /inventory ───────────────────────────────────────
router.get('/', async (req, res) => {
  const { center_id, alert } = req.query;
  let where = ['1=1'], params = [], i = 1;
  if (center_id) { where.push(`i.center_id=$${i++}`);   params.push(center_id); }
  if (alert)     { where.push(`i.alert=$${i++}`);        params.push(alert); }

  const { rows } = await db.query(`
    SELECT i.id, p.sku, p.name, p.category, p.unit,
           i.qty, i.qty_reserved, i.qty_min, i.alert, i.updated_at,
           COALESCE(c.name,'Kho Trung Tâm') AS location
    FROM inventory i
    JOIN products p ON p.id=i.product_id
    LEFT JOIN centers c ON c.id=i.center_id
    WHERE ${where.join(' AND ')}
    ORDER BY CASE i.alert WHEN 'out' THEN 0 WHEN 'critical' THEN 1 WHEN 'low' THEN 2 ELSE 3 END, p.name
  `, params);
  res.json(rows);
});

// ─── PATCH /inventory/:id ─────────────────────────────────
router.patch('/:id', authorize('superadmin','admin','manager'), async (req, res) => {
  const { qty, qty_min } = req.body;
  const old = await db.query('SELECT * FROM inventory WHERE id=$1', [req.params.id]);
  if (!old.rows[0]) return res.status(404).json({ error: 'Not found' });

  const { rows } = await db.query(`
    UPDATE inventory SET qty=$1, qty_min=$2 WHERE id=$3 RETURNING *
  `, [qty ?? old.rows[0].qty, qty_min ?? old.rows[0].qty_min, req.params.id]);

  await logAudit(req.user.id, 'update', 'inventory', req.params.id,
    { qty: old.rows[0].qty }, { qty }, req);
  res.json(rows[0]);
});

// ─── POST /inventory/adjust ───────────────────────────────
// Adjust stock: add, subtract, set
router.post('/adjust', authorize('superadmin','admin','manager'), async (req, res) => {
  const { product_id, center_id, type, amount, reason } = req.body;
  if (!['add','subtract','set'].includes(type)) {
    return res.status(400).json({ error: 'type must be add|subtract|set' });
  }

  const { rows: existing } = await db.query(`
    SELECT id, qty FROM inventory WHERE product_id=$1 AND (center_id=$2 OR (center_id IS NULL AND $2::uuid IS NULL))
  `, [product_id, center_id||null]);

  let newQty;
  if (!existing[0]) {
    // Create new inventory record
    newQty = type === 'subtract' ? 0 : amount;
    const ins = await db.query(`
      INSERT INTO inventory(product_id, center_id, qty, qty_min) VALUES($1,$2,$3,10) RETURNING *
    `, [product_id, center_id||null, newQty]);
    return res.status(201).json(ins.rows[0]);
  }

  if (type === 'set')      newQty = amount;
  else if (type === 'add') newQty = existing[0].qty + amount;
  else                     newQty = Math.max(0, existing[0].qty - amount);

  const { rows } = await db.query(
    'UPDATE inventory SET qty=$1 WHERE id=$2 RETURNING *', [newQty, existing[0].id]
  );
  await logAudit(req.user.id, `stock_${type}`, 'inventory', existing[0].id,
    { qty: existing[0].qty }, { qty: newQty, reason }, req);
  res.json(rows[0]);
});

module.exports = router;
