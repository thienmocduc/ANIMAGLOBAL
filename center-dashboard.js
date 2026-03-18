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

// Load registered accounts from localStorage
try {
  var saved = JSON.parse(localStorage.getItem('anima_center_accounts') || '[]');
  saved.forEach(function(a) {
    var exists = CENTER_ACCOUNTS.some(function(c) { return c.id === a.id; });
    if(!exists) CENTER_ACCOUNTS.push(a);
  });
} catch(e) {}

function t(vi, en) { return cLang === 'vi' ? vi : en; }

// ── Inject HTML ──
function injectCenterPortal() {
  var S = 'style', C = 'center', inp = 'width:100%;background:#060C0F;border:1px solid rgba(0,200,150,.12);border-radius:8px;padding:11px 14px;color:#F8F2E0;font-size:14px;outline:none;box-sizing:border-box';
  var lbl = 'font-size:9px;color:rgba(248,242,224,.42);letter-spacing:2px;text-transform:uppercase;font-family:\'Roboto Mono\',monospace;display:block;margin-bottom:4px';
  var btn = 'width:100%;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:600;cursor:pointer';
  var tabBase = 'flex:1;padding:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;color:rgba(248,242,224,.42);transition:all .2s';
  var tabOn = tabBase + ';color:#00E5A8;border-bottom-color:#00C896';

  var portal = document.createElement('div');
  portal.id = 'centerPortal';
  portal.innerHTML =
    '<div style="position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:none;align-items:center;justify-content:center;padding:20px;overflow-y:auto">' +
    '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.15);border-radius:20px;padding:0;width:100%;max-width:440px;position:relative;overflow:hidden">' +

    // Header
    '<div style="text-align:center;padding:28px 32px 0">' +
    '<div style="width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#005A42,#00C896);display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>' +
    '<h2 style="color:#F8F2E0;font-size:20px;font-weight:600;margin:0">C\u1ED5ng Qu\u1EA3n L\u00FD C\u01A1 S\u1EDF</h2>' +
    '<p style="color:rgba(248,242,224,.42);font-size:12px;margin-top:4px">Center Management Portal</p></div>' +

    // Tabs
    '<div style="display:flex;margin:20px 32px 0;border-bottom:1px solid rgba(0,200,150,.1)">' +
    '<button id="cpTabLogin" onclick="window._cpSwitchTab(\'login\')" style="' + tabOn + '">\u0110\u0103ng Nh\u1EADp</button>' +
    '<button id="cpTabRegister" onclick="window._cpSwitchTab(\'register\')" style="' + tabBase + '">\u0110\u0103ng K\u00FD</button>' +
    '</div>' +

    // Error box
    '<div id="cpError" style="display:none;background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.2);border-radius:8px;padding:8px 12px;margin:12px 32px 0;color:#FF4D6D;font-size:12px;text-align:center"></div>' +
    '<div id="cpSuccess" style="display:none;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2);border-radius:8px;padding:8px 12px;margin:12px 32px 0;color:#00E5A8;font-size:12px;text-align:center"></div>' +

    // ═══ LOGIN FORM ═══
    '<div id="cpLoginForm" style="padding:20px 32px 28px">' +
    '<div style="margin-bottom:14px"><label style="' + lbl + '">CENTER ID</label>' +
    '<input id="cpIdInput" style="' + inp + '" placeholder="VD: CTR001"></div>' +
    '<div style="margin-bottom:20px"><label style="' + lbl + '">M\u1EACT KH\u1EA8U</label>' +
    '<input id="cpPwdInput" type="password" style="' + inp + '" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"></div>' +
    '<button onclick="window._centerLogin()" style="' + btn + ';background:linear-gradient(135deg,#005A42,#00C896);color:#000">\u0110\u0103ng Nh\u1EADp</button>' +
    '<p style="text-align:center;margin-top:14px;font-size:12px;color:rgba(248,242,224,.32)">Ch\u01B0a c\u00F3 t\u00E0i kho\u1EA3n? <a href="#" onclick="window._cpSwitchTab(\'register\');return false" style="color:#00C896;text-decoration:none">\u0110\u0103ng k\u00FD ngay</a></p>' +
    '</div>' +

    // ═══ REGISTER FORM ═══
    '<div id="cpRegisterForm" style="display:none;padding:20px 32px 28px">' +

    // Row 1: Name + Phone
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div><label style="' + lbl + '">H\u1ECC V\u00C0 T\u00CAN</label>' +
    '<input id="cpRegName" style="' + inp + '" placeholder="Nguy\u1EC5n V\u0103n A"></div>' +
    '<div><label style="' + lbl + '">\u0110I\u1EC6N THO\u1EA0I</label>' +
    '<input id="cpRegPhone" style="' + inp + '" placeholder="0912 345 678"></div></div>' +

    // Row 2: Email
    '<div style="margin-bottom:12px"><label style="' + lbl + '">EMAIL</label>' +
    '<input id="cpRegEmail" type="email" style="' + inp + '" placeholder="email@example.com"></div>' +

    // Row 3: Center Name + City
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div><label style="' + lbl + '">T\u00CAN C\u01A0 S\u1EDE</label>' +
    '<input id="cpRegCenter" style="' + inp + '" placeholder="Anima Care + T\u1EC9nh"></div>' +
    '<div><label style="' + lbl + '">TH\u00C0NH PH\u1ED0</label>' +
    '<select id="cpRegCity" style="' + inp + ';cursor:pointer;-webkit-appearance:none">' +
    '<option value="">Ch\u1ECDn th\u00E0nh ph\u1ED1...</option>' +
    '<option>H\u00E0 N\u1ED9i</option><option>TP.HCM</option><option>\u0110\u00E0 N\u1EB5ng</option>' +
    '<option>H\u1EA3i Ph\u00F2ng</option><option>C\u1EA7n Th\u01A1</option><option>Nha Trang</option>' +
    '<option>Hu\u1EBF</option><option>V\u0169ng T\u00E0u</option><option>Qu\u1EA3ng Ninh</option>' +
    '<option>Bi\u00EAn H\u00F2a</option><option>B\u00ECnh D\u01B0\u01A1ng</option><option>Kh\u00E1c</option>' +
    '</select></div></div>' +

    // Row 4: Address
    '<div style="margin-bottom:12px"><label style="' + lbl + '">\u0110\u1ECAA CH\u1EC8</label>' +
    '<input id="cpRegAddr" style="' + inp + '" placeholder="S\u1ED1 nh\u00E0, \u0111\u01B0\u1EDDng, qu\u1EADn/huy\u1EC7n"></div>' +

    // Row 5: Referral
    '<div style="margin-bottom:12px"><label style="' + lbl + '">\u0110\u01A0N V\u1ECA GI\u1EDAI THI\u1EC6U</label>' +
    '<input id="cpRegRef" style="' + inp + '" placeholder="T\u00EAn ng\u01B0\u1EDDi/\u0111\u01A1n v\u1ECB gi\u1EDBi thi\u1EC7u (n\u1EBFu c\u00F3)"></div>' +

    // Row 6: Type + Capacity
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div><label style="' + lbl + '">LO\u1EA0I C\u01A0 S\u1EDE</label>' +
    '<select id="cpRegType" style="' + inp + ';cursor:pointer;-webkit-appearance:none">' +
    '<option value="Lite">Lite \u2014 C\u01A1 b\u1EA3n</option>' +
    '<option value="Full">Full \u2014 \u0110\u1EA7y \u0111\u1EE7</option>' +
    '</select></div>' +
    '<div><label style="' + lbl + '">S\u1EE8C CH\u1EE8A (ng\u01B0\u1EDDi)</label>' +
    '<input id="cpRegCap" type="number" style="' + inp + '" placeholder="30" value="30"></div></div>' +

    // Row 6: Password + Confirm
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div><label style="' + lbl + '">M\u1EACT KH\u1EA8U</label>' +
    '<input id="cpRegPwd" type="password" style="' + inp + '" placeholder="T\u1ED1i thi\u1EC3u 8 k\u00FD t\u1EF1"></div>' +
    '<div><label style="' + lbl + '">X\u00C1C NH\u1EACN MK</label>' +
    '<input id="cpRegPwd2" type="password" style="' + inp + '" placeholder="Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u"></div></div>' +

    // Terms
    '<label style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px;cursor:pointer;font-size:12px;color:rgba(248,242,224,.52)">' +
    '<input type="checkbox" id="cpRegTerms" style="margin-top:2px;accent-color:#00C896">' +
    '<span>T\u00F4i \u0111\u1ED3ng \u00FD v\u1EDBi <a href="#" style="color:#00C896;text-decoration:none">\u0110i\u1EC1u kho\u1EA3n nh\u01B0\u1EE3ng quy\u1EC1n</a> v\u00E0 <a href="#" style="color:#00C896;text-decoration:none">Ch\u00EDnh s\u00E1ch b\u1EA3o m\u1EADt</a> c\u1EE7a AnimaCare Global</span></label>' +

    // Submit
    '<button onclick="window._centerRegister()" style="' + btn + ';background:linear-gradient(135deg,#005A42,#00C896);color:#000">\u0110\u0103ng K\u00FD C\u01A1 S\u1EDF</button>' +
    '<p style="text-align:center;margin-top:14px;font-size:12px;color:rgba(248,242,224,.32)">\u0110\u00E3 c\u00F3 t\u00E0i kho\u1EA3n? <a href="#" onclick="window._cpSwitchTab(\'login\');return false" style="color:#00C896;text-decoration:none">\u0110\u0103ng nh\u1EADp</a></p>' +
    '</div>' +

    // Close button
    '<button onclick="window._closeCenterPortal()" style="position:absolute;top:14px;right:14px;background:rgba(248,242,224,.06);border:none;color:rgba(248,242,224,.42);font-size:16px;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center">\u2715</button>' +
    '</div></div>';
  document.body.appendChild(portal);

  // Dashboard Container
  var dash = document.createElement('div');
  dash.id = 'centerDashboard';
  dash.style.cssText = 'display:none;position:fixed;inset:0;z-index:10001;background:#030608;overflow:hidden;height:100vh;width:100vw';
  document.body.appendChild(dash);
}

