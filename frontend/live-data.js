/**
 * AnimaCare Admin — Live Data Layer v1.0
 * Ghi đè toàn bộ hàm render* sang API thật
 * Requires: api-client.js loaded first
 */
(function() {
'use strict';

// ── Helpers ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => new Intl.NumberFormat('vi-VN').format(n);
const fmtMoney = n => {
  if (n >= 1e9)  return (n/1e9).toFixed(1) + ' tỷ';
  if (n >= 1e6)  return (n/1e6).toFixed(0) + ' tr';
  if (n >= 1e3)  return (n/1e3).toFixed(0) + 'k';
  return fmt(n);
};
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtTime = d => d ? new Date(d).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}) : '—';
const loading = html => `<tr><td colspan="20" class="empty-state" style="padding:40px;text-align:center;opacity:.4">${html||'⏳ Đang tải...'}</td></tr>`;
const empty   = msg  => `<tr><td colspan="20" class="empty-state" style="padding:40px;text-align:center;opacity:.4">${msg}</td></tr>`;
const errRow  = e    => `<tr><td colspan="20" style="padding:20px;text-align:center;color:var(--red)">❌ ${e}</td></tr>`;

function setTableBody(tableId, html) {
  const el = document.querySelector(`#${tableId} tbody`) || document.querySelector(`#${tableId}`);
  if (el) el.innerHTML = html;
}
function spinner(containerId) {
  const el = $(containerId);
  if (el) el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:120px;opacity:.4;font-size:13px">⏳ Đang tải dữ liệu...</div>';
}

// ── Login Gate ────────────────────────────────────────────
function checkAuth() {
  const token = localStorage.getItem('ac_token');
  const user  = JSON.parse(localStorage.getItem('ac_user') || 'null');
  if (!token) {
    showLoginModal();
    return false;
  }
  if (user) {
    // Populate user name in sidebar
    const unEl = document.querySelector('.sb-un');
    const urEl = document.querySelector('.sb-role');
    const avEl = document.querySelector('.sb-av');
    if (unEl) unEl.textContent = user.full_name;
    if (urEl) urEl.textContent = user.role.toUpperCase();
    if (avEl) avEl.textContent = (user.full_name||'A')[0].toUpperCase();
  }
  return true;
}

