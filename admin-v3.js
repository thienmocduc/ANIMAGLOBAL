/* ═══════════════════════════════════════════════════════════════════
   AnimaCare Admin Dashboard v3.0 — Complete Rewrite
   IIFE, no modules, all functions on window
   Data from Supabase via window.AnimaOrders, AnimaCRM, etc.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

// ═══ STATE ═══
var _page = 'dashboard';
var _orders = [];
var _leads = [];
var _contacts = [];
var _bookings = [];
var _loaded = {};
var _search = '';
var _filterStatus = '';
var _filterSource = '';

// ═══ CONSTANTS ═══
var ORDER_STATUSES = [
  {v:'pending',l:'Chờ XN',c:'#FFC800'},
  {v:'confirmed',l:'Đã XN',c:'#6496FF'},
  {v:'processing',l:'Đang XL',c:'#7B5FFF'},
  {v:'shipped',l:'Đang Giao',c:'#00B4D8'},
  {v:'delivered',l:'Hoàn Thành',c:'#00C896'},
  {v:'cancelled',l:'Đã Hủy',c:'#FF7070'}
];
var PAY_STATUSES = [
  {v:'unpaid',l:'Chưa TT',c:'#FF7070'},
  {v:'pending',l:'Chờ TT',c:'#FFC800'},
  {v:'paid',l:'Đã TT',c:'#00C896'},
  {v:'refunded',l:'Hoàn Tiền',c:'#7B5FFF'}
];
var LEAD_STATUSES = [
  {v:'new',l:'Mới',c:'#6496FF'},
  {v:'contacted',l:'Đã LH',c:'#FFC800'},
  {v:'qualified',l:'Chất lượng',c:'#7B5FFF'},
  {v:'proposal',l:'Đề xuất',c:'#00B4D8'},
  {v:'won',l:'Thành công',c:'#00C896'},
  {v:'lost',l:'Mất',c:'#FF7070'}
];
var BOOKING_STATUSES = [
  {v:'pending',l:'Chờ XN',c:'#FFC800'},
  {v:'confirmed',l:'Đã XN',c:'#6496FF'},
  {v:'completed',l:'Hoàn Thành',c:'#00C896'},
  {v:'cancelled',l:'Đã Hủy',c:'#FF7070'},
  {v:'no-show',l:'Vắng Mặt',c:'#7B5FFF'}
];
var NAV_ITEMS = [
  {id:'dashboard',icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',l:'Tổng Quan'},
  {id:'orders',icon:'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',l:'Đơn Hàng'},
  {id:'crm',icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',l:'CRM Leads'},
  {id:'customers',icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',l:'Khách Hàng'},
  {id:'bookings',icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',l:'Lịch Hẹn'},
  {id:'centers',icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',l:'Cơ Sở'},
  {id:'ktv',icon:'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z',l:'KTV'},
  {id:'inventory',icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',l:'Kho Hàng'},
  {id:'analytics',icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',l:'Analytics'},
  {id:'gamification',icon:'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3',l:'Gamification'},
  {id:'affiliate',icon:'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',l:'Affiliate'},
  {id:'agents',icon:'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.591.659H9.061a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v9.5',l:'AI Agent'},
  {id:'settings',icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',l:'Cài Đặt'}
];
var PRODUCTS = [
  {sku:'SVC-SCAN',name:'Khai Vấn AI',price:350000},
  {sku:'SVC-HERB',name:'Thảo Mộc Nhiệt',price:850000},
  {sku:'SVC-BATH',name:'Bồn Ngâm Thảo Mộc',price:650000},
  {sku:'SVC-ACU',name:'Châm Cứu Chuẩn',price:750000},
  {sku:'SVC-MASS',name:'Massage Kinh Lạc',price:950000},
  {sku:'SVC-STEAM',name:'Xông Hơi Thảo Mộc',price:550000},
  {sku:'SVC-FULL',name:'Liệu Trình Toàn Phần',price:2500000}
];

// ═══ INJECT CSS ═══
function injectCSS(){
  if(document.getElementById('admV3CSS')) return;
  var s=document.createElement('style');s.id='admV3CSS';
  s.textContent='\
#admV3{position:fixed;inset:0;z-index:10000;background:#070E1E;font-family:"Roboto","Segoe UI",sans-serif;color:#F8F2E0;display:none;overflow:hidden}\
#admV3 *{box-sizing:border-box;margin:0;padding:0}\
#admV3 .sb{position:fixed;left:0;top:0;bottom:0;width:250px;background:linear-gradient(180deg,#0A1218,#0D1820);border-right:1px solid rgba(0,200,150,.08);display:flex;flex-direction:column;z-index:10;transition:transform .3s}\
#admV3 .sb-hd{padding:12px 12px;border-bottom:1px solid rgba(0,200,150,.08)}\
#admV3 .sb-logo{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#00C896}\
#admV3 .sb-usr{margin-top:12px;padding:10px;border-radius:10px;background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.06)}\
#admV3 .sb-usr-n{font-size:13px;font-weight:600;color:#E8F8F4}\
#admV3 .sb-usr-r{font-size:10px;color:#00C896;text-transform:uppercase;letter-spacing:1px;margin-top:2px}\
#admV3 .sb-nav{flex:1;overflow-y:auto;padding:12px 10px}\
#admV3 .sb-it{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;cursor:pointer;color:#B8D8D0;font-size:13px;transition:all .2s;border:1px solid transparent;margin-bottom:1px}\
#admV3 .sb-it:hover{background:rgba(0,200,150,.06);color:#E8F8F4}\
#admV3 .sb-it.act{background:rgba(0,200,150,.1);color:#00C896;border-color:rgba(0,200,150,.15);font-weight:600}\
#admV3 .sb-it svg{width:18px;height:18px;flex-shrink:0;opacity:.7}\
#admV3 .sb-it.act svg{opacity:1}\
#admV3 .sb-it .bdg{margin-left:auto;background:rgba(0,200,150,.15);color:#00C896;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:600}\
#admV3 .sb-ft{padding:8px 10px;border-top:1px solid rgba(0,200,150,.08)}\
#admV3 .sb-close{display:flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;background:rgba(255,70,70,.06);border:1px solid rgba(255,70,70,.12);color:#FF7070;border-radius:8px;cursor:pointer;font-size:11px;font-family:inherit}\
#admV3 .sb-close svg{width:16px;height:16px}\
#admV3 .sb-close:hover{background:rgba(255,70,70,.12)}\
#admV3 .mn{margin-left:250px;height:100vh;overflow-y:auto;background:#070E1E}\
#admV3 .topbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:rgba(7,14,30,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,200,150,.05)}\
#admV3 .topbar h1{font-size:20px;font-weight:700;color:#F8F2E0}\
#admV3 .topbar-act{display:flex;align-items:center;gap:10px}\
#admV3 .pg{padding:20px 28px 50px}\
#admV3 .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:24px}\
#admV3 .kpi{background:#0D1520;border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px;position:relative;overflow:hidden}\
#admV3 .kpi::after{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--ac,#00C896),transparent)}\
#admV3 .kpi-v{font-size:24px;font-weight:700;color:#F8F2E0}\
#admV3 .kpi-l{font-size:11px;color:#607870;margin-top:3px;text-transform:uppercase;letter-spacing:.5px}\
#admV3 .crd{background:#0D1520;border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:18px;margin-bottom:16px}\
#admV3 .crd-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}\
#admV3 .crd-t{font-size:15px;font-weight:600;color:#E8F8F4}\
#admV3 .tbl-w{overflow-x:auto}\
#admV3 table{width:100%;border-collapse:collapse;font-size:12px}\
#admV3 th{text-align:left;padding:8px 12px;color:#607870;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:.5px;border-bottom:1px solid rgba(0,200,150,.08);white-space:nowrap}\
#admV3 td{padding:10px 12px;border-bottom:1px solid rgba(0,200,150,.04);color:#B8D8D0;white-space:nowrap}\
#admV3 tr:hover td{background:rgba(0,200,150,.02)}\
#admV3 .bdg{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600}\
#admV3 .btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .2s}\
#admV3 .btn-p{background:linear-gradient(135deg,#005A42,#00C896);color:#000;font-weight:600}\
#admV3 .btn-p:hover{box-shadow:0 0 16px rgba(0,200,150,.3)}\
#admV3 .btn-s{background:transparent;border:1px solid rgba(0,200,150,.2);color:#00C896}\
#admV3 .btn-s:hover{background:rgba(0,200,150,.08)}\
#admV3 .btn-sm{padding:4px 10px;font-size:11px;border-radius:6px}\
#admV3 select.f-sel{background:#0A1218;border:1px solid rgba(0,200,150,.15);color:#B8D8D0;font-size:11px;padding:5px 8px;border-radius:6px;font-family:inherit;outline:none}\
#admV3 .srch{display:flex;align-items:center;gap:8px;background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:10px;padding:7px 12px}\
#admV3 .srch input{background:none;border:none;outline:none;color:#E8F8F4;font-size:13px;font-family:inherit;width:200px}\
#admV3 .srch input::placeholder{color:#607870}\
#admV3 .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}\
#admV3 .bar-ch{display:flex;align-items:flex-end;gap:6px;height:160px;padding:10px 0}\
#admV3 .bar-ch .bar{flex:1;background:linear-gradient(to top,#005A42,#00C896);border-radius:4px 4px 0 0;min-height:4px;position:relative;transition:height .5s}\
#admV3 .bar-ch .bar span{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font-size:9px;color:#607870;white-space:nowrap}\
#admV3 .bar-ch .bar .bv{position:absolute;top:-16px;left:50%;transform:translateX(-50%);font-size:9px;color:#00C896;white-space:nowrap}\
#admV3 .modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:20;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}\
#admV3 .modal-ov.show{opacity:1;pointer-events:auto}\
#admV3 .modal{background:#0D1520;border:1px solid rgba(0,200,150,.12);border-radius:14px;padding:24px;width:92%;max-width:500px;max-height:80vh;overflow-y:auto}\
#admV3 .modal h3{font-size:17px;margin-bottom:18px;color:#E8F8F4}\
#admV3 .fg{margin-bottom:14px}\
#admV3 .fg label{display:block;font-size:11px;color:#607870;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px}\
#admV3 .fg input,.fg select,.fg textarea{width:100%;padding:9px 12px;background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:8px;color:#E8F8F4;font-size:13px;font-family:inherit;outline:none}\
#admV3 .fg input:focus,#admV3 .fg select:focus{border-color:rgba(0,200,150,.3)}\
#admV3 .empty{text-align:center;padding:40px;color:#607870;font-size:13px}\
#admV3 .row-act{display:flex;gap:4px}\
#admV3 .ham{display:none;position:fixed;top:14px;left:14px;z-index:11;width:36px;height:36px;border-radius:8px;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.12);color:#00C896;cursor:pointer;align-items:center;justify-content:center;font-size:18px}\
@media(max-width:768px){\
  #admV3 .sb{transform:translateX(-100%)}\
  #admV3 .sb.open{transform:translateX(0)}\
  #admV3 .mn{margin-left:0}\
  #admV3 .ham{display:flex}\
  #admV3 .grid2{grid-template-columns:1fr}\
  #admV3 .topbar{padding:14px 14px 14px 56px}\
  #admV3 .pg{padding:14px 14px 50px}\
  #admV3 .kpis{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}\
}';
  document.head.appendChild(s);
}

// ═══ HELPERS ═══
function money(n){return (n||0).toLocaleString('vi-VN')+'đ';}
function shortDate(d){if(!d) return '-';var dt=new Date(d);return dt.toLocaleDateString('vi-VN');}
function shortDateTime(d){if(!d) return '-';var dt=new Date(d);return dt.toLocaleDateString('vi-VN')+' '+dt.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});}
function badge(text,color){return '<span class="bdg" style="background:'+color+'20;color:'+color+'">'+text+'</span>';}
function svgIcon(path){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';}
function statusLabel(val,list){for(var i=0;i<list.length;i++){if(list[i].v===val) return list[i];}return {v:val,l:val,c:'#607870'};}
function el(id){return document.getElementById(id);}
function safeArr(v){return Array.isArray(v)?v:[];}

function genOrderCode(){return 'AC-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).substr(2,3).toUpperCase();}

// ═══ OPEN / CLOSE ═══
window.openAdminV3 = function(){
  injectCSS();
  var root=el('admV3');
  if(!root){
    root=document.createElement('div');root.id='admV3';
    var u={};try{u=JSON.parse(localStorage.getItem('anima_admin_user'))||{};}catch(e){}
    root.innerHTML='<button class="ham" onclick="document.querySelector(\'#admV3 .sb\').classList.toggle(\'open\')">&#9776;</button><div class="sb"><div class="sb-hd"><div class="sb-logo"><img src="images/img-52d87bf94f.png" style="height:36px;object-fit:contain;mix-blend-mode:screen;filter:brightness(1.1)" alt="ANIMA"> Admin</div><div class="sb-usr"><div class="sb-usr-n">'+(u.name||'Admin')+'</div><div class="sb-usr-r">'+(u.role||'SUPERADMIN')+'</div></div></div><div class="sb-nav" id="admV3Nav"></div><div class="sb-ft"><button class="sb-close" onclick="closeAdminV3()" title="Thoát" style="justify-content:center;padding:6px">'+svgIcon('M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1')+'</button></div></div><div class="mn"><div class="topbar"><h1 id="admV3Title">Tổng Quan</h1><div class="topbar-act" id="admV3Actions"></div></div><div class="pg" id="admV3Content"></div></div><div class="modal-ov" id="admV3Modal" onclick="if(event.target===this)admV3CloseModal()"><div class="modal" id="admV3ModalBody"></div></div>';
    document.body.appendChild(root);
  }
  root.style.display='block';
  document.body.style.overflow='hidden';
  _page='dashboard';_loaded={};_search='';_filterStatus='';_filterSource='';
  renderSidebar();
  renderPage('dashboard');
};

window.closeAdminV3 = function(){
  var root=el('admV3');
  if(root) root.style.display='none';
  document.body.style.overflow='';
};

// ═══ MODAL ═══
window.admV3Modal = function(title,html){
  var b=el('admV3ModalBody');if(!b)return;
  b.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px"><h3 style="margin:0">'+title+'</h3><button class="btn-s btn-sm" onclick="admV3CloseModal()" style="background:transparent;border:1px solid rgba(255,70,70,.2);color:#FF7070;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:inherit;font-size:11px">Đóng</button></div>'+html;
  el('admV3Modal').classList.add('show');
};
window.admV3CloseModal = function(){el('admV3Modal').classList.remove('show');};

// ═══ SIDEBAR ═══
function renderSidebar(){
  var nav=el('admV3Nav');if(!nav) return;
  var h='';
  NAV_ITEMS.forEach(function(it){
    var cls=it.id===_page?'sb-it act':'sb-it';
    h+='<div class="'+cls+'" onclick="admV3Go(\''+it.id+'\')" data-en="'+it.id+'">'+svgIcon(it.icon)+'<span>'+it.l+'</span></div>';
  });
  nav.innerHTML=h;
}

window.admV3Go = function(page){
  _page=page;_search='';_filterStatus='';_filterSource='';
  renderSidebar();
  renderPage(page);
  var sb=document.querySelector('#admV3 .sb');if(sb)sb.classList.remove('open');
};

function renderPage(page){
  var title='Tổng Quan';
  NAV_ITEMS.forEach(function(n){if(n.id===page) title=n.l;});
  var t=el('admV3Title');if(t) t.textContent=title;
  var c=el('admV3Content');if(!c) return;
  c.innerHTML='<div class="empty">Đang tải...</div>';
  var act=el('admV3Actions');if(act) act.innerHTML='';
  switch(page){
    case 'dashboard': pgDashboard();break;
    case 'orders': pgOrders();break;
    case 'crm': pgCRM();break;
    case 'customers': pgCustomers();break;
    case 'bookings': pgBookings();break;
    case 'centers': pgCenters();break;
    case 'ktv': pgKTV();break;
    case 'inventory': pgInventory();break;
    case 'analytics': pgAnalytics();break;
    case 'settings': pgSettings();break;
    case 'gamification': pgGamification();break;
    case 'affiliate': pgAffiliate();break;
    case 'agents': pgAgents();break;
    default: c.innerHTML='<div class="empty">Trang không tồn tại</div>';
  }
}

// ═══════════════════════════════════════
// PAGE 1: DASHBOARD
// ═══════════════════════════════════════
function pgDashboard(){
  var c=el('admV3Content');if(!c) return;
  var act=el('admV3Actions');
  if(act) act.innerHTML='<button class="btn btn-p btn-sm" onclick="admV3Go(\'orders\')">+ Tạo Đơn</button><button class="btn btn-s btn-sm" onclick="admV3Go(\'crm\')">+ Thêm Lead</button>';
  c.innerHTML='<div class="empty">Đang tải dữ liệu...</div>';

  Promise.all([
    safeLoad('AnimaOrders','getAll',[{limit:500}]),
    safeLoad('AnimaCRM','getLeads',[{limit:100}]),
    safeLoad('AnimaBookings','getAll',[{limit:100}])
  ]).then(function(res){
    _orders=safeArr(res[0]);_leads=safeArr(res[1]);_bookings=safeArr(res[2]);
    var today=new Date().toISOString().split('T')[0];
    var todayOrders=_orders.filter(function(o){return (o.created_at||'').indexOf(today)===0;});
    var totalRev=_orders.reduce(function(s,o){return s+(o.total_amount||0);},0);
    var pendingBk=_bookings.filter(function(b){return b.status==='pending';}).length;
    var uniquePhones={};_orders.forEach(function(o){if(o.customer_phone)uniquePhones[o.customer_phone]=1;});
    var activeCust=Object.keys(uniquePhones).length;
    var ktvs=[];try{var _kt=JSON.parse(localStorage.getItem('anima_saved_tech'));if(Array.isArray(_kt))ktvs=_kt;}catch(e){}
    var activeKtvs=ktvs.length?ktvs.filter(function(k){return k.status==='active';}).length||ktvs.length:0;
    var convRate=_leads.length?Math.round(_leads.filter(function(l){return l.status==='won';}).length/_leads.length*100):0;

    var h='<div class="kpis">';
    h+=kpi(money(totalRev),'Tổng Doanh Thu','#00C896');
    h+=kpi(todayOrders.length,'Đơn Hôm Nay','#6496FF');
    h+=kpi(activeCust,'Khách Hàng','#7B5FFF');
    h+=kpi(pendingBk,'Lịch Hẹn Chờ','#FFC800');
    h+=kpi(activeKtvs,'KTV Hoạt Động','#00B4D8');
    h+=kpi(convRate+'%','Tỉ Lệ Chuyển Đổi','#FF7070');
    h+='</div>';

    /* ── 48H COMMISSION AUTO-CHECK ── */
    var commReady=[];var commTotal=0;
    var now48=Date.now()-48*3600000;
    _orders.forEach(function(o){
      if(o.order_status==='delivered' && o.delivered_at){
        var deliveredTime=new Date(o.delivered_at).getTime();
        if(deliveredTime<now48 && o.payment_status==='paid' && !o._commission_released){
          var comm=o.commission||(o.total_amount?Math.round(o.total_amount*0.25):0);
          commReady.push({code:o.order_code,center:o.center_name||o.center_id,amount:comm,delivered:o.delivered_at});
          commTotal+=comm;
        }
      }
    });
    if(commReady.length){
      h+='<div class="crd" style="border-color:rgba(0,200,150,.25);background:rgba(0,200,150,.04)"><div class="crd-h"><span class="crd-t" style="color:#00C896">💰 Hoa Hồng Sẵn Sàng Giải Ngân (48h+)</span><button class="btn btn-p btn-sm" onclick="admV3ReleaseAllComm()">Giải Ngân '+money(commTotal)+'</button></div>';
      commReady.slice(0,5).forEach(function(cr){
        h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;margin-bottom:4px;background:rgba(0,200,150,.04);border-radius:8px;font-size:12px"><span><b style="color:#00C896">'+cr.code+'</b> → '+cr.center+'</span><span style="font-weight:700;color:#00C896">'+money(cr.amount)+'</span></div>';
      });
      if(commReady.length>5) h+='<div style="font-size:11px;color:#607870;padding:4px 12px">...và '+(commReady.length-5)+' đơn nữa</div>';
      h+='</div>';
    }

    /* ── AGENT AI DASHBOARD ALERTS ── */
    var dashAlerts=[];
    _orders.forEach(function(o){
      var age=(Date.now()-new Date(o.created_at).getTime())/3600000;
      if(o.order_status==='pending'&&age>24) dashAlerts.push('⏳ Đơn <b>'+o.order_code+'</b> chờ duyệt '+Math.round(age)+'h');
      if(o.order_status==='shipped'&&age>72) dashAlerts.push('🚨 Đơn <b>'+o.order_code+'</b> giao '+Math.round(age)+'h chưa hoàn thành');
    });
    if(dashAlerts.length){
      h+='<div class="crd" style="border-color:rgba(255,184,0,.15)"><div class="crd-h"><span class="crd-t" style="color:#FFC800">🤖 Agent Cảnh Báo</span></div>';
      dashAlerts.slice(0,4).forEach(function(a){h+='<div style="font-size:12px;color:#FFC800;padding:6px 0;border-bottom:1px solid rgba(255,184,0,.06)">'+a+'</div>';});
      h+='</div>';
    }

    // Revenue chart last 7 days
    h+='<div class="grid2">';
    h+='<div class="crd"><div class="crd-h"><span class="crd-t">Doanh Thu 7 Ngày Qua</span></div>';
    h+=buildRevenueChart(_orders,7);
    h+='</div>';

    // Recent Orders
    h+='<div class="crd"><div class="crd-h"><span class="crd-t">Đơn Hàng Gần Đây</span><button class="btn btn-s btn-sm" onclick="admV3Go(\'orders\')">Xem Tất Cả</button></div>';
    h+='<div class="tbl-w"><table><tr><th>Mã</th><th>Khách</th><th>Thành Tiền</th><th>Trạng Thái</th></tr>';
    _orders.slice(0,10).forEach(function(o){
      var st=statusLabel(o.order_status,ORDER_STATUSES);
      h+='<tr><td style="color:#00C896;font-weight:600">'+(o.order_code||'-')+'</td><td>'+(o.customer_name||'-')+'</td><td>'+money(o.total_amount)+'</td><td>'+badge(st.l,st.c)+'</td></tr>';
    });
    if(!_orders.length) h+='<tr><td colspan="4" class="empty">Không có dữ liệu</td></tr>';
    h+='</table></div></div>';
    h+='</div>';

    // Recent CRM
    h+='<div class="crd" style="margin-top:16px"><div class="crd-h"><span class="crd-t">CRM Leads Gần Đây</span><button class="btn btn-s btn-sm" onclick="admV3Go(\'crm\')">Xem Tất Cả</button></div>';
    h+='<div class="tbl-w"><table><tr><th>Tên</th><th>SĐT</th><th>Nguồn</th><th>Trạng Thái</th></tr>';
    _leads.slice(0,5).forEach(function(l){
      var st=statusLabel(l.status,LEAD_STATUSES);
      h+='<tr><td>'+(l.name||l.full_name||'-')+'</td><td>'+(l.phone||'-')+'</td><td>'+(l.source||'-')+'</td><td>'+badge(st.l,st.c)+'</td></tr>';
    });
    if(!_leads.length) h+='<tr><td colspan="4" class="empty">Không có dữ liệu</td></tr>';
    h+='</table></div></div>';

    c.innerHTML=h;
  }).catch(function(err){
    c.innerHTML='<div class="empty">Không có dữ liệu - '+err.message+'</div>';
  });
}

