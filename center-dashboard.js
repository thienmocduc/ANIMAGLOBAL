/* ═══════════════════════════════════════════════════════════════
   AnimaCare Center Dashboard v1.0
   - Login portal for center managers
   - Scoped dashboard showing only their center data
   - Realtime sync with admin dashboard via AnimaSync
   - Bilingual (VI/EN)
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

// ── Center Accounts ──
var CENTER_ACCOUNTS = [
  { id:'CTR001', pwd:'Center001@', name:'Nguyễn Văn An', email:'doanhnhancaotuan@gmail.com', centerId:'CTR001', centerName:'Anima Care Hà Nội HQ', centerNameEn:'Anima Care Hanoi HQ', role:'center_manager' },
  { id:'CTR002', pwd:'Center002@', name:'Trần Thị Bình', email:'doanhnhancaotuan@gmail.com', centerId:'CTR002', centerName:'Anima Care Hồ Chí Minh', centerNameEn:'Anima Care HCMC', role:'center_manager' },
  { id:'CTR003', pwd:'Center003@', name:'Lê Hoàng Cường', email:'doanhnhancaotuan@gmail.com', centerId:'CTR003', centerName:'Anima Care Đà Nẵng', centerNameEn:'Anima Care Da Nang', role:'center_manager' },
  { id:'CTR004', pwd:'Center004@', name:'Phạm Minh Dũng', email:'doanhnhancaotuan@gmail.com', centerId:'CTR004', centerName:'Anima Care Hải Phòng', centerNameEn:'Anima Care Hai Phong', role:'center_manager' },
  { id:'CTR005', pwd:'Center005@', name:'Hoàng Thị E', email:'doanhnhancaotuan@gmail.com', centerId:'CTR005', centerName:'Anima Care Cần Thơ', centerNameEn:'Anima Care Can Tho', role:'center_manager' },
  { id:'CTR006', pwd:'Center006@', name:'Võ Thanh F', email:'doanhnhancaotuan@gmail.com', centerId:'CTR006', centerName:'Anima Care Nha Trang', centerNameEn:'Anima Care Nha Trang', role:'center_manager' },
  { id:'CTR007', pwd:'Center007@', name:'Đặng Văn G', email:'doanhnhancaotuan@gmail.com', centerId:'CTR007', centerName:'Anima Care Huế', centerNameEn:'Anima Care Hue', role:'center_manager' },
  { id:'CTR008', pwd:'Center008@', name:'Bùi Thị H', email:'doanhnhancaotuan@gmail.com', centerId:'CTR008', centerName:'Anima Care Vũng Tàu', centerNameEn:'Anima Care Vung Tau', role:'center_manager' }
];

var cLang = 'vi';
var cUser = null;
var cPage = 'c-dash';

function t(vi, en) { return cLang === 'vi' ? vi : en; }

// ── Inject HTML ──
function injectCenterPortal() {
  // Login Portal
  var portal = document.createElement('div');
  portal.id = 'centerPortal';
  portal.innerHTML = '<div style="position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);display:none;align-items:center;justify-content:center;padding:20px">' +
    '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.15);border-radius:20px;padding:36px 32px;width:100%;max-width:400px;position:relative">' +
    '<div style="text-align:center;margin-bottom:24px">' +
    '<div style="width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#005A42,#00C896);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>' +
    '<h2 style="color:#F8F2E0;font-size:20px;font-weight:600;margin:0" id="cpTitle">C\u1ED5ng Qu\u1EA3n L\u00FD C\u01A1 S\u1EDF</h2>' +
    '<p style="color:rgba(248,242,224,.42);font-size:12px;margin-top:4px" id="cpSub">\u0110\u0103ng nh\u1EADp b\u1EB1ng t\u00E0i kho\u1EA3n c\u01A1 s\u1EDF</p></div>' +
    '<div id="cpError" style="display:none;background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.2);border-radius:8px;padding:8px 12px;margin-bottom:12px;color:#FF4D6D;font-size:12px;text-align:center"></div>' +
    '<div style="margin-bottom:14px"><label style="font-size:9px;color:rgba(248,242,224,.42);letter-spacing:2px;text-transform:uppercase;font-family:\'Roboto Mono\',monospace;display:block;margin-bottom:4px">CENTER ID</label>' +
    '<input id="cpIdInput" style="width:100%;background:#060C0F;border:1px solid rgba(0,200,150,.12);border-radius:8px;padding:11px 14px;color:#F8F2E0;font-size:14px;outline:none;box-sizing:border-box" placeholder="VD: CTR001"></div>' +
    '<div style="margin-bottom:20px"><label style="font-size:9px;color:rgba(248,242,224,.42);letter-spacing:2px;text-transform:uppercase;font-family:\'Roboto Mono\',monospace;display:block;margin-bottom:4px">M\u1EACT KH\u1EA8U</label>' +
    '<input id="cpPwdInput" type="password" style="width:100%;background:#060C0F;border:1px solid rgba(0,200,150,.12);border-radius:8px;padding:11px 14px;color:#F8F2E0;font-size:14px;outline:none;box-sizing:border-box" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"></div>' +
    '<button onclick="window._centerLogin()" style="width:100%;background:linear-gradient(135deg,#005A42,#00C896);color:#000;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer">\u0110\u0103ng Nh\u1EADp</button>' +
    '<button onclick="window._closeCenterPortal()" style="position:absolute;top:14px;right:14px;background:none;border:none;color:rgba(248,242,224,.42);font-size:18px;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center">\u2715</button>' +
    '</div></div>';
  document.body.appendChild(portal);

  // Dashboard Container
  var dash = document.createElement('div');
  dash.id = 'centerDashboard';
  dash.style.cssText = 'display:none;position:fixed;inset:0;z-index:10001;background:#030608;overflow:hidden;height:100vh;width:100vw';
  document.body.appendChild(dash);
}

// ── Portal Logic ──
window._openCenterPortal = function() {
  var p = document.getElementById('centerPortal').firstChild;
  p.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(function() { document.getElementById('cpIdInput').focus(); }, 200);
};

window._closeCenterPortal = function() {
  document.getElementById('centerPortal').firstChild.style.display = 'none';
  document.body.style.overflow = '';
};

window._centerLogin = function() {
  var id = document.getElementById('cpIdInput').value.trim().toUpperCase();
  var pwd = document.getElementById('cpPwdInput').value;
  var err = document.getElementById('cpError');

  if(!id || !pwd) {
    err.style.display = 'block';
    err.textContent = t('Vui l\u00F2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 th\u00F4ng tin', 'Please fill in all fields');
    return;
  }

  var account = null;
  for(var i = 0; i < CENTER_ACCOUNTS.length; i++) {
    if(CENTER_ACCOUNTS[i].id === id && CENTER_ACCOUNTS[i].pwd === pwd) {
      account = CENTER_ACCOUNTS[i]; break;
    }
  }

  if(!account) {
    err.style.display = 'block';
    err.textContent = t('Sai Center ID ho\u1EB7c m\u1EADt kh\u1EA9u', 'Invalid Center ID or password');
    return;
  }

  err.style.display = 'none';
  cUser = account;
  localStorage.setItem('anima_center_user', JSON.stringify(account));
  _closeCenterPortal();
  openCenterDashboard();
  if(typeof showToast === 'function') showToast(t('Ch\u00E0o m\u1EEBng ' + account.name + '!', 'Welcome ' + account.name + '!'), '#00C896');
};

// ── Dashboard Render ──
function openCenterDashboard() {
  if(!cUser) {
    try { cUser = JSON.parse(localStorage.getItem('anima_center_user')); } catch(e) {}
    if(!cUser) return;
  }

  var dash = document.getElementById('centerDashboard');
  dash.style.display = 'block';
  document.body.style.overflow = 'hidden';
  renderDashboard();
  setupSyncListeners();
}

window._closeCenterDashboard = function() {
  document.getElementById('centerDashboard').style.display = 'none';
  document.body.style.overflow = '';
  cUser = null;
  localStorage.removeItem('anima_center_user');
};

function renderDashboard() {
  var dash = document.getElementById('centerDashboard');
  var sync = window.AnimaSync;
  var cid = cUser.centerId;

  // Get scoped data
  var allBookings = sync ? sync.get('bookings', []) : [];
  var allOrders = sync ? sync.get('orders', []) : [];
  var allCustomers = sync ? sync.get('customers', []) : [];
  var allActivities = sync ? sync.get('activities', []) : [];
  var inventory = sync ? sync.get('inventory', []) : [];

  var myBookings = allBookings.filter(function(b) { return b.centerId === cid; });
  var myOrders = allOrders.filter(function(o) { return o.centerId === cid; });
  var myCustomers = allCustomers.filter(function(c) { return c.centerId === cid; });
  var myActivities = allActivities.filter(function(a) { return a.centerId === cid; });

  var pendingBookings = myBookings.filter(function(b) { return b.status === 'pending'; }).length;
  var pendingOrders = myOrders.filter(function(o) { return o.status === 'pending' || o.status === 'processing'; }).length;
  var totalRevenue = myOrders.reduce(function(s, o) { return s + (o.total || 0); }, 0);
  var todayStr = new Date().toISOString().split('T')[0];
  var todayBookings = myBookings.filter(function(b) { return b.date === todayStr; }).length;

  var initials = cUser.name.split(' ').map(function(w) { return w[0]; }).join('').substr(0,2).toUpperCase();

  // Status colors
  var statusMap = {
    confirmed: { vi:'X\u00E1c nh\u1EADn', en:'Confirmed', cls:'g' },
    pending: { vi:'Ch\u1EDD duy\u1EC7t', en:'Pending', cls:'a' },
    completed: { vi:'Ho\u00E0n th\u00E0nh', en:'Completed', cls:'b' },
    cancelled: { vi:'\u0110\u00E3 h\u1EE7y', en:'Cancelled', cls:'r' },
    processing: { vi:'\u0110ang x\u1EED l\u00FD', en:'Processing', cls:'a' },
    shipped: { vi:'\u0110ang giao', en:'Shipped', cls:'b' },
    delivered: { vi:'\u0110\u00E3 giao', en:'Delivered', cls:'g' }
  };

  function st(s) {
    var m = statusMap[s] || { vi:s, en:s, cls:'b' };
    return '<span class="bx ' + m.cls + '"><span class="bx-dot"></span>' + t(m.vi, m.en) + '</span>';
  }

  function money(v) { return v.toLocaleString('vi-VN') + '\u0111'; }

  // Build pages
  var pages = {
    'c-dash': buildDashPage(),
    'c-bookings': buildBookingsPage(),
    'c-orders': buildOrdersPage(),
    'c-customers': buildCustomersPage(),
    'c-inventory': buildInventoryPage(),
    'c-settings': buildSettingsPage()
  };

  function buildDashPage() {
    var h = '<div class="pg on" id="pg-c-dash">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('Ch\u00E0o m\u1EEBng, ', 'Welcome, ') + '<em>' + cUser.name + '</em> \uD83D\uDC4B</div>';
    h += '<div class="pg-sub">' + cUser.centerName + ' \u00B7 ' + t('Ho\u1EA1t \u0111\u1ED9ng b\u00ECnh th\u01B0\u1EDDng', 'Operating normally') + '</div></div>';

    // KPI Cards
    h += '<div class="kpi-g">';
    h += kpiCard('\uD83D\uDCC5', t('L\u1ECBch h\u1EB9n h\u00F4m nay','Today Appointments'), todayBookings, 'var(--g1)', t('+' + pendingBookings + ' ch\u1EDD duy\u1EC7t', pendingBookings + ' pending'));
    h += kpiCard('\uD83D\uDC65', t('Kh\u00E1ch h\u00E0ng','Customers'), myCustomers.length, 'var(--pu1)', t('T\u1ED5ng t\u1EA1i c\u01A1 s\u1EDF','Total at center'));
    h += kpiCard('\uD83D\uDCB0', t('Doanh thu','Revenue'), money(totalRevenue), 'var(--blue)', t(myOrders.length + ' \u0111\u01A1n h\u00E0ng', myOrders.length + ' orders'));
    h += kpiCard('\uD83D\uDCE6', t('\u0110\u01A1n h\u00E0ng','Orders'), myOrders.length, 'var(--amber)', t(pendingOrders + ' \u0111ang x\u1EED l\u00FD', pendingOrders + ' processing'));
    h += '</div>';

    // Recent bookings table
    h += '<div class="g23 mb4">';
    h += '<div class="c"><div class="ch"><span class="ct">' + t('L\u1ECBch H\u1EB9n G\u1EA7n \u0110\u00E2y','Recent Bookings') + '</span><span class="cs">' + myBookings.length + ' ' + t('t\u1ED5ng','total') + '</span></div>';
    h += '<div class="cb"><div class="tw"><table class="dt"><thead><tr><th>ID</th><th>' + t('Kh\u00E1ch','Customer') + '</th><th>' + t('D\u1ECBch v\u1EE5','Service') + '</th><th>' + t('Ng\u00E0y','Date') + '</th><th>' + t('Tr\u1EA1ng th\u00E1i','Status') + '</th></tr></thead><tbody>';
    myBookings.slice(0, 8).forEach(function(b) {
      h += '<tr><td class="td-mo">' + b._id + '</td><td>' + b.customer + '</td><td>' + b.service + '</td><td class="td-mo">' + b.date + '</td><td>' + st(b.status) + '</td></tr>';
    });
    h += '</tbody></table></div></div></div>';

    // Activities
    h += '<div class="c"><div class="ch"><span class="ct">' + t('Ho\u1EA1t \u0110\u1ED9ng','Activity') + '</span><span class="bx g"><span class="bx-dot"></span>Live</span></div>';
    h += '<div class="cb"><div class="act">';
    myActivities.slice(0, 6).forEach(function(a) {
      var color = a.type === 'booking_new' ? 'var(--g1)' : a.type === 'order_new' ? 'var(--pu1)' : a.type === 'stock_low' ? 'var(--red)' : 'var(--blue)';
      h += '<div class="act-i"><div class="act-dot" style="background:' + color + '"></div><div><div class="act-txt">' + t(a.vi, a.en) + '</div><div class="act-time">' + a.ago + ' ' + t('ph\u00FAt tr\u01B0\u1EDBc','min ago') + '</div></div></div>';
    });
    h += '</div></div></div>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function buildBookingsPage() {
    var h = '<div class="pg" id="pg-c-bookings">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('Qu\u1EA3n L\u00FD L\u1ECBch H\u1EB9n','Booking Management') + '</div>';
    h += '<div class="pg-sub">' + cUser.centerName + '</div></div>';
    h += '<div class="fbar"><div class="fbar-in"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="' + t('T\u00ECm l\u1ECBch h\u1EB9n...','Search bookings...') + '"></div>';
    h += '<button class="btn btn-p" onclick="window._cAddBooking()"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' + t('T\u1EA1o m\u1EDBi','New Booking') + '</button></div>';
    h += '<div class="c"><div class="cb"><div class="tw"><table class="dt"><thead><tr><th>ID</th><th>' + t('Kh\u00E1ch h\u00E0ng','Customer') + '</th><th>' + t('D\u1ECBch v\u1EE5','Service') + '</th><th>' + t('Ng\u00E0y','Date') + '</th><th>' + t('Gi\u1EDD','Time') + '</th><th>' + t('Tr\u1EA1ng th\u00E1i','Status') + '</th><th></th></tr></thead><tbody>';
    myBookings.forEach(function(b) {
      h += '<tr><td class="td-mo">' + b._id + '</td><td>' + b.customer + '</td><td>' + b.service + '</td><td class="td-mo">' + b.date + '</td><td class="td-mo">' + (b.time||'') + '</td><td>' + st(b.status) + '</td>';
      h += '<td><button class="btn btn-g btn-sm" onclick="window._cEditBooking(\'' + b._id + '\')">' + t('S\u1EEDa','Edit') + '</button></td></tr>';
    });
    h += '</tbody></table></div></div></div></div>';
    return h;
  }

  function buildOrdersPage() {
    var h = '<div class="pg" id="pg-c-orders">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('Qu\u1EA3n L\u00FD \u0110\u01A1n H\u00E0ng','Order Management') + '</div></div>';
    h += '<div class="c"><div class="cb"><div class="tw"><table class="dt"><thead><tr><th>ID</th><th>' + t('Kh\u00E1ch','Customer') + '</th><th>' + t('S\u1EA3n ph\u1EA9m','Product') + '</th><th>SL</th><th>' + t('T\u1ED5ng','Total') + '</th><th>' + t('Tr\u1EA1ng th\u00E1i','Status') + '</th><th></th></tr></thead><tbody>';
    myOrders.forEach(function(o) {
      h += '<tr><td class="td-mo">' + o._id + '</td><td>' + o.customer + '</td><td>' + o.product + '</td><td>' + o.qty + '</td><td class="td-mo">' + money(o.total) + '</td><td>' + st(o.status) + '</td>';
      h += '<td><button class="btn btn-g btn-sm" onclick="window._cUpdateOrder(\'' + o._id + '\')">' + t('C\u1EADp nh\u1EADt','Update') + '</button></td></tr>';
    });
    h += '</tbody></table></div></div></div></div>';
    return h;
  }

  function buildCustomersPage() {
    var h = '<div class="pg" id="pg-c-customers">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('Kh\u00E1ch H\u00E0ng','Customers') + '</div></div>';
    h += '<div class="fbar"><div class="fbar-in"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="' + t('T\u00ECm kh\u00E1ch h\u00E0ng...','Search customers...') + '"></div>';
    h += '<button class="btn btn-p" onclick="window._cAddCustomer()"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' + t('Th\u00EAm m\u1EDBi','Add New') + '</button></div>';
    h += '<div class="c"><div class="cb"><div class="tw"><table class="dt"><thead><tr><th>ID</th><th>' + t('T\u00EAn','Name') + '</th><th>SĐT</th><th>Email</th><th>' + t('Lo\u1EA1i','Type') + '</th><th>' + t('L\u01B0\u1EE3t kh\u00E1m','Visits') + '</th></tr></thead><tbody>';
    myCustomers.forEach(function(c) {
      var tCls = c.type === 'VIP' ? 'p' : (c.type === 'New' ? 'g' : 'b');
      h += '<tr><td class="td-mo">' + c._id + '</td><td><div class="td-nm"><div class="td-av" style="background:linear-gradient(135deg,var(--pu1),var(--pu2));color:#fff">' + c.name[0] + '</div>' + c.name + '</div></td><td class="td-mo">' + c.phone + '</td><td class="td-mo">' + c.email + '</td><td><span class="bx ' + tCls + '">' + c.type + '</span></td><td>' + c.visits + '</td></tr>';
    });
    h += '</tbody></table></div></div></div></div>';
    return h;
  }

  function buildInventoryPage() {
    var h = '<div class="pg" id="pg-c-inventory">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('T\u1ED3n Kho','Inventory') + '</div></div>';
    h += '<div class="c"><div class="cb"><div class="tw"><table class="dt"><thead><tr><th>' + t('S\u1EA3n ph\u1EA9m','Product') + '</th><th>SKU</th><th>' + t('T\u1ED3n','Stock') + '</th><th>Min</th><th>' + t('Gi\u00E1','Price') + '</th><th>' + t('M\u1EE9c','Level') + '</th></tr></thead><tbody>';
    inventory.forEach(function(item) {
      var pct = Math.min(item.stock / Math.max(item.minStock * 3, 1) * 100, 100);
      var color = item.stock <= item.minStock ? 'var(--red)' : (item.stock <= item.minStock * 2 ? 'var(--amber)' : 'var(--g1)');
      h += '<tr><td>' + item.product + '</td><td class="td-mo">' + item.sku + '</td><td style="color:' + color + ';font-weight:600">' + item.stock + '</td><td class="td-mo">' + item.minStock + '</td><td class="td-mo">' + money(item.price) + '</td>';
      h += '<td><div class="pb" style="width:80px;margin:0"><div class="pbf" style="width:' + pct + '%;background:' + color + '"></div></div></td></tr>';
    });
    h += '</tbody></table></div></div></div></div>';
    return h;
  }

  function buildSettingsPage() {
    var h = '<div class="pg" id="pg-c-settings">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('C\u00E0i \u0110\u1EB7t','Settings') + '</div></div>';
    h += '<div class="g2">';

    // Profile card
    h += '<div class="c"><div class="ch"><span class="ct">' + t('Th\u00F4ng Tin C\u00E1 Nh\u00E2n','Personal Info') + '</span></div><div class="cb">';
    h += '<div class="fg"><div class="fl">' + t('H\u1ECD v\u00E0 t\u00EAn','Full Name') + '</div><input class="fi" value="' + cUser.name + '"></div>';
    h += '<div class="fg"><div class="fl">Email</div><input class="fi" value="' + cUser.email + '"></div>';
    h += '<div class="fg"><div class="fl">' + t('C\u01A1 s\u1EDF','Center') + '</div><input class="fi" value="' + cUser.centerName + '" disabled></div>';
    h += '<div class="fg"><div class="fl">' + t('Vai tr\u00F2','Role') + '</div><input class="fi" value="' + t('Qu\u1EA3n l\u00FD c\u01A1 s\u1EDF','Center Manager') + '" disabled></div>';
    h += '<button class="btn btn-p" style="margin-top:8px">' + t('L\u01B0u thay \u0111\u1ED5i','Save Changes') + '</button>';
    h += '</div></div>';

    // Center info card
    h += '<div class="c"><div class="ch"><span class="ct">' + t('Th\u00F4ng Tin C\u01A1 S\u1EDF','Center Info') + '</span></div><div class="cb">';
    var center = (sync ? sync.get('centers', []) : []).find(function(c) { return c._id === cid; });
    if(center) {
      h += '<div class="fg"><div class="fl">' + t('T\u00EAn','Name') + '</div><input class="fi" value="' + center.name + '"></div>';
      h += '<div class="fg"><div class="fl">' + t('\u0110\u1ECBa ch\u1EC9','Address') + '</div><input class="fi" value="' + center.address + '"></div>';
      h += '<div class="fg"><div class="fl">' + t('\u0110i\u1EC7n tho\u1EA1i','Phone') + '</div><input class="fi" value="' + center.phone + '"></div>';
      h += '<div class="fg"><div class="fl">' + t('Lo\u1EA1i','Type') + '</div><input class="fi" value="' + center.type + '" disabled></div>';
      h += '<div class="fg"><div class="fl">' + t('S\u1EE9c ch\u1EE9a','Capacity') + '</div><input class="fi" value="' + center.capacity + '" disabled></div>';
    }
    h += '</div></div>';
    h += '</div></div>';
    return h;
  }

  function kpiCard(icon, label, value, color, sub) {
    return '<div class="kpi"><div class="kpi-ic" style="background:' + color + '22;color:' + color + '">' + icon + '</div>' +
      '<div class="kpi-l">' + label + '</div><div class="kpi-v">' + value + '</div>' +
      '<div class="kpi-tr up">' + sub + '</div></div>';
  }

  // Sidebar nav items
  var navItems = [
    { id:'c-dash', icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', vi:'Dashboard', en:'Dashboard' },
    { id:'c-bookings', icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', vi:'L\u1ECBch H\u1EB9n', en:'Bookings', badge: pendingBookings },
    { id:'c-orders', icon:'<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>', vi:'\u0110\u01A1n H\u00E0ng', en:'Orders', badge: pendingOrders, badgeCls:'r' },
    { id:'c-customers', icon:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>', vi:'Kh\u00E1ch H\u00E0ng', en:'Customers' },
    { id:'c-inventory', icon:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>', vi:'Kho H\u00E0ng', en:'Inventory' },
    { id:'c-settings', icon:'<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>', vi:'C\u00E0i \u0110\u1EB7t', en:'Settings' }
  ];

  // Build full layout HTML
  var html = '<div class="app" style="display:grid;grid-template-columns:220px 1fr;height:100vh;overflow:hidden">';

  // Sidebar
  html += '<aside class="sb" style="background:#060C0F;border-right:0.5px solid rgba(0,200,150,.12);display:flex;flex-direction:column;height:100vh;overflow:hidden">';
  html += '<div class="sb-logo" style="padding:18px;border-bottom:0.5px solid rgba(0,200,150,.06);display:flex;align-items:center;gap:10px">';
  html += '<div class="sb-logo-gem" style="width:34px;height:34px;border-radius:9px;background:linear-gradient(145deg,#005A42,#00C896);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>';
  html += '<div><div style="font-size:14px;font-weight:600;color:#F8F2E0">' + t(cUser.centerName, cUser.centerNameEn || cUser.centerName) + '</div>';
  html += '<div style="font-family:\'Roboto Mono\',monospace;font-size:8.5px;color:#00C896;letter-spacing:2px;text-transform:uppercase">' + t('Qu\u1EA3n l\u00FD c\u01A1 s\u1EDF','Center Manager') + '</div></div></div>';

  // User section
  html += '<div class="sb-user" style="padding:11px 14px;border-bottom:0.5px solid rgba(0,200,150,.06);display:flex;align-items:center;gap:10px">';
  html += '<div class="sb-av" style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7B5FFF,#9B82FF);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff">' + initials + '</div>';
  html += '<div style="flex:1;min-width:0"><div class="sb-un" style="font-size:12.5px;font-weight:600;color:#F8F2E0">' + cUser.name + '</div>';
  html += '<div class="sb-ur" style="font-family:\'Roboto Mono\',monospace;font-size:8.5px;color:#00C896;letter-spacing:1px">' + cUser.centerId + '</div></div>';
  html += '<div style="width:6px;height:6px;border-radius:50%;background:#00C896;box-shadow:0 0 0 2px rgba(0,200,150,.18)"></div></div>';

  // Nav
  html += '<nav style="flex:1;overflow-y:auto;padding:10px 8px;display:flex;flex-direction:column;gap:1px">';
  html += '<div class="sb-grp" style="font-family:\'Roboto Mono\',monospace;font-size:8px;font-weight:600;color:rgba(248,242,224,.22);letter-spacing:2px;text-transform:uppercase;padding:10px 10px 4px">' + t('QU\u1EA2N L\u00DD','MANAGEMENT') + '</div>';
  navItems.forEach(function(item) {
    var cls = item.id === cPage ? ' on' : '';
    html += '<div class="sb-i' + cls + '" onclick="window._cNav(\'' + item.id + '\',this)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + item.icon + '</svg>' + t(item.vi, item.en);
    if(item.badge) html += '<span class="sb-bx' + (item.badgeCls ? ' ' + item.badgeCls : '') + '">' + item.badge + '</span>';
    html += '</div>';
  });
  html += '<div class="sb-grp" style="font-family:\'Roboto Mono\',monospace;font-size:8px;font-weight:600;color:rgba(248,242,224,.22);letter-spacing:2px;text-transform:uppercase;padding:10px 10px 4px;margin-top:8px">' + t('\u0110\u1ED2NG B\u1ED8','SYNC') + '</div>';
  html += '<div class="sb-i"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>' + t('\u0110\u1ED3ng b\u1ED9 realtime','Realtime Sync') + '<span class="bx g"><span class="bx-dot"></span>Live</span></div>';
  html += '</nav>';

  // Footer
  html += '<div class="sb-ft" style="padding:10px 8px;border-top:0.5px solid rgba(0,200,150,.06);display:flex;gap:6px">';
  html += '<button class="sb-ft-b" style="flex:1;padding:7px 6px;border-radius:7px;background:transparent;border:0.5px solid rgba(0,200,150,.12);cursor:pointer;color:rgba(248,242,224,.42);font-size:11px;display:flex;align-items:center;justify-content:center;gap:5px" onclick="window._closeCenterDashboard()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' + t('Tho\u00E1t','Logout') + '</button></div>';
  html += '</aside>';

  // Main area
  html += '<div class="main" style="display:flex;flex-direction:column;overflow:hidden;min-width:0">';

  // Topbar
  html += '<div class="top" style="height:50px;border-bottom:0.5px solid rgba(0,200,150,.06);display:flex;align-items:center;padding:0 22px;gap:14px;background:#030608;flex-shrink:0">';
  html += '<button class="adm-mob-toggle" style="display:none;background:none;border:none;color:#F8F2E0;cursor:pointer;padding:8px" onclick="document.querySelector(\'#centerDashboard .sb\').classList.toggle(\'mob-open\');document.getElementById(\'cMobOverlay\').classList.toggle(\'show\')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>';
  html += '<div style="flex:1;font-size:12.5px;color:rgba(248,242,224,.42)">' + t(cUser.centerName, cUser.centerNameEn) + ' <span style="color:rgba(248,242,224,.22);font-size:10px">\u203A</span> <span style="color:#F8F2E0;font-weight:500" id="cBcPage">Dashboard</span></div>';
  html += '<div class="lang-sw" style="display:flex;background:#0A1218;border:0.5px solid rgba(0,200,150,.12);border-radius:7px;overflow:hidden">';
  html += '<button class="lang-btn' + (cLang==='vi' ? ' on' : '') + '" style="padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;color:' + (cLang==='vi'?'#00E5A8':'rgba(248,242,224,.22)') + ';background:' + (cLang==='vi'?'rgba(0,200,150,.12)':'transparent') + ';border:none" onclick="window._cSetLang(\'vi\')">VI</button>';
  html += '<button class="lang-btn' + (cLang==='en' ? ' on' : '') + '" style="padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;color:' + (cLang==='en'?'#00E5A8':'rgba(248,242,224,.22)') + ';background:' + (cLang==='en'?'rgba(0,200,150,.12)':'transparent') + ';border:none" onclick="window._cSetLang(\'en\')">EN</button>';
  html += '</div>';
  html += '<div style="font-family:\'Roboto Mono\',monospace;font-size:10.5px;color:rgba(248,242,224,.22)">' + new Date().toLocaleDateString(cLang==='vi'?'vi-VN':'en-US',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'}) + '</div>';
  html += '</div>';

  // Pages container
  html += '<div class="pages" style="flex:1;overflow:hidden;position:relative">';
  Object.keys(pages).forEach(function(k) { html += pages[k]; });
  html += '</div>';

  html += '</div>'; // main
  html += '<div id="cMobOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:90" onclick="document.querySelector(\'#centerDashboard .sb\').classList.remove(\'mob-open\');this.classList.remove(\'show\')"></div>';
  html += '</div>'; // app

  // Apply same admin styles
  var styleTag = document.getElementById('adminDashStyle');
  if(styleTag) {
    html = '<style>' + styleTag.textContent.replace(/#adminDashboard/g, '#centerDashboard') + '</style>' + html;
  }

  // Mobile responsive
  html += '<style>@media(max-width:768px){#centerDashboard .app{grid-template-columns:1fr!important}#centerDashboard .sb{position:fixed!important;left:-260px!important;top:0!important;bottom:0!important;width:240px!important;z-index:100!important;transition:left .3s!important;background:#060C0F!important;box-shadow:4px 0 20px rgba(0,0,0,.6)}#centerDashboard .sb.mob-open{left:0!important}#centerDashboard .adm-mob-toggle{display:flex!important}#centerDashboard #cMobOverlay.show{display:block!important}#centerDashboard .top{padding:0 10px 0 4px!important}#centerDashboard .kpi-g{grid-template-columns:1fr 1fr!important}#centerDashboard .g2,#centerDashboard .g23{grid-template-columns:1fr!important}#centerDashboard .dt{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}}</style>';

  dash.innerHTML = html;
}

// ── Navigation ──
window._cNav = function(pageId, el) {
  cPage = pageId;
  // Update sidebar
  var items = document.querySelectorAll('#centerDashboard .sb-i');
  items.forEach(function(item) { item.classList.remove('on'); });
  if(el) el.classList.add('on');
  // Switch page
  var pgs = document.querySelectorAll('#centerDashboard .pg');
  pgs.forEach(function(pg) { pg.classList.remove('on'); });
  var target = document.getElementById('pg-' + pageId);
  if(target) target.classList.add('on');
  // Breadcrumb
  var bc = document.getElementById('cBcPage');
  if(bc) {
    var names = { 'c-dash':'Dashboard', 'c-bookings':t('L\u1ECBch H\u1EB9n','Bookings'), 'c-orders':t('\u0110\u01A1n H\u00E0ng','Orders'), 'c-customers':t('Kh\u00E1ch H\u00E0ng','Customers'), 'c-inventory':t('Kho H\u00E0ng','Inventory'), 'c-settings':t('C\u00E0i \u0110\u1EB7t','Settings') };
    bc.textContent = names[pageId] || pageId;
  }
};

// ── Language toggle ──
window._cSetLang = function(l) {
  cLang = l;
  renderDashboard();
};

// ── CRUD Actions (sync with admin) ──
window._cAddBooking = function() {
  var name = prompt(t('T\u00EAn kh\u00E1ch h\u00E0ng:','Customer name:'));
  if(!name) return;
  var service = prompt(t('D\u1ECBch v\u1EE5:','Service:'));
  if(!service) return;
  var date = prompt(t('Ng\u00E0y (YYYY-MM-DD):','Date (YYYY-MM-DD):'), new Date().toISOString().split('T')[0]);
  if(!date) return;

  AnimaSync.push('bookings', {
    centerId: cUser.centerId,
    centerName: cUser.centerName,
    customer: name,
    service: service,
    date: date,
    time: new Date().getHours() + ':00',
    status: 'pending'
  });

  renderDashboard();
  if(typeof showToast === 'function') showToast(t('\u0110\u00E3 t\u1EA1o l\u1ECBch h\u1EB9n m\u1EDBi!','Booking created!'), '#00C896');
};

window._cEditBooking = function(id) {
  var newStatus = prompt(t('Tr\u1EA1ng th\u00E1i m\u1EDBi (confirmed/pending/completed/cancelled):','New status (confirmed/pending/completed/cancelled):'));
  if(!newStatus) return;
  AnimaSync.update('bookings', id, { status: newStatus });
  renderDashboard();
};

window._cUpdateOrder = function(id) {
  var newStatus = prompt(t('Tr\u1EA1ng th\u00E1i m\u1EDBi (processing/shipped/delivered):','New status (processing/shipped/delivered):'));
  if(!newStatus) return;
  AnimaSync.update('orders', id, { status: newStatus });
  renderDashboard();
};

window._cAddCustomer = function() {
  var name = prompt(t('T\u00EAn kh\u00E1ch h\u00E0ng:','Customer name:'));
  if(!name) return;
  var phone = prompt('S\u0110T:');
  var email = prompt('Email:');

  AnimaSync.push('customers', {
    centerId: cUser.centerId,
    centerName: cUser.centerName,
    name: name,
    phone: phone || '',
    email: email || '',
    type: 'New',
    visits: 0,
    lastVisit: new Date().toISOString().split('T')[0]
  });

  renderDashboard();
  if(typeof showToast === 'function') showToast(t('\u0110\u00E3 th\u00EAm kh\u00E1ch h\u00E0ng!','Customer added!'), '#00C896');
};

// ── Realtime Sync Listeners ──
function setupSyncListeners() {
  if(!window.AnimaSync) return;

  ['bookings', 'orders', 'customers', 'inventory', 'activities'].forEach(function(key) {
    AnimaSync.on(key, function() {
      if(document.getElementById('centerDashboard').style.display !== 'none') {
        renderDashboard();
      }
    });
  });
}

// ── Add Center Login Button to Nav ──
function addCenterButton() {
  var navRight = document.querySelector('.nav-right');
  if(!navRight) return;
  if(document.getElementById('centerLoginBtn')) return;

  var btn = document.createElement('button');
  btn.id = 'centerLoginBtn';
  btn.title = 'Center Manager Login';
  btn.style.cssText = 'background:linear-gradient(135deg,#005A42,#00C896);border:none;width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-left:6px';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  btn.onclick = function() { window._openCenterPortal(); };
  navRight.appendChild(btn);
}

// ── Auto-restore session ──
function checkCenterSession() {
  try {
    var u = JSON.parse(localStorage.getItem('anima_center_user'));
    if(u && u.centerId) {
      cUser = u;
      openCenterDashboard();
    }
  } catch(e) {}
}

// ── Init ──
function init() {
  injectCenterPortal();
  addCenterButton();
  checkCenterSession();

  // Enter key handlers
  document.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') {
      var cp = document.getElementById('centerPortal');
      if(cp && cp.firstChild.style.display === 'flex') {
        window._centerLogin();
      }
    }
  });
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 300);
}

})();
