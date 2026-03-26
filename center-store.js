/* ═══════════════════════════════════════════════════════════════
   AnimaCare Center Store v1.0
   Mini e-commerce for 34 province centers
   IIFE pattern, no modules, all on window
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

// ── Slug → Center ID mapping ──
var SLUG_MAP = {
  'ha-noi':'CTR-HN','ho-chi-minh':'CTR-HCM','da-nang':'CTR-DN','hai-phong':'CTR-HP',
  'can-tho':'CTR-CT','hue':'CTR-HUE','nha-trang':'CTR-NT','vung-tau':'CTR-VT',
  'quang-ninh':'CTR-QN','binh-duong':'CTR-BD','dong-nai':'CTR-DN2','thanh-hoa':'CTR-TH',
  'nghe-an':'CTR-NA','bac-ninh':'CTR-BN','hai-duong':'CTR-HD','long-an':'CTR-LA',
  'quang-nam':'CTR-QNA','khanh-hoa':'CTR-KH','gia-lai':'CTR-GL','dak-lak':'CTR-DL',
  'an-giang':'CTR-AG','tien-giang':'CTR-TG','ben-tre':'CTR-BT','thai-binh':'CTR-TB',
  'nam-dinh':'CTR-NB','phu-yen':'CTR-PY','binh-phuoc':'CTR-BP','tay-ninh':'CTR-TN',
  'vinh-long':'CTR-VL','vinh-phuc':'CTR-VP','lang-son':'CTR-LS','phu-tho':'CTR-PT',
  'binh-thuan':'CTR-BTH','dak-nong':'CTR-DK'
};

// ── Centers data (mirrors center-dashboard.js PROVINCE_CENTERS) ──
var CENTERS = {
  'CTR-HN':{name:'Anima Care Ha\u0300 No\u0323\u0302i',city:'Ha\u0300 No\u0323\u0302i',phone:'0913 156 676',address:'286 Nguy\u00ea\u0303n Xi\u00ea\u0309n, Thanh Li\u00ea\u0323t',region:'north'},
  'CTR-HCM':{name:'Anima Care TP.HCM',city:'TP.HCM',phone:'0913 156 676',address:'Qu\u00e2\u0323n 1, TP.HCM',region:'south'},
  'CTR-DN':{name:'Anima Care \u0110a\u0300 Na\u0303\u0302ng',city:'\u0110a\u0300 Na\u0303\u0302ng',phone:'0913 156 676',address:'Ha\u0309i Ch\u00e2u, \u0110a\u0300 Na\u0303\u0302ng',region:'central'},
  'CTR-HP':{name:'Anima Care Ha\u0309i Pho\u0300ng',city:'Ha\u0309i Pho\u0300ng',phone:'0913 156 676',address:'Ho\u0300ng Ba\u0300ng, Ha\u0309i Pho\u0300ng',region:'north'},
  'CTR-CT':{name:'Anima Care C\u00e2\u0300n Th\u01a1',city:'C\u00e2\u0300n Th\u01a1',phone:'0913 156 676',address:'Ninh Ki\u00ea\u0300u, C\u00e2\u0300n Th\u01a1',region:'south'},
  'CTR-HUE':{name:'Anima Care Hu\u00ea\u0301',city:'Hu\u00ea\u0301',phone:'0913 156 676',address:'TP Hu\u00ea\u0301',region:'central'},
  'CTR-NT':{name:'Anima Care Nha Trang',city:'Nha Trang',phone:'0913 156 676',address:'TP Nha Trang',region:'central'},
  'CTR-VT':{name:'Anima Care Vu\u0303ng Ta\u0300u',city:'Vu\u0303ng Ta\u0300u',phone:'0913 156 676',address:'TP Vu\u0303ng Ta\u0300u',region:'south'},
  'CTR-QN':{name:'Anima Care Qua\u0309ng Ninh',city:'Qua\u0309ng Ninh',phone:'0913 156 676',address:'TP Ha\u0323 Long',region:'north'},
  'CTR-BD':{name:'Anima Care Bi\u0300nh D\u01b0\u01a1ng',city:'Bi\u0300nh D\u01b0\u01a1ng',phone:'0913 156 676',address:'Thu\u0309 D\u00e2\u0300u Mo\u0323\u0302t',region:'south'},
  'CTR-DN2':{name:'Anima Care \u0110o\u0300\u0302ng Nai',city:'\u0110o\u0300\u0302ng Nai',phone:'0913 156 676',address:'Bi\u00ean Ho\u0300a',region:'south'},
  'CTR-TH':{name:'Anima Care Thanh Ho\u0301a',city:'Thanh Ho\u0301a',phone:'0913 156 676',address:'TP Thanh Ho\u0301a',region:'north'},
  'CTR-NA':{name:'Anima Care Nghe\u0323\u0302 An',city:'Nghe\u0323\u0302 An',phone:'0913 156 676',address:'TP Vinh',region:'central'},
  'CTR-BN':{name:'Anima Care Ba\u0301\u0302c Ninh',city:'Ba\u0301\u0302c Ninh',phone:'0913 156 676',address:'TP Ba\u0301\u0302c Ninh',region:'north'},
  'CTR-HD':{name:'Anima Care Ha\u0309i D\u01b0\u01a1ng',city:'Ha\u0309i D\u01b0\u01a1ng',phone:'0913 156 676',address:'TP Ha\u0309i D\u01b0\u01a1ng',region:'north'},
  'CTR-LA':{name:'Anima Care Long An',city:'Long An',phone:'0913 156 676',address:'TP T\u00e2n An',region:'south'},
  'CTR-QNA':{name:'Anima Care Qua\u0309ng Nam',city:'Qua\u0309ng Nam',phone:'0913 156 676',address:'TP Tam Ky\u0300',region:'central'},
  'CTR-KH':{name:'Anima Care Kha\u0301nh Ho\u0300a',city:'Kha\u0301nh Ho\u0300a',phone:'0913 156 676',address:'TP Nha Trang',region:'central'},
  'CTR-GL':{name:'Anima Care Gia Lai',city:'Gia Lai',phone:'0913 156 676',address:'TP Pleiku',region:'central'},
  'CTR-DL':{name:'Anima Care \u0110a\u0301\u0302k La\u0301\u0302k',city:'\u0110a\u0301\u0302k La\u0301\u0302k',phone:'0913 156 676',address:'TP Bu\u00f4n Ma Thu\u00f4\u0323\u0302t',region:'central'},
  'CTR-AG':{name:'Anima Care An Giang',city:'An Giang',phone:'0913 156 676',address:'TP Long Xuy\u00ean',region:'south'},
  'CTR-TG':{name:'Anima Care Ti\u00ea\u0300n Giang',city:'Ti\u00ea\u0300n Giang',phone:'0913 156 676',address:'TP My\u0303 Tho',region:'south'},
  'CTR-BT':{name:'Anima Care B\u00ea\u0301n Tre',city:'B\u00ea\u0301n Tre',phone:'0913 156 676',address:'TP B\u00ea\u0301n Tre',region:'south'},
  'CTR-TB':{name:'Anima Care Tha\u0301i Bi\u0300nh',city:'Tha\u0301i Bi\u0300nh',phone:'0913 156 676',address:'TP Tha\u0301i Bi\u0300nh',region:'north'},
  'CTR-NB':{name:'Anima Care Nam \u0110i\u0323nh',city:'Nam \u0110i\u0323nh',phone:'0913 156 676',address:'TP Nam \u0110i\u0323nh',region:'north'},
  'CTR-PY':{name:'Anima Care Phu\u0301 Y\u00ean',city:'Phu\u0301 Y\u00ean',phone:'0913 156 676',address:'TP Tuy Ho\u0300a',region:'central'},
  'CTR-BP':{name:'Anima Care Bi\u0300nh Ph\u01b0\u01a1\u0301c',city:'Bi\u0300nh Ph\u01b0\u01a1\u0301c',phone:'0913 156 676',address:'TX \u0110o\u0300\u0302ng Xoa\u0300i',region:'south'},
  'CTR-TN':{name:'Anima Care T\u00e2y Ninh',city:'T\u00e2y Ninh',phone:'0913 156 676',address:'TP T\u00e2y Ninh',region:'south'},
  'CTR-VL':{name:'Anima Care Vi\u0303nh Long',city:'Vi\u0303nh Long',phone:'0913 156 676',address:'TP Vi\u0303nh Long',region:'south'},
  'CTR-VP':{name:'Anima Care Vi\u0303nh Phu\u0301c',city:'Vi\u0303nh Phu\u0301c',phone:'0913 156 676',address:'TP Vi\u0303nh Y\u00ean',region:'north'},
  'CTR-LS':{name:'Anima Care La\u0323ng S\u01a1n',city:'La\u0323ng S\u01a1n',phone:'0913 156 676',address:'TP La\u0323ng S\u01a1n',region:'north'},
  'CTR-PT':{name:'Anima Care Phu\u0301 Tho\u0323',city:'Phu\u0301 Tho\u0323',phone:'0913 156 676',address:'TP Vi\u00ea\u0323t Tri\u0300',region:'north'},
  'CTR-BTH':{name:'Anima Care Bi\u0300nh Thua\u0323\u0302n',city:'Bi\u0300nh Thua\u0323\u0302n',phone:'0913 156 676',address:'TP Phan Thi\u00ea\u0301t',region:'central'},
  'CTR-DK':{name:'Anima Care \u0110a\u0301\u0302k N\u00f4ng',city:'\u0110a\u0301\u0302k N\u00f4ng',phone:'0913 156 676',address:'TP Gia Nghi\u0303a',region:'central'}
};

// ── Product Catalog ──
var PRODUCTS = [
  {sku:'A119-10',name:'ANIMA 119 \u2014 1 H\u1ed9p 10 G\u00f3i',price:1868000,category:'anima119',desc:'Tr\u1ea3i nghi\u1ec7m \u0111\u1ea7u ti\u00ean. Quy lu\u1eadt 30-30-120.',img:'images/anima119-product.jpg'},
  {sku:'A119-30',name:'ANIMA 119 \u2014 3 H\u1ed9p 30 G\u00f3i',price:5604000,category:'anima119',desc:'1 th\u00e1ng li\u1ec7u tr\u00ecnh \u0111\u1ea7y \u0111\u1ee7.'},
  {sku:'A119-120',name:'ANIMA 119 \u2014 12 H\u1ed9p 120 G\u00f3i',price:22416000,category:'anima119',desc:'4 th\u00e1ng ph\u1ee5c h\u01b0ng to\u00e0n di\u1ec7n.'},
  {sku:'CON-HERB',name:'Th\u1ea3o D\u01b0\u1ee3c X\u00f4ng H\u01a1i (1kg)',price:350000,category:'healthcare',desc:'H\u1ed7n h\u1ee3p 12 v\u1ecb th\u1ea3o d\u01b0\u1ee3c cho bu\u1ed3ng x\u00f4ng.'},
  {sku:'CON-OIL',name:'Tinh D\u1ea7u Kinh L\u1ea1c (100ml)',price:280000,category:'healthcare',desc:'Tinh d\u1ea7u massage \u0111\u1ea3 th\u00f4ng kinh m\u1ea1ch.'},
  {sku:'CON-MOXA',name:'Ng\u1ea3i C\u1ee9u C\u1ee9u M\u1ea1ch (50 \u0111i\u1ebfu)',price:195000,category:'healthcare',desc:'\u0110i\u1ebfu ng\u1ea3i c\u1ee9u cao c\u1ea5p cho ch\u00e2m c\u1ee9u.'},
  {sku:'CON-PATCH',name:'Mi\u1ebfng D\u00e1n Th\u1ea3o D\u01b0\u1ee3c (20 mi\u1ebfng)',price:420000,category:'healthcare',desc:'Mi\u1ebfng d\u00e1n h\u1ed7 tr\u1ee3 gi\u1ea3m \u0111au kh\u1edbp.'},
  {sku:'CON-TEA',name:'Tr\u00e0 D\u01b0\u1ee1ng Sinh Anima (30 g\u00f3i)',price:250000,category:'healthcare',desc:'Tr\u00e0 th\u1ea3o d\u01b0\u1ee3c c\u00e2n b\u1eb1ng n\u0103ng l\u01b0\u1ee3ng.'},
  {sku:'CON-SALT',name:'Mu\u1ed1i Ng\u00e2m Ch\u00e2n Th\u1ea3o D\u01b0\u1ee3c (500g)',price:180000,category:'healthcare',desc:'Mu\u1ed1i kho\u00e1ng + th\u1ea3o d\u01b0\u1ee3c ng\u00e2m ch\u00e2n detox.'},
  {sku:'EQP-STEAM',name:'Bu\u1ed3ng X\u00f4ng H\u01a1i Th\u1ea3o M\u1ed9c',price:45000000,category:'equipment',desc:'Bu\u1ed3ng x\u00f4ng 2 ng\u01b0\u1eddi, \u0111i\u1ec1u khi\u1ec3n nhi\u1ec7t \u0111\u1ed9 t\u1ef1 \u0111\u1ed9ng.',b2b:true},
  {sku:'EQP-BED',name:'Gi\u01b0\u1eddng Tr\u1ecb Li\u1ec7u \u0110a N\u0103ng',price:28000000,category:'equipment',desc:'Gi\u01b0\u1eddng n\u00e2ng h\u1ea1 \u0111i\u1ec7n, 3 kh\u1edbp, \u0111\u1ec7m nh\u1edb h\u00ecnh.',b2b:true},
  {sku:'EQP-LAMP',name:'\u0110\u00e8n H\u1ed3ng Ngo\u1ea1i Tr\u1ecb Li\u1ec7u',price:8500000,category:'equipment',desc:'\u0110\u00e8n TDP h\u1ed3ng ngo\u1ea1i xa, 7 b\u01b0\u1edbc s\u00f3ng.',b2b:true},
  {sku:'EQP-CUP',name:'B\u1ed9 Gi\u00e1c H\u01a1i Chuy\u00ean D\u1ee5ng (24 c\u1ed1c)',price:1200000,category:'equipment',desc:'Gi\u00e1c h\u01a1i y t\u1ebf cao c\u1ea5p, ch\u1ed1ng v\u1ee1.'},
  {sku:'EQP-NEEDLE',name:'B\u1ed9 Kim Ch\u00e2m C\u1ee9u V\u00f4 Tr\u00f9ng (1000 kim)',price:650000,category:'equipment',desc:'Kim 1 l\u1ea7n, \u0111\u1ee7 size 0.25-0.35mm.'},
  {sku:'EQP-SCAN',name:'M\u00e1y AI Scan L\u01b0\u1ee1i Anima',price:15000000,category:'equipment',desc:'Camera AI t\u00edch h\u1ee3p ph\u00e2n t\u00edch th\u1ec3 t\u1ea1ng \u0110\u00f4ng Y.',b2b:true}
];

var _cart = [];
var _centerId = null;
var _activeCat = 'all';

// ── Helpers ──
function fmt(n){ return n.toLocaleString('vi-VN')+'\u0111'; }
function qs(s,p){ return (p||document).querySelector(s); }
function ce(t,c,h){ var e=document.createElement(t); if(c)e.className=c; if(h)e.innerHTML=h; return e; }
function getStock(centerId,sku){
  try{var w=JSON.parse(localStorage.getItem('anima_warehouses')||'{}');
  if(w[centerId]&&typeof w[centerId][sku]==='number') return w[centerId][sku];} catch(e){}
  return -1; // unknown
}
function genId(){ return 'ORD-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).substr(2,4).toUpperCase(); }
function catIcon(c){ return c==='anima119'?'\u2728':c==='healthcare'?'\ud83c\udf3f':'\u2699\ufe0f'; }

// ── Inject CSS ──
function injectCSS(){
  if(qs('#cs-style')) return;
  var s=document.createElement('style'); s.id='cs-style';
  s.textContent=[
  '#cs-overlay{position:fixed;inset:0;z-index:99990;background:#070E1E;overflow-y:auto;font-family:system-ui,-apple-system,sans-serif;color:#F8F2E0;display:none}',
  '#cs-overlay.cs-open{display:block}',
  '#cs-overlay *{box-sizing:border-box}',
  '.cs-hdr{display:flex;align-items:center;gap:12px;padding:16px 24px;background:rgba(13,21,32,.95);border-bottom:1px solid rgba(0,200,150,.12);position:sticky;top:0;z-index:10}',
  '.cs-back{background:none;border:1px solid rgba(0,200,150,.3);color:#00C896;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px;transition:.2s}',
  '.cs-back:hover{background:rgba(0,200,150,.1)}',
  '.cs-hdr-info{flex:1}',
  '.cs-hdr-name{font-size:20px;font-weight:700;color:#F8F2E0}',
  '.cs-hdr-badge{display:inline-block;background:linear-gradient(135deg,#00C896,#0FA);color:#070E1E;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;margin-left:10px}',
  '.cs-hdr-meta{font-size:12px;color:#B8D8D0;margin-top:2px}',
  '.cs-cart-btn{background:linear-gradient(135deg,#00C896,#0FA);color:#070E1E;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:700;font-size:14px;position:relative}',
  '.cs-cart-btn .cs-badge{position:absolute;top:-6px;right:-6px;background:#FF5252;color:#fff;width:20px;height:20px;border-radius:50%;font-size:11px;display:flex;align-items:center;justify-content:center}',
  '.cs-hero{background:linear-gradient(135deg,#0A1628 0%,#0D1F3C 40%,#0E1A2E 70%,#070E1E 100%);padding:48px 24px;text-align:center;position:relative;overflow:hidden}',
  '.cs-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(0,200,150,.08) 0%,transparent 70%)}',
  '.cs-hero h1{font-size:32px;font-weight:800;background:linear-gradient(135deg,#00C896,#9B82FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 8px}',
  '.cs-hero p{color:#B8D8D0;font-size:16px;margin:0 0 20px}',
  '.cs-stats{display:flex;justify-content:center;gap:32px}',
  '.cs-stat{text-align:center}',
  '.cs-stat b{display:block;font-size:22px;color:#00C896}',
  '.cs-stat span{font-size:12px;color:#607870}',
  '.cs-tabs{display:flex;gap:8px;padding:16px 24px;background:rgba(13,21,32,.6);border-bottom:1px solid rgba(0,200,150,.06);flex-wrap:wrap}',
  '.cs-tab{background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.12);color:#B8D8D0;padding:8px 18px;border-radius:20px;cursor:pointer;font-size:13px;transition:.2s}',
  '.cs-tab:hover,.cs-tab.active{background:rgba(0,200,150,.15);color:#00C896;border-color:rgba(0,200,150,.3)}',
  '.cs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;padding:24px;max-width:1200px;margin:0 auto}',
  '.cs-card{background:#0D1520;border:1px solid rgba(0,200,150,.08);border-radius:14px;overflow:hidden;transition:transform .2s,box-shadow .2s}',
  '.cs-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,200,150,.1)}',
  '.cs-card.eqp{border-color:rgba(155,130,255,.12)}',
  '.cs-card.eqp:hover{box-shadow:0 8px 32px rgba(155,130,255,.1)}',
  '.cs-card-img{height:160px;display:flex;align-items:center;justify-content:center;font-size:48px}',
  '.cs-card-img.anima119{background:linear-gradient(135deg,#0A1628,#1A2940)}',
  '.cs-card-img.healthcare{background:linear-gradient(135deg,#0A1A14,#12302A)}',
  '.cs-card-img.equipment{background:linear-gradient(135deg,#14102A,#1E1840)}',
  '.cs-card-body{padding:16px}',
  '.cs-card-name{font-size:15px;font-weight:700;color:#F8F2E0;margin:0 0 6px}',
  '.cs-card-desc{font-size:12px;color:#607870;margin:0 0 12px;line-height:1.4}',
  '.cs-card-foot{display:flex;align-items:center;justify-content:space-between}',
  '.cs-price{font-size:17px;font-weight:800;color:#00C896}',
  '.cs-price.eqp{color:#9B82FF}',
  '.cs-stock{font-size:11px;padding:3px 8px;border-radius:12px}',
  '.cs-stock.in{background:rgba(0,200,150,.1);color:#00C896}',
  '.cs-stock.out{background:rgba(255,82,82,.1);color:#FF5252}',
  '.cs-add{background:linear-gradient(135deg,#00C896,#0FA);color:#070E1E;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:700;font-size:13px;transition:.2s}',
  '.cs-add:hover{opacity:.85}',
  '.cs-add:disabled{opacity:.4;cursor:not-allowed}',
  '.cs-b2b{background:linear-gradient(135deg,#9B82FF,#7B62DF);color:#fff;border:none;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px}',
  /* Cart sidebar */
  '.cs-sidebar{position:fixed;top:0;right:-400px;width:380px;max-width:90vw;height:100%;background:#0D1520;border-left:1px solid rgba(0,200,150,.12);z-index:99995;transition:right .3s;display:flex;flex-direction:column;overflow:hidden}',
  '.cs-sidebar.open{right:0}',
  '.cs-sb-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(0,200,150,.08)}',
  '.cs-sb-hdr h3{margin:0;font-size:18px;color:#F8F2E0}',
  '.cs-sb-close{background:none;border:none;color:#607870;font-size:22px;cursor:pointer}',
  '.cs-sb-body{flex:1;overflow-y:auto;padding:16px 20px}',
  '.cs-sb-empty{text-align:center;color:#607870;padding:40px 0;font-size:14px}',
  '.cs-ci{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid rgba(0,200,150,.06)}',
  '.cs-ci-info{flex:1}',
  '.cs-ci-name{font-size:13px;font-weight:600;color:#F8F2E0}',
  '.cs-ci-price{font-size:12px;color:#00C896;margin-top:2px}',
  '.cs-ci-qty{display:flex;align-items:center;gap:8px;margin-top:6px}',
  '.cs-ci-qty button{width:26px;height:26px;border-radius:6px;border:1px solid rgba(0,200,150,.2);background:rgba(0,200,150,.06);color:#00C896;cursor:pointer;font-size:14px}',
  '.cs-ci-qty span{font-size:13px;color:#F8F2E0;min-width:20px;text-align:center}',
  '.cs-ci-rm{background:none;border:none;color:#FF5252;font-size:18px;cursor:pointer;padding:0 4px}',
  '.cs-sb-foot{padding:16px 20px;border-top:1px solid rgba(0,200,150,.08)}',
  '.cs-total{display:flex;justify-content:space-between;font-size:16px;font-weight:700;margin-bottom:12px}',
  '.cs-total span:last-child{color:#00C896}',
  '.cs-form label{display:block;font-size:12px;color:#B8D8D0;margin:8px 0 4px}',
  '.cs-form input,.cs-form select{width:100%;padding:8px 12px;background:#0A1118;border:1px solid rgba(0,200,150,.15);border-radius:8px;color:#F8F2E0;font-size:13px;outline:none}',
  '.cs-form input:focus,.cs-form select:focus{border-color:#00C896}',
  '.cs-submit{width:100%;padding:12px;background:linear-gradient(135deg,#00C896,#0FA);color:#070E1E;border:none;border-radius:10px;font-weight:800;font-size:15px;cursor:pointer;margin-top:14px;transition:.2s}',
  '.cs-submit:hover{opacity:.9}',
  '.cs-submit:disabled{opacity:.4;cursor:not-allowed}',
  '.cs-bank{background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.1);border-radius:8px;padding:10px;margin-top:8px;font-size:12px;color:#B8D8D0;line-height:1.6;display:none}',
  '.cs-footer{background:rgba(13,21,32,.95);border-top:1px solid rgba(0,200,150,.08);padding:24px;text-align:center}',
  '.cs-footer p{margin:4px 0;font-size:13px;color:#607870}',
  '.cs-footer a{color:#00C896;text-decoration:none}',
  '.cs-overlay-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99993}',
  '.cs-overlay-bg.open{display:block}',
  '.cs-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#00C896;color:#070E1E;padding:10px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;opacity:0;transition:opacity .3s;pointer-events:none}',
  '.cs-toast.show{opacity:1}',
  '@media(max-width:640px){.cs-grid{grid-template-columns:1fr;padding:16px}.cs-hero h1{font-size:24px}.cs-stats{gap:16px}.cs-hdr{padding:12px 16px;gap:8px}.cs-hdr-name{font-size:16px}}'
  ].join('\n');
  document.head.appendChild(s);
}