function showLoginModal() {
  // Create login overlay if not present
  if ($('login-overlay')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="login-overlay" style="
      position:fixed;inset:0;background:#030608;z-index:9999;
      display:flex;align-items:center;justify-content:center;">
      <div style="background:var(--bg3,#0A1218);border:1px solid rgba(0,200,150,.2);
                  border-radius:16px;padding:40px;width:360px;max-width:90vw;">
        <div style="text-align:center;margin-bottom:28px">
          <div style="font-size:22px;font-weight:700;color:var(--g1,#00C896)">🌿 AnimaCare</div>
          <div style="font-size:13px;opacity:.5;margin-top:6px">Admin Platform · Đăng nhập</div>
        </div>
        <div style="margin-bottom:14px">
          <label style="font-size:12px;opacity:.6;display:block;margin-bottom:6px">Email</label>
          <input id="li-email" type="email" value="admin@animacare.global" style="
            width:100%;background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.15);
            border-radius:8px;padding:10px 14px;color:inherit;font-size:13px;outline:none;">
        </div>
        <div style="margin-bottom:20px">
          <label style="font-size:12px;opacity:.6;display:block;margin-bottom:6px">Mật khẩu</label>
          <input id="li-pass" type="password" placeholder="••••••••" style="
            width:100%;background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.15);
            border-radius:8px;padding:10px 14px;color:inherit;font-size:13px;outline:none;">
        </div>
        <button id="li-btn" onclick="doLogin()" style="
          width:100%;background:var(--g1,#00C896);color:#000;border:none;
          border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer">
          Đăng nhập
        </button>
        <div id="li-err" style="color:var(--red,#FF4D6D);font-size:12px;text-align:center;margin-top:10px;min-height:18px"></div>
      </div>
    </div>
  `);
  $('li-pass').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });
}

window.doLogin = async function() {
  const btn = $('li-btn');
  const err = $('li-err');
  btn.textContent = '⏳';
  btn.disabled = true;
  err.textContent = '';
  try {
    await window.api.login($('li-email').value, $('li-pass').value);
    $('login-overlay').remove();
    // Reload live data after login
    initLiveData();
  } catch(e) {
    err.textContent = e.message || 'Email hoặc mật khẩu không đúng';
    btn.textContent = 'Đăng nhập';
    btn.disabled = false;
  }
};

window.addEventListener('ac:logout', showLoginModal);

// ── Dashboard KPIs ────────────────────────────────────────
async function loadDashboardKPIs() {
  try {
    const [kpis, activity, alerts] = await Promise.all([
      window.api.dashKpis(),
      window.api.dashActivity({ limit: 8 }),
      window.api.dashStockAlerts()
    ]);

    // KPI cards — update kpi-v elements
    const kpiVals = document.querySelectorAll('.kpi-v');
    if (kpiVals[0]) kpiVals[0].innerHTML = fmtMoney(Number(kpis.revenue.this_month)) + '<sub>đ</sub>';
    if (kpiVals[1]) kpiVals[1].textContent = fmt(Number(kpis.bookings.total));
    if (kpiVals[2]) kpiVals[2].textContent = fmt(Number(kpis.customers.total));
    if (kpiVals[3]) kpiVals[3].textContent = fmt(Number(kpis.centers.active));

    // Update date/status in header
    const sub = document.querySelector('#pg-dashboard .pg-sub');
    if (sub) {
      const today = new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
      const activeStr = kpis.centers.active + ' cơ sở hoạt động';
      sub.textContent = today + ' · ' + activeStr;
    }

    // Activity feed
    const af = $('act-feed');
    if (af && activity.length) {
      af.innerHTML = activity.slice(0,8).map(a => `
        <div class="af-item">
          <div class="af-dot" style="background:${a.type==='booking'?'var(--g1)':'var(--pu1)'}"></div>
          <div class="af-txt">
            <strong>${a.subject}</strong> · ${a.detail}
            <span class="af-ts">${fmtTime(a.ts)} · ${a.center||''}</span>
          </div>
          <div class="af-badge ${a.status}">${a.status}</div>
        </div>`).join('');
    }

    // Stock alerts
    const sw = document.querySelector('.stock-widget-items');
    if (sw && alerts.length) {
      sw.innerHTML = alerts.slice(0,5).map(a => `
        <div class="sw-item">
          <span class="sw-sku">${a.sku}</span>
          <span class="sw-name">${a.name}</span>
          <span class="sw-qty ${a.alert}">${a.qty} còn</span>
        </div>`).join('');
    }

    // Revenue chart
    const chartData = await window.api.dashRevChart();
    if (chartData.length) {
      const labels = chartData.map(r => r.period.slice(5));
      const values = chartData.map(r => Math.round(Number(r.revenue)/1e6));
      if (typeof drawBarChart === 'function') {
        drawBarChart('rev-chart','rev-lbls', values, labels, 'var(--g1)');
      }
    }

  } catch(e) {
    console.error('Dashboard KPI error:', e);
  }
}

// ── Bookings Table ────────────────────────────────────────
window.renderBookingsTable = async function(page) {
  const tbody = document.querySelector('#pg-bookings .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const params = { page: page||1, limit: 20 };
    const today = document.querySelector('#pg-bookings .tab-btn.on')?.dataset?.filter;
    if (today === 'today') params.date = new Date().toISOString().slice(0,10);

    const data = await window.api.getBookings(params);
    if (!data.data.length) { tbody.innerHTML = empty('Không có lịch hẹn'); return; }

    tbody.innerHTML = data.data.map(b => `
      <tr>
        <td><span class="mono">${b.code}</span></td>
        <td><div style="font-weight:500">${b.customer_name}</div><div style="opacity:.5;font-size:11px">${b.customer_phone}</div></td>
        <td>${b.service_name}</td>
        <td>${b.center_name}</td>
        <td>${fmtTime(b.booked_at)}</td>
        <td>${b.technician_name||'<span style="opacity:.4">—</span>'}</td>
        <td>${statusBadge(b.status)}</td>
        <td>
          <button class="act-btn" onclick="confirmBooking('${b.id}','confirmed')" title="Xác nhận" ${b.status!=='pending'?'disabled':''}>✓</button>
          <button class="act-btn danger" onclick="confirmBooking('${b.id}','cancelled')" title="Hủy" ${['completed','cancelled'].includes(b.status)?'disabled':''}>✕</button>
        </td>
      </tr>`).join('');

    renderPagination('pg-bookings', data.total, data.page, data.limit, 'renderBookingsTable');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

window.confirmBooking = async function(id, status) {
  if (status === 'cancelled' && !confirm('Xác nhận hủy lịch hẹn này?')) return;
  try {
    await window.api.patchBookingStatus(id, status);
    renderBookingsTable();
    showToast(status === 'confirmed' ? '✅ Đã xác nhận' : '🚫 Đã hủy lịch');
  } catch(e) {
    showToast('❌ ' + e.message, 'error');
  }
};

// ── Centers Table ─────────────────────────────────────────
window.renderCentersTable = async function() {
  const tbody = document.querySelector('#pg-centers .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const data = await window.api.getCenters();
    if (!data.length) { tbody.innerHTML = empty('Chưa có cơ sở'); return; }
    tbody.innerHTML = data.map(c => `
      <tr>
        <td><span class="mono">${c.code}</span></td>
        <td><div style="font-weight:500">${c.name}</div><div style="opacity:.5;font-size:11px">${c.address}</div></td>
        <td>${c.city}</td>
        <td><span class="tag">${c.type}</span></td>
        <td>${statusBadge(c.status)}</td>
        <td>${c.rooms}</td>
        <td>${c.ktv_active||0}</td>
        <td>${c.bookings_today||0}</td>
        <td>${c.rating>0?'⭐ '+c.rating:'—'}</td>
        <td><button class="act-btn" onclick="editCenter('${c.id}')">✏️</button></td>
      </tr>`).join('');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

// ── Customers (Members) Table ─────────────────────────────
window.renderMembersTable = async function(page) {
  const tbody = document.querySelector('#pg-members .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const data = await window.api.getCustomers({ page: page||1, limit: 20 });
    if (!data.data.length) { tbody.innerHTML = empty('Chưa có khách hàng'); return; }
    tbody.innerHTML = data.data.map(cu => `
      <tr>
        <td><span class="mono">${cu.code}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:28px;height:28px;border-radius:50%;background:${avatarColor(cu.full_name)};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${cu.full_name[0]}</div>
            <div><div style="font-weight:500">${cu.full_name}</div><div style="opacity:.5;font-size:11px">${cu.phone}</div></div>
          </div>
        </td>
        <td>${constitutionBadge(cu.constitution)}</td>
        <td>${tierBadge(cu.member_tier)}</td>
        <td>${cu.total_sessions}</td>
        <td>${cu.total_spent>0?fmtMoney(cu.total_spent)+'đ':'—'}</td>
        <td>${cu.last_visit?fmtDate(cu.last_visit):'—'}</td>
        <td><button class="act-btn" onclick="viewCustomer('${cu.id}')">👁</button></td>
      </tr>`).join('');
    renderPagination('pg-members', data.total, data.page, data.limit, 'renderMembersTable');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

// ── Orders Table ──────────────────────────────────────────
window.renderOrdersTable = async function(page) {
  const tbody = document.querySelector('#pg-orders .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const data = await window.api.getOrders({ page: page||1, limit: 20 });
    if (!data.data.length) { tbody.innerHTML = empty('Chưa có đơn hàng'); return; }
    tbody.innerHTML = data.data.map(o => `
      <tr>
        <td><span class="mono">${o.code}</span></td>
        <td>${o.customer_name}<div style="opacity:.5;font-size:11px">${o.phone}</div></td>
        <td>${fmtMoney(Number(o.total))}đ</td>
        <td><span class="tag">${o.payment_method.toUpperCase()}</span></td>
        <td>${statusBadge(o.status)}</td>
        <td>${fmtDate(o.created_at)}</td>
        <td>
          <select class="act-select" onchange="updateOrderStatus('${o.id}',this.value)" style="background:var(--bg3);border:1px solid var(--bd);border-radius:6px;color:inherit;padding:3px 6px;font-size:11px">
            ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=>`
              <option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`).join('');
    renderPagination('pg-orders', data.total, data.page, data.limit, 'renderOrdersTable');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

