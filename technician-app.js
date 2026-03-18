/* ═══════════════════════════════════════════════════════════════
   AnimaCare Technician App v1.0
   - Register/Login for technicians (KTV)
   - Grab-like booking queue: accept/reject incoming bookings
   - Nearby technician scanner via Geolocation
   - Realtime sync with center + admin dashboards
   - Bilingual VI/EN
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

// ── Demo Technician Accounts ──
var TECH_ACCOUNTS = [
  { id:'KTV001', pwd:'Ktv001@2026', name:'Tr\u1EA7n V\u0103n Long', phone:'0911222333', email:'long@animacare.vn', centerId:'CTR001', centerName:'Anima Care H\u00E0 N\u1ED9i HQ', specialty:'Ch\u00E2m c\u1EE9u, Th\u1EA3o m\u1ED9c nhi\u1EC7t', rating:4.8, sessions:342, role:'technician', status:'online', lat:21.0045, lng:105.8412 },
  { id:'KTV002', pwd:'Ktv002@2026', name:'Nguy\u1EC5n Th\u1ECB Mai', phone:'0922333444', email:'mai@animacare.vn', centerId:'CTR001', centerName:'Anima Care H\u00E0 N\u1ED9i HQ', specialty:'Spa & Grooming, X\u00F4ng h\u01A1i', rating:4.9, sessions:521, role:'technician', status:'online', lat:21.0078, lng:105.8356 },
  { id:'KTV003', pwd:'Ktv003@2026', name:'L\u00EA Ho\u00E0ng Nam', phone:'0933444555', email:'nam@animacare.vn', centerId:'CTR002', centerName:'Anima Care H\u1ED3 Ch\u00ED Minh', specialty:'V\u1EADt l\u00FD tr\u1ECB li\u1EC7u', rating:4.7, sessions:198, role:'technician', status:'offline', lat:10.7769, lng:106.7009 },
  { id:'KTV004', pwd:'Ktv004@2026', name:'Ph\u1EA1m Th\u1ECB H\u01B0\u01A1ng', phone:'0944555666', email:'huong@animacare.vn', centerId:'CTR002', centerName:'Anima Care H\u1ED3 Ch\u00ED Minh', specialty:'\u0110\u00F4ng y, Ti\u00EAm ph\u00F2ng', rating:4.6, sessions:156, role:'technician', status:'online', lat:10.7820, lng:106.6950 },
  { id:'KTV005', pwd:'Ktv005@2026', name:'V\u00F5 Minh Tu\u1EA5n', phone:'0955666777', email:'tuan@animacare.vn', centerId:'CTR003', centerName:'Anima Care \u0110\u00E0 N\u1EB5ng', specialty:'T\u1EA9m so\u00E1t AI, Ch\u00E2m c\u1EE9u', rating:4.5, sessions:89, role:'technician', status:'busy', lat:16.0544, lng:108.2022 }
];

// Load registered techs from localStorage
try {
  var savedTechs = JSON.parse(localStorage.getItem('anima_tech_accounts') || '[]');
  savedTechs.forEach(function(a) {
    if(!TECH_ACCOUNTS.some(function(t) { return t.id === a.id; })) TECH_ACCOUNTS.push(a);
  });
} catch(e) {}

var tLang = 'vi';
var tUser = null;
var tPage = 't-queue';
var watchId = null;

function t(vi, en) { return tLang === 'vi' ? vi : en; }

// ═══════════════════════════════════════════
// INJECT PORTAL + DASHBOARD HTML
// ═══════════════════════════════════════════
function injectTechPortal() {
  var inp = 'width:100%;background:#060C0F;border:1px solid rgba(123,95,255,.15);border-radius:8px;padding:11px 14px;color:#F8F2E0;font-size:14px;outline:none;box-sizing:border-box';
  var lbl = 'font-size:9px;color:rgba(248,242,224,.42);letter-spacing:2px;text-transform:uppercase;font-family:\'Roboto Mono\',monospace;display:block;margin-bottom:4px';
  var btnStyle = 'width:100%;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer';

  var portal = document.createElement('div');
  portal.id = 'techPortal';
  portal.innerHTML =
    '<div style="position:fixed;inset:0;z-index:9997;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:none;align-items:center;justify-content:center;padding:20px;overflow-y:auto">' +
    '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.2);border-radius:20px;padding:0;width:100%;max-width:440px;position:relative;overflow:hidden;max-height:90vh;overflow-y:auto">' +

    // Header
    '<div style="text-align:center;padding:28px 32px 0">' +
    '<div style="width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
    '<h2 style="color:#F8F2E0;font-size:20px;font-weight:600;margin:0">C\u1ED5ng K\u1EF9 Thu\u1EADt Vi\u00EAn</h2>' +
    '<p style="color:rgba(248,242,224,.42);font-size:12px;margin-top:4px">Technician Portal</p></div>' +

    // Tabs
    '<div style="display:flex;margin:20px 32px 0;border-bottom:1px solid rgba(123,95,255,.15)">' +
    '<button id="tpTabLogin" onclick="window._tpSwitch(\'login\')" style="flex:1;padding:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid #7B5FFF;background:transparent;color:#9B82FF">\u0110\u0103ng Nh\u1EADp</button>' +
    '<button id="tpTabRegister" onclick="window._tpSwitch(\'register\')" style="flex:1;padding:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;color:rgba(248,242,224,.42)">\u0110\u0103ng K\u00FD</button>' +
    '</div>' +

    // Messages
    '<div id="tpError" style="display:none;background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.2);border-radius:8px;padding:8px 12px;margin:12px 32px 0;color:#FF4D6D;font-size:12px;text-align:center"></div>' +
    '<div id="tpSuccess" style="display:none;background:rgba(123,95,255,.1);border:1px solid rgba(123,95,255,.2);border-radius:8px;padding:8px 12px;margin:12px 32px 0;color:#9B82FF;font-size:12px;text-align:center"></div>' +

    // ═══ LOGIN ═══
    '<div id="tpLoginForm" style="padding:20px 32px 28px">' +
    '<div style="margin-bottom:14px"><label style="' + lbl + '">KTV ID</label>' +
    '<input id="tpIdInput" style="' + inp + '" placeholder="VD: KTV001"></div>' +
    '<div style="margin-bottom:20px"><label style="' + lbl + '">M\u1EACT KH\u1EA8U</label>' +
    '<input id="tpPwdInput" type="password" style="' + inp + '" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"></div>' +
    '<button onclick="window._techLogin()" style="' + btnStyle + ';background:linear-gradient(135deg,#5B3FDF,#7B5FFF);color:#fff">\u0110\u0103ng Nh\u1EADp</button>' +
    '<p style="text-align:center;margin-top:14px;font-size:12px;color:rgba(248,242,224,.32)">Ch\u01B0a c\u00F3 t\u00E0i kho\u1EA3n? <a href="#" onclick="window._tpSwitch(\'register\');return false" style="color:#9B82FF;text-decoration:none">\u0110\u0103ng k\u00FD ngay</a></p>' +
    '</div>' +

    // ═══ REGISTER ═══
    '<div id="tpRegisterForm" style="display:none;padding:20px 32px 28px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div><label style="' + lbl + '">H\u1ECC V\u00C0 T\u00CAN</label><input id="tpRegName" style="' + inp + '" placeholder="Tr\u1EA7n V\u0103n A"></div>' +
    '<div><label style="' + lbl + '">\u0110I\u1EC6N THO\u1EA0I</label><input id="tpRegPhone" style="' + inp + '" placeholder="0912 345 678"></div></div>' +
    '<div style="margin-bottom:12px"><label style="' + lbl + '">EMAIL</label><input id="tpRegEmail" type="email" style="' + inp + '" placeholder="email@example.com"></div>' +
    '<div style="margin-bottom:12px"><label style="' + lbl + '">CHUY\u00CAN M\u00D4N</label>' +
    '<select id="tpRegSpec" style="' + inp + ';cursor:pointer;-webkit-appearance:none" multiple size="3">' +
    '<option value="Ch\u00E2m c\u1EE9u">Ch\u00E2m c\u1EE9u \u0110\u00F4ng y</option>' +
    '<option value="Th\u1EA3o m\u1ED9c nhi\u1EC7t">Th\u1EA3o m\u1ED9c nhi\u1EC7t</option>' +
    '<option value="Spa & Grooming">Spa & Grooming</option>' +
    '<option value="V\u1EADt l\u00FD tr\u1ECB li\u1EC7u">V\u1EADt l\u00FD tr\u1ECB li\u1EC7u</option>' +
    '<option value="T\u1EA9m so\u00E1t AI">T\u1EA9m so\u00E1t AI</option>' +
    '<option value="X\u00F4ng h\u01A1i">X\u00F4ng h\u01A1i \u0110\u00F4ng d\u01B0\u1EE3c</option>' +
    '<option value="Ti\u00EAm ph\u00F2ng">Ti\u00EAm ph\u00F2ng</option>' +
    '<option value="T\u01B0 v\u1EA5n dinh d\u01B0\u1EE1ng">T\u01B0 v\u1EA5n dinh d\u01B0\u1EE1ng</option>' +
    '</select><span style="font-size:10px;color:rgba(248,242,224,.3)">Gi\u1EEF Ctrl \u0111\u1EC3 ch\u1ECDn nhi\u1EC1u</span></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div><label style="' + lbl + '">C\u01A0 S\u1EDE</label>' +
    '<select id="tpRegCenter" style="' + inp + ';cursor:pointer;-webkit-appearance:none">' +
    '<option value="">Ch\u1ECDn c\u01A1 s\u1EDF...</option>' +
    '<option value="CTR001">H\u00E0 N\u1ED9i HQ</option><option value="CTR002">H\u1ED3 Ch\u00ED Minh</option>' +
    '<option value="CTR003">\u0110\u00E0 N\u1EB5ng</option><option value="CTR004">H\u1EA3i Ph\u00F2ng</option>' +
    '<option value="CTR005">C\u1EA7n Th\u01A1</option><option value="CTR006">Nha Trang</option>' +
    '<option value="CTR007">Hu\u1EBF</option><option value="CTR008">V\u0169ng T\u00E0u</option>' +
    '<option value="freelance">Freelance / T\u1EF1 do</option>' +
    '</select></div>' +
    '<div><label style="' + lbl + '">\u0110\u01A0N V\u1ECA GI\u1EDAI THI\u1EC6U</label><input id="tpRegRef" style="' + inp + '" placeholder="N\u1EBFu c\u00F3"></div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div><label style="' + lbl + '">M\u1EACT KH\u1EA8U</label><input id="tpRegPwd" type="password" style="' + inp + '" placeholder="T\u1ED1i thi\u1EC3u 8 k\u00FD t\u1EF1"></div>' +
    '<div><label style="' + lbl + '">X\u00C1C NH\u1EACN</label><input id="tpRegPwd2" type="password" style="' + inp + '" placeholder="Nh\u1EADp l\u1EA1i"></div></div>' +
    '<label style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;cursor:pointer;font-size:12px;color:rgba(248,242,224,.52)">' +
    '<input type="checkbox" id="tpRegTerms" style="margin-top:2px;accent-color:#7B5FFF">' +
    '<span>T\u00F4i \u0111\u1ED3ng \u00FD v\u1EDBi <a href="#" style="color:#9B82FF;text-decoration:none">\u0110i\u1EC1u kho\u1EA3n KTV</a> v\u00E0 <a href="#" style="color:#9B82FF;text-decoration:none">Quy t\u1EAFc \u1EE9ng x\u1EED</a></span></label>' +
    '<button onclick="window._techRegister()" style="' + btnStyle + ';background:linear-gradient(135deg,#5B3FDF,#7B5FFF);color:#fff">\u0110\u0103ng K\u00FD KTV</button>' +
    '<p style="text-align:center;margin-top:14px;font-size:12px;color:rgba(248,242,224,.32)">\u0110\u00E3 c\u00F3 t\u00E0i kho\u1EA3n? <a href="#" onclick="window._tpSwitch(\'login\');return false" style="color:#9B82FF;text-decoration:none">\u0110\u0103ng nh\u1EADp</a></p>' +
    '</div>' +

    '<button onclick="window._closeTechPortal()" style="position:absolute;top:14px;right:14px;background:rgba(248,242,224,.06);border:none;color:rgba(248,242,224,.42);font-size:16px;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center">\u2715</button>' +
    '</div></div>';
  document.body.appendChild(portal);

  // Dashboard container
  var dash = document.createElement('div');
  dash.id = 'techDashboard';
  dash.style.cssText = 'display:none;position:fixed;inset:0;z-index:10002;background:#030608;overflow:hidden';
  document.body.appendChild(dash);
}

// ═══════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════
window._tpSwitch = function(tab) {
  var lt = document.getElementById('tpTabLogin'), rt = document.getElementById('tpTabRegister');
  var lf = document.getElementById('tpLoginForm'), rf = document.getElementById('tpRegisterForm');
  var on = 'flex:1;padding:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid #7B5FFF;background:transparent;color:#9B82FF';
  var off = 'flex:1;padding:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;color:rgba(248,242,224,.42)';
  document.getElementById('tpError').style.display = 'none';
  document.getElementById('tpSuccess').style.display = 'none';
  if(tab === 'login') { lt.style.cssText = on; rt.style.cssText = off; lf.style.display = 'block'; rf.style.display = 'none'; }
  else { lt.style.cssText = off; rt.style.cssText = on; lf.style.display = 'none'; rf.style.display = 'block'; }
};

// ═══════════════════════════════════════════
// PORTAL OPEN/CLOSE
// ═══════════════════════════════════════════
window._openTechPortal = function(tab) {
  document.getElementById('techPortal').firstChild.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  window._tpSwitch(tab || 'login');
};
window._closeTechPortal = function() {
  document.getElementById('techPortal').firstChild.style.display = 'none';
  document.body.style.overflow = '';
};

// ═══════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════
window._techLogin = function() {
  var id = (document.getElementById('tpIdInput').value || '').trim().toUpperCase();
  var pwd = document.getElementById('tpPwdInput').value;
  var err = document.getElementById('tpError');
  err.style.display = 'none';
  if(!id || !pwd) { err.style.display = 'block'; err.textContent = t('Vui l\u00F2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7','Please fill in all fields'); return; }
  var acc = null;
  for(var i = 0; i < TECH_ACCOUNTS.length; i++) { if(TECH_ACCOUNTS[i].id === id && TECH_ACCOUNTS[i].pwd === pwd) { acc = TECH_ACCOUNTS[i]; break; } }
  if(!acc) { err.style.display = 'block'; err.textContent = t('Sai KTV ID ho\u1EB7c m\u1EADt kh\u1EA9u','Invalid KTV ID or password'); return; }
  tUser = acc;
  localStorage.setItem('anima_tech_user', JSON.stringify(acc));
  _closeTechPortal();
  openTechDashboard();
  if(typeof showToast === 'function') showToast(t('Ch\u00E0o KTV ' + acc.name + '!','Welcome KTV ' + acc.name + '!'), '#7B5FFF');
};

// ═══════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════
window._techRegister = function() {
  var err = document.getElementById('tpError'), suc = document.getElementById('tpSuccess');
  err.style.display = 'none'; suc.style.display = 'none';

  var name = (document.getElementById('tpRegName').value || '').trim();
  var phone = (document.getElementById('tpRegPhone').value || '').trim();
  var email = (document.getElementById('tpRegEmail').value || '').trim();
  var specSel = document.getElementById('tpRegSpec');
  var specs = []; for(var i = 0; i < specSel.options.length; i++) { if(specSel.options[i].selected) specs.push(specSel.options[i].value); }
  var centerId = document.getElementById('tpRegCenter').value;
  var referral = (document.getElementById('tpRegRef').value || '').trim();
  var pwd = document.getElementById('tpRegPwd').value;
  var pwd2 = document.getElementById('tpRegPwd2').value;
  var terms = document.getElementById('tpRegTerms').checked;

  if(!name) { showTPError(t('Vui l\u00F2ng nh\u1EADp h\u1ECD t\u00EAn','Enter your name')); return; }
  if(!phone) { showTPError(t('Vui l\u00F2ng nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i','Enter phone number')); return; }
  if(!email || !email.includes('@')) { showTPError(t('Email kh\u00F4ng h\u1EE3p l\u1EC7','Invalid email')); return; }
  if(specs.length === 0) { showTPError(t('Ch\u1ECDn \u00EDt nh\u1EA5t 1 chuy\u00EAn m\u00F4n','Select at least 1 specialty')); return; }
  if(!centerId) { showTPError(t('Vui l\u00F2ng ch\u1ECDn c\u01A1 s\u1EDF','Select a center')); return; }
  if(!pwd || pwd.length < 8) { showTPError(t('M\u1EADt kh\u1EA9u t\u1ED1i thi\u1EC3u 8 k\u00FD t\u1EF1','Password min 8 characters')); return; }
  if(pwd !== pwd2) { showTPError(t('M\u1EADt kh\u1EA9u kh\u00F4ng kh\u1EDBp','Passwords don\'t match')); return; }
  if(!terms) { showTPError(t('\u0110\u1ED3ng \u00FD \u0111i\u1EC1u kho\u1EA3n','Accept the terms')); return; }

  var existing = JSON.parse(localStorage.getItem('anima_tech_accounts') || '[]');
  if(existing.some(function(a) { return a.phone === phone; })) { showTPError(t('S\u0110T \u0111\u00E3 \u0111\u01B0\u1EE3c \u0111\u0103ng k\u00FD','Phone already registered')); return; }

  var maxNum = 5;
  existing.forEach(function(a) { var n = parseInt(a.id.replace('KTV','')); if(n > maxNum) maxNum = n; });
  var newId = 'KTV' + String(maxNum + 1).padStart(3, '0');

  var centerNames = { CTR001:'Anima Care H\u00E0 N\u1ED9i HQ', CTR002:'Anima Care H\u1ED3 Ch\u00ED Minh', CTR003:'Anima Care \u0110\u00E0 N\u1EB5ng', CTR004:'Anima Care H\u1EA3i Ph\u00F2ng', CTR005:'Anima Care C\u1EA7n Th\u01A1', CTR006:'Anima Care Nha Trang', CTR007:'Anima Care Hu\u1EBF', CTR008:'Anima Care V\u0169ng T\u00E0u', freelance:'Freelance' };

  var newAcc = {
    id: newId, pwd: pwd, name: name, phone: phone, email: email,
    centerId: centerId, centerName: centerNames[centerId] || centerId,
    specialty: specs.join(', '), referral: referral,
    rating: 0, sessions: 0, role: 'technician', status: 'offline',
    lat: 0, lng: 0, createdAt: new Date().toISOString()
  };
  existing.push(newAcc);
  localStorage.setItem('anima_tech_accounts', JSON.stringify(existing));
  TECH_ACCOUNTS.push(newAcc);

  if(window.AnimaSync) {
    AnimaSync.push('activities', { type:'tech_new', vi:'KTV m\u1EDBi \u0111\u0103ng k\u00FD: ' + name + ' (' + specs.join(', ') + ')', en:'New tech registered: ' + name, centerId:centerId, ago:0 });
  }

  suc.style.display = 'block';
  suc.innerHTML = '<strong>' + t('\u0110\u0103ng k\u00FD th\u00E0nh c\u00F4ng!','Registration successful!') + '</strong><br>KTV ID: <strong style="color:#F8F2E0">' + newId + '</strong>';
  setTimeout(function() { window._tpSwitch('login'); document.getElementById('tpIdInput').value = newId; }, 3000);
};

function showTPError(msg) { var e = document.getElementById('tpError'); e.style.display = 'block'; e.textContent = msg; }

// ═══════════════════════════════════════════
// TECHNICIAN DASHBOARD
// ═══════════════════════════════════════════
function openTechDashboard() {
  if(!tUser) { try { tUser = JSON.parse(localStorage.getItem('anima_tech_user')); } catch(e) {} if(!tUser) return; }
  document.getElementById('techDashboard').style.display = 'block';
  document.body.style.overflow = 'hidden';
  renderTechDash();
  startLocationWatch();
  setupTechSync();
}

window._closeTechDash = function() {
  document.getElementById('techDashboard').style.display = 'none';
  document.body.style.overflow = '';
  if(watchId) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  tUser = null;
  localStorage.removeItem('anima_tech_user');
};

function renderTechDash() {
  var d = document.getElementById('techDashboard');
  var sync = window.AnimaSync;
  var myBookings = sync ? sync.get('bookings', []).filter(function(b) { return b.centerId === tUser.centerId; }) : [];
  var pending = myBookings.filter(function(b) { return b.status === 'pending'; });
  var confirmed = myBookings.filter(function(b) { return b.status === 'confirmed'; });
  var completed = myBookings.filter(function(b) { return b.status === 'completed'; });
  var initials = tUser.name.split(' ').map(function(w) { return w[0]; }).join('').substr(0,2).toUpperCase();

  // Nearby techs
  var nearbyTechs = TECH_ACCOUNTS.filter(function(t2) {
    return t2.id !== tUser.id && t2.status !== 'offline' && t2.centerId === tUser.centerId;
  });

  var statusColors = { online:'#00C896', busy:'#F59E0B', offline:'#607870' };
  var statusLabels = { online:{ vi:'Tr\u1EF1c tuy\u1EBFn', en:'Online' }, busy:{ vi:'\u0110ang b\u1EADn', en:'Busy' }, offline:{ vi:'Ngo\u1EA1i tuy\u1EBFn', en:'Offline' } };

  var html = '<div style="display:flex;flex-direction:column;height:100vh;background:#030608;color:#F8F2E0;font-family:\'Roboto\',sans-serif">';

  // ── Top Bar ──
  html += '<div style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(123,95,255,.12);gap:12px;flex-shrink:0">';
  html += '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff">' + initials + '</div>';
  html += '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + tUser.name + '</div>';
  html += '<div style="font-size:10px;color:rgba(248,242,224,.42)">' + tUser.id + ' \u00B7 ' + tUser.centerName + '</div></div>';

  // Status toggle
  html += '<div style="display:flex;align-items:center;gap:6px">';
  html += '<div id="tStatusDot" style="width:8px;height:8px;border-radius:50%;background:' + statusColors[tUser.status||'online'] + ';box-shadow:0 0 6px ' + statusColors[tUser.status||'online'] + '"></div>';
  html += '<select id="tStatusSel" onchange="window._tSetStatus(this.value)" style="background:#0A1218;border:1px solid rgba(123,95,255,.2);border-radius:6px;padding:4px 8px;color:#F8F2E0;font-size:11px;cursor:pointer;outline:none">';
  ['online','busy','offline'].forEach(function(s) {
    html += '<option value="' + s + '"' + (tUser.status===s?' selected':'') + '>' + (tLang==='vi'?statusLabels[s].vi:statusLabels[s].en) + '</option>';
  });
  html += '</select></div>';
  html += '<button onclick="window._closeTechDash()" style="background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.15);border-radius:8px;padding:6px 12px;color:#FF4D6D;font-size:11px;font-weight:600;cursor:pointer">' + t('Tho\u00E1t','Logout') + '</button>';
  html += '</div>';

  // ── Bottom Nav ──
  var tabs = [
    { id:'t-queue', icon:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', vi:'H\u00E0ng ch\u1EDD', en:'Queue', badge:pending.length },
    { id:'t-schedule', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', vi:'L\u1ECBch', en:'Schedule' },
    { id:'t-nearby', icon:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', vi:'Quanh \u0111\u00E2y', en:'Nearby' },
    { id:'t-profile', icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', vi:'C\u00E1 nh\u00E2n', en:'Profile' }
  ];

  // ── Page Content ──
  html += '<div style="flex:1;overflow-y:auto;padding:16px">';

  // QUEUE PAGE
  if(tPage === 't-queue') {
    html += '<div style="font-size:18px;font-weight:600;margin-bottom:4px">' + t('L\u1ECBch H\u1EB9n Ch\u1EDD Nh\u1EADn','Pending Bookings') + '</div>';
    html += '<div style="font-size:12px;color:rgba(248,242,224,.42);margin-bottom:16px">' + t('Ch\u1EA5p nh\u1EADn ho\u1EB7c t\u1EEB ch\u1ED1i nh\u01B0 t\u00E0i x\u1EBF Grab','Accept or reject like a Grab driver') + '</div>';

    if(pending.length === 0) {
      html += '<div style="text-align:center;padding:48px 20px;color:rgba(248,242,224,.3)"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" style="margin-bottom:12px;opacity:.4"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><div style="font-size:14px">' + t('Kh\u00F4ng c\u00F3 l\u1ECBch ch\u1EDD','No pending bookings') + '</div></div>';
    }
    pending.forEach(function(b) {
      html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.15);border-radius:14px;padding:16px;margin-bottom:12px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
      html += '<div><div style="font-size:15px;font-weight:600">' + b.customer + '</div>';
      html += '<div style="font-size:12px;color:#9B82FF;margin-top:2px">' + b.service + '</div></div>';
      html += '<div style="font-family:\'Roboto Mono\',monospace;font-size:11px;color:rgba(248,242,224,.42)">' + b._id + '</div></div>';
      html += '<div style="display:flex;gap:8px;font-size:12px;color:rgba(248,242,224,.52);margin-bottom:14px">';
      html += '<span>\uD83D\uDCC5 ' + b.date + '</span><span>\u23F0 ' + (b.time||'--:--') + '</span></div>';
      html += '<div style="display:flex;gap:8px">';
      html += '<button onclick="window._tAccept(\'' + b._id + '\')" style="flex:1;background:linear-gradient(135deg,#005A42,#00C896);color:#000;border:none;border-radius:8px;padding:10px;font-size:13px;font-weight:600;cursor:pointer">\u2713 ' + t('Nh\u1EADn','Accept') + '</button>';
      html += '<button onclick="window._tReject(\'' + b._id + '\')" style="flex:1;background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.2);color:#FF4D6D;border-radius:8px;padding:10px;font-size:13px;font-weight:600;cursor:pointer">\u2717 ' + t('T\u1EEB ch\u1ED1i','Reject') + '</button>';
      html += '</div></div>';
    });

    // Confirmed (my accepted)
    if(confirmed.length > 0) {
      html += '<div style="font-size:15px;font-weight:600;margin:20px 0 10px;color:#00E5A8">' + t('\u0110\u00E3 nh\u1EADn (' + confirmed.length + ')','Accepted (' + confirmed.length + ')') + '</div>';
      confirmed.forEach(function(b) {
        html += '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.15);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">';
        html += '<div><div style="font-weight:600">' + b.customer + '</div><div style="font-size:12px;color:rgba(248,242,224,.42)">' + b.service + ' \u00B7 ' + b.date + ' ' + (b.time||'') + '</div></div>';
        html += '<button onclick="window._tComplete(\'' + b._id + '\')" style="background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2);color:#00E5A8;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer">' + t('Ho\u00E0n th\u00E0nh','Done') + '</button>';
        html += '</div>';
      });
    }
  }

  // SCHEDULE PAGE
  else if(tPage === 't-schedule') {
    html += '<div style="font-size:18px;font-weight:600;margin-bottom:16px">' + t('L\u1ECBch L\u00E0m Vi\u1EC7c','My Schedule') + '</div>';
    var allMy = myBookings.filter(function(b) { return b.status !== 'cancelled'; });
    var grouped = {};
    allMy.forEach(function(b) { if(!grouped[b.date]) grouped[b.date] = []; grouped[b.date].push(b); });
    var dates = Object.keys(grouped).sort().reverse();
    if(dates.length === 0) {
      html += '<div style="text-align:center;padding:40px;color:rgba(248,242,224,.3)">' + t('Ch\u01B0a c\u00F3 l\u1ECBch','No schedule yet') + '</div>';
    }
    dates.forEach(function(date) {
      html += '<div style="font-size:11px;font-weight:600;color:#9B82FF;letter-spacing:1.5px;text-transform:uppercase;margin:14px 0 6px;font-family:\'Roboto Mono\',monospace">' + date + '</div>';
      grouped[date].forEach(function(b) {
        var sc = b.status === 'confirmed' ? '#00C896' : b.status === 'completed' ? '#3B82F6' : b.status === 'pending' ? '#F59E0B' : '#607870';
        html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(123,95,255,.06)">';
        html += '<div style="width:4px;height:32px;border-radius:2px;background:' + sc + '"></div>';
        html += '<div style="flex:1"><div style="font-size:13px;font-weight:500">' + b.customer + ' \u2014 ' + b.service + '</div>';
        html += '<div style="font-size:11px;color:rgba(248,242,224,.42)">' + (b.time||'--:--') + '</div></div>';
        html += '<div style="font-size:10px;padding:3px 8px;border-radius:12px;background:' + sc + '22;color:' + sc + ';font-weight:600">' + b.status + '</div>';
        html += '</div>';
      });
    });
  }

  // NEARBY PAGE — Centers + KTV scan
  else if(tPage === 't-nearby') {
    // Get all centers with coordinates
    var allCenters = sync ? sync.get('centers', []) : [];
    var centerCoords = {
      CTR001:{lat:21.0045,lng:105.8412,name:'Anima Care H\u00E0 N\u1ED9i HQ'},
      CTR002:{lat:10.7769,lng:106.7009,name:'Anima Care H\u1ED3 Ch\u00ED Minh'},
      CTR003:{lat:16.0544,lng:108.2022,name:'Anima Care \u0110\u00E0 N\u1EB5ng'},
      CTR004:{lat:20.8449,lng:106.6881,name:'Anima Care H\u1EA3i Ph\u00F2ng'},
      CTR005:{lat:10.0452,lng:105.7469,name:'Anima Care C\u1EA7n Th\u01A1'},
      CTR006:{lat:12.2388,lng:109.1967,name:'Anima Care Nha Trang'},
      CTR007:{lat:16.4637,lng:107.5909,name:'Anima Care Hu\u1EBF'},
      CTR008:{lat:10.3460,lng:107.0843,name:'Anima Care V\u0169ng T\u00E0u'}
    };
    // Merge dynamic centers
    allCenters.forEach(function(c) { if(!centerCoords[c._id]) centerCoords[c._id] = {lat:0,lng:0,name:c.name}; });

    // Calculate distance from KTV position
    function calcDist(lat1,lng1,lat2,lng2) {
      if(!lat1||!lng1||!lat2||!lng2) return 9999;
      var R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
      var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
      return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    }

    // Sort centers by distance
    var sortedCenters = Object.keys(centerCoords).map(function(cid) {
      var cc = centerCoords[cid];
      var dist = calcDist(tUser.lat||0, tUser.lng||0, cc.lat, cc.lng);
      var cData = allCenters.find(function(c) { return c._id === cid; }) || {};
      var cPending = sync ? sync.get('bookings',[]).filter(function(b) { return b.centerId === cid && b.status === 'pending'; }).length : 0;
      return { id:cid, name:cc.name, lat:cc.lat, lng:cc.lng, dist:dist, pending:cPending, status:cData.status||'active', type:cData.type||'Full', manager:cData.manager||'', phone:cData.phone||'' };
    }).sort(function(a,b) { return a.dist - b.dist; });

    // Scan button
    html += '<button onclick="window._tScanNearby()" style="width:100%;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);color:#fff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px">';
    html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    html += t('Qu\u00E9t v\u1ECB tr\u00ED & T\u00ECm c\u01A1 s\u1EDF g\u1EA7n nh\u1EA5t','Scan Location & Find Nearest Centers');
    html += '</button>';

    if(tUser.lat) {
      html += '<div style="font-size:10px;color:rgba(248,242,224,.3);text-align:center;margin:-10px 0 14px;font-family:\'Roboto Mono\',monospace">GPS: ' + tUser.lat.toFixed(4) + ', ' + tUser.lng.toFixed(4) + '</div>';
    }

    // ── Section: Nearby Centers ──
    html += '<div style="font-size:15px;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C896" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>' + t('C\u01A1 S\u1EDF G\u1EA7n \u0110\u00E2y','Nearby Centers') + '</div>';

    sortedCenters.forEach(function(c) {
      var isMyCenter = c.id === tUser.centerId;
      var distTxt = c.dist < 1 ? (c.dist*1000).toFixed(0) + 'm' : c.dist.toFixed(1) + 'km';
      if(!tUser.lat) distTxt = '--';
      var borderColor = isMyCenter ? 'rgba(0,200,150,.3)' : 'rgba(123,95,255,.1)';

      html += '<div style="background:#0A1218;border:1px solid ' + borderColor + ';border-radius:14px;padding:14px;margin-bottom:10px">';

      // Header row
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">';
      html += '<div style="flex:1"><div style="font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px">' + c.name;
      if(isMyCenter) html += ' <span style="font-size:9px;padding:2px 6px;border-radius:10px;background:rgba(0,200,150,.15);color:#00E5A8;font-weight:600">C\u01A0 S\u1EDE C\u1EE6A T\u00D4I</span>';
      html += '</div>';
      html += '<div style="font-size:11px;color:rgba(248,242,224,.42);margin-top:2px">' + c.type + ' \u00B7 ' + c.id + '</div></div>';
      html += '<div style="text-align:right"><div style="font-size:16px;font-weight:700;color:' + (c.dist < 5 ? '#00E5A8' : c.dist < 20 ? '#F59E0B' : 'rgba(248,242,224,.42)') + '">' + distTxt + '</div></div>';
      html += '</div>';

      // Pending bookings info
      if(c.pending > 0) {
        html += '<div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15);border-radius:8px;padding:8px 12px;margin-bottom:10px;display:flex;align-items:center;gap:8px">';
        html += '<div style="width:6px;height:6px;border-radius:50%;background:#F59E0B;animation:pulse 1.5s infinite"></div>';
        html += '<span style="font-size:12px;color:#F59E0B;font-weight:600">' + c.pending + ' ' + t('l\u1ECBch h\u1EB9n \u0111ang ch\u1EDD KTV','bookings waiting for KTV') + '</span></div>';
      }

      // Action buttons
      html += '<div style="display:flex;gap:8px">';
      // Book for my client at this center
      html += '<button onclick="window._tBookAtCenter(\'' + c.id + '\',\'' + c.name.replace(/'/g,"\\'") + '\')" style="flex:1;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2);color:#00E5A8;border-radius:8px;padding:9px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px">';
      html += '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' + t('\u0110\u1EB7t l\u1ECBch','Book') + '</button>';

      // Join queue — accept pending bookings from this center
      if(c.pending > 0) {
        html += '<button onclick="window._tJoinCenterQueue(\'' + c.id + '\',\'' + c.name.replace(/'/g,"\\'") + '\')" style="flex:1;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);border:none;color:#fff;border-radius:8px;padding:9px;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px">';
        html += '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>' + t('Nh\u1EADn l\u1ECBch ch\u1EDD','Join Queue') + ' (' + c.pending + ')</button>';
      }
      html += '</div></div>';
    });

    // ── Section: Nearby KTV ──
    html += '<div style="font-size:15px;font-weight:600;margin:20px 0 10px;display:flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B82FF" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>' + t('KTV Quanh \u0110\u00E2y','Nearby Technicians') + '</div>';

    if(nearbyTechs.length === 0) {
      html += '<div style="text-align:center;padding:24px;color:rgba(248,242,224,.3);font-size:13px">' + t('Ch\u01B0a t\u00ECm th\u1EA5y KTV kh\u00E1c','No other technicians found') + '</div>';
    }
    nearbyTechs.forEach(function(tech) {
      var sc = statusColors[tech.status] || '#607870';
      var ini = tech.name.split(' ').map(function(w) { return w[0]; }).join('').substr(0,2);
      var techDist = calcDist(tUser.lat||0, tUser.lng||0, tech.lat||0, tech.lng||0);
      var techDistTxt = (!tUser.lat || !tech.lat) ? '--' : (techDist < 1 ? (techDist*1000).toFixed(0) + 'm' : techDist.toFixed(1) + 'km');
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:#0A1218;border:1px solid rgba(123,95,255,.1);border-radius:12px;margin-bottom:8px">';
      html += '<div style="position:relative"><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff">' + ini + '</div>';
      html += '<div style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-radius:50%;background:' + sc + ';border:2px solid #0A1218"></div></div>';
      html += '<div style="flex:1"><div style="font-size:14px;font-weight:600">' + tech.name + '</div>';
      html += '<div style="font-size:11px;color:rgba(248,242,224,.42)">' + tech.specialty + '</div>';
      html += '<div style="font-size:11px;color:rgba(248,242,224,.32);margin-top:2px">\u2605 ' + tech.rating + ' \u00B7 ' + tech.sessions + ' sessions</div></div>';
      html += '<div style="text-align:right"><div style="font-size:12px;font-weight:600;color:rgba(248,242,224,.52)">' + techDistTxt + '</div>';
      html += '<div style="font-size:10px;padding:3px 8px;border-radius:12px;background:' + sc + '22;color:' + sc + ';font-weight:600;margin-top:4px">' + (tLang==='vi'?statusLabels[tech.status].vi:statusLabels[tech.status].en) + '</div></div>';
      html += '</div>';
    });

    // CSS animation for pulse
    html += '<style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}</style>';
  }

  // PROFILE PAGE
  else if(tPage === 't-profile') {
    html += '<div style="text-align:center;margin-bottom:20px">';
    html += '<div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);display:inline-flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;margin-bottom:10px">' + initials + '</div>';
    html += '<div style="font-size:20px;font-weight:600">' + tUser.name + '</div>';
    html += '<div style="font-size:12px;color:#9B82FF;margin-top:2px">' + tUser.id + ' \u00B7 ' + tUser.centerName + '</div></div>';

    // Stats
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">';
    html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:12px;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:#00E5A8">' + (tUser.sessions||0) + '</div><div style="font-size:10px;color:rgba(248,242,224,.42)">Sessions</div></div>';
    html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:12px;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:#F59E0B">\u2605 ' + (tUser.rating||0) + '</div><div style="font-size:10px;color:rgba(248,242,224,.42)">Rating</div></div>';
    html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:12px;padding:14px;text-align:center"><div style="font-size:22px;font-weight:700;color:#9B82FF">' + completed.length + '</div><div style="font-size:10px;color:rgba(248,242,224,.42)">' + t('Ho\u00E0n th\u00E0nh','Done') + '</div></div>';
    html += '</div>';

    // Info fields
    html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:14px;padding:16px">';
    var fields = [
      [t('H\u1ECD t\u00EAn','Name'), tUser.name],
      [t('\u0110i\u1EC7n tho\u1EA1i','Phone'), tUser.phone],
      ['Email', tUser.email],
      [t('Chuy\u00EAn m\u00F4n','Specialty'), tUser.specialty],
      [t('C\u01A1 s\u1EDF','Center'), tUser.centerName]
    ];
    fields.forEach(function(f) {
      html += '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(123,95,255,.06)">';
      html += '<div style="font-size:11px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace">' + f[0] + '</div>';
      html += '<div style="font-size:13px;font-weight:500;text-align:right;max-width:60%">' + f[1] + '</div></div>';
    });
    html += '</div>';
  }

  html += '</div>'; // page content

  // ── Bottom Nav ──
  html += '<div style="display:flex;border-top:1px solid rgba(123,95,255,.12);background:#060C0F;flex-shrink:0">';
  tabs.forEach(function(tab) {
    var active = tPage === tab.id;
    html += '<button onclick="window._tNav(\'' + tab.id + '\')" style="flex:1;padding:10px 4px 8px;border:none;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;color:' + (active?'#9B82FF':'rgba(248,242,224,.32)') + ';position:relative">';
    html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (active?'2':'1.5') + '" stroke-linecap="round" stroke-linejoin="round"><path d="' + tab.icon + '"/></svg>';
    html += '<span style="font-size:10px;font-weight:' + (active?'600':'400') + '">' + t(tab.vi, tab.en) + '</span>';
    if(tab.badge > 0) html += '<div style="position:absolute;top:4px;right:calc(50% - 16px);background:#FF4D6D;color:#fff;font-size:8px;font-weight:700;border-radius:10px;padding:1px 5px;min-width:14px;text-align:center">' + tab.badge + '</div>';
    html += '</button>';
  });
  html += '</div>';

  html += '</div>';

  // Mobile-first responsive
  html += '<style>#techDashboard{font-family:"Roboto",sans-serif}#techDashboard *{box-sizing:border-box;margin:0;padding:0}#techDashboard select{-webkit-appearance:none}</style>';

  d.innerHTML = html;
}

// ═══════════════════════════════════════════
// NAVIGATION & ACTIONS
// ═══════════════════════════════════════════
window._tNav = function(page) { tPage = page; renderTechDash(); };

window._tSetStatus = function(s) {
  tUser.status = s;
  localStorage.setItem('anima_tech_user', JSON.stringify(tUser));
  renderTechDash();
};

window._tAccept = function(id) {
  if(window.AnimaSync) {
    AnimaSync.update('bookings', id, { status:'confirmed', ktvId:tUser.id, ktvName:tUser.name });
    AnimaSync.push('activities', { type:'booking_accepted', vi:tUser.name + ' nh\u1EADn l\u1ECBch ' + id, en:tUser.name + ' accepted ' + id, centerId:tUser.centerId, ago:0 });
  }
  renderTechDash();
  if(typeof showToast === 'function') showToast(t('\u0110\u00E3 nh\u1EADn l\u1ECBch!','Booking accepted!'), '#00C896');
};

window._tReject = function(id) {
  if(window.AnimaSync) AnimaSync.update('bookings', id, { status:'cancelled', rejectedBy:tUser.id });
  renderTechDash();
};

window._tComplete = function(id) {
  if(window.AnimaSync) {
    AnimaSync.update('bookings', id, { status:'completed', completedAt:new Date().toISOString() });
    AnimaSync.push('activities', { type:'booking_done', vi:tUser.name + ' ho\u00E0n th\u00E0nh phi\u00EAn ' + id, en:tUser.name + ' completed ' + id, centerId:tUser.centerId, ago:0 });
  }
  tUser.sessions = (tUser.sessions||0) + 1;
  localStorage.setItem('anima_tech_user', JSON.stringify(tUser));
  renderTechDash();
  if(typeof showToast === 'function') showToast(t('Ho\u00E0n th\u00E0nh!','Completed!'), '#00C896');
};

// Book a client at a specific center
window._tBookAtCenter = function(centerId, centerName) {
  var customerName = prompt(t('T\u00EAn kh\u00E1ch h\u00E0ng c\u1EE7a b\u1EA1n:','Your client\'s name:'));
  if(!customerName) return;
  var service = prompt(t('D\u1ECBch v\u1EE5 (VD: Ch\u00E2m c\u1EE9u, Spa...):','Service (e.g. Acupuncture, Spa...):'), tUser.specialty.split(',')[0].trim());
  if(!service) return;
  var date = prompt(t('Ng\u00E0y (YYYY-MM-DD):','Date (YYYY-MM-DD):'), new Date().toISOString().split('T')[0]);
  if(!date) return;
  var time = prompt(t('Gi\u1EDD (VD: 14:00):','Time (e.g. 14:00):'), new Date().getHours() + ':00');

  if(window.AnimaSync) {
    AnimaSync.push('bookings', {
      centerId: centerId,
      centerName: centerName,
      customer: customerName,
      service: service,
      date: date,
      time: time || (new Date().getHours() + ':00'),
      status: 'confirmed',
      ktvId: tUser.id,
      ktvName: tUser.name,
      bookedByKtv: true
    });
    AnimaSync.push('activities', {
      type: 'booking_new',
      vi: tUser.name + ' \u0111\u1EB7t l\u1ECBch cho ' + customerName + ' t\u1EA1i ' + centerName,
      en: tUser.name + ' booked ' + customerName + ' at ' + centerName,
      centerId: centerId,
      ago: 0
    });
  }
  renderTechDash();
  if(typeof showToast === 'function') showToast(t('\u0110\u00E3 \u0111\u1EB7t l\u1ECBch t\u1EA1i ' + centerName + '!','Booked at ' + centerName + '!'), '#00C896');
};

// Join a center's pending queue — show their pending bookings to accept
window._tJoinCenterQueue = function(centerId, centerName) {
  if(!window.AnimaSync) return;
  var pendingAtCenter = AnimaSync.get('bookings', []).filter(function(b) {
    return b.centerId === centerId && b.status === 'pending';
  });
  if(pendingAtCenter.length === 0) {
    if(typeof showToast === 'function') showToast(t('Kh\u00F4ng c\u00F2n l\u1ECBch ch\u1EDD','No pending bookings left'), '#F59E0B');
    return;
  }
  // Show confirmation with list
  var list = pendingAtCenter.map(function(b) { return b.customer + ' - ' + b.service + ' (' + b.date + ')'; }).join('\n');
  var msg = t('Nh\u1EADn t\u1EA5t c\u1EA3 ' + pendingAtCenter.length + ' l\u1ECBch ch\u1EDD t\u1EA1i ' + centerName + '?\n\n','Accept all ' + pendingAtCenter.length + ' pending bookings at ' + centerName + '?\n\n') + list;
  if(!confirm(msg)) return;

  // Accept all pending
  pendingAtCenter.forEach(function(b) {
    AnimaSync.update('bookings', b._id, { status:'confirmed', ktvId:tUser.id, ktvName:tUser.name });
  });
  AnimaSync.push('activities', {
    type: 'booking_accepted',
    vi: tUser.name + ' nh\u1EADn ' + pendingAtCenter.length + ' l\u1ECBch t\u1EA1i ' + centerName,
    en: tUser.name + ' accepted ' + pendingAtCenter.length + ' bookings at ' + centerName,
    centerId: centerId,
    ago: 0
  });

  renderTechDash();
  if(typeof showToast === 'function') showToast(t('\u0110\u00E3 nh\u1EADn ' + pendingAtCenter.length + ' l\u1ECBch!','Accepted ' + pendingAtCenter.length + ' bookings!'), '#00C896');
};

window._tScanNearby = function() {
  if(!navigator.geolocation) { alert(t('Thi\u1EBFt b\u1ECB kh\u00F4ng h\u1ED7 tr\u1EE3 GPS','GPS not supported')); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    tUser.lat = pos.coords.latitude;
    tUser.lng = pos.coords.longitude;
    localStorage.setItem('anima_tech_user', JSON.stringify(tUser));
    renderTechDash();
    if(typeof showToast === 'function') showToast(t('\u0110\u00E3 c\u1EADp nh\u1EADt v\u1ECB tr\u00ED!','Location updated!'), '#7B5FFF');
  }, function() {
    if(typeof showToast === 'function') showToast(t('Kh\u00F4ng th\u1EC3 l\u1EA5y v\u1ECB tr\u00ED','Cannot get location'), '#FF4D6D');
  }, { enableHighAccuracy:true, timeout:10000 });
};

// ═══════════════════════════════════════════
// GEOLOCATION WATCH
// ═══════════════════════════════════════════
function startLocationWatch() {
  if(!navigator.geolocation) return;
  watchId = navigator.geolocation.watchPosition(function(pos) {
    tUser.lat = pos.coords.latitude;
    tUser.lng = pos.coords.longitude;
  }, function(){}, { enableHighAccuracy:true, maximumAge:30000 });
}

// ═══════════════════════════════════════════
// SYNC LISTENERS
// ═══════════════════════════════════════════
function setupTechSync() {
  if(!window.AnimaSync) return;
  AnimaSync.on('bookings', function() {
    if(document.getElementById('techDashboard').style.display !== 'none') renderTechDash();
  });
}

// ═══════════════════════════════════════════
// ADD NAV BUTTON + AUTO-RESTORE
// ═══════════════════════════════════════════
function addTechButton() {
  var navRight = document.querySelector('.nav-right');
  if(!navRight || document.getElementById('navTechBtn')) return;
  var adminBtn = document.getElementById('navCenterBtn') || document.getElementById('navAdminBtn');
  var btn = document.createElement('button');
  btn.id = 'navTechBtn';
  btn.title = 'Technician Portal';
  btn.style.cssText = 'background:rgba(123,95,255,.08);border:0.5px solid rgba(123,95,255,.25);border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#9B82FF;transition:background .2s;flex-shrink:0;margin-left:4px';
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v4m-2-2h4"/></svg>';
  btn.onmouseover = function() { this.style.background = 'rgba(123,95,255,.2)'; };
  btn.onmouseout = function() { this.style.background = 'rgba(123,95,255,.08)'; };
  btn.onclick = function() { window._openTechPortal(); };
  if(adminBtn) navRight.insertBefore(btn, adminBtn);
  else navRight.appendChild(btn);
}

function checkTechSession() {
  try {
    var u = JSON.parse(localStorage.getItem('anima_tech_user'));
    if(u && u.id) { tUser = u; openTechDashboard(); }
  } catch(e) {}
}

function init() {
  injectTechPortal();
  addTechButton();
  checkTechSession();
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else setTimeout(init, 400);

})();