// ── Render overlay ──
function renderOverlay(){
  if(qs('#cs-overlay')) return;
  var d=ce('div',''); d.id='cs-overlay';
  d.innerHTML='<div class="cs-overlay-bg" id="cs-bg"></div><div class="cs-toast" id="cs-toast"></div>';
  document.body.appendChild(d);
}

function toast(msg){
  var t=qs('#cs-toast'); if(!t)return;
  t.textContent=msg; t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');},2000);
}

// ── Open store ──
window.openCenterStore = function(centerId){
  var c = CENTERS[centerId];
  if(!c){ console.warn('[CenterStore] Unknown center:',centerId); return; }
  _centerId = centerId;
  _cart = [];
  _activeCat = 'all';
  injectCSS();
  renderOverlay();
  var el = qs('#cs-overlay');
  el.innerHTML = buildHeader(c,centerId)+buildHero(c)+buildTabs()+
    '<div id="cs-products" class="cs-grid"></div>'+buildFooter(c)+
    buildCartSidebar()+
    '<div class="cs-overlay-bg" id="cs-bg" onclick="window.closeCenterCart()"></div>'+
    '<div class="cs-toast" id="cs-toast"></div>';
  el.classList.add('cs-open');
  document.body.style.overflow='hidden';
  renderProducts();
};

