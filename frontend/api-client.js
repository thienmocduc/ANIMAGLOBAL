/**
 * AnimaCare Admin — API Client
 * Tự động refresh token, retry, error handling
 */
const API_BASE = window.API_BASE || '/api/v1';

class ApiClient {
  constructor() {
    this._refreshPromise = null;
  }

  _getTokens() {
    return {
      access:  localStorage.getItem('ac_token'),
      refresh: localStorage.getItem('ac_refresh')
    };
  }

  _saveTokens(access, refresh) {
    if (access)  localStorage.setItem('ac_token',   access);
    if (refresh) localStorage.setItem('ac_refresh', refresh);
  }

  _clearTokens() {
    localStorage.removeItem('ac_token');
    localStorage.removeItem('ac_refresh');
    localStorage.removeItem('ac_user');
  }

  async _refreshToken() {
    if (this._refreshPromise) return this._refreshPromise;
    const { refresh } = this._getTokens();
    if (!refresh) { this._logout(); return null; }

    this._refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh })
    })
    .then(r => r.json())
    .then(data => {
      if (data.access_token) {
        this._saveTokens(data.access_token, data.refresh_token);
        return data.access_token;
      }
      this._logout();
      return null;
    })
    .catch(() => { this._logout(); return null; })
    .finally(() => { this._refreshPromise = null; });

    return this._refreshPromise;
  }

  _logout() {
    this._clearTokens();
    window.dispatchEvent(new CustomEvent('ac:logout'));
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/login.html';
    }
  }

  async request(method, path, body, opts = {}) {
    const { skipAuth = false, rawBody = false } = opts;
    const { access } = this._getTokens();

    const headers = { ...(rawBody ? {} : { 'Content-Type': 'application/json' }) };
    if (!skipAuth && access) headers['Authorization'] = `Bearer ${access}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? (rawBody ? body : JSON.stringify(body)) : undefined
    });

    // Auto-refresh on 401 TOKEN_EXPIRED
    if (res.status === 401 && !skipAuth) {
      const data = await res.json();
      if (data.code === 'TOKEN_EXPIRED') {
        const newToken = await this._refreshToken();
        if (newToken) {
          // Retry with new token
          return this.request(method, path, body, { ...opts, _retried: true });
        }
      }
      if (!opts._retried) this._logout();
      throw new ApiError(data.error || 'Unauthorized', 401);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new ApiError(err.error || `HTTP ${res.status}`, res.status, err);
    }

    if (res.status === 204) return null;
    return res.json();
  }

  get(path, params)    {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request('GET', path + qs);
  }
  post(path, body)     { return this.request('POST',   path, body); }
  put(path, body)      { return this.request('PUT',    path, body); }
  patch(path, body)    { return this.request('PATCH',  path, body); }
  delete(path)         { return this.request('DELETE', path); }

  // ── AUTH ──────────────────────────────────────────────
  async login(email, password) {
    const data = await this.request('POST', '/auth/login', { email, password }, { skipAuth: true });
    this._saveTokens(data.access_token, data.refresh_token);
    localStorage.setItem('ac_user', JSON.stringify(data.user));
    return data;
  }

  async logout() {
    const { refresh } = this._getTokens();
    try { await this.post('/auth/logout', { refresh_token: refresh }); } catch {}
    this._clearTokens();
  }

  me()            { return this.get('/auth/me'); }

  // ── DASHBOARD ─────────────────────────────────────────
  dashKpis(p)          { return this.get('/dashboard/kpis', p); }
  dashRevChart(p)      { return this.get('/dashboard/chart/revenue', p); }
  dashCentersChart()   { return this.get('/dashboard/chart/centers'); }
  dashActivity(p)      { return this.get('/dashboard/activity', p); }
  dashStockAlerts()    { return this.get('/dashboard/stock-alerts'); }
  dashTodayBookings(p) { return this.get('/dashboard/today-bookings', p); }

  // ── CENTERS ───────────────────────────────────────────
  getCenters(p)        { return this.get('/centers', p); }
  getCenter(id)        { return this.get(`/centers/${id}`); }
  createCenter(d)      { return this.post('/centers', d); }
  updateCenter(id,d)   { return this.put(`/centers/${id}`, d); }

  // ── CUSTOMERS ─────────────────────────────────────────
  getCustomers(p)      { return this.get('/customers', p); }
  getCustomer(id)      { return this.get(`/customers/${id}`); }
  getCustomerStats()   { return this.get('/customers/stats'); }
  createCustomer(d)    { return this.post('/customers', d); }
  updateCustomer(id,d) { return this.put(`/customers/${id}`, d); }

  // ── BOOKINGS ──────────────────────────────────────────
  getBookings(p)       { return this.get('/bookings', p); }
  getBooking(id)       { return this.get(`/bookings/${id}`); }
  createBooking(d)     { return this.post('/bookings', d); }
  updateBooking(id,d)  { return this.put(`/bookings/${id}`, d); }
  patchBookingStatus(id,status,reason) {
    return this.patch(`/bookings/${id}/status`, { status, cancel_reason: reason });
  }
  deleteBooking(id)    { return this.delete(`/bookings/${id}`); }

  // ── TECHNICIANS ───────────────────────────────────────
  getTechnicians(p)    { return this.get('/technicians', p); }
  createTechnician(d)  { return this.post('/technicians', d); }

  // ── ORDERS ────────────────────────────────────────────
  getOrders(p)         { return this.get('/orders', p); }
  getOrder(id)         { return this.get(`/orders/${id}`); }
  createOrder(d)       { return this.post('/orders', d); }
  patchOrderStatus(id,status) { return this.patch(`/orders/${id}/status`, { status }); }

  // ── INVENTORY ─────────────────────────────────────────
  getInventory(p)      { return this.get('/inventory', p); }
  adjustStock(d)       { return this.post('/inventory/adjust', d); }
  patchInventory(id,d) { return this.patch(`/inventory/${id}`, d); }

  // ── FRANCHISE ─────────────────────────────────────────
  getPartners(p)       { return this.get('/franchise/partners', p); }
  createPartner(d)     { return this.post('/franchise/partners', d); }
  patchPartnerStatus(id,status,signed_at) {
    return this.patch(`/franchise/partners/${id}/status`, { status, signed_at });
  }
  getRoyalties(p)      { return this.get('/franchise/royalties', p); }
  createRoyalty(d)     { return this.post('/franchise/royalties', d); }
  payRoyalty(id)       { return this.patch(`/franchise/royalties/${id}/pay`, {}); }

  // ── AI ENGINE ─────────────────────────────────────────
  getAiSessions(p)     { return this.get('/ai/sessions', p); }
  getAiStats()         { return this.get('/ai/stats'); }
  createAiSession(d)   { return this.post('/ai/sessions', d); }

  // ── ACADEMY ───────────────────────────────────────────
  getCourses()         { return this.get('/academy/courses'); }
  getEnrollments(p)    { return this.get('/academy/enrollments', p); }
  enroll(d)            { return this.post('/academy/enrollments', d); }
  updateProgress(id,d) { return this.patch(`/academy/enrollments/${id}/progress`, d); }

  // ── REVENUE ───────────────────────────────────────────
  getRevenueSummary(p) { return this.get('/revenue/summary', p); }
  getRevenueByCenter(p){ return this.get('/revenue/by-center', p); }
  getArrForecast()     { return this.get('/revenue/arr-forecast'); }

  // ── BLOG ──────────────────────────────────────────────
  getPosts(p)          { return this.get('/blog', p); }
  getPost(id)          { return this.get(`/blog/${id}`); }
  createPost(d)        { return this.post('/blog', d); }
  updatePost(id,d)     { return this.put(`/blog/${id}`, d); }
  publishPost(id, pub) { return this.patch(`/blog/${id}/publish`, { publish: pub }); }
  deletePost(id)       { return this.delete(`/blog/${id}`); }

  // ── USERS ─────────────────────────────────────────────
  getUsers()           { return this.get('/users'); }
  createUser(d)        { return this.post('/users', d); }
  updateUser(id,d)     { return this.patch(`/users/${id}`, d); }

  // ── ANALYTICS ─────────────────────────────────────────
  getFunnel(p)         { return this.get('/analytics/funnel', p); }
  getRetention()       { return this.get('/analytics/retention'); }
  getTopServices()     { return this.get('/analytics/top-services'); }
}

class ApiError extends Error {
  constructor(message, status, raw) {
    super(message);
    this.status = status;
    this.raw = raw;
  }
}

// Singleton
window.api = new ApiClient();
