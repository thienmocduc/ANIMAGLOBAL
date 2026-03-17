'use strict';
const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const crypto  = require('crypto');
const db      = require('../db/pool');
const mailer  = require('../utils/mailer');
const { authenticate, logAudit } = require('../middleware/auth');

const EXPIRES_IN         = process.env.JWT_EXPIRES_IN         || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

function signAccess(userId, role) {
  return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, { expiresIn: EXPIRES_IN });
}

function signRefresh(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

// ─── POST /auth/login ────────────────────────────────────
// Supports login by email+password OR staff_code+password
router.post('/login', async (req, res) => {
  const { email, password, staff_code } = req.body;

  // Must provide password + either email or staff_code
  if (!password || (!email && !staff_code)) {
    return res.status(400).json({ error: 'Password and either email or staff_code required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  let user;
  if (staff_code) {
    // Login by Admin ID / Staff Code
    const { rows } = await db.query(
      'SELECT * FROM users WHERE staff_code=$1 AND is_active=true', [staff_code.trim().toUpperCase()]
    );
    user = rows[0];
  } else {
    // Login by email
    const normalizedEmail = email.trim().toLowerCase();
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email=$1 AND is_active=true', [normalizedEmail]
    );
    user = rows[0];
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken  = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id);

  // Store refresh token
  await db.query(
    `INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES($1,$2,$3)`,
    [user.id, refreshToken, new Date(Date.now() + REFRESH_EXPIRES_MS)]
  );

  // Update last_login
  await db.query('UPDATE users SET last_login=NOW() WHERE id=$1', [user.id]);

  await logAudit(user.id, 'login', 'users', user.id, null, null, req);

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: EXPIRES_IN,
    user: {
      id:         user.id,
      email:      user.email,
      full_name:  user.full_name,
      role:       user.role,
      center_id:  user.center_id,
      avatar_url: user.avatar_url,
      staff_code: user.staff_code
    }
  });
});

// ─── POST /auth/refresh ──────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  let payload;
  try {
    payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const { rows } = await db.query(
    'SELECT * FROM refresh_tokens WHERE token=$1 AND expires_at > NOW()',
    [refresh_token]
  );
  if (!rows[0]) return res.status(401).json({ error: 'Refresh token expired or revoked' });

  const userRes = await db.query(
    'SELECT id,role FROM users WHERE id=$1 AND is_active=true', [payload.sub]
  );
  if (!userRes.rows[0]) return res.status(401).json({ error: 'User not found' });

  const user = userRes.rows[0];

  // Rotate refresh token
  await db.query('DELETE FROM refresh_tokens WHERE token=$1', [refresh_token]);
  const newRefresh = signRefresh(user.id);
  await db.query(
    `INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES($1,$2,$3)`,
    [user.id, newRefresh, new Date(Date.now() + REFRESH_EXPIRES_MS)]
  );

  res.json({
    access_token:  signAccess(user.id, user.role),
    refresh_token: newRefresh
  });
});

// ─── POST /auth/logout ───────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) {
    await db.query('DELETE FROM refresh_tokens WHERE token=$1', [refresh_token]);
  }
  await logAudit(req.user.id, 'logout', 'users', req.user.id, null, null, req);
  res.json({ message: 'Logged out successfully' });
});

// ─── POST /auth/change-password ──────────────────────────
router.post('/change-password', authenticate, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 8 })
    .matches(/[A-Z]/).withMessage('Need uppercase')
    .matches(/[0-9]/).withMessage('Need number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { current_password, new_password } = req.body;
  const { rows } = await db.query('SELECT password FROM users WHERE id=$1', [req.user.id]);

  if (!(await bcrypt.compare(current_password, rows[0].password))) {
    return res.status(400).json({ error: 'Current password incorrect' });
  }

  const hashed = await bcrypt.hash(new_password, Number(process.env.BCRYPT_ROUNDS) || 12);
  await db.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, req.user.id]);

  // Revoke all refresh tokens
  await db.query('DELETE FROM refresh_tokens WHERE user_id=$1', [req.user.id]);
  await logAudit(req.user.id, 'change_password', 'users', req.user.id, null, null, req);

  res.json({ message: 'Password changed. Please log in again.' });
});

