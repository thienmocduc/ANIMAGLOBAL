// ═══════════════════════════════════════════════════════
// ANIMA CARE — SETUP TABLES (Affiliate + Inventory)
// Run this file with Node.js: node setup-tables.js
// Or paste contents into browser console
// ═══════════════════════════════════════════════════════

(function(){
'use strict';

var SUPABASE_URL = 'https://pvhfzqopcorzaoghbywo.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGZ6cW9wY29yemFvZ2hieXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjIyNDksImV4cCI6MjA4NzY5ODI0OX0.rv1CJizk4GpFjOw7I5ifipyEYv2TMSGeQbdf358PjBU';

var SQL_STATEMENTS = [
  // Affiliate Programs
  "CREATE TABLE IF NOT EXISTS affiliate_programs (" +
  "  id UUID PRIMARY KEY DEFAULT gen_random_uuid()," +
  "  name TEXT NOT NULL," +
  "  code TEXT UNIQUE NOT NULL," +
  "  commission_rate DECIMAL(5,2) DEFAULT 0.10," +
  "  type TEXT DEFAULT 'user'," +
  "  status TEXT DEFAULT 'active'," +
  "  total_members INT DEFAULT 0," +
  "  total_revenue BIGINT DEFAULT 0," +
  "  created_at TIMESTAMPTZ DEFAULT NOW()" +
  ");",

  // Affiliate Members
  "CREATE TABLE IF NOT EXISTS affiliate_members (" +
  "  id UUID PRIMARY KEY DEFAULT gen_random_uuid()," +
  "  program_id UUID REFERENCES affiliate_programs(id)," +
  "  user_id TEXT NOT NULL," +
  "  user_name TEXT," +
  "  user_phone TEXT," +
  "  referral_code TEXT," +
  "  total_referrals INT DEFAULT 0," +
  "  total_commission BIGINT DEFAULT 0," +
  "  status TEXT DEFAULT 'active'," +
  "  created_at TIMESTAMPTZ DEFAULT NOW()" +
  ");",

  // Affiliate Transactions
  "CREATE TABLE IF NOT EXISTS affiliate_transactions (" +
  "  id UUID PRIMARY KEY DEFAULT gen_random_uuid()," +
  "  member_id UUID REFERENCES affiliate_members(id)," +
  "  order_id TEXT," +
  "  order_amount BIGINT DEFAULT 0," +
  "  commission_amount BIGINT DEFAULT 0," +
  "  commission_rate DECIMAL(5,2)," +
  "  status TEXT DEFAULT 'pending'," +
  "  released_at TIMESTAMPTZ," +
  "  created_at TIMESTAMPTZ DEFAULT NOW()" +
  ");",

  // Inventory
  "CREATE TABLE IF NOT EXISTS inventory (" +
  "  id UUID PRIMARY KEY DEFAULT gen_random_uuid()," +
  "  center_id TEXT NOT NULL," +
  "  sku TEXT NOT NULL," +
  "  product_name TEXT," +
  "  category TEXT DEFAULT 'anima119'," +
  "  stock INT DEFAULT 0," +
  "  min_stock INT DEFAULT 5," +
  "  price BIGINT DEFAULT 0," +
  "  updated_at TIMESTAMPTZ DEFAULT NOW()," +
  "  UNIQUE(center_id, sku)" +
  ");",

  // Inventory Transactions
  "CREATE TABLE IF NOT EXISTS inventory_transactions (" +
  "  id UUID PRIMARY KEY DEFAULT gen_random_uuid()," +
  "  center_id TEXT NOT NULL," +
  "  sku TEXT NOT NULL," +
  "  type TEXT DEFAULT 'in'," +
  "  quantity INT DEFAULT 0," +
  "  note TEXT," +
  "  created_at TIMESTAMPTZ DEFAULT NOW()" +
  ");",

  // Enable RLS with open policy for all new tables
  "ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;",
  "CREATE POLICY \"anon_all\" ON affiliate_programs FOR ALL USING (true) WITH CHECK (true);",
  "ALTER TABLE affiliate_members ENABLE ROW LEVEL SECURITY;",
  "CREATE POLICY \"anon_all\" ON affiliate_members FOR ALL USING (true) WITH CHECK (true);",
  "ALTER TABLE affiliate_transactions ENABLE ROW LEVEL SECURITY;",
  "CREATE POLICY \"anon_all\" ON affiliate_transactions FOR ALL USING (true) WITH CHECK (true);",
  "ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;",
  "CREATE POLICY \"anon_all\" ON inventory FOR ALL USING (true) WITH CHECK (true);",
  "ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;",
  "CREATE POLICY \"anon_all\" ON inventory_transactions FOR ALL USING (true) WITH CHECK (true);"
];

function executeSql(sql) {
  return fetch(SUPABASE_URL + '/rest/v1/rpc', {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  }).then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error(t); });
    return r.text();
  });
}