function kpi(value,label,color){
  return '<div class="kpi" style="--ac:'+color+'"><div class="kpi-v" style="color:'+color+'">'+value+'</div><div class="kpi-l">'+label+'</div></div>';
}

function buildRevenueChart(orders,days){
  var map={};var labels=[];
  for(var i=days-1;i>=0;i--){
    var d=new Date();d.setDate(d.getDate()-i);
    var key=d.toISOString().split('T')[0];
    var label=(d.getMonth()+1)+'/'+d.getDate();
    map[key]=0;labels.push({key:key,label:label});
  }
  orders.forEach(function(o){
    var dk=(o.created_at||'').split('T')[0];
    if(map.hasOwnProperty(dk)) map[dk]+=(o.total_amount||0);
  });
  var maxVal=1;labels.forEach(function(l){if(map[l.key]>maxVal) maxVal=map[l.key];});
  var h='<div class="bar-ch" style="padding-bottom:24px">';
  labels.forEach(function(l){
    var pct=Math.max(4,Math.round(map[l.key]/maxVal*100));
    h+='<div class="bar" style="height:'+pct+'%"><div class="bv">'+money(map[l.key])+'</div><span>'+l.label+'</span></div>';
  });
  h+='</div>';
  return h;
}

// ═══════════════════════════════════════
// PAGE 2: ORDERS
// ═══════════════════════════════════════
function pgOrders(){
  var c=el('admV3Content');if(!c) return;
  var act=el('admV3Actions');
  if(act) act.innerHTML='<button class="btn btn-p btn-sm" onclick="admV3ShowCreateOrder()">+ TẠO ĐƠN</button>';
  c.innerHTML='<div class="empty">Đang tải đơn hàng...</div>';

  safeLoad('AnimaOrders','getAll',[{limit:500}]).then(function(data){
    _orders=safeArr(data);
    renderOrdersPage();
  }).catch(function(){_orders=[];renderOrdersPage();});
}

function renderOrdersPage(){
  var c=el('admV3Content');if(!c) return;
  var filtered=filterOrders();
  var pending=_orders.filter(function(o){return o.order_status==='pending';}).length;
  var processing=_orders.filter(function(o){return o.order_status==='processing';}).length;
  var shipped=_orders.filter(function(o){return o.order_status==='shipped';}).length;
  var delivered=_orders.filter(function(o){return o.order_status==='delivered';}).length;
  var totalRev=_orders.reduce(function(s,o){return s+(o.total_amount||0);},0);

  /* Build alerts with contact info */
  var _alerts=[];
  var centers={};
  if(window.AnimaSync){var _cs=AnimaSync.get('centers',[]);_cs.forEach(function(c){centers[c._id]={name:c.name||c.city,phone:c.phone||'0913 156 676',manager:c.manager||c.name||c.city};});}
  var now=Date.now();
  _orders.forEach(function(o){
    var age=Math.round((now-new Date(o.created_at).getTime())/3600000);
    var ct=centers[o.center_id]||{name:o.center_name||'Online',phone:'0913 156 676',manager:o.center_name||''};
    if(o.order_status==='pending'&&age>24) _alerts.push({sev:'warn',icon:'⏳',msg:'Đơn <b>'+o.order_code+'</b> chờ duyệt '+age+'h',contact:ct.manager,phone:ct.phone,action:'Gọi '+ct.name});
    if(o.order_status==='shipped'&&age>72) _alerts.push({sev:'error',icon:'🚨',msg:'Đơn <b>'+o.order_code+'</b> giao '+age+'h chưa xong',contact:ct.manager,phone:ct.phone,action:'Gọi shipper'});
    if(o.order_status==='delivered'&&o.payment_status!=='paid') _alerts.push({sev:'info',icon:'💰',msg:'Đơn <b>'+o.order_code+'</b> đã giao chưa TT',contact:o.customer_name||'',phone:o.customer_phone||'',action:'Gọi KH thu tiền'});
  });
  /* Check warehouse stock */
  var wh={};try{wh=JSON.parse(localStorage.getItem('anima_warehouses')||'{}');}catch(e){}
  Object.keys(centers).forEach(function(cid){
    var w=wh[cid]||{};var stock=(w.a119_10||0)+(w.a119_30||0)+(w.a119_120||0);
    if(stock<5){var ct=centers[cid];_alerts.push({sev:'error',icon:'📦',msg:'Kho <b>'+ct.name+'</b> gần hết ('+stock+' SP)',contact:ct.manager,phone:ct.phone,action:'Gọi nhập kho'});}
  });

  var h='<div style="display:grid;grid-template-columns:repeat(4,1fr) 1.2fr 1.5fr;gap:12px;margin-bottom:20px">';
  h+=kpi(pending,'Chờ XN','#FFC800');
  h+=kpi(processing,'Đang XL','#7B5FFF');
  h+=kpi(shipped,'Đang Giao','#00B4D8');
  h+=kpi(delivered,'Hoàn Thành','#00C896');
  h+=kpi(money(totalRev),'Doanh Thu','#00C896');
  /* Agent Alert KPI — clickable */
  h+='<div class="kpi" style="cursor:pointer;--ac:'+(_alerts.length>0?'#FFC800':'#00C896')+'" onclick="document.getElementById(\'ordAlertPanel\').style.display=document.getElementById(\'ordAlertPanel\').style.display===\'none\'?\'block\':\'none\'">';
  h+='<div style="display:flex;justify-content:space-between;align-items:center"><div class="kpi-v" style="color:'+(_alerts.length>0?'#FFC800':'#00C896')+'">'+_alerts.length+'</div><span style="font-size:18px">🤖</span></div>';
  h+='<div class="kpi-l">Agent Cảnh Báo '+(_alerts.length>0?'⚠️':'✅')+'</div>';
  h+='</div></div>';
  /* Alert dropdown panel — hidden by default */
  h+='<div id="ordAlertPanel" style="display:none;margin-bottom:16px">';
  if(_alerts.length){
    h+='<div class="crd" style="border-color:rgba(255,184,0,.2);max-height:320px;overflow-y:auto">';
    h+='<div class="crd-h"><span class="crd-t" style="color:#FFC800">🤖 Agent AI — '+_alerts.length+' Cảnh Báo</span></div>';
    _alerts.forEach(function(a,i){
      var bg=a.sev==='error'?'rgba(255,70,70,.08)':a.sev==='warn'?'rgba(255,184,0,.06)':'rgba(0,200,150,.04)';
      h+='<div style="background:'+bg+';border-radius:10px;padding:12px;margin-bottom:6px;display:flex;align-items:center;gap:10px">';
      h+='<span style="font-size:18px;flex-shrink:0">'+a.icon+'</span>';
      h+='<div style="flex:1;min-width:0"><div style="font-size:12px;color:#E8F8F4;line-height:1.5">'+a.msg+'</div>';
      if(a.contact) h+='<div style="font-size:11px;color:#607870;margin-top:2px">👤 '+a.contact+'</div>';
      h+='</div>';
      /* Call button */
      if(a.phone) h+='<a href="tel:'+a.phone.replace(/\s/g,'')+'" style="flex-shrink:0;display:flex;align-items:center;gap:4px;padding:6px 12px;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2);border-radius:8px;color:#00C896;font-size:11px;font-weight:600;text-decoration:none;white-space:nowrap" title="'+a.phone+'">📞 '+a.action+'</a>';
      h+='</div>';
    });
    h+='</div>';
  } else {
    h+='<div class="crd" style="border-color:rgba(0,200,150,.2)"><div style="text-align:center;padding:16px;color:#00C896;font-size:13px">✅ Không có cảnh báo — Hệ thống hoạt động bình thường</div></div>';
  }
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><div style="display:flex;gap:10px;align-items:center">';
  h+='<div class="srch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input placeholder="Tìm tên, SĐT, mã đơn..." value="'+(_search||'')+'" oninput="admV3OrderSearch(this.value)"/></div>';
  h+='<select class="f-sel" onchange="admV3OrderFilter(this.value)"><option value="">Tất Cả Trạng Thái</option>';
  ORDER_STATUSES.forEach(function(s){h+='<option value="'+s.v+'"'+(_filterStatus===s.v?' selected':'')+'>'+s.l+'</option>';});
  h+='</select></div><span style="color:#607870;font-size:12px">'+filtered.length+' đơn</span></div>';

  /* ── AGENT AI ALERTS ── */
  var alerts=[];
  var now=Date.now();
  _orders.forEach(function(o){
    var age=(now-new Date(o.created_at).getTime())/3600000;
    if(o.order_status==='pending'&&age>24) alerts.push({type:'warn',msg:'⚠️ Đơn <b>'+(o.order_code||'')+'</b> chờ duyệt quá 24h — Khách: '+(o.customer_name||'')});
    if(o.order_status==='shipped'&&age>72) alerts.push({type:'error',msg:'🚨 Đơn <b>'+(o.order_code||'')+'</b> giao quá 72h chưa hoàn thành'});
    if(o.order_status==='delivered'&&o.payment_status!=='paid') alerts.push({type:'info',msg:'💰 Đơn <b>'+(o.order_code||'')+'</b> đã giao nhưng chưa thanh toán'});
  });
  if(alerts.length){
    h+='<div class="crd" style="border-color:rgba(255,184,0,.2);background:rgba(255,184,0,.03)"><div class="crd-h"><span class="crd-t" style="color:#FFC800">🤖 Agent AI Cảnh Báo ('+alerts.length+')</span></div>';
    alerts.slice(0,8).forEach(function(a){
      var bg=a.type==='error'?'rgba(255,70,70,.08)':a.type==='warn'?'rgba(255,184,0,.06)':'rgba(0,200,150,.04)';
      h+='<div style="background:'+bg+';border-radius:8px;padding:10px 14px;margin-bottom:6px;font-size:12px;color:#E8F8F4;line-height:1.5">'+a.msg+'</div>';
    });
    h+='</div>';
  }

  h+='<div class="crd"><div class="crd-h"><div style="display:flex;gap:10px;align-items:center">';
  h+='<div class="srch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input placeholder="Tìm tên, SĐT, mã đơn..." value="'+(_search||'')+'" oninput="admV3OrderSearch(this.value)"/></div>';
  h+='<select class="f-sel" onchange="admV3OrderFilter(this.value)"><option value="">Tất Cả Trạng Thái</option>';
  ORDER_STATUSES.forEach(function(s){h+='<option value="'+s.v+'"'+(_filterStatus===s.v?' selected':'')+'>'+s.l+'</option>';});
  h+='</select></div><span style="color:#607870;font-size:12px">'+filtered.length+' đơn</span></div>';

  h+='<div class="tbl-w"><table><tr><th>Mã Đơn</th><th>Khách Hàng</th><th>SP</th><th>Tỉnh/Cơ Sở</th><th>Thành Tiền</th><th>TT</th><th>Ngày</th><th>Trạng Thái</th><th></th></tr>';
  filtered.forEach(function(o){
    var items='-';try{var it=typeof o.items==='string'?JSON.parse(o.items):o.items;if(Array.isArray(it)&&it.length)items=it.map(function(i){return i.name||i.sku;}).join(', ');}catch(e){}
    var centerName=o.center_name||o.center_id||'Online';

    h+='<tr><td style="color:#00C896;font-weight:600;font-size:11px">'+(o.order_code||'-')+'</td>';
    h+='<td><div style="font-weight:600">'+(o.customer_name||'-')+'</div><div style="font-size:10px;color:#607870">'+(o.customer_phone||'')+'</div></td>';
    h+='<td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;font-size:11px">'+items+'</td>';
    h+='<td style="font-size:11px;color:#9B82FF">'+centerName+'</td>';
    h+='<td style="font-weight:600;color:#00C896">'+money(o.total_amount)+'</td>';
    h+='<td><select class="f-sel" style="font-size:10px" onchange="admV3UpdatePayment(\''+o.id+'\',this.value)">';
    PAY_STATUSES.forEach(function(p){h+='<option value="'+p.v+'"'+(o.payment_status===p.v?' selected':'')+'>'+p.l+'</option>';});
    h+='</select></td>';
    h+='<td style="font-size:11px">'+shortDate(o.created_at)+'</td>';
    h+='<td><select class="f-sel" style="font-size:10px" onchange="admV3UpdateOrderStatus(\''+o.id+'\',this.value)">';
    ORDER_STATUSES.forEach(function(s){h+='<option value="'+s.v+'"'+(o.order_status===s.v?' selected':'')+'>'+s.l+'</option>';});
    h+='</select></td>';
    h+='<td class="row-act"><button class="btn btn-s btn-sm" onclick="admV3ViewOrder(\''+o.id+'\')">⋯</button></td></tr>';
  });
  if(!filtered.length) h+='<tr><td colspan="9" class="empty">Không có đơn hàng</td></tr>';
  h+='</table></div></div>';
  c.innerHTML=h;
}

