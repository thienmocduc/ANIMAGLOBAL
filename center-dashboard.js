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
  {
    id:'CTR-HN',
    pwd:'Anima@2026',
    name:'Cao Tu\u00E2n',
    phone:'0913156676',
    email:'doanhnhancaotuan@gmail.com',
    centerId:'CTR-HN',
    centerName:'Anima Care H\u00E0 N\u1ED9i',
    centerNameEn:'Anima Care Hanoi',
    city:'H\u00E0 N\u1ED9i',
    address:'286 Nguy\u1EC5n Xi\u1EC3n, Thanh Li\u1EC7t',
    type:'Full',
    tier:1,
    capacity:50,
    role:'center_manager',
    status:'active',
    kycStatus:'verified',
    cccd:'***verified***',
    bankName:'Vietcombank',
    bankHolder:'CAO TUAN',
    createdAt:'2026-03-01T00:00:00.000Z'
  }
];

var cLang = 'vi';
var cUser = null;
var cPage = 'c-dash';

// ══════════════════════════════════════════════════
// 34 PROVINCE CENTERS (Level 1 - Exclusive Territory)
// ══════════════════════════════════════════════════
var PROVINCE_CENTERS = [
  { _id:'CTR-HN',  name:'Anima Care H\u00E0 N\u1ED9i',        nameEn:'Anima Care Hanoi',          city:'H\u00E0 N\u1ED9i',       cityEn:'Hanoi',         region:'north', tier:1 },
  { _id:'CTR-HCM', name:'Anima Care TP.HCM',         nameEn:'Anima Care HCMC',           city:'TP.HCM',        cityEn:'Ho Chi Minh',   region:'south', tier:1 },
  { _id:'CTR-DN',  name:'Anima Care \u0110\u00E0 N\u1EB5ng',       nameEn:'Anima Care Da Nang',        city:'\u0110\u00E0 N\u1EB5ng',      cityEn:'Da Nang',       region:'central', tier:1 },
  { _id:'CTR-HP',  name:'Anima Care H\u1EA3i Ph\u00F2ng',      nameEn:'Anima Care Hai Phong',      city:'H\u1EA3i Ph\u00F2ng',     cityEn:'Hai Phong',     region:'north', tier:1 },
  { _id:'CTR-CT',  name:'Anima Care C\u1EA7n Th\u01A1',       nameEn:'Anima Care Can Tho',        city:'C\u1EA7n Th\u01A1',      cityEn:'Can Tho',       region:'south', tier:1 },
  { _id:'CTR-HUE', name:'Anima Care Hu\u1EBF',          nameEn:'Anima Care Hue',            city:'Hu\u1EBF',         cityEn:'Hue',           region:'central', tier:1 },
  { _id:'CTR-NT',  name:'Anima Care Nha Trang',      nameEn:'Anima Care Nha Trang',      city:'Nha Trang',     cityEn:'Nha Trang',     region:'central', tier:1 },
  { _id:'CTR-VT',  name:'Anima Care V\u0169ng T\u00E0u',       nameEn:'Anima Care Vung Tau',       city:'V\u0169ng T\u00E0u',      cityEn:'Vung Tau',      region:'south', tier:1 },
  { _id:'CTR-QN',  name:'Anima Care Qu\u1EA3ng Ninh',     nameEn:'Anima Care Quang Ninh',     city:'Qu\u1EA3ng Ninh',    cityEn:'Quang Ninh',    region:'north', tier:1 },
  { _id:'CTR-BD',  name:'Anima Care B\u00ECnh D\u01B0\u01A1ng',    nameEn:'Anima Care Binh Duong',     city:'B\u00ECnh D\u01B0\u01A1ng',   cityEn:'Binh Duong',    region:'south', tier:1 },
  { _id:'CTR-DN2', name:'Anima Care \u0110\u1ED3ng Nai',       nameEn:'Anima Care Dong Nai',       city:'\u0110\u1ED3ng Nai',      cityEn:'Dong Nai',      region:'south', tier:1 },
  { _id:'CTR-TH',  name:'Anima Care Thanh H\u00F3a',      nameEn:'Anima Care Thanh Hoa',      city:'Thanh H\u00F3a',     cityEn:'Thanh Hoa',     region:'north', tier:1 },
  { _id:'CTR-NA',  name:'Anima Care Ngh\u1EC7 An',        nameEn:'Anima Care Nghe An',        city:'Ngh\u1EC7 An',       cityEn:'Nghe An',       region:'central', tier:1 },
  { _id:'CTR-BN',  name:'Anima Care B\u1EAFc Ninh',       nameEn:'Anima Care Bac Ninh',       city:'B\u1EAFc Ninh',      cityEn:'Bac Ninh',      region:'north', tier:1 },
  { _id:'CTR-HD',  name:'Anima Care H\u1EA3i D\u01B0\u01A1ng',     nameEn:'Anima Care Hai Duong',      city:'H\u1EA3i D\u01B0\u01A1ng',    cityEn:'Hai Duong',     region:'north', tier:1 },
  { _id:'CTR-LA',  name:'Anima Care Long An',         nameEn:'Anima Care Long An',        city:'Long An',       cityEn:'Long An',       region:'south', tier:1 },
  { _id:'CTR-QNA', name:'Anima Care Qu\u1EA3ng Nam',      nameEn:'Anima Care Quang Nam',      city:'Qu\u1EA3ng Nam',     cityEn:'Quang Nam',     region:'central', tier:1 },
  { _id:'CTR-KH',  name:'Anima Care Kh\u00E1nh H\u00F2a',     nameEn:'Anima Care Khanh Hoa',      city:'Kh\u00E1nh H\u00F2a',    cityEn:'Khanh Hoa',     region:'central', tier:1 },
  { _id:'CTR-GL',  name:'Anima Care Gia Lai',         nameEn:'Anima Care Gia Lai',        city:'Gia Lai',       cityEn:'Gia Lai',       region:'central', tier:1 },
  { _id:'CTR-DL',  name:'Anima Care \u0110\u00E0 L\u1EA1t',        nameEn:'Anima Care Da Lat',         city:'\u0110\u00E0 L\u1EA1t',       cityEn:'Da Lat',        region:'central', tier:1 },
  { _id:'CTR-AG',  name:'Anima Care An Giang',        nameEn:'Anima Care An Giang',       city:'An Giang',      cityEn:'An Giang',      region:'south', tier:1 },
  { _id:'CTR-TG',  name:'Anima Care Ti\u1EC1n Giang',     nameEn:'Anima Care Tien Giang',     city:'Ti\u1EC1n Giang',    cityEn:'Tien Giang',    region:'south', tier:1 },
  { _id:'CTR-BT',  name:'Anima Care B\u1EBFn Tre',        nameEn:'Anima Care Ben Tre',        city:'B\u1EBFn Tre',       cityEn:'Ben Tre',       region:'south', tier:1 },
  { _id:'CTR-TB',  name:'Anima Care Th\u00E1i B\u00ECnh',      nameEn:'Anima Care Thai Binh',      city:'Th\u00E1i B\u00ECnh',     cityEn:'Thai Binh',     region:'north', tier:1 },
  { _id:'CTR-NB',  name:'Anima Care Ninh B\u00ECnh',      nameEn:'Anima Care Ninh Binh',      city:'Ninh B\u00ECnh',     cityEn:'Ninh Binh',     region:'north', tier:1 },
  { _id:'CTR-PY',  name:'Anima Care Ph\u00FA Y\u00EAn',       nameEn:'Anima Care Phu Yen',        city:'Ph\u00FA Y\u00EAn',      cityEn:'Phu Yen',       region:'central', tier:1 },
  { _id:'CTR-BP',  name:'Anima Care B\u00ECnh Ph\u01B0\u1EDBc',    nameEn:'Anima Care Binh Phuoc',     city:'B\u00ECnh Ph\u01B0\u1EDBc',   cityEn:'Binh Phuoc',    region:'south', tier:1 },
  { _id:'CTR-TN',  name:'Anima Care T\u00E2y Ninh',       nameEn:'Anima Care Tay Ninh',       city:'T\u00E2y Ninh',      cityEn:'Tay Ninh',      region:'south', tier:1 },
  { _id:'CTR-VL',  name:'Anima Care V\u0129nh Long',      nameEn:'Anima Care Vinh Long',      city:'V\u0129nh Long',     cityEn:'Vinh Long',     region:'south', tier:1 },
  { _id:'CTR-VP',  name:'Anima Care V\u0129nh Ph\u00FAc',      nameEn:'Anima Care Vinh Phuc',      city:'V\u0129nh Ph\u00FAc',     cityEn:'Vinh Phuc',     region:'north', tier:1 },
  { _id:'CTR-LS',  name:'Anima Care L\u1EA1ng S\u01A1n',       nameEn:'Anima Care Lang Son',       city:'L\u1EA1ng S\u01A1n',      cityEn:'Lang Son',      region:'north', tier:1 },
  { _id:'CTR-PT',  name:'Anima Care Ph\u00FA Th\u1ECD',       nameEn:'Anima Care Phu Tho',        city:'Ph\u00FA Th\u1ECD',      cityEn:'Phu Tho',       region:'north', tier:1 },
  { _id:'CTR-BTH', name:'Anima Care B\u00ECnh Thu\u1EADn',     nameEn:'Anima Care Binh Thuan',     city:'B\u00ECnh Thu\u1EADn',    cityEn:'Binh Thuan',    region:'central', tier:1 },
  { _id:'CTR-DK',  name:'Anima Care \u0110\u1EAFk L\u1EAFk',       nameEn:'Anima Care Dak Lak',        city:'\u0110\u1EAFk L\u1EAFk',      cityEn:'Dak Lak',       region:'central', tier:1 }
];