window.closeCenterStore = function(){
  var el=qs('#cs-overlay');
  if(el){el.classList.remove('cs-open');el.innerHTML='';}
  document.body.style.overflow='';
  _centerId=null; _cart=[];
  if(location.hash.indexOf('#center/')===0) history.replaceState(null,'','#');
};

// ── Build sections ──
function buildHeader(c,cid){
  var cnt = _cart.reduce(function(s,i){return s+i.qty;},0);
  return '<div class="cs-hdr">'+
    '<button class="cs-back" onclick="window.closeCenterStore()">\u2190 Trang Ch\u1ee7</button>'+
    '<div class="cs-hdr-info"><div class="cs-hdr-name">'+c.name+
    '<span class="cs-hdr-badge">\u0110\u1ed1i T\u00e1c \u0110\u1ed9c Quy\u1ec1n</span></div>'+
    '<div class="cs-hdr-meta">'+c.address+' &bull; '+c.phone+'</div></div>'+
    '<button class="cs-cart-btn" onclick="window.openCenterCart()">\ud83d\uded2 Gi\u1ecf H\u00e0ng'+
    '<span class="cs-badge" id="cs-cart-count">'+cnt+'</span></button></div>';
}

function buildHero(c){
  return '<div class="cs-hero"><h1>'+c.name+'</h1>'+
    '<p>Ph\u1ee5c H\u01b0ng S\u1ef1 S\u1ed1ng B\u00ean Trong</p>'+
    '<div class="cs-stats">'+
    '<div class="cs-stat"><b>'+PRODUCTS.length+'</b><span>S\u1ea3n ph\u1ea9m</span></div>'+
    '<div class="cs-stat"><b>4.9\u2605</b><span>\u0110\u00e1nh gi\u00e1</span></div>'+
    '<div class="cs-stat"><b>2026</b><span>N\u0103m ho\u1ea1t \u0111\u1ed9ng</span></div></div></div>';
}

