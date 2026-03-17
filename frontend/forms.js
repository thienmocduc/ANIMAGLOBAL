/**
 * AnimaCare Admin — Form Submission Layer
 * Wires all modal forms to live API calls
 * Requires: api-client.js + live-data.js
 */
(function() {
'use strict';

// ── Generic form helpers ──────────────────────────────────
function formData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  const data = {};
  form.querySelectorAll('input,select,textarea').forEach(el => {
    if (el.name) data[el.name] = el.value.trim() || undefined;
  });
  return data;
}

function setSubmitting(btnId, submitting) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = submitting;
  btn.dataset.origText = btn.dataset.origText || btn.textContent;
  btn.textContent = submitting ? '⏳ Đang lưu...' : btn.dataset.origText;
}

function showFormError(containerId, msg) {
  let el = document.getElementById(containerId + '-err');
  if (!el) {
    el = document.createElement('div');
    el.id = containerId + '-err';
    el.style.cssText = 'color:var(--red,#FF4D6D);font-size:12px;margin-top:8px;padding:6px 10px;background:rgba(255,77,109,.08);border-radius:6px';
    const container = document.getElementById(containerId);
    if (container) container.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

// ── Load dropdown options from API ───────────────────────
async function populateSelect(selectId, items, valueKey, labelKey, placeholder) {
  const el = document.getElementById(selectId);
  if (!el) return;
  el.innerHTML = `<option value="">${placeholder||'-- Chọn --'}</option>` +
    items.map(i => `<option value="${i[valueKey]}">${i[labelKey]}</option>`).join('');
}

async function loadFormOptions() {
  try {
    const [centers, services, technicians] = await Promise.all([
      window.api.getCenters({ status: 'active' }),
      window.api.get('/services').catch(() => []),
      window.api.getTechnicians({ status: 'active', limit: 100 }).then(d => d.data).catch(() => [])
    ]);

    // Booking form
    populateSelect('bk-center',     centers,     'id',  'name',      'Chọn cơ sở');
    populateSelect('bk-service',    services,    'id',  'name',      'Chọn dịch vụ');
    populateSelect('bk-technician', technicians, 'id',  'full_name', 'Auto phân công');

    // Order form
    populateSelect('ord-center', centers, 'id', 'name', 'Chọn cơ sở (tuỳ chọn)');

    // KTV form
    populateSelect('ktv-center', centers, 'id', 'name', 'Chọn cơ sở *');

    // Center status & type options are static — skip

  } catch(e) {
    console.warn('Could not load form options:', e.message);
  }
}

// ── FORM 1: Tạo lịch hẹn ─────────────────────────────────
window.submitBookingForm = async function() {
  setSubmitting('bk-submit', true);
  showFormError('bk-form', '');
  try {
    const d = formData('bk-form');
    if (!d.customer_phone && !d.customer_id) throw new Error('Cần số điện thoại khách hàng');
    if (!d.center_id)   throw new Error('Chọn cơ sở');
    if (!d.service_id)  throw new Error('Chọn dịch vụ');
    if (!d.booked_at)   throw new Error('Chọn ngày giờ hẹn');

    // Lookup or create customer by phone
    let customerId = d.customer_id;
    if (!customerId && d.customer_phone) {
      const res = await window.api.getCustomers({ search: d.customer_phone, limit: 1 });
      if (res.data.length) {
        customerId = res.data[0].id;
      } else {
        if (!d.customer_name) throw new Error('Khách mới — cần nhập tên');
        const cu = await window.api.createCustomer({
          full_name: d.customer_name,
          phone: d.customer_phone,
          center_id: d.center_id
        });
        customerId = cu.id;
      }
    }

    const booking = await window.api.createBooking({
      customer_id:   customerId,
      center_id:     d.center_id,
      service_id:    d.service_id,
      technician_id: d.technician_id || undefined,
      booked_at:     d.booked_at,
      notes:         d.notes
    });

    window.closeM && window.closeM('m-booking');
    window.showToast && window.showToast(`✅ Đã tạo ${booking.code}`);
    window.renderBookingsTable && window.renderBookingsTable();

  } catch(e) {
    showFormError('bk-form', e.message);
  } finally {
    setSubmitting('bk-submit', false);
  }
};

// ── FORM 2: Thêm khách hàng ───────────────────────────────
window.submitCustomerForm = async function() {
  setSubmitting('cu-submit', true);
  showFormError('cu-form', '');
  try {
    const d = formData('cu-form');
    if (!d.full_name) throw new Error('Cần nhập họ tên');
    if (!d.phone)     throw new Error('Cần nhập số điện thoại');

    const cu = await window.api.createCustomer({
      full_name:    d.full_name,
      phone:        d.phone,
      email:        d.email,
      dob:          d.dob,
      gender:       d.gender,
      address:      d.address,
      center_id:    d.center_id,
      constitution: d.constitution || 'unknown',
      notes:        d.notes
    });

    window.closeM && window.closeM('m-customer');
    window.showToast && window.showToast(`✅ Đã thêm ${cu.code}`);
    window.renderMembersTable && window.renderMembersTable();

  } catch(e) {
    showFormError('cu-form', e.message.includes('duplicate') ? 'Số điện thoại đã tồn tại' : e.message);
  } finally {
    setSubmitting('cu-submit', false);
  }
};

// ── FORM 3: Thêm cơ sở ────────────────────────────────────
window.submitCenterForm = async function() {
  setSubmitting('ct-submit', true);
  showFormError('ct-form', '');
  try {
    const d = formData('ct-form');
    if (!d.code)    throw new Error('Cần nhập mã cơ sở (VD: C009)');
    if (!d.name)    throw new Error('Cần nhập tên cơ sở');
    if (!d.city)    throw new Error('Cần nhập thành phố');
    if (!d.address) throw new Error('Cần nhập địa chỉ');

    const center = await window.api.createCenter({
      code:    d.code.toUpperCase(),
      name:    d.name,
      city:    d.city,
      district:d.district,
      address: d.address,
      type:    d.type || 'franchise_lite',
      rooms:   Number(d.rooms) || 4,
      phone:   d.phone,
      email:   d.email
    });

    window.closeM && window.closeM('m-center');
    window.showToast && window.showToast(`✅ Đã thêm ${center.code} · ${center.name}`);
    window.renderCentersTable && window.renderCentersTable();

  } catch(e) {
    showFormError('ct-form', e.message.includes('duplicate') ? 'Mã cơ sở đã tồn tại' : e.message);
  } finally {
    setSubmitting('ct-submit', false);
  }
};

// ── FORM 4: Tạo đơn hàng ─────────────────────────────────
window.submitOrderForm = async function() {
  setSubmitting('ord-submit', true);
  showFormError('ord-form', '');
  try {
    const d = formData('ord-form');
    if (!d.customer_phone && !d.customer_id) throw new Error('Cần số điện thoại khách hàng');

    // Resolve customer
    let customerId = d.customer_id;
    if (!customerId && d.customer_phone) {
      const res = await window.api.getCustomers({ search: d.customer_phone, limit: 1 });
      if (!res.data.length) throw new Error('Không tìm thấy khách hàng — tạo khách hàng trước');
      customerId = res.data[0].id;
    }

    // Parse items from form (support multiple product rows)
    const items = [];
    document.querySelectorAll('#ord-items-list .ord-item-row').forEach(row => {
      const pid = row.querySelector('[name="product_id"]')?.value;
      const qty = Number(row.querySelector('[name="qty"]')?.value || 0);
      if (pid && qty > 0) items.push({ product_id: pid, qty });
    });
    if (!items.length) throw new Error('Cần ít nhất 1 sản phẩm');

    const order = await window.api.createOrder({
      customer_id:    customerId,
      center_id:      d.center_id || undefined,
      items,
      payment_method: d.payment_method || 'cod',
      ship_name:      d.ship_name,
      ship_phone:     d.ship_phone,
      ship_address:   d.ship_address,
      notes:          d.notes
    });

    window.closeM && window.closeM('m-order');
    window.showToast && window.showToast(`✅ Đã tạo ${order.code}`);
    window.renderOrdersTable && window.renderOrdersTable();

  } catch(e) {
    showFormError('ord-form', e.message);
  } finally {
    setSubmitting('ord-submit', false);
  }
};

// ── FORM 5: Thêm KTV ─────────────────────────────────────
window.submitKtvForm = async function() {
  setSubmitting('ktv-submit', true);
  showFormError('ktv-form', '');
  try {
    const d = formData('ktv-form');
    if (!d.full_name)  throw new Error('Cần nhập họ tên');
    if (!d.phone)      throw new Error('Cần nhập số điện thoại');
    if (!d.center_id)  throw new Error('Chọn cơ sở');

    const ktv = await window.api.createTechnician({
      full_name:   d.full_name,
      phone:       d.phone,
      email:       d.email,
      center_id:   d.center_id,
      level:       d.level || 'L1',
      specialties: d.specialties ? d.specialties.split(',').map(s=>s.trim()).filter(Boolean) : [],
      joined_at:   d.joined_at || new Date().toISOString().slice(0,10)
    });

    window.closeM && window.closeM('m-ktv');
    window.showToast && window.showToast(`✅ Đã thêm ${ktv.code} · ${ktv.full_name}`);
    window.renderStaffTable && window.renderStaffTable();

  } catch(e) {
    showFormError('ktv-form', e.message.includes('duplicate') ? 'Số điện thoại đã tồn tại' : e.message);
  } finally {
    setSubmitting('ktv-submit', false);
  }
};

// ── Customer lookup (live search by phone) ────────────────
let _lookupTimer = null;
window.liveSearchCustomer = function(inputEl, displayId) {
  clearTimeout(_lookupTimer);
  const q = inputEl.value.trim();
  const display = document.getElementById(displayId);
  if (!display) return;
  if (q.length < 9) { display.textContent = ''; return; }

  _lookupTimer = setTimeout(async () => {
    try {
      const res = await window.api.getCustomers({ search: q, limit: 1 });
      if (res.data.length) {
        const cu = res.data[0];
        display.innerHTML = `<span style="color:var(--g1)">✓ ${cu.full_name} · ${cu.member_tier} · ${cu.constitution}</span>`;
        display.dataset.customerId = cu.id;
      } else {
        display.innerHTML = `<span style="opacity:.5">Chưa có — sẽ tạo khách mới</span>`;
        display.dataset.customerId = '';
      }
    } catch {}
  }, 400);
};

// ── Product rows for order form ───────────────────────────
let _productCache = null;
async function getProducts() {
  if (_productCache) return _productCache;
  try {
    const res = await window.api.get('/products').catch(() => null);
    _productCache = res || [];
  } catch { _productCache = []; }
  return _productCache;
}

window.addOrderItemRow = async function() {
  const list = document.getElementById('ord-items-list');
  if (!list) return;
  const products = await getProducts();
  const row = document.createElement('div');
  row.className = 'ord-item-row';
  row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px';
  row.innerHTML = `
    <select name="product_id" style="flex:1;background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:8px;color:inherit;font-size:13px" onchange="updateOrderRowPrice(this)">
      <option value="">-- Sản phẩm --</option>
      ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} · ${(p.price/1000).toFixed(0)}k</option>`).join('')}
    </select>
    <input name="qty" type="number" min="1" value="1" style="width:60px;background:var(--bg3);border:1px solid var(--bd);border-radius:8px;padding:8px;color:inherit;text-align:center" oninput="updateOrderTotal()">
    <span class="row-price" style="width:80px;text-align:right;font-size:12px;opacity:.6">—</span>
    <button type="button" onclick="this.parentElement.remove();updateOrderTotal()" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:16px">✕</button>
  `;
  list.appendChild(row);
};

window.updateOrderRowPrice = function(select) {
  const opt = select.selectedOptions[0];
  const price = Number(opt?.dataset.price || 0);
  const qty   = Number(select.closest('.ord-item-row').querySelector('[name="qty"]').value || 1);
  const span  = select.closest('.ord-item-row').querySelector('.row-price');
  if (span) span.textContent = price ? ((price*qty/1000).toFixed(0)+'k') : '—';
  updateOrderTotal();
};

window.updateOrderTotal = function() {
  let total = 0;
  document.querySelectorAll('#ord-items-list .ord-item-row').forEach(row => {
    const opt   = row.querySelector('[name="product_id"]').selectedOptions[0];
    const price = Number(opt?.dataset.price || 0);
    const qty   = Number(row.querySelector('[name="qty"]').value || 0);
    const span  = row.querySelector('.row-price');
    if (span) span.textContent = price ? ((price*qty/1000).toFixed(0)+'k') : '—';
    total += price * qty;
  });
  const totalEl = document.getElementById('ord-total-display');
  if (totalEl) totalEl.textContent = total ? new Intl.NumberFormat('vi-VN').format(total) + 'đ' : '—';
};

// ── Search/filter wiring ──────────────────────────────────
function wireSearchFilters() {
  // Generic debounced search wirer
  const searches = [
    { inputSel: '#pg-bookings .top-search input',  fn: q => window.renderBookingsTable(1) },
    { inputSel: '#pg-members .top-search input',   fn: q => window.renderMembersTable(1)  },
    { inputSel: '#pg-orders .top-search input',    fn: q => window.renderOrdersTable(1)   },
    { inputSel: '#pg-staff .top-search input',     fn: q => window.renderStaffTable(1)    },
  ];

  searches.forEach(({ inputSel, fn }) => {
    const el = document.querySelector(inputSel);
    if (!el) return;
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(fn, 350);
    });
  });

  // Status filter dropdowns
  document.querySelectorAll('[data-filter-page]').forEach(sel => {
    sel.addEventListener('change', () => {
      const page = sel.dataset.filterPage;
      const render = window['render' + page.charAt(0).toUpperCase() + page.slice(1) + 'Table'];
      if (render) render(1);
    });
  });
}

// ── Patch openM to load options + wire forms ─────────────
const _origOpenM = window.openM;
window.openM = function(id) {
  if (_origOpenM) _origOpenM(id);
  // Load select options when modal opens
  loadFormOptions();

  // Wire submit buttons to form handlers
  const submitMap = {
    'm-booking':  'submitBookingForm',
    'm-customer': 'submitCustomerForm',
    'm-center':   'submitCenterForm',
    'm-order':    'submitOrderForm',
    'm-ktv':      'submitKtvForm',
  };

  if (submitMap[id]) {
    const modal = document.getElementById(id);
    if (!modal) return;
    let btn = modal.querySelector('[id$="-submit"]');
    if (!btn) {
      // Create submit button if not present
      btn = modal.querySelector('.m-footer button:last-child') || modal.querySelector('button[type="submit"]');
    }
    if (btn && !btn.dataset.wired) {
      btn.dataset.wired = '1';
      btn.addEventListener('click', window[submitMap[id]]);
    }

    // Add first order item row
    if (id === 'm-order') {
      const list = document.getElementById('ord-items-list');
      if (list && !list.children.length) window.addOrderItemRow();
    }
  }
};

// ── Init ─────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireSearchFilters);
} else {
  wireSearchFilters();
}

})();
