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

// ── KTV Accounts (only from registration) ──
var TECH_ACCOUNTS = [
  /* Data th\u1EF1c t\u1EEB KTV \u0111\u0103ng k\u00FD - kh\u00F4ng c\u00F3 data \u1EA3o */
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
    '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.2);border-radius:20px;padding:0;width:100%;max-width:440px;position:relative;max-height:90vh;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none">' +

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
  /* Auto-fill saved KTV credentials */
  try{var saved=JSON.parse(localStorage.getItem('anima_saved_tech'));if(saved&&saved.id){setTimeout(function(){var idEl=document.getElementById('tpIdInput');var pwdEl=document.getElementById('tpPwdInput');if(idEl)idEl.value=saved.id;if(pwdEl)pwdEl.value=atob(saved.pwd);},100);}}catch(ex){}
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
  /* Save KTV credentials for auto-fill */
  localStorage.setItem('anima_saved_tech', JSON.stringify({id:id, pwd:btoa(pwd), ts:Date.now()}));
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
  // Count clients needing data
  var allClients = sync ? sync.get('crm_clients', []).filter(function(c) { return c.ktvId === tUser.id; }) : [];
  var incompleteClients = allClients.filter(function(c) { return !c.dataComplete; });

  // Calculate income data for badge
  var ktvIncome = JSON.parse(localStorage.getItem('anima_ktv_income_' + tUser.id) || '{}');
  var pendingWithdraw = (ktvIncome.pendingWithdrawals || []).filter(function(w){return w.status==='pending';}).length;

  var tabs = [
    { id:'t-queue', icon:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9', vi:'H\u00E0ng ch\u1EDD', en:'Queue', badge:pending.length },
    { id:'t-clients', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', vi:'Kh\u00E1ch h\u00E0ng', en:'Clients', badge:incompleteClients.length },
    { id:'t-income', icon:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', vi:'Thu nh\u1EADp', en:'Income', badge:pendingWithdraw },
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

  // CLIENTS PAGE — Customer data tracking, health records, session history
  else if(tPage === 't-clients') {
    var clientSubPage = window._tClientSub || 'list'; // list | form | detail
    var editingClient = window._tEditClient || null;

    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">';
    html += '<div><div style="font-size:18px;font-weight:600">' + t('D\u1EEF Li\u1EC7u Kh\u00E1ch H\u00E0ng','Client Records') + '</div>';
    html += '<div style="font-size:11px;color:rgba(248,242,224,.42)">' + t('Ho\u00E0n th\u00E0nh h\u1ED3 s\u01A1 \u0111\u1EC3 nh\u1EADn th\u00F9 lao','Complete records to receive compensation') + '</div></div>';
    if(clientSubPage !== 'list') {
      html += '<button onclick="window._tClientSub=\'list\';window._tEditClient=null;renderTechDash()" style="background:rgba(123,95,255,.1);border:1px solid rgba(123,95,255,.2);border-radius:8px;padding:6px 14px;color:#9B82FF;font-size:12px;font-weight:600;cursor:pointer">' + t('\u2190 Danh s\u00E1ch','\u2190 Back') + '</button>';
    }
    html += '</div>';

    // Compensation summary
    var completedClients = allClients.filter(function(c) { return c.dataComplete; });
    var pendingPay = completedClients.filter(function(c) { return !c.paid; });
    var totalEarned = completedClients.reduce(function(s,c) { return s + (c.sessionFee||150000); }, 0);

    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">';
    html += '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;font-weight:700;color:#00E5A8">' + allClients.length + '</div><div style="font-size:9px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:1px">' + t('Kh\u00E1ch h\u00E0ng','Clients') + '</div></div>';
    html += '<div style="background:#0A1218;border:1px solid rgba(245,158,11,.15);border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;font-weight:700;color:#F59E0B">' + incompleteClients.length + '</div><div style="font-size:9px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:1px">' + t('Ch\u01B0a xong','Incomplete') + '</div></div>';
    html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.15);border-radius:10px;padding:12px;text-align:center"><div style="font-size:20px;font-weight:700;color:#9B82FF">' + (totalEarned/1000000).toFixed(1) + 'M</div><div style="font-size:9px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:1px">' + t('Th\u00F9 lao','Earned') + '</div></div>';
    html += '</div>';

    if(incompleteClients.length > 0) {
      html += '<div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.15);border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;align-items:center;gap:8px">';
      html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
      html += '<span style="font-size:12px;color:#F59E0B">' + t('C\u00F2n ' + incompleteClients.length + ' kh\u00E1ch ch\u01B0a ho\u00E0n th\u00E0nh h\u1ED3 s\u01A1. Vui l\u00F2ng \u0111i\u1EC1n \u0111\u1EC3 nh\u1EADn th\u00F9 lao.', incompleteClients.length + ' clients with incomplete records. Complete to receive payment.') + '</span></div>';
    }

    // ── CLIENT LIST VIEW ──
    if(clientSubPage === 'list') {
      // Add new client button
      html += '<button onclick="window._tNewClient()" style="width:100%;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);color:#fff;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:14px;display:flex;align-items:center;justify-content:center;gap:6px">';
      html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' + t('Th\u00EAm kh\u00E1ch h\u00E0ng m\u1EDBi','Add New Client') + '</button>';

      if(allClients.length === 0) {
        html += '<div style="text-align:center;padding:40px 20px;color:rgba(248,242,224,.25)"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:10px;opacity:.4"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>';
        html += '<div style="font-size:14px">' + t('Ch\u01B0a c\u00F3 kh\u00E1ch h\u00E0ng','No clients yet') + '</div>';
        html += '<div style="font-size:12px;margin-top:4px">' + t('Nh\u1EADn l\u1ECBch h\u1EB9n ho\u1EB7c th\u00EAm kh\u00E1ch m\u1EDBi','Accept bookings or add new clients') + '</div></div>';
      }

      // Sort: incomplete first, then by date desc
      var sortedClients = allClients.slice().sort(function(a,b) {
        if(a.dataComplete !== b.dataComplete) return a.dataComplete ? 1 : -1;
        return (b.createdAt||0) - (a.createdAt||0);
      });

      sortedClients.forEach(function(cl) {
        var isComplete = cl.dataComplete;
        var sessions = cl.sessions || [];
        var lastSession = sessions.length > 0 ? sessions[sessions.length-1] : null;
        var initials = cl.name.split(' ').map(function(w){return w[0]||'';}).join('').substr(0,2).toUpperCase();
        var improveTxt = '';
        if(sessions.length >= 2) {
          var first = sessions[0].painLevel || 0;
          var last = sessions[sessions.length-1].painLevel || 0;
          var diff = first - last;
          improveTxt = diff > 0 ? ('\u2193' + diff + ' ' + t('\u0111i\u1EC3m \u0111au','pain pts')) : (diff < 0 ? ('\u2191' + Math.abs(diff)) : '\u2194 0');
        }

        html += '<div onclick="window._tViewClient(\'' + cl._id + '\')" style="background:#0A1218;border:1px solid ' + (isComplete?'rgba(0,200,150,.15)':'rgba(245,158,11,.2)') + ';border-radius:12px;padding:14px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:12px">';

        // Avatar
        html += '<div style="width:42px;height:42px;border-radius:50%;background:' + (isComplete?'linear-gradient(135deg,#00896A,#00C896)':'linear-gradient(135deg,#B8860B,#F59E0B)') + ';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0">' + initials + '</div>';

        // Info
        html += '<div style="flex:1;min-width:0">';
        html += '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + cl.name + '</span>';
        if(!isComplete) html += '<span style="font-size:8px;padding:2px 6px;border-radius:8px;background:rgba(245,158,11,.15);color:#F59E0B;font-weight:600;white-space:nowrap">' + t('CH\u01ACA XONG','INCOMPLETE') + '</span>';
        if(isComplete && !cl.paid) html += '<span style="font-size:8px;padding:2px 6px;border-radius:8px;background:rgba(0,200,150,.15);color:#00E5A8;font-weight:600;white-space:nowrap">' + t('\u0110\u1EE6 \u0110I\u1EC0U KI\u1EC6N','ELIGIBLE') + '</span>';
        html += '</div>';
        html += '<div style="font-size:11px;color:rgba(248,242,224,.42);margin-top:2px">' + (cl.phone||'--') + ' \u00B7 ' + sessions.length + ' ' + t('bu\u1ED5i','sessions');
        if(improveTxt) html += ' \u00B7 ' + improveTxt;
        html += '</div>';
        if(lastSession) {
          html += '<div style="font-size:10px;color:rgba(248,242,224,.3);margin-top:2px">' + t('L\u1EA7n cu\u1ED1i: ','Last: ') + (lastSession.date||'--') + ' - ' + (lastSession.service||'') + '</div>';
        }
        html += '</div>';

        // Arrow
        html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(248,242,224,.2)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
        html += '</div>';
      });
    }

    // ── CLIENT DETAIL VIEW ──
    else if(clientSubPage === 'detail' && editingClient) {
      var cl = allClients.find(function(c) { return c._id === editingClient; });
      if(cl) {
        var sessions = cl.sessions || [];
        var initials = cl.name.split(' ').map(function(w){return w[0]||'';}).join('').substr(0,2).toUpperCase();

        // Client header
        html += '<div style="text-align:center;margin-bottom:16px">';
        html += '<div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);display:inline-flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;margin-bottom:8px">' + initials + '</div>';
        html += '<div style="font-size:18px;font-weight:600">' + cl.name + '</div>';
        html += '<div style="font-size:12px;color:#9B82FF">' + (cl.phone||'') + ' \u00B7 ' + (cl.email||'') + '</div>';
        if(!cl.dataComplete) html += '<div style="margin-top:6px;padding:4px 12px;display:inline-block;border-radius:12px;background:rgba(245,158,11,.12);color:#F59E0B;font-size:11px;font-weight:600">' + t('\u26A0 Ch\u01B0a ho\u00E0n th\u00E0nh h\u1ED3 s\u01A1','\u26A0 Incomplete record') + '</div>';
        html += '</div>';

        // Health overview card
        html += '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.12);border-radius:14px;padding:16px;margin-bottom:12px">';
        html += '<div style="font-size:13px;font-weight:600;color:#00E5A8;margin-bottom:10px;display:flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' + t('T\u00ECnh Tr\u1EA1ng S\u1EE9c Kh\u1ECFe','Health Status') + '</div>';

        var hFields = [
          [t('Th\u1EC3 t\u1EA1ng','\u0110\u00F4ng Y'),t('Body Constitution'), cl.bodyType||t('Ch\u01B0a kh\u00E1m','Not assessed')],
          [t('Huy\u1EBFt \u00E1p','Blood Pressure'), cl.bloodPressure||'--'],
          [t('M\u1EA1ch','Pulse'), cl.pulse||'--'],
          [t('M\u1EE9c \u0111au (1-10)','Pain Level (1-10)'), cl.currentPainLevel||'--'],
          [t('D\u1ECB \u1EE9ng','Allergies'), cl.allergies||t('Kh\u00F4ng','None')],
          [t('Ti\u1EC1n s\u1EED b\u1EC7nh','Medical History'), cl.medicalHistory||'--'],
          [t('Thu\u1ED1c \u0111ang d\u00F9ng','Medications'), cl.medications||'--'],
          [t('Ghi ch\u00FA KTV','KTV Notes'), cl.ktvNotes||'--']
        ];
        hFields.forEach(function(f) {
          html += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(123,95,255,.05)">';
          html += '<div style="font-size:10px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:.8px;font-family:\'Roboto Mono\',monospace;flex-shrink:0">' + f[0] + '</div>';
          html += '<div style="font-size:12px;font-weight:500;text-align:right;max-width:55%;word-break:break-word">' + f[1] + '</div></div>';
        });
        html += '</div>';

        // Session history
        html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:14px;padding:16px;margin-bottom:12px">';
        html += '<div style="font-size:13px;font-weight:600;color:#9B82FF;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center"><span>' + t('L\u1ECBch S\u1EED Bu\u1ED5i Tr\u1ECB Li\u1EC7u','Session History') + ' (' + sessions.length + ')</span>';
        html += '<button onclick="window._tAddSession(\'' + cl._id + '\')" style="background:rgba(123,95,255,.1);border:1px solid rgba(123,95,255,.2);border-radius:6px;padding:4px 10px;color:#9B82FF;font-size:11px;font-weight:600;cursor:pointer">+ ' + t('Th\u00EAm bu\u1ED5i','Add Session') + '</button></div>';

        if(sessions.length === 0) {
          html += '<div style="text-align:center;padding:20px;color:rgba(248,242,224,.25);font-size:12px">' + t('Ch\u01B0a c\u00F3 bu\u1ED5i tr\u1ECB li\u1EC7u','No sessions yet') + '</div>';
        }

        // Progress bar if multiple sessions
        if(sessions.length >= 2) {
          var firstPain = sessions[0].painLevel || 5;
          var lastPain = sessions[sessions.length-1].painLevel || 5;
          var improve = Math.round(((firstPain - lastPain) / firstPain) * 100);
          var improveColor = improve > 0 ? '#00E5A8' : improve < 0 ? '#FF4D6D' : '#F59E0B';
          html += '<div style="background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.1);border-radius:10px;padding:12px;margin-bottom:12px;text-align:center">';
          html += '<div style="font-size:10px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">' + t('Ti\u1EBFn tri\u1EC3n \u0111au','Pain Progress') + '</div>';
          html += '<div style="font-size:28px;font-weight:700;color:' + improveColor + '">' + (improve > 0 ? '+' : '') + improve + '%</div>';
          html += '<div style="font-size:11px;color:rgba(248,242,224,.4)">' + t('Gi\u1EA3m t\u1EEB ','Reduced from ') + firstPain + '/10 \u2192 ' + lastPain + '/10 qua ' + sessions.length + ' ' + t('bu\u1ED5i','sessions') + '</div>';

          // Mini chart
          html += '<div style="display:flex;align-items:flex-end;gap:3px;height:40px;margin-top:10px;justify-content:center">';
          sessions.forEach(function(s) {
            var h = Math.max(6, ((s.painLevel||5) / 10) * 40);
            var col = (s.painLevel||5) <= 3 ? '#00E5A8' : (s.painLevel||5) <= 6 ? '#F59E0B' : '#FF4D6D';
            html += '<div style="width:' + Math.max(8, Math.floor(200/sessions.length)) + 'px;height:' + h + 'px;background:' + col + ';border-radius:3px 3px 0 0;opacity:.7" title="' + (s.date||'') + ': ' + (s.painLevel||'?') + '/10"></div>';
          });
          html += '</div>';
          html += '</div>';
        }

        sessions.slice().reverse().forEach(function(s, idx) {
          var painColor = (s.painLevel||5) <= 3 ? '#00E5A8' : (s.painLevel||5) <= 6 ? '#F59E0B' : '#FF4D6D';
          html += '<div style="border-left:3px solid ' + painColor + ';padding:10px 12px;margin-bottom:8px;background:rgba(123,95,255,.03);border-radius:0 8px 8px 0">';
          html += '<div style="display:flex;justify-content:space-between;align-items:center">';
          html += '<div style="font-size:12px;font-weight:600">' + t('Bu\u1ED5i #','Session #') + (sessions.length - idx) + '</div>';
          html += '<div style="font-size:10px;color:rgba(248,242,224,.42);font-family:\'Roboto Mono\',monospace">' + (s.date||'--') + '</div></div>';
          html += '<div style="font-size:11px;color:rgba(248,242,224,.6);margin-top:4px">' + (s.service||'') + '</div>';
          html += '<div style="display:flex;gap:12px;margin-top:6px;font-size:10px;color:rgba(248,242,224,.42)">';
          html += '<span>\u0110au: <b style="color:' + painColor + '">' + (s.painLevel||'?') + '/10</b></span>';
          if(s.improvement) html += '<span>' + t('C\u1EA3i thi\u1EC7n: ','Improvement: ') + '<b style="color:#00E5A8">' + s.improvement + '</b></span>';
          html += '</div>';
          if(s.notes) html += '<div style="font-size:11px;color:rgba(248,242,224,.35);margin-top:4px;font-style:italic">"' + s.notes + '"</div>';
          html += '</div>';
        });
        html += '</div>';

        // Action buttons
        html += '<div style="display:flex;gap:8px">';
        html += '<button onclick="window._tEditClientForm(\'' + cl._id + '\')" style="flex:1;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);color:#fff;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:600;cursor:pointer">' + t('S\u1EEDa h\u1ED3 s\u01A1','Edit Record') + '</button>';
        html += '<button onclick="window._tAddSession(\'' + cl._id + '\')" style="flex:1;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2);color:#00E5A8;border-radius:10px;padding:12px;font-size:13px;font-weight:600;cursor:pointer">' + t('+ Bu\u1ED5i m\u1EDBi','+ New Session') + '</button>';
        html += '</div>';
      }
    }

    // ── CLIENT FORM VIEW (new/edit) ──
    else if(clientSubPage === 'form') {
      var cl = editingClient ? allClients.find(function(c) { return c._id === editingClient; }) : null;
      var isNew = !cl;
      html += '<div style="font-size:16px;font-weight:600;margin-bottom:14px">' + (isNew ? t('Th\u00EAm Kh\u00E1ch H\u00E0ng M\u1EDBi','Add New Client') : t('C\u1EADp Nh\u1EADt H\u1ED3 S\u01A1','Update Record')) + '</div>';

      var fStyle = 'width:100%;background:#060C0F;border:1px solid rgba(123,95,255,.15);border-radius:8px;padding:10px 12px;color:#F8F2E0;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:10px';
      var lStyle = 'font-size:9px;color:rgba(248,242,224,.42);letter-spacing:1.5px;text-transform:uppercase;display:block;margin-bottom:3px;font-family:\'Roboto Mono\',monospace';
      var secStyle = 'background:#0A1218;border:1px solid rgba(123,95,255,.1);border-radius:12px;padding:14px;margin-bottom:12px';

      // Personal info
      html += '<div style="' + secStyle + '">';
      html += '<div style="font-size:12px;font-weight:600;color:#9B82FF;margin-bottom:10px">' + t('\u{1F4CB} Th\u00F4ng Tin C\u00E1 Nh\u00E2n','\u{1F4CB} Personal Info') + '</div>';
      html += '<label style="' + lStyle + '">' + t('H\u1ECD v\u00E0 t\u00EAn *','Full name *') + '</label><input id="cf-name" style="' + fStyle + '" value="' + (cl?cl.name:'') + '" placeholder="Nguy\u1EC5n V\u0103n A">';
      html += '<label style="' + lStyle + '">' + t('\u0110i\u1EC7n tho\u1EA1i *','Phone *') + '</label><input id="cf-phone" style="' + fStyle + '" value="' + (cl?cl.phone:'') + '" placeholder="0912 345 678">';
      html += '<label style="' + lStyle + '">Email</label><input id="cf-email" style="' + fStyle + '" value="' + (cl?cl.email||'':'') + '" placeholder="email@example.com">';
      html += '<label style="' + lStyle + '">' + t('Ng\u00E0y sinh','Date of Birth') + '</label><input id="cf-dob" type="date" style="' + fStyle + '" value="' + (cl?cl.dob||'':'') + '">';
      html += '<label style="' + lStyle + '">' + t('Gi\u1EDBi t\u00EDnh','Gender') + '</label><select id="cf-gender" style="' + fStyle + '"><option value="">' + t('Ch\u1ECDn','Select') + '</option><option value="male"' + (cl&&cl.gender==='male'?' selected':'') + '>' + t('Nam','Male') + '</option><option value="female"' + (cl&&cl.gender==='female'?' selected':'') + '>' + t('N\u1EEF','Female') + '</option></select>';
      html += '<label style="' + lStyle + '">' + t('\u0110\u1ECBa ch\u1EC9','Address') + '</label><input id="cf-addr" style="' + fStyle + '" value="' + (cl?cl.address||'':'') + '">';
      html += '<label style="' + lStyle + '">' + t('\u0110\u01A1n v\u1ECB gi\u1EDBi thi\u1EC7u','Referral Source') + '</label><input id="cf-referral" style="' + fStyle + '" value="' + (cl?cl.referral||'':'') + '" placeholder="' + t('KTV gi\u1EDBi thi\u1EC7u, Facebook, B\u1EA1n b\u00E8...','Technician, Facebook, Friends...') + '">';
      html += '</div>';

      // Health assessment
      html += '<div style="' + secStyle + '">';
      html += '<div style="font-size:12px;font-weight:600;color:#00E5A8;margin-bottom:10px">' + t('\u{1FA7A} Kh\u00E1m T\u1ED5ng Qu\u00E1t','\u{1FA7A} General Assessment') + '</div>';
      html += '<label style="' + lStyle + '">' + t('Th\u1EC3 t\u1EA1ng \u0110\u00F4ng Y','TCM Body Type') + '</label><select id="cf-body" style="' + fStyle + '">';
      html += '<option value="">' + t('Ch\u1ECDn th\u1EC3 t\u1EA1ng','Select type') + '</option>';
      ['Kh\u00ED h\u01B0|Qi Deficiency', 'Huy\u1EBFt h\u01B0|Blood Deficiency', '\u00C2m h\u01B0|Yin Deficiency', 'D\u01B0\u01A1ng h\u01B0|Yang Deficiency', '\u0110\u00E0m th\u1EA5p|Phlegm Dampness', 'Th\u1EA5p nhi\u1EC7t|Damp Heat', 'Huy\u1EBFt \u1EE9|Blood Stasis', 'Kh\u00ED tr\u1EC7|Qi Stagnation', 'B\u00ECnh h\u00F2a|Balanced'].forEach(function(v) {
        var parts = v.split('|');
        html += '<option value="' + parts[0] + '"' + (cl&&cl.bodyType===parts[0]?' selected':'') + '>' + parts[0] + (parts[1]?' (' + parts[1] + ')':'') + '</option>';
      });
      html += '</select>';
      html += '<label style="' + lStyle + '">' + t('Huy\u1EBFt \u00E1p','Blood Pressure') + '</label><input id="cf-bp" style="' + fStyle + '" value="' + (cl?cl.bloodPressure||'':'') + '" placeholder="120/80 mmHg">';
      html += '<label style="' + lStyle + '">' + t('M\u1EA1ch (nh\u1ECBp/ph\u00FAt)','Pulse (bpm)') + '</label><input id="cf-pulse" style="' + fStyle + '" value="' + (cl?cl.pulse||'':'') + '" placeholder="72">';
      html += '<label style="' + lStyle + '">' + t('M\u1EE9c \u0111au hi\u1EC7n t\u1EA1i (1-10)','Current Pain Level (1-10)') + '</label><input id="cf-pain" type="number" min="1" max="10" style="' + fStyle + '" value="' + (cl?cl.currentPainLevel||'':'') + '">';
      html += '<label style="' + lStyle + '">' + t('D\u1ECB \u1EE9ng','Allergies') + '</label><input id="cf-allergy" style="' + fStyle + '" value="' + (cl?cl.allergies||'':'') + '" placeholder="' + t('Kh\u00F4ng','None') + '">';
      html += '</div>';

      // Medical history
      html += '<div style="' + secStyle + '">';
      html += '<div style="font-size:12px;font-weight:600;color:#F59E0B;margin-bottom:10px">' + t('\u{1F4C4} Ti\u1EC1n S\u1EED B\u1EC7nh','\u{1F4C4} Medical History') + '</div>';
      html += '<label style="' + lStyle + '">' + t('B\u1EC7nh l\u00FD n\u1EC1n','Underlying Conditions') + '</label><textarea id="cf-medhist" style="' + fStyle + 'min-height:60px;resize:vertical" placeholder="' + t('Ti\u1EC3u \u0111\u01B0\u1EDDng, huy\u1EBFt \u00E1p cao...','Diabetes, hypertension...') + '">' + (cl?cl.medicalHistory||'':'') + '</textarea>';
      html += '<label style="' + lStyle + '">' + t('Thu\u1ED1c \u0111ang d\u00F9ng','Current Medications') + '</label><textarea id="cf-meds" style="' + fStyle + 'min-height:50px;resize:vertical" placeholder="' + t('T\u00EAn thu\u1ED1c, li\u1EC1u l\u01B0\u1EE3ng','Drug name, dosage') + '">' + (cl?cl.medications||'':'') + '</textarea>';
      html += '<label style="' + lStyle + '">' + t('Tri\u1EC7u ch\u1EE9ng ch\u00EDnh','Main Symptoms') + '</label><textarea id="cf-symptoms" style="' + fStyle + 'min-height:50px;resize:vertical" placeholder="' + t('\u0110au l\u01B0ng, m\u1EA5t ng\u1EE7, m\u1EC7t m\u1ECFi...','Back pain, insomnia, fatigue...') + '">' + (cl?cl.symptoms||'':'') + '</textarea>';
      html += '</div>';

      // KTV notes
      html += '<div style="' + secStyle + '">';
      html += '<div style="font-size:12px;font-weight:600;color:#9B82FF;margin-bottom:10px">' + t('\u{1F4DD} Ghi Ch\u00FA KTV','\u{1F4DD} KTV Notes') + '</div>';
      html += '<textarea id="cf-notes" style="' + fStyle + 'min-height:80px;resize:vertical" placeholder="' + t('Nh\u1EADn x\u00E9t c\u1EE7a KTV v\u1EC1 t\u00ECnh tr\u1EA1ng kh\u00E1ch h\u00E0ng...','KTV observations about client condition...') + '">' + (cl?cl.ktvNotes||'':'') + '</textarea>';
      html += '</div>';

      // Save button
      html += '<button onclick="window._tSaveClient(' + (cl ? '\'' + cl._id + '\'' : 'null') + ')" style="width:100%;background:linear-gradient(135deg,#00896A,#00C896);color:#fff;border:none;border-radius:10px;padding:14px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:8px">';
      html += t('\u2714 L\u01B0u & Ho\u00E0n Th\u00E0nh H\u1ED3 S\u01A1','\u2714 Save & Complete Record') + '</button>';
      html += '<div style="text-align:center;font-size:10px;color:rgba(248,242,224,.3)">' + t('D\u1EEF li\u1EC7u \u0111\u01B0\u1EE3c \u0111\u1ED3ng b\u1ED9 v\u1EC1 Admin CRM realtime','Data syncs to Admin CRM in realtime') + '</div>';
    }
  }

  // PROFILE PAGE
  // ═══════════════════════════════════════════
  // TAB: THU NHAP + RUT TIEN
  // ═══════════════════════════════════════════
  else if(tPage === 't-income') {
    var incData = JSON.parse(localStorage.getItem('anima_ktv_income_' + tUser.id) || '{}');
    if(!incData.totalEarned) incData.totalEarned = 0;
    if(!incData.withdrawn) incData.withdrawn = 0;
    if(!incData.pendingAmount) incData.pendingAmount = 0;
    if(!incData.transactions) incData.transactions = [];
    if(!incData.pendingWithdrawals) incData.pendingWithdrawals = [];
    var balance = incData.totalEarned - incData.withdrawn - incData.pendingAmount;
    if(balance < 0) balance = 0;

    // Calculate income from completed bookings
    var myCompleted = completed || [];
    var monthlyMap = {};
    var now = new Date();
    var thisMonth = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
    var monthIncome = 0;
    myCompleted.forEach(function(b) {
      var d = (b.completedAt || b.date || '').substring(0,7) || thisMonth;
      var amt = b.ktvPay || b.commission || 150000;
      if(!monthlyMap[d]) monthlyMap[d] = 0;
      monthlyMap[d] += amt;
      if(d === thisMonth) monthIncome += amt;
    });

    // Auto-update total from sessions if not manually set
    var autoTotal = 0;
    myCompleted.forEach(function(b){ autoTotal += (b.ktvPay || b.commission || 150000); });
    if(autoTotal > incData.totalEarned) { incData.totalEarned = autoTotal; balance = autoTotal - incData.withdrawn - incData.pendingAmount; if(balance<0) balance=0; }

    var subTab = window._incomeSubTab || 'overview';

    // Sub-tab navigation
    html += '<div style="display:flex;gap:0;margin-bottom:16px;border-radius:10px;overflow:hidden;border:1px solid rgba(123,95,255,.12)">';
    var subTabs = [{id:'overview',vi:'T\u1ED5ng quan',en:'Overview'},{id:'withdraw',vi:'R\u00FAt ti\u1EC1n',en:'Withdraw'},{id:'history',vi:'L\u1ECBch s\u1EED',en:'History'}];
    subTabs.forEach(function(st){
      var act = subTab === st.id;
      html += '<button onclick="window._incomeSubTab=\'' + st.id + '\';window._tNav(\'t-income\')" style="flex:1;padding:10px;border:none;font-size:12px;font-weight:' + (act?'700':'400') + ';cursor:pointer;background:' + (act?'rgba(123,95,255,.15)':'transparent') + ';color:' + (act?'#9B82FF':'rgba(248,242,224,.42)') + '">' + t(st.vi,st.en) + '</button>';
    });
    html += '</div>';

    // ── OVERVIEW ──
    if(subTab === 'overview') {
      // Balance card
      html += '<div style="background:linear-gradient(135deg,#1A0F3C,#0D1B2A);border:1px solid rgba(123,95,255,.25);border-radius:16px;padding:24px;margin-bottom:16px;text-align:center">';
      html += '<div style="font-size:11px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">' + t('S\u1ED1 d\u01B0 kh\u1EA3 d\u1EE5ng','Available Balance') + '</div>';
      html += '<div style="font-size:32px;font-weight:700;color:#00E5A8;font-family:\'Roboto Mono\',monospace">' + formatVND(balance) + '</div>';
      html += '<button onclick="window._incomeSubTab=\'withdraw\';window._tNav(\'t-income\')" style="margin-top:14px;padding:10px 28px;border:none;border-radius:8px;background:linear-gradient(135deg,#5B3FDF,#7B5FFF);color:#fff;font-size:13px;font-weight:600;cursor:pointer">' + t('R\u00FAt ti\u1EC1n','Withdraw') + '</button>';
      html += '</div>';

      // KPI cards
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">';
      var kpis = [
        {label:t('T\u1ED5ng thu nh\u1EADp','Total Earned'),val:formatVND(incData.totalEarned),color:'#00E5A8',icon:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6'},
        {label:t('Th\u00E1ng n\u00E0y','This Month'),val:formatVND(monthIncome),color:'#4DA6FF',icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'},
        {label:t('\u0110\u00E3 r\u00FAt','Withdrawn'),val:formatVND(incData.withdrawn),color:'#F59E0B',icon:'M5 12h14M12 5l7 7-7 7'},
        {label:t('Ch\u1EDD duy\u1EC7t','Pending'),val:formatVND(incData.pendingAmount),color:'#FF4D6D',icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'}
      ];
      kpis.forEach(function(k){
        html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:12px;padding:14px">';
        html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + k.color + '" stroke-width="2" stroke-linecap="round"><path d="' + k.icon + '"/></svg><span style="font-size:10px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:1px">' + k.label + '</span></div>';
        html += '<div style="font-size:18px;font-weight:700;color:' + k.color + ';font-family:\'Roboto Mono\',monospace">' + k.val + '</div>';
        html += '</div>';
      });
      html += '</div>';

      // Income per session breakdown
      html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:14px;padding:16px;margin-bottom:16px">';
      html += '<div style="font-size:13px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B82FF" stroke-width="2" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>' + t('Thu nh\u1EADp theo phi\u00EAn','Income per Session') + '</div>';
      // Last 5 completed sessions
      var last5 = myCompleted.slice(-5).reverse();
      if(last5.length === 0) {
        html += '<div style="text-align:center;padding:20px;color:rgba(248,242,224,.3);font-size:12px">' + t('Ch\u01B0a c\u00F3 phi\u00EAn ho\u00E0n th\u00E0nh','No completed sessions') + '</div>';
      } else {
        last5.forEach(function(s){
          var amt = s.ktvPay || s.commission || 150000;
          html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(123,95,255,.06)">';
          html += '<div><div style="font-size:13px;font-weight:500">' + (s.customerName || s.name || t('Kh\u00E1ch h\u00E0ng','Client')) + '</div>';
          html += '<div style="font-size:10px;color:rgba(248,242,224,.35)">' + (s.service || s.type || 'Anima Care') + ' \u00B7 ' + (s.completedAt || s.date || '').substring(0,10) + '</div></div>';
          html += '<div style="font-size:14px;font-weight:700;color:#00E5A8;font-family:\'Roboto Mono\',monospace">+' + formatVND(amt) + '</div>';
          html += '</div>';
        });
      }
      html += '</div>';

      // Monthly chart (simple bar)
      html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:14px;padding:16px">';
      html += '<div style="font-size:13px;font-weight:600;margin-bottom:12px">' + t('Bi\u1EC3u \u0111\u1ED3 th\u00E1ng','Monthly Chart') + '</div>';
      var months = [];
      for(var mi=5; mi>=0; mi--) {
        var md = new Date(now.getFullYear(), now.getMonth()-mi, 1);
        var mk = md.getFullYear() + '-' + String(md.getMonth()+1).padStart(2,'0');
        months.push({key:mk, label:String(md.getMonth()+1).padStart(2,'0')+'/'+md.getFullYear(), val:monthlyMap[mk]||0});
      }
      var maxVal = Math.max.apply(null, months.map(function(m){return m.val;})) || 1;
      html += '<div style="display:flex;align-items:flex-end;gap:6px;height:100px">';
      months.forEach(function(m){
        var h = Math.max(4, (m.val/maxVal)*80);
        var isCurrent = m.key === thisMonth;
        html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">';
        html += '<div style="font-size:8px;color:rgba(248,242,224,.35);font-family:\'Roboto Mono\',monospace">' + (m.val > 0 ? formatShortVND(m.val) : '-') + '</div>';
        html += '<div style="width:100%;height:' + h + 'px;border-radius:4px 4px 0 0;background:' + (isCurrent?'linear-gradient(180deg,#7B5FFF,#5B3FDF)':'rgba(123,95,255,.2)') + '"></div>';
        html += '<div style="font-size:8px;color:rgba(248,242,224,.3)">' + m.label.substring(0,2) + '</div>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    // ── WITHDRAW ──
    else if(subTab === 'withdraw') {
      // Bank info
      var bank = JSON.parse(localStorage.getItem('anima_ktv_bank_' + tUser.id) || '{}');

      html += '<div style="background:linear-gradient(135deg,#1A0F3C,#0D1B2A);border:1px solid rgba(123,95,255,.25);border-radius:16px;padding:20px;margin-bottom:16px;text-align:center">';
      html += '<div style="font-size:11px;color:rgba(248,242,224,.42);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">' + t('S\u1ED1 d\u01B0 kh\u1EA3 r\u00FAt','Withdrawable') + '</div>';
      html += '<div style="font-size:28px;font-weight:700;color:#00E5A8;font-family:\'Roboto Mono\',monospace">' + formatVND(balance) + '</div>';
      html += '</div>';

      // Bank account setup
      html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:14px;padding:16px;margin-bottom:16px">';
      html += '<div style="font-size:13px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B82FF" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>' + t('T\u00E0i kho\u1EA3n ng\u00E2n h\u00E0ng','Bank Account') + '</div>';

      var bankLbl = 'font-size:9px;color:rgba(248,242,224,.42);letter-spacing:1.5px;text-transform:uppercase;font-family:\'Roboto Mono\',monospace;display:block;margin-bottom:4px';
      var bankInp = 'width:100%;background:#060C0F;border:1px solid rgba(123,95,255,.15);border-radius:8px;padding:10px 12px;color:#F8F2E0;font-size:13px;outline:none;box-sizing:border-box';

      html += '<div style="margin-bottom:10px"><label style="' + bankLbl + '">' + t('Ng\u00E2n h\u00E0ng','Bank') + '</label>';
      html += '<select id="ktvBankName" style="' + bankInp + ';cursor:pointer;-webkit-appearance:none">';
      var banks = ['Vietcombank','Techcombank','BIDV','VietinBank','MB Bank','ACB','Sacombank','TPBank','VPBank','HDBank','Agribank','SHB','MSB','OCB','LienVietPostBank'];
      html += '<option value="">' + t('Ch\u1ECDn ng\u00E2n h\u00E0ng','Select bank') + '</option>';
      banks.forEach(function(b){ html += '<option value="' + b + '"' + (bank.bankName===b?' selected':'') + '>' + b + '</option>'; });
      html += '</select></div>';

      html += '<div style="margin-bottom:10px"><label style="' + bankLbl + '">' + t('S\u1ED1 t\u00E0i kho\u1EA3n','Account Number') + '</label>';
      html += '<input id="ktvBankAcct" style="' + bankInp + '" placeholder="VD: 1234567890" value="' + (bank.accountNumber||'') + '"></div>';

      html += '<div style="margin-bottom:10px"><label style="' + bankLbl + '">' + t('Ch\u1EE7 t\u00E0i kho\u1EA3n','Account Holder') + '</label>';
      html += '<input id="ktvBankHolder" style="' + bankInp + '" placeholder="' + t('T\u00EAn \u0111\u00FAng tr\u00EAn th\u1EBB','Name on card') + '" value="' + (bank.holderName||'') + '"></div>';

      html += '<button onclick="window._ktvSaveBank()" style="width:100%;padding:10px;border:none;border-radius:8px;background:rgba(123,95,255,.15);color:#9B82FF;font-size:12px;font-weight:600;cursor:pointer;margin-bottom:4px">' + t('L\u01B0u t\u00E0i kho\u1EA3n','Save Account') + '</button>';
      html += '</div>';

      // Withdrawal form
      html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:14px;padding:16px;margin-bottom:16px">';
      html += '<div style="font-size:13px;font-weight:600;margin-bottom:14px;display:flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E5A8" stroke-width="2" stroke-linecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>' + t('Y\u00EAu c\u1EA7u r\u00FAt ti\u1EC1n','Withdrawal Request') + '</div>';

      html += '<div style="margin-bottom:12px"><label style="' + bankLbl + '">' + t('S\u1ED1 ti\u1EC1n (VN\u0110)','Amount (VND)') + '</label>';
      html += '<input id="ktvWithdrawAmt" type="number" style="' + bankInp + ';font-size:18px;font-weight:700;font-family:\'Roboto Mono\',monospace" placeholder="0" min="50000" max="' + balance + '"></div>';

      // Quick amount buttons
      html += '<div style="display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap">';
      [100000,200000,500000,1000000].forEach(function(amt){
        if(amt <= balance || balance === 0) {
          html += '<button onclick="document.getElementById(\'ktvWithdrawAmt\').value=' + amt + '" style="padding:6px 12px;border:1px solid rgba(123,95,255,.15);border-radius:6px;background:transparent;color:#9B82FF;font-size:11px;cursor:pointer;font-family:\'Roboto Mono\',monospace">' + formatShortVND(amt) + '</button>';
        }
      });
      html += '<button onclick="document.getElementById(\'ktvWithdrawAmt\').value=' + balance + '" style="padding:6px 12px;border:1px solid rgba(0,229,168,.15);border-radius:6px;background:transparent;color:#00E5A8;font-size:11px;cursor:pointer">' + t('T\u1EA5t c\u1EA3','All') + '</button>';
      html += '</div>';

      html += '<div style="margin-bottom:14px"><label style="' + bankLbl + '">' + t('Ghi ch\u00FA','Note') + '</label>';
      html += '<input id="ktvWithdrawNote" style="' + bankInp + '" placeholder="' + t('Tu\u1EF3 ch\u1ECDn','Optional') + '"></div>';

      html += '<button onclick="window._ktvRequestWithdraw()" style="width:100%;padding:12px;border:none;border-radius:8px;background:linear-gradient(135deg,#00C896,#00E5A8);color:#060C0F;font-size:14px;font-weight:700;cursor:pointer">' + t('G\u1EEDi y\u00EAu c\u1EA7u r\u00FAt ti\u1EC1n','Submit Withdrawal') + '</button>';

      html += '<div style="margin-top:10px;font-size:10px;color:rgba(248,242,224,.3);text-align:center;line-height:1.6">' + t('T\u1ED1i thi\u1EC3u 50,000\u0111. X\u1EED l\u00FD trong 1-3 ng\u00E0y l\u00E0m vi\u1EC7c.','Min 50,000d. Processed in 1-3 business days.') + '</div>';
      html += '</div>';

      // Pending withdrawals
      var pendingW = incData.pendingWithdrawals.filter(function(w){return w.status==='pending';});
      if(pendingW.length > 0) {
        html += '<div style="background:#0A1218;border:1px solid rgba(255,77,109,.12);border-radius:14px;padding:16px">';
        html += '<div style="font-size:13px;font-weight:600;margin-bottom:10px;color:#F59E0B">' + t('\u0110ang ch\u1EDD duy\u1EC7t','Pending Approval') + ' (' + pendingW.length + ')</div>';
        pendingW.forEach(function(w){
          html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(123,95,255,.06)">';
          html += '<div><div style="font-size:13px;font-weight:600;color:#F59E0B;font-family:\'Roboto Mono\',monospace">' + formatVND(w.amount) + '</div>';
          html += '<div style="font-size:10px;color:rgba(248,242,224,.3)">' + (w.date||'').substring(0,10) + ' \u00B7 ' + (w.bankName||'') + '</div></div>';
          html += '<span style="font-size:9px;padding:3px 8px;border-radius:4px;background:rgba(245,158,11,.1);color:#F59E0B;border:1px solid rgba(245,158,11,.15)">' + t('Ch\u1EDD','Pending') + '</span>';
          html += '</div>';
        });
        html += '</div>';
      }
    }

    // ── HISTORY ──
    else if(subTab === 'history') {
      var allTx = (incData.transactions || []).concat(incData.pendingWithdrawals || []);
      allTx.sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });

      html += '<div style="background:#0A1218;border:1px solid rgba(123,95,255,.12);border-radius:14px;padding:16px">';
      html += '<div style="font-size:13px;font-weight:600;margin-bottom:12px">' + t('L\u1ECBch s\u1EED giao d\u1ECBch','Transaction History') + '</div>';

      if(allTx.length === 0) {
        html += '<div style="text-align:center;padding:30px;color:rgba(248,242,224,.3);font-size:12px">' + t('Ch\u01B0a c\u00F3 giao d\u1ECBch','No transactions yet') + '</div>';
      } else {
        allTx.forEach(function(tx){
          var isWithdraw = tx.type === 'withdraw';
          var statusColor = tx.status === 'completed' ? '#00E5A8' : tx.status === 'pending' ? '#F59E0B' : '#FF4D6D';
          var statusText = tx.status === 'completed' ? t('Th\u00E0nh c\u00F4ng','Done') : tx.status === 'pending' ? t('Ch\u1EDD','Pending') : t('T\u1EEB ch\u1ED1i','Rejected');
          html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(123,95,255,.06)">';
          html += '<div style="display:flex;align-items:center;gap:10px">';
          html += '<div style="width:32px;height:32px;border-radius:8px;background:' + (isWithdraw?'rgba(255,77,109,.08)':'rgba(0,229,168,.08)') + ';display:flex;align-items:center;justify-content:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + (isWithdraw?'#FF4D6D':'#00E5A8') + '" stroke-width="2" stroke-linecap="round"><path d="' + (isWithdraw?'M12 19V5M5 12l7-7 7 7':'M12 5v14M19 12l-7 7-7-7') + '"/></svg></div>';
          html += '<div><div style="font-size:13px;font-weight:500">' + (isWithdraw ? t('R\u00FAt ti\u1EC1n','Withdrawal') : (tx.description || t('Thu nh\u1EADp phi\u00EAn','Session Income'))) + '</div>';
          html += '<div style="font-size:10px;color:rgba(248,242,224,.3)">' + (tx.date||'').substring(0,10) + (tx.bankName ? ' \u00B7 ' + tx.bankName : '') + '</div></div></div>';
          html += '<div style="text-align:right"><div style="font-size:14px;font-weight:700;font-family:\'Roboto Mono\',monospace;color:' + (isWithdraw?'#FF4D6D':'#00E5A8') + '">' + (isWithdraw?'-':'+') + formatVND(tx.amount) + '</div>';
          html += '<div style="font-size:9px;color:' + statusColor + '">' + statusText + '</div></div>';
          html += '</div>';
        });
      }
      html += '</div>';
    }
  }

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
  html += '<style>#techDashboard{font-family:"Roboto",sans-serif}#techDashboard *{box-sizing:border-box;margin:0;padding:0}#techDashboard select{-webkit-appearance:none}#techDashboard *::-webkit-scrollbar,#techPortal *::-webkit-scrollbar{display:none!important;width:0!important}#techDashboard,#techDashboard *,#techPortal,#techPortal *{scrollbar-width:none!important;-ms-overflow-style:none!important}</style>';

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
// CLIENT DATA MANAGEMENT
// ═══════════════════════════════════════════
window._tNewClient = function() {
  window._tClientSub = 'form';
  window._tEditClient = null;
  renderTechDash();
};

window._tViewClient = function(id) {
  window._tClientSub = 'detail';
  window._tEditClient = id;
  renderTechDash();
};

window._tEditClientForm = function(id) {
  window._tClientSub = 'form';
  window._tEditClient = id;
  renderTechDash();
};

window._tSaveClient = function(existingId) {
  var name = (document.getElementById('cf-name').value || '').trim();
  var phone = (document.getElementById('cf-phone').value || '').trim();
  if(!name || !phone) {
    alert(t('Vui l\u00F2ng nh\u1EADp h\u1ECD t\u00EAn v\u00E0 s\u1ED1 \u0111i\u1EC7n tho\u1EA1i','Please enter name and phone'));
    return;
  }

  var data = {
    name: name,
    phone: phone,
    email: (document.getElementById('cf-email').value || '').trim(),
    dob: document.getElementById('cf-dob').value || '',
    gender: document.getElementById('cf-gender').value || '',
    address: (document.getElementById('cf-addr').value || '').trim(),
    referral: (document.getElementById('cf-referral').value || '').trim(),
    bodyType: document.getElementById('cf-body').value || '',
    bloodPressure: (document.getElementById('cf-bp').value || '').trim(),
    pulse: (document.getElementById('cf-pulse').value || '').trim(),
    currentPainLevel: parseInt(document.getElementById('cf-pain').value) || null,
    allergies: (document.getElementById('cf-allergy').value || '').trim(),
    medicalHistory: (document.getElementById('cf-medhist').value || '').trim(),
    medications: (document.getElementById('cf-meds').value || '').trim(),
    symptoms: (document.getElementById('cf-symptoms').value || '').trim(),
    ktvNotes: (document.getElementById('cf-notes').value || '').trim(),
    ktvId: tUser.id,
    ktvName: tUser.name,
    centerId: tUser.centerId,
    centerName: tUser.centerName,
    updatedAt: Date.now()
  };

  // Check if form is complete enough for compensation
  var requiredFields = ['name','phone','bodyType','bloodPressure','currentPainLevel','medicalHistory','symptoms','ktvNotes'];
  var filledCount = requiredFields.filter(function(f) { return data[f] && String(data[f]).trim().length > 0; }).length;
  data.dataComplete = filledCount >= 6; // at least 6/8 fields filled
  data.completionPercent = Math.round((filledCount / requiredFields.length) * 100);

  if(window.AnimaSync) {
    if(existingId) {
      // Update existing
      AnimaSync.update('crm_clients', existingId, data);
    } else {
      // Create new
      data.createdAt = Date.now();
      data.sessions = [];
      data.paid = false;
      data.sessionFee = 150000; // 150k VND default
      AnimaSync.push('crm_clients', data);
    }

    // Push activity to admin
    AnimaSync.push('activities', {
      type: 'client_record',
      vi: tUser.name + (existingId ? ' c\u1EADp nh\u1EADt' : ' th\u00EAm') + ' h\u1ED3 s\u01A1 KH: ' + name + (data.dataComplete ? ' (\u2713 Ho\u00E0n th\u00E0nh)' : ' (' + data.completionPercent + '%)'),
      en: tUser.name + (existingId ? ' updated' : ' added') + ' client record: ' + name + (data.dataComplete ? ' (\u2713 Complete)' : ' (' + data.completionPercent + '%)'),
      centerId: tUser.centerId,
      ago: 0
    });

    // Also sync to customers collection for admin CRM
    AnimaSync.push('customers', {
      name: name,
      phone: phone,
      email: data.email,
      source: 'KTV-' + tUser.id,
      centerId: tUser.centerId,
      centerName: tUser.centerName,
      ktvId: tUser.id,
      ktvName: tUser.name,
      bodyType: data.bodyType,
      healthStatus: data.symptoms,
      painLevel: data.currentPainLevel,
      referral: data.referral,
      createdAt: data.createdAt || Date.now()
    });
  }

  // Navigate back to detail or list
  if(existingId) {
    window._tClientSub = 'detail';
    window._tEditClient = existingId;
  } else {
    window._tClientSub = 'list';
    window._tEditClient = null;
  }
  renderTechDash();

  var msg = data.dataComplete
    ? t('\u2714 H\u1ED3 s\u01A1 ho\u00E0n th\u00E0nh! \u0110\u1EE7 \u0111i\u1EC1u ki\u1EC7n nh\u1EADn th\u00F9 lao.','\u2714 Record complete! Eligible for compensation.')
    : t('\u0110\u00E3 l\u01B0u! C\u1EA7n \u0111i\u1EC1n th\u00EAm \u0111\u1EC3 ho\u00E0n th\u00E0nh h\u1ED3 s\u01A1.','Saved! Fill more fields to complete the record.');
  if(typeof showToast === 'function') showToast(msg, data.dataComplete ? '#00C896' : '#F59E0B');
};

window._tAddSession = function(clientId) {
  var service = prompt(t('D\u1ECBch v\u1EE5 th\u1EF1c hi\u1EC7n:','Service performed:'), tUser.specialty.split(',')[0].trim());
  if(!service) return;
  var painLevel = parseInt(prompt(t('M\u1EE9c \u0111au sau tr\u1ECB li\u1EC7u (1-10):','Pain level after treatment (1-10):'), '5'));
  if(isNaN(painLevel) || painLevel < 1 || painLevel > 10) painLevel = 5;
  var improvement = prompt(t('C\u1EA3i thi\u1EC7n (VD: Gi\u1EA3m \u0111au l\u01B0ng 30%, ng\u1EE7 t\u1ED1t h\u01A1n):','Improvement (e.g. Back pain -30%, better sleep):'), '');
  var notes = prompt(t('Ghi ch\u00FA bu\u1ED5i tr\u1ECB li\u1EC7u:','Session notes:'), '');

  var sessionData = {
    date: new Date().toISOString().split('T')[0],
    time: new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2,'0'),
    service: service,
    painLevel: painLevel,
    improvement: improvement || '',
    notes: notes || '',
    ktvId: tUser.id,
    ktvName: tUser.name,
    centerId: tUser.centerId
  };

  if(window.AnimaSync) {
    var clients = AnimaSync.get('crm_clients', []);
    var cl = clients.find(function(c) { return c._id === clientId; });
    if(cl) {
      var sessions = cl.sessions || [];
      sessions.push(sessionData);
      AnimaSync.update('crm_clients', clientId, {
        sessions: sessions,
        currentPainLevel: painLevel,
        lastSessionDate: sessionData.date,
        updatedAt: Date.now()
      });

      // Push to admin activity feed
      AnimaSync.push('activities', {
        type: 'session_complete',
        vi: tUser.name + ' ho\u00E0n th\u00E0nh bu\u1ED5i #' + sessions.length + ' cho ' + cl.name + ' - \u0110au: ' + painLevel + '/10',
        en: tUser.name + ' completed session #' + sessions.length + ' for ' + cl.name + ' - Pain: ' + painLevel + '/10',
        centerId: tUser.centerId,
        ago: 0
      });

      // Sync session to bookings (admin can see completed sessions)
      AnimaSync.push('bookings', {
        centerId: tUser.centerId,
        centerName: tUser.centerName,
        customer: cl.name,
        service: service,
        date: sessionData.date,
        time: sessionData.time,
        status: 'completed',
        ktvId: tUser.id,
        ktvName: tUser.name,
        painLevel: painLevel,
        sessionNumber: sessions.length,
        fromClientRecord: true
      });
    }
  }

  window._tClientSub = 'detail';
  window._tEditClient = clientId;
  renderTechDash();
  if(typeof showToast === 'function') showToast(t('\u0110\u00E3 th\u00EAm bu\u1ED5i tr\u1ECB li\u1EC7u!','Session added!'), '#00C896');
};

// Also auto-create client record when KTV accepts a booking
var origAccept = window._tAccept;
window._tAccept = function(id) {
  origAccept(id);
  // Auto-create client stub in crm_clients if not exists
  if(window.AnimaSync) {
    var booking = AnimaSync.get('bookings', []).find(function(b) { return b._id === id; });
    if(booking && booking.customer) {
      var existing = AnimaSync.get('crm_clients', []).find(function(c) {
        return c.name === booking.customer && c.ktvId === tUser.id;
      });
      if(!existing) {
        AnimaSync.push('crm_clients', {
          name: booking.customer,
          phone: '',
          email: '',
          ktvId: tUser.id,
          ktvName: tUser.name,
          centerId: tUser.centerId,
          centerName: tUser.centerName,
          sessions: [],
          dataComplete: false,
          completionPercent: 0,
          paid: false,
          sessionFee: 150000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          fromBooking: booking._id,
          service: booking.service
        });
      }
    }
  }
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
  AnimaSync.on('crm_clients', function() {
    if(document.getElementById('techDashboard').style.display !== 'none') renderTechDash();
  });
}

// ═══════════════════════════════════════════
// ADD NAV BUTTON + AUTO-RESTORE
// ═══════════════════════════════════════════
function addTechButton() {
  // Portal access is now in user dropdown menu, no separate nav button needed
}

// ═══════════════════════════════════════════
// INCOME HELPERS
// ═══════════════════════════════════════════
function formatVND(n) {
  if(!n || n === 0) return '0\u0111';
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '\u0111';
}
function formatShortVND(n) {
  if(n >= 1000000) return (n/1000000) + 'tr';
  if(n >= 1000) return (n/1000) + 'k';
  return n + '\u0111';
}

window._ktvSaveBank = function() {
  if(!tUser) return;
  var bankName = document.getElementById('ktvBankName').value;
  var accountNumber = document.getElementById('ktvBankAcct').value.trim();
  var holderName = document.getElementById('ktvBankHolder').value.trim();
  if(!bankName || !accountNumber || !holderName) {
    if(typeof showToast === 'function') showToast(t('Vui long dien day du thong tin ngan hang','Please fill in all bank details'), '#FF7070');
    return;
  }
  var bankData = { bankName:bankName, accountNumber:accountNumber, holderName:holderName, updatedAt:new Date().toISOString() };
  localStorage.setItem('anima_ktv_bank_' + tUser.id, JSON.stringify(bankData));
  if(typeof showToast === 'function') showToast(t('Da luu tai khoan ngan hang!','Bank account saved!'), '#00C896');
};

window._ktvRequestWithdraw = function() {
  if(!tUser) return;
  var amtEl = document.getElementById('ktvWithdrawAmt');
  var noteEl = document.getElementById('ktvWithdrawNote');
  var amount = parseInt(amtEl ? amtEl.value : 0);
  var note = noteEl ? noteEl.value.trim() : '';

  // Validate bank
  var bank = JSON.parse(localStorage.getItem('anima_ktv_bank_' + tUser.id) || '{}');
  if(!bank.bankName || !bank.accountNumber) {
    if(typeof showToast === 'function') showToast(t('Vui long nhap tai khoan ngan hang truoc','Please add bank account first'), '#FF7070');
    return;
  }
  // Validate amount
  if(!amount || amount < 50000) {
    if(typeof showToast === 'function') showToast(t('So tien toi thieu la 50,000d','Minimum withdrawal is 50,000d'), '#FF7070');
    return;
  }
  var incData = JSON.parse(localStorage.getItem('anima_ktv_income_' + tUser.id) || '{}');
  if(!incData.totalEarned) incData.totalEarned = 0;
  if(!incData.withdrawn) incData.withdrawn = 0;
  if(!incData.pendingAmount) incData.pendingAmount = 0;
  if(!incData.pendingWithdrawals) incData.pendingWithdrawals = [];
  if(!incData.transactions) incData.transactions = [];

  var balance = incData.totalEarned - incData.withdrawn - incData.pendingAmount;
  if(amount > balance) {
    if(typeof showToast === 'function') showToast(t('So du khong du!','Insufficient balance!'), '#FF7070');
    return;
  }

  var withdrawal = {
    id: 'WD-' + Date.now().toString(36).toUpperCase(),
    type: 'withdraw',
    amount: amount,
    note: note,
    bankName: bank.bankName,
    accountNumber: bank.accountNumber,
    holderName: bank.holderName,
    ktvId: tUser.id,
    ktvName: tUser.name,
    status: 'pending',
    date: new Date().toISOString()
  };

  incData.pendingAmount += amount;
  incData.pendingWithdrawals.push(withdrawal);
  localStorage.setItem('anima_ktv_income_' + tUser.id, JSON.stringify(incData));

  // Sync to admin
  if(window.AnimaSync) {
    AnimaSync.push('ktv_withdrawals', withdrawal);
    AnimaSync.push('activities', {
      type: 'ktv_withdraw',
      vi: tUser.name + ' yeu cau rut ' + formatVND(amount),
      en: tUser.name + ' requested withdrawal ' + formatVND(amount),
      ktvId: tUser.id,
      amount: amount,
      ago: 0
    });
  }

  if(typeof showToast === 'function') showToast(t('Da gui yeu cau rut tien! Xu ly trong 1-3 ngay.','Withdrawal submitted! Processing in 1-3 days.'), '#00C896');
  window._incomeSubTab = 'overview';
  renderTechDash();
};

// Auto-record income when KTV completes a session
var _origComplete = window._tComplete;
window._tComplete = function(id) {
  if(_origComplete) _origComplete(id);
  // Add income record
  if(tUser) {
    var incData = JSON.parse(localStorage.getItem('anima_ktv_income_' + tUser.id) || '{}');
    if(!incData.totalEarned) incData.totalEarned = 0;
    if(!incData.transactions) incData.transactions = [];
    var sessionPay = 150000; // default per session
    incData.totalEarned += sessionPay;
    incData.transactions.push({
      id: 'TX-' + Date.now().toString(36).toUpperCase(),
      type: 'income',
      amount: sessionPay,
      description: t('Phien dieu tri ' + id, 'Session ' + id),
      status: 'completed',
      date: new Date().toISOString()
    });
    localStorage.setItem('anima_ktv_income_' + tUser.id, JSON.stringify(incData));
  }
};

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