function buildTabs(){
  var tabs=[{k:'all',l:'T\u1ea5t C\u1ea3'},{k:'anima119',l:'ANIMA 119'},{k:'healthcare',l:'Ch\u0103m S\u00f3c S\u1ee9c Kh\u1ecfe'},{k:'equipment',l:'Thi\u1ebft B\u1ecb'}];
  var h='<div class="cs-tabs">';
  tabs.forEach(function(t){
    h+='<button class="cs-tab'+(t.k===_activeCat?' active':'')+'" onclick="window.filterCenterProducts(\''+t.k+'\')">'+t.l+'</button>';
  });
  return h+'</div>';
}

function buildFooter(c){
  return '<div class="cs-footer">'+
    '<p><strong>'+c.name+'</strong> &mdash; '+c.address+'</p>'+
    '<p>Hotline: <a href="tel:0913156676">0913 156 676</a></p>'+
    '<p>&copy; Anima Care Global JSC</p></div>';
}

function buildCartSidebar(){
  return '<div class="cs-sidebar" id="cs-sidebar">'+
    '<div class="cs-sb-hdr"><h3>\ud83d\uded2 Gi\u1ecf H\u00e0ng</h3>'+
    '<button class="cs-sb-close" onclick="window.closeCenterCart()">\u2715</button></div>'+
    '<div class="cs-sb-body" id="cs-sb-body"></div>'+
    '<div class="cs-sb-foot" id="cs-sb-foot"></div></div>';
}