window.updateOrderStatus = async function(id, status) {
  try {
    await window.api.patchOrderStatus(id, status);
    showToast('✅ Cập nhật đơn hàng');
  } catch(e) {
    showToast('❌ ' + e.message, 'error');
    renderOrdersTable();
  }
};

// ── Revenue Table ─────────────────────────────────────────
window.renderRevTable = async function() {
  const tbody = document.querySelector('#pg-revenue .data-table tbody');
  try {
    const [summary, byCenter, forecast] = await Promise.all([
      window.api.getRevenueSummary(),
      window.api.getRevenueByCenter(),
      window.api.getArrForecast()
    ]);

    if (tbody && byCenter.length) {
      tbody.innerHTML = byCenter.map(r => `
        <tr>
          <td><span class="mono">${r.code}</span></td>
          <td>${r.name}</td>
          <td>${r.city}</td>
          <td>${r.type}</td>
          <td>${fmtMoney(Number(r.service_rev))}đ</td>
          <td>${r.sessions}</td>
        </tr>`).join('');
    }

    // ARR forecast chart
    const revChart = $('rev-forecast-chart');
    if (revChart && typeof drawBarChart === 'function' && forecast.length) {
      drawBarChart('rev-forecast-chart', 'rev-forecast-lbls',
        forecast.map(f => Math.round(f.arr_high/1e6)),
        forecast.map(f => f.year), 'var(--g1)');
    }
  } catch(e) {
    if (tbody) tbody.innerHTML = errRow(e.message);
  }
};

