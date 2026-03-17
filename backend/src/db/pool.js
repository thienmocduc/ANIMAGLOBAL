'use strict';
const { Pool } = require('pg');
const logger   = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

pool.on('connect', () => logger.debug('DB pool: new connection'));
pool.on('error',  (err) => logger.error('DB pool error:', err));

// Helper: run query with optional client (for transactions)
async function query(text, params, client) {
  const runner = client || pool;
  const start  = Date.now();
  const res    = await runner.query(text, params);
  const ms     = Date.now() - start;
  if (ms > 1000) logger.warn(`Slow query (${ms}ms): ${text.slice(0,80)}`);
  return res;
}

// Helper: get a client for transactions
async function getClient() {
  return pool.connect();
}

// Helper: run a transaction
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { query, getClient, withTransaction, pool };