// ── Render products ──
function renderProducts(){
  var grid=qs('#cs-products'); if(!grid) return;
  var items=_activeCat==='all'?PRODUCTS:PRODUCTS.filter(function(p){return p.category===_activeCat;});
  grid.innerHTML='';
  items.forEach(function(p){
    var isB2B = p.b2b && p.price>10000000;
    var stock = getStock(_centerId,p.sku);
    var outOfStock = stock===0;
    var card=ce('div','cs-card'+(p.category==='equipment'?' eqp':''));
    card.innerHTML=
      '<div class="cs-card-img '+p.category+'">'+catIcon(p.category)+'</div>'+
      '<div class="cs-card-body">'+
      '<div class="cs-card-name">'+p.name+'</div>'+
      '<div class="cs-card-desc">'+p.desc+'</div>'+
      '<div class="cs-card-foot">'+
      (isB2B
        ?'<span class="cs-price eqp">Li\u00ean H\u1ec7 \u0110\u1eb7t H\u00e0ng</span>'
        :'<span class="cs-price'+(p.category==='equipment'?' eqp':'')+'">'+fmt(p.price)+'</span>')+
      (stock>=0?'<span class="cs-stock '+(outOfStock?'out':'in')+'">'+(outOfStock?'H\u1ebft H\u00e0ng':'C\u00f2n '+stock)+'</span>':'')+
      '</div>'+
      '<div style="margin-top:10px;text-align:right">'+
      (isB2B
        ?'<button class="cs-b2b" onclick="window.open(\'tel:0913156676\')">G\u1ecdi Ngay</button>'
        :'<button class="cs-add" onclick="window.addToCart(\''+p.sku+'\')"'+(outOfStock?' disabled':'')+'>Th\u00eam Gi\u1ecf</button>')+
      '</div></div>';
    grid.appendChild(card);
  });
}