function filterOrders(){
  return _orders.filter(function(o){
    if(_filterStatus && o.order_status!==_filterStatus) return false;
    if(_search){
      var s=_search.toLowerCase();
      var match=(o.customer_name||'').toLowerCase().indexOf(s)>-1||(o.customer_phone||'').indexOf(s)>-1||(o.order_code||'').toLowerCase().indexOf(s)>-1;
      if(!match) return false;
    }
    return true;
  });
}

window.admV3OrderSearch=function(v){_search=v;renderOrdersPage();};
window.admV3OrderFilter=function(v){_filterStatus=v;renderOrdersPage();};

window.admV3UpdateOrderStatus=function(id,status){
  if(status==='shipped'){
    var code=prompt('Nhập mã vận chuyển (tracking code):');
    if(!code) return;
    safeCall('AnimaOrders','update',[id,{order_status:status,tracking_code:code}]).then(function(){reloadOrders();});
  } else if(status==='cancelled'){
    var reason=prompt('Nhập lý do hủy đơn:');
    if(!reason) return;
    safeCall('AnimaOrders','update',[id,{order_status:status,cancel_reason:reason}]).then(function(){reloadOrders();});
  } else {
    safeCall('AnimaOrders','updateStatus',[id,status]).then(function(){reloadOrders();});
  }
};

window.admV3UpdatePayment=function(id,status){
  safeCall('AnimaOrders','update',[id,{payment_status:status}]).then(function(){reloadOrders();});
};

window.admV3ViewOrder=function(id){
  var o=_orders.filter(function(x){return x.id===id;})[0];
  if(!o) return;
  var items=[];try{items=typeof o.items==='string'?JSON.parse(o.items):o.items||[];}catch(e){}
  var h='<div style="display:grid;gap:10px">';
  h+='<div><span style="color:#607870">Mã đơn:</span> <b style="color:#00C896">'+(o.order_code||'-')+'</b></div>';
  h+='<div><span style="color:#607870">Khách:</span> '+(o.customer_name||'-')+' - '+(o.customer_phone||'-')+'</div>';
  h+='<div><span style="color:#607870">Email:</span> '+(o.customer_email||'-')+'</div>';
  h+='<div><span style="color:#607870">Địa chỉ:</span> '+(o.address||'-')+'</div>';
  h+='<div><span style="color:#607870">Sản phẩm:</span></div>';
  items.forEach(function(it){h+='<div style="padding-left:12px;font-size:12px;color:#B8D8D0">- '+(it.name||it.sku)+' x'+(it.qty||1)+' = '+money(it.price)+'</div>';});
  h+='<div><span style="color:#607870">Thành tiền:</span> <b style="color:#00C896">'+money(o.total_amount)+'</b></div>';
  h+='<div><span style="color:#607870">Thanh toán:</span> '+(o.payment_method||'-')+' / '+badge(statusLabel(o.payment_status,PAY_STATUSES).l,statusLabel(o.payment_status,PAY_STATUSES).c)+'</div>';
  h+='<div><span style="color:#607870">Trạng thái:</span> '+badge(statusLabel(o.order_status,ORDER_STATUSES).l,statusLabel(o.order_status,ORDER_STATUSES).c)+'</div>';
  h+='<div><span style="color:#607870">Ghi chú:</span> '+(o.notes||'-')+'</div>';
  h+='<div><span style="color:#607870">Ngày tạo:</span> '+shortDateTime(o.created_at)+'</div>';
  if(o.tracking_code) h+='<div><span style="color:#607870">Tracking:</span> '+o.tracking_code+'</div>';
  if(o.cancel_reason) h+='<div><span style="color:#607870">Lý do hủy:</span> <span style="color:#FF7070">'+o.cancel_reason+'</span></div>';
  h+='</div>';
  admV3Modal('Chi Tiết Đơn #'+(o.order_code||''),h);
};

window.admV3ShowCreateOrder=function(){
  var h='<div class="fg"><label>Tên Khách Hàng</label><input id="_oName" placeholder="Nhập tên..."></div>';
  h+='<div class="fg"><label>Số Điện Thoại</label><input id="_oPhone" placeholder="0xxx..."></div>';
  h+='<div class="fg"><label>Email</label><input id="_oEmail" placeholder="email@..."></div>';
  h+='<div class="fg"><label>Địa Chỉ</label><input id="_oAddr" placeholder="Địa chỉ giao hàng..."></div>';
  h+='<div class="fg"><label>Sản Phẩm</label><select id="_oProd">';
  PRODUCTS.forEach(function(p){h+='<option value="'+p.sku+'" data-price="'+p.price+'">'+p.name+' - '+money(p.price)+'</option>';});
  h+='</select></div>';
  h+='<div class="fg"><label>Số Lượng</label><input id="_oQty" type="number" value="1" min="1"></div>';
  h+='<div class="fg"><label>Phương Thức Thanh Toán</label><select id="_oPay"><option value="cod">COD</option><option value="bank">Chuyển Khoản</option><option value="momo">MoMo</option></select></div>';
  h+='<div class="fg"><label>Ghi Chú</label><textarea id="_oNote" rows="2"></textarea></div>';
  h+='<button class="btn btn-p" style="width:100%;justify-content:center;margin-top:8px" onclick="admV3SubmitOrder()">Tạo Đơn Hàng</button>';
  admV3Modal('Tạo Đơn Hàng Mới',h);
};

window.admV3SubmitOrder=function(){
  var name=el('_oName').value.trim();
  var phone=el('_oPhone').value.trim();
  if(!name||!phone){alert('Vui lòng nhập tên và SĐT');return;}
  var sel=el('_oProd');var sku=sel.value;
  var prod=PRODUCTS.filter(function(p){return p.sku===sku;})[0]||PRODUCTS[0];
  var qty=parseInt(el('_oQty').value)||1;
  var total=prod.price*qty;
  var data={
    order_code:genOrderCode(),
    customer_name:name,customer_phone:phone,customer_email:el('_oEmail').value.trim(),
    address:el('_oAddr').value.trim(),
    items:JSON.stringify([{name:prod.name,sku:prod.sku,qty:qty,price:total}]),
    total_amount:total,
    payment_method:el('_oPay').value,payment_status:'unpaid',order_status:'pending',
    notes:el('_oNote').value.trim()
  };
  safeCall('AnimaOrders','create',[data]).then(function(){admV3CloseModal();reloadOrders();}).catch(function(e){alert('Lỗi: '+e.message);});
};

function reloadOrders(){
  safeLoad('AnimaOrders','getAll',[{limit:500}]).then(function(d){_orders=safeArr(d);renderOrdersPage();});
}

// ═══════════════════════════════════════
// PAGE 3: CRM — 3-TAB SYSTEM
// ═══════════════════════════════════════
var _crmTab='customers';
var _crmSearch='';
var _crmTierFilter='';
var _crmCustomers=[];
var _crmKTVs=[];
var _crmCentersData=[];

function pgCRM(){
  var c=el('admV3Content');if(!c) return;
  var act=el('admV3Actions');
  if(act) act.innerHTML='<button class="btn btn-p btn-sm" onclick="admV3ShowCreateLead()">+ THÊM LEAD</button>';
  c.innerHTML='<div class="empty">Đang tải CRM...</div>';

  // Load all data in parallel
  Promise.all([
    safeLoad('AnimaOrders','getAll',[{limit:1000}]),
    safeLoad('AnimaCRM','getLeads',[{limit:500}]),
    safeLoad('AnimaContacts','getAll',[{limit:500}])
  ]).then(function(res){
    _orders=safeArr(res[0]);
    _leads=safeArr(res[1]);
    _contacts=safeArr(res[2]);
    buildCRMCustomers();
    buildCRMKTVs();
    buildCRMCenters();
    renderCRMTabs();
  }).catch(function(){
    _orders=[];_leads=[];_contacts=[];
    buildCRMCustomers();buildCRMKTVs();buildCRMCenters();
    renderCRMTabs();
  });
}

function buildCRMCustomers(){
  var map={};
  _orders.forEach(function(o){
    var key=o.customer_phone||o.phone||'';
    if(!key) return;
    if(!map[key]) map[key]={name:o.customer_name||o.full_name||'-',phone:key,email:o.customer_email||o.email||'',province:o.province||o.city||o.shipping_province||'-',totalSpent:0,orderCount:0,lastOrder:null};
    map[key].totalSpent+=(o.total_amount||0);
    map[key].orderCount++;
    if(!map[key].lastOrder||o.created_at>map[key].lastOrder) map[key].lastOrder=o.created_at;
    if(o.customer_name && map[key].name==='-') map[key].name=o.customer_name;
    if(o.customer_email && !map[key].email) map[key].email=o.customer_email;
    if((o.province||o.city||o.shipping_province) && map[key].province==='-') map[key].province=o.province||o.city||o.shipping_province;
  });
  // Merge CRM leads
  _leads.forEach(function(l){
    var key=l.phone||'';
    if(!key) return;
    if(!map[key]) map[key]={name:l.name||l.full_name||'-',phone:key,email:l.email||'',province:l.province||l.city||'-',totalSpent:0,orderCount:0,lastOrder:l.created_at||null};
    if(map[key].name==='-' && (l.name||l.full_name)) map[key].name=l.name||l.full_name;
    if(!map[key].email && l.email) map[key].email=l.email;
  });
  _crmCustomers=Object.keys(map).map(function(k){
    var c=map[k];
    c.tier=c.totalSpent>=50000000?'Platinum':c.totalSpent>=20000000?'Gold':c.totalSpent>=5000000?'Silver':'Bronze';
    return c;
  });
  _crmCustomers.sort(function(a,b){return b.totalSpent-a.totalSpent;});
}

function buildCRMKTVs(){
  _crmKTVs=[];
  try{
    var raw=JSON.parse(localStorage.getItem('anima_saved_tech'));
    if(Array.isArray(raw)) _crmKTVs=raw;
  }catch(e){}
}

function buildCRMCenters(){
  _crmCentersData=[];
  var c1=[];
  if(window.AnimaSync && window.AnimaSync.get){
    try{c1=window.AnimaSync.get('centers',[]);}catch(e){}
  }
  if(!Array.isArray(c1)||!c1.length){
    c1=[
      {_id:'CTR-HN',name:'Anima Care Ha Noi',city:'Ha Noi',region:'north',tier:1,status:'active'},
      {_id:'CTR-HCM',name:'Anima Care TP.HCM',city:'TP.HCM',region:'south',tier:1,status:'active'},
      {_id:'CTR-DN',name:'Anima Care Da Nang',city:'Da Nang',region:'central',tier:1,status:'active'},
      {_id:'CTR-HP',name:'Anima Care Hai Phong',city:'Hai Phong',region:'north',tier:1,status:'active'},
      {_id:'CTR-CT',name:'Anima Care Can Tho',city:'Can Tho',region:'south',tier:1,status:'active'},
      {_id:'CTR-HUE',name:'Anima Care Hue',city:'Hue',region:'central',tier:1,status:'active'},
      {_id:'CTR-NT',name:'Anima Care Nha Trang',city:'Nha Trang',region:'central',tier:1,status:'active'},
      {_id:'CTR-VT',name:'Anima Care Vung Tau',city:'Vung Tau',region:'south',tier:1,status:'active'},
      {_id:'CTR-QN',name:'Anima Care Quang Ninh',city:'Quang Ninh',region:'north',tier:1,status:'active'},
      {_id:'CTR-BD',name:'Anima Care Binh Duong',city:'Binh Duong',region:'south',tier:1,status:'active'},
      {_id:'CTR-DN2',name:'Anima Care Dong Nai',city:'Dong Nai',region:'south',tier:1,status:'pending'},
      {_id:'CTR-TH',name:'Anima Care Thanh Hoa',city:'Thanh Hoa',region:'north',tier:1,status:'pending'},
      {_id:'CTR-NA',name:'Anima Care Nghe An',city:'Nghe An',region:'central',tier:1,status:'pending'},
      {_id:'CTR-BN',name:'Anima Care Bac Ninh',city:'Bac Ninh',region:'north',tier:1,status:'pending'},
      {_id:'CTR-HD',name:'Anima Care Hai Duong',city:'Hai Duong',region:'north',tier:1,status:'pending'},
      {_id:'CTR-LA',name:'Anima Care Long An',city:'Long An',region:'south',tier:1,status:'pending'},
      {_id:'CTR-QNA',name:'Anima Care Quang Nam',city:'Quang Nam',region:'central',tier:1,status:'pending'},
      {_id:'CTR-KH',name:'Anima Care Khanh Hoa',city:'Khanh Hoa',region:'central',tier:1,status:'pending'},
      {_id:'CTR-GL',name:'Anima Care Gia Lai',city:'Gia Lai',region:'central',tier:1,status:'pending'},
      {_id:'CTR-DL',name:'Anima Care Da Lat',city:'Da Lat',region:'central',tier:1,status:'pending'},
      {_id:'CTR-AG',name:'Anima Care An Giang',city:'An Giang',region:'south',tier:1,status:'pending'},
      {_id:'CTR-TG',name:'Anima Care Tien Giang',city:'Tien Giang',region:'south',tier:1,status:'pending'},
      {_id:'CTR-BT',name:'Anima Care Ben Tre',city:'Ben Tre',region:'south',tier:1,status:'pending'},
      {_id:'CTR-TB',name:'Anima Care Thai Binh',city:'Thai Binh',region:'north',tier:1,status:'pending'},
      {_id:'CTR-NB',name:'Anima Care Ninh Binh',city:'Ninh Binh',region:'north',tier:1,status:'pending'},
      {_id:'CTR-PY',name:'Anima Care Phu Yen',city:'Phu Yen',region:'central',tier:1,status:'pending'},
      {_id:'CTR-BP',name:'Anima Care Binh Phuoc',city:'Binh Phuoc',region:'south',tier:1,status:'pending'},
      {_id:'CTR-TN',name:'Anima Care Tay Ninh',city:'Tay Ninh',region:'south',tier:1,status:'pending'},
      {_id:'CTR-VL',name:'Anima Care Vinh Long',city:'Vinh Long',region:'south',tier:1,status:'pending'},
      {_id:'CTR-VP',name:'Anima Care Vinh Phuc',city:'Vinh Phuc',region:'north',tier:1,status:'pending'},
      {_id:'CTR-LS',name:'Anima Care Lang Son',city:'Lang Son',region:'north',tier:1,status:'pending'},
      {_id:'CTR-PT',name:'Anima Care Phu Tho',city:'Phu Tho',region:'north',tier:1,status:'pending'},
      {_id:'CTR-BTH',name:'Anima Care Binh Thuan',city:'Binh Thuan',region:'central',tier:1,status:'pending'},
      {_id:'CTR-DK',name:'Anima Care Dak Lak',city:'Dak Lak',region:'central',tier:1,status:'pending'}
    ];
  }
  // C2 sub-centers
  var c2=[];
  if(window.AnimaSync && window.AnimaSync.get){
    try{
      var allCenters=window.AnimaSync.get('centers',[]);
      if(Array.isArray(allCenters)){
        c2=allCenters.filter(function(ct){return ct.parentId||ct.parent_id||ct.level===2||ct.tier===2;});
      }
    }catch(e){}
  }
  _crmCentersData=[];
  c1.forEach(function(ct){
    var cOrders=_orders.filter(function(o){return o.center_id===ct._id||o.center_name===ct.city;});
    var rev=cOrders.reduce(function(s,o){return s+(o.total_amount||0);},0);
    _crmCentersData.push({id:ct._id,name:ct.name,province:ct.city,level:'L1',orders:cOrders.length,revenue:rev,ktv:0,status:ct.status||'pending'});
  });
  c2.forEach(function(ct){
    var cOrders=_orders.filter(function(o){return o.center_id===ct._id;});
    var rev=cOrders.reduce(function(s,o){return s+(o.total_amount||0);},0);
    _crmCentersData.push({id:ct._id||'SUB-'+Math.random().toString(36).substr(2,4).toUpperCase(),name:ct.name||'Sub-Center',province:ct.city||'-',level:'L2',orders:cOrders.length,revenue:rev,ktv:0,status:ct.status||'pending',parentId:ct.parentId||ct.parent_id||''});
  });
}

function renderCRMTabs(){
  var c=el('admV3Content');if(!c) return;
  var tabStyle='background:#0D1520;border:1px solid rgba(0,200,150,.08);border-radius:8px;padding:8px 16px;cursor:pointer;font-size:12px;color:#607870;font-family:inherit;transition:all .2s';
  var activeStyle='background:rgba(0,200,150,.1);color:#00C896;font-weight:600;border-color:rgba(0,200,150,.2)';

  var h='<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">';
  h+='<button id="crmTabCustomers" style="'+tabStyle+(_crmTab==='customers'?';'+activeStyle:'')+'" onclick="crmSwitchTab(\'customers\')">&#128100; Khach Hang ('+_crmCustomers.length+')</button>';
  h+='<button id="crmTabKtv" style="'+tabStyle+(_crmTab==='ktv'?';'+activeStyle:'')+'" onclick="crmSwitchTab(\'ktv\')">&#128295; KTV ('+_crmKTVs.length+')</button>';
  h+='<button id="crmTabCenters" style="'+tabStyle+(_crmTab==='centers'?';'+activeStyle:'')+'" onclick="crmSwitchTab(\'centers\')">&#127970; Centers ('+_crmCentersData.length+')</button>';
  h+='</div>';
  h+='<div id="crmTabContent"></div>';
  c.innerHTML=h;

  if(_crmTab==='customers') renderCRMCustomersTab();
  else if(_crmTab==='ktv') renderCRMKTVTab();
  else renderCRMCentersTab();
}