// Initialize province centers into AnimaSync on load
function initProvinceCenters() {
  if(!window.AnimaSync) return;
  var existing = AnimaSync.get('centers', []);
  var changed = false;
  PROVINCE_CENTERS.forEach(function(pc) {
    var found = existing.some(function(e) { return e._id === pc._id; });
    if(!found) {
      /* Check if there's a registered account for this province */
      var hasAccount = CENTER_ACCOUNTS.some(function(a) { return a.centerId === pc._id; });
      existing.push({
        _id: pc._id, name: pc.name, nameEn: pc.nameEn,
        city: pc.city, cityEn: pc.cityEn, region: pc.region,
        tier: 1, parentId: null,
        address: '', phone: '', manager: '',
        type: 'Full', capacity: 50,
        status: hasAccount ? 'active' : 'available',
        subCenters: [],
        commissionRate: { product: 0.25, service: 0.40 },
        createdAt: '2026-03-01T00:00:00.000Z'
      });
      changed = true;
    }
  });
  if(changed) AnimaSync.set('centers', existing);
}

// ── Product Catalog (Marketplace) ──
var PRODUCTS = [
  { sku:'ANM-119', name:'ANIMA 119', nameEn:'ANIMA 119', cat:'supplement', price:1590000, commission:0.25, img:'', desc:'Th\u1EF1c th\u1EC3 ph\u00E2n t\u1EED s\u1ED1ng - H\u1ED9i t\u1EE5 32 th\u1EA3o d\u01B0\u1EE3c qu\u00FD', descEn:'Living molecular food - 32 precious herbs' },
  { sku:'ANM-SKN', name:'ANIMA Skin Care', nameEn:'ANIMA Skin Care', cat:'skincare', price:890000, commission:0.25, img:'', desc:'Serum ch\u1ED1ng l\u00E3o h\u00F3a c\u00F4ng ngh\u1EC7 ph\u00E2n t\u1EED', descEn:'Anti-aging molecular technology serum' },
  { sku:'ANM-JNT', name:'ANIMA Joint Pro', nameEn:'ANIMA Joint Pro', cat:'supplement', price:1190000, commission:0.25, img:'', desc:'H\u1ED7 tr\u1EE3 x\u01B0\u01A1ng kh\u1EDBp - Collagen peptide', descEn:'Joint support - Collagen peptide' },
  { sku:'ANM-DTX', name:'ANIMA Detox', nameEn:'ANIMA Detox', cat:'supplement', price:690000, commission:0.25, img:'', desc:'Gi\u1EA3i \u0111\u1ED9c t\u1EBF b\u00E0o - Th\u1EA3i \u0111\u1ED9c t\u1EA7ng s\u00E2u', descEn:'Cell detox - Deep toxin cleanse' },
  { sku:'ANM-IMM', name:'ANIMA Immune+', nameEn:'ANIMA Immune+', cat:'supplement', price:990000, commission:0.25, img:'', desc:'T\u0103ng c\u01B0\u1EDDng mi\u1EC5n d\u1ECBch t\u1EF1 nhi\u00EAn', descEn:'Natural immune booster' },
  { sku:'ANM-SLP', name:'ANIMA Sleep', nameEn:'ANIMA Sleep', cat:'supplement', price:590000, commission:0.25, img:'', desc:'H\u1ED7 tr\u1EE3 gi\u1EA5c ng\u1EE7 s\u00E2u - Ph\u1EE5c h\u1ED3i th\u1EA7n kinh', descEn:'Deep sleep support - Neural recovery' }
];

var SERVICES = [
  { sku:'SVC-ENG', name:'Tr\u1ECB li\u1EC7u N\u0103ng l\u01B0\u1EE3ng', nameEn:'Energy Therapy', cat:'therapy', price:500000, commission:0.40, desc:'Li\u1EC7u tr\u00ECnh kh\u01A1i th\u00F4ng kinh m\u1EA1ch', descEn:'Meridian unblocking session' },
  { sku:'SVC-DTX', name:'Gi\u1EA3i \u0111\u1ED9c C\u01A1 th\u1EC3', nameEn:'Body Detox', cat:'therapy', price:800000, commission:0.40, desc:'Gi\u1EA3i \u0111\u1ED9c to\u00E0n di\u1EC7n qua da', descEn:'Full body skin detox' },
  { sku:'SVC-CON', name:'T\u01B0 v\u1EA5n S\u1EE9c kh\u1ECFe', nameEn:'Health Consult', cat:'consult', price:300000, commission:0.40, desc:'Kh\u00E1m t\u01B0 v\u1EA5n chuy\u00EAn s\u00E2u', descEn:'In-depth health consultation' },
  { sku:'SVC-ACU', name:'Ch\u00E2m c\u1EE9u Ph\u00E2n t\u1EED', nameEn:'Molecular Acupuncture', cat:'therapy', price:600000, commission:0.40, desc:'K\u1EBFt h\u1EE3p ch\u00E2m c\u1EE9u + c\u00F4ng ngh\u1EC7 sinh h\u1ECDc', descEn:'Acupuncture + biotech combination' },
  { sku:'SVC-FIT', name:'Fitness Therapy', nameEn:'Fitness Therapy', cat:'fitness', price:400000, commission:0.35, desc:'V\u1EADn \u0111\u1ED9ng tr\u1ECB li\u1EC7u c\u00E1 nh\u00E2n', descEn:'Personal therapeutic fitness' }
];

