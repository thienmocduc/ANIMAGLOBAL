'use strict';
const router = require('express').Router();
const db     = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM services WHERE is_active=true ORDER BY category, name'
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM services WHERE id=$1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.post('/', authorize('superadmin','admin'), async (req, res) => {
  const { code, name, name_en, category, duration, price, description } = req.body;
  const { rows } = await db.query(`
    INSERT INTO services(code,name,name_en,category,duration,price,description)
    VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *
  `, [code, name, name_en||null, category||null, duration||60, price, description||null]);
  res.status(201).json(rows[0]);
});

router.put('/:id', authorize('superadmin','admin'), async (req, res) => {
  const { name, name_en, category, duration, price, description, is_active } = req.body;
  const { rows } = await db.query(`
    UPDATE services SET name=$1,name_en=$2,category=$3,duration=$4,price=$5,description=$6,is_active=$7
    WHERE id=$8 RETURNING *
  `, [name, name_en||null, category||null, duration||60, price, description||null, is_active??true, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports = router;