// ── Filter ──
window.filterCenterProducts = function(cat){
  _activeCat = cat;
  var tabs=document.querySelectorAll('.cs-tab');
  for(var i=0;i<tabs.length;i++) tabs[i].classList.toggle('active',tabs[i].textContent.indexOf(
    cat==='all'?'T\u1ea5t':cat==='anima119'?'ANIMA':cat==='healthcare'?'CSSK':'Thi\u1ebft')>-1);
  renderProducts();
};

// ── Cart operations ──
window.addToCart = function(sku){
  var p=PRODUCTS.filter(function(x){return x.sku===sku;})[0];
  if(!p) return;
  var existing=null;
  for(var i=0;i<_cart.length;i++) if(_cart[i].sku===sku){existing=_cart[i];break;}
  if(existing) existing.qty++;
  else _cart.push({sku:sku,name:p.name,price:p.price,qty:1});
  updateCartBadge();
  toast('\u2705 \u0110\u00e3 th\u00eam: '+p.name);
};

window.removeFromCart = function(index){
  _cart.splice(index,1);
  updateCartBadge(); renderCartBody();
};

window.updateCartQty = function(index,qty){
  if(qty<1) return window.removeFromCart(index);
  _cart[index].qty=qty;
  updateCartBadge(); renderCartBody();
};

