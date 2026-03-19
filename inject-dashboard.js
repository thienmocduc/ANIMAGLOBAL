const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

const dashboard = `
<!-- ====== ADMIN DASHBOARD FULL ====== -->
<div id="adminDashboard" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;background:#060D12;overflow:hidden;font-family:Roboto,sans-serif;color:#E8F8F4;">
<style>
#adminDashboard *{box-sizing:border-box;margin:0;padding:0;}
.ad-side{position:fixed;left:0;top:0;bottom:0;width:260px;background:linear-gradient(180deg,#0A1218,#0D1820);border-right:1px solid rgba(0,200,150,.1);display:flex;flex-direction:column;z-index:12;transition:transform .3s;}
.ad-side-hd{padding:20px;border-bottom:1px solid rgba(0,200,150,.08);}
.ad-logo{display:flex;align-items:center;gap:10px;font-size:17px;font-weight:700;color:#00C896;}
.ad-logo svg{width:28px;height:28px;}
.ad-ubox{margin-top:14px;padding:10px 12px;border-radius:10px;background:rgba(0,200,150,.05);border:1px solid rgba(0,200,150,.08);}
.ad-uname{font-size:14px;font-weight:600;}
.ad-urole{font-size:10px;color:#00C896;text-transform:uppercase;letter-spacing:1.2px;margin-top:2px;}
.ad-nav{flex:1;overflow-y:auto;padding:12px 10px;}
.ad-nav::-webkit-scrollbar{width:4px;}.ad-nav::-webkit-scrollbar-thumb{background:rgba(0,200,150,.15);border-radius:4px;}
.ad-sec{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#4A6860;padding:14px 14px 5px;font-weight:700;}
.ad-ni{display:flex;align-items:center;gap:11px;padding:10px 14px;border-radius:10px;cursor:pointer;color:#8AA8A0;font-size:13.5px;transition:all .2s;border:1px solid transparent;margin-bottom:1px;background:none;}
.ad-ni:hover{background:rgba(0,200,150,.06);color:#C8E8E0;}
.ad-ni.act{background:rgba(0,200,150,.1);color:#00C896;border-color:rgba(0,200,150,.15);font-weight:600;}
.ad-ni svg{width:19px;height:19px;flex-shrink:0;opacity:.65;}
.ad-ni.act svg{opacity:1;}
.ad-side-ft{padding:14px 10px;border-top:1px solid rgba(0,200,150,.08);}
.ad-logout{display:flex;align-items:center;gap:9px;width:100%;padding:10px 14px;background:rgba(255,70,70,.06);border:1px solid rgba(255,70,70,.12);color:#FF6B6B;border-radius:10px;cursor:pointer;font-size:13px;font-family:inherit;transition:all .2s;}
.ad-logout:hover{background:rgba(255,70,70,.14);}
.ad-main{margin-left:260px;height:100vh;overflow-y:auto;background:#060D12;}
.ad-top{position:sticky;top:0;z-index:8;display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:rgba(6,13,18,.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(0,200,150,.06);}
.ad-top h1{font-size:20px;font-weight:700;}
.ad-top-act{display:flex;align-items:center;gap:10px;}
.ad-pg{padding:20px 28px 60px;}
.ad-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:24px;}
.ad-sc{background:linear-gradient(135deg,rgba(10,18,24,.95),rgba(13,24,32,.95));border:1px solid rgba(0,200,150,.08);border-radius:14px;padding:18px;position:relative;overflow:hidden;}
.ad-sc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--ac,#00C896);}
.ad-sc .val{font-size:26px;font-weight:700;margin:8px 0 2px;}
.ad-sc .lbl{font-size:11px;color:#4A6860;text-transform:uppercase;letter-spacing:.5px;}
.ad-sc .chg{font-size:11px;margin-top:6px;}
.ad-sc .chg.up{color:#00C896;}.ad-sc .chg.dn{color:#FF6B6B;}
.ad-card{background:linear-gradient(135deg,rgba(10,18,24,.95),rgba(13,24,32,.95));border:1px solid rgba(0,200,150,.08);border-radius:14px;padding:22px;margin-bottom:18px;}
.ad-card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.ad-card-tt{font-size:15px;font-weight:600;}
.ad-tbl{width:100%;border-collapse:collapse;font-size:13px;}
.ad-tbl th{text-align:left;padding:10px 14px;color:#4A6860;font-weight:700;text-transform:uppercase;font-size:10.5px;letter-spacing:.6px;border-bottom:1px solid rgba(0,200,150,.08);}
.ad-tbl td{padding:10px 14px;border-bottom:1px solid rgba(0,200,150,.04);color:#A8C8C0;}
.ad-tbl tr:hover td{background:rgba(0,200,150,.02);}
.ad-bdg{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:600;letter-spacing:.3px;}
.ad-bg{background:rgba(0,200,150,.1);color:#00C896;}
.ad-by{background:rgba(255,200,0,.1);color:#E8B800;}
.ad-br{background:rgba(255,70,70,.1);color:#FF6B6B;}
.ad-bb{background:rgba(100,150,255,.1);color:#6496FF;}
.ad-bp{background:rgba(123,95,255,.1);color:#7B5FFF;}
.ad-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .2s;}
.ad-btn1{background:linear-gradient(135deg,#00C896,#00E5A8);color:#000;font-weight:700;}
.ad-btn1:hover{box-shadow:0 0 20px rgba(0,200,150,.35);}
.ad-btn2{background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.12);color:#00C896;}
.ad-btn2:hover{background:rgba(0,200,150,.12);}
.ad-g2{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.ad-srch{display:flex;align-items:center;gap:8px;background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.08);border-radius:10px;padding:7px 12px;}
.ad-srch input{background:none;border:none;outline:none;color:#E8F8F4;font-size:13px;font-family:inherit;width:160px;}
.ad-srch input::placeholder{color:#4A6860;}
.ad-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#00C896,#7B5FFF);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#000;flex-shrink:0;}
.ad-prog{height:5px;border-radius:3px;background:rgba(0,200,150,.08);overflow:hidden;}
.ad-prof{height:100%;border-radius:3px;background:linear-gradient(90deg,#00C896,#00E5A8);transition:width .6s;}
.ad-empty{text-align:center;padding:40px 20px;color:#4A6860;}
.ad-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:20;display:none;align-items:center;justify-content:center;}
.ad-modal-bg.show{display:flex;}
.ad-modal{background:#0D1820;border:1px solid rgba(0,200,150,.12);border-radius:16px;padding:24px;width:92%;max-width:520px;max-height:80vh;overflow-y:auto;}
.ad-modal h3{font-size:17px;margin-bottom:18px;}
.ad-fg{margin-bottom:14px;}
.ad-fg label{display:block;font-size:11px;color:#4A6860;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px;font-weight:600;}
.ad-fg input,.ad-fg select,.ad-fg textarea{width:100%;padding:9px 12px;background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.1);border-radius:8px;color:#E8F8F4;font-size:13px;font-family:inherit;outline:none;}
.ad-fg input:focus,.ad-fg select:focus,.ad-fg textarea:focus{border-color:rgba(0,200,150,.3);}
.ad-fg textarea{resize:vertical;min-height:70px;}
.ad-fg select option{background:#0D1820;}
.ad-factions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px;}
.ad-mnu-btn{display:none;position:fixed;top:12px;left:12px;z-index:13;width:38px;height:38px;border-radius:10px;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.12);color:#00C896;cursor:pointer;align-items:center;justify-content:center;font-size:18px;}
.ad-tabs{display:flex;gap:3px;background:rgba(0,200,150,.03);border-radius:10px;padding:3px;margin-bottom:16px;}
.ad-tab{padding:7px 14px;border-radius:8px;font-size:12.5px;color:#4A6860;cursor:pointer;border:none;background:none;font-family:inherit;transition:all .2s;}
.ad-tab.act{background:rgba(0,200,150,.1);color:#00C896;font-weight:600;}
.ad-notif{position:fixed;top:20px;right:20px;z-index:30;background:#0D1820;border:1px solid rgba(0,200,150,.2);border-radius:12px;padding:14px 20px;color:#00C896;font-size:13px;box-shadow:0 8px 32px rgba(0,0,0,.4);transform:translateX(120%);transition:transform .3s;max-width:320px;}
.ad-notif.show{transform:translateX(0);}
@media(max-width:768px){
  .ad-side{transform:translateX(-100%);}.ad-side.open{transform:translateX(0);}
  .ad-main{margin-left:0;}
  .ad-mnu-btn{display:flex;}
  .ad-g2{grid-template-columns:1fr;}
  .ad-top{padding:14px 14px 14px 56px;}
  .ad-pg{padding:14px 14px 60px;}
  .ad-stats{grid-template-columns:repeat(auto-fit,minmax(140px,1fr));}
}
</style>

<button class="ad-mnu-btn" onclick="document.querySelector('.ad-side').classList.toggle('open')">&#9776;</button>

<nav class="ad-side" id="adSidebar">
<div class="ad-side-hd">
<div class="ad-logo">
<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#00C896" stroke-width="2"/><path d="M10 22l6-14 6 14" stroke="#00C896" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="12" r="2.5" fill="#00C896"/></svg>
AnimaCare Admin
</div>
<div class="ad-ubox">
<div class="ad-uname" id="adUName">Admin</div>
<div class="ad-urole" id="adURole">Superadmin</div>
</div>
</div>
<div class="ad-nav" id="adNavList">
<div class="ad-sec">OVERVIEW</div>
<div class="ad-ni act" onclick="adGo(this,'dash')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg><span>Dashboard</span></div>
<div class="ad-ni" onclick="adGo(this,'analytics')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg><span>Analytics</span></div>
<div class="ad-sec">MANAGEMENT</div>
<div class="ad-ni" onclick="adGo(this,'bookings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>Bookings</span></div>
<div class="ad-ni" onclick="adGo(this,'customers')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg><span>Customers</span></div>
<div class="ad-ni" onclick="adGo(this,'pets')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="4.5" r="1.8"/><circle cx="16" cy="4.5" r="1.8"/><circle cx="4.5" cy="10" r="1.8"/><circle cx="19.5" cy="10" r="1.8"/><path d="M12 22c-4.5 0-7.5-2.5-7.5-5.5 0-2.5 2-4 3.5-5 1.5-1 2.5-2.5 2.5-4.5"/><path d="M12 22c4.5 0 7.5-2.5 7.5-5.5 0-2.5-2-4-3.5-5"/></svg><span>Pets</span></div>
<div class="ad-ni" onclick="adGo(this,'orders')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><span>Orders</span></div>
<div class="ad-ni" onclick="adGo(this,'inventory')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/><polyline points="3.3,7 12,12 20.7,7"/><line x1="12" y1="22" x2="12" y2="12"/></svg><span>Inventory</span></div>
<div class="ad-sec">CENTERS</div>
<div class="ad-ni" onclick="adGo(this,'centers')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg><span>Centers</span></div>
<div class="ad-ni" onclick="adGo(this,'staff')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg><span>Staff</span></div>
<div class="ad-sec">SYSTEM</div>
<div class="ad-ni" onclick="adGo(this,'settings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg><span>Settings</span></div>
<div class="ad-ni" onclick="adGo(this,'audit')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>Audit Log</span></div>
</div>
<div class="ad-side-ft">
<button class="ad-logout" onclick="adLogout()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout</button>
</div>
</nav>

<div class="ad-main" id="adMain">
<div class="ad-top"><h1 id="adTitle">Dashboard</h1>
<div class="ad-top-act">
<div class="ad-srch"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Search..." id="adSearchInput"></div>
<button class="ad-btn ad-btn2" onclick="adRefresh()" title="Refresh"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg></button>
</div></div>
<div class="ad-pg" id="adPage"></div>
</div>

<div class="ad-modal-bg" id="adModalBg" onclick="if(event.target===this)adCloseModal()"><div class="ad-modal" id="adModalBox"></div></div>
<div class="ad-notif" id="adNotif"></div>
</div>

<script>
(function(){
var D={
stats:{bookings:1247,bkC:12.5,customers:3892,cuC:8.3,revenue:156800000,rvC:15.2,pets:5621,ptC:6.7,orders:89,orC:-3.2,staff:48,stC:4.2,centers:6,ctC:0,inventory:1234,ivC:2.1},
bookings:[
{id:'BK-2601',cust:'Nguy\\u1EC5n V\\u0103n An',pet:'Milo (Golden)',svc:'Kh\\u00E1m t\\u1ED5ng qu\\u00E1t',dt:'18/03/2026 09:00',st:'confirmed',ctr:'HCM-Q1'},
{id:'BK-2602',cust:'Tr\\u1EA7n Th\\u1ECB B\\u00ECnh',pet:'Luna (M\\u00E8o Anh)',svc:'Ti\\u00EAm ph\\u00F2ng',dt:'18/03/2026 10:30',st:'pending',ctr:'HCM-Q7'},
{id:'BK-2603',cust:'L\\u00EA Ho\\u00E0ng C\\u01B0\\u1EDDng',pet:'Buddy (Husky)',svc:'Ph\\u1EABu thu\\u1EADt',dt:'18/03/2026 14:00',st:'confirmed',ctr:'HN-CG'},
{id:'BK-2604',cust:'Ph\\u1EA1m Minh D\\u0169ng',pet:'Kitty (M\\u00E8o Ba T\\u01B0)',svc:'Spa & Grooming',dt:'19/03/2026 08:00',st:'pending',ctr:'HCM-Q1'},
{id:'BK-2605',cust:'Ho\\u00E0ng Th\\u1ECB E',pet:'Rex (Corgi)',svc:'X\\u00E9t nghi\\u1EC7m',dt:'19/03/2026 11:00',st:'cancelled',ctr:'\\u0110N'},
{id:'BK-2606',cust:'V\\u00F5 V\\u0103n Ph\\u00FAc',pet:'Mimi (Scottish)',svc:'Si\\u00EAu \\u00E2m',dt:'20/03/2026 09:30',st:'confirmed',ctr:'HCM-Q7'},
{id:'BK-2607',cust:'\\u0110\\u1ED7 Th\\u1ECB Giang',pet:'Max (Poodle)',svc:'Kh\\u00E1m da li\\u1EC5u',dt:'20/03/2026 13:00',st:'pending',ctr:'HN-CG'},
{id:'BK-2608',cust:'B\\u00F9i Quang H\\u1EA3i',pet:'Nala (M\\u00E8o M\\u01B0\\u1EDDng)',svc:'Ti\\u00EAm ph\\u00F2ng',dt:'21/03/2026 10:00',st:'confirmed',ctr:'CT'}
],
customers:[
{id:'CU-001',name:'Nguy\\u1EC5n V\\u0103n An',email:'an.nguyen@email.com',phone:'0901 234 567',pets:3,visits:12,joined:'15/06/2025',spent:8500000,st:'vip'},
{id:'CU-002',name:'Tr\\u1EA7n Th\\u1ECB B\\u00ECnh',email:'binh.tran@email.com',phone:'0912 345 678',pets:1,visits:5,joined:'22/08/2025',spent:2100000,st:'active'},
{id:'CU-003',name:'L\\u00EA Ho\\u00E0ng C\\u01B0\\u1EDDng',email:'cuong.le@email.com',phone:'0923 456 789',pets:2,visits:8,joined:'10/04/2025',spent:4200000,st:'active'},
{id:'CU-004',name:'Ph\\u1EA1m Minh D\\u0169ng',email:'dung.pham@email.com',phone:'0934 567 890',pets:1,visits:3,joined:'01/11/2025',spent:950000,st:'inactive'},
{id:'CU-005',name:'Ho\\u00E0ng Th\\u1ECB E',email:'e.hoang@email.com',phone:'0945 678 901',pets:4,visits:20,joined:'05/12/2024',spent:15200000,st:'vip'},
{id:'CU-006',name:'V\\u00F5 V\\u0103n Ph\\u00FAc',email:'phuc.vo@email.com',phone:'0956 789 012',pets:2,visits:7,joined:'20/01/2025',spent:3800000,st:'active'}
],
orders:[
{id:'ORD-3401',cust:'Nguy\\u1EC5n V\\u0103n An',items:3,total:1250000,dt:'17/03/2026',st:'processing',pay:'paid'},
{id:'ORD-3402',cust:'Tr\\u1EA7n Th\\u1ECB B\\u00ECnh',items:1,total:450000,dt:'17/03/2026',st:'shipped',pay:'paid'},
{id:'ORD-3403',cust:'L\\u00EA Ho\\u00E0ng C\\u01B0\\u1EDDng',items:5,total:2100000,dt:'16/03/2026',st:'delivered',pay:'paid'},
{id:'ORD-3404',cust:'Ph\\u1EA1m Minh D\\u0169ng',items:2,total:780000,dt:'16/03/2026',st:'pending',pay:'unpaid'},
{id:'ORD-3405',cust:'Ho\\u00E0ng Th\\u1ECB E',items:4,total:3200000,dt:'15/03/2026',st:'delivered',pay:'paid'},
{id:'ORD-3406',cust:'V\\u00F5 V\\u0103n Ph\\u00FAc',items:1,total:180000,dt:'15/03/2026',st:'cancelled',pay:'refunded'}
],
centers:[
{id:'CTR-01',name:'AnimaCare HCM - Qu\\u1EADn 1',addr:'123 Nguy\\u1EC5n Hu\\u1EC7, Q.1',staff:12,cap:50,rate:4.8,st:'active',revenue:58000000},
{id:'CTR-02',name:'AnimaCare HCM - Qu\\u1EADn 7',addr:'456 Nguy\\u1EC5n Th\\u1ECB Th\\u1EADp, Q.7',staff:10,cap:40,rate:4.6,st:'active',revenue:42000000},
{id:'CTR-03',name:'AnimaCare HN - C\\u1EA7u Gi\\u1EA5y',addr:'789 Ph\\u1EA1m V\\u0103n \\u0110\\u1ED3ng, HN',staff:8,cap:35,rate:4.7,st:'active',revenue:35000000},
{id:'CTR-04',name:'AnimaCare \\u0110\\u00E0 N\\u1EB5ng',addr:'321 Tr\\u1EA7n Ph\\u00FA, \\u0110N',staff:6,cap:30,rate:4.5,st:'active',revenue:22000000},
{id:'CTR-05',name:'AnimaCare C\\u1EA7n Th\\u01A1',addr:'654 3/2, Ninh Ki\\u1EC1u',staff:5,cap:25,rate:4.4,st:'coming_soon',revenue:0},
{id:'CTR-06',name:'AnimaCare V\\u0169ng T\\u00E0u',addr:'987 L\\u00EA H\\u1ED3ng Phong',staff:7,cap:30,rate:4.3,st:'active',revenue:18500000}
],
staff:[
{id:'STF-001',name:'BS. Tr\\u1EA7n Minh Tu\\u1EA5n',role:'B\\u00E1c s\\u0129 tr\\u01B0\\u1EDFng',ctr:'HCM-Q1',email:'tuan@animacare.vn',phone:'0901 111 001',st:'active'},
{id:'STF-002',name:'BS. Nguy\\u1EC5n Th\\u1ECB Lan',role:'B\\u00E1c s\\u0129',ctr:'HCM-Q7',email:'lan@animacare.vn',phone:'0901 111 002',st:'active'},
{id:'STF-003',name:'Nguy\\u1EC5n V\\u0103n H\\u1EA3i',role:'K\\u1EF9 thu\\u1EADt vi\\u00EAn',ctr:'HN-CG',email:'hai@animacare.vn',phone:'0901 111 003',st:'active'},
{id:'STF-004',name:'L\\u00EA Th\\u1ECB Mai',role:'L\\u1EC5 t\\u00E2n',ctr:'HCM-Q1',email:'mai@animacare.vn',phone:'0901 111 004',st:'active'},
{id:'STF-005',name:'Ph\\u1EA1m Qu\\u1ED1c B\\u1EA3o',role:'Qu\\u1EA3n l\\u00FD',ctr:'\\u0110N',email:'bao@animacare.vn',phone:'0901 111 005',st:'on_leave'},
{id:'STF-006',name:'BS. Tr\\u1EA7n Th\\u1ECB H\\u01B0\\u01A1ng',role:'B\\u00E1c s\\u0129',ctr:'CT',email:'huong@animacare.vn',phone:'0901 111 006',st:'active'},
{id:'STF-007',name:'V\\u00F5 Minh \\u0110\\u1EA1t',role:'D\\u01B0\\u1EE3c s\\u0129',ctr:'HCM-Q1',email:'dat@animacare.vn',phone:'0901 111 007',st:'active'},
{id:'STF-008',name:'Ho\\u00E0ng Thanh T\\u00F9ng',role:'Groomer',ctr:'HCM-Q7',email:'tung@animacare.vn',phone:'0901 111 008',st:'active'}
],
inventory:[
{id:'INV-001',name:'Vaccine 5in1 (Ch\\u00F3)',sku:'VAC-D5IN1',stock:245,min:50,price:350000,cat:'vaccine'},
{id:'INV-002',name:'Vaccine FVRCP (M\\u00E8o)',sku:'VAC-CFVRCP',stock:180,min:40,price:300000,cat:'vaccine'},
{id:'INV-003',name:'Drontal Plus (T\\u1EA9y giun)',sku:'MED-DRON',stock:520,min:100,price:85000,cat:'medicine'},
{id:'INV-004',name:'Royal Canin Medium 2kg',sku:'FOOD-RC2K',stock:89,min:30,price:450000,cat:'food'},
{id:'INV-005',name:'Shampoo Spa Premium',sku:'SPA-SHP01',stock:15,min:20,price:180000,cat:'grooming'},
{id:'INV-006',name:'\\u1ED0ng nghe Littmann Classic',sku:'EQ-LITT01',stock:8,min:5,price:2500000,cat:'equipment'},
{id:'INV-007',name:'Kim ti\\u00EAm 5ml (h\\u1ED9p 100)',sku:'EQ-SYR5M',stock:32,min:10,price:120000,cat:'equipment'},
{id:'INV-008',name:'Amoxicillin 500mg',sku:'MED-AMX50',stock:4,min:20,price:95000,cat:'medicine'}
],
audit:[
{t:'18/03 08:45',u:'THIENMOCDUC',act:'login',d:'\\u0110\\u0103ng nh\\u1EADp admin qua OTP'},
{t:'18/03 08:30',u:'SA001',act:'update',d:'C\\u1EADp nh\\u1EADt l\\u1ECBch h\\u1EB9n BK-2603'},
{t:'17/03 17:20',u:'THIENMOCDUC',act:'create',d:'Th\\u00EAm nh\\u00E2n vi\\u00EAn STF-008'},
{t:'17/03 15:10',u:'SA001',act:'update',d:'Nh\\u1EADp kho INV-005 (+50)'},
{t:'17/03 10:00',u:'THIENMOCDUC',act:'export',d:'Xu\\u1EA5t b\\u00E1o c\\u00E1o th\\u00E1ng 3'},
{t:'16/03 16:30',u:'SA001',act:'delete',d:'X\\u00F3a l\\u1ECBch h\\u1EB9n BK-2590'},
{t:'16/03 09:00',u:'THIENMOCDUC',act:'login',d:'\\u0110\\u0103ng nh\\u1EADp admin qua OTP'},
{t:'15/03 14:22',u:'SA001',act:'create',d:'T\\u1EA1o \\u0111\\u01A1n h\\u00E0ng ORD-3405'}
]
};

function vnd(n){return new Intl.NumberFormat('vi-VN').format(n)+'\\u20AB';}
function bdg(s){var m={confirmed:'bg',active:'bg',paid:'bg',delivered:'bg',shipped:'bb',processing:'by',pending:'by',unpaid:'by',on_leave:'by',coming_soon:'by',cancelled:'br',inactive:'br',vip:'bp',refunded:'by'};
var l={confirmed:'X\\u00E1c nh\\u1EADn',pending:'Ch\\u1EDD duy\\u1EC7t',cancelled:'\\u0110\\u00E3 h\\u1EE7y',active:'Ho\\u1EA1t \\u0111\\u1ED9ng',inactive:'Ng\\u01B0ng',vip:'VIP',processing:'\\u0110ang x\\u1EED l\\u00FD',shipped:'\\u0110ang giao',delivered:'\\u0110\\u00E3 giao',paid:'\\u0110\\u00E3 TT',unpaid:'Ch\\u01B0a TT',on_leave:'Ngh\\u1EC9 ph\\u00E9p',coming_soon:'S\\u1EAFp m\\u1EDF',refunded:'Ho\\u00E0n ti\\u1EC1n'};
return '<span class="ad-bdg ad-'+(m[s]||'bb')+'">'+(l[s]||s)+'</span>';}

function adNotify(msg){var n=document.getElementById('adNotif');n.textContent=msg;n.classList.add('show');setTimeout(function(){n.classList.remove('show');},3000);}

window.adGo=function(el,pg){
document.querySelectorAll('.ad-ni').forEach(function(n){n.classList.remove('act');});
if(el)el.classList.add('act');
document.querySelector('.ad-side').classList.remove('open');
adRender(pg);
};

window.adLogout=function(){
localStorage.removeItem('anima_admin_user');
document.getElementById('adminDashboard').style.display='none';
document.body.style.overflow='';
if(typeof showToast==='function')showToast('\\u0110\\u00E3 \\u0111\\u0103ng xu\\u1EA5t','#FF6B6B');
};

window.adRefresh=function(){
var a=document.querySelector('.ad-ni.act');
if(a){var pg=a.getAttribute('onclick').match(/'(\\w+)'/);if(pg)adRender(pg[1]);}
adNotify('\\u0110\\u00E3 l\\u00E0m m\\u1EDBi d\\u1EEF li\\u1EC7u');
};

window.openAdminDashboard=function(){
var u;try{u=JSON.parse(localStorage.getItem('anima_admin_user'));}catch(e){return;}
if(!u)return;
document.getElementById('adUName').textContent=u.name||'Admin';
document.getElementById('adURole').textContent=u.role||'admin';
var dash=document.getElementById('adminDashboard');
dash.style.display='block';
document.body.style.overflow='hidden';
adRender('dash');
};

window.adShowModal=function(h){document.getElementById('adModalBox').innerHTML=h;document.getElementById('adModalBg').classList.add('show');};
window.adCloseModal=function(){document.getElementById('adModalBg').classList.remove('show');};

function adRender(pg){
var titles={dash:'Dashboard',analytics:'Analytics',bookings:'Bookings',customers:'Customers',pets:'Pets',orders:'Orders',inventory:'Inventory',centers:'Centers',staff:'Staff',settings:'Settings',audit:'Audit Log'};
document.getElementById('adTitle').textContent=titles[pg]||pg;
var fn={dash:pgDash,analytics:pgAnalytics,bookings:pgBookings,customers:pgCustomers,pets:pgPets,orders:pgOrders,inventory:pgInventory,centers:pgCenters,staff:pgStaff,settings:pgSettings,audit:pgAudit};
if(fn[pg])document.getElementById('adPage').innerHTML=fn[pg]();
}

function statCard(val,lbl,chg,clr){
var cls=chg>=0?'up':'dn',arr=chg>=0?'\\u2191':'\\u2193';
return '<div class="ad-sc" style="--ac:'+clr+'"><div class="lbl">'+lbl+'</div><div class="val">'+val+'</div><div class="chg '+cls+'">'+arr+' '+Math.abs(chg)+'% vs last month</div></div>';
}

function pgDash(){
var s=D.stats,h='<div class="ad-stats">';
h+=statCard(s.bookings.toLocaleString(),'BOOKINGS',s.bkC,'#00C896');
h+=statCard(s.customers.toLocaleString(),'CUSTOMERS',s.cuC,'#6496FF');
h+=statCard(vnd(s.revenue),'REVENUE',s.rvC,'#7B5FFF');
h+=statCard(s.pets.toLocaleString(),'PETS REGISTERED',s.ptC,'#FFC800');
h+='</div>';
h+='<div class="ad-g2">';
// Recent bookings
h+='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">Recent Bookings</span><button class="ad-btn ad-btn2" onclick="adGo(document.querySelectorAll(\\'.ad-ni\\')[3],\\'bookings\\')">View All</button></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Status</th></tr></thead><tbody>';
D.bookings.slice(0,5).forEach(function(b){h+='<tr><td style="color:#00C896;font-weight:600">'+b.id+'</td><td>'+b.cust+'</td><td>'+b.svc+'</td><td>'+bdg(b.st)+'</td></tr>';});
h+='</tbody></table></div></div>';
// Recent orders
h+='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">Recent Orders</span><button class="ad-btn ad-btn2" onclick="adGo(document.querySelectorAll(\\'.ad-ni\\')[6],\\'orders\\')">View All</button></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>';
D.orders.slice(0,5).forEach(function(o){h+='<tr><td style="color:#7B5FFF;font-weight:600">'+o.id+'</td><td>'+o.cust+'</td><td>'+vnd(o.total)+'</td><td>'+bdg(o.st)+'</td></tr>';});
h+='</tbody></table></div></div></div>';
// Low stock
var low=D.inventory.filter(function(i){return i.stock<=i.min;});
if(low.length){
h+='<div class="ad-card" style="border-color:rgba(255,70,70,.2)"><div class="ad-card-hd"><span class="ad-card-tt" style="color:#FF6B6B">\\u26A0 Low Stock Alert</span><span class="ad-bdg ad-br">'+low.length+' items</span></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>Product</th><th>Stock</th><th>Min</th><th>Level</th></tr></thead><tbody>';
low.forEach(function(i){var p=Math.round(i.stock/i.min*100);
h+='<tr><td>'+i.name+'</td><td style="color:#FF6B6B;font-weight:700">'+i.stock+'</td><td>'+i.min+'</td><td><div class="ad-prog" style="width:80px"><div class="ad-prof" style="width:'+p+'%;background:linear-gradient(90deg,#FF6B6B,#FFC800)"></div></div></td></tr>';});
h+='</tbody></table></div></div>';
}
return h;
}

function pgAnalytics(){
var s=D.stats,h='<div class="ad-stats">';
h+=statCard(vnd(s.revenue),'TOTAL REVENUE',s.rvC,'#00C896');
h+=statCard(s.orders,'ACTIVE ORDERS',s.orC,'#7B5FFF');
h+=statCard('+127','NEW CUSTOMERS',8.3,'#6496FF');
h+=statCard('96.5%','SATISFACTION RATE',1.2,'#FFC800');
h+='</div><div class="ad-g2">';
// Revenue chart
h+='<div class="ad-card"><div class="ad-card-tt">Monthly Revenue 2026</div><div style="display:flex;align-items:flex-end;gap:6px;height:200px;padding:20px 10px 0;margin-top:12px">';
[65,80,72,90,85,95,78,88,92,100,88,96].forEach(function(v,i){
var mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var isNow=i===2;
h+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:100%;height:'+v+'%;background:linear-gradient(180deg,'+(isNow?'#00C896':'rgba(0,200,150,.5)')+','+(isNow?'rgba(0,200,150,.6)':'rgba(0,200,150,.15)')+');border-radius:4px 4px 0 0;min-height:8px;position:relative">'+(isNow?'<div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:9px;color:#00C896;white-space:nowrap">'+vnd(s.revenue)+'</div>':'')+'</div><span style="font-size:9px;color:'+(isNow?'#00C896':'#4A6860')+'">'+mo[i]+'</span></div>';
});
h+='</div></div>';
// Service breakdown
h+='<div class="ad-card"><div class="ad-card-tt">Bookings by Service</div><div style="margin-top:16px;display:flex;flex-direction:column;gap:14px">';
[{n:'General Checkup',p:35,c:'#00C896'},{n:'Vaccination',p:25,c:'#6496FF'},{n:'Surgery',p:15,c:'#7B5FFF'},{n:'Spa & Grooming',p:15,c:'#FFC800'},{n:'Lab Tests',p:10,c:'#FF6B6B'}].forEach(function(s){
h+='<div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px"><span style="color:#A8C8C0">'+s.n+'</span><span style="color:'+s.c+';font-weight:700">'+s.p+'%</span></div><div class="ad-prog"><div class="ad-prof" style="width:'+s.p+'%;background:'+s.c+'"></div></div></div>';
});
h+='</div></div></div>';
// Center performance
h+='<div class="ad-card"><div class="ad-card-tt">Center Performance</div><div style="overflow-x:auto;margin-top:14px"><table class="ad-tbl"><thead><tr><th>Center</th><th>Staff</th><th>Rating</th><th>Revenue</th><th>Status</th></tr></thead><tbody>';
D.centers.forEach(function(c){
h+='<tr><td style="font-weight:600">'+c.name+'</td><td>'+c.staff+'</td><td style="color:#FFC800">\\u2605 '+c.rate+'</td><td>'+vnd(c.revenue)+'</td><td>'+bdg(c.st)+'</td></tr>';
});
h+='</tbody></table></div></div>';
return h;
}

function pgBookings(){
var h='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">All Bookings ('+D.bookings.length+')</span><button class="ad-btn ad-btn1" onclick="adNewBooking()">+ New Booking</button></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>ID</th><th>Customer</th><th>Pet</th><th>Service</th><th>Date/Time</th><th>Center</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
D.bookings.forEach(function(b){
h+='<tr><td style="color:#00C896;font-weight:600">'+b.id+'</td><td>'+b.cust+'</td><td>'+b.pet+'</td><td>'+b.svc+'</td><td style="white-space:nowrap">'+b.dt+'</td><td>'+b.ctr+'</td><td>'+bdg(b.st)+'</td><td><button class="ad-btn ad-btn2" style="padding:4px 10px;font-size:11px" onclick="adEditBooking(\\''+b.id+'\\')">Edit</button></td></tr>';
});
h+='</tbody></table></div></div>';
return h;
}

window.adNewBooking=function(){
adShowModal('<h3>New Booking</h3><div class="ad-fg"><label>Customer</label><select><option>Nguy\\u1EC5n V\\u0103n An</option><option>Tr\\u1EA7n Th\\u1ECB B\\u00ECnh</option><option>L\\u00EA Ho\\u00E0ng C\\u01B0\\u1EDDng</option><option>Ph\\u1EA1m Minh D\\u0169ng</option><option>Ho\\u00E0ng Th\\u1ECB E</option></select></div><div class="ad-fg"><label>Pet</label><input placeholder="e.g. Milo (Golden)"></div><div class="ad-fg"><label>Service</label><select><option>Kh\\u00E1m t\\u1ED5ng qu\\u00E1t</option><option>Ti\\u00EAm ph\\u00F2ng</option><option>Ph\\u1EABu thu\\u1EADt</option><option>Spa & Grooming</option><option>X\\u00E9t nghi\\u1EC7m</option><option>Si\\u00EAu \\u00E2m</option></select></div><div class="ad-fg"><label>Date & Time</label><input type="datetime-local"></div><div class="ad-fg"><label>Center</label><select><option>HCM-Q1</option><option>HCM-Q7</option><option>HN-CG</option><option>\\u0110N</option><option>CT</option><option>VT</option></select></div><div class="ad-fg"><label>Notes</label><textarea placeholder="Special instructions..."></textarea></div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Cancel</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Booking created!\\')">Save Booking</button></div>');
};
window.adEditBooking=function(id){
var b=D.bookings.find(function(x){return x.id===id;});if(!b)return;
adShowModal('<h3>Edit '+id+'</h3><div class="ad-fg"><label>Customer</label><input value="'+b.cust+'"></div><div class="ad-fg"><label>Pet</label><input value="'+b.pet+'"></div><div class="ad-fg"><label>Service</label><input value="'+b.svc+'"></div><div class="ad-fg"><label>Status</label><select><option'+(b.st==='confirmed'?' selected':'')+'>confirmed</option><option'+(b.st==='pending'?' selected':'')+'>pending</option><option'+(b.st==='cancelled'?' selected':'')+'>cancelled</option></select></div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Cancel</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Updated '+id+'\\')">Save</button></div>');
};

function pgCustomers(){
var h='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">Customers ('+D.customers.length+')</span><button class="ad-btn ad-btn1" onclick="adNewCustomer()">+ Add Customer</button></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Pets</th><th>Visits</th><th>Total Spent</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
D.customers.forEach(function(c){
h+='<tr><td style="color:#6496FF;font-weight:600">'+c.id+'</td><td><div style="display:flex;align-items:center;gap:8px"><div class="ad-av">'+c.name.charAt(0)+'</div>'+c.name+'</div></td><td style="font-size:12px;color:#607870">'+c.email+'</td><td>'+c.phone+'</td><td style="text-align:center">'+c.pets+'</td><td style="text-align:center">'+c.visits+'</td><td>'+vnd(c.spent)+'</td><td>'+bdg(c.st)+'</td><td><button class="ad-btn ad-btn2" style="padding:4px 10px;font-size:11px" onclick="adViewCustomer(\\''+c.id+'\\')">View</button></td></tr>';
});
h+='</tbody></table></div></div>';
return h;
}

window.adNewCustomer=function(){
adShowModal('<h3>Add Customer</h3><div class="ad-fg"><label>Full Name</label><input placeholder="Full name"></div><div class="ad-fg"><label>Email</label><input type="email" placeholder="email@example.com"></div><div class="ad-fg"><label>Phone</label><input placeholder="0901 234 567"></div><div class="ad-fg"><label>Notes</label><textarea placeholder="Notes..."></textarea></div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Cancel</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Customer added!\\')">Save</button></div>');
};
window.adViewCustomer=function(id){
var c=D.customers.find(function(x){return x.id===id;});if(!c)return;
adShowModal('<h3>'+c.name+'</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px"><div class="ad-fg"><label>Email</label><div style="color:#A8C8C0;font-size:13px">'+c.email+'</div></div><div class="ad-fg"><label>Phone</label><div style="color:#A8C8C0;font-size:13px">'+c.phone+'</div></div><div class="ad-fg"><label>Joined</label><div style="color:#A8C8C0;font-size:13px">'+c.joined+'</div></div><div class="ad-fg"><label>Total Spent</label><div style="color:#00C896;font-size:13px;font-weight:600">'+vnd(c.spent)+'</div></div><div class="ad-fg"><label>Pets</label><div style="color:#A8C8C0;font-size:13px">'+c.pets+' registered</div></div><div class="ad-fg"><label>Visits</label><div style="color:#A8C8C0;font-size:13px">'+c.visits+' visits</div></div></div><div style="display:flex;align-items:center;gap:8px">'+bdg(c.st)+'</div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Close</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Editing '+c.name+'\\')">Edit</button></div>');
};

function pgPets(){
var h='<div class="ad-stats">';
h+=statCard('5,621','TOTAL PETS',6.7,'#00C896');
h+=statCard('3,245','DOGS',5.2,'#6496FF');
h+=statCard('2,108','CATS',8.1,'#7B5FFF');
h+=statCard('268','OTHERS',3.4,'#FFC800');
h+='</div>';
h+='<div class="ad-card"><div class="ad-card-tt">Pet Management</div><div class="ad-empty" style="padding:50px"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.3;margin-bottom:12px"><circle cx="8" cy="4.5" r="1.8"/><circle cx="16" cy="4.5" r="1.8"/><circle cx="4.5" cy="10" r="1.8"/><circle cx="19.5" cy="10" r="1.8"/><path d="M12 22c-4.5 0-7.5-2.5-7.5-5.5 0-2.5 2-4 3.5-5"/></svg><p style="margin-bottom:6px">Pet data syncs from backend API</p><p style="font-size:12px">Connect the backend server to manage pet profiles, medical records, and vaccination schedules</p></div></div>';
return h;
}

function pgOrders(){
var h='<div class="ad-stats">';
h+=statCard(D.orders.length.toString(),'TOTAL ORDERS',-3.2,'#7B5FFF');
h+=statCard(D.orders.filter(function(o){return o.pay==='paid';}).length.toString(),'PAID',0,'#00C896');
h+=statCard(vnd(D.orders.reduce(function(a,o){return a+o.total;},0)),'TOTAL VALUE',12.5,'#6496FF');
h+='</div>';
h+='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">All Orders</span></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
D.orders.forEach(function(o){
h+='<tr><td style="color:#7B5FFF;font-weight:600">'+o.id+'</td><td>'+o.cust+'</td><td style="text-align:center">'+o.items+'</td><td>'+vnd(o.total)+'</td><td>'+o.dt+'</td><td>'+bdg(o.pay)+'</td><td>'+bdg(o.st)+'</td><td><button class="ad-btn ad-btn2" style="padding:4px 10px;font-size:11px" onclick="adNotify(\\'Viewing '+o.id+'\\')">View</button></td></tr>';
});
h+='</tbody></table></div></div>';
return h;
}

function pgInventory(){
var h='<div class="ad-stats">';
var low=D.inventory.filter(function(i){return i.stock<=i.min;});
h+=statCard(D.inventory.length.toString(),'TOTAL PRODUCTS',2.1,'#6496FF');
h+=statCard(D.inventory.reduce(function(a,i){return a+i.stock;},0).toLocaleString(),'TOTAL STOCK',5.3,'#00C896');
h+=statCard(low.length.toString(),'LOW STOCK ALERTS',low.length>0?-10:0,'#FF6B6B');
h+='</div>';
h+='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">Inventory</span><button class="ad-btn ad-btn1" onclick="adNewItem()">+ Add Product</button></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Stock</th><th>Min</th><th>Price</th><th>Level</th><th>Actions</th></tr></thead><tbody>';
var catL={vaccine:'Vaccine',medicine:'Medicine',food:'Food',grooming:'Grooming',equipment:'Equipment'};
D.inventory.forEach(function(i){
var isLow=i.stock<=i.min;
h+='<tr><td style="font-family:monospace;font-size:11px;color:#4A6860">'+i.sku+'</td><td>'+i.name+'</td><td><span class="ad-bdg ad-bb">'+(catL[i.cat]||i.cat)+'</span></td><td style="font-weight:700;color:'+(isLow?'#FF6B6B':'#E8F8F4')+'">'+i.stock+'</td><td>'+i.min+'</td><td>'+vnd(i.price)+'</td><td>'+(isLow?'<span class="ad-bdg ad-br">LOW</span>':'<span class="ad-bdg ad-bg">OK</span>')+'</td><td><button class="ad-btn ad-btn2" style="padding:4px 10px;font-size:11px" onclick="adEditItem(\\''+i.id+'\\')">Edit</button></td></tr>';
});
h+='</tbody></table></div></div>';
return h;
}
window.adNewItem=function(){
adShowModal('<h3>Add Product</h3><div class="ad-fg"><label>Product Name</label><input placeholder="Product name"></div><div class="ad-fg"><label>SKU</label><input placeholder="SKU-CODE"></div><div class="ad-fg"><label>Category</label><select><option>vaccine</option><option>medicine</option><option>food</option><option>grooming</option><option>equipment</option></select></div><div class="ad-fg"><label>Stock</label><input type="number" placeholder="0"></div><div class="ad-fg"><label>Min Stock</label><input type="number" placeholder="0"></div><div class="ad-fg"><label>Price (VND)</label><input type="number" placeholder="0"></div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Cancel</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Product added!\\')">Save</button></div>');
};
window.adEditItem=function(id){
var it=D.inventory.find(function(x){return x.id===id;});if(!it)return;
adShowModal('<h3>Edit '+it.name+'</h3><div class="ad-fg"><label>Product Name</label><input value="'+it.name+'"></div><div class="ad-fg"><label>SKU</label><input value="'+it.sku+'"></div><div class="ad-fg"><label>Current Stock</label><input type="number" value="'+it.stock+'"></div><div class="ad-fg"><label>Min Stock</label><input type="number" value="'+it.min+'"></div><div class="ad-fg"><label>Price (VND)</label><input type="number" value="'+it.price+'"></div><div class="ad-fg"><label>Quick Stock Update</label><div style="display:flex;gap:8px"><button class="ad-btn ad-btn2" onclick="adCloseModal();adNotify(\\'Stock +10 for '+it.name+'\\')">+10</button><button class="ad-btn ad-btn2" onclick="adCloseModal();adNotify(\\'Stock +50 for '+it.name+'\\')">+50</button><button class="ad-btn ad-btn2" onclick="adCloseModal();adNotify(\\'Stock +100 for '+it.name+'\\')">+100</button></div></div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Cancel</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Updated '+it.name+'\\')">Save</button></div>');
};

function pgCenters(){
var h='<div class="ad-stats">';
D.centers.forEach(function(c){
h+='<div class="ad-sc" style="--ac:'+(c.st==='active'?'#00C896':'#FFC800')+'"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'+bdg(c.st)+'<span style="font-size:12px;color:#FFC800;font-weight:600">\\u2605 '+c.rate+'</span></div><div style="font-size:15px;font-weight:600;color:#E8F8F4;margin-bottom:4px">'+c.name+'</div><div style="font-size:11.5px;color:#4A6860;margin-bottom:10px">'+c.addr+'</div><div style="display:flex;gap:14px;font-size:11.5px;color:#8AA8A0"><span>\\ud83d\\udc64 '+c.staff+'</span><span>\\ud83c\\udfe5 '+c.cap+'</span>'+(c.revenue?'<span>\\ud83d\\udcb0 '+vnd(c.revenue)+'</span>':'')+'</div></div>';
});
h+='</div>';
return h;
}

function pgStaff(){
var h='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">Staff ('+D.staff.length+')</span><button class="ad-btn ad-btn1" onclick="adNewStaff()">+ Add Staff</button></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Center</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
D.staff.forEach(function(s){
h+='<tr><td style="color:#7B5FFF;font-weight:600">'+s.id+'</td><td><div style="display:flex;align-items:center;gap:8px"><div class="ad-av">'+s.name.replace(/^BS\\. /,'').charAt(0)+'</div>'+s.name+'</div></td><td>'+s.role+'</td><td>'+s.ctr+'</td><td style="font-size:11.5px;color:#4A6860">'+s.email+'</td><td>'+s.phone+'</td><td>'+bdg(s.st)+'</td><td><button class="ad-btn ad-btn2" style="padding:4px 10px;font-size:11px" onclick="adEditStaff(\\''+s.id+'\\')">Edit</button></td></tr>';
});
h+='</tbody></table></div></div>';
return h;
}
window.adNewStaff=function(){
adShowModal('<h3>Add Staff Member</h3><div class="ad-fg"><label>Full Name</label><input placeholder="Full name"></div><div class="ad-fg"><label>Role</label><select><option>B\\u00E1c s\\u0129</option><option>K\\u1EF9 thu\\u1EADt vi\\u00EAn</option><option>L\\u1EC5 t\\u00E2n</option><option>Qu\\u1EA3n l\\u00FD</option><option>D\\u01B0\\u1EE3c s\\u0129</option><option>Groomer</option></select></div><div class="ad-fg"><label>Center</label><select><option>HCM-Q1</option><option>HCM-Q7</option><option>HN-CG</option><option>\\u0110N</option><option>CT</option><option>VT</option></select></div><div class="ad-fg"><label>Email</label><input type="email" placeholder="email@animacare.vn"></div><div class="ad-fg"><label>Phone</label><input placeholder="0901 xxx xxx"></div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Cancel</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Staff member added!\\')">Save</button></div>');
};
window.adEditStaff=function(id){
var s=D.staff.find(function(x){return x.id===id;});if(!s)return;
adShowModal('<h3>Edit '+s.name+'</h3><div class="ad-fg"><label>Name</label><input value="'+s.name+'"></div><div class="ad-fg"><label>Role</label><input value="'+s.role+'"></div><div class="ad-fg"><label>Center</label><input value="'+s.ctr+'"></div><div class="ad-fg"><label>Email</label><input value="'+s.email+'"></div><div class="ad-fg"><label>Phone</label><input value="'+s.phone+'"></div><div class="ad-fg"><label>Status</label><select><option'+(s.st==='active'?' selected':'')+'>active</option><option'+(s.st==='on_leave'?' selected':'')+'>on_leave</option><option>inactive</option></select></div><div class="ad-factions"><button class="ad-btn ad-btn2" onclick="adCloseModal()">Cancel</button><button class="ad-btn ad-btn1" onclick="adCloseModal();adNotify(\\'Updated '+s.name+'\\')">Save</button></div>');
};

function pgSettings(){
var h='<div class="ad-g2">';
h+='<div class="ad-card"><div class="ad-card-tt" style="margin-bottom:16px">General Settings</div>';
h+='<div class="ad-fg"><label>System Name</label><input value="AnimaCare Global"></div>';
h+='<div class="ad-fg"><label>Contact Email</label><input value="doanhnhancaotuan@gmail.com"></div>';
h+='<div class="ad-fg"><label>Default Language</label><select><option>Vietnamese</option><option>English</option></select></div>';
h+='<div class="ad-fg"><label>Timezone</label><select><option>Asia/Ho_Chi_Minh (GMT+7)</option><option>UTC</option></select></div>';
h+='<button class="ad-btn ad-btn1" onclick="adNotify(\\'Settings saved!\\')">Save Changes</button></div>';
h+='<div class="ad-card"><div class="ad-card-tt" style="margin-bottom:16px">Security</div>';
h+='<div class="ad-fg"><label>OTP Expiry (minutes)</label><input type="number" value="5"></div>';
h+='<div class="ad-fg"><label>Max OTP Attempts</label><input type="number" value="3"></div>';
h+='<div class="ad-fg"><label>Session Duration (minutes)</label><input type="number" value="60"></div>';
h+='<div class="ad-fg"><label>Two-Factor Auth</label><select><option>Required for all admins</option><option>Optional</option></select></div>';
h+='<button class="ad-btn ad-btn1" onclick="adNotify(\\'Security settings updated!\\')">Update</button></div></div>';
h+='<div class="ad-card"><div class="ad-card-tt" style="margin-bottom:16px">Email Configuration (EmailJS)</div>';
h+='<div class="ad-fg"><label>Service ID</label><input value="service_animacare" placeholder="EmailJS Service ID"></div>';
h+='<div class="ad-fg"><label>Template ID</label><input value="template_otp" placeholder="EmailJS Template ID"></div>';
h+='<div class="ad-fg"><label>Public Key</label><input value="" placeholder="EmailJS Public Key"></div>';
h+='<button class="ad-btn ad-btn1" onclick="adNotify(\\'Email config saved!\\')">Save Email Config</button></div>';
return h;
}

function pgAudit(){
var h='<div class="ad-card"><div class="ad-card-hd"><span class="ad-card-tt">Activity Log</span><button class="ad-btn ad-btn2" onclick="adNotify(\\'Exported audit log\\')">Export CSV</button></div>';
h+='<div style="overflow-x:auto"><table class="ad-tbl"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody>';
var actC={login:'bg',update:'bb',create:'bp',export:'by',delete:'br'};
D.audit.forEach(function(a){
h+='<tr><td style="color:#4A6860;font-size:12px;white-space:nowrap">'+a.t+'</td><td style="color:#00C896;font-weight:600">'+a.u+'</td><td><span class="ad-bdg ad-'+(actC[a.act]||'bb')+'">'+a.act.toUpperCase()+'</span></td><td>'+a.d+'</td></tr>';
});
h+='</tbody></table></div></div>';
return h;
}

// Auto-open if already logged in
(function check(){
var u;try{u=JSON.parse(localStorage.getItem('anima_admin_user'));}catch(e){}
if(u){
  if(document.readyState==='complete'||document.readyState==='interactive'){setTimeout(function(){openAdminDashboard();},300);}
  else{document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){openAdminDashboard();},300);});}
}
})();
})();
<` + `/script>
<!-- ====== END ADMIN DASHBOARD ====== -->
`;

// Insert before </body>
const insertIdx = content.lastIndexOf('</body>');
if (insertIdx === -1) { console.error('No </body> found'); process.exit(1); }
content = content.substring(0, insertIdx) + dashboard + '\n' + content.substring(insertIdx);
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('SUCCESS: Dashboard injected. New size:', content.length);
