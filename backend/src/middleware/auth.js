'use strict';
const jwt    = require('jsonwebtoken');
const db     = require('../db/pool');
const logger = require('../utils/logger');

// ─── Verify access token ─────────────────────────────────
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user from DB (fresh role/status check)
    const { rows } = await db.query(
      'SELECT id,email,full_name,role,center_id,is_active FROM users WHERE id=$1',
      [payload.sub]
    );
    if (!rows[0] || !rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── Role-based access control ──────────────────────────
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn(`RBAC deny: user ${req.user.email} role=${req.user.role} required=${roles}`);
      return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
  };
}

// ─── Center-scoped access ────────────────────────────────
// Managers/staff can only see their own center's data
function centerScope(req, res, next) {
  const { role, center_id } = req.user;
  if (['superadmin','admin'].includes(role)) {
    // Can see all centers, or filter by query param
    req.scopedCenterId = req.query.center_id || null;
  } else {
    // Force scope to own center
    req.scopedCenterId = center_id;
  }
  next();
}

// ─── Audit log helper ────────────────────────────────────
async function logAudit(userId, action, entity, entityId, oldData, newData, req) {
  try {
    await db.query(
      `INSERT INTO audit_log(user_id,action,entity,entity_id,old_data,new_data,ip,ua)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
      [userId, action, entity, entityId,
       oldData ? JSON.stringify(oldData) : null,
       newData ? JSON.stringify(newData) : null,
       req?.ip, req?.headers?.['user-agent']]
    );
  } catch (err) {
    logger.error('Audit log failed:', err.message);
  }
}

module.exports = { authenticate, authorize, centerScope, logAudit };