// Commission rates by territory type
var COMMISSION_RATES = {
  product_exclusive: 0.25,   // 25% for products in exclusive territory
  service_exclusive: 0.40,   // 40% for services in exclusive territory
  product_shared: 0.15,      // 15% if territory shared
  service_shared: 0.25       // 25% if territory shared
};

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
    '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.15);border-radius:20px;padding:0;width:100%;max-width:440px;position:relative;overflow-y:auto;max-height:90vh;scrollbar-width:none;-ms-overflow-style:none">' +

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
    '<div style="margin-bottom:14px"><label style="' + lbl + '">CENTER ID / EMAIL / S\u0110T</label>' +
    '<input id="cpIdInput" style="' + inp + '" placeholder="CTR001 ho\u1EB7c email ho\u1EB7c s\u1ED1 \u0111i\u1EC7n tho\u1EA1i"></div>' +
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

    // ═══ KYC SECTION ═══
    '<div style="border:1px solid rgba(0,200,150,.15);border-radius:12px;padding:16px;margin-bottom:14px;background:rgba(0,200,150,.03)">' +
    '<div style="font-size:12px;font-weight:700;color:#00C896;margin-bottom:10px;display:flex;align-items:center;gap:6px;text-transform:uppercase;letter-spacing:1px">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
    'X\u00C1C MINH DANH T\u00CDNH (KYC)</div>' +
    '<div style="font-size:11px;color:rgba(248,242,224,.4);margin-bottom:12px;line-height:1.5">' +
    'Theo quy \u0111\u1ECBnh ph\u00E1p lu\u1EADt, ch\u1EE7 c\u01A1 s\u1EDF c\u1EA7n x\u00E1c minh CCCD v\u00E0 t\u00E0i kho\u1EA3n ng\u00E2n h\u00E0ng ch\u00EDnh ch\u1EE7. Th\u00F4ng tin b\u1EA3o m\u1EADt tuy\u1EC7t \u0111\u1ED1i.</div>' +

    // CCCD Number + Full Name on CCCD
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
    '<div><label style="' + lbl + '">S\u1ED0 CCCD / CMND *</label>' +
    '<input id="cpRegCccd" style="' + inp + '" placeholder="012345678901" maxlength="12"></div>' +
    '<div><label style="' + lbl + '">H\u1ECC T\u00CAN TR\u00CAN CCCD *</label>' +
    '<input id="cpRegCccdName" style="' + inp + '" placeholder="Tr\u00F9ng v\u1EDBi CCCD"></div></div>' +

    // DOB + Gender
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
    '<div><label style="' + lbl + '">NG\u00C0Y SINH *</label>' +
    '<input id="cpRegDob" type="date" style="' + inp + '"></div>' +
    '<div><label style="' + lbl + '">GI\u1EDAI T\u00CDNH</label>' +
    '<select id="cpRegGender" style="' + inp + ';cursor:pointer;-webkit-appearance:none">' +
    '<option value="male">Nam</option><option value="female">N\u1EEF</option><option value="other">Kh\u00E1c</option>' +
    '</select></div></div>' +

    // CCCD Photos
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
    '<div><label style="' + lbl + '">\u1EA2NH CCCD M\u1EB6T TR\u01AF\u1EDAC *</label>' +
    '<label id="cpCccdFrontLabel" style="display:flex;align-items:center;justify-content:center;gap:6px;' + inp + ';cursor:pointer;text-align:center;color:rgba(248,242,224,.4);font-size:11px;padding:14px 10px;border-style:dashed">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
    'Ch\u1ECDn \u1EA3nh...<input type="file" id="cpCccdFront" accept="image/*" style="display:none" onchange="window._kycFileLabel(this,\'cpCccdFrontLabel\')"></label></div>' +
    '<div><label style="' + lbl + '">\u1EA2NH CCCD M\u1EB6T SAU *</label>' +
    '<label id="cpCccdBackLabel" style="display:flex;align-items:center;justify-content:center;gap:6px;' + inp + ';cursor:pointer;text-align:center;color:rgba(248,242,224,.4);font-size:11px;padding:14px 10px;border-style:dashed">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>' +
    'Ch\u1ECDn \u1EA3nh...<input type="file" id="cpCccdBack" accept="image/*" style="display:none" onchange="window._kycFileLabel(this,\'cpCccdBackLabel\')"></label></div></div>' +

    // Bank Info
    '<div style="border-top:1px solid rgba(0,200,150,.1);padding-top:10px;margin-top:4px">' +
    '<div style="font-size:11px;font-weight:600;color:#00C896;margin-bottom:8px;letter-spacing:1px">T\u00C0I KHO\u1EA2N NG\u00C2N H\u00C0NG CH\u00CDNH CH\u1EE6</div>' +

    '<div style="margin-bottom:10px"><label style="' + lbl + '">NG\u00C2N H\u00C0NG *</label>' +
    '<select id="cpRegBank" style="' + inp + ';cursor:pointer;-webkit-appearance:none">' +
    '<option value="">Ch\u1ECDn ng\u00E2n h\u00E0ng...</option>' +
    '<option>Vietcombank</option><option>Techcombank</option><option>BIDV</option>' +
    '<option>VietinBank</option><option>MB Bank</option><option>ACB</option>' +
    '<option>Sacombank</option><option>VPBank</option><option>TPBank</option>' +
    '<option>HDBank</option><option>OCB</option><option>SHB</option>' +
    '<option>MSB</option><option>Agribank</option><option>Kh\u00E1c</option>' +
    '</select></div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
    '<div><label style="' + lbl + '">S\u1ED0 T\u00C0I KHO\u1EA2N *</label>' +
    '<input id="cpRegBankNo" style="' + inp + '" placeholder="S\u1ED1 t\u00E0i kho\u1EA3n"></div>' +
    '<div><label style="' + lbl + '">CH\u1EE6 T\u00C0I KHO\u1EA2N *</label>' +
    '<input id="cpRegBankName" style="' + inp + '" placeholder="Tr\u00F9ng v\u1EDBi CCCD"></div></div>' +

    '<div style="font-size:10px;color:rgba(248,242,224,.3);line-height:1.5;font-style:italic">' +
    '\u26A0 T\u00EAn ch\u1EE7 TK ng\u00E2n h\u00E0ng ph\u1EA3i tr\u00F9ng v\u1EDBi h\u1ECD t\u00EAn tr\u00EAn CCCD. ' +
    'M\u1ED7i email/S\u0110T ch\u1EC9 \u0111\u01B0\u1EE3c \u0111\u0103ng k\u00FD 1 t\u00E0i kho\u1EA3n duy nh\u1EA5t.</div>' +
    '</div></div>' +

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

  // KYC fields
  var cccd = (document.getElementById('cpRegCccd').value || '').trim().replace(/\s/g,'');
  var cccdName = (document.getElementById('cpRegCccdName').value || '').trim();
  var dob = (document.getElementById('cpRegDob').value || '').trim();
  var gender = document.getElementById('cpRegGender').value;
  var bankName = document.getElementById('cpRegBank').value;
  var bankNo = (document.getElementById('cpRegBankNo').value || '').trim();
  var bankHolder = (document.getElementById('cpRegBankName').value || '').trim();
  var cccdFrontFile = document.getElementById('cpCccdFront').files[0];
  var cccdBackFile = document.getElementById('cpCccdBack').files[0];

  // Validate basic
  if(!name) { showCPError(t('Vui l\u00F2ng nh\u1EADp h\u1ECD t\u00EAn','Please enter your name')); return; }
  if(!phone) { showCPError(t('Vui l\u00F2ng nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i','Please enter phone number')); return; }
  if(!email || !email.includes('@')) { showCPError(t('Email kh\u00F4ng h\u1EE3p l\u1EC7','Invalid email address')); return; }
  if(!centerName) { showCPError(t('Vui l\u00F2ng nh\u1EADp t\u00EAn c\u01A1 s\u1EDF','Please enter center name')); return; }
  if(!city) { showCPError(t('Vui l\u00F2ng ch\u1ECDn th\u00E0nh ph\u1ED1','Please select city')); return; }
  if(!addr) { showCPError(t('Vui l\u00F2ng nh\u1EADp \u0111\u1ECBa ch\u1EC9','Please enter address')); return; }

  // Validate KYC
  if(!cccd || cccd.length < 9) { showCPError(t('Vui l\u00F2ng nh\u1EADp s\u1ED1 CCCD h\u1EE3p l\u1EC7 (9-12 s\u1ED1)','Please enter valid ID number (9-12 digits)')); return; }
  if(!cccdName) { showCPError(t('Vui l\u00F2ng nh\u1EADp h\u1ECD t\u00EAn tr\u00EAn CCCD','Please enter name on ID card')); return; }
  if(!dob) { showCPError(t('Vui l\u00F2ng ch\u1ECDn ng\u00E0y sinh','Please select date of birth')); return; }
  if(!cccdFrontFile) { showCPError(t('Vui l\u00F2ng t\u1EA3i \u1EA3nh CCCD m\u1EB7t tr\u01B0\u1EDBc','Please upload front of ID card')); return; }
  if(!cccdBackFile) { showCPError(t('Vui l\u00F2ng t\u1EA3i \u1EA3nh CCCD m\u1EB7t sau','Please upload back of ID card')); return; }
  if(!bankName) { showCPError(t('Vui l\u00F2ng ch\u1ECDn ng\u00E2n h\u00E0ng','Please select bank')); return; }
  if(!bankNo) { showCPError(t('Vui l\u00F2ng nh\u1EADp s\u1ED1 t\u00E0i kho\u1EA3n ng\u00E2n h\u00E0ng','Please enter bank account number')); return; }
  if(!bankHolder) { showCPError(t('Vui l\u00F2ng nh\u1EADp t\u00EAn ch\u1EE7 t\u00E0i kho\u1EA3n','Please enter account holder name')); return; }

  // Validate bank holder matches CCCD name
  if(bankHolder.toUpperCase().replace(/\s+/g,' ') !== cccdName.toUpperCase().replace(/\s+/g,' ')) {
    showCPError(t('T\u00EAn ch\u1EE7 TK ng\u00E2n h\u00E0ng ph\u1EA3i tr\u00F9ng v\u1EDBi h\u1ECD t\u00EAn tr\u00EAn CCCD','Bank account holder name must match ID card name'));
    return;
  }

  if(!pwd || pwd.length < 8) { showCPError(t('M\u1EADt kh\u1EA9u t\u1ED1i thi\u1EC3u 8 k\u00FD t\u1EF1','Password must be at least 8 characters')); return; }
  if(pwd !== pwd2) { showCPError(t('M\u1EADt kh\u1EA9u x\u00E1c nh\u1EADn kh\u00F4ng kh\u1EDBp','Passwords do not match')); return; }
  if(!terms) { showCPError(t('Vui l\u00F2ng \u0111\u1ED3ng \u00FD \u0111i\u1EC1u kho\u1EA3n','Please accept the terms')); return; }

  // Check duplicate — 1 email/phone = 1 account only
  var existing = JSON.parse(localStorage.getItem('anima_center_accounts') || '[]');
  var dupEmail = existing.some(function(a) { return a.email.toLowerCase() === email.toLowerCase(); });
  var dupPhone = existing.some(function(a) { return a.phone.replace(/\s/g,'') === phone.replace(/\s/g,''); });
  var dupCccd = existing.some(function(a) { return a.cccd === cccd; });
  if(dupEmail) { showCPError(t('Email \u0111\u00E3 \u0111\u01B0\u1EE3c \u0111\u0103ng k\u00FD. M\u1ED7i email ch\u1EC9 \u0111\u01B0\u1EE3c 1 t\u00E0i kho\u1EA3n.','Email already registered. Only 1 account per email.')); return; }
  if(dupPhone) { showCPError(t('S\u0110T \u0111\u00E3 \u0111\u01B0\u1EE3c \u0111\u0103ng k\u00FD. M\u1ED7i S\u0110T ch\u1EC9 \u0111\u01B0\u1EE3c 1 t\u00E0i kho\u1EA3n.','Phone already registered. Only 1 account per phone.')); return; }
  if(dupCccd) { showCPError(t('S\u1ED1 CCCD \u0111\u00E3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng cho t\u00E0i kho\u1EA3n kh\u00E1c.','This ID number is already registered to another account.')); return; }

  // Generate Center ID
  var maxNum = 0;
  existing.forEach(function(a) {
    var n = parseInt(a.id.replace('CTR',''));
    if(n > maxNum) maxNum = n;
  });
  var newId = 'CTR' + String(maxNum + 1).padStart(3, '0');

  // Create account with KYC
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
    status: 'pending_kyc',
    // KYC Data
    cccd: cccd,
    cccdName: cccdName,
    dob: dob,
    gender: gender,
    bankName: bankName,
    bankNo: bankNo,
    bankHolder: bankHolder,
    kycStatus: 'pending',
    kycSubmittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  // Save CCCD images as base64 (async, then save)
  var saveAccount = function(frontImg, backImg) {
    newAccount.cccdFrontImg = frontImg || '';
    newAccount.cccdBackImg = backImg || '';
    existing.push(newAccount);
    localStorage.setItem('anima_center_accounts', JSON.stringify(existing));
    CENTER_ACCOUNTS.push(newAccount);

    // Sync KYC to admin
    if(window.AnimaSync) {
      AnimaSync.push('kyc_requests', {
        centerId: newId,
        centerName: centerName,
        name: cccdName,
        cccd: cccd,
        dob: dob,
        bankName: bankName,
        bankNo: bankNo,
        bankHolder: bankHolder,
        email: email,
        phone: phone,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      AnimaSync.push('activities', {
        type: 'kyc_new',
        vi: centerName + ' (' + name + ') g\u1EEDi y\u00EAu c\u1EA7u KYC x\u00E1c minh',
        en: centerName + ' (' + name + ') submitted KYC verification',
        ago: 0
      });
    }

    finishRegistration(newId);
  };

  // Convert images and save
  fileToBase64(cccdFrontFile, function(front) {
    fileToBase64(cccdBackFile, function(back) {
      saveAccount(front, back);
    });
  });
  return; // async - finishRegistration will handle the rest
}

function finishRegistration(newId) {
  var suc = document.getElementById('cpSuccess');
  var existing = JSON.parse(localStorage.getItem('anima_center_accounts') || '[]');
  var acc = existing.find(function(a) { return a.id === newId; });
  if(!acc) return;

  // Add center to sync store
  if(window.AnimaSync) {
    var centers = AnimaSync.get('centers', []);
    centers.push({
      _id: newId,
      name: acc.centerName,
      nameEn: acc.centerName,
      city: acc.city,
      cityEn: acc.city,
      address: acc.address,
      status: 'pending_kyc',
      manager: acc.name,
      phone: acc.phone,
      type: acc.type,
      capacity: acc.capacity
    });
    AnimaSync.set('centers', centers);

    AnimaSync.push('activities', {
      type: 'center_new',
      vi: 'C\u01A1 s\u1EDF m\u1EDBi \u0111\u0103ng k\u00FD: ' + acc.centerName + ' (' + acc.city + ') \u2014 Ch\u1EDD KYC',
      en: 'New center registered: ' + acc.centerName + ' (' + acc.city + ') \u2014 Pending KYC',
      centerId: newId,
      ago: 0
    });
  }

  // Show success with KYC note
  suc.style.display = 'block';
  suc.innerHTML = '<strong>' + t('\u0110\u0103ng k\u00FD th\u00E0nh c\u00F4ng!','Registration successful!') + '</strong><br>' +
    t('Center ID: ','Center ID: ') + '<strong style="color:#F8F2E0">' + newId + '</strong><br>' +
    '<span style="font-size:11px;opacity:.7">' +
    t('KYC \u0111ang ch\u1EDD x\u00E1c minh. \u0110\u0103ng nh\u1EADp b\u1EB1ng ID/email/S\u0110T + m\u1EADt kh\u1EA9u.','KYC pending verification. Login with ID/email/phone + password.') +
    '</span>';

  // Clear form
  ['cpRegName','cpRegPhone','cpRegEmail','cpRegCenter','cpRegAddr','cpRegRef','cpRegPwd','cpRegPwd2',
   'cpRegCccd','cpRegCccdName','cpRegDob','cpRegBankNo','cpRegBankName'].forEach(function(id) {
    var el = document.getElementById(id);
    if(el) el.value = '';
  });
  document.getElementById('cpRegCity').selectedIndex = 0;
  document.getElementById('cpRegBank').selectedIndex = 0;
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
  err.scrollIntoView({ behavior:'smooth', block:'center' });
}

// KYC file upload label helper
window._kycFileLabel = function(input, labelId) {
  var label = document.getElementById(labelId);
  if(input.files && input.files[0]) {
    var fn = input.files[0].name;
    if(fn.length > 20) fn = fn.substring(0, 17) + '...';
    label.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ' + fn;
    label.style.color = '#00C896';
    label.style.borderColor = 'rgba(0,200,150,.4)';
    label.appendChild(input);
  }
};

// Convert file to base64 for localStorage storage
function fileToBase64(file, cb) {
  if(!file) { cb(null); return; }
  var reader = new FileReader();
  reader.onload = function() { cb(reader.result); };
  reader.readAsDataURL(file);
}

window._centerLogin = function() {
  var input = document.getElementById('cpIdInput').value.trim();
  var pwd = document.getElementById('cpPwdInput').value;
  var err = document.getElementById('cpError');

  if(!input || !pwd) {
    err.style.display = 'block';
    err.textContent = t('Vui l\u00F2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 th\u00F4ng tin', 'Please fill in all fields');
    return;
  }

  var inputUpper = input.toUpperCase();
  var inputLower = input.toLowerCase();
  var account = null;
  /* Search in reverse so newest registered accounts match first */
  for(var i = CENTER_ACCOUNTS.length - 1; i >= 0; i--) {
    var a = CENTER_ACCOUNTS[i];
    var matchId = a.id === inputUpper;
    var matchEmail = a.email && a.email.toLowerCase() === inputLower;
    var matchPhone = a.phone && a.phone.replace(/\s/g,'') === input.replace(/\s/g,'');
    if((matchId || matchEmail || matchPhone) && a.pwd === pwd) {
      account = a; break;
    }
  }

  if(!account) {
    err.style.display = 'block';
    err.textContent = t('Sai th\u00F4ng tin \u0111\u0103ng nh\u1EADp ho\u1EB7c m\u1EADt kh\u1EA9u', 'Invalid credentials or password');
    return;
  }

  err.style.display = 'none';
  cUser = account;
  localStorage.setItem('anima_center_user', JSON.stringify(account));
  /* Save center credentials for auto-fill */
  localStorage.setItem('anima_saved_center', JSON.stringify({id:account.id, pwd:btoa(pwd), ts:Date.now()}));
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

  // ── Commission calculations ──
  var completedOrders = myOrders.filter(function(o) { return o.status === 'completed' || o.status === 'delivered'; });
  var allCenterOrders = myOrders; // all orders attributed to this center
  var commissionData = {
    totalSales: 0, totalCommission: 0, pendingCommission: 0, paidCommission: 0,
    productSales: 0, serviceSales: 0, productComm: 0, serviceComm: 0,
    thisMonth: 0, lastMonth: 0, thisMonthComm: 0
  };
  var now = new Date();
  var thisMonth = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  var lastM = new Date(now.getFullYear(), now.getMonth()-1, 1);
  var lastMonth = lastM.getFullYear() + '-' + String(lastM.getMonth()+1).padStart(2,'0');

  allCenterOrders.forEach(function(o) {
    var total = o.total || 0;
    var commRate = o.commissionRate || (o.type === 'service' ? COMMISSION_RATES.service_exclusive : COMMISSION_RATES.product_exclusive);
    var comm = Math.round(total * commRate);
    commissionData.totalSales += total;
    commissionData.totalCommission += comm;
    if(o.status === 'completed' || o.status === 'delivered') {
      commissionData.paidCommission += comm;
    } else {
      commissionData.pendingCommission += comm;
    }
    if(o.type === 'service') { commissionData.serviceSales += total; commissionData.serviceComm += comm; }
    else { commissionData.productSales += total; commissionData.productComm += comm; }
    var oMonth = (o.createdAt || o.date || '').substr(0,7);
    if(oMonth === thisMonth) { commissionData.thisMonth += total; commissionData.thisMonthComm += comm; }
    if(oMonth === lastMonth) { commissionData.lastMonth += total; }
  });

  // Get center tier & sub-centers
  var myCenterData = (sync ? sync.get('centers', []) : []).find(function(c) { return c._id === cid; }) || {};
  var myTier = myCenterData.tier || (cUser.tier || 1);
  var mySubCenters = (sync ? sync.get('centers', []) : []).filter(function(c) { return c.parentId === cid; });

  // Build pages
  var pages = {
    'c-dash': buildDashPage(),
    'c-network': buildNetworkPage(),
    'c-marketplace': buildMarketplacePage(),
    'c-revenue': buildRevenuePage(),
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
    h += kpiCard('\uD83D\uDCB0', t('Doanh thu','Revenue'), money(commissionData.totalSales), '#3B82F6', t('Th\u00E1ng n\u00E0y: ' + money(commissionData.thisMonth), 'This month: ' + money(commissionData.thisMonth)));
    h += kpiCard('\uD83D\uDCB3', t('Hoa h\u1ED3ng','Commission'), money(commissionData.totalCommission), '#00C896', t(money(commissionData.pendingCommission) + ' ch\u1EDD thanh to\u00E1n', money(commissionData.pendingCommission) + ' pending'));
    h += kpiCard('\uD83D\uDCE6', t('\u0110\u01A1n h\u00E0ng','Orders'), myOrders.length, '#F59E0B', t(pendingOrders + ' \u0111ang x\u1EED l\u00FD', pendingOrders + ' processing'));
    h += kpiCard('\uD83D\uDCC5', t('L\u1ECBch h\u1EB9n','Bookings'), todayBookings, '#7B5FFF', t('+' + pendingBookings + ' ch\u1EDD duy\u1EC7t', pendingBookings + ' pending'));
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

  // ══════════ NETWORK PAGE (Sub-centers) ══════════
  function buildNetworkPage() {
    var h = '<div class="pg" id="pg-c-network">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('M\u1EA1ng L\u01B0\u1EDBi C\u01A1 S\u1EDF','Center Network') + '</div>';
    h += '<div class="pg-sub">' + t('C\u01A1 s\u1EDF c\u1EA5p ' + myTier + ' \u2014 ' + cUser.city + ' \u2014 \u0110\u1ED9c quy\u1EC1n khu v\u1EF1c','Tier ' + myTier + ' \u2014 ' + cUser.city + ' \u2014 Exclusive territory') + '</div></div>';

    // Tier badge
    h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">';
    h += '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(0,200,150,.08);border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:6px 14px">';
    h += '<span style="font-size:12px;font-weight:600;color:#00E5A8">' + t('C\u1EA5p ' + myTier + ' \u2014 ','Tier ' + myTier + ' \u2014 ') + cUser.city + '</span></div>';
    if(myTier === 1) {
      h += '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:20px;padding:6px 14px">';
      h += '<span style="font-size:12px;font-weight:600;color:#F59E0B">' + t('\u0110\u01B0\u1EE3c m\u1EDF c\u01A1 s\u1EDF c\u1EA5p 2','Can open Level 2 centers') + '</span></div>';
    }
    h += '</div>';

    // Sub-center stats
    h += '<div class="kpi-g" style="margin-bottom:18px">';
    h += kpiCard('\uD83C\uDFE2', t('C\u01A1 s\u1EDF c\u1EA5p 2','Level 2 Centers'), mySubCenters.length, '#7B5FFF', t(mySubCenters.filter(function(s){return s.status==="active";}).length + ' ho\u1EA1t \u0111\u1ED9ng', mySubCenters.filter(function(s){return s.status==="active";}).length + ' active'));
    var subRevenue = 0; var subComm = 0;
    mySubCenters.forEach(function(sc) {
      var scOrders = allCenterOrders.filter(function(o){return o.centerId===sc._id;});
      scOrders.forEach(function(o){ subRevenue += (o.total||0); subComm += Math.round((o.total||0)*0.05); });
    });
    h += kpiCard('\uD83D\uDCB0', t('Doanh thu m\u1EA1ng l\u01B0\u1EDBi','Network Revenue'), money(subRevenue), '#3B82F6', t('T\u1EEB c\u01A1 s\u1EDF c\u1EA5p 2','From L2 centers'));
    h += kpiCard('\uD83D\uDCB3', t('Override Commission','Override Commission'), money(subComm), '#00C896', t('5% t\u1EEB c\u1EA5p 2','5% from L2'));
    h += kpiCard('\uD83D\uDCCA', t('T\u1ED5ng m\u1EA1ng l\u01B0\u1EDBi','Total Network'), (mySubCenters.length + 1), '#F59E0B', t('c\u01A1 s\u1EDF trong khu v\u1EF1c','centers in territory'));
    h += '</div>';

    // Create new sub-center button (only for tier 1)
    if(myTier === 1) {
      h += '<div style="margin-bottom:18px">';
      h += '<button class="btn btn-p" onclick="window._cCreateSubCenter()" style="padding:12px 24px;font-size:14px">';
      h += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      h += t('M\u1EDF C\u01A1 S\u1EDF C\u1EA5p 2 M\u1EDBi','Open New Level 2 Center') + '</button></div>';
    }

    // Sub-centers list
    h += '<div class="c"><div class="ch"><span class="ct">' + t('Danh S\u00E1ch C\u01A1 S\u1EDF C\u1EA5p 2','Level 2 Centers') + '</span><span class="cs">' + mySubCenters.length + '</span></div>';
    h += '<div class="cb">';
    if(mySubCenters.length === 0) {
      h += '<div style="text-align:center;padding:30px;color:rgba(248,242,224,.3)">';
      h += '<div style="font-size:28px;margin-bottom:10px">\uD83C\uDFE2</div>';
      h += t('Ch\u01B0a c\u00F3 c\u01A1 s\u1EDF c\u1EA5p 2 n\u00E0o. B\u1EA5m "M\u1EDF C\u01A1 S\u1EDF C\u1EA5p 2 M\u1EDBi" \u0111\u1EC3 m\u1EDF r\u1ED9ng m\u1EA1ng l\u01B0\u1EDBi.','No Level 2 centers yet. Click "Open New Level 2 Center" to expand your network.');
      h += '</div>';
    } else {
      h += '<div class="tw"><table class="dt"><thead><tr>';
      h += '<th>ID</th><th>' + t('T\u00EAn','Name') + '</th><th>' + t('\u0110\u1ECBa ch\u1EC9','Address') + '</th>';
      h += '<th>' + t('Qu\u1EA3n l\u00FD','Manager') + '</th><th>' + t('Tr\u1EA1ng th\u00E1i','Status') + '</th>';
      h += '<th>' + t('Doanh thu','Revenue') + '</th>';
      h += '</tr></thead><tbody>';
      mySubCenters.forEach(function(sc) {
        var scOrders = allCenterOrders.filter(function(o){return o.centerId===sc._id;});
        var scRev = scOrders.reduce(function(s,o){return s+(o.total||0);},0);
        var stCls = sc.status==='active' ? 'g' : (sc.status==='pending_kyc'?'a':'b');
        var stTxt = sc.status==='active' ? t('Ho\u1EA1t \u0111\u1ED9ng','Active') : (sc.status==='pending_kyc' ? t('Ch\u1EDD KYC','Pending KYC') : t(sc.status,sc.status));
        h += '<tr>';
        h += '<td class="td-mo">' + sc._id + '</td>';
        h += '<td>' + sc.name + '</td>';
        h += '<td class="td-mo">' + (sc.address||'') + '</td>';
        h += '<td>' + (sc.manager||t('Ch\u01B0a c\u00F3','N/A')) + '</td>';
        h += '<td><span class="bx ' + stCls + '"><span class="bx-dot"></span>' + stTxt + '</span></td>';
        h += '<td class="td-mo">' + money(scRev) + '</td>';
        h += '</tr>';
      });
      h += '</tbody></table></div>';
    }
    h += '</div></div>';

    // Province centers map (show all 34)
    h += '<div class="c" style="margin-top:14px"><div class="ch"><span class="ct">' + t('B\u1EA3n \u0110\u1ED3 34 T\u1EC9nh Th\u00E0nh','34 Province Map') + '</span><span class="cs">' + PROVINCE_CENTERS.length + ' ' + t('t\u1EC9nh','provinces') + '</span></div>';
    h += '<div class="cb"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">';
    var allCenters = sync ? sync.get('centers', []) : [];
    PROVINCE_CENTERS.forEach(function(pc) {
      var c = allCenters.find(function(ac){return ac._id===pc._id;}) || pc;
      var isMine = pc._id === cid;
      var isActive = c.status === 'active';
      var isAvailable = c.status === 'available';
      var borderColor = isMine ? 'rgba(0,200,150,.5)' : (isActive ? 'rgba(0,200,150,.2)' : 'rgba(248,242,224,.06)');
      var bgColor = isMine ? 'rgba(0,200,150,.06)' : (isActive ? 'rgba(0,200,150,.02)' : 'transparent');
      h += '<div style="background:' + bgColor + ';border:1px solid ' + borderColor + ';border-radius:10px;padding:10px 12px;position:relative">';
      h += '<div style="font-size:12px;font-weight:600;color:' + (isMine?'#00E5A8':(isActive?'#F8F2E0':'rgba(248,242,224,.35)')) + '">' + t(pc.city, pc.cityEn) + '</div>';
      h += '<div style="font-size:9px;color:rgba(248,242,224,.25);font-family:\'Roboto Mono\',monospace;margin-top:2px">' + pc._id + '</div>';
      if(isMine) h += '<div style="position:absolute;top:8px;right:8px;width:6px;height:6px;border-radius:50%;background:#00C896;box-shadow:0 0 0 2px rgba(0,200,150,.2)"></div>';
      else if(isActive) h += '<div style="font-size:9px;color:#00C896;margin-top:3px">' + t('\u0110ang ho\u1EA1t \u0111\u1ED9ng','Active') + '</div>';
      else h += '<div style="font-size:9px;color:rgba(245,158,11,.6);margin-top:3px">' + t('C\u00F2n tr\u1ED1ng','Available') + '</div>';
      h += '</div>';
    });
    h += '</div></div></div>';

    h += '</div>';
    return h;
  }

  // ══════════ MARKETPLACE PAGE ══════════
  function buildMarketplacePage() {
    var h = '<div class="pg" id="pg-c-marketplace">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('Marketplace','Marketplace') + '</div>';
    h += '<div class="pg-sub">' + t('S\u1EA3n ph\u1EA9m & d\u1ECBch v\u1EE5 \u0111\u1ED9c quy\u1EC1n khu v\u1EF1c ' + cUser.city, 'Exclusive products & services for ' + cUser.city + ' region') + '</div></div>';

    // Territory badge
    h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap">';
    h += '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(0,200,150,.08);border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:6px 14px">';
    h += '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00C896" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    h += '<span style="font-size:12px;font-weight:600;color:#00E5A8">' + t('\u0110\u1ED9c quy\u1EC1n: ','Exclusive: ') + cUser.city + '</span></div>';
    h += '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:20px;padding:6px 14px">';
    h += '<span style="font-size:12px;font-weight:600;color:#60A5FA">' + t('Commission S\u1EA3n ph\u1EA9m: 25% \u00B7 D\u1ECBch v\u1EE5: 40%','Product Commission: 25% \u00B7 Service: 40%') + '</span></div>';
    h += '</div>';

    // Products section
    h += '<div style="margin-bottom:8px"><div style="font-size:14px;font-weight:600;color:#F8F2E0;margin-bottom:12px;display:flex;align-items:center;gap:8px">';
    h += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C896" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>';
    h += t('S\u1EA3n Ph\u1EA9m','Products') + ' <span style="font-size:11px;color:rgba(248,242,224,.3);font-weight:400">(' + PRODUCTS.length + ')</span></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:20px">';
    PRODUCTS.forEach(function(p) {
      var commAmt = Math.round(p.price * p.commission);
      h += '<div class="c" style="cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(0,200,150,.4)\'" onmouseout="this.style.borderColor=\'rgba(0,200,150,.12)\'">';
      h += '<div style="padding:14px">';
      h += '<div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#005A42,#00C896);display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:18px">\uD83D\uDC8A</div>';
      h += '<div style="font-size:13px;font-weight:600;color:#F8F2E0;margin-bottom:2px">' + t(p.name, p.nameEn) + '</div>';
      h += '<div style="font-size:10px;color:rgba(248,242,224,.35);margin-bottom:8px;line-height:1.4">' + t(p.desc, p.descEn) + '</div>';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-end">';
      h += '<div><div style="font-size:15px;font-weight:700;color:#F8F2E0">' + money(p.price) + '</div>';
      h += '<div style="font-size:9px;color:rgba(248,242,224,.3);font-family:\'Roboto Mono\',monospace">' + p.sku + '</div></div>';
      h += '<div style="text-align:right"><div style="font-size:11px;font-weight:600;color:#00E5A8">+' + money(commAmt) + '</div>';
      h += '<div style="font-size:8px;color:rgba(0,200,150,.5);font-family:\'Roboto Mono\',monospace">COMMISSION ' + Math.round(p.commission*100) + '%</div></div>';
      h += '</div></div></div>';
    });
    h += '</div></div>';

    // Services section
    h += '<div><div style="font-size:14px;font-weight:600;color:#F8F2E0;margin-bottom:12px;display:flex;align-items:center;gap:8px">';
    h += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B5FFF" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
    h += t('D\u1ECBch V\u1EE5 Tr\u1ECB Li\u1EC7u','Treatment Services') + ' <span style="font-size:11px;color:rgba(248,242,224,.3);font-weight:400">(' + SERVICES.length + ')</span></div>';
    h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">';
    SERVICES.forEach(function(s) {
      var commAmt = Math.round(s.price * s.commission);
      h += '<div class="c" style="cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(123,95,255,.4)\'" onmouseout="this.style.borderColor=\'rgba(0,200,150,.12)\'">';
      h += '<div style="padding:14px">';
      h += '<div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#4A3AFF,#7B5FFF);display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:18px">\u2728</div>';
      h += '<div style="font-size:13px;font-weight:600;color:#F8F2E0;margin-bottom:2px">' + t(s.name, s.nameEn) + '</div>';
      h += '<div style="font-size:10px;color:rgba(248,242,224,.35);margin-bottom:8px;line-height:1.4">' + t(s.desc, s.descEn) + '</div>';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-end">';
      h += '<div><div style="font-size:15px;font-weight:700;color:#F8F2E0">' + money(s.price) + '</div>';
      h += '<div style="font-size:9px;color:rgba(248,242,224,.3);font-family:\'Roboto Mono\',monospace">' + s.sku + '</div></div>';
      h += '<div style="text-align:right"><div style="font-size:11px;font-weight:600;color:#9B82FF">+' + money(commAmt) + '</div>';
      h += '<div style="font-size:8px;color:rgba(123,95,255,.5);font-family:\'Roboto Mono\',monospace">COMMISSION ' + Math.round(s.commission*100) + '%</div></div>';
      h += '</div></div></div>';
    });
    h += '</div></div>';

    h += '</div>';
    return h;
  }

  // ══════════ REVENUE / COMMISSION PAGE ══════════
  function buildRevenuePage() {
    var h = '<div class="pg" id="pg-c-revenue">';
    h += '<div class="pg-hd"><div class="pg-title">' + t('Doanh Thu & Hoa H\u1ED3ng','Revenue & Commission') + '</div>';
    h += '<div class="pg-sub">' + t('\u0110\u1ED9c quy\u1EC1n khu v\u1EF1c: ','Exclusive territory: ') + cUser.city + ' \u2014 ' + cUser.centerName + '</div></div>';

    // Summary KPI row
    h += '<div class="kpi-g" style="margin-bottom:18px">';
    h += kpiCard('\uD83D\uDCB0', t('T\u1ED5ng doanh thu','Total Sales'), money(commissionData.totalSales), '#3B82F6', t(allCenterOrders.length + ' \u0111\u01A1n', allCenterOrders.length + ' orders'));
    h += kpiCard('\uD83D\uDCB3', t('T\u1ED5ng hoa h\u1ED3ng','Total Commission'), money(commissionData.totalCommission), '#00C896', t(Math.round(commissionData.totalSales ? commissionData.totalCommission/commissionData.totalSales*100 : 0) + '% trung b\u00ECnh', Math.round(commissionData.totalSales ? commissionData.totalCommission/commissionData.totalSales*100 : 0) + '% average'));
    h += kpiCard('\u2705', t('\u0110\u00E3 thanh to\u00E1n','Paid Out'), money(commissionData.paidCommission), '#22C55E', t('\u0110\u01A1n ho\u00E0n th\u00E0nh','Completed orders'));
    h += kpiCard('\u23F3', t('Ch\u1EDD thanh to\u00E1n','Pending'), money(commissionData.pendingCommission), '#F59E0B', t('\u0110ang x\u1EED l\u00FD','Processing'));
    h += '</div>';

    // Commission breakdown cards
    h += '<div class="g2 mb4">';

    // Product commission card
    h += '<div class="c"><div class="ch"><span class="ct">' + t('Hoa H\u1ED3ng S\u1EA3n Ph\u1EA9m','Product Commission') + '</span><span class="bx g">25%</span></div>';
    h += '<div class="cb">';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
    h += '<div><div style="font-size:10px;color:rgba(248,242,224,.3);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace;margin-bottom:4px">' + t('DOANH S\u1ED0','SALES') + '</div>';
    h += '<div style="font-size:20px;font-weight:700;color:#F8F2E0">' + money(commissionData.productSales) + '</div></div>';
    h += '<div style="text-align:right"><div style="font-size:10px;color:rgba(248,242,224,.3);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace;margin-bottom:4px">' + t('HOA H\u1ED2NG','COMMISSION') + '</div>';
    h += '<div style="font-size:20px;font-weight:700;color:#00E5A8">' + money(commissionData.productComm) + '</div></div></div>';
    // Progress bar
    var pctProd = commissionData.totalCommission ? Math.round(commissionData.productComm / commissionData.totalCommission * 100) : 0;
    h += '<div style="background:rgba(0,200,150,.06);border-radius:6px;height:8px;overflow:hidden;margin-bottom:6px"><div style="height:100%;background:linear-gradient(90deg,#005A42,#00C896);border-radius:6px;width:' + pctProd + '%"></div></div>';
    h += '<div style="font-size:10px;color:rgba(248,242,224,.3)">' + pctProd + '% ' + t('t\u1ED5ng hoa h\u1ED3ng','of total commission') + '</div>';
    h += '</div></div>';

    // Service commission card
    h += '<div class="c"><div class="ch"><span class="ct">' + t('Hoa H\u1ED3ng D\u1ECBch V\u1EE5','Service Commission') + '</span><span class="bx p">40%</span></div>';
    h += '<div class="cb">';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
    h += '<div><div style="font-size:10px;color:rgba(248,242,224,.3);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace;margin-bottom:4px">' + t('DOANH S\u1ED0','SALES') + '</div>';
    h += '<div style="font-size:20px;font-weight:700;color:#F8F2E0">' + money(commissionData.serviceSales) + '</div></div>';
    h += '<div style="text-align:right"><div style="font-size:10px;color:rgba(248,242,224,.3);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace;margin-bottom:4px">' + t('HOA H\u1ED2NG','COMMISSION') + '</div>';
    h += '<div style="font-size:20px;font-weight:700;color:#9B82FF">' + money(commissionData.serviceComm) + '</div></div></div>';
    var pctSvc = commissionData.totalCommission ? Math.round(commissionData.serviceComm / commissionData.totalCommission * 100) : 0;
    h += '<div style="background:rgba(123,95,255,.06);border-radius:6px;height:8px;overflow:hidden;margin-bottom:6px"><div style="height:100%;background:linear-gradient(90deg,#4A3AFF,#9B82FF);border-radius:6px;width:' + pctSvc + '%"></div></div>';
    h += '<div style="font-size:10px;color:rgba(248,242,224,.3)">' + pctSvc + '% ' + t('t\u1ED5ng hoa h\u1ED3ng','of total commission') + '</div>';
    h += '</div></div>';

    h += '</div>'; // g2

    // Commission history table
    h += '<div class="c"><div class="ch"><span class="ct">' + t('L\u1ECBch S\u1EED Hoa H\u1ED3ng','Commission History') + '</span><span class="cs">' + allCenterOrders.length + ' ' + t('\u0111\u01A1n','orders') + '</span></div>';
    h += '<div class="cb"><div class="tw"><table class="dt"><thead><tr>';
    h += '<th>ID</th><th>' + t('S\u1EA3n ph\u1EA9m/DV','Product/Service') + '</th><th>' + t('Doanh s\u1ED1','Amount') + '</th>';
    h += '<th>%</th><th>' + t('Hoa h\u1ED3ng','Commission') + '</th><th>' + t('Tr\u1EA1ng th\u00E1i','Status') + '</th>';
    h += '</tr></thead><tbody>';
    allCenterOrders.slice().reverse().forEach(function(o) {
      var commRate = o.commissionRate || (o.type === 'service' ? COMMISSION_RATES.service_exclusive : COMMISSION_RATES.product_exclusive);
      var comm = Math.round((o.total || 0) * commRate);
      var isPaid = o.status === 'completed' || o.status === 'delivered';
      h += '<tr><td class="td-mo">' + (o._id||'') + '</td>';
      h += '<td>' + (o.product||o.service||'') + '</td>';
      h += '<td class="td-mo">' + money(o.total||0) + '</td>';
      h += '<td class="td-mo">' + Math.round(commRate*100) + '%</td>';
      h += '<td style="font-weight:600;color:' + (isPaid?'#00E5A8':'#F59E0B') + '">' + money(comm) + '</td>';
      h += '<td>' + (isPaid ? '<span class="bx g"><span class="bx-dot"></span>' + t('\u0110\u00E3 tr\u1EA3','Paid') + '</span>' : '<span class="bx a"><span class="bx-dot"></span>' + t('Ch\u1EDD','Pending') + '</span>') + '</td>';
      h += '</tr>';
    });
    if(allCenterOrders.length === 0) {
      h += '<tr><td colspan="6" style="text-align:center;padding:30px;color:rgba(248,242,224,.3)">' + t('Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00E0ng n\u00E0o. Khi kh\u00E1ch h\u00E0ng \u0111\u1EB7t mua s\u1EA3n ph\u1EA9m/d\u1ECBch v\u1EE5 t\u1EA1i khu v\u1EF1c c\u1EE7a b\u1EA1n, hoa h\u1ED3ng s\u1EBD t\u1EF1 \u0111\u1ED9ng \u0111\u01B0\u1EE3c t\u00EDnh.','No orders yet. When customers order products/services in your territory, commission will be calculated automatically.') + '</td></tr>';
    }
    h += '</tbody></table></div></div></div>';

    // Territory info
    h += '<div class="c" style="margin-top:12px"><div class="ch"><span class="ct">' + t('Th\u00F4ng Tin Khu V\u1EF1c \u0110\u1ED9c Quy\u1EC1n','Exclusive Territory Info') + '</span></div>';
    h += '<div class="cb"><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">';
    h += '<div><div style="font-size:10px;color:rgba(248,242,224,.3);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace;margin-bottom:4px">' + t('KHU V\u1EF0C','TERRITORY') + '</div>';
    h += '<div style="font-size:14px;font-weight:600;color:#F8F2E0">' + cUser.city + '</div></div>';
    h += '<div><div style="font-size:10px;color:rgba(248,242,224,.3);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace;margin-bottom:4px">' + t('LO\u1EA0I','TYPE') + '</div>';
    h += '<div style="font-size:14px;font-weight:600;color:#00E5A8">' + t('\u0110\u1ED9c quy\u1EC1n','Exclusive') + '</div></div>';
    h += '<div><div style="font-size:10px;color:rgba(248,242,224,.3);text-transform:uppercase;letter-spacing:1px;font-family:\'Roboto Mono\',monospace;margin-bottom:4px">' + t('T\u1EEB NG\u00C0Y','SINCE') + '</div>';
    h += '<div style="font-size:14px;font-weight:600;color:#F8F2E0">' + (cUser.createdAt ? cUser.createdAt.substr(0,10) : '2026-03-01') + '</div></div>';
    h += '</div></div></div>';

    h += '</div>';
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
    { id:'c-network', icon:'<circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="14"/><circle cx="6" cy="19" r="3"/><circle cx="18" cy="19" r="3"/><line x1="12" y1="14" x2="6" y2="16"/><line x1="12" y1="14" x2="18" y2="16"/>', vi:'M\u1EA1ng L\u01B0\u1EDBi', en:'Network', badge: mySubCenters.length || null },
    { id:'c-marketplace', icon:'<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>', vi:'Marketplace', en:'Marketplace' },
    { id:'c-revenue', icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>', vi:'Doanh Thu', en:'Revenue', badge: commissionData.pendingCommission > 0 ? money(commissionData.pendingCommission) : null },
    { id:'c-bookings', icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', vi:'L\u1ECBch H\u1EB9n', en:'Bookings', badge: pendingBookings || null },
    { id:'c-orders', icon:'<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>', vi:'\u0110\u01A1n H\u00E0ng', en:'Orders', badge: pendingOrders || null, badgeCls:'r' },
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
  html += '<button class="adm-mob-toggle" style="display:none;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.25);color:#00E5A8;cursor:pointer;padding:8px 10px;border-radius:8px;flex-shrink:0" onclick="document.querySelector(\'#centerDashboard .sb\').classList.toggle(\'mob-open\');document.getElementById(\'cMobOverlay\').classList.toggle(\'show\')"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>';
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
    + '#centerDashboard .just-b{justify-content:space-between}#centerDashboard *::-webkit-scrollbar{display:none}#centerDashboard *::-webkit-scrollbar,#centerPortal *::-webkit-scrollbar{display:none!important;width:0!important}#centerDashboard,#centerDashboard *,#centerPortal,#centerPortal *{scrollbar-width:none!important;-ms-overflow-style:none!important}'
    + '</style>' + html;
  }

  // Mobile responsive + tablet
  html += '<style>'
  + '@media(max-width:1024px){#centerDashboard .kpi-g{grid-template-columns:1fr 1fr!important}#centerDashboard .g2,#centerDashboard .g23{grid-template-columns:1fr!important}}'
  + '@media(max-width:768px){'
  + '#centerDashboard .app{grid-template-columns:1fr!important}'
  + '#centerDashboard .sb{position:fixed!important;left:-260px!important;top:0!important;bottom:0!important;width:250px!important;min-width:250px!important;z-index:100!important;transition:left .3s ease!important;background:#060C0F!important;box-shadow:4px 0 30px rgba(0,0,0,.7)}'
  + '#centerDashboard .sb.mob-open{left:0!important}'
  + '#centerDashboard .adm-mob-toggle{display:flex!important}'
  + '#centerDashboard #cMobOverlay.show{display:block!important}'
  + '#centerDashboard .top{padding:0 12px 0 4px!important}'
  + '#centerDashboard .kpi-g{grid-template-columns:1fr 1fr!important}'
  + '#centerDashboard .g2,#centerDashboard .g23{grid-template-columns:1fr!important}'
  + '#centerDashboard .dt{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}'
  + '#centerDashboard .pg{padding:14px 12px!important}'
  + '}'
  + '@media(max-width:400px){#centerDashboard .kpi-g{grid-template-columns:1fr!important}}'
  + '</style>';

  dash.innerHTML = html;
}

// ── Navigation ──
window._cNav = function(pageId, el) {
  cPage = pageId;
  // Close mobile sidebar
  var sb = document.querySelector('#centerDashboard .sb');
  if(sb) sb.classList.remove('mob-open');
  var overlay = document.getElementById('cMobOverlay');
  if(overlay) overlay.classList.remove('show');
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
    var names = { 'c-dash':'Dashboard', 'c-network':t('M\u1EA1ng L\u01B0\u1EDBi','Network'), 'c-marketplace':'Marketplace', 'c-revenue':t('Doanh Thu','Revenue'), 'c-bookings':t('L\u1ECBch H\u1EB9n','Bookings'), 'c-orders':t('\u0110\u01A1n H\u00E0ng','Orders'), 'c-customers':t('Kh\u00E1ch H\u00E0ng','Customers'), 'c-inventory':t('Kho H\u00E0ng','Inventory'), 'c-settings':t('C\u00E0i \u0110\u1EB7t','Settings') };
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

// ── Create Sub-Center (Level 2) ──
window._cCreateSubCenter = function() {
  if(!cUser || !window.AnimaSync) return;
  var name = prompt(t('T\u00EAn c\u01A1 s\u1EDF c\u1EA5p 2:','Level 2 center name:'));
  if(!name) return;
  var address = prompt(t('\u0110\u1ECBa ch\u1EC9:','Address:'));
  if(!address) return;
  var manager = prompt(t('T\u00EAn qu\u1EA3n l\u00FD:','Manager name:'));
  var phone = prompt(t('S\u0110T qu\u1EA3n l\u00FD:','Manager phone:'));

  var centers = AnimaSync.get('centers', []);
  var subCount = centers.filter(function(c) { return c.parentId === cUser.centerId; }).length;
  var newId = cUser.centerId + '-L2-' + String(subCount + 1).padStart(2, '0');

  var subCenter = {
    _id: newId,
    name: name,
    nameEn: name,
    city: cUser.city,
    cityEn: cUser.city,
    region: '',
    tier: 2,
    parentId: cUser.centerId,
    address: address,
    phone: phone || '',
    manager: manager || '',
    type: 'Lite',
    capacity: 15,
    status: 'active',
    commissionRate: { product: 0.20, service: 0.30 },
    createdAt: new Date().toISOString()
  };

  centers.push(subCenter);
  AnimaSync.set('centers', centers);

  AnimaSync.push('activities', {
    type: 'center_new',
    vi: 'C\u01A1 s\u1EDF c\u1EA5p 2 m\u1EDBi: ' + name + ' (' + cUser.city + ')',
    en: 'New L2 center: ' + name + ' (' + cUser.city + ')',
    centerId: newId,
    parentId: cUser.centerId,
    ago: 0
  });

  renderDashboard();
  if(typeof showToast === 'function') showToast(t('\u0110\u00E3 t\u1EA1o c\u01A1 s\u1EDF c\u1EA5p 2: ','Created L2 center: ') + name, '#00C896');
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
  initProvinceCenters();
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
