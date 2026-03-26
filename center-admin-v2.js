/* ═══════════════════════════════════════════════════════════════
   AnimaCare Center Admin V2 — Province L1 Partner Dashboard
   IIFE pattern, no modules, all on window
   11 pages, light/dark theme, Vietnamese
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var _cid='', _cname='', _page='dashboard', _theme='dark', _sideOpen=true;
var _orders=[], _bookings=[], _ktvs=[], _warehouses={}, _l2Centers=[], _notifications=[];
var _customers=[], _commissions=[];

// ── Products catalog ──
var PRODUCTS = [
  {id:'A119-10',cat:'ANIMA 119',name:'ANIMA 119 - 10 viên',price:1868000,type:'product'},
  {id:'A119-30',cat:'ANIMA 119',name:'ANIMA 119 - 30 viên',price:5604000,type:'product'},
  {id:'A119-120',cat:'ANIMA 119',name:'ANIMA 119 - 120 viên',price:22416000,type:'product'},
  {id:'TDK',cat:'Chăm Sóc Sức Khỏe',name:'Tinh dầu kinh lạc',price:350000,type:'product'},
  {id:'TDX',cat:'Chăm Sóc Sức Khỏe',name:'Thảo dược xông',price:280000,type:'product'},
  {id:'TDS',cat:'Chăm Sóc Sức Khỏe',name:'Trà dưỡng sinh',price:220000,type:'product'},
  {id:'MDT',cat:'Chăm Sóc Sức Khỏe',name:'Miếng dán thảo dược',price:180000,type:'product'},
  {id:'MNC',cat:'Chăm Sóc Sức Khỏe',name:'Muối ngâm chân',price:150000,type:'product'},
  {id:'KDT',cat:'Chăm Sóc Sức Khỏe',name:'Kem dưỡng thảo mộc',price:320000,type:'product'},
  {id:'BXH',cat:'Thiết Bị',name:'Buồng xông hơi',price:45000000,type:'equipment'},
  {id:'GTL',cat:'Thiết Bị',name:'Giường trị liệu',price:25000000,type:'equipment'},
  {id:'DHN',cat:'Thiết Bị',name:'Đèn hồng ngoại',price:8500000,type:'equipment'},
  {id:'BGH',cat:'Thiết Bị',name:'Bộ giác hơi',price:1200000,type:'equipment'},
  {id:'KCC',cat:'Thiết Bị',name:'Kim châm cứu',price:450000,type:'equipment'},
  {id:'MAS',cat:'Thiết Bị',name:'Máy AI Scan',price:65000000,type:'equipment'}
];

var ORDER_STATUSES = [
  {v:'pending',l:'Chờ XN',c:'#FFC800'},{v:'confirmed',l:'Đã XN',c:'#6496FF'},
  {v:'processing',l:'Đang XL',c:'#7B5FFF'},{v:'shipped',l:'Đang Giao',c:'#00B4D8'},
  {v:'delivered',l:'Hoàn Thành',c:'#00C896'},{v:'cancelled',l:'Đã Hủy',c:'#FF7070'}
];
var PAY_STATUSES = [
  {v:'unpaid',l:'Chưa TT',c:'#FF7070'},{v:'pending',l:'Chờ TT',c:'#FFC800'},
  {v:'paid',l:'Đã TT',c:'#00C896'},{v:'refunded',l:'Hoàn Tiền',c:'#7B5FFF'}
];
var BOOKING_STATUSES = [
  {v:'pending',l:'Chờ XN',c:'#FFC800'},{v:'confirmed',l:'Đã XN',c:'#6496FF'},
  {v:'completed',l:'Hoàn Thành',c:'#00C896'},{v:'cancelled',l:'Đã Hủy',c:'#FF7070'}
];

var NAV = [
  {g:'TỔNG QUAN'},
  {id:'dashboard',icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4',l:'Dashboard'},
  {id:'analytics',icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',l:'Analytics'},
  {g:'VẬN HÀNH'},
  {id:'orders',icon:'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2',l:'Đơn Hàng',badge:true},
  {id:'bookings',icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',l:'Lịch Hẹn',badge:true},
  {id:'customers',icon:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z',l:'Khách Hàng'},
  {id:'ktv',icon:'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z',l:'KTV'},
  {g:'THƯƠNG MẠI'},
  {id:'products',icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',l:'Sản Phẩm & Kho'},
  {id:'l2centers',icon:'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',l:'Cơ Sở Vệ Tinh'},
  {id:'commission',icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',l:'Hoa Hồng & Ví'},
  {g:'HỆ THỐNG'},
  {id:'notifications',icon:'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',l:'Thông Báo',badge:true},
  {id:'settings',icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',l:'Cài Đặt'}
];

// ── Helpers ──
function fmt(n){return (n||0).toLocaleString('vi-VN');}
function fmtM(n){return n>=1e6?(n/1e6).toFixed(1)+'M':fmt(n);}
function fmtD(d){if(!d)return'-';var dt=new Date(d);return dt.toLocaleDateString('vi-VN');}
function uid(){return 'id-'+Math.random().toString(36).slice(2,9);}
function qs(s,el){return(el||document).querySelector(s);}
function qsa(s,el){return Array.from((el||document).querySelectorAll(s));}
function safe(fn,fb){try{return fn();}catch(e){return fb;}}
function lsGet(k,fb){try{var v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch(e){return fb;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function statusLabel(v,arr){var f=arr.find(function(s){return s.v===v;});return f?f.l:v;}
function statusColor(v,arr){var f=arr.find(function(s){return s.v===v;});return f?f.c:'#888';}
function svgIcon(d,sz){sz=sz||20;return '<svg width="'+sz+'" height="'+sz+'" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="'+d+'"/></svg>';}
function daysBetween(a,b){return Math.floor((b-a)/864e5);}

// ── Data loading ──
function loadData(){
  _orders=safe(function(){return window.AnimaOrders?window.AnimaOrders.getAll({filter:'center_id=eq.'+_cid}):[];},[]);
  if(!_orders||!_orders.length) _orders=lsGet('anima_orders_'+_cid,[]);
  _bookings=safe(function(){return window.AnimaBookings?window.AnimaBookings.getAll({filter:'center_id=eq.'+_cid}):[];},[]);
  if(!_bookings||!_bookings.length) _bookings=lsGet('anima_bookings_'+_cid,[]);
  _ktvs=lsGet('anima_saved_tech',[]).filter(function(k){return k.centerId===_cid;});
  _warehouses=lsGet('anima_warehouses',{})[_cid]||{};
  _l2Centers=safe(function(){return window.AnimaSync?window.AnimaSync.get('centers',[]).filter(function(c){return c.parentId===_cid;}):[];},[]);
  if(!_l2Centers.length) _l2Centers=lsGet('anima_l2_'+_cid,[]);
  _notifications=lsGet('anima_notif_'+_cid,[]);
  _commissions=lsGet('anima_commissions_'+_cid,[]);
  buildCustomers();
}

function buildCustomers(){
  var map={};
  _orders.forEach(function(o){
    var ph=o.customer_phone||o.phone||'';
    if(!ph)return;
    if(!map[ph])map[ph]={name:o.customer_name||o.name||'Khách',phone:ph,email:o.customer_email||'',totalSpend:0,orders:0,lastVisit:o.created_at};
    map[ph].totalSpend+=(o.total||o.amount||0);
    map[ph].orders++;
    if(o.created_at>map[ph].lastVisit) map[ph].lastVisit=o.created_at;
  });
  _customers=Object.values(map);
  _customers.forEach(function(c){
    c.tier=c.totalSpend>=50e6?'Platinum':c.totalSpend>=20e6?'Gold':c.totalSpend>=5e6?'Silver':'Bronze';
  });
}

function saveOrders(){lsSet('anima_orders_'+_cid,_orders);}
function saveBookings(){lsSet('anima_bookings_'+_cid,_bookings);}
function saveKtvs(){var all=lsGet('anima_saved_tech',[]).filter(function(k){return k.centerId!==_cid;});lsSet('anima_saved_tech',all.concat(_ktvs));}
function saveL2(){lsSet('anima_l2_'+_cid,_l2Centers);}
function saveWH(){var all=lsGet('anima_warehouses',{});all[_cid]=_warehouses;lsSet('anima_warehouses',all);}
function saveNotif(){lsSet('anima_notif_'+_cid,_notifications);}
function saveComm(){lsSet('anima_commissions_'+_cid,_commissions);}

// ── CSS injection ──
function injectCSS(){
  if(qs('#cadm-css'))return;
  var s=document.createElement('style');s.id='cadm-css';
  s.textContent=`
#centerAdm{--bg:#070E1E;--bg2:#0D1520;--card:#0D1520;--text:#F8F2E0;--text2:#B8D8D0;--text3:#607870;--accent:#00C896;--border:rgba(0,200,150,.08);--shadow:0 2px 12px rgba(0,0,0,.3);position:fixed;inset:0;z-index:99999;font-family:'Inter','Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);display:flex;overflow:hidden;transition:all .3s}
#centerAdm.light{--bg:#FAFAFA;--bg2:#F5F3FF;--card:#FFFFFF;--text:#1A1A2E;--text2:#374151;--text3:#6B7280;--accent:#2D8F6F;--border:rgba(0,0,0,.08);--shadow:0 2px 12px rgba(0,0,0,.06)}
#centerAdm *{box-sizing:border-box;margin:0;padding:0}
.ca-side{width:240px;min-width:240px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;height:100%;overflow-y:auto;transition:all .3s}
.ca-side.collapsed{width:0;min-width:0;overflow:hidden;border:none}
.ca-side-hdr{padding:20px 16px 12px;border-bottom:1px solid var(--border)}
.ca-side-hdr h2{font-size:14px;font-weight:700;color:var(--accent);letter-spacing:.5px}
.ca-side-hdr p{font-size:11px;color:var(--text3);margin-top:4px}
.ca-nav{flex:1;padding:8px 0}
.ca-nav-group{padding:12px 16px 4px;font-size:10px;font-weight:600;color:var(--text3);letter-spacing:1.2px;text-transform:uppercase}
.ca-nav-item{display:flex;align-items:center;gap:10px;padding:9px 16px;cursor:pointer;font-size:13px;color:var(--text2);border-left:3px solid transparent;transition:all .15s}
.ca-nav-item:hover{background:var(--border);color:var(--text)}
.ca-nav-item.active{color:var(--accent);border-left-color:var(--accent);background:rgba(0,200,150,.06)}
.ca-nav-item svg{flex-shrink:0;opacity:.7}
.ca-nav-item.active svg{opacity:1}
.ca-badge{background:var(--accent);color:#070E1E;font-size:10px;font-weight:700;padding:1px 6px;border-radius:8px;margin-left:auto}
.ca-side-foot{padding:12px 16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px}
.ca-side-foot button{background:none;border:1px solid var(--border);color:var(--text3);padding:6px 10px;border-radius:8px;cursor:pointer;font-size:11px;transition:all .15s}
.ca-side-foot button:hover{color:var(--accent);border-color:var(--accent)}
.ca-main{flex:1;overflow-y:auto;padding:24px;min-width:0}
.ca-topbar{display:none;align-items:center;gap:12px;padding:12px 16px;background:var(--bg2);border-bottom:1px solid var(--border)}
.ca-hamburger{background:none;border:none;color:var(--text);cursor:pointer;padding:4px}
.ca-topbar h3{font-size:14px;font-weight:600;color:var(--text)}
.ca-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:20px}
.ca-kpi{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:var(--shadow)}
.ca-kpi-label{font-size:11px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.ca-kpi-val{font-size:22px;font-weight:700;color:var(--text)}
.ca-kpi-sub{font-size:11px;color:var(--text2);margin-top:4px}
.ca-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow)}
.ca-card h3{font-size:14px;font-weight:600;margin-bottom:12px;color:var(--text)}
.ca-tbl{width:100%;border-collapse:collapse;font-size:12px}
.ca-tbl th{text-align:left;padding:8px 10px;color:var(--text3);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--border)}
.ca-tbl td{padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text2)}
.ca-tbl tr:hover td{background:var(--border)}
.ca-tbl .ca-status{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600}
.ca-bar-chart{display:flex;align-items:flex-end;gap:4px;height:120px;padding-top:8px}
.ca-bar{flex:1;background:var(--accent);border-radius:4px 4px 0 0;min-height:2px;transition:height .3s;position:relative}
.ca-bar:hover{opacity:.8}
.ca-bar-tip{display:none;position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:var(--card);border:1px solid var(--border);padding:4px 8px;border-radius:6px;font-size:10px;white-space:nowrap;color:var(--text)}
.ca-bar:hover .ca-bar-tip{display:block}
.ca-stacked{display:flex;height:28px;border-radius:8px;overflow:hidden;margin:8px 0}
.ca-stacked div{display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#fff;min-width:30px}
.ca-btn{background:linear-gradient(135deg,var(--accent),#00A67A);color:#fff;border:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
.ca-btn:hover{opacity:.9;transform:translateY(-1px)}
.ca-btn-outline{background:none;border:1px solid var(--border);color:var(--text2);padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;transition:all .15s}
.ca-btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.ca-btn-sm{padding:5px 10px;font-size:11px}
.ca-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:100001}
.ca-modal{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px;width:90%;max-width:500px;max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.3)}
.ca-modal h3{font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text)}
.ca-modal label{display:block;font-size:12px;color:var(--text3);margin-bottom:4px;margin-top:10px}
.ca-modal input,.ca-modal select,.ca-modal textarea{width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;outline:none}
.ca-modal input:focus,.ca-modal select:focus{border-color:var(--accent)}
.ca-modal-btns{display:flex;gap:8px;margin-top:16px;justify-content:flex-end}
.ca-filters{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center}
.ca-filters input,.ca-filters select{padding:6px 10px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:12px;outline:none}
.ca-alert{padding:10px 14px;border-radius:10px;font-size:12px;margin-bottom:8px;display:flex;align-items:center;gap:8px;border:1px solid}
.ca-alert-warn{background:rgba(255,200,0,.08);border-color:rgba(255,200,0,.2);color:#FFC800}
.ca-alert-danger{background:rgba(255,112,112,.08);border-color:rgba(255,112,112,.2);color:#FF7070}
.ca-alert-info{background:rgba(0,200,150,.08);border-color:rgba(0,200,150,.2);color:var(--accent)}
.ca-tier{display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700}
.ca-tier-Bronze{background:rgba(205,127,50,.15);color:#CD7F32}
.ca-tier-Silver{background:rgba(192,192,192,.15);color:#A0A0A0}
.ca-tier-Gold{background:rgba(255,200,0,.15);color:#DAA520}
.ca-tier-Platinum{background:rgba(100,150,255,.15);color:#6496FF}
.ca-tag-online{color:#00C896}.ca-tag-offline{color:#FF7070}.ca-tag-busy{color:#FFC800}
.ca-empty{text-align:center;padding:32px;color:var(--text3);font-size:13px}
@media(max-width:768px){.ca-side{position:fixed;z-index:100002;left:0;top:0;height:100%}.ca-side.collapsed{width:0}.ca-topbar{display:flex!important}.ca-main{padding:14px}.ca-kpis{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}}
`;
  document.head.appendChild(s);
}

// ── Render shell ──
function renderShell(){
  var el=document.createElement('div');el.id='centerAdm';
  if(_theme==='light') el.classList.add('light');
  el.innerHTML='<div class="ca-side" id="caSide"></div><div style="flex:1;display:flex;flex-direction:column;overflow:hidden"><div class="ca-topbar" id="caTopbar"></div><div class="ca-main" id="caMain"></div></div>';
  document.body.appendChild(el);
  renderSidebar();renderTopbar();
}

function renderSidebar(){
  var unreadOrders=_orders.filter(function(o){return o.status==='pending';}).length;
  var unreadBook=_bookings.filter(function(b){return b.status==='pending';}).length;
  var unreadNotif=_notifications.filter(function(n){return !n.read;}).length;
  var badges={orders:unreadOrders,bookings:unreadBook,notifications:unreadNotif};
  var h='<div class="ca-side-hdr"><h2>ANIMACARE</h2><p>'+esc(_cname)+'</p><p style="margin-top:2px;font-size:10px;color:var(--accent)">Quản Lý Cấp 1</p></div><div class="ca-nav">';
  NAV.forEach(function(n){
    if(n.g){h+='<div class="ca-nav-group">'+n.g+'</div>';return;}
    var active=n.id===_page?' active':'';
    var bdg=n.badge&&badges[n.id]>0?'<span class="ca-badge">'+badges[n.id]+'</span>':'';
    h+='<div class="ca-nav-item'+active+'" data-page="'+n.id+'">'+svgIcon(n.icon,18)+'<span>'+n.l+'</span>'+bdg+'</div>';
  });
  h+='</div><div class="ca-side-foot"><button id="caThemeBtn" title="Đổi theme">'+(_theme==='dark'?'&#9728;':'&#9790;')+'</button><button id="caExitBtn" title="Thoát">&#10005; Thoát</button></div>';
  qs('#caSide').innerHTML=h;
  qsa('.ca-nav-item',qs('#caSide')).forEach(function(el){
    el.addEventListener('click',function(){_page=this.dataset.page;render();});
  });
  var tb=qs('#caThemeBtn');if(tb)tb.addEventListener('click',toggleTheme);
  var eb=qs('#caExitBtn');if(eb)eb.addEventListener('click',function(){window.closeCenterAdminV2();});
}

function renderTopbar(){
  qs('#caTopbar').innerHTML='<button class="ca-hamburger" id="caHamburger">&#9776;</button><h3>'+esc(_cname)+'</h3>';
  qs('#caHamburger').addEventListener('click',function(){
    _sideOpen=!_sideOpen;
    qs('#caSide').classList.toggle('collapsed',!_sideOpen);
  });
}

function toggleTheme(){
  _theme=_theme==='dark'?'light':'dark';
  qs('#centerAdm').classList.toggle('light',_theme==='light');
  lsSet('anima_theme',_theme);
  renderSidebar();
}

function esc(s){var d=document.createElement('div');d.textContent=s||'';return d.innerHTML;}

// ── Main render ──
function render(){
  loadData();renderSidebar();
  var m=qs('#caMain');if(!m)return;
  var pages={dashboard:pgDashboard,analytics:pgAnalytics,orders:pgOrders,bookings:pgBookings,customers:pgCustomers,ktv:pgKTV,products:pgProducts,l2centers:pgL2,commission:pgCommission,notifications:pgNotifications,settings:pgSettings};
  var fn=pages[_page]||pgDashboard;
  m.innerHTML=fn();
  bindPage();
}

function bindPage(){
  // Bind all buttons with data-action
  qsa('[data-action]',qs('#caMain')).forEach(function(el){
    el.addEventListener('click',function(){handleAction(this.dataset.action,this.dataset);});
  });
  // Bind dropdowns
  qsa('select[data-change]',qs('#caMain')).forEach(function(sel){
    sel.addEventListener('change',function(){handleChange(this.dataset.change,this.value,this.dataset);});
  });
}

// ── PAGE 1: Dashboard ──
function pgDashboard(){
  var now=new Date(),mo=now.getMonth(),yr=now.getFullYear();
  var moOrders=_orders.filter(function(o){var d=new Date(o.created_at);return d.getMonth()===mo&&d.getFullYear()===yr;});
  var revenue=moOrders.reduce(function(s,o){return s+(o.total||o.amount||0);},0);
  var newCust=_customers.filter(function(c){var d=new Date(c.lastVisit);return d.getMonth()===mo&&d.getFullYear()===yr;}).length;
  var activeKtv=_ktvs.filter(function(k){return k.status==='online'||k.status==='busy';}).length;
  var comm=Math.round(revenue*.25);
  var h='<div class="ca-kpis">';
  h+=kpi('Doanh Thu Tháng',fmt(revenue)+'đ','Tháng '+(mo+1)+'/'+yr);
  h+=kpi('Đơn Hàng',moOrders.length,'Tháng này');
  h+=kpi('Khách Mới',newCust,'Tháng này');
  h+=kpi('KTV Active',activeKtv+'/'+_ktvs.length,'Đang hoạt động');
  h+=kpi('Cơ Sở Cấp 2',_l2Centers.length,'Vệ tinh');
  h+=kpi('Hoa Hồng',fmtM(comm)+'đ','~25% sản phẩm');
  h+='</div>';
  // 30-day chart
  h+='<div class="ca-card"><h3>Doanh Thu 30 Ngày</h3>'+chart30d()+'</div>';
  // Stacked bar breakdown
  h+='<div class="ca-card"><h3>Phân Loại Doanh Thu</h3>'+stackedBreakdown()+'</div>';
  // Recent 5 orders
  h+='<div class="ca-card"><h3>Đơn Hàng Gần Đây</h3>'+recentOrdersTable()+'</div>';
  // Alerts
  h+='<div class="ca-card"><h3>Cảnh Báo AI Agent</h3>'+agentAlerts()+'</div>';
  return h;
}

function kpi(label,val,sub){
  return '<div class="ca-kpi"><div class="ca-kpi-label">'+label+'</div><div class="ca-kpi-val">'+val+'</div><div class="ca-kpi-sub">'+sub+'</div></div>';
}

function chart30d(){
  var days=[];var now=Date.now();
  for(var i=29;i>=0;i--){var d=new Date(now-i*864e5);days.push({date:d,rev:0});}
  _orders.forEach(function(o){
    var d=new Date(o.created_at);var ago=daysBetween(d,new Date(now));
    if(ago>=0&&ago<30) days[29-ago].rev+=(o.total||o.amount||0);
  });
  var max=Math.max.apply(null,days.map(function(d){return d.rev;}))||1;
  var h='<div class="ca-bar-chart">';
  days.forEach(function(d){
    var pct=Math.max(2,d.rev/max*100);
    h+='<div class="ca-bar" style="height:'+pct+'%"><div class="ca-bar-tip">'+d.date.getDate()+'/'+(d.date.getMonth()+1)+': '+fmt(d.rev)+'đ</div></div>';
  });
  return h+'</div>';
}

function stackedBreakdown(){
  var prod=0,svc=0,equip=0;
  _orders.forEach(function(o){
    var items=o.items||[];
    items.forEach(function(it){
      var p=PRODUCTS.find(function(pr){return pr.id===it.productId;});
      if(p&&p.type==='equipment') equip+=(it.qty||1)*(p.price);
      else if(it.type==='service') svc+=(it.amount||it.price||0);
      else prod+=(it.qty||1)*(it.price||0);
    });
    if(!items.length) prod+=(o.total||o.amount||0);
  });
  var total=prod+svc+equip||1;
  var pp=Math.round(prod/total*100),sp=Math.round(svc/total*100),ep=100-pp-sp;
  return '<div class="ca-stacked"><div style="width:'+pp+'%;background:#00C896" title="Sản phẩm: '+fmt(prod)+'đ">SP '+pp+'%</div><div style="width:'+sp+'%;background:#6496FF" title="Dịch vụ: '+fmt(svc)+'đ">DV '+sp+'%</div><div style="width:'+Math.max(ep,0)+'%;background:#FFC800" title="Thiết bị: '+fmt(equip)+'đ">TB '+ep+'%</div></div><div style="font-size:11px;color:var(--text3)">Sản phẩm: '+fmt(prod)+'đ &middot; Dịch vụ: '+fmt(svc)+'đ &middot; Thiết bị: '+fmt(equip)+'đ</div>';
}

function recentOrdersTable(){
  var recent=_orders.slice().sort(function(a,b){return new Date(b.created_at)-new Date(a.created_at);}).slice(0,5);
  if(!recent.length) return '<div class="ca-empty">Chưa có đơn hàng</div>';
  var h='<table class="ca-tbl"><tr><th>Mã</th><th>Khách</th><th>Tổng</th><th>Trạng Thái</th><th>Ngày</th></tr>';
  recent.forEach(function(o){
    h+='<tr><td>'+esc(o.id||o._id||'-')+'</td><td>'+esc(o.customer_name||o.name||'-')+'</td><td>'+fmt(o.total||o.amount||0)+'đ</td><td><span class="ca-status" style="background:'+statusColor(o.status,ORDER_STATUSES)+'22;color:'+statusColor(o.status,ORDER_STATUSES)+'">'+statusLabel(o.status,ORDER_STATUSES)+'</span></td><td>'+fmtD(o.created_at)+'</td></tr>';
  });
  return h+'</table>';
}

function agentAlerts(){
  var h='';var now=Date.now();
  var pending24=_orders.filter(function(o){return o.status==='pending'&&(now-new Date(o.created_at).getTime())>864e5;});
  if(pending24.length) h+='<div class="ca-alert ca-alert-warn">&#9888; '+pending24.length+' đơn hàng chờ xử lý &gt;24h</div>';
  var lowStock=PRODUCTS.filter(function(p){return(_warehouses[p.id]||0)<5;});
  if(lowStock.length) h+='<div class="ca-alert ca-alert-danger">&#9888; '+lowStock.length+' sản phẩm tồn kho thấp (&lt;5)</div>';
  var offKtv=_ktvs.filter(function(k){return k.status==='offline';});
  if(offKtv.length) h+='<div class="ca-alert ca-alert-info">&#8505; '+offKtv.length+' KTV đang offline</div>';
  if(!h) h='<div class="ca-alert ca-alert-info">&#10003; Không có cảnh báo nào</div>';
  return h;
}

// ── PAGE 2: Orders ──
function pgOrders(){
  var mo=new Date().getMonth(),yr=new Date().getFullYear();
  var moOrds=_orders.filter(function(o){var d=new Date(o.created_at);return d.getMonth()===mo&&d.getFullYear()===yr;});
  var byStatus=function(s){return moOrds.filter(function(o){return o.status===s;});};
  var rev=moOrds.reduce(function(s,o){return s+(o.total||o.amount||0);},0);
  var h='<div class="ca-kpis">';
  h+=kpi('Chờ XN',byStatus('pending').length,'');
  h+=kpi('Đang XL',byStatus('processing').length,'');
  h+=kpi('Đang Giao',byStatus('shipped').length,'');
  h+=kpi('Hoàn Thành',byStatus('delivered').length,'');
  h+=kpi('Tổng Đơn',moOrds.length,'Tháng này');
  h+=kpi('Doanh Thu',fmtM(rev)+'đ','Tháng này');
  h+='</div>';
  h+='<div class="ca-filters"><input type="text" id="caOrdSearch" placeholder="Tìm đơn hàng..." style="flex:1;min-width:150px"><select id="caOrdFilter"><option value="">Tất cả trạng thái</option>';
  ORDER_STATUSES.forEach(function(s){h+='<option value="'+s.v+'">'+s.l+'</option>';});
  h+='</select><button class="ca-btn" data-action="createOrder">+ Tạo Đơn</button></div>';
  h+='<div class="ca-card" style="padding:0;overflow-x:auto">'+ordersTable(_orders)+'</div>';
  return h;
}

function ordersTable(list){
  if(!list.length) return '<div class="ca-empty">Chưa có đơn hàng</div>';
  var h='<table class="ca-tbl"><tr><th>Mã</th><th>Khách</th><th>SĐT</th><th>Sản Phẩm</th><th>Tổng</th><th>Trạng Thái</th><th>Thanh Toán</th><th>Ngày</th></tr>';
  list.forEach(function(o,i){
    var items=(o.items||[]).map(function(it){return it.name||it.productId;}).join(', ')||'-';
    h+='<tr><td>'+esc(o.id||o._id||'ORD-'+i)+'</td><td>'+esc(o.customer_name||o.name||'-')+'</td><td>'+esc(o.customer_phone||o.phone||'-')+'</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(items)+'</td><td>'+fmt(o.total||o.amount||0)+'đ</td><td><select data-change="orderStatus" data-idx="'+i+'" style="background:'+statusColor(o.status,ORDER_STATUSES)+'22;color:'+statusColor(o.status,ORDER_STATUSES)+';border:none;padding:3px 6px;border-radius:6px;font-size:11px;font-weight:600">';
    ORDER_STATUSES.forEach(function(s){h+='<option value="'+s.v+'"'+(o.status===s.v?' selected':'')+'>'+s.l+'</option>';});
    h+='</select></td><td><select data-change="payStatus" data-idx="'+i+'" style="font-size:11px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:3px 6px;color:var(--text2)">';
    PAY_STATUSES.forEach(function(s){h+='<option value="'+s.v+'"'+(o.payment_status===s.v?' selected':'')+'>'+s.l+'</option>';});
    h+='</select></td><td>'+fmtD(o.created_at)+'</td></tr>';
  });
  return h+'</table>';
}

// ── PAGE 3: Products & Warehouse ──
function pgProducts(){
  var cats=['ANIMA 119','Chăm Sóc Sức Khỏe','Thiết Bị'];
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="color:var(--text);font-size:16px">Sản Phẩm & Kho Hàng</h3><button class="ca-btn" data-action="importStock">Đặt Hàng Nhập Kho</button></div>';
  cats.forEach(function(cat){
    var prods=PRODUCTS.filter(function(p){return p.cat===cat;});
    h+='<div class="ca-card"><h3>'+cat+'</h3><table class="ca-tbl"><tr><th>Mã</th><th>Sản Phẩm</th><th>Giá</th><th>Tồn Kho</th><th>Trạng Thái</th></tr>';
    prods.forEach(function(p){
      var stock=_warehouses[p.id]||0;
      var warn=stock<5?'<span style="color:#FF7070;font-weight:600">Thấp</span>':stock<20?'<span style="color:#FFC800">Trung bình</span>':'<span style="color:#00C896">Đủ</span>';
      h+='<tr><td>'+p.id+'</td><td>'+esc(p.name)+'</td><td>'+fmt(p.price)+'đ</td><td><input type="number" value="'+stock+'" min="0" style="width:60px;padding:4px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;text-align:center" data-change="stock" data-pid="'+p.id+'"></td><td>'+warn+'</td></tr>';
    });
    h+='</table></div>';
  });
  return h;
}

// ── PAGE 4: L2 Centers ──
function pgL2(){
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="color:var(--text);font-size:16px">Cơ Sở Vệ Tinh (Cấp 2)</h3><button class="ca-btn" data-action="addL2">+ Thêm Cơ Sở</button></div>';
  h+='<div class="ca-card"><p style="font-size:12px;color:var(--text3);margin-bottom:12px">Hoa hồng override: 5% doanh thu từ cơ sở cấp 2 về cấp 1</p>';
  if(!_l2Centers.length){h+='<div class="ca-empty">Chưa có cơ sở vệ tinh</div>';return h+'</div>';}
  h+='<table class="ca-tbl"><tr><th>Tên</th><th>Địa Chỉ</th><th>Quản Lý</th><th>SĐT</th><th>Đơn Hàng</th><th>Doanh Thu</th><th>KTV</th></tr>';
  _l2Centers.forEach(function(c){
    var cOrders=_orders.filter(function(o){return o.center_id===c.id;});
    var cRev=cOrders.reduce(function(s,o){return s+(o.total||o.amount||0);},0);
    var cKtv=_ktvs.filter(function(k){return k.l2Id===c.id;}).length;
    h+='<tr><td>'+esc(c.name)+'</td><td>'+esc(c.address||'-')+'</td><td>'+esc(c.manager||'-')+'</td><td>'+esc(c.phone||'-')+'</td><td>'+cOrders.length+'</td><td>'+fmtM(cRev)+'đ</td><td>'+cKtv+'</td></tr>';
  });
  return h+'</table></div>';
}

// ── PAGE 5: KTV ──
function pgKTV(){
  var active=_ktvs.filter(function(k){return k.status==='online'||k.status==='busy';}).length;
  var avgRating=_ktvs.length?(_ktvs.reduce(function(s,k){return s+(k.rating||0);},0)/_ktvs.length).toFixed(1):'0';
  var topEarner=_ktvs.slice().sort(function(a,b){return(b.revenue||0)-(a.revenue||0);})[0];
  var h='<div class="ca-kpis">';
  h+=kpi('Tổng KTV',_ktvs.length,'Đã đăng ký');
  h+=kpi('Đang Active',active,'Online/Busy');
  h+=kpi('Đánh Giá TB',avgRating+' &#9733;','Trung bình');
  h+=kpi('Top Earner',topEarner?esc(topEarner.name):'N/A',topEarner?fmtM(topEarner.revenue||0)+'đ':'');
  h+='</div>';
  h+='<div class="ca-filters"><button class="ca-btn" data-action="scanKTV">&#128205; Quét KTV 10km</button><button class="ca-btn-outline" data-action="inviteKTV">&#128279; Mời KTV</button></div>';
  h+='<div class="ca-card" style="padding:0;overflow-x:auto">';
  if(!_ktvs.length){h+='<div class="ca-empty">Chưa có KTV</div>';}
  else{
    h+='<table class="ca-tbl"><tr><th>Tên</th><th>SĐT</th><th>Đánh Giá</th><th>Phiên</th><th>Doanh Thu</th><th>Trạng Thái</th></tr>';
    _ktvs.forEach(function(k){
      var stCls=k.status==='online'?'ca-tag-online':k.status==='busy'?'ca-tag-busy':'ca-tag-offline';
      h+='<tr><td>'+esc(k.name)+'</td><td>'+esc(k.phone||'-')+'</td><td>'+(k.rating||0).toFixed(1)+' &#9733;</td><td>'+(k.sessions||0)+'</td><td>'+fmtM(k.revenue||0)+'đ</td><td><span class="'+stCls+'" style="font-weight:600;font-size:11px">'+(k.status||'offline').toUpperCase()+'</span></td></tr>';
    });
    h+='</table>';
  }
  return h+'</div>';
}

// ── PAGE 6: Bookings ──
function pgBookings(){
  var sorted=_bookings.slice().sort(function(a,b){return new Date(b.date||b.created_at)-new Date(a.date||a.created_at);});
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="color:var(--text);font-size:16px">Lịch Hẹn</h3><button class="ca-btn" data-action="createBooking">+ Tạo Lịch Hẹn</button></div>';
  if(!sorted.length) return h+'<div class="ca-card"><div class="ca-empty">Chưa có lịch hẹn</div></div>';
  // Group by date
  var groups={};
  sorted.forEach(function(b){var d=fmtD(b.date||b.created_at);if(!groups[d])groups[d]=[];groups[d].push(b);});
  Object.keys(groups).forEach(function(d){
    h+='<div class="ca-card"><h3>'+d+'</h3><table class="ca-tbl"><tr><th>Giờ</th><th>Khách</th><th>SĐT</th><th>Dịch Vụ</th><th>KTV</th><th>Trạng Thái</th></tr>';
    groups[d].forEach(function(b,i){
      h+='<tr><td>'+(b.time||'--:--')+'</td><td>'+esc(b.customer_name||'-')+'</td><td>'+esc(b.customer_phone||'-')+'</td><td>'+esc(b.service||'-')+'</td><td><select data-change="bookingKtv" data-bid="'+(b.id||i)+'" style="font-size:11px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:3px;color:var(--text2)"><option value="">Chọn KTV</option>';
      _ktvs.forEach(function(k){h+='<option value="'+esc(k.id||k.name)+'"'+(b.ktv_id===(k.id||k.name)?' selected':'')+'>'+esc(k.name)+'</option>';});
      h+='</select></td><td><select data-change="bookingStatus" data-bid="'+(b.id||i)+'" style="font-size:11px;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:3px;color:var(--text2)">';
      BOOKING_STATUSES.forEach(function(s){h+='<option value="'+s.v+'"'+(b.status===s.v?' selected':'')+'>'+s.l+'</option>';});
      h+='</select></td></tr>';
    });
    h+='</table></div>';
  });
  return h;
}

// ── PAGE 7: Customers ──
function pgCustomers(){
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="color:var(--text);font-size:16px">Khách Hàng (CRM)</h3><span style="font-size:12px;color:var(--text3)">'+_customers.length+' khách</span></div>';
  h+='<div class="ca-filters"><input type="text" id="caCustSearch" placeholder="Tìm theo tên, SĐT..."></div>';
  h+='<div class="ca-card" style="padding:0;overflow-x:auto">';
  if(!_customers.length){h+='<div class="ca-empty">Chưa có dữ liệu khách hàng</div>';}
  else{
    h+='<table class="ca-tbl"><tr><th>Tên</th><th>SĐT</th><th>Tổng Chi</th><th>Đơn</th><th>Lần Cuối</th><th>Hạng</th><th></th></tr>';
    _customers.sort(function(a,b){return b.totalSpend-a.totalSpend;}).forEach(function(c,i){
      h+='<tr><td>'+esc(c.name)+'</td><td>'+esc(c.phone)+'</td><td>'+fmt(c.totalSpend)+'đ</td><td>'+c.orders+'</td><td>'+fmtD(c.lastVisit)+'</td><td><span class="ca-tier ca-tier-'+c.tier+'">'+c.tier+'</span></td><td><button class="ca-btn-outline ca-btn-sm" data-action="custDetail" data-idx="'+i+'">Chi tiết</button></td></tr>';
    });
    h+='</table>';
  }
  return h+'</div>';
}

// ── PAGE 8: Commission ──
function pgCommission(){
  var mo=new Date().getMonth(),yr=new Date().getFullYear();
  var moOrds=_orders.filter(function(o){var d=new Date(o.created_at);return d.getMonth()===mo&&d.getFullYear()===yr&&o.status!=='cancelled';});
  var prodRev=0,svcRev=0;
  moOrds.forEach(function(o){
    var items=o.items||[];
    if(!items.length){prodRev+=(o.total||o.amount||0);return;}
    items.forEach(function(it){if(it.type==='service')svcRev+=(it.amount||it.price||0);else prodRev+=(it.qty||1)*(it.price||0);});
  });
  var l2Rev=_l2Centers.reduce(function(s,c){return s+_orders.filter(function(o){return o.center_id===c.id;}).reduce(function(ss,o){return ss+(o.total||o.amount||0);},0);},0);
  var commProd=Math.round(prodRev*.25),commSvc=Math.round(svcRev*.40),commL2=Math.round(l2Rev*.05);
  var total=commProd+commSvc+commL2;
  var balance=lsGet('anima_balance_'+_cid,total);

  var h='<div class="ca-kpis">';
  h+=kpi('Hoa Hồng Tháng',fmt(total)+'đ','Tổng cộng');
  h+=kpi('SP (25%)',fmt(commProd)+'đ','Sản phẩm trực tiếp');
  h+=kpi('DV (40%)',fmt(commSvc)+'đ','Dịch vụ trực tiếp');
  h+=kpi('L2 Override (5%)',fmt(commL2)+'đ','Từ cơ sở vệ tinh');
  h+=kpi('Số Dư Ví',fmt(balance)+'đ','Khả dụng');
  h+='</div>';
  h+='<div style="margin-bottom:16px"><button class="ca-btn" data-action="withdraw">Yêu Cầu Rút Tiền</button></div>';
  h+='<div class="ca-card"><h3>Lịch Sử Giao Dịch</h3>';
  if(!_commissions.length){h+='<div class="ca-empty">Chưa có giao dịch</div>';}
  else{
    h+='<table class="ca-tbl"><tr><th>Ngày</th><th>Loại</th><th>Số Tiền</th><th>Ghi Chú</th><th>Trạng Thái</th></tr>';
    _commissions.forEach(function(c){
      var cl=c.amount>=0?'color:#00C896':'color:#FF7070';
      h+='<tr><td>'+fmtD(c.date)+'</td><td>'+esc(c.type||'-')+'</td><td style="'+cl+';font-weight:600">'+(c.amount>=0?'+':'')+fmt(c.amount)+'đ</td><td>'+esc(c.note||'-')+'</td><td>'+esc(c.status||'completed')+'</td></tr>';
    });
    h+='</table>';
  }
  return h+'</div>';
}

// ── PAGE 9: Analytics ──
function pgAnalytics(){
  var h='<h3 style="color:var(--text);font-size:16px;margin-bottom:16px">Analytics</h3>';
  // Revenue 30 days
  h+='<div class="ca-card"><h3>Doanh Thu 30 Ngày</h3>'+chart30d()+'</div>';
  // Top 5 products
  var prodMap={};
  _orders.forEach(function(o){(o.items||[]).forEach(function(it){var n=it.name||it.productId||'Khác';prodMap[n]=(prodMap[n]||0)+(it.qty||1)*(it.price||0);});});
  var topProds=Object.entries(prodMap).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  var maxProd=topProds.length?topProds[0][1]||1:1;
  h+='<div class="ca-card"><h3>Top 5 Sản Phẩm</h3>';
  if(!topProds.length) h+='<div class="ca-empty">Chưa có dữ liệu</div>';
  else topProds.forEach(function(p){h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="width:120px;font-size:12px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p[0])+'</span><div style="flex:1;height:20px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+Math.round(p[1]/maxProd*100)+'%;background:var(--accent);border-radius:4px"></div></div><span style="font-size:11px;color:var(--text3);min-width:70px;text-align:right">'+fmtM(p[1])+'đ</span></div>';});
  h+='</div>';
  // Top 5 KTVs
  var topKtv=_ktvs.slice().sort(function(a,b){return(b.revenue||0)-(a.revenue||0);}).slice(0,5);
  var maxKtv=topKtv.length?(topKtv[0].revenue||1):1;
  h+='<div class="ca-card"><h3>Top 5 KTV</h3>';
  if(!topKtv.length) h+='<div class="ca-empty">Chưa có dữ liệu</div>';
  else topKtv.forEach(function(k){h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="width:120px;font-size:12px;color:var(--text2)">'+esc(k.name)+'</span><div style="flex:1;height:20px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+Math.round((k.revenue||0)/maxKtv*100)+'%;background:#6496FF;border-radius:4px"></div></div><span style="font-size:11px;color:var(--text3);min-width:70px;text-align:right">'+fmtM(k.revenue||0)+'đ</span></div>';});
  h+='</div>';
  // Customer return rate & MoM
  var thisMonth=new Date().getMonth(),lastMonth=thisMonth===0?11:thisMonth-1;
  var thisYr=new Date().getFullYear(),lastYr=thisMonth===0?thisYr-1:thisYr;
  var moRev=_orders.filter(function(o){var d=new Date(o.created_at);return d.getMonth()===thisMonth&&d.getFullYear()===thisYr;}).reduce(function(s,o){return s+(o.total||o.amount||0);},0);
  var lmRev=_orders.filter(function(o){var d=new Date(o.created_at);return d.getMonth()===lastMonth&&d.getFullYear()===lastYr;}).reduce(function(s,o){return s+(o.total||o.amount||0);},0);
  var returnRate=_customers.filter(function(c){return c.orders>1;}).length;
  var returnPct=_customers.length?Math.round(returnRate/_customers.length*100):0;
  var momPct=lmRev?Math.round((moRev-lmRev)/lmRev*100):0;
  h+='<div class="ca-kpis"><div class="ca-kpi"><div class="ca-kpi-label">Tỷ Lệ Quay Lại</div><div class="ca-kpi-val">'+returnPct+'%</div><div class="ca-kpi-sub">'+returnRate+'/'+_customers.length+' khách</div></div>';
  h+='<div class="ca-kpi"><div class="ca-kpi-label">So Với Tháng Trước</div><div class="ca-kpi-val" style="color:'+(momPct>=0?'#00C896':'#FF7070')+'">'+(momPct>=0?'+':'')+momPct+'%</div><div class="ca-kpi-sub">'+fmtM(moRev)+'đ vs '+fmtM(lmRev)+'đ</div></div></div>';
  return h;
}

// ── PAGE 10: Notifications ──
function pgNotifications(){
  var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h3 style="color:var(--text);font-size:16px">Thông Báo</h3><button class="ca-btn-outline ca-btn-sm" data-action="markAllRead">Đánh dấu tất cả đã đọc</button></div>';
  if(!_notifications.length) return h+'<div class="ca-card"><div class="ca-empty">Không có thông báo</div></div>';
  var typeIcons={order_new:'&#128230;',booking_new:'&#128197;',ktv_register:'&#128100;',stock_low:'&#128230;',admin_message:'&#128172;'};
  _notifications.sort(function(a,b){return new Date(b.date)-new Date(a.date);}).forEach(function(n,i){
    var readStyle=n.read?'opacity:.6':'';
    var icon=typeIcons[n.type]||'&#128276;';
    h+='<div class="ca-card" style="display:flex;align-items:flex-start;gap:12px;'+readStyle+'"><span style="font-size:20px">'+icon+'</span><div style="flex:1"><div style="font-size:13px;font-weight:'+(n.read?'400':'600')+'">'+esc(n.title||n.message||'-')+'</div><div style="font-size:11px;color:var(--text3);margin-top:4px">'+fmtD(n.date)+'</div></div>'+(n.read?'':'<button class="ca-btn-outline ca-btn-sm" data-action="markRead" data-idx="'+i+'">Đã đọc</button>')+'</div>';
  });
  return h;
}

// ── PAGE 11: Settings ──
function pgSettings(){
  var info=lsGet('anima_center_info_'+_cid,{name:_cname,address:'',hotline:'',hours:'8:00 - 20:00',bankName:'',bankAccount:'',bankHolder:''});
  var staff=lsGet('anima_staff_'+_cid,[]);
  var h='<h3 style="color:var(--text);font-size:16px;margin-bottom:16px">Cài Đặt</h3>';
  h+='<div class="ca-card"><h3>Thông Tin Cơ Sở</h3>';
  h+='<label>Tên cơ sở</label><input id="csName" value="'+esc(info.name)+'">';
  h+='<label>Địa chỉ</label><input id="csAddr" value="'+esc(info.address)+'">';
  h+='<label>Hotline</label><input id="csHotline" value="'+esc(info.hotline)+'">';
  h+='<label>Giờ mở cửa</label><input id="csHours" value="'+esc(info.hours)+'">';
  h+='<div style="margin-top:14px"><button class="ca-btn" data-action="saveInfo">Lưu Thông Tin</button></div></div>';
  h+='<div class="ca-card"><h3>Tài Khoản Ngân Hàng (Nhận hoa hồng)</h3>';
  h+='<label>Ngân hàng</label><input id="csBankName" value="'+esc(info.bankName)+'">';
  h+='<label>Số tài khoản</label><input id="csBankAcc" value="'+esc(info.bankAccount)+'">';
  h+='<label>Chủ tài khoản</label><input id="csBankHolder" value="'+esc(info.bankHolder)+'">';
  h+='<div style="margin-top:14px"><button class="ca-btn" data-action="saveBank">Lưu Ngân Hàng</button></div></div>';
  h+='<div class="ca-card"><h3>Giao Diện</h3><div style="display:flex;align-items:center;gap:12px"><span style="font-size:13px;color:var(--text2)">Theme hiện tại: '+(_theme==='dark'?'Tối':'Sáng')+'</span><button class="ca-btn-outline" data-action="toggleTheme">Đổi Theme</button></div></div>';
  h+='<div class="ca-card"><h3>Nhân Viên</h3><button class="ca-btn-outline ca-btn-sm" data-action="addStaff" style="margin-bottom:12px">+ Thêm Nhân Viên</button>';
  if(!staff.length) h+='<div class="ca-empty">Chưa có nhân viên</div>';
  else{
    h+='<table class="ca-tbl"><tr><th>Tên</th><th>SĐT</th><th>Vai Trò</th><th></th></tr>';
    staff.forEach(function(s,i){
      h+='<tr><td>'+esc(s.name)+'</td><td>'+esc(s.phone||'-')+'</td><td>'+esc(s.role||'staff')+'</td><td><button class="ca-btn-outline ca-btn-sm" data-action="removeStaff" data-idx="'+i+'" style="color:#FF7070">Xóa</button></td></tr>';
    });
    h+='</table>';
  }
  return h+'</div>';
}

// ── Actions ──
function handleAction(action, data){
  switch(action){
    case 'createOrder': showModal(modalCreateOrder()); break;
    case 'createBooking': showModal(modalCreateBooking()); break;
    case 'addL2': showModal(modalAddL2()); break;
    case 'scanKTV': showModal(modalScanKTV()); break;
    case 'inviteKTV': showModal(modalInviteKTV()); break;
    case 'importStock': showModal(modalImportStock()); break;
    case 'withdraw': showModal(modalWithdraw()); break;
    case 'custDetail': showModal(modalCustDetail(parseInt(data.idx))); break;
    case 'markRead':
      var idx=parseInt(data.idx);if(_notifications[idx])_notifications[idx].read=true;saveNotif();render();break;
    case 'markAllRead':
      _notifications.forEach(function(n){n.read=true;});saveNotif();render();break;
    case 'saveInfo':
      var info={name:qs('#csName').value,address:qs('#csAddr').value,hotline:qs('#csHotline').value,hours:qs('#csHours').value,bankName:lsGet('anima_center_info_'+_cid,{}).bankName||'',bankAccount:lsGet('anima_center_info_'+_cid,{}).bankAccount||'',bankHolder:lsGet('anima_center_info_'+_cid,{}).bankHolder||''};
      lsSet('anima_center_info_'+_cid,info);alert('Đã lưu thông tin!');break;
    case 'saveBank':
      var prev=lsGet('anima_center_info_'+_cid,{});prev.bankName=qs('#csBankName').value;prev.bankAccount=qs('#csBankAcc').value;prev.bankHolder=qs('#csBankHolder').value;
      lsSet('anima_center_info_'+_cid,prev);alert('Đã lưu tài khoản ngân hàng!');break;
    case 'toggleTheme': toggleTheme();render();break;
    case 'addStaff': showModal(modalAddStaff()); break;
    case 'removeStaff':
      var staff=lsGet('anima_staff_'+_cid,[]);staff.splice(parseInt(data.idx),1);lsSet('anima_staff_'+_cid,staff);render();break;
  }
}

function handleChange(type,val,data){
  switch(type){
    case 'orderStatus':
      var i=parseInt(data.idx);if(_orders[i]){_orders[i].status=val;saveOrders();}break;
    case 'payStatus':
      var i2=parseInt(data.idx);if(_orders[i2]){_orders[i2].payment_status=val;saveOrders();}break;
    case 'stock':
      _warehouses[data.pid]=parseInt(val)||0;saveWH();break;
    case 'bookingStatus':
      var b=_bookings.find(function(bk){return(bk.id||'')==data.bid;});if(b)b.status=val;saveBookings();break;
    case 'bookingKtv':
      var b2=_bookings.find(function(bk){return(bk.id||'')==data.bid;});if(b2)b2.ktv_id=val;saveBookings();break;
  }
}

// ── Modals ──
function showModal(html){
  var ov=document.createElement('div');ov.className='ca-modal-overlay';ov.id='caModalOv';
  ov.innerHTML='<div class="ca-modal">'+html+'</div>';
  qs('#centerAdm').appendChild(ov);
  ov.addEventListener('click',function(e){if(e.target===ov)closeModal();});
  var cb=qs('#caModalClose',ov);if(cb)cb.addEventListener('click',closeModal);
}
function closeModal(){var ov=qs('#caModalOv');if(ov)ov.remove();}

function modalCreateOrder(){
  return '<h3>Tạo Đơn Hàng Mới</h3><label>Tên khách</label><input id="moName"><label>SĐT</label><input id="moPhone"><label>Sản phẩm</label><select id="moProduct">'+PRODUCTS.map(function(p){return '<option value="'+p.id+'">'+p.name+' - '+fmt(p.price)+'đ</option>';}).join('')+'</select><label>Số lượng</label><input id="moQty" type="number" value="1" min="1"><label>Ghi chú</label><textarea id="moNote" rows="2"></textarea><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Hủy</button><button class="ca-btn" onclick="window._caSubmitOrder()">Tạo Đơn</button></div>';
}

window._caSubmitOrder=function(){
  var prod=PRODUCTS.find(function(p){return p.id===qs('#moProduct').value;});
  var qty=parseInt(qs('#moQty').value)||1;
  var order={id:'ORD-'+uid(),customer_name:qs('#moName').value,customer_phone:qs('#moPhone').value,center_id:_cid,items:[{productId:prod.id,name:prod.name,price:prod.price,qty:qty}],total:prod.price*qty,status:'pending',payment_status:'unpaid',note:qs('#moNote').value,created_at:new Date().toISOString()};
  _orders.unshift(order);saveOrders();
  _notifications.unshift({type:'order_new',title:'Đơn hàng mới: '+order.id,date:new Date().toISOString(),read:false});saveNotif();
  closeModal();render();
};

function modalCreateBooking(){
  return '<h3>Tạo Lịch Hẹn</h3><label>Tên khách</label><input id="mbName"><label>SĐT</label><input id="mbPhone"><label>Dịch vụ</label><input id="mbService" placeholder="VD: Xông hơi thảo dược"><label>Ngày</label><input id="mbDate" type="date"><label>Giờ</label><input id="mbTime" type="time"><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Hủy</button><button class="ca-btn" onclick="window._caSubmitBooking()">Tạo</button></div>';
}

window._caSubmitBooking=function(){
  var b={id:'BK-'+uid(),customer_name:qs('#mbName').value,customer_phone:qs('#mbPhone').value,service:qs('#mbService').value,date:qs('#mbDate').value,time:qs('#mbTime').value,center_id:_cid,status:'pending',created_at:new Date().toISOString()};
  _bookings.unshift(b);saveBookings();
  _notifications.unshift({type:'booking_new',title:'Lịch hẹn mới: '+b.customer_name,date:new Date().toISOString(),read:false});saveNotif();
  closeModal();render();
};

function modalAddL2(){
  return '<h3>Thêm Cơ Sở Vệ Tinh</h3><label>Tên cơ sở</label><input id="ml2Name"><label>Địa chỉ</label><input id="ml2Addr"><label>Quản lý</label><input id="ml2Mgr"><label>SĐT</label><input id="ml2Phone"><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Hủy</button><button class="ca-btn" onclick="window._caSubmitL2()">Thêm</button></div>';
}

window._caSubmitL2=function(){
  var c={id:'L2-'+uid(),name:qs('#ml2Name').value,address:qs('#ml2Addr').value,manager:qs('#ml2Mgr').value,phone:qs('#ml2Phone').value,parentId:_cid,created_at:new Date().toISOString()};
  _l2Centers.push(c);saveL2();closeModal();render();
};

function modalScanKTV(){
  var nearby=[
    {name:'Nguyễn Văn A',phone:'0901234567',rating:4.8,dist:'2.3km',status:'online'},
    {name:'Trần Thị B',phone:'0912345678',rating:4.5,dist:'4.1km',status:'online'},
    {name:'Lê Văn C',phone:'0923456789',rating:4.2,dist:'6.7km',status:'offline'},
    {name:'Phạm Thị D',phone:'0934567890',rating:4.9,dist:'8.2km',status:'busy'},
    {name:'Hoàng Văn E',phone:'0945678901',rating:4.0,dist:'9.5km',status:'online'}
  ];
  var h='<h3>Quét KTV Trong Bán Kính 10km</h3><p style="font-size:12px;color:var(--text3);margin-bottom:12px">Tìm thấy '+nearby.length+' KTV gần cơ sở</p><table class="ca-tbl"><tr><th>Tên</th><th>SĐT</th><th>Đánh Giá</th><th>Khoảng Cách</th><th>Trạng Thái</th><th></th></tr>';
  nearby.forEach(function(k,i){
    var stCls=k.status==='online'?'ca-tag-online':k.status==='busy'?'ca-tag-busy':'ca-tag-offline';
    h+='<tr><td>'+k.name+'</td><td>'+k.phone+'</td><td>'+k.rating+' &#9733;</td><td><span style="background:rgba(0,200,150,.1);padding:2px 6px;border-radius:4px;font-size:10px;color:var(--accent)">'+k.dist+'</span></td><td><span class="'+stCls+'" style="font-weight:600;font-size:11px">'+k.status.toUpperCase()+'</span></td><td><button class="ca-btn ca-btn-sm" onclick="window._caAddKTV('+i+')">Thêm</button></td></tr>';
  });
  h+='</table><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Đóng</button></div>';
  window._caNearby=nearby;
  return h;
}

window._caAddKTV=function(i){
  var k=window._caNearby[i];if(!k)return;
  _ktvs.push({id:'KTV-'+uid(),name:k.name,phone:k.phone,rating:k.rating,sessions:0,revenue:0,status:k.status,centerId:_cid,created_at:new Date().toISOString()});
  saveKtvs();_notifications.unshift({type:'ktv_register',title:'KTV mới: '+k.name,date:new Date().toISOString(),read:false});saveNotif();
  closeModal();render();
};

function modalInviteKTV(){
  var link='https://animacare.vn/ktv/invite/'+_cid+'/'+uid();
  return '<h3>Mời KTV</h3><p style="font-size:12px;color:var(--text3);margin-bottom:12px">Chia sẻ link bên dưới để mời KTV tham gia cơ sở của bạn:</p><div style="background:var(--bg);padding:10px;border-radius:8px;border:1px solid var(--border);word-break:break-all;font-size:12px;color:var(--accent)">'+link+'</div><div style="margin-top:8px"><button class="ca-btn ca-btn-sm" onclick="navigator.clipboard.writeText(\''+link+'\');this.textContent=\'Đã copy!\'">Copy Link</button></div><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Đóng</button></div>';
}

function modalImportStock(){
  var h='<h3>Đặt Hàng Nhập Kho</h3><p style="font-size:12px;color:var(--text3);margin-bottom:12px">Chọn sản phẩm và số lượng cần nhập thêm:</p>';
  PRODUCTS.forEach(function(p){
    h+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="flex:1;font-size:12px;color:var(--text2)">'+esc(p.name)+'</span><input type="number" id="imp_'+p.id+'" value="0" min="0" style="width:60px;padding:4px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;text-align:center"></div>';
  });
  h+='<div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Hủy</button><button class="ca-btn" onclick="window._caSubmitImport()">Gửi Yêu Cầu</button></div>';
  return h;
}

window._caSubmitImport=function(){
  var added=false;
  PRODUCTS.forEach(function(p){
    var el=qs('#imp_'+p.id);if(!el)return;
    var qty=parseInt(el.value)||0;
    if(qty>0){_warehouses[p.id]=(_warehouses[p.id]||0)+qty;added=true;}
  });
  if(added){saveWH();alert('Đã gửi yêu cầu nhập kho!');}
  closeModal();render();
};

function modalWithdraw(){
  var info=lsGet('anima_center_info_'+_cid,{});
  return '<h3>Yêu Cầu Rút Tiền</h3><label>Số tiền (VNĐ)</label><input id="mwAmount" type="number" placeholder="VD: 5000000"><label>Ngân hàng</label><input id="mwBank" value="'+esc(info.bankName||'')+'"><label>Số tài khoản</label><input id="mwAcc" value="'+esc(info.bankAccount||'')+'"><label>Chủ tài khoản</label><input id="mwHolder" value="'+esc(info.bankHolder||'')+'"><label>Ghi chú</label><textarea id="mwNote" rows="2"></textarea><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Hủy</button><button class="ca-btn" onclick="window._caSubmitWithdraw()">Gửi Yêu Cầu</button></div>';
}

window._caSubmitWithdraw=function(){
  var amt=parseInt(qs('#mwAmount').value)||0;
  if(amt<=0){alert('Vui lòng nhập số tiền hợp lệ');return;}
  _commissions.push({date:new Date().toISOString(),type:'Rút tiền',amount:-amt,note:'Rút về '+qs('#mwBank').value+' - '+qs('#mwAcc').value,status:'pending'});
  saveComm();
  var bal=lsGet('anima_balance_'+_cid,0);lsSet('anima_balance_'+_cid,Math.max(0,bal-amt));
  alert('Yêu cầu rút '+fmt(amt)+'đ đã được gửi!');closeModal();render();
};

function modalCustDetail(idx){
  var c=_customers[idx];if(!c) return '<h3>Không tìm thấy</h3><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Đóng</button></div>';
  var custOrders=_orders.filter(function(o){return(o.customer_phone||o.phone)===c.phone;});
  var h='<h3>'+esc(c.name)+' <span class="ca-tier ca-tier-'+c.tier+'">'+c.tier+'</span></h3>';
  h+='<p style="font-size:12px;color:var(--text3)">'+esc(c.phone)+' &middot; Tổng chi: '+fmt(c.totalSpend)+'đ &middot; '+c.orders+' đơn</p>';
  h+='<div style="margin-top:12px"><table class="ca-tbl"><tr><th>Mã</th><th>Tổng</th><th>Trạng Thái</th><th>Ngày</th></tr>';
  custOrders.forEach(function(o){
    h+='<tr><td>'+esc(o.id||o._id||'-')+'</td><td>'+fmt(o.total||o.amount||0)+'đ</td><td><span class="ca-status" style="background:'+statusColor(o.status,ORDER_STATUSES)+'22;color:'+statusColor(o.status,ORDER_STATUSES)+'">'+statusLabel(o.status,ORDER_STATUSES)+'</span></td><td>'+fmtD(o.created_at)+'</td></tr>';
  });
  h+='</table></div><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Đóng</button></div>';
  return h;
}

function modalAddStaff(){
  return '<h3>Thêm Nhân Viên</h3><label>Tên</label><input id="msName"><label>SĐT</label><input id="msPhone"><label>Vai trò</label><select id="msRole"><option value="staff">Nhân viên</option><option value="receptionist">Lễ tân</option><option value="accountant">Kế toán</option></select><div class="ca-modal-btns"><button class="ca-btn-outline" id="caModalClose">Hủy</button><button class="ca-btn" onclick="window._caSubmitStaff()">Thêm</button></div>';
}

window._caSubmitStaff=function(){
  var staff=lsGet('anima_staff_'+_cid,[]);
  staff.push({name:qs('#msName').value,phone:qs('#msPhone').value,role:qs('#msRole').value});
  lsSet('anima_staff_'+_cid,staff);closeModal();render();
};

// ── Search/filter binding (post-render) ──
var _searchTimer=null;
function bindSearchFilters(){
  var os=qs('#caOrdSearch');if(os){os.addEventListener('input',function(){
    clearTimeout(_searchTimer);var v=this.value.toLowerCase();
    _searchTimer=setTimeout(function(){filterOrders(v,qs('#caOrdFilter')?qs('#caOrdFilter').value:'');},200);
  });}
  var of=qs('#caOrdFilter');if(of){of.addEventListener('change',function(){
    filterOrders(qs('#caOrdSearch')?qs('#caOrdSearch').value.toLowerCase():'',this.value);
  });}
  var cs=qs('#caCustSearch');if(cs){cs.addEventListener('input',function(){
    clearTimeout(_searchTimer);var v=this.value.toLowerCase();
    _searchTimer=setTimeout(function(){filterCustomers(v);},200);
  });}
}

function filterOrders(search,status){
  var filtered=_orders.filter(function(o){
    if(status&&o.status!==status)return false;
    if(search){
      var s=(o.id||'')+(o.customer_name||o.name||'')+(o.customer_phone||o.phone||'');
      if(s.toLowerCase().indexOf(search)<0)return false;
    }
    return true;
  });
  var tbl=qs('.ca-card[style*="overflow-x"]',qs('#caMain'));
  if(tbl) tbl.innerHTML=ordersTable(filtered);
  // Re-bind change events
  qsa('select[data-change]',qs('#caMain')).forEach(function(sel){
    sel.addEventListener('change',function(){handleChange(this.dataset.change,this.value,this.dataset);});
  });
}

function filterCustomers(search){
  var filtered=_customers.filter(function(c){
    var s=(c.name||'')+(c.phone||'');
    return s.toLowerCase().indexOf(search)>=0;
  });
  var tbl=qs('.ca-card[style*="overflow-x"]',qs('#caMain'));
  if(!tbl)return;
  if(!filtered.length){tbl.innerHTML='<div class="ca-empty">Không tìm thấy</div>';return;}
  var h='<table class="ca-tbl"><tr><th>Tên</th><th>SĐT</th><th>Tổng Chi</th><th>Đơn</th><th>Lần Cuối</th><th>Hạng</th><th></th></tr>';
  filtered.forEach(function(c,i){
    var origIdx=_customers.indexOf(c);
    h+='<tr><td>'+esc(c.name)+'</td><td>'+esc(c.phone)+'</td><td>'+fmt(c.totalSpend)+'đ</td><td>'+c.orders+'</td><td>'+fmtD(c.lastVisit)+'</td><td><span class="ca-tier ca-tier-'+c.tier+'">'+c.tier+'</span></td><td><button class="ca-btn-outline ca-btn-sm" data-action="custDetail" data-idx="'+origIdx+'">Chi tiết</button></td></tr>';
  });
  tbl.innerHTML=h+'</table>';
  qsa('[data-action]',tbl).forEach(function(el){
    el.addEventListener('click',function(){handleAction(this.dataset.action,this.dataset);});
  });
}

// Override render to also bind search
var _origRender=render;
render=function(){
  _origRender.call(this);
  bindSearchFilters();
};

// ── Entry / Exit ──
window.openCenterAdminV2=function(centerId,centerName){
  _cid=centerId||'CTR-HN';_cname=centerName||'AnimaCare Center';
  _theme=lsGet('anima_theme','dark');
  if(qs('#centerAdm'))qs('#centerAdm').remove();
  injectCSS();loadData();renderShell();render();
  document.body.style.overflow='hidden';
};

window.closeCenterAdminV2=function(){
  var el=qs('#centerAdm');if(el)el.remove();
  document.body.style.overflow='';
};

})();
