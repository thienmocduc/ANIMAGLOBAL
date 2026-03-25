// ═══════════════════════════════════════════════════════
// ANIMA CARE — SUPABASE CLIENT (CRM + Orders + Contacts)
// ═══════════════════════════════════════════════════════
(function(){
'use strict';

var SUPABASE_URL = 'https://pvhfzqopcorzaoghbywo.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGZ6cW9wY29yemFvZ2hieXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjIyNDksImV4cCI6MjA4NzY5ODI0OX0.rv1CJizk4GpFjOw7I5ifipyEYv2TMSGeQbdf358PjBU';

// ── Supabase REST Helper ──
function sbFetch(table, method, opts) {
  opts = opts || {};
  var url = SUPABASE_URL + '/rest/v1/' + table;
  var headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': method === 'POST' ? 'return=representation' : 'return=representation'
  };
  if (opts.select) url += '?select=' + opts.select;
  if (opts.filter) url += (url.indexOf('?') > -1 ? '&' : '?') + opts.filter;
  if (opts.order) url += (url.indexOf('?') > -1 ? '&' : '?') + 'order=' + opts.order;
  if (opts.limit) url += (url.indexOf('?') > -1 ? '&' : '?') + 'limit=' + opts.limit;
  if (opts.range) headers['Range'] = opts.range;

  var fetchOpts = { method: method || 'GET', headers: headers };
  if (opts.body) fetchOpts.body = JSON.stringify(opts.body);
  return fetch(url, fetchOpts).then(function(r) {
    if (!r.ok) return r.text().then(function(t) { throw new Error(t); });
    var ct = r.headers.get('content-type');
    if (ct && ct.indexOf('json') > -1) return r.json();
    return r.text();
  });
}

// ═══════════════════════════════
// CRM LEADS
// ═══════════════════════════════
window.AnimaCRM = {
  // Get all leads
  getLeads: function(opts) {
    opts = opts || {};
    return sbFetch('crm_leads', 'GET', {
      select: '*',
      order: opts.order || 'created_at.desc',
      limit: opts.limit || 100,
      filter: opts.filter || ''
    });
  },

  // Get single lead
  getLead: function(id) {
    return sbFetch('crm_leads', 'GET', { filter: 'id=eq.' + id, select: '*' })
      .then(function(r) { return r[0]; });
  },

  // Create lead
  createLead: function(data) {
    return sbFetch('crm_leads', 'POST', { body: data })
      .then(function(r) { return r[0]; });
  },

  // Update lead
  updateLead: function(id, data) {
    data.updated_at = new Date().toISOString();
    return sbFetch('crm_leads?id=eq.' + id, 'PATCH', { body: data })
      .then(function(r) { return r[0]; });
  },

  // Delete lead
  deleteLead: function(id) {
    return sbFetch('crm_leads?id=eq.' + id, 'DELETE');
  },

  // Get lead activities
  getActivities: function(leadId) {
    return sbFetch('crm_activities', 'GET', {
      filter: 'lead_id=eq.' + leadId,
      order: 'created_at.desc',
      select: '*'
    });
  },

  // Add activity
  addActivity: function(data) {
    return sbFetch('crm_activities', 'POST', { body: data })
      .then(function(r) { return r[0]; });
  },

  // Get lead stats
  getStats: function() {
    return Promise.all([
      sbFetch('crm_leads', 'GET', { select: 'id,status', limit: 1000 }),
      sbFetch('orders', 'GET', { select: 'id,total_amount,order_status', limit: 1000 }),
      sbFetch('contacts', 'GET', { select: 'id,status', limit: 1000 })
    ]).then(function(results) {
      var leads = results[0] || [];
      var orders = results[1] || [];
      var contacts = results[2] || [];
      return {
        totalLeads: leads.length,
        newLeads: leads.filter(function(l) { return l.status === 'new'; }).length,
        contactedLeads: leads.filter(function(l) { return l.status === 'contacted'; }).length,
        qualifiedLeads: leads.filter(function(l) { return l.status === 'qualified'; }).length,
        wonLeads: leads.filter(function(l) { return l.status === 'won'; }).length,
        lostLeads: leads.filter(function(l) { return l.status === 'lost'; }).length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce(function(s, o) { return s + (o.total_amount || 0); }, 0),
        pendingOrders: orders.filter(function(o) { return o.order_status === 'pending'; }).length,
        totalContacts: contacts.length
      };
    });
  }
};

// ═══════════════════════════════
// ORDERS
// ═══════════════════════════════
window.AnimaOrders = {
  getAll: function(opts) {
    opts = opts || {};
    return sbFetch('orders', 'GET', {
      select: '*',
      order: opts.order || 'created_at.desc',
      limit: opts.limit || 100,
      filter: opts.filter || ''
    });
  },

  create: function(data) {
    return sbFetch('orders', 'POST', { body: data })
      .then(function(r) { return r[0]; });
  },

  update: function(id, data) {
    data.updated_at = new Date().toISOString();
    return sbFetch('orders?id=eq.' + id, 'PATCH', { body: data })
      .then(function(r) { return r[0]; });
  },

  updateStatus: function(id, status) {
    return this.update(id, { order_status: status });
  },

  // Auto-sync localStorage orders to Supabase (runs once on load)
  syncLocal: function() {
    var self = this;
    var local = [];
    try { local = JSON.parse(localStorage.getItem('anima_orders') || '[]'); } catch(e) {}
    if (!local.length) return;
    self.getAll({ limit: 500 }).then(function(db) {
      var existing = (db || []).map(function(o) { return o.order_code; });
      var toSync = local.filter(function(o) { return existing.indexOf(o._id || o.id) === -1; });
      if (!toSync.length) return;
      console.log('[AnimaOrders] Syncing ' + toSync.length + ' local orders to Supabase...');
      toSync.forEach(function(o) {
        var total = o.total || parseInt(String(o.amount || o.price || '0').replace(/[^\d]/g, '')) || 0;
        self.create({
          order_code: o._id || o.id || '',
          customer_name: o.customer || o.name || '',
          customer_phone: o.phone || '',
          customer_email: '',
          address: o.address || '',
          items: JSON.stringify([{ name: o.product || '', qty: o.qty || 1, price: total, sku: o.sku || '' }]),
          total_amount: total,
          payment_method: o.paymentMethod || o.method || 'cod',
          payment_status: 'unpaid',
          order_status: o.status || 'pending',
          center_id: o.centerId || '',
          center_name: o.city || '',
          commission: o.commission || 0,
          notes: o.note || ''
        }).then(function() { console.log('[AnimaOrders] Synced:', o._id || o.id); })
          .catch(function(e) { console.warn('[AnimaOrders] Sync failed:', e); });
      });
    }).catch(function() {});
  }
};

// Auto-sync on page load
setTimeout(function() { if (window.AnimaOrders) AnimaOrders.syncLocal(); }, 3000);

// ═══════════════════════════════
// CONTACTS
// ═══════════════════════════════
window.AnimaContacts = {
  getAll: function(opts) {
    opts = opts || {};
    return sbFetch('contacts', 'GET', {
      select: '*',
      order: 'created_at.desc',
      limit: opts.limit || 100
    });
  },

  create: function(data) {
    return sbFetch('contacts', 'POST', { body: data })
      .then(function(r) { return r[0]; });
  },

  updateStatus: function(id, status) {
    return sbFetch('contacts?id=eq.' + id, 'PATCH', { body: { status: status } });
  }
};

// ═══════════════════════════════
// CHAT LOGS
// ═══════════════════════════════
window.AnimaChats = {
  save: function(data) {
    return sbFetch('chat_logs', 'POST', { body: data })
      .then(function(r) { return r[0]; });
  },

  getAll: function() {
    return sbFetch('chat_logs', 'GET', {
      select: '*',
      order: 'created_at.desc',
      limit: 50
    });
  }
};

// ═══════════════════════════════
// BOOKINGS (Đặt lịch)
// ═══════════════════════════════
window.AnimaBookings = {
  getAll: function(opts) {
    opts = opts || {};
    return sbFetch('bookings', 'GET', {
      select: '*', order: opts.order || 'created_at.desc',
      limit: opts.limit || 100, filter: opts.filter || ''
    });
  },
  create: function(data) {
    return sbFetch('bookings', 'POST', { body: data }).then(function(r) { return r[0]; });
  },
  update: function(id, data) {
    data.updated_at = new Date().toISOString();
    return sbFetch('bookings?id=eq.' + id, 'PATCH', { body: data }).then(function(r) { return r[0]; });
  },
  updateStatus: function(id, status) {
    return this.update(id, { status: status });
  }
};

// ═══════════════════════════════
// WALLETS (Ví KTV/Center)
// ═══════════════════════════════
window.AnimaWallets = {
  get: function(ownerId) {
    return sbFetch('wallets', 'GET', { filter: 'owner_id=eq.' + encodeURIComponent(ownerId), select: '*' })
      .then(function(r) { return r[0] || null; });
  },
  create: function(data) {
    return sbFetch('wallets', 'POST', { body: data }).then(function(r) { return r[0]; });
  },
  getOrCreate: function(ownerId, ownerType, ownerName) {
    var self = this;
    return this.get(ownerId).then(function(w) {
      if (w) return w;
      return self.create({ owner_id: ownerId, owner_type: ownerType || 'ktv', owner_name: ownerName || '' });
    });
  },
  addEarning: function(ownerId, amount, description, refId, refType) {
    var self = this;
    return this.get(ownerId).then(function(w) {
      if (!w) return null;
      var newBalance = (w.balance || 0) + amount;
      var newEarned = (w.total_earned || 0) + amount;
      return Promise.all([
        sbFetch('wallets?id=eq.' + w.id, 'PATCH', { body: { balance: newBalance, total_earned: newEarned, updated_at: new Date().toISOString() } }),
        sbFetch('wallet_transactions', 'POST', { body: { wallet_id: w.id, type: 'earning', amount: amount, description: description || '', reference_id: refId || '', reference_type: refType || '', balance_after: newBalance } })
      ]);
    });
  },
  update: function(id, data) {
    data.updated_at = new Date().toISOString();
    return sbFetch('wallets?id=eq.' + id, 'PATCH', { body: data });
  }
};

// ═══════════════════════════════
// WITHDRAWALS (Rút tiền)
// ═══════════════════════════════
window.AnimaWithdrawals = {
  getAll: function(opts) {
    opts = opts || {};
    return sbFetch('withdrawals', 'GET', { select: '*', order: 'created_at.desc', limit: opts.limit || 50, filter: opts.filter || '' });
  },
  create: function(data) {
    return sbFetch('withdrawals', 'POST', { body: data }).then(function(r) { return r[0]; });
  },
  approve: function(id, adminNote) {
    return sbFetch('withdrawals?id=eq.' + id, 'PATCH', { body: { status: 'approved', admin_note: adminNote || '', processed_at: new Date().toISOString() } });
  },
  reject: function(id, adminNote) {
    return sbFetch('withdrawals?id=eq.' + id, 'PATCH', { body: { status: 'rejected', admin_note: adminNote || '', processed_at: new Date().toISOString() } });
  }
};

// ═══════════════════════════════
// RATINGS (Đánh giá)
// ═══════════════════════════════
window.AnimaRatings = {
  getAll: function(opts) {
    opts = opts || {};
    return sbFetch('ratings', 'GET', { select: '*', order: 'created_at.desc', limit: opts.limit || 100, filter: opts.filter || '' });
  },
  create: function(data) {
    return sbFetch('ratings', 'POST', { body: data }).then(function(r) { return r[0]; });
  },
  getAverage: function(ratedId) {
    return sbFetch('ratings', 'GET', { filter: 'rated_id=eq.' + encodeURIComponent(ratedId), select: 'stars' })
      .then(function(r) {
        if (!r || !r.length) return { avg: 0, count: 0 };
        var sum = r.reduce(function(s, x) { return s + x.stars; }, 0);
        return { avg: Math.round(sum / r.length * 10) / 10, count: r.length };
      });
  }
};

// ═══════════════════════════════
// KYC (Xác minh KTV)
// ═══════════════════════════════
window.AnimaKYC = {
  getAll: function(opts) {
    opts = opts || {};
    return sbFetch('kyc_requests', 'GET', { select: '*', order: 'created_at.desc', limit: opts.limit || 50, filter: opts.filter || '' });
  },
  create: function(data) {
    return sbFetch('kyc_requests', 'POST', { body: data }).then(function(r) { return r[0]; });
  },
  approve: function(id, note) {
    return sbFetch('kyc_requests?id=eq.' + id, 'PATCH', { body: { status: 'approved', admin_note: note || '', reviewed_at: new Date().toISOString() } });
  },
  reject: function(id, note) {
    return sbFetch('kyc_requests?id=eq.' + id, 'PATCH', { body: { status: 'rejected', admin_note: note || '', reviewed_at: new Date().toISOString() } });
  }
};

// ═══════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════
window.AnimaNotifs = {
  getAll: function(userId, userType) {
    return sbFetch('notifications', 'GET', {
      filter: 'user_id=eq.' + encodeURIComponent(userId) + '&user_type=eq.' + (userType || 'customer'),
      order: 'created_at.desc', limit: 50, select: '*'
    });
  },
  create: function(data) {
    return sbFetch('notifications', 'POST', { body: data }).then(function(r) { return r[0]; });
  },
  markRead: function(id) {
    return sbFetch('notifications?id=eq.' + id, 'PATCH', { body: { read: true } });
  },
  markAllRead: function(userId, userType) {
    return sbFetch('notifications?user_id=eq.' + encodeURIComponent(userId) + '&user_type=eq.' + (userType || 'customer') + '&read=eq.false', 'PATCH', { body: { read: true } });
  }
};

console.log('[AnimaCRM] Supabase client loaded — Phase 1 MVP — ' + SUPABASE_URL);
})();
