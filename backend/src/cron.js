'use strict';
/**
 * AnimaCare — Scheduled Jobs
 * Install: npm install node-cron
 * Start alongside server or as separate process
 */
require('dotenv').config();
const cron   = require('node-cron');
const db     = require('./db/pool');
const mailer = require('./utils/mailer');
const logger = require('./utils/logger');

logger.info('🕐 AnimaCare Cron Jobs starting...');

// ── JOB 1: Daily report — 23:55 every day ────────────────
cron.schedule('55 23 * * *', async () => {
  logger.info('[cron] Running daily report...');
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [bk, cu, ord, ai, stock] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status='completed') AS completed,
          COALESCE(SUM(final_price) FILTER (WHERE status='completed'),0) AS revenue
        FROM bookings WHERE DATE(booked_at)=$1
      `, [today]),
      db.query(`SELECT COUNT(*) AS cnt FROM customers WHERE DATE(created_at)=$1`, [today]),
      db.query(`SELECT COUNT(*) AS cnt FROM orders    WHERE DATE(created_at)=$1`, [today]),
      db.query(`SELECT COUNT(*) AS cnt FROM ai_sessions WHERE DATE(created_at)=$1`, [today]),
      db.query(`SELECT COUNT(*) AS cnt FROM inventory WHERE alert IN ('out','critical')`),
    ]);

    const alerts = [];
    if (Number(stock.rows[0].cnt) > 0) alerts.push(`${stock.rows[0].cnt} SKU tồn kho nguy hiểm`);
    if (Number(bk.rows[0].total) === 0) alerts.push('Không có lịch hẹn hôm nay');

    await mailer.dailyReport({
      bookings_total:     Number(bk.rows[0].total),
      bookings_completed: Number(bk.rows[0].completed),
      service_revenue:    Number(bk.rows[0].revenue),
      new_customers:      Number(cu.rows[0].cnt),
      new_orders:         Number(ord.rows[0].cnt),
      ai_sessions:        Number(ai.rows[0].cnt),
      alerts,
    });
    logger.info('[cron] Daily report sent');
  } catch (err) {
    logger.error('[cron] Daily report failed:', err.message);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });

// ── JOB 2: Stock alerts — every 6 hours ──────────────────
cron.schedule('0 */6 * * *', async () => {
  logger.info('[cron] Checking stock levels...');
  try {
    const { rows } = await db.query(`
      SELECT i.id, p.sku, p.name, i.qty, i.alert,
             COALESCE(c.name,'Kho Trung Tâm') AS location
      FROM inventory i
      JOIN products p ON p.id=i.product_id
      LEFT JOIN centers c ON c.id=i.center_id
      WHERE i.alert IN ('out','critical')
      ORDER BY CASE i.alert WHEN 'out' THEN 0 ELSE 1 END
    `);

    if (rows.length > 0) {
      await mailer.stockAlert(rows);
      logger.info(`[cron] Stock alert sent — ${rows.length} critical items`);
    } else {
      logger.info('[cron] Stock OK — no alerts');
    }
  } catch (err) {
    logger.error('[cron] Stock check failed:', err.message);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });

// ── JOB 3: Auto-calculate monthly royalties — 1st of month ─
cron.schedule('0 9 1 * *', async () => {
  logger.info('[cron] Calculating monthly royalties...');
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const period = lastMonth.toISOString().slice(0, 7);

    // Get active franchise partners
    const { rows: partners } = await db.query(`
      SELECT fp.*, c.id AS center_id
      FROM franchise_partners fp
      JOIN centers c ON c.id=fp.center_id
      WHERE fp.status='active' AND fp.center_id IS NOT NULL
    `);

    for (const partner of partners) {
      // Calculate revenue for that partner's center last month
      const rev = await db.query(`
        SELECT COALESCE(SUM(final_price),0) AS total
        FROM bookings
        WHERE center_id=$1 AND status='completed'
        AND TO_CHAR(booked_at,'YYYY-MM')=$2
      `, [partner.center_id, period]);

      const revenue    = Number(rev.rows[0].total);
      const royalty_pct = partner.royalty_rate || 5.0;
      const amount     = Math.round(revenue * royalty_pct / 100);

      if (revenue > 0) {
        await db.query(`
          INSERT INTO franchise_royalties(partner_id,period,revenue,royalty_pct,amount)
          VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING
        `, [partner.id, period, revenue, royalty_pct, amount]);

        // Send invoice email
        if (partner.email) {
          await mailer.royaltyInvoice(partner, { period, revenue, royalty_pct, amount });
        }
      }
    }
    logger.info(`[cron] Royalties calculated for ${partners.length} partners, period ${period}`);
  } catch (err) {
    logger.error('[cron] Royalty calculation failed:', err.message);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });

// ── JOB 4: Auto-confirm bookings after 24h pending ────────
cron.schedule('0 * * * *', async () => {
  try {
    const { rows } = await db.query(`
      UPDATE bookings SET status='confirmed'
      WHERE status='pending'
      AND booked_at > NOW()
      AND created_at < NOW() - INTERVAL '24 hours'
      RETURNING id, code
    `);
    if (rows.length > 0) {
      logger.info(`[cron] Auto-confirmed ${rows.length} bookings`);
    }
  } catch (err) {
    logger.error('[cron] Auto-confirm failed:', err.message);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });

// ── JOB 5: Cleanup expired refresh tokens — daily 2:00 AM ─
cron.schedule('0 2 * * *', async () => {
  try {
    const { rowCount } = await db.query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    if (rowCount > 0) logger.info(`[cron] Cleaned ${rowCount} expired tokens`);
  } catch (err) {
    logger.error('[cron] Token cleanup failed:', err.message);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });

// ── JOB 6: Mark no-show bookings (past & still pending) ───
cron.schedule('*/30 * * * *', async () => {
  try {
    const { rows } = await db.query(`
      UPDATE bookings SET status='no_show'
      WHERE status IN ('pending','confirmed')
      AND booked_at < NOW() - INTERVAL '2 hours'
      RETURNING id, code
    `);
    if (rows.length > 0) {
      logger.info(`[cron] Marked ${rows.length} bookings as no_show`);
    }
  } catch (err) {
    logger.error('[cron] No-show marking failed:', err.message);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });

// ── JOB 7: Archive old audit logs (> 90 days) — weekly ───
cron.schedule('0 3 * * 0', async () => {
  try {
    const { rowCount } = await db.query(
      "DELETE FROM audit_log WHERE created_at < NOW() - INTERVAL '90 days'"
    );
    if (rowCount > 0) logger.info(`[cron] Archived ${rowCount} old audit records`);
  } catch (err) {
    logger.error('[cron] Audit cleanup failed:', err.message);
  }
}, { timezone: 'Asia/Ho_Chi_Minh' });

logger.info('✅ 7 cron jobs scheduled (Asia/Ho_Chi_Minh timezone)');

// Graceful shutdown
process.on('SIGTERM', () => { logger.info('Cron jobs stopping'); process.exit(0); });
process.on('SIGINT',  () => { logger.info('Cron jobs stopping'); process.exit(0); });
