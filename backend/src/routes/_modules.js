'use strict';
const { Router } = require('express');
const db  = require('../db/pool');
const { authenticate, authorize, centerScope, logAudit } = require('../middleware/auth');

// ════════════════════════════════════════════════════
// AI ENGINE
// ════════════════════════════════════════════════════
const aiRouter = Router();
aiRouter.use(authenticate);

aiRouter.get('/sessions', centerScope, async (req, res) => {
  const page = Math.max(1, Number(req.query.page)||1);
  const limit = Math.min(50, Number(req.query.limit)||20);
  const cid = req.scopedCenterId;
  const { rows } = await db.query(`
    SELECT ai.id, ai.constitution, ai.confidence, ai.created_at,
           cu.full_name AS customer, cu.phone,
           COALESCE(t.full_name,'—') AS technician,
           ai.model_version, ai.duration_sec
    FROM ai_sessions ai
    JOIN customers cu ON cu.id=ai.customer_id
    LEFT JOIN technicians t ON t.id=ai.technician_id
    ${cid ? 'WHERE ai.center_id=$3' : ''}
    ORDER BY ai.created_at DESC
    LIMIT $1 OFFSET $2
  `, cid ? [limit, (page-1)*limit, cid] : [limit, (page-1)*limit]);
  res.json(rows);
});