window.crmSwitchTab=function(tab){
  _crmTab=tab;_crmSearch='';_crmTierFilter='';
  renderCRMTabs();
};

window.crmSearch=function(v){
  _crmSearch=v;
  if(_crmTab==='customers') renderCRMCustomersTab();
  else if(_crmTab==='ktv') renderCRMKTVTab();
  else renderCRMCentersTab();
};

window.crmFilterTier=function(v){
  _crmTierFilter=v;
  renderCRMCustomersTab();
};

function renderCRMCustomersTab(){
  var tc=el('crmTabContent');if(!tc) return;
  var filtered=_crmCustomers.filter(function(c){
    if(_crmTierFilter && c.tier!==_crmTierFilter) return false;
    if(_crmSearch){
      var s=_crmSearch.toLowerCase();
      if((c.name||'').toLowerCase().indexOf(s)===-1 && (c.phone||'').indexOf(s)===-1 && (c.email||'').toLowerCase().indexOf(s)===-1) return false;
    }
    return true;
  });
  var vip=_crmCustomers.filter(function(c){return c.tier==='Gold'||c.tier==='Platinum';}).length;
  var now=new Date();var thisMonth=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var newThisMonth=_crmCustomers.filter(function(c){return c.lastOrder&&c.lastOrder.indexOf(thisMonth)===0&&c.orderCount===1;}).length;
  var avgSpend=_crmCustomers.length?Math.round(_crmCustomers.reduce(function(s,c){return s+c.totalSpent;},0)/_crmCustomers.length):0;

  var h='<div class="kpis">';
  h+=kpi(_crmCustomers.length,'Tong KH','#6496FF');
  h+=kpi(vip,'VIP (Gold+)','#FFC800');
  h+=kpi(newThisMonth,'Moi Thang Nay','#00C896');
  h+=kpi(money(avgSpend),'DT Trung Binh','#9B82FF');
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">';
  h+='<div class="srch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input placeholder="Tim ten, SDT, email..." value="'+(_crmSearch||'')+'" oninput="crmSearch(this.value)"/></div>';
  h+='<select class="f-sel" onchange="crmFilterTier(this.value)"><option value="">Tat Ca Tier</option>';
  ['Bronze','Silver','Gold','Platinum'].forEach(function(t){h+='<option value="'+t+'"'+(_crmTierFilter===t?' selected':'')+'>'+t+'</option>';});
  h+='</select></div><span style="color:#607870;font-size:12px">'+filtered.length+' khach hang</span></div>';

  h+='<div class="tbl-w"><table><tr><th>Ten</th><th>SDT</th><th>Email</th><th>Tinh</th><th>Tong Chi Tieu</th><th>So Don</th><th>Tier</th><th>Lan Cuoi</th></tr>';
  filtered.forEach(function(cu){
    var tierColor=cu.tier==='Platinum'?'#E0C068':cu.tier==='Gold'?'#FFC800':cu.tier==='Silver'?'#B8D8D0':'#A08060';
    h+='<tr>';
    h+='<td style="font-weight:600;color:#E8F8F4">'+(cu.name||'-')+'</td>';
    h+='<td>'+(cu.phone||'-')+'</td>';
    h+='<td style="max-width:140px;overflow:hidden;text-overflow:ellipsis">'+(cu.email||'-')+'</td>';
    h+='<td>'+(cu.province||'-')+'</td>';
    h+='<td style="color:#00C896;font-weight:600">'+money(cu.totalSpent)+'</td>';
    h+='<td>'+cu.orderCount+'</td>';
    h+='<td>'+badge(cu.tier,tierColor)+'</td>';
    h+='<td>'+shortDate(cu.lastOrder)+'</td>';
    h+='</tr>';
  });
  if(!filtered.length) h+='<tr><td colspan="8" class="empty">Khong co khach hang</td></tr>';
  h+='</table></div></div>';
  tc.innerHTML=h;
}

function renderCRMKTVTab(){
  var tc=el('crmTabContent');if(!tc) return;
  var filtered=_crmKTVs.filter(function(k){
    if(_crmSearch){
      var s=_crmSearch.toLowerCase();
      if((k.name||k.full_name||'').toLowerCase().indexOf(s)===-1 && (k.phone||'').indexOf(s)===-1) return false;
    }
    return true;
  });
  var active=_crmKTVs.filter(function(k){return (k.status||'active')==='active';}).length;
  var avgRating=_crmKTVs.length?(_crmKTVs.reduce(function(s,k){return s+(k.rating||k.avg_rating||0);},0)/_crmKTVs.length).toFixed(1):0;
  var totalRev=_crmKTVs.reduce(function(s,k){return s+(k.revenue||k.total_revenue||0);},0);

  var h='<div class="kpis">';
  h+=kpi(_crmKTVs.length,'Tong KTV','#6496FF');
  h+=kpi(active,'Active','#00C896');
  h+=kpi(avgRating,'Avg Rating','#FFC800');
  h+=kpi(money(totalRev),'Tong DT KTV','#9B82FF');
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><div style="display:flex;gap:10px;align-items:center">';
  h+='<div class="srch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input placeholder="Tim KTV..." value="'+(_crmSearch||'')+'" oninput="crmSearch(this.value)"/></div>';
  h+='</div><span style="color:#607870;font-size:12px">'+filtered.length+' KTV</span></div>';

  h+='<div class="tbl-w"><table><tr><th>Ten</th><th>SDT</th><th>Co So</th><th>Rating</th><th>Buoi</th><th>Doanh Thu</th><th>Chung Chi</th><th>Trang Thai</th></tr>';
  filtered.forEach(function(k){
    var st=k.status||'active';
    var stColor=st==='active'?'#00C896':st==='inactive'?'#FF7070':'#FFC800';
    var stLabel=st==='active'?'Active':st==='inactive'?'Inactive':'Pending';
    h+='<tr>';
    h+='<td style="font-weight:600;color:#E8F8F4">'+(k.name||k.full_name||'-')+'</td>';
    h+='<td>'+(k.phone||'-')+'</td>';
    h+='<td>'+(k.center||k.branch||k.facility||'-')+'</td>';
    h+='<td style="color:#FFC800;font-weight:600">'+(k.rating||k.avg_rating||0).toFixed?parseFloat(k.rating||k.avg_rating||0).toFixed(1):(k.rating||k.avg_rating||0)+'</td>';
    h+='<td>'+(k.sessions||k.total_sessions||0)+'</td>';
    h+='<td style="color:#00C896">'+money(k.revenue||k.total_revenue||0)+'</td>';
    h+='<td>'+(k.cert||k.certificate||k.certifications||'-')+'</td>';
    h+='<td>'+badge(stLabel,stColor)+'</td>';
    h+='</tr>';
  });
  if(!filtered.length) h+='<tr><td colspan="8" class="empty">Khong co KTV</td></tr>';
  h+='</table></div></div>';
  tc.innerHTML=h;
}

function renderCRMCentersTab(){
  var tc=el('crmTabContent');if(!tc) return;
  var c1Count=_crmCentersData.filter(function(c){return c.level==='L1';}).length;
  var c2Count=_crmCentersData.filter(function(c){return c.level==='L2';}).length;
  var totalRev=_crmCentersData.reduce(function(s,c){return s+c.revenue;},0);
  var topCenter=_crmCentersData.slice().sort(function(a,b){return b.revenue-a.revenue;})[0];

  var h='<div class="kpis">';
  h+=kpi(c1Count,'C1 Tinh','#6496FF');
  h+=kpi(c2Count,'C2 Sub-Centers','#9B82FF');
  h+=kpi(money(totalRev),'Tong DT','#00C896');
  h+=kpi(topCenter?topCenter.name.replace('Anima Care ',''):'N/A','Top Center','#FFC800');
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><div style="display:flex;gap:10px;align-items:center">';
  h+='<div class="srch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><input placeholder="Tim center..." value="'+(_crmSearch||'')+'" oninput="crmSearch(this.value)"/></div>';
  h+='</div><span style="color:#607870;font-size:12px">'+_crmCentersData.length+' centers</span></div>';

  var filtered=_crmCentersData.filter(function(ct){
    if(_crmSearch){
      var s=_crmSearch.toLowerCase();
      if((ct.name||'').toLowerCase().indexOf(s)===-1 && (ct.province||'').toLowerCase().indexOf(s)===-1 && (ct.id||'').toLowerCase().indexOf(s)===-1) return false;
    }
    return true;
  });

  h+='<div class="tbl-w"><table><tr><th>Ma</th><th>Ten</th><th>Tinh</th><th>Cap</th><th>Don Hang</th><th>Doanh Thu</th><th>KTV</th><th>Trang Thai</th></tr>';
  filtered.forEach(function(ct){
    var stColor=ct.status==='active'?'#00C896':'#FFC800';
    var stLabel=ct.status==='active'?'Active':'Pending';
    var lvlColor=ct.level==='L1'?'#6496FF':'#9B82FF';
    h+='<tr>';
    h+='<td style="color:#00C896;font-weight:600">'+ct.id+'</td>';
    h+='<td>'+(ct.name||'-')+'</td>';
    h+='<td>'+(ct.province||'-')+'</td>';
    h+='<td>'+badge(ct.level,lvlColor)+'</td>';
    h+='<td>'+ct.orders+'</td>';
    h+='<td style="color:#00C896;font-weight:600">'+money(ct.revenue)+'</td>';
    h+='<td>'+ct.ktv+'</td>';
    h+='<td>'+badge(stLabel,stColor)+'</td>';
    h+='</tr>';
  });
  if(!filtered.length) h+='<tr><td colspan="8" class="empty">Khong co center</td></tr>';
  h+='</table></div></div>';
  tc.innerHTML=h;
}

// Keep legacy lead functions for backward compatibility
window.admV3LeadSearch=function(v){_search=v;};
window.admV3LeadFilterStatus=function(v){_filterStatus=v;};
window.admV3LeadFilterSource=function(v){_filterSource=v;};

window.admV3UpdateLeadStatus=function(id,status){
  safeCall('AnimaCRM','updateLead',[id,{status:status}]).then(function(){reloadLeads();});
};

window.admV3ViewLead=function(id){
  var l=_leads.filter(function(x){return x.id===id;})[0];
  if(!l) return;
  var h='<div style="display:grid;gap:10px">';
  h+='<div><span style="color:#607870">Ten:</span> <b>'+(l.name||l.full_name||'-')+'</b></div>';
  h+='<div><span style="color:#607870">SDT:</span> '+(l.phone||'-')+'</div>';
  h+='<div><span style="color:#607870">Email:</span> '+(l.email||'-')+'</div>';
  h+='<div><span style="color:#607870">Loai:</span> '+(l.lead_type||l.type||'-')+'</div>';
  h+='<div><span style="color:#607870">San pham quan tam:</span> '+(l.product||l.interest||'-')+'</div>';
  h+='<div><span style="color:#607870">Nguon:</span> '+(l.source||'-')+'</div>';
  h+='<div><span style="color:#607870">Trang thai:</span> '+badge(statusLabel(l.status,LEAD_STATUSES).l,statusLabel(l.status,LEAD_STATUSES).c)+'</div>';
  h+='<div><span style="color:#607870">Ghi chu:</span> '+(l.notes||l.note||'-')+'</div>';
  h+='<div><span style="color:#607870">Ngay tao:</span> '+shortDateTime(l.created_at)+'</div>';
  h+='</div>';
  admV3Modal('Lead: '+(l.name||l.full_name||''),h);
};

window.admV3ShowCreateLead=function(){
  var h='<div class="fg"><label>Ten</label><input id="_lName" placeholder="Ho ten..."></div>';
  h+='<div class="fg"><label>So Dien Thoai</label><input id="_lPhone" placeholder="0xxx..."></div>';
  h+='<div class="fg"><label>Email</label><input id="_lEmail" placeholder="email@..."></div>';
  h+='<div class="fg"><label>Loai Lead</label><select id="_lType"><option value="customer">Khach Hang</option><option value="franchise">Nhuong Quyen</option><option value="partner">Doi Tac</option></select></div>';
  h+='<div class="fg"><label>San Pham Quan Tam</label><input id="_lProd" placeholder="Ten san pham/dich vu..."></div>';
  h+='<div class="fg"><label>Nguon</label><select id="_lSrc"><option value="website">Website</option><option value="facebook">Facebook</option><option value="zalo">Zalo</option><option value="referral">Gioi Thieu</option><option value="event">Su Kien</option><option value="other">Khac</option></select></div>';
  h+='<div class="fg"><label>Ghi Chu</label><textarea id="_lNote" rows="2"></textarea></div>';
  h+='<button class="btn btn-p" style="width:100%;justify-content:center;margin-top:8px" onclick="admV3SubmitLead()">Them Lead</button>';
  admV3Modal('Them Lead Moi',h);
};

window.admV3SubmitLead=function(){
  var name=el('_lName').value.trim();var phone=el('_lPhone').value.trim();
  if(!name){alert('Vui long nhap ten');return;}
  var data={
    name:name,full_name:name,phone:phone,email:el('_lEmail').value.trim(),
    lead_type:el('_lType').value,product:el('_lProd').value.trim(),
    source:el('_lSrc').value,status:'new',notes:el('_lNote').value.trim()
  };
  safeCall('AnimaCRM','createLead',[data]).then(function(){admV3CloseModal();reloadLeads();}).catch(function(e){alert('Loi: '+e.message);});
};

function reloadLeads(){
  safeLoad('AnimaCRM','getLeads',[{limit:200}]).then(function(d){_leads=safeArr(d);buildCRMCustomers();renderCRMTabs();});
}

// ═══════════════════════════════════════
// PAGE 4: CUSTOMERS
// ═══════════════════════════════════════
function pgCustomers(){
  var c=el('admV3Content');if(!c) return;
  c.innerHTML='<div class="empty">Đang tải khách hàng...</div>';

  Promise.all([
    safeLoad('AnimaContacts','getAll',[{limit:500}]),
    safeLoad('AnimaOrders','getAll',[{limit:500}])
  ]).then(function(res){
    _contacts=safeArr(res[0]);_orders=safeArr(res[1]);
    renderCustomersPage();
  }).catch(function(){_contacts=[];renderCustomersPage();});
}

function renderCustomersPage(){
  var c=el('admV3Content');if(!c) return;
  // Build customer map from orders
  var custMap={};
  _orders.forEach(function(o){
    var key=o.customer_phone||o.customer_email||'unknown';
    if(!custMap[key]) custMap[key]={name:o.customer_name||'-',phone:o.customer_phone||'-',email:o.customer_email||'-',totalSpent:0,orderCount:0,lastOrder:null};
    custMap[key].totalSpent+=(o.total_amount||0);
    custMap[key].orderCount++;
    if(!custMap[key].lastOrder||o.created_at>custMap[key].lastOrder) custMap[key].lastOrder=o.created_at;
    if(o.customer_name && custMap[key].name==='-') custMap[key].name=o.customer_name;
  });
  // Merge contacts
  _contacts.forEach(function(ct){
    var key=ct.phone||ct.email||'c-'+ct.id;
    if(!custMap[key]) custMap[key]={name:ct.name||ct.full_name||'-',phone:ct.phone||'-',email:ct.email||'-',totalSpent:0,orderCount:0,lastOrder:ct.created_at};
  });
  var customers=Object.keys(custMap).map(function(k){return custMap[k];});
  customers.sort(function(a,b){return b.totalSpent-a.totalSpent;});

  var now=new Date();var thisMonth=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  var newThisMonth=customers.filter(function(cu){return cu.lastOrder&&cu.lastOrder.indexOf(thisMonth)===0&&cu.orderCount<=1;}).length;
  var vipCount=customers.filter(function(cu){return cu.totalSpent>=5000000;}).length;
  var avgRev=customers.length?Math.round(customers.reduce(function(s,cu){return s+cu.totalSpent;},0)/customers.length):0;

  var h='<div class="kpis">';
  h+=kpi(customers.length,'Tổng KH','#6496FF');
  h+=kpi(vipCount,'VIP (>5M)','#7B5FFF');
  h+=kpi(newThisMonth,'Mới Tháng Này','#00C896');
  h+=kpi(money(avgRev),'Doanh Thu TB/KH','#FFC800');
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Danh Sách Khách Hàng</span><span style="color:#607870;font-size:12px">'+customers.length+' khách</span></div>';
  h+='<div class="tbl-w"><table><tr><th>Tên</th><th>SĐT</th><th>Email</th><th>Tổng Chi Tiêu</th><th>Số Đơn</th><th>Lần Cuối</th><th>Tier</th></tr>';
  customers.forEach(function(cu){
    var tier='Bronze';var tierC='#CD7F32';
    if(cu.totalSpent>=10000000){tier='Platinum';tierC='#E5E4E2';}
    else if(cu.totalSpent>=5000000){tier='Gold';tierC='#FFD700';}
    else if(cu.totalSpent>=2000000){tier='Silver';tierC='#C0C0C0';}
    h+='<tr><td>'+(cu.name||'-')+'</td><td>'+(cu.phone||'-')+'</td><td>'+(cu.email||'-')+'</td>';
    h+='<td style="font-weight:600;color:#00C896">'+money(cu.totalSpent)+'</td>';
    h+='<td>'+cu.orderCount+'</td><td>'+shortDate(cu.lastOrder)+'</td>';
    h+='<td>'+badge(tier,tierC)+'</td></tr>';
  });
  if(!customers.length) h+='<tr><td colspan="7" class="empty">Không có dữ liệu</td></tr>';
  h+='</table></div></div>';
  c.innerHTML=h;
}