// ── Tab Switching ──
window._cpSwitchTab = function(tab) {
  var loginTab = document.getElementById('cpTabLogin');
  var regTab = document.getElementById('cpTabRegister');
  var loginForm = document.getElementById('cpLoginForm');
  var regForm = document.getElementById('cpRegisterForm');
  var err = document.getElementById('cpError');
  var suc = document.getElementById('cpSuccess');
  if(err) err.style.display = 'none';
  if(suc) suc.style.display = 'none';

  var onStyle = 'flex:1;padding:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid #00C896;background:transparent;color:#00E5A8;transition:all .2s';
  var offStyle = 'flex:1;padding:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;border-bottom:2px solid transparent;background:transparent;color:rgba(248,242,224,.42);transition:all .2s';

  if(tab === 'login') {
    loginTab.style.cssText = onStyle;
    regTab.style.cssText = offStyle;
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
  } else {
    loginTab.style.cssText = offStyle;
    regTab.style.cssText = onStyle;
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
  }
};

// ── Portal Logic ──
window._openCenterPortal = function(tab) {
  var p = document.getElementById('centerPortal').firstChild;
  p.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  window._cpSwitchTab(tab || 'login');
  if(!tab || tab === 'login') {
    setTimeout(function() {
      var idEl = document.getElementById('cpIdInput');
      if(idEl) idEl.focus();
      /* Auto-fill saved center credentials */
      try{var saved=JSON.parse(localStorage.getItem('anima_saved_center'));if(saved&&saved.id){idEl.value=saved.id;var pwdEl=document.getElementById('cpPwdInput');if(pwdEl)pwdEl.value=atob(saved.pwd);}}catch(ex){}
    }, 200);
  } else {
    setTimeout(function() { document.getElementById('cpRegName').focus(); }, 200);
  }
};