aiRouter.get('/stats', async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      COUNT(*) AS total,
      ROUND(AVG(confidence),1) AS avg_confidence,
      COUNT(*) FILTER (WHERE constitution='moc')  AS moc,
      COUNT(*) FILTER (WHERE constitution='hoa')  AS hoa,
      COUNT(*) FILTER (WHERE constitution='tho')  AS tho,
      COUNT(*) FILTER (WHERE constitution='kim')  AS kim,
      COUNT(*) FILTER (WHERE constitution='thuy') AS thuy,
      COUNT(*) FILTER (WHERE confidence >= 90)    AS high_conf,
      DATE_TRUNC('month', created_at) AS month
    FROM ai_sessions
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY month ORDER BY month
  `);
  res.json(rows);
});

aiRouter.post('/sessions', async (req, res) => {
  const { customer_id, technician_id, center_id, constitution, confidence,
          input_data, result, recommendations, duration_sec } = req.body;
  const { rows } = await db.query(`
    INSERT INTO ai_sessions(customer_id,technician_id,center_id,constitution,confidence,
      input_data,result,recommendations,duration_sec,model_version)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'v2.1') RETURNING *
  `,[customer_id, technician_id||null, center_id||null, constitution||'unknown',
     confidence||0, JSON.stringify(input_data||{}), JSON.stringify(result||{}),
     recommendations||[], duration_sec||0]);

  // Update customer constitution
  if (constitution && constitution !== 'unknown') {
    await db.query('UPDATE customers SET constitution=$1, ai_score=$2 WHERE id=$3',
      [constitution, confidence, customer_id]);
  }
  res.status(201).json(rows[0]);
});

module.exports.aiRouter = aiRouter;

// ════════════════════════════════════════════════════
// ACADEMY
// ════════════════════════════════════════════════════
const academyRouter = Router();
academyRouter.use(authenticate);

academyRouter.get('/courses', async (req, res) => {
  const { rows } = await db.query(`
    SELECT c.*,
      COUNT(e.id) AS enrolled,
      COUNT(e.id) FILTER (WHERE e.passed=true) AS graduated
    FROM academy_courses c
    LEFT JOIN academy_enrollments e ON e.course_id=c.id
    WHERE c.is_active=true
    GROUP BY c.id ORDER BY c.level, c.title
  `);
  res.json(rows);
});

academyRouter.get('/enrollments', async (req, res) => {
  const { course_id, level } = req.query;
  let where=['1=1'], params=[], i=1;
  if (course_id) { where.push(`e.course_id=$${i++}`); params.push(course_id); }
  if (level)     { where.push(`c.level=$${i++}`);     params.push(level); }
  const { rows } = await db.query(`
    SELECT e.*, t.full_name AS student_name, t.level AS ktv_level,
           c.title AS course_title, c.level AS course_level,
           cn.name AS center_name
    FROM academy_enrollments e
    JOIN technicians t ON t.id=e.student_id
    JOIN academy_courses c ON c.id=e.course_id
    JOIN centers cn ON cn.id=t.center_id
    WHERE ${where.join(' AND ')}
    ORDER BY e.enrolled_at DESC
  `, params);
  res.json(rows);
});

academyRouter.post('/enrollments', authorize('superadmin','admin','manager'), async (req, res) => {
  const { course_id, student_id } = req.body;
  const { rows } = await db.query(`
    INSERT INTO academy_enrollments(course_id, student_id)
    VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *
  `,[course_id, student_id]);
  res.status(201).json(rows[0] || { message: 'Already enrolled' });
});

academyRouter.patch('/enrollments/:id/progress', async (req, res) => {
  const { progress, score, passed } = req.body;
  const { rows } = await db.query(`
    UPDATE academy_enrollments
    SET progress=$1, score=$2, passed=$3,
        completed_at=CASE WHEN $1=100 THEN NOW() ELSE completed_at END
    WHERE id=$4 RETURNING *
  `,[progress||0, score||null, passed||false, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });

  // Level up technician if passed L1→L2 etc
  if (passed) {
    const course = await db.query('SELECT level FROM academy_courses WHERE id=(SELECT course_id FROM academy_enrollments WHERE id=$1)', [req.params.id]);
    const ktv   = await db.query('SELECT level FROM technicians WHERE id=$1', [rows[0].student_id]);
    const levels = ['L1','L2','L3','L4'];
    const nextIdx = levels.indexOf(course.rows[0]?.level) + 1;
    if (nextIdx > 0 && nextIdx < levels.length && ktv.rows[0]?.level === course.rows[0]?.level) {
      await db.query('UPDATE technicians SET level=$1 WHERE id=$2', [levels[nextIdx], rows[0].student_id]);
    }
  }
  res.json(rows[0]);
});

module.exports.academyRouter = academyRouter;

// ════════════════════════════════════════════════════
// REVENUE
// ════════════════════════════════════════════════════
const revenueRouter = Router();
revenueRouter.use(authenticate, authorize('superadmin','admin'));

revenueRouter.get('/summary', async (req, res) => {
  const { year } = req.query;
  const y = year || new Date().getFullYear();
  const { rows } = await db.query(`
    SELECT
      TO_CHAR(booked_at,'YYYY-MM') AS month,
      COALESCE(SUM(final_price) FILTER (WHERE status='completed'),0) AS services,
      0::bigint AS products,
      0::bigint AS franchise
    FROM bookings
    WHERE EXTRACT(YEAR FROM booked_at)=$1
    GROUP BY month ORDER BY month
  `, [y]);

  // Merge product revenue from orders
  const prod = await db.query(`
    SELECT TO_CHAR(created_at,'YYYY-MM') AS month, COALESCE(SUM(total),0) AS products
    FROM orders WHERE status='delivered' AND EXTRACT(YEAR FROM created_at)=$1
    GROUP BY month
  `, [y]);

  const merged = rows.map(r => {
    const p = prod.rows.find(p => p.month === r.month);
    return { ...r, products: p ? Number(p.products) : 0,
      total: Number(r.services) + (p ? Number(p.products) : 0) };
  });
  res.json(merged);
});

revenueRouter.get('/by-center', async (req, res) => {
  const { period } = req.query;
  const where = period ? "AND TO_CHAR(b.booked_at,'YYYY-MM')=$1" : '';
  const { rows } = await db.query(`
    SELECT c.code, c.name, c.city, c.type,
           COALESCE(SUM(b.final_price),0) AS service_rev,
           COUNT(b.id) AS sessions
    FROM centers c
    LEFT JOIN bookings b ON b.center_id=c.id AND b.status='completed' ${where}
    GROUP BY c.id ORDER BY service_rev DESC
  `, period ? [period] : []);
  res.json(rows);
});

revenueRouter.get('/arr-forecast', async (req, res) => {
  // Pre-baked ARR forecast data (from business plan)
  const forecast = [
    { year:'Q2/2026', arr_low:2000000,  arr_high:3000000,  centers:8,   currency:'USD' },
    { year:'2027',    arr_low:8000000,  arr_high:14000000, centers:35,  currency:'USD' },
    { year:'2028',    arr_low:30000000, arr_high:52000000, centers:80,  currency:'USD' },
    { year:'2029',    arr_low:75000000, arr_high:130000000,centers:140, currency:'USD' },
    { year:'2030',    arr_low:160000000,arr_high:280000000,centers:220, currency:'USD' },
    { year:'2031',    arr_low:300000000,arr_high:420000000,centers:300, currency:'USD' },
  ];
  res.json(forecast);
});

module.exports.revenueRouter = revenueRouter;

// ════════════════════════════════════════════════════
// BLOG / CMS
// ════════════════════════════════════════════════════
const blogRouter = Router();
blogRouter.use(authenticate);

blogRouter.get('/', async (req, res) => {
  const { published, category, search } = req.query;
  const page = Math.max(1, Number(req.query.page)||1);
  const limit = Math.min(50, Number(req.query.limit)||20);
  let where=['1=1'], params=[], i=1;
  if (published !== undefined) { where.push(`is_published=$${i++}`); params.push(published==='true'); }
  if (category)  { where.push(`category=$${i++}`); params.push(category); }
  if (search)    { where.push(`(title_vi ILIKE $${i} OR title_en ILIKE $${i})`); params.push(`%${search}%`); i++; }
  const wStr = where.join(' AND ');
  const [data, count] = await Promise.all([
    db.query(`
      SELECT p.id, p.slug, p.title_vi, p.title_en, p.cover_url, p.category,
             p.tags, p.views, p.is_published, p.published_at, p.created_at,
             u.full_name AS author
      FROM blog_posts p LEFT JOIN users u ON u.id=p.author_id
      WHERE ${wStr} ORDER BY p.created_at DESC
      LIMIT $${i} OFFSET $${i+1}
    `, [...params, limit, (page-1)*limit]),
    db.query(`SELECT COUNT(*) FROM blog_posts WHERE ${wStr}`, params)
  ]);
  res.json({ data: data.rows, total: Number(count.rows[0].count), page, limit });
});

blogRouter.get('/:id', async (req, res) => {
  const { rows } = await db.query(`
    SELECT p.*, u.full_name AS author
    FROM blog_posts p LEFT JOIN users u ON u.id=p.author_id
    WHERE p.id=$1 OR p.slug=$1
  `, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

blogRouter.post('/', async (req, res) => {
  const { slug,title_vi,title_en,content_vi,content_en,excerpt_vi,excerpt_en,
          cover_url,tags,category } = req.body;
  const { rows } = await db.query(`
    INSERT INTO blog_posts(slug,title_vi,title_en,content_vi,content_en,
      excerpt_vi,excerpt_en,cover_url,tags,category,author_id)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
  `,[slug,title_vi,title_en||null,content_vi||null,content_en||null,
     excerpt_vi||null,excerpt_en||null,cover_url||null,tags||[],category||null,req.user.id]);
  res.status(201).json(rows[0]);
});

blogRouter.put('/:id', async (req, res) => {
  const f = req.body;
  const { rows } = await db.query(`
    UPDATE blog_posts SET title_vi=$1,title_en=$2,content_vi=$3,content_en=$4,
      excerpt_vi=$5,excerpt_en=$6,cover_url=$7,tags=$8,category=$9
    WHERE id=$10 RETURNING *
  `,[f.title_vi,f.title_en||null,f.content_vi||null,f.content_en||null,
     f.excerpt_vi||null,f.excerpt_en||null,f.cover_url||null,f.tags||[],f.category||null,req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

blogRouter.patch('/:id/publish', async (req, res) => {
  const { publish } = req.body;
  const { rows } = await db.query(`
    UPDATE blog_posts SET is_published=$1, published_at=CASE WHEN $1=true THEN NOW() ELSE NULL END
    WHERE id=$2 RETURNING id, slug, title_vi, is_published, published_at
  `,[!!publish, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

blogRouter.delete('/:id', authorize('superadmin','admin'), async (req, res) => {
  await db.query('DELETE FROM blog_posts WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports.blogRouter = blogRouter;

// ════════════════════════════════════════════════════
// USERS (admin manage)
// ════════════════════════════════════════════════════
const usersRouter = Router();
usersRouter.use(authenticate, authorize('superadmin','admin'));
const bcrypt = require('bcrypt');

usersRouter.get('/', async (req, res) => {
  const { rows } = await db.query(`
    SELECT u.id,u.email,u.full_name,u.staff_code,u.role,u.is_active,u.last_login,u.created_at,
           c.name AS center_name
    FROM users u LEFT JOIN centers c ON c.id=u.center_id
    ORDER BY u.created_at DESC
  `);
  res.json(rows);
});

usersRouter.post('/', async (req, res) => {
  const { email, password, full_name, role, center_id, staff_code } = req.body;
  if (!email||!password||!full_name) return res.status(400).json({ error: 'email/password/full_name required' });
  const hashed = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS)||12);
  const { rows } = await db.query(`
    INSERT INTO users(email,password,full_name,role,center_id,staff_code)
    VALUES($1,$2,$3,$4,$5,$6) RETURNING id,email,full_name,staff_code,role,center_id
  `,[email, hashed, full_name, role||'staff', center_id||null, staff_code ? staff_code.trim().toUpperCase() : null]);
  await logAudit(req.user.id,'create','users',rows[0].id,null,rows[0],req);
  res.status(201).json(rows[0]);
});

usersRouter.patch('/:id', async (req, res) => {
  const { full_name, role, center_id, is_active, staff_code } = req.body;
  const { rows } = await db.query(`
    UPDATE users SET full_name=COALESCE($1,full_name), role=COALESCE($2,role),
      center_id=COALESCE($3,center_id), is_active=COALESCE($4,is_active),
      staff_code=COALESCE($5,staff_code)
    WHERE id=$6 RETURNING id,email,full_name,staff_code,role,is_active
  `,[full_name||null, role||null, center_id||null, is_active??null,
     staff_code ? staff_code.trim().toUpperCase() : null, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

module.exports.usersRouter = usersRouter;

// ════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════
const analyticsRouter = Router();
analyticsRouter.use(authenticate, authorize('superadmin','admin','manager'));

analyticsRouter.get('/funnel', async (req, res) => {
  const { period } = req.query; // 'YYYY-MM'
  const where = period ? `AND TO_CHAR(booked_at,'YYYY-MM')=$1` : '';
  const params = period ? [period] : [];

  const { rows: bk } = await db.query(`
    SELECT
      COUNT(*) AS total_bookings,
      COUNT(*) FILTER (WHERE status != 'cancelled' AND status != 'no_show') AS confirmed,
      COUNT(*) FILTER (WHERE status = 'completed') AS completed,
      COALESCE(SUM(final_price) FILTER (WHERE status='completed'),0) AS revenue
    FROM bookings WHERE 1=1 ${where}
  `, params);

  const { rows: cu } = await db.query(`
    SELECT COUNT(*) AS new_customers
    FROM customers
    WHERE is_active=true ${period ? `AND TO_CHAR(created_at,'YYYY-MM')=$1` : ''}
  `, params);

  res.json({
    new_customers:   Number(cu.rows[0].new_customers),
    total_bookings:  Number(bk.rows[0].total_bookings),
    confirmed:       Number(bk.rows[0].confirmed),
    completed:       Number(bk.rows[0].completed),
    revenue:         Number(bk.rows[0].revenue),
    conversion_rate: bk.rows[0].total_bookings > 0
      ? ((bk.rows[0].completed / bk.rows[0].total_bookings)*100).toFixed(1)
      : 0
  });
});

analyticsRouter.get('/retention', async (req, res) => {
  // Monthly customer return rate last 6 months
  const { rows } = await db.query(`
    WITH monthly AS (
      SELECT customer_id, TO_CHAR(booked_at,'YYYY-MM') AS month, COUNT(*) AS visits
      FROM bookings WHERE status='completed' AND booked_at >= NOW()-INTERVAL '7 months'
      GROUP BY customer_id, month
    ),
    returning AS (
      SELECT m.month, COUNT(DISTINCT m.customer_id) AS returning_customers
      FROM monthly m
      WHERE EXISTS (
        SELECT 1 FROM monthly m2
        WHERE m2.customer_id=m.customer_id AND m2.month < m.month
      )
      GROUP BY m.month
    ),
    total AS (
      SELECT month, COUNT(DISTINCT customer_id) AS total_customers
      FROM monthly GROUP BY month
    )
    SELECT t.month, t.total_customers,
           COALESCE(r.returning_customers,0) AS returning_customers,
           COALESCE(ROUND(r.returning_customers::numeric/t.total_customers*100,1),0) AS retention_pct
    FROM total t LEFT JOIN returning r ON r.month=t.month
    ORDER BY t.month LIMIT 6
  `);
  res.json(rows);
});

analyticsRouter.get('/top-services', async (req, res) => {
  const { rows } = await db.query(`
    SELECT s.name, s.category,
           COUNT(b.id) AS bookings,
           COALESCE(SUM(b.final_price),0) AS revenue,
           ROUND(AVG(b.final_price)) AS avg_price
    FROM services s
    LEFT JOIN bookings b ON b.service_id=s.id AND b.status='completed'
      AND b.booked_at >= NOW()-INTERVAL '30 days'
    GROUP BY s.id ORDER BY bookings DESC
  `);
  res.json(rows);
});

module.exports.analyticsRouter = analyticsRouter;
