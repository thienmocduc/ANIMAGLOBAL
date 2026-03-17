'use strict';
const router = require('express').Router();
const db     = require('../db/pool');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

router.use(authenticate);

router.get('/partners', async (req, res) => {
  const { status, city } = req.query;
  let where=['1=1'], params=[], i=1;
  if (status) { where.push(`status=$${i++}`); params.push(status); }
  if (city)   { where.push(`city ILIKE $${i++}`); params.push(`%${city}%`); }

  const { rows } = await db.query(`
    SELECT fp.*, c.name AS center_name
    FROM franchise_partners fp
    LEFT JOIN centers c ON c.id=fp.center_id
    WHERE ${where.join(' AND ')}
    ORDER BY fp.created_at DESC
  `, params);
  res.json(rows);
});

router.post('/partners', authorize('superadmin','admin'), async (req, res) => {
  const { company_name,contact_name,phone,email,city,package:pkg,investment,royalty_rate,notes } = req.body;
  const code = `FP-${Date.now().toString(36).toUpperCase()}`;
  const { rows } = await db.query(`
    INSERT INTO franchise_partners(code,company_name,contact_name,phone,email,city,package,investment,royalty_rate,notes)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
  `,[code,company_name,contact_name,phone,email||null,city||null,pkg||'lite',
     investment||null,royalty_rate||5.0,notes||null]);
  await logAudit(req.user.id,'create','franchise_partners',rows[0].id,null,rows[0],req);
  res.status(201).json(rows[0]);
});

router.patch('/partners/:id/status', authorize('superadmin','admin'), async (req, res) => {
  const { status, signed_at } = req.body;
  const valid = ['prospect','negotiation','signed','active','suspended'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const { rows } = await db.query(`
    UPDATE franchise_partners SET status=$1, signed_at=COALESCE($2::date, signed_at)
    WHERE id=$3 RETURNING *
  `,[status, signed_at||null, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.get('/royalties', authorize('superadmin','admin'), async (req, res) => {
  const { period, paid } = req.query;
  let where=['1=1'], params=[], i=1;
  if (period) { where.push(`fr.period=$${i++}`); params.push(period); }
  if (paid !== undefined) { where.push(`fr.paid=$${i++}`); params.push(paid === 'true'); }
  const { rows } = await db.query(`
    SELECT fr.*, fp.company_name, fp.contact_name
    FROM franchise_royalties fr JOIN franchise_partners fp ON fp.id=fr.partner_id
    WHERE ${where.join(' AND ')} ORDER BY fr.period DESC, fp.company_name
  `, params);
  res.json(rows);
});

router.post('/royalties', authorize('superadmin','admin'), async (req, res) => {
  const { partner_id, period, revenue, royalty_pct } = req.body;
  const amount = Math.round(revenue * royalty_pct / 100);
  const { rows } = await db.query(`
    INSERT INTO franchise_royalties(partner_id,period,revenue,royalty_pct,amount)
    VALUES($1,$2,$3,$4,$5) RETURNING *
  `,[partner_id, period, revenue, royalty_pct, amount]);
  res.status(201).json(rows[0]);
});

router.patch('/royalties/:id/pay', authorize('superadmin','admin'), async (req, res) => {
  const { rows } = await db.query(`
    UPDATE franchise_royalties SET paid=true, paid_at=NOW() WHERE id=$1 RETURNING *
  `,[req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports = router;