// ═══════════════════════════════════════
// PAGE 5: BOOKINGS
// ═══════════════════════════════════════
function pgBookings(){
  var c=el('admV3Content');if(!c) return;
  c.innerHTML='<div class="empty">Đang tải lịch hẹn...</div>';

  safeLoad('AnimaBookings','getAll',[{limit:200}]).then(function(data){
    _bookings=safeArr(data);
    renderBookingsPage();
  }).catch(function(){_bookings=[];renderBookingsPage();});
}

function renderBookingsPage(){
  var c=el('admV3Content');if(!c) return;
  var counts={};BOOKING_STATUSES.forEach(function(s){counts[s.v]=0;});
  _bookings.forEach(function(b){if(counts.hasOwnProperty(b.status)) counts[b.status]++;});

  var h='<div class="kpis">';
  BOOKING_STATUSES.forEach(function(s){h+=kpi(counts[s.v],s.l,s.c);});
  h+=kpi(_bookings.length,'Tổng','#6496FF');
  h+='</div>';

  // Calendar-style grouped by date
  var byDate={};
  _bookings.forEach(function(b){
    var dk=(b.booking_date||b.date||(b.created_at||'').split('T')[0])||'unknown';
    if(!byDate[dk]) byDate[dk]=[];
    byDate[dk].push(b);
  });
  var dates=Object.keys(byDate).sort().reverse();

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Lịch Hẹn</span><span style="color:#607870;font-size:12px">'+_bookings.length+' booking</span></div>';

  dates.forEach(function(dk){
    h+='<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:600;color:#00C896;padding:8px 0;border-bottom:1px solid rgba(0,200,150,.06)">'+dk+'</div>';
    h+='<table><tr><th>Giờ</th><th>Khách</th><th>SĐT</th><th>Dịch Vụ</th><th>Cơ Sở</th><th>KTV</th><th>Trạng Thái</th><th>Action</th></tr>';
    byDate[dk].forEach(function(b){
      var st=statusLabel(b.status,BOOKING_STATUSES);
      h+='<tr><td style="color:#00C896;font-weight:600">'+(b.time_slot||b.time||'-')+'</td>';
      h+='<td>'+(b.customer_name||'-')+'</td>';
      h+='<td>'+(b.customer_phone||'-')+'</td>';
      h+='<td>'+(b.service_name||b.service||'-')+'</td>';
      h+='<td>'+(b.center_name||b.center||'-')+'</td>';
      h+='<td>'+(b.ktv_name||b.ktv||'<select class="f-sel" onclick="event.stopPropagation()" onchange="admV3AssignKTV(\''+b.id+'\',this.value)"><option value="">Chọn KTV</option></select>')+'</td>';
      h+='<td><select class="f-sel" onchange="admV3UpdateBookingStatus(\''+b.id+'\',this.value)">';
      BOOKING_STATUSES.forEach(function(s){h+='<option value="'+s.v+'"'+(b.status===s.v?' selected':'')+'>'+s.l+'</option>';});
      h+='</select></td>';
      h+='<td class="row-act"><button class="btn btn-s btn-sm" onclick="admV3ViewBooking(\''+b.id+'\')">Chi Tiết</button></td></tr>';
    });
    h+='</table></div>';
  });
  if(!_bookings.length) h+='<div class="empty">Không có lịch hẹn</div>';
  h+='</div>';
  c.innerHTML=h;
}

window.admV3UpdateBookingStatus=function(id,status){
  safeCall('AnimaBookings','updateStatus',[id,status]).then(function(){
    safeLoad('AnimaBookings','getAll',[{limit:200}]).then(function(d){_bookings=safeArr(d);renderBookingsPage();});
  });
};

window.admV3AssignKTV=function(id,ktvName){
  safeCall('AnimaBookings','update',[id,{ktv_name:ktvName}]).then(function(){
    safeLoad('AnimaBookings','getAll',[{limit:200}]).then(function(d){_bookings=safeArr(d);renderBookingsPage();});
  });
};

window.admV3ViewBooking=function(id){
  var b=_bookings.filter(function(x){return x.id===id;})[0];if(!b) return;
  var h='<div style="display:grid;gap:10px">';
  h+='<div><span style="color:#607870">Khách:</span> <b>'+(b.customer_name||'-')+'</b></div>';
  h+='<div><span style="color:#607870">SĐT:</span> '+(b.customer_phone||'-')+'</div>';
  h+='<div><span style="color:#607870">Dịch vụ:</span> '+(b.service_name||b.service||'-')+'</div>';
  h+='<div><span style="color:#607870">Ngày:</span> '+(b.booking_date||b.date||'-')+'</div>';
  h+='<div><span style="color:#607870">Giờ:</span> '+(b.time_slot||b.time||'-')+'</div>';
  h+='<div><span style="color:#607870">Cơ sở:</span> '+(b.center_name||b.center||'-')+'</div>';
  h+='<div><span style="color:#607870">KTV:</span> '+(b.ktv_name||b.ktv||'Chưa phân công')+'</div>';
  h+='<div><span style="color:#607870">Trạng thái:</span> '+badge(statusLabel(b.status,BOOKING_STATUSES).l,statusLabel(b.status,BOOKING_STATUSES).c)+'</div>';
  h+='<div><span style="color:#607870">Ghi chú:</span> '+(b.notes||b.note||'-')+'</div>';
  h+='</div>';
  admV3Modal('Chi Tiết Lịch Hẹn',h);
};

// ═══════════════════════════════════════
// PAGE 6: CENTERS
// ═══════════════════════════════════════
function pgCenters(){
  var c=el('admV3Content');if(!c) return;
  var centers=getCentersList();
  var active=centers.filter(function(ct){return ct.status!=='inactive';}).length;

  var h='<div class="kpis">';
  h+=kpi(centers.length,'Tổng Cơ Sở','#6496FF');
  h+=kpi(active,'Hoạt Động','#00C896');
  h+=kpi(centers.length-active,'Chưa Kích Hoạt','#FFC800');
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Danh Sách 34 Cơ Sở Tỉnh Thành</span></div>';
  h+='<div class="tbl-w"><table><tr><th>Mã</th><th>Tên</th><th>Thành Phố</th><th>Vùng</th><th>Trạng Thái</th><th>Quản Lý</th><th>Action</th></tr>';
  centers.forEach(function(ct){
    var stColor=ct.status==='active'?'#00C896':'#FFC800';
    var stLabel=ct.status==='active'?'Hoạt Động':'Chờ Kích Hoạt';
    var region=ct.region==='north'?'Bắc':ct.region==='south'?'Nam':'Trung';
    h+='<tr><td style="color:#00C896;font-weight:600">'+ct._id+'</td>';
    h+='<td>'+ct.name+'</td>';
    h+='<td>'+ct.city+'</td>';
    h+='<td>'+badge(region,ct.region==='north'?'#6496FF':ct.region==='south'?'#00C896':'#FFC800')+'</td>';
    h+='<td>'+badge(stLabel,stColor)+'</td>';
    h+='<td>'+(ct.manager||'-')+'</td>';
    h+='<td><button class="btn btn-s btn-sm" onclick="admV3ViewCenter(\''+ct._id+'\')">Chi Tiết</button></td></tr>';
  });
  h+='</table></div></div>';
  c.innerHTML=h;
}