window.openCenterCart = function(){
  var sb=qs('#cs-sidebar'); if(sb) sb.classList.add('open');
  var bg=qs('#cs-bg'); if(bg) bg.classList.add('open');
  renderCartBody();
};

window.closeCenterCart = function(){
  var sb=qs('#cs-sidebar'); if(sb) sb.classList.remove('open');
  var bg=qs('#cs-bg'); if(bg) bg.classList.remove('open');
};

function updateCartBadge(){
  var cnt=_cart.reduce(function(s,i){return s+i.qty;},0);
  var b=qs('#cs-cart-count'); if(b) b.textContent=cnt;
}

function renderCartBody(){
  var body=qs('#cs-sb-body'), foot=qs('#cs-sb-foot');
  if(!body||!foot) return;
  if(!_cart.length){
    body.innerHTML='<div class="cs-sb-empty">Gi\u1ecf h\u00e0ng tr\u1ed1ng</div>';
    foot.innerHTML=''; return;
  }
  var h='';
  _cart.forEach(function(it,i){
    h+='<div class="cs-ci">'+
      '<div class="cs-ci-info"><div class="cs-ci-name">'+it.name+'</div>'+
      '<div class="cs-ci-price">'+fmt(it.price)+'</div>'+
      '<div class="cs-ci-qty">'+
      '<button onclick="window.updateCartQty('+i+','+(it.qty-1)+')">-</button>'+
      '<span>'+it.qty+'</span>'+
      '<button onclick="window.updateCartQty('+i+','+(it.qty+1)+')">+</button></div></div>'+
      '<button class="cs-ci-rm" onclick="window.removeFromCart('+i+')">\u2715</button></div>';
  });
  body.innerHTML=h;

  var total=_cart.reduce(function(s,i){return s+i.price*i.qty;},0);
  foot.innerHTML=
    '<div class="cs-total"><span>T\u1ed5ng c\u1ed9ng:</span><span>'+fmt(total)+'</span></div>'+
    '<div class="cs-form">'+
    '<label>H\u1ecd t\u00ean *</label><input id="cs-name" placeholder="Nguy\u1ec5n V\u0103n A">'+
    '<label>S\u1ed1 \u0111i\u1ec7n tho\u1ea1i *</label><input id="cs-phone" placeholder="09xx xxx xxx">'+
    '<label>\u0110\u1ecba ch\u1ec9 giao h\u00e0ng</label><input id="cs-addr" placeholder="\u0110\u1ecba ch\u1ec9 nh\u1eadn h\u00e0ng">'+
    '<label>Thanh to\u00e1n</label>'+
    '<select id="cs-pay">'+
    '<option value="cod">COD \u2014 Thanh to\u00e1n khi nh\u1eadn h\u00e0ng</option>'+
    '<option value="bank">Chuy\u1ec3n kho\u1ea3n ng\u00e2n h\u00e0ng</option>'+
    '<option value="payos">PayOS</option></select>'+
    '<div class="cs-bank" id="cs-bank-info"><b>Techcombank</b><br>STK: 131191828868<br>Ch\u1ee7 TK: CAO VAN TUAN<br>N\u1ed9i dung: [M\u00e3 \u0111\u01a1n] + SĐT</div>'+
    '</div>'+
    '<button class="cs-submit" id="cs-submit" onclick="window.submitCenterOrder()">\u0110\u1eb7t H\u00e0ng</button>';

  // Show bank info when bank selected
  setTimeout(function(){
    var sel=qs('#cs-pay');
    if(sel) sel.addEventListener('change',function(){
      var bi=qs('#cs-bank-info');
      if(bi) bi.style.display=sel.value==='bank'?'block':'none';
    });
  },0);
}