// ── AI Table ──────────────────────────────────────────────
window.renderAITable = async function() {
  const tbody = document.querySelector('#pg-ai .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const [sessions, stats] = await Promise.all([
      window.api.getAiSessions({ limit: 20 }),
      window.api.getAiStats()
    ]);

    // Update AI stats if elements exist
    const totalEl = document.querySelector('#pg-ai .ai-total');
    if (totalEl && stats.length) {
      const totals = stats.reduce((a,b) => ({ total: a.total+Number(b.total) }), { total:0 });
      totalEl.textContent = fmt(totals.total);
    }

    tbody.innerHTML = sessions.map(s => `
      <tr>
        <td>${fmtDate(s.created_at)} ${fmtTime(s.created_at)}</td>
        <td>${s.customer}<div style="opacity:.5;font-size:11px">${s.phone}</div></td>
        <td>${constitutionBadge(s.constitution)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;height:4px;background:rgba(255,255,255,.1);border-radius:2px">
              <div style="width:${s.confidence}%;height:100%;background:var(--g1);border-radius:2px"></div>
            </div>
            <span style="font-size:11px;opacity:.7">${s.confidence}%</span>
          </div>
        </td>
        <td>${s.technician}</td>
        <td><span class="mono" style="font-size:11px">${s.model_version||'v2.1'}</span></td>
      </tr>`).join('');

    if (!sessions.length) tbody.innerHTML = empty('Chưa có phiên khai vấn');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

