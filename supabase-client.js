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
  }
};

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

console.log('[AnimaCRM] Supabase client loaded — ' + SUPABASE_URL);
})();