// ── Submit order ──
window.submitCenterOrder = function(){
  var name=(qs('#cs-name')||{}).value||'';
  var phone=(qs('#cs-phone')||{}).value||'';
  var addr=(qs('#cs-addr')||{}).value||'';
  var pay=(qs('#cs-pay')||{}).value||'cod';
  if(!name.trim()||!phone.trim()){
    toast('\u26a0\ufe0f Vui l\u00f2ng nh\u1eadp h\u1ecd t\u00ean v\u00e0 s\u1ed1 \u0111i\u1ec7n tho\u1ea1i');
    return;
  }
  var btn=qs('#cs-submit'); if(btn) btn.disabled=true;
  var total=_cart.reduce(function(s,i){return s+i.price*i.qty;},0);
  var orderId=genId();
  var center=CENTERS[_centerId]||{};
  var items=_cart.map(function(i){return{sku:i.sku,name:i.name,qty:i.qty,price:i.price};});

  var orderData={
    order_code:orderId,
    customer_name:name.trim(),
    customer_phone:phone.trim(),
    customer_email:'',
    address:addr.trim(),
    items:JSON.stringify(items),
    total_amount:total,
    payment_method:pay,
    payment_status:'unpaid',
    order_status:'pending',
    center_id:_centerId,
    center_name:center.city||'',
    commission:Math.round(total*0.15),
    notes:'Center Store order'
  };

  // Save to Supabase
  var orderP = (window.AnimaOrders && window.AnimaOrders.create)
    ? window.AnimaOrders.create(orderData)
    : Promise.resolve(orderData);

  // Create CRM lead
  var leadP = (window.AnimaCRM && window.AnimaCRM.createLead)
    ? window.AnimaCRM.createLead({
        name:name.trim(),
        phone:phone.trim(),
        email:'',
        source:'center_store',
        status:'new',
        center_id:_centerId,
        notes:'Auto-created from Center Store order '+orderId+'. Total: '+fmt(total)
      })
    : Promise.resolve(null);

  Promise.all([orderP,leadP]).then(function(){
    toast('\u2705 \u0110\u1eb7t h\u00e0ng th\u00e0nh c\u00f4ng! M\u00e3: '+orderId);
    _cart=[];
    updateCartBadge();
    window.closeCenterCart();
    // Also store locally
    try{
      var local=JSON.parse(localStorage.getItem('anima_orders')||'[]');
      local.push(orderData);
      localStorage.setItem('anima_orders',JSON.stringify(local));
    }catch(e){}
  }).catch(function(err){
    console.error('[CenterStore] Order error:',err);
    toast('\u26a0\ufe0f L\u1ed7i \u0111\u1eb7t h\u00e0ng. Vui l\u00f2ng th\u1eed l\u1ea1i.');
    if(btn) btn.disabled=false;
  });
};

// ── URL routing ──
function handleHash(){
  var h=location.hash||'';
  if(h.indexOf('#center/')===0){
    var slug=h.replace('#center/','').toLowerCase().trim();
    var cid=SLUG_MAP[slug];
    if(cid) window.openCenterStore(cid);
    else console.warn('[CenterStore] Unknown slug:',slug);
  }
}

window.addEventListener('hashchange',handleHash);
// Check on load
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',handleHash);
else handleHash();

})();