// ── Staff (KTV) Table ─────────────────────────────────────
window.renderStaffTable = async function(page) {
  const tbody = document.querySelector('#pg-staff .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const data = await window.api.getTechnicians({ page: page||1, limit: 20 });
    tbody.innerHTML = data.data.map(t => `
      <tr>
        <td><span class="mono">${t.code}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:28px;height:28px;border-radius:50%;background:${avatarColor(t.full_name)};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${t.full_name[0]}</div>
            <div><div style="font-weight:500">${t.full_name}</div><div style="opacity:.5;font-size:11px">${t.center_name}</div></div>
          </div>
        </td>
        <td><span class="tag level-${t.level.toLowerCase()}">${t.level}</span></td>
        <td>${t.specialties?.join(', ')||'—'}</td>
        <td>${statusBadge(t.status)}</td>
        <td>${t.sessions_today}</td>
        <td>${t.rating>0?'⭐ '+t.rating:'—'}</td>
        <td>${fmtDate(t.joined_at)}</td>
      </tr>`).join('');
    if (!data.data.length) tbody.innerHTML = empty('Chưa có KTV');
    renderPagination('pg-staff', data.total, data.page, data.limit, 'renderStaffTable');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

// ── Inventory Table ───────────────────────────────────────
window.renderInvTable = async function() {
  const tbody = document.querySelector('#pg-inventory .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const data = await window.api.getInventory();
    tbody.innerHTML = data.map(i => `
      <tr>
        <td><span class="mono">${i.sku}</span></td>
        <td>${i.name}</td>
        <td>${i.category}</td>
        <td>${i.location}</td>
        <td style="text-align:right">
          <span style="font-weight:600;color:${i.alert==='out'?'var(--red)':i.alert==='critical'?'var(--amber)':i.alert==='low'?'var(--sky)':'inherit'}">${fmt(i.qty)}</span>
        </td>
        <td style="text-align:right">${fmt(i.qty_min)}</td>
        <td>${stockAlert(i.alert)}</td>
        <td><button class="act-btn" onclick="adjustStock('${i.id}','${i.product_id}')">📦 Điều chỉnh</button></td>
      </tr>`).join('');
    if (!data.length) tbody.innerHTML = empty('Kho trống');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

window.adjustStock = async function(invId, productId) {
  const qty = prompt('Nhập số lượng mới:');
  if (!qty || isNaN(qty)) return;
  try {
    await window.api.patchInventory(invId, { qty: Number(qty) });
    renderInvTable();
    showToast('✅ Đã cập nhật kho');
  } catch(e) {
    showToast('❌ ' + e.message, 'error');
  }
};

// ── Franchise Table ────────────────────────────────────────
window.renderFrTable = async function() {
  const tbody = document.querySelector('#pg-franchise .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const data = await window.api.getPartners();
    tbody.innerHTML = data.map(p => `
      <tr>
        <td><span class="mono">${p.code}</span></td>
        <td><div style="font-weight:500">${p.company_name}</div><div style="opacity:.5;font-size:11px">${p.contact_name}</div></td>
        <td>${p.city||'—'}</td>
        <td><span class="tag">${p.package||'lite'}</span></td>
        <td>${statusBadge(p.status)}</td>
        <td>${p.investment?fmtMoney(Number(p.investment))+'đ':'—'}</td>
        <td>${p.royalty_rate?p.royalty_rate+'%':'—'}</td>
        <td>${p.signed_at?fmtDate(p.signed_at):'—'}</td>
      </tr>`).join('');
    if (!data.length) tbody.innerHTML = empty('Chưa có đối tác nhượng quyền');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

// ── Academy Table ─────────────────────────────────────────
window.renderAcadTable = async function() {
  const tbody = document.querySelector('#pg-academy .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const [courses, enrollments] = await Promise.all([
      window.api.getCourses(),
      window.api.getEnrollments({ limit: 30 })
    ]);
    tbody.innerHTML = enrollments.map(e => `
      <tr>
        <td>${e.student_name}</td>
        <td>${e.center_name}</td>
        <td><span class="tag level-${e.ktv_level.toLowerCase()}">${e.ktv_level}</span></td>
        <td>${e.course_title}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;height:4px;background:rgba(255,255,255,.1);border-radius:2px">
              <div style="width:${e.progress}%;height:100%;background:var(--g1);border-radius:2px"></div>
            </div>
            <span style="font-size:11px;width:30px">${e.progress}%</span>
          </div>
        </td>
        <td>${e.score?e.score+'/100':'—'}</td>
        <td>${e.passed?'<span style="color:var(--g1)">✓ Đạt</span>':e.completed_at?'<span style="color:var(--red)">✕ Trượt</span>':'<span style="opacity:.4">Đang học</span>'}</td>
        <td>${fmtDate(e.enrolled_at)}</td>
      </tr>`).join('');
    if (!enrollments.length) tbody.innerHTML = empty('Chưa có học viên');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

// ── CMS Table ─────────────────────────────────────────────
window.renderCMSTable = async function() {
  const tbody = document.querySelector('#pg-content .data-table tbody');
  if (!tbody) return;
  tbody.innerHTML = loading();
  try {
    const data = await window.api.getPosts({ limit: 20 });
    tbody.innerHTML = data.data.map(p => `
      <tr>
        <td><div style="font-weight:500">${p.title_vi}</div><div style="opacity:.5;font-size:11px">${p.slug}</div></td>
        <td>${p.category||'—'}</td>
        <td>${p.author||'—'}</td>
        <td>${fmt(p.views)}</td>
        <td>${p.is_published
          ? `<span style="color:var(--g1)">● Đã xuất bản</span>`
          : `<span style="opacity:.4">○ Nháp</span>`}</td>
        <td>${p.published_at?fmtDate(p.published_at):'—'}</td>
        <td>
          <button class="act-btn" onclick="togglePublish('${p.id}',${!p.is_published})">${p.is_published?'⬇ Ẩn':'▶ Xuất bản'}</button>
          <button class="act-btn danger" onclick="deletePost('${p.id}')">🗑</button>
        </td>
      </tr>`).join('');
    if (!data.data.length) tbody.innerHTML = empty('Chưa có bài viết');
  } catch(e) {
    tbody.innerHTML = errRow(e.message);
  }
};

window.togglePublish = async function(id, publish) {
  try {
    await window.api.publishPost(id, publish);
    renderCMSTable();
    showToast(publish ? '✅ Đã xuất bản' : '✅ Đã ẩn bài viết');
  } catch(e) {
    showToast('❌ ' + e.message, 'error');
  }
};

window.deletePost = async function(id) {
  if (!confirm('Xóa bài viết này?')) return;
  try {
    await window.api.deletePost(id);
    renderCMSTable();
    showToast('🗑 Đã xóa');
  } catch(e) {
    showToast('❌ ' + e.message, 'error');
  }
};

// ── Analytics ─────────────────────────────────────────────
window.renderAnalytics = async function() {
  try {
    const [funnel, retention, services] = await Promise.all([
      window.api.getFunnel(),
      window.api.getRetention(),
      window.api.getTopServices()
    ]);

    // Funnel stats
    const funnelEls = document.querySelectorAll('#pg-analytics .funnel-val');
    if (funnelEls.length) {
      const vals = [funnel.new_customers, funnel.total_bookings, funnel.confirmed, funnel.completed];
      funnelEls.forEach((el,i) => { if(vals[i]!==undefined) el.textContent = fmt(vals[i]); });
    }

    // Top services table
    const sTbody = document.querySelector('#pg-analytics .svc-table tbody');
    if (sTbody && services.length) {
      sTbody.innerHTML = services.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.category}</td>
          <td>${fmt(Number(s.bookings))}</td>
          <td>${fmtMoney(Number(s.revenue))}đ</td>
          <td>${fmtMoney(Number(s.avg_price))}đ</td>
        </tr>`).join('');
    }

    // Retention chart
    if (retention.length && typeof drawBarChart === 'function') {
      drawBarChart('ret-chart','ret-lbls',
        retention.map(r => Number(r.retention_pct)),
        retention.map(r => r.month.slice(5)),
        'var(--pu1)');
    }
  } catch(e) {
    console.error('Analytics error:', e);
  }
};

// ── Investors (static + forecast) ─────────────────────────
window.renderInvestors = async function() {
  try {
    const forecast = await window.api.getArrForecast();
    if (typeof drawBarChart === 'function' && forecast.length) {
      drawBarChart('ipo-chart','ipo-lbls',
        forecast.map(f => Math.round(f.arr_high/1e6)),
        forecast.map(f => f.year),
        ['var(--g1)','var(--g1)','var(--g2)','var(--g2)','var(--pu1)','var(--pu1)']);
    }
  } catch(e) {}
};

// ── Helpers: badges ───────────────────────────────────────
function constitutionBadge(c) {
  const map = { moc:'🌱 Mộc',hoa:'🔥 Hỏa',tho:'🌍 Thổ',kim:'⚡ Kim',thuy:'💧 Thủy',unknown:'—' };
  const col = { moc:'var(--g1)',hoa:'var(--red)',tho:'var(--amber)',kim:'var(--sky)',thuy:'var(--pu1)' };
  return `<span style="color:${col[c]||'inherit'}">${map[c]||c}</span>`;
}

function tierBadge(tier) {
  const col = { gold:'var(--amber)',silver:'var(--sky)',bronze:'#cd7f32',platinum:'var(--pu2)' };
  return `<span style="color:${col[tier]||'inherit'};text-transform:capitalize">${tier||'bronze'}</span>`;
}

function stockAlert(a) {
  const map = { ok:'<span style="color:var(--g1)">● OK</span>', low:'<span style="color:var(--sky)">⚠ Thấp</span>', critical:'<span style="color:var(--amber)">🔶 Nguy hiểm</span>', out:'<span style="color:var(--red)">❌ Hết hàng</span>' };
  return map[a] || a;
}

// ── Pagination helper ─────────────────────────────────────
function renderPagination(pageId, total, page, limit, fnName) {
  const pages = Math.ceil(total/limit);
  const el = document.querySelector(`#${pageId} .pagination`);
  if (!el || pages <= 1) return;
  el.innerHTML = `
    <button onclick="${fnName}(${page-1})" ${page<=1?'disabled':''}>‹</button>
    <span>${page} / ${pages} · ${fmt(total)} records</span>
    <button onclick="${fnName}(${page+1})" ${page>=pages?'disabled':''}>›</button>`;
}

// ── Toast notification ────────────────────────────────────
window.showToast = function(msg, type) {
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position:'fixed', bottom:'24px', right:'24px', zIndex:'9999',
    background: type==='error' ? 'var(--red,#FF4D6D)' : '#1A2E25',
    border: '1px solid ' + (type==='error' ? 'rgba(255,77,109,.3)' : 'rgba(0,200,150,.3)'),
    color: '#fff', padding:'10px 18px', borderRadius:'8px',
    fontSize:'13px', fontWeight:'500', boxShadow:'0 4px 20px rgba(0,0,0,.4)',
    animation:'fadeIn .2s ease'
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// ── Init ──────────────────────────────────────────────────
async function initLiveData() {
  if (!checkAuth()) return;

  // Wire go() to also trigger API loads
  const _origGo = window.go;
  window.go = function(page, sub) {
    if (_origGo) _origGo(page, sub);
    if (page === 'dashboard') loadDashboardKPIs();
    else if (typeof window['render' + page.charAt(0).toUpperCase() + page.slice(1) + 'Table'] === 'function') {
      window['render' + page.charAt(0).toUpperCase() + page.slice(1) + 'Table']();
    }
  };

  // Load dashboard on start
  loadDashboardKPIs();
}

// Wait for DOM + api-client.js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLiveData);
} else {
  initLiveData();
}

})();