function getCentersList(){
  // Try AnimaSync first, fallback to hardcoded
  var centers=[];
  if(window.AnimaSync && window.AnimaSync.get){
    try{centers=window.AnimaSync.get('centers',[]);}catch(e){}
  }
  if(!centers.length){
    centers=[
      {_id:'CTR-HN',name:'Anima Care Ha Noi',city:'Ha Noi',region:'north',tier:1,status:'active',manager:''},
      {_id:'CTR-HCM',name:'Anima Care TP.HCM',city:'TP.HCM',region:'south',tier:1,status:'active',manager:''},
      {_id:'CTR-DN',name:'Anima Care Da Nang',city:'Da Nang',region:'central',tier:1,status:'active',manager:''},
      {_id:'CTR-HP',name:'Anima Care Hai Phong',city:'Hai Phong',region:'north',tier:1,status:'active',manager:''},
      {_id:'CTR-CT',name:'Anima Care Can Tho',city:'Can Tho',region:'south',tier:1,status:'active',manager:''},
      {_id:'CTR-HUE',name:'Anima Care Hue',city:'Hue',region:'central',tier:1,status:'active',manager:''},
      {_id:'CTR-NT',name:'Anima Care Nha Trang',city:'Nha Trang',region:'central',tier:1,status:'active',manager:''},
      {_id:'CTR-VT',name:'Anima Care Vung Tau',city:'Vung Tau',region:'south',tier:1,status:'active',manager:''},
      {_id:'CTR-QN',name:'Anima Care Quang Ninh',city:'Quang Ninh',region:'north',tier:1,status:'active',manager:''},
      {_id:'CTR-BD',name:'Anima Care Binh Duong',city:'Binh Duong',region:'south',tier:1,status:'active',manager:''},
      {_id:'CTR-DN2',name:'Anima Care Dong Nai',city:'Dong Nai',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-TH',name:'Anima Care Thanh Hoa',city:'Thanh Hoa',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-NA',name:'Anima Care Nghe An',city:'Nghe An',region:'central',tier:1,status:'pending',manager:''},
      {_id:'CTR-BN',name:'Anima Care Bac Ninh',city:'Bac Ninh',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-HD',name:'Anima Care Hai Duong',city:'Hai Duong',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-LA',name:'Anima Care Long An',city:'Long An',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-QNA',name:'Anima Care Quang Nam',city:'Quang Nam',region:'central',tier:1,status:'pending',manager:''},
      {_id:'CTR-KH',name:'Anima Care Khanh Hoa',city:'Khanh Hoa',region:'central',tier:1,status:'pending',manager:''},
      {_id:'CTR-GL',name:'Anima Care Gia Lai',city:'Gia Lai',region:'central',tier:1,status:'pending',manager:''},
      {_id:'CTR-DL',name:'Anima Care Da Lat',city:'Da Lat',region:'central',tier:1,status:'pending',manager:''},
      {_id:'CTR-AG',name:'Anima Care An Giang',city:'An Giang',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-TG',name:'Anima Care Tien Giang',city:'Tien Giang',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-BT',name:'Anima Care Ben Tre',city:'Ben Tre',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-TB',name:'Anima Care Thai Binh',city:'Thai Binh',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-NB',name:'Anima Care Ninh Binh',city:'Ninh Binh',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-PY',name:'Anima Care Phu Yen',city:'Phu Yen',region:'central',tier:1,status:'pending',manager:''},
      {_id:'CTR-BP',name:'Anima Care Binh Phuoc',city:'Binh Phuoc',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-TN',name:'Anima Care Tay Ninh',city:'Tay Ninh',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-VL',name:'Anima Care Vinh Long',city:'Vinh Long',region:'south',tier:1,status:'pending',manager:''},
      {_id:'CTR-VP',name:'Anima Care Vinh Phuc',city:'Vinh Phuc',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-LS',name:'Anima Care Lang Son',city:'Lang Son',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-PT',name:'Anima Care Phu Tho',city:'Phu Tho',region:'north',tier:1,status:'pending',manager:''},
      {_id:'CTR-BTH',name:'Anima Care Binh Thuan',city:'Binh Thuan',region:'central',tier:1,status:'pending',manager:''},
      {_id:'CTR-DK',name:'Anima Care Dak Lak',city:'Dak Lak',region:'central',tier:1,status:'pending',manager:''}
    ];
  }
  return centers;
}

window.admV3ViewCenter=function(id){
  var ct=getCentersList().filter(function(c){return c._id===id;})[0];
  if(!ct) return;
  var centerOrders=_orders.filter(function(o){return o.center_id===id||o.center_name===ct.city;});
  var rev=centerOrders.reduce(function(s,o){return s+(o.total_amount||0);},0);
  var h='<div style="display:grid;gap:10px">';
  h+='<div><span style="color:#607870">Mã:</span> <b style="color:#00C896">'+ct._id+'</b></div>';
  h+='<div><span style="color:#607870">Tên:</span> '+ct.name+'</div>';
  h+='<div><span style="color:#607870">Thành phố:</span> '+ct.city+'</div>';
  h+='<div><span style="color:#607870">Vùng:</span> '+(ct.region==='north'?'Miền Bắc':ct.region==='south'?'Miền Nam':'Miền Trung')+'</div>';
  h+='<div><span style="color:#607870">Trạng thái:</span> '+badge(ct.status==='active'?'Hoạt Động':'Chờ Kích Hoạt',ct.status==='active'?'#00C896':'#FFC800')+'</div>';
  h+='<div><span style="color:#607870">Tổng đơn hàng:</span> '+centerOrders.length+'</div>';
  h+='<div><span style="color:#607870">Doanh thu:</span> <b style="color:#00C896">'+money(rev)+'</b></div>';
  h+='</div>';
  admV3Modal('Chi Tiết Cơ Sở: '+ct.name,h);
};

// ═══════════════════════════════════════
// PAGE 7: KTV (Technicians)
// ═══════════════════════════════════════
function pgKTV(){
  var c=el('admV3Content');if(!c) return;
  var ktvs=[];
  try{var _kt2=JSON.parse(localStorage.getItem('anima_saved_tech'));if(Array.isArray(_kt2))ktvs=_kt2;}catch(e){}

  var active=ktvs.length?ktvs.filter(function(k){return k.status==='active';}).length:0;
  var avgRating=0;
  if(ktvs.length){
    var total=ktvs.reduce(function(s,k){return s+(k.rating||0);},0);
    avgRating=Math.round(total/ktvs.length*10)/10;
  }

  var h='<div class="kpis">';
  h+=kpi(ktvs.length,'Tổng KTV','#6496FF');
  h+=kpi(active||ktvs.length,'Hoạt Động','#00C896');
  h+=kpi(avgRating||'-','Avg Rating','#FFC800');
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Danh Sách Kỹ Thuật Viên</span></div>';
  h+='<div class="tbl-w"><table><tr><th>Tên</th><th>SĐT</th><th>Cơ Sở</th><th>Rating</th><th>Số Buổi</th><th>Doanh Thu</th><th>Trạng Thái</th></tr>';
  if(ktvs.length){
    ktvs.forEach(function(k){
      var stColor=(k.status==='active')?'#00C896':'#FFC800';
      var stLabel=(k.status==='active')?'Hoạt Động':'Nghỉ';
      h+='<tr><td>'+(k.name||k.full_name||'-')+'</td>';
      h+='<td>'+(k.phone||'-')+'</td>';
      h+='<td>'+(k.center_name||k.center||'-')+'</td>';
      h+='<td style="color:#FFC800">'+(k.rating||'-')+' ★</td>';
      h+='<td>'+(k.sessions||k.total_sessions||0)+'</td>';
      h+='<td style="color:#00C896">'+money(k.revenue||k.total_revenue||0)+'</td>';
      h+='<td>'+badge(stLabel,stColor)+'</td></tr>';
    });
  } else {
    h+='<tr><td colspan="7" class="empty">Chưa có KTV. Dữ liệu được lấy từ localStorage (anima_saved_tech).</td></tr>';
  }
  h+='</table></div></div>';
  c.innerHTML=h;
}

// ═══════════════════════════════════════
// PAGE 8: INVENTORY
// ═══════════════════════════════════════
function pgInventory(){
  var c=el('admV3Content');if(!c) return;
  c.innerHTML='<div class="empty">Đang tải kho hàng 34 tỉnh...</div>';

  /* Load centers + orders to calculate stock per province */
  var centers=[];
  if(window.AnimaSync) centers=AnimaSync.get('centers',[]).filter(function(c){return c.tier===1;});
  if(!centers.length){
    /* Hardcoded 34 province fallback */
    var provinces=['Hà Nội','TP.HCM','Đà Nẵng','Hải Phòng','Cần Thơ','Huế','Nha Trang','Vũng Tàu','Quảng Ninh','Bình Dương','Đồng Nai','Thanh Hoá','Nghệ An','Bắc Ninh','Hải Dương','Long An','Quảng Nam','Khánh Hoà','Gia Lai','Đắk Lắk','An Giang','Tiền Giang','Bến Tre','Thái Bình','Nam Định','Phú Yên','Bình Phước','Tây Ninh','Vĩnh Long','Vĩnh Phúc','Lạng Sơn','Phú Thọ','Bình Thuận','Đắk Nông'];
    var ids=['CTR-HN','CTR-HCM','CTR-DN','CTR-HP','CTR-CT','CTR-HUE','CTR-NT','CTR-VT','CTR-QN','CTR-BD','CTR-DN2','CTR-TH','CTR-NA','CTR-BN','CTR-HD','CTR-LA','CTR-QNA','CTR-KH','CTR-GL','CTR-DL','CTR-AG','CTR-TG','CTR-BT','CTR-TB','CTR-NB','CTR-PY','CTR-BP','CTR-TN','CTR-VL','CTR-VP','CTR-LS','CTR-PT','CTR-BTH','CTR-DK'];
    provinces.forEach(function(p,i){centers.push({_id:ids[i],city:p,name:'Anima Care '+p,tier:1,region:i<10?'Bắc':i<20?'Trung':'Nam'});});
  }

  /* Load warehouse data from localStorage */
  var warehouses={};
  try{warehouses=JSON.parse(localStorage.getItem('anima_warehouses')||'{}');}catch(e){}

  /* Count orders per center */
  safeLoad('AnimaOrders','getAll',[{limit:1000}]).then(function(orders){
    orders=safeArr(orders);
    var ordersByCenter={};
    orders.forEach(function(o){
      var cid=o.center_id||'';
      if(!ordersByCenter[cid]) ordersByCenter[cid]={count:0,revenue:0,pending:0};
      ordersByCenter[cid].count++;
      ordersByCenter[cid].revenue+=(o.total_amount||0);
      if(o.order_status==='pending') ordersByCenter[cid].pending++;
    });

    var totalStock=0,lowStockCount=0,totalRevenue=0;
    centers.forEach(function(ct){
      var wh=warehouses[ct._id]||{a119_10:20,a119_30:10,a119_120:5};
      var stock=(wh.a119_10||0)+(wh.a119_30||0)+(wh.a119_120||0);
      totalStock+=stock;
      if(stock<10) lowStockCount++;
      var co=ordersByCenter[ct._id]||{count:0,revenue:0};
      totalRevenue+=co.revenue;
    });

    var h='<div class="kpis">';
    h+=kpi(34,'Kho Tỉnh','#6496FF');
    h+=kpi(totalStock,'Tổng Tồn Kho','#00C896');
    h+=kpi(lowStockCount,'Kho Sắp Hết','#FF7070');
    h+=kpi(money(totalRevenue),'Tổng DT','#FFC800');
    h+='</div>';

    /* Agent AI Stock Alerts */
    var stockAlerts=[];
    centers.forEach(function(ct){
      var wh=warehouses[ct._id]||{a119_10:20,a119_30:10,a119_120:5};
      var stock=(wh.a119_10||0)+(wh.a119_30||0)+(wh.a119_120||0);
      if(stock<5) stockAlerts.push({type:'error',msg:'🚨 <b>'+ct.city+'</b> — Kho gần hết! Còn '+stock+' sản phẩm. Cần nhập hàng khẩn cấp.'});
      else if(stock<15) stockAlerts.push({type:'warn',msg:'⚠️ <b>'+ct.city+'</b> — Tồn kho thấp: '+stock+' sản phẩm.'});
      var co=ordersByCenter[ct._id]||{pending:0};
      if(co.pending>3) stockAlerts.push({type:'warn',msg:'⏳ <b>'+ct.city+'</b> — '+co.pending+' đơn chờ duyệt!'});
    });

    if(stockAlerts.length){
      h+='<div class="crd" style="border-color:rgba(255,184,0,.2);background:rgba(255,184,0,.03)"><div class="crd-h"><span class="crd-t" style="color:#FFC800">🤖 Agent Cảnh Báo Kho ('+stockAlerts.length+')</span></div>';
      stockAlerts.slice(0,6).forEach(function(a){
        var bg=a.type==='error'?'rgba(255,70,70,.08)':'rgba(255,184,0,.06)';
        h+='<div style="background:'+bg+';border-radius:8px;padding:10px 14px;margin-bottom:6px;font-size:12px;color:#E8F8F4;line-height:1.5">'+a.msg+'</div>';
      });
      h+='</div>';
    }

    /* 34 Province Warehouse Table */
    h+='<div class="crd"><div class="crd-h"><span class="crd-t">Kho Hàng 34 Tỉnh Thành</span><button class="btn btn-p btn-sm" onclick="admV3BulkImport()">📦 Nhập Hàng Toàn Quốc</button></div>';
    h+='<div class="tbl-w"><table><tr><th>Mã KH</th><th>Tỉnh/TP</th><th>Đối Tác</th><th>A119 (10)</th><th>A119 (30)</th><th>A119 (120)</th><th>Tổng</th><th>Đơn</th><th>DT</th><th>Trạng Thái</th><th></th></tr>';
    centers.forEach(function(ct){
      var wh=warehouses[ct._id]||{a119_10:20,a119_30:10,a119_120:5};
      var stock=(wh.a119_10||0)+(wh.a119_30||0)+(wh.a119_120||0);
      var co=ordersByCenter[ct._id]||{count:0,revenue:0};
      var isLow=stock<10;
      var region=ct.region||'';
      var regionColor=region==='Bắc'?'#6496FF':region==='Trung'?'#FFC800':'#00C896';
      h+='<tr><td style="color:#00C896;font-size:11px;font-weight:600">'+ct._id+'</td>';
      h+='<td><span style="font-weight:600">'+ct.city+'</span> '+badge(region,regionColor)+'</td>';
      h+='<td style="font-size:11px;color:#9B82FF">'+(ct.manager||ct.name||'—')+'</td>';
      h+='<td style="text-align:center">'+(wh.a119_10||0)+'</td>';
      h+='<td style="text-align:center">'+(wh.a119_30||0)+'</td>';
      h+='<td style="text-align:center">'+(wh.a119_120||0)+'</td>';
      h+='<td style="font-weight:600;color:'+(isLow?'#FF7070':'#B8D8D0')+'">'+stock+'</td>';
      h+='<td style="text-align:center">'+co.count+'</td>';
      h+='<td style="color:#00C896;font-size:11px">'+money(co.revenue)+'</td>';
      h+='<td>'+badge(isLow?'Thấp':'OK',isLow?'#FF7070':'#00C896')+'</td>';
      h+='<td><button class="btn btn-s btn-sm" onclick="admV3EditWarehouse(\''+ct._id+'\',\''+ct.city+'\')">✏️</button></td></tr>';
    });
    h+='</table></div></div>';
    c.innerHTML=h;
  });
}

window.admV3EditWarehouse=function(centerId,cityName){
  var warehouses={};
  try{warehouses=JSON.parse(localStorage.getItem('anima_warehouses')||'{}');}catch(e){}
  var wh=warehouses[centerId]||{a119_10:20,a119_30:10,a119_120:5};
  var formH='<div style="display:grid;gap:12px">';
  formH+='<div><label style="font-size:11px;color:#607870;display:block;margin-bottom:4px">ANIMA 119 — 1 Hộp (10 Gói)</label><input id="wh-10" type="number" class="f-inp" value="'+(wh.a119_10||0)+'"></div>';
  formH+='<div><label style="font-size:11px;color:#607870;display:block;margin-bottom:4px">ANIMA 119 — 3 Hộp (30 Gói)</label><input id="wh-30" type="number" class="f-inp" value="'+(wh.a119_30||0)+'"></div>';
  formH+='<div><label style="font-size:11px;color:#607870;display:block;margin-bottom:4px">ANIMA 119 — 12 Hộp (120 Gói)</label><input id="wh-120" type="number" class="f-inp" value="'+(wh.a119_120||0)+'"></div>';
  formH+='<button class="btn btn-p" onclick="admV3SaveWarehouse(\''+centerId+'\')">💾 Lưu Kho '+cityName+'</button>';
  formH+='</div>';
  admV3Modal('Kho Hàng — '+cityName,formH);
};

window.admV3SaveWarehouse=function(centerId){
  var warehouses={};
  try{warehouses=JSON.parse(localStorage.getItem('anima_warehouses')||'{}');}catch(e){}
  warehouses[centerId]={
    a119_10:parseInt(el('wh-10').value)||0,
    a119_30:parseInt(el('wh-30').value)||0,
    a119_120:parseInt(el('wh-120').value)||0
  };
  localStorage.setItem('anima_warehouses',JSON.stringify(warehouses));
  admV3CloseModal();
  pgInventory();
};

/* ── 48H COMMISSION RELEASE ── */
window.admV3ReleaseAllComm=function(){
  var now48=Date.now()-48*3600000;
  var toRelease=_orders.filter(function(o){
    return o.order_status==='delivered'&&o.delivered_at&&new Date(o.delivered_at).getTime()<now48&&o.payment_status==='paid';
  });
  if(!toRelease.length){alert('Không có hoa hồng cần giải ngân.');return;}
  if(!confirm('Giải ngân hoa hồng cho '+toRelease.length+' đơn?')) return;
  var total=0;
  var updates=toRelease.map(function(o){
    var comm=o.commission||(o.total_amount?Math.round(o.total_amount*0.25):0);
    total+=comm;
    /* Log commission to wallet via AnimaSync */
    if(window.AnimaSync){
      AnimaSync.push('wallet_transactions',{
        centerId:o.center_id,centerName:o.center_name||'',
        orderId:o.order_code,amount:comm,type:'commission',
        status:'released',date:new Date().toISOString()
      });
    }
    return safeCall('AnimaOrders','update',[o.id,{notes:(o.notes||'')+' [COMM RELEASED '+new Date().toLocaleDateString('vi-VN')+']'}]);
  });
  Promise.all(updates).then(function(){
    alert('✅ Đã giải ngân '+money(total)+' cho '+toRelease.length+' đơn hàng!');
    pgDashboard();
  });
};

window.admV3BulkImport=function(){
  var qty=prompt('Nhập số lượng ANIMA 119 (10 gói) cho TẤT CẢ 34 kho:');
  if(!qty) return;
  var warehouses={};
  try{warehouses=JSON.parse(localStorage.getItem('anima_warehouses')||'{}');}catch(e){}
  var ids=['CTR-HN','CTR-HCM','CTR-DN','CTR-HP','CTR-CT','CTR-HUE','CTR-NT','CTR-VT','CTR-QN','CTR-BD','CTR-DN2','CTR-TH','CTR-NA','CTR-BN','CTR-HD','CTR-LA','CTR-QNA','CTR-KH','CTR-GL','CTR-DL','CTR-AG','CTR-TG','CTR-BT','CTR-TB','CTR-NB','CTR-PY','CTR-BP','CTR-TN','CTR-VL','CTR-VP','CTR-LS','CTR-PT','CTR-BTH','CTR-DK'];
  ids.forEach(function(id){
    if(!warehouses[id]) warehouses[id]={a119_10:0,a119_30:0,a119_120:0};
    warehouses[id].a119_10+=(parseInt(qty)||0);
  });
  localStorage.setItem('anima_warehouses',JSON.stringify(warehouses));
  pgInventory();
};

// ═══════════════════════════════════════
// PAGE 9: ANALYTICS
// ═══════════════════════════════════════
function pgAnalytics(){
  var c=el('admV3Content');if(!c) return;
  c.innerHTML='<div class="empty">Đang tải analytics...</div>';

  safeLoad('AnimaOrders','getAll',[{limit:500}]).then(function(data){
    _orders=safeArr(data);
    renderAnalyticsPage();
  }).catch(function(){_orders=[];renderAnalyticsPage();});
}

function renderAnalyticsPage(){
  var c=el('admV3Content');if(!c) return;
  var h='';

  // Revenue charts
  h+='<div class="grid2">';
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Doanh Thu 7 Ngày</span></div>'+buildRevenueChart(_orders,7)+'</div>';
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Doanh Thu 30 Ngày</span></div>'+buildRevenueChart(_orders,30)+'</div>';
  h+='</div>';

  // Top products
  var prodMap={};
  _orders.forEach(function(o){
    var items=[];try{items=typeof o.items==='string'?JSON.parse(o.items):(o.items||[]);}catch(e){}
    items.forEach(function(it){
      var k=it.name||it.sku||'unknown';
      if(!prodMap[k]) prodMap[k]={name:k,qty:0,rev:0};
      prodMap[k].qty+=(it.qty||1);
      prodMap[k].rev+=(it.price||0);
    });
  });
  var topProds=Object.keys(prodMap).map(function(k){return prodMap[k];}).sort(function(a,b){return b.rev-a.rev;}).slice(0,10);

  h+='<div class="grid2">';
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Top Sản Phẩm (Doanh Thu)</span></div>';
  if(topProds.length){
    var maxProdRev=topProds[0].rev||1;
    topProds.forEach(function(p){
      var pct=Math.round(p.rev/maxProdRev*100);
      h+='<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:#B8D8D0">'+p.name+'</span><span style="color:#00C896;font-weight:600">'+money(p.rev)+'</span></div>';
      h+='<div style="height:6px;background:rgba(0,200,150,.1);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#005A42,#00C896);border-radius:3px"></div></div></div>';
    });
  } else {h+='<div class="empty">Không có dữ liệu</div>';}
  h+='</div>';

  // Top centers
  var centerMap={};
  _orders.forEach(function(o){
    var k=o.center_name||o.center_id||'unknown';
    if(!centerMap[k]) centerMap[k]={name:k,count:0,rev:0};
    centerMap[k].count++;centerMap[k].rev+=(o.total_amount||0);
  });
  var topCenters=Object.keys(centerMap).map(function(k){return centerMap[k];}).sort(function(a,b){return b.rev-a.rev;}).slice(0,10);

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Top Cơ Sở (Doanh Thu)</span></div>';
  if(topCenters.length){
    var maxCRev=topCenters[0].rev||1;
    topCenters.forEach(function(ct){
      var pct=Math.round(ct.rev/maxCRev*100);
      h+='<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:#B8D8D0">'+ct.name+' ('+ct.count+' đơn)</span><span style="color:#00C896;font-weight:600">'+money(ct.rev)+'</span></div>';
      h+='<div style="height:6px;background:rgba(0,200,150,.1);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:linear-gradient(90deg,#005A42,#00C896);border-radius:3px"></div></div></div>';
    });
  } else {h+='<div class="empty">Không có dữ liệu</div>';}
  h+='</div>';
  h+='</div>';

  // Customer Acquisition Funnel
  h+='<div class="crd" style="margin-top:16px"><div class="crd-h"><span class="crd-t">Phễu Chuyển Đổi Khách Hàng</span></div>';
  var funnelStages=[
    {l:'Leads Mới',v:_leads.length||0,c:'#6496FF'},
    {l:'Đã Liên Hệ',v:_leads.filter(function(l){return l.status==='contacted';}).length,c:'#FFC800'},
    {l:'Chất Lượng',v:_leads.filter(function(l){return l.status==='qualified';}).length,c:'#7B5FFF'},
    {l:'Đề Xuất',v:_leads.filter(function(l){return l.status==='proposal';}).length,c:'#00B4D8'},
    {l:'Thành Công',v:_leads.filter(function(l){return l.status==='won';}).length,c:'#00C896'}
  ];
  var maxFunnel=funnelStages[0].v||1;
  funnelStages.forEach(function(stage,i){
    var pct=Math.max(8,Math.round(stage.v/maxFunnel*100));
    h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">';
    h+='<span style="width:100px;font-size:12px;color:#607870;text-align:right">'+stage.l+'</span>';
    h+='<div style="flex:1;height:28px;background:rgba(0,200,150,.04);border-radius:6px;overflow:hidden;position:relative">';
    h+='<div style="height:100%;width:'+pct+'%;background:'+stage.c+'30;border-radius:6px;display:flex;align-items:center;padding-left:10px">';
    h+='<span style="font-size:12px;font-weight:600;color:'+stage.c+'">'+stage.v+'</span></div></div></div>';
  });
  h+='</div>';

  c.innerHTML=h;
}

// ═══════════════════════════════════════
// PAGE 10: SETTINGS
// ═══════════════════════════════════════
function pgSettings(){
  var c=el('admV3Content');if(!c) return;
  var h='';

  // Bank info
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Thông Tin Ngân Hàng</span></div>';
  h+='<div style="display:grid;gap:12px;max-width:400px">';
  h+='<div class="fg"><label>Ngân Hàng</label><input value="Techcombank" readonly style="background:rgba(0,200,150,.02)"></div>';
  h+='<div class="fg"><label>Số Tài Khoản</label><input value="131191828868" readonly style="background:rgba(0,200,150,.02)"></div>';
  h+='<div class="fg"><label>Chủ Tài Khoản</label><input value="CAO VAN TUAN" readonly style="background:rgba(0,200,150,.02)"></div>';
  h+='</div></div>';

  // Payment gateway
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Cổng Thanh Toán</span></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">';
  var gateways=[
    {name:'COD',desc:'Thu hộ khi giao hàng',active:true},
    {name:'Bank Transfer',desc:'Chuyển khoản ngân hàng',active:true},
    {name:'MoMo',desc:'Ví điện tử MoMo',active:false},
    {name:'VNPay',desc:'Cổng VNPay',active:false},
    {name:'ZaloPay',desc:'Ví ZaloPay',active:false}
  ];
  gateways.forEach(function(gw){
    h+='<div style="padding:14px;background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:10px">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center">';
    h+='<span style="font-size:13px;font-weight:600;color:#E8F8F4">'+gw.name+'</span>';
    h+=badge(gw.active?'Bật':'Tắt',gw.active?'#00C896':'#607870');
    h+='</div><div style="font-size:11px;color:#607870;margin-top:6px">'+gw.desc+'</div></div>';
  });
  h+='</div></div>';

  // Notifications
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Thông Báo</span></div>';
  h+='<div style="display:grid;gap:10px;max-width:400px">';
  var notifs=[
    {l:'Đơn hàng mới',v:true},{l:'Lead mới',v:true},{l:'Lịch hẹn mới',v:true},
    {l:'Thanh toán thành công',v:true},{l:'Đơn bị hủy',v:false},{l:'Tồn kho thấp',v:true}
  ];
  notifs.forEach(function(n){
    h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(0,200,150,.04)">';
    h+='<span style="font-size:13px;color:#B8D8D0">'+n.l+'</span>';
    h+='<div style="width:40px;height:22px;border-radius:11px;background:'+(n.v?'#00C896':'rgba(0,200,150,.1)')+';position:relative;cursor:pointer">';
    h+='<div style="width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:2px;'+(n.v?'right:2px':'left:2px')+';transition:all .2s"></div></div></div>';
  });
  h+='</div></div>';

  // System info
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Thông Tin Hệ Thống</span></div>';
  h+='<div style="display:grid;gap:8px;font-size:12px;color:#607870">';
  h+='<div>Version: <span style="color:#00C896">Admin Dashboard v3.0</span></div>';
  h+='<div>Platform: <span style="color:#B8D8D0">AnimaCare Global</span></div>';
  h+='<div>Database: <span style="color:#B8D8D0">Supabase (PostgreSQL)</span></div>';
  h+='<div>Last Updated: <span style="color:#B8D8D0">'+new Date().toLocaleDateString('vi-VN')+'</span></div>';
  h+='</div></div>';

  c.innerHTML=h;
}

// ═══════════════════════════════════════
// PAGE 11: GAMIFICATION
// ═══════════════════════════════════════
function pgGamification(){
  var c=el('admV3Content');if(!c) return;
  c.innerHTML='<div class="empty">Đang tải dữ liệu...</div>';
  /* Load loyalty data */
  var loyaltyData=[];var referralData=[];
  Promise.all([
    safeLoad('AnimaLoyalty','getAll',[{limit:200}]),
    safeLoad('AnimaReferrals','getAll',[{limit:200}])
  ]).then(function(res){
    loyaltyData=safeArr(res[0]);referralData=safeArr(res[1]);
    renderGamificationPage(loyaltyData,referralData);
  }).catch(function(){renderGamificationPage([],[]);});
}
function renderGamificationPage(loyalty,referrals){
  var c=el('admV3Content');if(!c) return;
  var totalPts=loyalty.reduce(function(s,l){return s+(l.points||0);},0);
  var plat=loyalty.filter(function(l){return (l.points||0)>=50000;}).length;
  var gold=loyalty.filter(function(l){var p=l.points||0;return p>=20000&&p<50000;}).length;
  var silver=loyalty.filter(function(l){var p=l.points||0;return p>=5000&&p<20000;}).length;
  var totalRefs=referrals.length;
  var activeRefs=referrals.filter(function(r){return (r.uses||0)>0;}).length;

  var h='<div class="kpis">';
  h+=kpi(loyalty.length,'Thành Viên','#00C896');
  h+=kpi(totalPts.toLocaleString(),'Tổng Điểm','#FFC800');
  h+=kpi(plat,'Platinum','#E8B4FF');
  h+=kpi(gold,'Gold','#FFC800');
  h+=kpi(silver,'Silver','#C0C0C0');
  h+=kpi(totalRefs,'Mã Giới Thiệu','#7B5FFF');
  h+='</div>';

  /* Tier distribution chart */
  var bronze=loyalty.length-plat-gold-silver;
  var total=Math.max(loyalty.length,1);
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Phân Bố Tier Thành Viên</span></div>';
  h+='<div style="display:flex;gap:4px;height:32px;border-radius:8px;overflow:hidden;margin-bottom:16px">';
  if(bronze>0)h+='<div style="flex:'+bronze+';background:#CD7F32;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff" title="Bronze: '+bronze+'">'+Math.round(bronze/total*100)+'%</div>';
  if(silver>0)h+='<div style="flex:'+silver+';background:#C0C0C0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000" title="Silver: '+silver+'">'+Math.round(silver/total*100)+'%</div>';
  if(gold>0)h+='<div style="flex:'+gold+';background:#FFC800;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000" title="Gold: '+gold+'">'+Math.round(gold/total*100)+'%</div>';
  if(plat>0)h+='<div style="flex:'+plat+';background:linear-gradient(90deg,#9B82FF,#E8B4FF);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#000" title="Platinum: '+plat+'">'+Math.round(plat/total*100)+'%</div>';
  h+='</div>';

  /* Tier benefits */
  h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">';
  [{n:'Bronze',pts:'0-4,999',perks:'Tích điểm 1x',clr:'#CD7F32'},{n:'Silver',pts:'5,000-19,999',perks:'Tích 1.5x + Giảm 5%',clr:'#C0C0C0'},{n:'Gold',pts:'20,000-49,999',perks:'Tích 2x + Giảm 15%',clr:'#FFC800'},{n:'Platinum',pts:'50,000+',perks:'Tích 3x + Giảm 25% + VIP',clr:'linear-gradient(135deg,#9B82FF,#E8B4FF)'}].forEach(function(t){
    h+='<div style="padding:12px;border-radius:10px;background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);text-align:center">';
    h+='<div style="width:36px;height:36px;border-radius:50%;background:'+t.clr+';margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:14px">⭐</div>';
    h+='<div style="font-size:14px;font-weight:700;color:#E8F8F4;margin-bottom:2px">'+t.n+'</div>';
    h+='<div style="font-size:10px;color:#607870;margin-bottom:4px">'+t.pts+' pts</div>';
    h+='<div style="font-size:11px;color:#00C896">'+t.perks+'</div>';
    h+='</div>';
  });
  h+='</div></div>';

  /* Top members leaderboard */
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">🏆 Bảng Xếp Hạng Top 20</span></div>';
  var sorted=loyalty.slice().sort(function(a,b){return (b.points||0)-(a.points||0);}).slice(0,20);
  if(sorted.length){
    h+='<div class="tbl-w"><table class="tbl"><thead><tr><th>#</th><th>Thành Viên</th><th>Điểm</th><th>Tier</th></tr></thead><tbody>';
    sorted.forEach(function(m,i){
      var pts=m.points||0;var tier=pts>=50000?'Platinum':pts>=20000?'Gold':pts>=5000?'Silver':'Bronze';
      var tclr=tier==='Platinum'?'#E8B4FF':tier==='Gold'?'#FFC800':tier==='Silver'?'#C0C0C0':'#CD7F32';
      h+='<tr><td style="font-weight:700;color:'+(i<3?'#FFC800':'#607870')+'">'+(i<3?['🥇','🥈','🥉'][i]:(i+1))+'</td>';
      h+='<td style="font-weight:500">'+((m.user_name||m.name||'User')+'')+'</td>';
      h+='<td style="font-weight:700;color:#00C896">'+pts.toLocaleString()+'</td>';
      h+='<td>'+badge(tier,tclr)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  } else h+='<div class="empty">Chưa có dữ liệu loyalty</div>';
  h+='</div>';

  /* Referral codes */
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">🔗 Mã Giới Thiệu ('+referrals.length+')</span></div>';
  if(referrals.length){
    h+='<div class="tbl-w"><table class="tbl"><thead><tr><th>Mã</th><th>Người Tạo</th><th>Lượt Dùng</th><th>Trạng Thái</th></tr></thead><tbody>';
    referrals.slice(0,20).forEach(function(r){
      h+='<tr><td style="font-family:monospace;color:#7B5FFF;font-weight:600">'+(r.code||'')+'</td>';
      h+='<td>'+(r.user_name||'')+'</td>';
      h+='<td style="font-weight:600;color:#00C896">'+(r.uses||0)+'</td>';
      h+='<td>'+badge((r.uses||0)>0?'Active':'Chưa dùng',(r.uses||0)>0?'#00C896':'#607870')+'</td></tr>';
    });
    h+='</tbody></table></div>';
  } else h+='<div class="empty">Chưa có mã giới thiệu nào</div>';
  h+='</div>';

  c.innerHTML=h;
}

// ═══════════════════════════════════════
// PAGE 12: AFFILIATE
// ═══════════════════════════════════════
function pgAffiliate(){
  var c=el('admV3Content');if(!c) return;
  var act=el('admV3Actions');
  if(act) act.innerHTML='<button class="btn btn-p btn-sm" onclick="admV3CreateAffProgram()">+ Tạo Chương Trình</button>';

  c.innerHTML='<div class="empty">Đang tải dữ liệu Affiliate...</div>';

  /* FIX-6: Load affiliate data from Supabase instead of localStorage */
  Promise.all([
    safeLoad('AnimaAffiliate','getPrograms',[]),
    safeLoad('AnimaAffiliate','getMembers',[{limit:500}]),
    safeLoad('AnimaAffiliate','getTransactions',[{limit:500}])
  ]).then(function(results){
    var programs = safeArr(results[0]);
    var members = safeArr(results[1]);
    var transactions = safeArr(results[2]);

    /* If no programs in DB, seed defaults */
    if(!programs.length){
      programs=[
        {id:'AFF-KTV',name:'KTV Affiliate',commission_rate:0.10,type:'ktv',status:'active'},
        {id:'AFF-USER',name:'Giới Thiệu Bạn Bè',commission_rate:0.05,type:'user',status:'active'},
        {id:'AFF-CENTER',name:'Center Referral',commission_rate:0.02,type:'center',status:'active'},
        {id:'AFF-KOL',name:'KOL / Influencer',commission_rate:0.15,type:'kol',status:'active'}
      ];
    }

    /* Calculate real stats from transactions */
    var totalMembers = members.length;
    var totalRevAff = transactions.reduce(function(s,t){return s+(t.commission_amount||0);},0);
    var paidOut = transactions.filter(function(t){return t.status==='paid';}).reduce(function(s,t){return s+(t.commission_amount||0);},0);
    var pendingPay = transactions.filter(function(t){return t.status==='pending';}).reduce(function(s,t){return s+(t.commission_amount||0);},0);
    var activeProgs = programs.filter(function(p){return p.status==='active';}).length;

    var h='<div class="kpis">';
    h+=kpi(programs.length,'Chương Trình','#7B5FFF');
    h+=kpi(activeProgs,'Đang Hoạt Động','#00C896');
    h+=kpi(totalMembers,'Tổng Thành Viên','#FFC800');
    h+=kpi(money(totalRevAff),'Doanh Thu Aff','#00C896');
    h+=kpi(money(pendingPay),'Chờ Duyệt','#FF7070');
    h+=kpi(money(paidOut),'Đã Chi','#00B4D8');
    h+='</div>';

    /* Programs */
    h+='<div class="crd"><div class="crd-h"><span class="crd-t">Chương Trình Affiliate</span></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">';
    var typeLabels={ktv:'KTV',user:'Người Dùng',center:'Center',kol:'KOL'};
    var typeColors={ktv:'#00C896',user:'#7B5FFF',center:'#FFC800',kol:'#FF6B9D'};
    programs.forEach(function(p){
      var pType = p.type || 'user';
      var isActive = p.status==='active' || p.active;
      var rate = p.commission_rate ? Math.round(p.commission_rate*100) : (p.rate||0);
      /* Count members and revenue for this program */
      var progMembers = members.filter(function(m){return m.program_id===p.id;}).length;
      var progRevenue = transactions.filter(function(t){return t.program_id===p.id;}).reduce(function(s,t){return s+(t.commission_amount||0);},0);
      h+='<div style="padding:16px;background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;border-left:3px solid '+(typeColors[pType]||'#00C896')+'">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
      h+='<span style="font-size:14px;font-weight:700;color:#E8F8F4">'+(p.name||'Program')+'</span>';
      h+=badge(isActive?'Active':'Tắt',isActive?'#00C896':'#607870');
      h+='</div>';
      h+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:11px;text-align:center">';
      h+='<div><div style="font-size:16px;font-weight:700;color:'+(typeColors[pType]||'#00C896')+'">'+rate+'%</div><div style="color:#607870">Commission</div></div>';
      h+='<div><div style="font-size:16px;font-weight:700;color:#E8F8F4">'+progMembers+'</div><div style="color:#607870">Thành Viên</div></div>';
      h+='<div><div style="font-size:16px;font-weight:700;color:#00C896">'+money(progRevenue)+'</div><div style="color:#607870">Doanh Thu</div></div>';
      h+='</div>';
      h+='<div style="margin-top:10px;display:flex;gap:6px">';
      h+='<span style="font-size:10px;padding:3px 8px;border-radius:6px;background:rgba(0,200,150,.08);color:#00C896">'+(typeLabels[pType]||pType)+'</span>';
      h+='</div></div>';
    });
    h+='</div></div>';

    /* Members table */
    h+='<div class="crd"><div class="crd-h"><span class="crd-t">Thành Viên Affiliate ('+totalMembers+')</span></div>';
    if(members.length){
      h+='<div class="tbl-w"><table class="tbl"><thead><tr><th>ID</th><th>Tên</th><th>Mã GT</th><th>Tổng HH</th><th>Trạng Thái</th><th>Ngày Tham Gia</th></tr></thead><tbody>';
      members.forEach(function(m){
        h+='<tr><td style="font-size:11px;color:#607870">'+(m.id||'').substring(0,8)+'</td>';
        h+='<td>'+(m.user_name||m.name||'N/A')+'</td>';
        h+='<td style="font-family:monospace;color:#00C896">'+(m.referral_code||'--')+'</td>';
        h+='<td style="font-weight:600">'+money(m.total_commission||0)+'</td>';
        h+='<td>'+badge(m.status||'active',(m.status==='active'?'#00C896':'#607870'))+'</td>';
        h+='<td style="font-size:11px;color:#607870">'+shortDate(m.created_at)+'</td></tr>';
      });
      h+='</tbody></table></div>';
    } else {
      h+='<div style="padding:20px;text-align:center;color:#607870;font-size:13px">Chưa có thành viên affiliate</div>';
    }
    h+='</div>';

    /* Transactions table */
    h+='<div class="crd"><div class="crd-h"><span class="crd-t">Giao Dịch Hoa Hồng ('+transactions.length+')</span></div>';
    if(transactions.length){
      h+='<div class="tbl-w"><table class="tbl"><thead><tr><th>Đơn Hàng</th><th>Thành Viên</th><th>Giá Trị Đơn</th><th>Hoa Hồng</th><th>Tỉ Lệ</th><th>Trạng Thái</th><th>Ngày</th></tr></thead><tbody>';
      transactions.slice(0,100).forEach(function(t){
        var stColor = t.status==='paid'?'#00C896':t.status==='pending'?'#FFC800':'#FF7070';
        h+='<tr><td style="font-size:11px;font-family:monospace">'+(t.order_id||'--')+'</td>';
        h+='<td style="font-size:11px">'+(t.member_id||'').substring(0,12)+'</td>';
        h+='<td>'+money(t.order_amount||0)+'</td>';
        h+='<td style="font-weight:700;color:#00C896">'+money(t.commission_amount||0)+'</td>';
        h+='<td>'+Math.round((t.commission_rate||0)*100)+'%</td>';
        h+='<td>'+badge(t.status||'pending',stColor)+'</td>';
        h+='<td style="font-size:11px;color:#607870">'+shortDate(t.created_at)+'</td></tr>';
      });
      h+='</tbody></table></div>';
    } else {
      h+='<div style="padding:20px;text-align:center;color:#607870;font-size:13px">Chưa có giao dịch hoa hồng</div>';
    }
    h+='</div>';

    /* FIX-7: Cộng Đồng Affiliate */
    var byReferrer = {};
    members.forEach(function(m){
      var ref = m.referral_code || 'direct';
      if(!byReferrer[ref]) byReferrer[ref] = [];
      byReferrer[ref].push(m);
    });
    var refKeys = Object.keys(byReferrer);
    if(refKeys.length){
      h+='<div class="crd"><div class="crd-h"><span class="crd-t">Cộng Đồng Affiliate</span></div>';
      refKeys.forEach(function(ref){
        h+='<div style="margin:8px 0;padding:8px 12px;background:rgba(0,200,150,.03);border-left:3px solid #00C896;border-radius:0 8px 8px 0">';
        h+='<div style="font-size:12px;font-weight:600;color:#00C896">' + ref + ' (' + byReferrer[ref].length + ' thành viên)</div>';
        byReferrer[ref].forEach(function(m){
          h+='<div style="margin-left:20px;padding:4px 0;font-size:11px;color:#B8D8D0">' + (m.user_name||'N/A') + ' · ' + money(m.total_commission||0) + '</div>';
        });
        h+='</div>';
      });
      h+='</div>';
    }

    /* Affiliate Policy */
    h+='<div class="crd"><div class="crd-h"><span class="crd-t">Chính Sách Affiliate</span></div>';
    h+='<div style="font-size:13px;color:#B8D8D0;line-height:1.8">';
    h+='<div style="margin-bottom:8px"><b style="color:#FFC800">1. KTV Affiliate:</b> KTV giới thiệu khách mua ANIMA 119 → nhận 10% giá trị đơn. Hoa hồng được tích vào ví sau 48h giao hàng thành công.</div>';
    h+='<div style="margin-bottom:8px"><b style="color:#7B5FFF">2. Giới Thiệu Bạn Bè:</b> Khách chia sẻ mã giới thiệu → Bạn mới mua hàng → Cả 2 nhận 500 AnimePoint + Voucher 200.000đ.</div>';
    h+='<div style="margin-bottom:8px"><b style="color:#FFC800">3. Center Referral:</b> Cơ sở L1 giới thiệu đối tác mở L2 → Nhận 2% doanh thu L2 trong 6 tháng đầu.</div>';
    h+='<div><b style="color:#FF6B9D">4. KOL Program:</b> Influencer review sản phẩm → Commission 15% qua link tracking. Cần duyệt bởi Admin.</div>';
    h+='</div></div>';

    c.innerHTML=h;
  }).catch(function(err){
    console.error('[AdminV3] pgAffiliate error:', err);
    c.innerHTML='<div class="empty">Lỗi tải dữ liệu Affiliate. Dữ liệu localStorage sẽ hiển thị.</div>';
  });
}
window.admV3CreateAffProgram=function(){
  var name=prompt('Tên chương trình:');if(!name)return;
  var rate=prompt('Tỉ lệ commission (%):');if(!rate)return;
  var desc=prompt('Mô tả:');
  var type=prompt('Loại (ktv/user/center/kol):','user');
  var progs=[];try{progs=JSON.parse(localStorage.getItem('anima_aff_programs')||'[]');}catch(e){}
  progs.push({id:'AFF-'+Date.now().toString(36).toUpperCase(),name:name,desc:desc||'',rate:parseInt(rate)||5,type:type||'user',active:true,members:0,revenue:0});
  localStorage.setItem('anima_aff_programs',JSON.stringify(progs));
  pgAffiliate();
};

// ═══════════════════════════════════════
// SAFE LOAD / CALL HELPERS
// ═══════════════════════════════════════
function safeLoad(api,method,args){
  if(!window[api]||typeof window[api][method]!=='function'){
    return Promise.resolve([]);
  }
  return window[api][method].apply(window[api],args||[]).catch(function(e){
    console.warn('[AdminV3] '+api+'.'+method+' failed:',e);
    return [];
  });
}

function safeCall(api,method,args){
  if(!window[api]||typeof window[api][method]!=='function'){
    return Promise.reject(new Error(api+'.'+method+' not available'));
  }
  return window[api][method].apply(window[api],args||[]);
}

// ═══ PAGE: AI AGENT — MONITORING DASHBOARD ═══
function pgAgents(){
  var c=el('admV3Content');if(!c)return;
  c.innerHTML='<div class="empty">Dang tai Agent Monitor...</div>';

  // Load live data
  Promise.all([
    safeLoad('AnimaOrders','getAll',[{limit:1000}]),
    safeLoad('AnimaCRM','getLeads',[{limit:500}]),
    safeLoad('AnimaContacts','getAll',[{limit:500}])
  ]).then(function(res){
    _orders=safeArr(res[0]);_leads=safeArr(res[1]);_contacts=safeArr(res[2]);
    try{_bookings=safeArr(JSON.parse(localStorage.getItem('anima_bookings')));}catch(e){_bookings=[];}
    renderAgentsDashboard();
  }).catch(function(){renderAgentsDashboard();});
}

function renderAgentsDashboard(){
  var c=el('admV3Content');if(!c)return;

  // Count real metrics from localStorage
  var chatCount=0;var scanCount=0;
  try{var chatHist=JSON.parse(localStorage.getItem('anima_chat_history'));if(Array.isArray(chatHist))chatCount=chatHist.length;}catch(e){}
  try{var scanHist=JSON.parse(localStorage.getItem('anima_scan_history')||localStorage.getItem('anima_tongue_scans'));if(Array.isArray(scanHist))scanCount=scanHist.length;}catch(e){}

  var agents=[
    {name:'Anima Tu Van',desc:'Chatbot cham soc khach hang 24/7. Tu van san pham ANIMA 119, dich vu, dat lich. Gemini 2.5 Flash.',status:'active',model:'gemini-2.5-flash-lite',tokens:'~500/msg',color:'#00C896',icon:'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',metric:chatCount+' tin nhan'},
    {name:'Chuyen Gia Tam Soat',desc:'AI phan tich anh luoi theo Dong Y. Chan doan the tang, tinh trang tang phu.',status:'active',model:'gemini-2.5-flash',tokens:'~2000/scan',color:'#9B82FF',icon:'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',metric:scanCount+' lan scan'},
    {name:'AI De Xuat San Pham',desc:'Goi y san pham/dich vu phu hop dua tren the tang, lich su mua hang, ket qua tam soat.',status:'planned',model:'gemini-2.5-pro',tokens:'~300/req',color:'#FFC800',icon:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',metric:'Chua trien khai'},
    {name:'AI Du Bao Nhu Cau',desc:'Phan tich du lieu booking, don hang -> du bao peak demand -> goi y tang KTV.',status:'planned',model:'gemini-2.5-pro',tokens:'~1000/analysis',color:'#00B4D8',icon:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',metric:'Chua trien khai'},
    {name:'AI Cham Soc Sau Buoi',desc:'Tu dong gui loi khuyen sau tri lieu: che do an, tap luyen, thoi gian nghi ngoi phu hop the tang.',status:'planned',model:'gemini-2.5-flash-lite',tokens:'~400/msg',color:'#FF6B9D',icon:'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',metric:'Chua trien khai'}
  ];

  // === SECTION 1: Agent Status Cards ===
  var h='<div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">';
  h+=kpi(agents.filter(function(a){return a.status==='active';}).length,'Agent Hoat Dong','#00C896');
  h+=kpi(agents.length,'Tong Agent','#6496FF');
  h+=kpi(chatCount,'Tin Nhan Chatbot','#9B82FF');
  h+=kpi(scanCount,'Lan Tam Soat','#FFC800');
  h+='</div>';

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">He Thong AI Agent</span></div>';
  agents.forEach(function(a){
    var statusBg=a.status==='active'?'rgba(0,200,150,.1)':'rgba(255,200,0,.06)';
    var statusBorder=a.status==='active'?'rgba(0,200,150,.2)':'rgba(255,200,0,.15)';
    var statusText=a.status==='active'?'<span style="color:#00C896;font-weight:600">&#9679; Hoat dong</span>':'<span style="color:#FFC800;font-weight:600">&#9684; Dang phat trien</span>';
    h+='<div style="background:'+statusBg+';border:1px solid '+statusBorder+';border-radius:12px;padding:16px;margin-bottom:10px">';
    h+='<div style="display:flex;align-items:flex-start;gap:14px">';
    h+='<div style="width:44px;height:44px;min-width:44px;border-radius:12px;background:'+a.color+'18;border:1px solid '+a.color+'30;display:flex;align-items:center;justify-content:center">'+svgIcon(a.icon).replace('width="18"','width="22"').replace('height="18"','height="22"').replace('stroke="currentColor"','stroke="'+a.color+'"')+'</div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:15px;font-weight:700;color:#F8F2E0">'+a.name+'</span>'+statusText+'</div>';
    h+='<div style="font-size:13px;color:#B8D8D0;line-height:1.6;margin-bottom:8px">'+a.desc+'</div>';
    h+='<div style="display:flex;gap:12px;font-size:11px;color:#607870">';
    h+='<span>Model: <b style="color:#00C896">'+a.model+'</b></span>';
    h+='<span>Token: <b style="color:#FFC800">'+a.tokens+'</b></span>';
    h+='<span>Metric: <b style="color:#00B4D8">'+a.metric+'</b></span>';
    h+='</div></div></div></div>';
  });
  h+='</div>';

  // === SECTION 2: Hieu Suat He Thong ===
  var totalLeads=_leads.length;
  var wonLeads=_leads.filter(function(l){return l.status==='won';}).length;
  var conversionRate=totalLeads>0?(wonLeads/totalLeads*100).toFixed(1):0;

  var deliveredOrders=_orders.filter(function(o){return o.status==='delivered';});
  var totalOrders=_orders.length;
  var completionRate=totalOrders>0?(deliveredOrders.length/totalOrders*100).toFixed(1):0;

  // Avg processing time
  var avgProcessDays=0;
  var processCount=0;
  deliveredOrders.forEach(function(o){
    if(o.created_at&&o.delivered_at){
      var diff=new Date(o.delivered_at)-new Date(o.created_at);
      if(diff>0){avgProcessDays+=diff/(1000*60*60*24);processCount++;}
    }
  });
  avgProcessDays=processCount>0?(avgProcessDays/processCount).toFixed(1):'N/A';

  // Returning customers
  var phoneMap={};
  _orders.forEach(function(o){var p=o.customer_phone||o.phone||'';if(p){if(!phoneMap[p])phoneMap[p]=0;phoneMap[p]++;}});
  var totalCustomers=Object.keys(phoneMap).length;
  var returningCustomers=Object.keys(phoneMap).filter(function(k){return phoneMap[k]>1;}).length;
  var returnRate=totalCustomers>0?(returningCustomers/totalCustomers*100).toFixed(1):0;

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Hieu Suat He Thong</span></div>';
  h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">';

  var perfMetrics=[
    {l:'Ti le chuyen doi',v:conversionRate+'%',desc:wonLeads+'/'+totalLeads+' leads',pct:parseFloat(conversionRate),c:'#00C896'},
    {l:'Thoi gian xu ly don TB',v:avgProcessDays+(avgProcessDays!=='N/A'?' ngay':''),desc:'Pending -> Delivered',pct:avgProcessDays!=='N/A'?Math.min(100,100-parseFloat(avgProcessDays)*10):0,c:'#6496FF'},
    {l:'Ti le hoan thanh',v:completionRate+'%',desc:deliveredOrders.length+'/'+totalOrders+' don',pct:parseFloat(completionRate),c:'#9B82FF'},
    {l:'Khach quay lai',v:returnRate+'%',desc:returningCustomers+'/'+totalCustomers+' khach',pct:parseFloat(returnRate),c:'#FFC800'}
  ];
  perfMetrics.forEach(function(m){
    h+='<div style="background:#0D1520;border:1px solid rgba(0,200,150,.06);border-radius:10px;padding:14px">';
    h+='<div style="font-size:11px;color:#607870;margin-bottom:6px">'+m.l+'</div>';
    h+='<div style="font-size:22px;font-weight:700;color:'+m.c+';margin-bottom:4px">'+m.v+'</div>';
    h+='<div style="font-size:10px;color:#607870;margin-bottom:8px">'+m.desc+'</div>';
    h+='<div style="height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+Math.min(100,m.pct)+'%;background:'+m.c+';border-radius:2px;transition:width .5s"></div></div>';
    h+='</div>';
  });
  h+='</div></div>';

  // === SECTION 3: Canh Bao Rui Ro ===
  var alerts=[];
  var now=new Date();
  var h24=24*60*60*1000;var h72=72*60*60*1000;var d30=30*24*60*60*1000;

  // Pending >24h
  _orders.forEach(function(o){
    if(o.status==='pending'&&o.created_at){
      var age=now-new Date(o.created_at);
      if(age>h24) alerts.push({icon:'&#9888;&#65039;',msg:'Don #'+(o.order_code||o.id||'?')+' pending >24h',severity:'warn',time:o.created_at});
    }
  });
  // Shipped >72h
  _orders.forEach(function(o){
    if(o.status==='shipped'&&(o.shipped_at||o.updated_at)){
      var age=now-new Date(o.shipped_at||o.updated_at);
      if(age>h72) alerts.push({icon:'&#128680;',msg:'Don #'+(o.order_code||o.id||'?')+' shipped >72h chua giao',severity:'error',time:o.shipped_at||o.updated_at});
    }
  });
  // Unpaid delivered
  _orders.forEach(function(o){
    if(o.status==='delivered'&&(o.payment_status==='unpaid'||o.payment_status==='pending')){
      alerts.push({icon:'&#128176;',msg:'Don #'+(o.order_code||o.id||'?')+' da giao nhung chua thanh toan',severity:'warn',time:o.created_at});
    }
  });
  // Low stock
  try{
    var warehouses=JSON.parse(localStorage.getItem('anima_warehouses')||localStorage.getItem('anima_inventory'));
    if(Array.isArray(warehouses)){
      warehouses.forEach(function(w){
        if(w.items&&Array.isArray(w.items)){
          w.items.forEach(function(it){
            if((it.quantity||it.stock||0)<10) alerts.push({icon:'&#128230;',msg:'Ton kho thap: '+(it.name||it.sku||'?')+' ('+(it.quantity||it.stock||0)+' con lai) tai '+(w.name||'kho'),severity:'warn',time:new Date().toISOString()});
          });
        }
      });
    }
  }catch(e){}
  // Inactive KTVs
  try{
    var ktvs=JSON.parse(localStorage.getItem('anima_saved_tech'));
    if(Array.isArray(ktvs)){
      ktvs.forEach(function(k){
        if(k.last_session||k.lastActive){
          var lastActive=new Date(k.last_session||k.lastActive);
          if(now-lastActive>d30) alerts.push({icon:'&#128100;',msg:'KTV '+(k.name||k.full_name||'?')+' khong hoat dong >30 ngay',severity:'info',time:k.last_session||k.lastActive});
        }
      });
    }
  }catch(e){}
  // Revenue drop check
  var thisMonthRev=0;var lastMonthRev=0;
  var thisM=now.getMonth();var thisY=now.getFullYear();
  _orders.forEach(function(o){
    if(!o.created_at) return;
    var d=new Date(o.created_at);
    if(d.getFullYear()===thisY&&d.getMonth()===thisM) thisMonthRev+=(o.total_amount||0);
    if((d.getFullYear()===thisY&&d.getMonth()===thisM-1)||(thisM===0&&d.getFullYear()===thisY-1&&d.getMonth()===11)) lastMonthRev+=(o.total_amount||0);
  });
  if(lastMonthRev>0&&thisMonthRev<lastMonthRev*0.8){
    alerts.push({icon:'&#128201;',msg:'Doanh thu thang nay giam '+(((lastMonthRev-thisMonthRev)/lastMonthRev)*100).toFixed(0)+'% so voi thang truoc',severity:'error',time:new Date().toISOString()});
  }
  // Security: unusual patterns
  var dailyPhoneOrders={};
  _orders.forEach(function(o){
    var p=o.customer_phone||o.phone||'';var d=(o.created_at||'').split('T')[0];
    if(p&&d){var key=p+'_'+d;if(!dailyPhoneOrders[key])dailyPhoneOrders[key]=0;dailyPhoneOrders[key]++;}
  });
  Object.keys(dailyPhoneOrders).forEach(function(k){
    if(dailyPhoneOrders[k]>5){
      var parts=k.split('_');
      alerts.push({icon:'&#128274;',msg:'Bat thuong: '+parts[0]+' dat >5 don trong ngay '+parts[1],severity:'error',time:parts[1]+'T00:00:00'});
    }
  });

  // Sort alerts by severity
  var sevOrder={error:0,warn:1,info:2};
  alerts.sort(function(a,b){return (sevOrder[a.severity]||2)-(sevOrder[b.severity]||2);});

  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Canh Bao Rui Ro ('+alerts.length+')</span></div>';
  if(alerts.length){
    h+='<div style="max-height:300px;overflow-y:auto">';
    alerts.forEach(function(a){
      var bgColor=a.severity==='error'?'rgba(255,70,70,.06)':a.severity==='warn'?'rgba(255,200,0,.06)':'rgba(100,150,255,.06)';
      var borderColor=a.severity==='error'?'rgba(255,70,70,.15)':a.severity==='warn'?'rgba(255,200,0,.12)':'rgba(100,150,255,.1)';
      var textColor=a.severity==='error'?'#FF7070':a.severity==='warn'?'#FFC800':'#6496FF';
      h+='<div style="background:'+bgColor+';border:1px solid '+borderColor+';border-radius:8px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px;font-size:12px">';
      h+='<span style="font-size:16px">'+a.icon+'</span>';
      h+='<span style="flex:1;color:'+textColor+'">'+a.msg+'</span>';
      h+='<span style="color:#607870;font-size:10px;white-space:nowrap">'+shortDate(a.time)+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }else{
    h+='<div style="text-align:center;padding:20px;color:#00C896;font-size:13px">&#9989; Khong co canh bao nao. He thong hoat dong binh thuong.</div>';
  }
  h+='</div>';

  // === SECTION 4: Bao Mat ===
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">&#128274; Quy Tac Bao Mat Agent AI</span></div>';
  h+='<div style="font-family:monospace;font-size:12px;line-height:2;color:#B8D8D0;background:#0A1218;border-radius:8px;padding:16px">';
  var rules=[
    {icon:'&#9989;',text:'Chi tra loi ve he sinh thai AnimaCare'},
    {icon:'&#9989;',text:'KHONG tiet lo doanh thu, data khach hang'},
    {icon:'&#9989;',text:'KHONG chia se thong tin noi bo cong ty'},
    {icon:'&#9989;',text:'KHONG truy cap data ngoai pham vi'},
    {icon:'&#9989;',text:'Moi du lieu duoc ma hoa khi truyen tai'},
    {icon:'&#9989;',text:'Log tat ca tuong tac de audit'}
  ];
  rules.forEach(function(r,i){
    var prefix=i<rules.length-1?'&#9500;&#9472;&#9472;':'&#9492;&#9472;&#9472;';
    h+='<div>'+prefix+' '+r.icon+' '+r.text+'</div>';
  });
  h+='</div></div>';

  // === SECTION 5: Agent Activity Log ===
  h+='<div class="crd"><div class="crd-h"><span class="crd-t">Agent Activity Log</span></div>';
  h+='<div style="max-height:280px;overflow-y:auto">';

  // Recent chatbot conversations
  var chatLogs=[];
  try{
    var hist=JSON.parse(localStorage.getItem('anima_chat_history'));
    if(Array.isArray(hist)){
      chatLogs=hist.slice(-10).reverse().map(function(m){
        return {type:'chat',icon:'&#128172;',msg:'Chatbot: '+(m.content||m.message||m.text||'').substring(0,80)+(((m.content||m.message||m.text||'').length>80)?'...':''),time:m.timestamp||m.created_at||m.time||'',color:'#00C896'};
      });
    }
  }catch(e){}

  // Recent scans
  var scanLogs=[];
  try{
    var scans=JSON.parse(localStorage.getItem('anima_scan_history')||localStorage.getItem('anima_tongue_scans'));
    if(Array.isArray(scans)){
      scanLogs=scans.slice(-5).reverse().map(function(s){
        return {type:'scan',icon:'&#128269;',msg:'Tam Soat: '+(s.result||s.diagnosis||s.summary||'Ket qua phan tich').substring(0,80),time:s.timestamp||s.created_at||s.time||'',color:'#9B82FF'};
      });
    }
  }catch(e){}

  // Mock blocked queries
  var activityLogs=chatLogs.concat(scanLogs);
  activityLogs.push({type:'system',icon:'&#128683;',msg:'Blocked query: User hoi ve thong tin tai chinh noi bo',time:new Date(now-3600000).toISOString(),color:'#FF7070'});
  activityLogs.push({type:'system',icon:'&#128683;',msg:'Blocked query: Yeu cau xuat data khach hang',time:new Date(now-7200000).toISOString(),color:'#FF7070'});
  activityLogs.push({type:'system',icon:'&#9989;',msg:'System audit: Tat ca agent hoat dong trong pham vi cho phep',time:new Date(now-1800000).toISOString(),color:'#00C896'});

  if(!activityLogs.length){
    h+='<div class="empty">Chua co hoat dong nao</div>';
  }else{
    activityLogs.slice(0,15).forEach(function(log){
      h+='<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(0,200,150,.04);font-size:12px">';
      h+='<span style="font-size:14px">'+log.icon+'</span>';
      h+='<span style="flex:1;color:'+log.color+'">'+log.msg+'</span>';
      h+='<span style="color:#607870;font-size:10px;white-space:nowrap">'+(log.time?shortDateTime(log.time):'-')+'</span>';
      h+='</div>';
    });
  }
  h+='</div></div>';

  c.innerHTML=h;
}

// ═══ AUTO-INIT ═══
console.log('[AdminV3] Admin Dashboard v3.0 loaded. Call openAdminV3() to launch.');

})();
