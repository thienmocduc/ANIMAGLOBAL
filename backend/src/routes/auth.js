'use strict';
const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const db      = require('../db/pool');
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
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email=$1 AND is_active=true', [email]
  );
  const user = rows[0];

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
      id:        user.id,
      email:     user.email,
      full_name: user.full_name,
      role:      user.role,
      center_id: user.center_id,
      avatar_url: user.avatar_url
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

module.exports = router;