// ─── GET /auth/me ────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id,u.email,u.full_name,u.role,u.center_id,u.avatar_url,u.last_login,
            c.name AS center_name
     FROM users u
     LEFT JOIN centers c ON c.id=u.center_id
     WHERE u.id=$1`,
    [req.user.id]
  );
  res.json(rows[0]);
});

// ─── POST /auth/request-otp ──────────────────────────────
// Step 1 of admin login: verify staff_code + password, then send OTP to registered email
const OTP_EXPIRES_MINUTES = 5;
const OTP_RATE_LIMIT = 5; // max OTP requests per hour

router.post('/request-otp', async (req, res) => {
  const { staff_code, password } = req.body;

  if (!staff_code || !password) {
    return res.status(400).json({ error: 'staff_code and password required' });
  }

  // Find user by staff_code
  const { rows } = await db.query(
    'SELECT * FROM users WHERE staff_code=$1 AND is_active=true',
    [staff_code.trim().toUpperCase()]
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check only admin+ roles can use admin portal
  if (!['superadmin', 'admin', 'manager'].includes(user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions for admin portal' });
  }

  // Rate limit: max N OTP requests per hour
  const { rows: recentOtps } = await db.query(
    `SELECT COUNT(*) as cnt FROM otp_codes
     WHERE user_id=$1 AND purpose='admin_login' AND created_at > NOW() - INTERVAL '1 hour'`,
    [user.id]
  );
  if (parseInt(recentOtps[0].cnt) >= OTP_RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many OTP requests. Please wait before trying again.' });
  }

  // Invalidate previous OTPs
  await db.query(
    `DELETE FROM otp_codes WHERE user_id=$1 AND purpose='admin_login' AND verified_at IS NULL`,
    [user.id]
  );

  // Generate 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  await db.query(
    `INSERT INTO otp_codes(user_id, code, email, purpose, expires_at)
     VALUES($1, $2, $3, 'admin_login', $4)`,
    [user.id, code, user.email, expiresAt]
  );

  // Send OTP email
  try {
    await mailer.sendOtp(user, code, OTP_EXPIRES_MINUTES);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
  }

  // Mask email for response
  const emailParts = user.email.split('@');
  const maskedEmail = emailParts[0].substring(0, 3) + '***@' + emailParts[1];

  await logAudit(user.id, 'otp_requested', 'users', user.id, null, null, req);

  res.json({
    message: 'OTP sent successfully',
    email: maskedEmail,
    expires_in: OTP_EXPIRES_MINUTES * 60,
    user_id: user.id
  });
});

// ─── POST /auth/verify-otp ──────────────────────────────
// Step 2 of admin login: verify OTP code, issue tokens
router.post('/verify-otp', async (req, res) => {
  const { user_id, code } = req.body;

  if (!user_id || !code) {
    return res.status(400).json({ error: 'user_id and code required' });
  }

  // Find the latest unexpired, unverified OTP
  const { rows } = await db.query(
    `SELECT * FROM otp_codes
     WHERE user_id=$1 AND purpose='admin_login' AND verified_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [user_id]
  );
  const otpRecord = rows[0];

  if (!otpRecord) {
    return res.status(401).json({ error: 'OTP expired or not found. Please request a new code.' });
  }

  // Check max attempts
  if (otpRecord.attempts >= otpRecord.max_attempts) {
    await db.query('DELETE FROM otp_codes WHERE id=$1', [otpRecord.id]);
    return res.status(401).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  // Verify code
  if (otpRecord.code !== code.trim()) {
    await db.query(
      'UPDATE otp_codes SET attempts = attempts + 1 WHERE id=$1',
      [otpRecord.id]
    );
    const remaining = otpRecord.max_attempts - otpRecord.attempts - 1;
    return res.status(401).json({
      error: `Invalid OTP code. ${remaining} attempt(s) remaining.`,
      attempts_remaining: remaining
    });
  }

  // Mark OTP as verified
  await db.query(
    'UPDATE otp_codes SET verified_at=NOW() WHERE id=$1',
    [otpRecord.id]
  );

  // Get user and issue tokens
  const userRes = await db.query(
    'SELECT * FROM users WHERE id=$1 AND is_active=true',
    [user_id]
  );
  const user = userRes.rows[0];
  if (!user) return res.status(401).json({ error: 'User not found' });

  const accessToken  = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id);

  await db.query(
    `INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES($1,$2,$3)`,
    [user.id, refreshToken, new Date(Date.now() + REFRESH_EXPIRES_MS)]
  );
  await db.query('UPDATE users SET last_login=NOW() WHERE id=$1', [user.id]);
  await logAudit(user.id, 'admin_login_otp', 'users', user.id, null, null, req);

  res.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: EXPIRES_IN,
    user: {
      id:         user.id,
      email:      user.email,
      full_name:  user.full_name,
      role:       user.role,
      center_id:  user.center_id,
      avatar_url: user.avatar_url,
      staff_code: user.staff_code
    }
  });
});

module.exports = router;