// Alternative: use the SQL endpoint via pg-meta or direct SQL execution
function executeSqlViaRest(sql) {
  return fetch(SUPABASE_URL + '/rest/v1/rpc/exec_sql', {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql: sql })
  }).then(function(r) {
    if (r.ok) return r.text();
    // If exec_sql RPC doesn't exist, try alternative approach
    return r.text().then(function(t) { throw new Error(t); });
  });
}

// Combined SQL for single execution (recommended for Supabase SQL Editor)
var COMBINED_SQL = SQL_STATEMENTS.join('\n');

// Run all statements sequentially
function runSetup() {
  console.log('════════════════════════════════════════');
  console.log('AnimaCare — Table Setup Starting...');
  console.log('════════════════════════════════════════');
  console.log('');
  console.log('Tables to create:');
  console.log('  1. affiliate_programs');
  console.log('  2. affiliate_members');
  console.log('  3. affiliate_transactions');
  console.log('  4. inventory');
  console.log('  5. inventory_transactions');
  console.log('');

  var idx = 0;
  var errors = [];

  function runNext() {
    if (idx >= SQL_STATEMENTS.length) {
      console.log('');
      console.log('════════════════════════════════════════');
      if (errors.length === 0) {
        console.log('All statements executed successfully!');
      } else {
        console.log('Completed with ' + errors.length + ' error(s):');
        errors.forEach(function(e) { console.warn('  - ' + e); });
        console.log('');
        console.log('NOTE: "already exists" errors are safe to ignore.');
        console.log('If RPC endpoint errors occur, run the SQL directly');
        console.log('in Supabase Dashboard > SQL Editor.');
      }
      console.log('════════════════════════════════════════');
      return;
    }

    var sql = SQL_STATEMENTS[idx];
    var label = sql.substring(0, 60).replace(/\s+/g, ' ') + '...';
    console.log('[' + (idx + 1) + '/' + SQL_STATEMENTS.length + '] ' + label);

    executeSqlViaRest(sql)
      .then(function() {
        console.log('  ✓ OK');
        idx++;
        runNext();
      })
      .catch(function(err) {
        var msg = err.message || String(err);
        if (msg.indexOf('already exists') > -1) {
          console.log('  ✓ Already exists (OK)');
        } else {
          console.warn('  ✗ Error: ' + msg);
          errors.push(label + ' => ' + msg);
        }
        idx++;
        runNext();
      });
  }

  runNext();
}

// Export for different environments
if (typeof window !== 'undefined') {
  // Browser environment
  window.AnimaSetupTables = {
    run: runSetup,
    sql: COMBINED_SQL,
    statements: SQL_STATEMENTS,
    // Convenience: copy full SQL to clipboard
    copySQL: function() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(COMBINED_SQL).then(function() {
          console.log('SQL copied to clipboard! Paste in Supabase SQL Editor.');
        });
      } else {
        console.log('Clipboard not available. Full SQL:');
        console.log(COMBINED_SQL);
      }
    }
  };
  console.log('[AnimaSetupTables] Loaded. Use:');
  console.log('  AnimaSetupTables.run()     — Execute via REST API');
  console.log('  AnimaSetupTables.copySQL() — Copy SQL to clipboard');
  console.log('  AnimaSetupTables.sql       — Get full SQL string');
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { run: runSetup, sql: COMBINED_SQL, statements: SQL_STATEMENTS };
  console.log('[AnimaSetupTables] Full SQL for Supabase SQL Editor:');
  console.log('');
  console.log(COMBINED_SQL);
  console.log('');
  console.log('Copy the above SQL and run it in Supabase Dashboard > SQL Editor');
}

})();