window._closeCenterPortal = function() {
  document.getElementById('centerPortal').firstChild.style.display = 'none';
  document.body.style.overflow = '';
};

// ── Center Registration ──
window._centerRegister = function() {
  var err = document.getElementById('cpError');
  var suc = document.getElementById('cpSuccess');
  err.style.display = 'none';
  suc.style.display = 'none';

  var name = (document.getElementById('cpRegName').value || '').trim();
  var phone = (document.getElementById('cpRegPhone').value || '').trim();
  var email = (document.getElementById('cpRegEmail').value || '').trim();
  var centerName = (document.getElementById('cpRegCenter').value || '').trim();
  var city = document.getElementById('cpRegCity').value;
  var addr = (document.getElementById('cpRegAddr').value || '').trim();
  var type = document.getElementById('cpRegType').value;
  var cap = parseInt(document.getElementById('cpRegCap').value) || 30;
  var referral = (document.getElementById('cpRegRef').value || '').trim();
  var pwd = document.getElementById('cpRegPwd').value;
  var pwd2 = document.getElementById('cpRegPwd2').value;
  var terms = document.getElementById('cpRegTerms').checked;

  // Validate
  if(!name) { showCPError(t('Vui l\u00F2ng nh\u1EADp h\u1ECD t\u00EAn','Please enter your name')); return; }
  if(!phone) { showCPError(t('Vui l\u00F2ng nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i','Please enter phone number')); return; }
  if(!email || !email.includes('@')) { showCPError(t('Email kh\u00F4ng h\u1EE3p l\u1EC7','Invalid email address')); return; }
  if(!centerName) { showCPError(t('Vui l\u00F2ng nh\u1EADp t\u00EAn c\u01A1 s\u1EDF','Please enter center name')); return; }
  if(!city) { showCPError(t('Vui l\u00F2ng ch\u1ECDn th\u00E0nh ph\u1ED1','Please select city')); return; }
  if(!addr) { showCPError(t('Vui l\u00F2ng nh\u1EADp \u0111\u1ECBa ch\u1EC9','Please enter address')); return; }
  if(!pwd || pwd.length < 8) { showCPError(t('M\u1EADt kh\u1EA9u t\u1ED1i thi\u1EC3u 8 k\u00FD t\u1EF1','Password must be at least 8 characters')); return; }
  if(pwd !== pwd2) { showCPError(t('M\u1EADt kh\u1EA9u x\u00E1c nh\u1EADn kh\u00F4ng kh\u1EDBp','Passwords do not match')); return; }
  if(!terms) { showCPError(t('Vui l\u00F2ng \u0111\u1ED3ng \u00FD \u0111i\u1EC1u kho\u1EA3n','Please accept the terms')); return; }

  // Check duplicate
  var existing = JSON.parse(localStorage.getItem('anima_center_accounts') || '[]');
  var dupEmail = existing.some(function(a) { return a.email === email; });
  var dupPhone = existing.some(function(a) { return a.phone === phone; });
  if(dupEmail) { showCPError(t('Email \u0111\u00E3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng','Email already registered')); return; }
  if(dupPhone) { showCPError(t('S\u1ED1 \u0111i\u1EC7n tho\u1EA1i \u0111\u00E3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng','Phone already registered')); return; }

  // Generate Center ID
  var maxNum = 8; // Start after hardcoded CTR008
  existing.forEach(function(a) {
    var n = parseInt(a.id.replace('CTR',''));
    if(n > maxNum) maxNum = n;
  });
  var newId = 'CTR' + String(maxNum + 1).padStart(3, '0');

  // Create account
  var newAccount = {
    id: newId,
    pwd: pwd,
    name: name,
    phone: phone,
    email: email,
    centerId: newId,
    centerName: centerName,
    centerNameEn: centerName,
    city: city,
    address: addr,
    type: type,
    capacity: cap,
    referral: referral,
    role: 'center_manager',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage
  existing.push(newAccount);
  localStorage.setItem('anima_center_accounts', JSON.stringify(existing));

  // Also add to CENTER_ACCOUNTS array for immediate login
  CENTER_ACCOUNTS.push(newAccount);

  // Add center to sync store
  if(window.AnimaSync) {
    var centers = AnimaSync.get('centers', []);
    centers.push({
      _id: newId,
      name: centerName,
      nameEn: centerName,
      city: city,
      cityEn: city,
      address: addr,
      status: 'pending',
      manager: name,
      phone: phone,
      type: type,
      capacity: cap
    });
    AnimaSync.set('centers', centers);

    // Add activity
    AnimaSync.push('activities', {
      type: 'center_new',
      vi: 'C\u01A1 s\u1EDF m\u1EDBi \u0111\u0103ng k\u00FD: ' + centerName + ' (' + city + ')',
      en: 'New center registered: ' + centerName + ' (' + city + ')',
      centerId: newId,
      ago: 0
    });
  }

  // Show success
  suc.style.display = 'block';
  suc.innerHTML = '<strong>' + t('\u0110\u0103ng k\u00FD th\u00E0nh c\u00F4ng!','Registration successful!') + '</strong><br>' +
    t('Center ID c\u1EE7a b\u1EA1n: ','Your Center ID: ') + '<strong style="color:#F8F2E0">' + newId + '</strong><br>' +
    '<span style="font-size:11px;opacity:.7">' + t('Tr\u1EA1ng th\u00E1i: Ch\u1EDD duy\u1EC7t b\u1EDFi Admin. B\u1EA1n c\u00F3 th\u1EC3 \u0111\u0103ng nh\u1EADp ngay.','Status: Pending admin approval. You can login now.') + '</span>';

  // Clear form
  ['cpRegName','cpRegPhone','cpRegEmail','cpRegCenter','cpRegAddr','cpRegRef','cpRegPwd','cpRegPwd2'].forEach(function(id) {
    var el = document.getElementById(id);
    if(el) el.value = '';
  });
  document.getElementById('cpRegCity').selectedIndex = 0;
  document.getElementById('cpRegTerms').checked = false;

  // Auto switch to login after 3s
  setTimeout(function() {
    window._cpSwitchTab('login');
    document.getElementById('cpIdInput').value = newId;
    document.getElementById('cpIdInput').focus();
  }, 3000);
};

function showCPError(msg) {
  var err = document.getElementById('cpError');
  err.style.display = 'block';
  err.textContent = msg;
  // Scroll error into view
  err.scrollIntoView({ behavior:'smooth', block:'center' });
}

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
  /* Save center credentials for auto-fill */
  localStorage.setItem('anima_saved_center', JSON.stringify({id:id, pwd:btoa(pwd), ts:Date.now()}));
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

  // Apply dashboard styles (self-contained, not dependent on admin)
  var styleTag = document.getElementById('adminDashStyle');
  if(styleTag) {
    html = '<style>' + styleTag.textContent.replace(/#adminDashboard/g, '#centerDashboard') + '</style>' + html;
  } else {
    // Fallback: inject essential styles directly
    html = '<style>'
    + '#centerDashboard{height:100vh!important;width:100vw!important}'
    + '#centerDashboard *{margin:0;padding:0;box-sizing:border-box}'
    + '#centerDashboard .app{display:grid!important;grid-template-columns:220px 1fr!important;height:100vh!important;overflow:hidden}'
    + '#centerDashboard .sb{background:#060C0F;border-right:0.5px solid rgba(0,200,150,.12);display:flex!important;flex-direction:column;height:100vh!important;overflow:hidden;width:220px!important;min-width:220px!important;position:relative;z-index:20}'
    + '#centerDashboard .sb::before{content:"";position:absolute;top:0;left:0;right:0;height:160px;background:radial-gradient(ellipse 140% 100% at 20% 0%,rgba(0,200,150,.09),transparent);pointer-events:none}'
    + '#centerDashboard .sb-logo{padding:18px 18px 14px;border-bottom:0.5px solid rgba(0,200,150,.06);flex-shrink:0;display:flex;align-items:center;gap:10px}'
    + '#centerDashboard .sb-user{padding:11px 14px;border-bottom:0.5px solid rgba(0,200,150,.06);display:flex;align-items:center;gap:10px;flex-shrink:0}'
    + '#centerDashboard .sb-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#7B5FFF,#9B82FF);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}'
    + '#centerDashboard .sb-un{font-size:12.5px;font-weight:600;color:#F8F2E0}'
    + '#centerDashboard .sb-ur{font-family:"Roboto Mono",monospace;font-size:8.5px;color:#00C896;letter-spacing:1px}'
    + '#centerDashboard nav{flex:1;overflow-y:auto;padding:10px 8px;display:flex;flex-direction:column;gap:1px}'
    + '#centerDashboard .sb-grp{font-family:"Roboto Mono",monospace;font-size:8px;font-weight:600;color:rgba(248,242,224,.22);letter-spacing:2px;text-transform:uppercase;padding:10px 10px 4px;margin-top:2px}'
    + '#centerDashboard .sb-i{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;transition:all .16s;color:rgba(248,242,224,.42);font-size:12.5px;font-weight:500;position:relative;white-space:nowrap}'
    + '#centerDashboard .sb-i:hover{background:rgba(0,200,150,.06);color:rgba(248,242,224,.72)}'
    + '#centerDashboard .sb-i.on{background:rgba(0,200,150,.1);color:#00E5A8}'
    + '#centerDashboard .sb-i.on::before{content:"";position:absolute;left:0;top:5px;bottom:5px;width:2px;background:#00C896;border-radius:0 2px 2px 0}'
    + '#centerDashboard .sb-i svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}'
    + '#centerDashboard .sb-bx{margin-left:auto;background:#00C896;color:#000;font-family:"Roboto Mono",monospace;font-size:8.5px;font-weight:700;border-radius:20px;padding:1px 6px;line-height:1.6;flex-shrink:0}'
    + '#centerDashboard .sb-bx.r{background:#FF4D6D;color:#fff}'
    + '#centerDashboard .sb-ft{padding:10px 8px;border-top:0.5px solid rgba(0,200,150,.06);flex-shrink:0;display:flex;gap:6px}'
    + '#centerDashboard .sb-ft-b{flex:1;padding:7px 6px;border-radius:7px;background:transparent;border:0.5px solid rgba(0,200,150,.12);cursor:pointer;color:rgba(248,242,224,.42);font-size:11px;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .16s}'
    + '#centerDashboard .sb-ft-b:hover{background:rgba(0,200,150,.06);color:rgba(248,242,224,.72)}'
    + '#centerDashboard .main{display:flex;flex-direction:column;overflow:hidden;min-width:0}'
    + '#centerDashboard .top{height:50px;border-bottom:0.5px solid rgba(0,200,150,.06);display:flex;align-items:center;padding:0 22px;gap:14px;background:#030608;flex-shrink:0}'
    + '#centerDashboard .pages{flex:1;overflow:hidden;position:relative}'
    + '#centerDashboard .pg{position:absolute;inset:0;overflow-y:auto;padding:22px 24px;opacity:0;visibility:hidden;transition:opacity .18s}'
    + '#centerDashboard .pg.on{opacity:1;visibility:visible}'
    + '#centerDashboard .pg-hd{margin-bottom:20px}'
    + '#centerDashboard .pg-title{font-size:22px;font-weight:600;color:#F8F2E0;margin-bottom:3px}'
    + '#centerDashboard .pg-title em{font-style:italic;color:#00E5A8}'
    + '#centerDashboard .pg-sub{font-size:12.5px;color:rgba(248,242,224,.42)}'
    + '#centerDashboard .kpi-g{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}'
    + '#centerDashboard .kpi{background:#0A1218;border:0.5px solid rgba(0,200,150,.12);border-radius:13px;padding:16px 14px;cursor:pointer;transition:all .18s}'
    + '#centerDashboard .kpi:hover{border-color:rgba(0,200,150,.3);transform:translateY(-1px)}'
    + '#centerDashboard .kpi-ic{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px}'
    + '#centerDashboard .kpi-l{font-family:"Roboto Mono",monospace;font-size:9px;color:rgba(248,242,224,.22);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px}'
    + '#centerDashboard .kpi-v{font-size:24px;font-weight:700;color:#F8F2E0;line-height:1;margin-bottom:7px}'
    + '#centerDashboard .kpi-v sub{font-size:13px;font-weight:400;color:rgba(248,242,224,.42)}'
    + '#centerDashboard .kpi-tr{display:flex;align-items:center;gap:4px;font-size:11px}'
    + '#centerDashboard .kpi-tr.up{color:#22c55e}'
    + '#centerDashboard .c{background:#0A1218;border:0.5px solid rgba(0,200,150,.12);border-radius:13px;overflow:hidden}'
    + '#centerDashboard .ch{padding:14px 16px 12px;border-bottom:0.5px solid rgba(0,200,150,.06);display:flex;align-items:center;justify-content:space-between}'
    + '#centerDashboard .ct{font-size:12.5px;font-weight:600;color:rgba(248,242,224,.72)}'
    + '#centerDashboard .cs{font-family:"Roboto Mono",monospace;font-size:9px;color:rgba(248,242,224,.22);letter-spacing:1px;text-transform:uppercase}'
    + '#centerDashboard .cb{padding:16px}'
    + '#centerDashboard .dt{width:100%;border-collapse:collapse;font-size:12.5px}'
    + '#centerDashboard .dt th{padding:8px 12px;text-align:left;font-family:"Roboto Mono",monospace;font-size:8.5px;font-weight:600;color:rgba(248,242,224,.22);letter-spacing:1.5px;text-transform:uppercase;border-bottom:0.5px solid rgba(0,200,150,.12);white-space:nowrap}'
    + '#centerDashboard .dt td{padding:9px 12px;border-bottom:0.5px solid rgba(0,200,150,.06);color:rgba(248,242,224,.72);vertical-align:middle}'
    + '#centerDashboard .dt tr:hover td{background:rgba(0,200,150,.025)}'
    + '#centerDashboard .td-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0}'
    + '#centerDashboard .td-nm{display:flex;align-items:center;gap:8px}'
    + '#centerDashboard .td-mo{font-family:"Roboto Mono",monospace;font-size:10.5px;color:rgba(248,242,224,.42)}'
    + '#centerDashboard .bx{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px;font-family:"Roboto Mono",monospace;font-size:9px;font-weight:600;letter-spacing:.5px;white-space:nowrap}'
    + '#centerDashboard .bx.g{background:rgba(0,200,150,.1);color:#00E5A8;border:0.5px solid rgba(0,200,150,.2)}'
    + '#centerDashboard .bx.r{background:rgba(255,77,109,.1);color:#FF4D6D;border:0.5px solid rgba(255,77,109,.2)}'
    + '#centerDashboard .bx.a{background:rgba(245,158,11,.1);color:#F59E0B;border:0.5px solid rgba(245,158,11,.2)}'
    + '#centerDashboard .bx.b{background:rgba(59,130,246,.1);color:#60A5FA;border:0.5px solid rgba(59,130,246,.2)}'
    + '#centerDashboard .bx.p{background:rgba(123,95,255,.1);color:#9B82FF;border:0.5px solid rgba(123,95,255,.2)}'
    + '#centerDashboard .bx-dot{width:4px;height:4px;border-radius:50%;background:currentColor}'
    + '#centerDashboard .btn{padding:7px 14px;border-radius:7px;font-size:12.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;border:none;white-space:nowrap}'
    + '#centerDashboard .btn-p{background:linear-gradient(135deg,#005A42,#00C896);color:#000}'
    + '#centerDashboard .btn-s{background:rgba(0,200,150,.08);border:0.5px solid rgba(0,200,150,.25);color:#00C896}'
    + '#centerDashboard .btn-g{background:transparent;border:0.5px solid rgba(0,200,150,.12);color:rgba(248,242,224,.42)}'
    + '#centerDashboard .btn-sm{padding:5px 10px;font-size:11px}'
    + '#centerDashboard .btn-row{display:flex;gap:7px;flex-wrap:wrap}'
    + '#centerDashboard .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}'
    + '#centerDashboard .g23{display:grid;grid-template-columns:2fr 1fr;gap:12px}'
    + '#centerDashboard .srow{display:flex;gap:0;border:0.5px solid rgba(0,200,150,.12);border-radius:11px;overflow:hidden;margin-bottom:18px}'
    + '#centerDashboard .sc{flex:1;padding:12px 14px;border-right:0.5px solid rgba(0,200,150,.06);text-align:center}'
    + '#centerDashboard .sc:last-child{border-right:none}'
    + '#centerDashboard .sc-v{font-size:18px;font-weight:700;color:#F8F2E0}'
    + '#centerDashboard .sc-l{font-family:"Roboto Mono",monospace;font-size:8.5px;color:rgba(248,242,224,.22);letter-spacing:1px;text-transform:uppercase;margin-top:3px}'
    + '#centerDashboard .act{display:flex;flex-direction:column}'
    + '#centerDashboard .act-i{display:flex;gap:9px;padding:9px 0;border-bottom:0.5px solid rgba(0,200,150,.06)}'
    + '#centerDashboard .act-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:3px}'
    + '#centerDashboard .act-txt{font-size:12.5px;color:rgba(248,242,224,.72);line-height:1.5;flex:1}'
    + '#centerDashboard .act-txt strong{color:#F8F2E0;font-weight:600}'
    + '#centerDashboard .act-time{font-family:"Roboto Mono",monospace;font-size:10px;color:rgba(248,242,224,.22);margin-top:2px}'
    + '#centerDashboard .lang-sw{display:flex;background:#0A1218;border:0.5px solid rgba(0,200,150,.12);border-radius:7px;overflow:hidden;flex-shrink:0}'
    + '#centerDashboard .lang-btn{padding:5px 10px;font-size:11px;font-weight:600;cursor:pointer;color:rgba(248,242,224,.22);background:transparent;border:none}'
    + '#centerDashboard .lang-btn.on{background:rgba(0,200,150,.12);color:#00E5A8}'
    + '#centerDashboard .adm-mob-toggle{display:none;background:none;border:none;color:#F8F2E0;cursor:pointer;padding:8px}'
    + '#centerDashboard .fu{animation:fadeUp .28s ease forwards;opacity:0}'
    + '#centerDashboard .mb4{margin-bottom:16px}'
    + '#centerDashboard .flex{display:flex}'
    + '#centerDashboard .items-c{align-items:center}'
    + '#centerDashboard .just-b{justify-content:space-between}'
    + '</style>' + html;
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
