// admin-dashboard-inject.js
// This script reads index.html and injects the admin dashboard HTML+CSS+JS
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// The dashboard HTML+CSS+JS block
const dashboardBlock = `

<!-- ==================== ADMIN DASHBOARD ==================== -->
<div id="adminDashboard" style="display:none;position:fixed;inset:0;z-index:10000;background:var(--blk,#000);overflow:hidden;font-family:'Roboto',sans-serif;">

<!-- Dashboard CSS -->
<style>
#adminDashboard{color:#E8F8F4;}
#adminDashboard *{box-sizing:border-box;}
.adm-sidebar{position:fixed;left:0;top:0;bottom:0;width:260px;background:linear-gradient(180deg,#0A1218 0%,#0D1820 100%);border-right:1px solid rgba(0,200,150,0.1);display:flex;flex-direction:column;z-index:10;transition:transform .3s;}
.adm-sidebar-header{padding:24px 20px;border-bottom:1px solid rgba(0,200,150,0.08);}
.adm-sidebar-logo{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;color:#00C896;}
.adm-sidebar-logo svg{width:32px;height:32px;}
.adm-sidebar-user{margin-top:16px;padding:12px;border-radius:10px;background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.08);}
.adm-sidebar-user .adm-user-name{font-size:14px;font-weight:600;color:#E8F8F4;}
.adm-sidebar-user .adm-user-role{font-size:11px;color:#00C896;text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
.adm-nav{flex:1;overflow-y:auto;padding:16px 12px;}
.adm-nav-item{display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:10px;cursor:pointer;color:#B8D8D0;font-size:14px;transition:all .2s;margin-bottom:2px;border:1px solid transparent;}
.adm-nav-item:hover{background:rgba(0,200,150,0.06);color:#E8F8F4;}
.adm-nav-item.active{background:rgba(0,200,150,0.1);color:#00C896;border-color:rgba(0,200,150,0.15);}
.adm-nav-item svg{width:20px;height:20px;flex-shrink:0;opacity:.7;}
.adm-nav-item.active svg{opacity:1;}
.adm-nav-section{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#607870;padding:16px 16px 6px;font-weight:600;}
.adm-sidebar-footer{padding:16px 12px;border-top:1px solid rgba(0,200,150,0.08);}
.adm-btn-logout{display:flex;align-items:center;gap:10px;width:100%;padding:10px 16px;background:rgba(255,70,70,0.08);border:1px solid rgba(255,70,70,0.15);color:#FF7070;border-radius:10px;cursor:pointer;font-size:13px;font-family:inherit;transition:all .2s;}
.adm-btn-logout:hover{background:rgba(255,70,70,0.15);}
.adm-main{margin-left:260px;height:100vh;overflow-y:auto;background:#060D12;}
.adm-topbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:rgba(6,13,18,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,200,150,0.06);}
.adm-topbar h1{font-size:22px;font-weight:700;color:#E8F8F4;margin:0;}
.adm-topbar-actions{display:flex;align-items:center;gap:12px;}
.adm-page{padding:24px 32px 60px;}
.adm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:28px;}
.adm-stat-card{background:linear-gradient(135deg,rgba(10,18,24,0.9),rgba(13,24,32,0.9));border:1px solid rgba(0,200,150,0.08);border-radius:14px;padding:20px;position:relative;overflow:hidden;}
.adm-stat-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--card-accent,#00C896),transparent);}
.adm-stat-card .adm-stat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.adm-stat-card .adm-stat-value{font-size:28px;font-weight:700;color:#E8F8F4;}
.adm-stat-card .adm-stat-label{font-size:12px;color:#607870;margin-top:4px;text-transform:uppercase;letter-spacing:.5px;}
.adm-stat-card .adm-stat-change{font-size:12px;margin-top:8px;}
.adm-stat-change.up{color:#00C896;}
.adm-stat-change.down{color:#FF7070;}
.adm-card{background:linear-gradient(135deg,rgba(10,18,24,0.9),rgba(13,24,32,0.9));border:1px solid rgba(0,200,150,0.08);border-radius:14px;padding:24px;margin-bottom:20px;}
.adm-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.adm-card-title{font-size:16px;font-weight:600;color:#E8F8F4;}
.adm-table-wrap{overflow-x:auto;}
.adm-table{width:100%;border-collapse:collapse;font-size:13px;}
.adm-table th{text-align:left;padding:8px 10px;color:#607870;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:.5px;border-bottom:1px solid rgba(0,200,150,0.08);}
.adm-table td{padding:8px 10px;border-bottom:1px solid rgba(0,200,150,0.04);color:#B8D8D0;font-size:12px;}
.adm-table tr:hover td{background:rgba(0,200,150,0.02);}
.adm-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.adm-badge-green{background:rgba(0,200,150,0.12);color:#00C896;}
.adm-badge-yellow{background:rgba(255,200,0,0.12);color:#FFC800;}
.adm-badge-red{background:rgba(255,70,70,0.12);color:#FF7070;}
.adm-badge-blue{background:rgba(100,150,255,0.12);color:#6496FF;}
.adm-badge-purple{background:rgba(123,95,255,0.12);color:#7B5FFF;}
.adm-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:none;font-family:inherit;transition:all .2s;}
.adm-btn-primary{background:linear-gradient(135deg,#00C896,#00E5A8);color:#000;font-weight:600;}
.adm-btn-primary:hover{box-shadow:0 0 20px rgba(0,200,150,0.3);}
.adm-btn-secondary{background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.15);color:#00C896;}
.adm-btn-secondary:hover{background:rgba(0,200,150,0.15);}
.adm-chart-placeholder{height:240px;border-radius:12px;background:rgba(0,200,150,0.03);border:1px dashed rgba(0,200,150,0.1);display:flex;align-items:center;justify-content:center;color:#607870;font-size:13px;}
.adm-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.adm-search-box{display:flex;align-items:center;gap:8px;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:8px 14px;}
.adm-search-box input{background:none;border:none;outline:none;color:#E8F8F4;font-size:13px;font-family:inherit;width:180px;}
.adm-search-box input::placeholder{color:#607870;}
.adm-search-box svg{width:16px;height:16px;opacity:.5;}
.adm-empty{text-align:center;padding:40px;color:#607870;}
.adm-empty svg{width:48px;height:48px;opacity:.3;margin-bottom:12px;}
.adm-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#00C896,#7B5FFF);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#000;}
.adm-menu-toggle{display:none;position:fixed;top:16px;left:16px;z-index:11;width:40px;height:40px;border-radius:10px;background:rgba(0,200,150,0.1);border:1px solid rgba(0,200,150,0.15);color:#00C896;cursor:pointer;align-items:center;justify-content:center;font-size:20px;}
@media(max-width:768px){
  .adm-sidebar{transform:translateX(-100%);}
  .adm-sidebar.open{transform:translateX(0);}
  .adm-main{margin-left:0;}
  .adm-menu-toggle{display:flex;}
  .adm-grid-2{grid-template-columns:1fr;}
  .adm-topbar{padding:16px 16px 16px 60px;}
  .adm-page{padding:16px 16px 60px;}
}
.adm-progress-bar{height:6px;border-radius:3px;background:rgba(0,200,150,0.1);overflow:hidden;}
.adm-progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#00C896,#00E5A8);transition:width .5s;}
.adm-tab-group{display:flex;gap:4px;background:rgba(0,200,150,0.04);border-radius:10px;padding:4px;}
.adm-tab{padding:8px 16px;border-radius:8px;font-size:13px;color:#607870;cursor:pointer;transition:all .2s;border:none;background:none;font-family:inherit;}
.adm-tab.active{background:rgba(0,200,150,0.1);color:#00C896;font-weight:600;}
.adm-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:20;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s;}
.adm-modal-overlay.show{opacity:1;pointer-events:auto;}
.adm-modal{background:#0D1820;border:1px solid rgba(0,200,150,0.12);border-radius:16px;padding:28px;width:90%;max-width:500px;max-height:80vh;overflow-y:auto;}
.adm-modal h3{font-size:18px;margin:0 0 20px;color:#E8F8F4;}
.adm-form-group{margin-bottom:16px;}
.adm-form-group label{display:block;font-size:12px;color:#607870;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;}
.adm-form-group input,.adm-form-group select,.adm-form-group textarea{width:100%;padding:10px 14px;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:8px;color:#E8F8F4;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;}
.adm-form-group input:focus,.adm-form-group select:focus,.adm-form-group textarea:focus{border-color:rgba(0,200,150,0.3);}
.adm-form-group textarea{resize:vertical;min-height:80px;}
.adm-form-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;}
</style>

<!-- Mobile menu toggle -->
<button class="adm-menu-toggle" onclick="document.querySelector('.adm-sidebar').classList.toggle('open')">&#9776;</button>

<!-- Sidebar -->
<nav class="adm-sidebar">
  <div class="adm-sidebar-header">
    <div class="adm-sidebar-logo">
      <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#00C896" stroke-width="2"/><path d="M10 20l6-12 6 12" stroke="#00C896" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="13" r="2" fill="#00C896"/></svg>
      AnimaCare Admin
    </div>
    <div class="adm-sidebar-user">
      <div class="adm-user-name" id="admUserName">Admin</div>
      <div class="adm-user-role" id="admUserRole">Superadmin</div>
    </div>
  </div>
  <div class="adm-nav">
    <div class="adm-nav-section" data-vi="T\u1ED5ng quan" data-en="Overview">Overview</div>
    <div class="adm-nav-item active" data-page="dashboard" onclick="admNav(this,'dashboard')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      <span data-vi="B\u1EA3ng \u0111i\u1EC1u khi\u1EC3n" data-en="Dashboard">Dashboard</span>
    </div>
    <div class="adm-nav-item" data-page="analytics" onclick="admNav(this,'analytics')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
      <span data-vi="Ph\u00E2n t\u00EDch" data-en="Analytics">Analytics</span>
    </div>
    <div class="adm-nav-section" data-vi="Qu\u1EA3n l\u00FD" data-en="Management">Management</div>
    <div class="adm-nav-item" data-page="bookings" onclick="admNav(this,'bookings')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span data-vi="L\u1ECBch h\u1EB9n" data-en="Bookings">Bookings</span>
    </div>
    <div class="adm-nav-item" data-page="customers" onclick="admNav(this,'customers')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
      <span data-vi="Kh\u00E1ch h\u00E0ng" data-en="Customers">Customers</span>
    </div>
    <div class="adm-nav-item" data-page="pets" onclick="admNav(this,'pets')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21c-4 0-7-2-7-5 0-2 1.5-3.5 3-4.5C9.5 10.5 11 9 11 7c0-1-.5-2-1.5-2.5"/><circle cx="8" cy="4" r="1.5"/><circle cx="15" cy="4" r="1.5"/><circle cx="5" cy="9" r="1.5"/><circle cx="19" cy="9" r="1.5"/><path d="M12 21c4 0 7-2 7-5 0-2-1.5-3.5-3-4.5"/></svg>
      <span data-vi="Th\u00FA c\u01B0ng" data-en="Pets">Pets</span>
    </div>
    <div class="adm-nav-item" data-page="orders" onclick="admNav(this,'orders')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      <span data-vi="\u0110\u01A1n h\u00E0ng" data-en="Orders">Orders</span>
    </div>
    <div class="adm-nav-item" data-page="crm" onclick="admNav(this,'crm')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
      <span data-vi="CRM Leads" data-en="CRM Leads">CRM Leads</span>
    </div>
    <div class="adm-nav-item" data-page="bookings_mgmt" onclick="admNav(this,'bookings_mgmt')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <span data-vi="L\u1ECBch H\u1EB9n" data-en="Bookings">Lịch Hẹn</span>
    </div>
    <div class="adm-nav-item" data-page="inventory" onclick="admNav(this,'inventory')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      <span data-vi="Kho h\u00E0ng" data-en="Inventory">Inventory</span>
    </div>
    <div class="adm-nav-section" data-vi="T\u00E0i ch\u00EDnh" data-en="Finance">Tài chính</div>
    <div class="adm-nav-item" data-page="wallets" onclick="admNav(this,'wallets')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><circle cx="18" cy="15" r="1.5"/></svg>
      <span data-vi="V\u00ED & R\u00FAt ti\u1EC1n" data-en="Wallets">Ví & Rút tiền</span>
    </div>
    <div class="adm-nav-section" data-vi="Nh\u00E2n s\u1EF1" data-en="HR">Nhân sự</div>
    <div class="adm-nav-item" data-page="kyc" onclick="admNav(this,'kyc')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span data-vi="X\u00E1c minh KTV" data-en="KTV Verify">Xác minh KTV</span>
    </div>
    <div class="adm-nav-section" data-vi="Trung t\u00E2m" data-en="Centers">Centers</div>
    <div class="adm-nav-item" data-page="centers" onclick="admNav(this,'centers')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
      <span data-vi="Chi nh\u00E1nh" data-en="Centers">Centers</span>
    </div>
    <div class="adm-nav-item" data-page="staff" onclick="admNav(this,'staff')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
      <span data-vi="Nh\u00E2n vi\u00EAn" data-en="Staff">Staff</span>
    </div>
    <div class="adm-nav-section" data-vi="H\u1EC7 th\u1ED1ng" data-en="System">System</div>
    <div class="adm-nav-item" data-page="settings" onclick="admNav(this,'settings')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      <span data-vi="C\u00E0i \u0111\u1EB7t" data-en="Settings">Settings</span>
    </div>
    <div class="adm-nav-item" data-page="audit" onclick="admNav(this,'audit')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      <span data-vi="Nh\u1EADt k\u00FD" data-en="Audit Log">Audit Log</span>
    </div>
  </div>
  <div class="adm-sidebar-footer">
    <button class="adm-btn-logout" onclick="admLogout()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      <span data-vi="\u0110\u0103ng xu\u1EA5t" data-en="Logout">Logout</span>
    </button>
  </div>
</nav>

<!-- Main Content -->
<div class="adm-main">
  <div class="adm-topbar">
    <h1 id="admPageTitle" data-vi="B\u1EA3ng \u0111i\u1EC1u khi\u1EC3n" data-en="Dashboard">Dashboard</h1>
    <div class="adm-topbar-actions">
      <div class="adm-search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="admSearch" placeholder="Search..." data-vi-placeholder="T\u00ECm ki\u1EBFm..." data-en-placeholder="Search...">
      </div>
      <button class="adm-btn adm-btn-secondary" onclick="admRefreshData()" title="Refresh">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
      </button>
    </div>
  </div>

  <div class="adm-page" id="admPageContent">
    <!-- Pages injected by JS -->
  </div>
</div>

<!-- Modal overlay -->
<div class="adm-modal-overlay" id="admModal">
  <div class="adm-modal" id="admModalBody"></div>
</div>

</div>
<!-- END ADMIN DASHBOARD -->

<script>
// ==================== ADMIN DASHBOARD JS ====================
(function(){
'use strict';

// ── Demo Data ────────────────────────────────────────────
var DEMO = {
  stats: {
    totalBookings: 1247, bookingsChange: 12.5,
    totalCustomers: 3892, customersChange: 8.3,
    totalRevenue: 156800000, revenueChange: 15.2,
    totalPets: 5621, petsChange: 6.7,
    activeOrders: 89, ordersChange: -3.2,
    totalStaff: 48, staffChange: 4.2,
    totalCenters: 6, centersChange: 0,
    inventoryItems: 1234, inventoryChange: 2.1
  },
  bookings: [
    {id:'BK-001',customer:'Nguy\u1EC5n V\u0103n An',pet:'Milo (Ch\u00F3)',service:'Kh\u00E1m t\u1ED5ng qu\u00E1t',date:'2026-03-18 09:00',status:'confirmed',center:'HCM - Q1'},
    {id:'BK-002',customer:'Tr\u1EA7n Th\u1ECB B\u00ECnh',pet:'Luna (M\u00E8o)',service:'Ti\u00EAm ph\u00F2ng',date:'2026-03-18 10:30',status:'pending',center:'HCM - Q7'},
    {id:'BK-003',customer:'L\u00EA Ho\u00E0ng C\u01B0\u1EDDng',pet:'Buddy (Ch\u00F3)',service:'Ph\u1EABu thu\u1EADt',date:'2026-03-18 14:00',status:'confirmed',center:'HN - C\u1EA7u Gi\u1EA5y'},
    {id:'BK-004',customer:'Ph\u1EA1m Minh D\u0169ng',pet:'Kitty (M\u00E8o)',service:'Spa & Grooming',date:'2026-03-19 08:00',status:'pending',center:'HCM - Q1'},
    {id:'BK-005',customer:'Ho\u00E0ng Th\u1ECB E',pet:'Rex (Ch\u00F3)',service:'Xet nghi\u1EC7m m\u00E1u',date:'2026-03-19 11:00',status:'cancelled',center:'\u0110\u00E0 N\u1EB5ng'},
    {id:'BK-006',customer:'V\u00F5 V\u0103n F',pet:'Mimi (M\u00E8o)',service:'Si\u00EAu \u00E2m',date:'2026-03-20 09:30',status:'confirmed',center:'HCM - Q7'}
  ],
  customers: [
    {id:'CU-001',name:'Nguy\u1EC5n V\u0103n An',email:'an.nguyen@email.com',phone:'0901234567',pets:3,visits:12,joined:'2025-06-15',status:'active'},
    {id:'CU-002',name:'Tr\u1EA7n Th\u1ECB B\u00ECnh',email:'binh.tran@email.com',phone:'0912345678',pets:1,visits:5,joined:'2025-08-22',status:'active'},
    {id:'CU-003',name:'L\u00EA Ho\u00E0ng C\u01B0\u1EDDng',email:'cuong.le@email.com',phone:'0923456789',pets:2,visits:8,joined:'2025-04-10',status:'active'},
    {id:'CU-004',name:'Ph\u1EA1m Minh D\u0169ng',email:'dung.pham@email.com',phone:'0934567890',pets:1,visits:3,joined:'2025-11-01',status:'inactive'},
    {id:'CU-005',name:'Ho\u00E0ng Th\u1ECB E',email:'e.hoang@email.com',phone:'0945678901',pets:4,visits:20,joined:'2024-12-05',status:'vip'}
  ],
  orders: [
    {id:'ORD-001',customer:'Nguy\u1EC5n V\u0103n An',items:3,total:1250000,date:'2026-03-17',status:'processing',payment:'paid'},
    {id:'ORD-002',customer:'Tr\u1EA7n Th\u1ECB B\u00ECnh',items:1,total:450000,date:'2026-03-17',status:'shipped',payment:'paid'},
    {id:'ORD-003',customer:'L\u00EA Ho\u00E0ng C\u01B0\u1EDDng',items:5,total:2100000,date:'2026-03-16',status:'delivered',payment:'paid'},
    {id:'ORD-004',customer:'Ph\u1EA1m Minh D\u0169ng',items:2,total:780000,date:'2026-03-16',status:'pending',payment:'unpaid'},
    {id:'ORD-005',customer:'Ho\u00E0ng Th\u1ECB E',items:4,total:3200000,date:'2026-03-15',status:'delivered',payment:'paid'}
  ],
  centers: [
    {id:'CTR-001',name:'AnimaCare HCM - Qu\u1EADn 1',address:'123 Nguy\u1EC5n Hu\u1EC7, Q.1, HCM',staff:12,capacity:50,rating:4.8,status:'active'},
    {id:'CTR-002',name:'AnimaCare HCM - Qu\u1EADn 7',address:'456 Nguy\u1EC5n Th\u1ECB Th\u1EADp, Q.7, HCM',staff:10,capacity:40,rating:4.6,status:'active'},
    {id:'CTR-003',name:'AnimaCare H\u00E0 N\u1ED9i - C\u1EA7u Gi\u1EA5y',address:'789 Ph\u1EA1m V\u0103n \u0110\u1ED3ng, CG, HN',staff:8,capacity:35,rating:4.7,status:'active'},
    {id:'CTR-004',name:'AnimaCare \u0110\u00E0 N\u1EB5ng',address:'321 Tr\u1EA7n Ph\u00FA, H\u1EA3i Ch\u00E2u, \u0110N',staff:6,capacity:30,rating:4.5,status:'active'},
    {id:'CTR-005',name:'AnimaCare C\u1EA7n Th\u01A1',address:'654 3/2, Ninh Ki\u1EC1u, CT',staff:5,capacity:25,rating:4.4,status:'coming_soon'},
    {id:'CTR-006',name:'AnimaCare V\u0169ng T\u00E0u',address:'987 L\u00EA H\u1ED3ng Phong, VT',staff:7,capacity:30,rating:4.3,status:'active'}
  ],
  staff: [
    {id:'STF-001',name:'BS. Tr\u1EA7n Minh Tu\u1EA5n',role:'B\u00E1c s\u0129 tr\u01B0\u1EDFng',center:'HCM - Q1',email:'tuan.tran@animacare.global',status:'active'},
    {id:'STF-002',name:'BS. Nguy\u1EC5n Th\u1ECB Lan',role:'B\u00E1c s\u0129',center:'HCM - Q7',email:'lan.nguyen@animacare.global',status:'active'},
    {id:'STF-003',name:'Nguy\u1EC5n V\u0103n H\u1EA3i',role:'K\u1EF9 thu\u1EADt vi\u00EAn',center:'HN - CG',email:'hai.nguyen@animacare.global',status:'active'},
    {id:'STF-004',name:'L\u00EA Th\u1ECB Mai',role:'L\u1EC5 t\u00E2n',center:'HCM - Q1',email:'mai.le@animacare.global',status:'active'},
    {id:'STF-005',name:'Ph\u1EA1m Qu\u1ED1c B\u1EA3o',role:'Qu\u1EA3n l\u00FD',center:'\u0110\u00E0 N\u1EB5ng',email:'bao.pham@animacare.global',status:'on_leave'}
  ],
  inventory: [
    {id:'INV-001',name:'Vaccine 5 in 1 (Ch\u00F3)',sku:'VAC-DOG-5IN1',stock:245,min_stock:50,price:350000,category:'vaccine'},
    {id:'INV-002',name:'Vaccine FVRCP (M\u00E8o)',sku:'VAC-CAT-FVRCP',stock:180,min_stock:40,price:300000,category:'vaccine'},
    {id:'INV-003',name:'Thu\u1ED1c t\u1EA9y giun Drontal',sku:'MED-DRON-01',stock:520,min_stock:100,price:85000,category:'medicine'},
    {id:'INV-004',name:'Th\u1EE9c \u0103n Royal Canin 2kg',sku:'FOOD-RC-2KG',stock:89,min_stock:30,price:450000,category:'food'},
    {id:'INV-005',name:'Shampoo Spa Premium',sku:'SPA-SHP-01',stock:15,min_stock:20,price:180000,category:'grooming'},
    {id:'INV-006',name:'\u1ED0ng nghe Littmann',sku:'EQUIP-LIT-01',stock:8,min_stock:5,price:2500000,category:'equipment'}
  ],
  auditLog: [
    {time:'2026-03-18 08:45',user:'THIENMOCDUC',action:'login','detail':'Admin login via OTP'},
    {time:'2026-03-18 08:30',user:'SA001',action:'update','detail':'Updated booking BK-003 status'},
    {time:'2026-03-17 17:20',user:'THIENMOCDUC',action:'create','detail':'Created new staff member STF-005'},
    {time:'2026-03-17 15:10',user:'SA001',action:'update','detail':'Updated inventory INV-005 stock'},
    {time:'2026-03-17 10:00',user:'THIENMOCDUC',action:'export','detail':'Exported monthly report'}
  ]
};

function formatVND(n){return new Intl.NumberFormat('vi-VN').format(n)+' \u20AB';}
function statusBadge(s){
  var map={confirmed:'green',active:'green',paid:'green',delivered:'green',shipped:'blue',
    pending:'yellow',processing:'yellow',unpaid:'yellow',on_leave:'yellow',coming_soon:'yellow',
    cancelled:'red',inactive:'red',vip:'purple'};
  var cls=map[s]||'blue';
  var labels={confirmed:'X\u00E1c nh\u1EADn',pending:'Ch\u1EDD',cancelled:'H\u1EE7y',active:'Ho\u1EA1t \u0111\u1ED9ng',inactive:'Ng\u01B0ng',
    vip:'VIP',processing:'\u0110ang x\u1EED l\u00FD',shipped:'\u0110ang giao',delivered:'\u0110\u00E3 giao',paid:'\u0110\u00E3 thanh to\u00E1n',
    unpaid:'Ch\u01B0a TT',on_leave:'Ngh\u1EC9 ph\u00E9p',coming_soon:'S\u1EAFp m\u1EDF'};
  return '<span class="adm-badge adm-badge-'+cls+'">'+(labels[s]||s)+'</span>';
}

// ── Navigation ───────────────────────────────────────────
window.admNav = function(el, page){
  document.querySelectorAll('.adm-nav-item').forEach(function(n){n.classList.remove('active');});
  el.classList.add('active');
  document.querySelector('.adm-sidebar').classList.remove('open');
  renderPage(page);
};

window.admLogout = function(){
  localStorage.removeItem('anima_admin_user');
  document.getElementById('adminDashboard').style.display='none';
  document.body.style.overflow='';
  if(typeof showToast==='function') showToast(lang==='vi'?'\u0110\u00E3 \u0111\u0103ng xu\u1EA5t':'Logged out','#FF7070');
};

window.admRefreshData = function(){
  var active = document.querySelector('.adm-nav-item.active');
  if(active) renderPage(active.getAttribute('data-page'));
};

window.openAdminDashboard = function(){
  var u = JSON.parse(localStorage.getItem('anima_admin_user')||'null');
  if(!u) return;
  document.getElementById('admUserName').textContent = u.name||'Admin';
  document.getElementById('admUserRole').textContent = u.role||'admin';
  document.getElementById('adminDashboard').style.display='block';
  document.body.style.overflow='hidden';
  renderPage('dashboard');
  // Apply language
  if(typeof applyTranslations==='function') applyTranslations();
};

window.admShowModal = function(html){
  document.getElementById('admModalBody').innerHTML=html;
  document.getElementById('admModal').classList.add('show');
};
window.admCloseModal = function(){
  document.getElementById('admModal').classList.remove('show');
};
document.getElementById('admModal').addEventListener('click',function(e){
  if(e.target===this) admCloseModal();
});

// ── Page Renderer ────────────────────────────────────────
function renderPage(page){
  var titles={
    crm:{vi:'CRM Leads',en:'CRM Leads'},
    dashboard:{vi:'B\u1EA3ng \u0111i\u1EC1u khi\u1EC3n',en:'Dashboard'},
    analytics:{vi:'Ph\u00E2n t\u00EDch',en:'Analytics'},
    bookings:{vi:'Qu\u1EA3n l\u00FD l\u1ECBch h\u1EB9n',en:'Manage Bookings'},
    bookings_mgmt:{vi:'L\u1ECBch H\u1EB9n (Supabase)',en:'Bookings (Supabase)'},
    wallets:{vi:'V\u00ED & Rút Ti\u1EC1n',en:'Wallets & Withdrawals'},
    kyc:{vi:'X\u00E1c Minh KTV',en:'KTV Verification'},
    customers:{vi:'Qu\u1EA3n l\u00FD kh\u00E1ch h\u00E0ng',en:'Manage Customers'},
    pets:{vi:'Qu\u1EA3n l\u00FD th\u00FA c\u01B0ng',en:'Manage Pets'},
    orders:{vi:'Qu\u1EA3n l\u00FD \u0111\u01A1n h\u00E0ng',en:'Manage Orders'},
    inventory:{vi:'Qu\u1EA3n l\u00FD kho',en:'Inventory Management'},
    centers:{vi:'Qu\u1EA3n l\u00FD chi nh\u00E1nh',en:'Center Management'},
    staff:{vi:'Qu\u1EA3n l\u00FD nh\u00E2n vi\u00EAn',en:'Staff Management'},
    settings:{vi:'C\u00E0i \u0111\u1EB7t h\u1EC7 th\u1ED1ng',en:'System Settings'},
    audit:{vi:'Nh\u1EADt k\u00FD h\u1EC7 th\u1ED1ng',en:'Audit Log'}
  };
  var t=titles[page]||{vi:page,en:page};
  var titleEl=document.getElementById('admPageTitle');
  titleEl.textContent=(typeof lang!=='undefined'&&lang==='vi')?t.vi:t.en;
  titleEl.setAttribute('data-vi',t.vi);
  titleEl.setAttribute('data-en',t.en);

  var renderers={
    crm:renderCRM,
    dashboard:renderDashboard,analytics:renderAnalytics,bookings:renderBookings,
    customers:renderCustomers,pets:renderPets,orders:renderOrders,
    inventory:renderInventory,centers:renderCenters,staff:renderStaff,
    settings:renderSettings,audit:renderAudit,
    bookings_mgmt:function(){if(typeof renderAdmBookings==='function')renderAdmBookings();},
    wallets:function(){if(typeof renderAdmWallets==='function')renderAdmWallets();},
    kyc:function(){if(typeof renderAdmKYC==='function')renderAdmKYC();}
  };
  var fn=renderers[page];
  if(fn) fn();
}

// ── Dashboard Page ───────────────────────────────────────
function renderDashboard(){
  var s=DEMO.stats;
  var html='<div class="adm-stats">';
  var cards=[
    {icon:'M4 4h16v16H4z|M4 10h16',label:{vi:'L\u1ECBch h\u1EB9n',en:'Bookings'},value:s.totalBookings,change:s.bookingsChange,color:'#00C896'},
    {icon:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2|M9 7m-4 0a4 4 0 108 0 4 4 0 10-8 0',label:{vi:'Kh\u00E1ch h\u00E0ng',en:'Customers'},value:s.totalCustomers,change:s.customersChange,color:'#6496FF'},
    {icon:'M12 1v22|M5 12l7-7 7 7',label:{vi:'Doanh thu',en:'Revenue'},value:formatVND(s.totalRevenue),change:s.revenueChange,color:'#7B5FFF'},
    {icon:'M12 21c-4 0-7-2-7-5|M8 4m-1.5 0a1.5 1.5 0 103 0',label:{vi:'Th\u00FA c\u01B0ng',en:'Pets'},value:s.totalPets,change:s.petsChange,color:'#FFC800'}
  ];
  cards.forEach(function(c){
    var changeClass=c.change>=0?'up':'down';
    var arrow=c.change>=0?'\u2191':'\u2193';
    html+='<div class="adm-stat-card" style="--card-accent:'+c.color+'"><div class="adm-stat-icon" style="background:'+c.color+'15;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="'+c.color+'" stroke-width="2"><path d="'+c.icon.split('|')[0]+'"/></svg></div><div class="adm-stat-value">'+c.value+'</div><div class="adm-stat-label" data-vi="'+c.label.vi+'" data-en="'+c.label.en+'">'+c.label.vi+'</div><div class="adm-stat-change '+changeClass+'">'+arrow+' '+Math.abs(c.change)+'%</div></div>';
  });
  html+='</div>';

  // Recent bookings
  html+='<div class="adm-grid-2"><div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="L\u1ECBch h\u1EB9n g\u1EA7n \u0111\u00E2y" data-en="Recent Bookings">L\u1ECBch h\u1EB9n g\u1EA7n \u0111\u00E2y</span><button class="adm-btn adm-btn-secondary" onclick="admNav(document.querySelector(\'[data-page=bookings]\'),\'bookings\')">Xem t\u1EA5t c\u1EA3</button></div><div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>ID</th><th data-vi="Kh\u00E1ch" data-en="Customer">Kh\u00E1ch</th><th data-vi="D\u1ECBch v\u1EE5" data-en="Service">D\u1ECBch v\u1EE5</th><th data-vi="Tr\u1EA1ng th\u00E1i" data-en="Status">Tr\u1EA1ng th\u00E1i</th></tr></thead><tbody>';
  DEMO.bookings.slice(0,4).forEach(function(b){
    html+='<tr><td style="color:#00C896;font-weight:600">'+b.id+'</td><td>'+b.customer+'</td><td>'+b.service+'</td><td>'+statusBadge(b.status)+'</td></tr>';
  });
  html+='</tbody></table></div></div>';

  // Recent orders
  html+='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="\u0110\u01A1n h\u00E0ng g\u1EA7n \u0111\u00E2y" data-en="Recent Orders">\u0110\u01A1n h\u00E0ng g\u1EA7n \u0111\u00E2y</span><button class="adm-btn adm-btn-secondary" onclick="admNav(document.querySelector(\'[data-page=orders]\'),\'orders\')">Xem t\u1EA5t c\u1EA3</button></div><div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>ID</th><th data-vi="Kh\u00E1ch" data-en="Customer">Kh\u00E1ch</th><th data-vi="T\u1ED5ng" data-en="Total">T\u1ED5ng</th><th data-vi="Tr\u1EA1ng th\u00E1i" data-en="Status">Tr\u1EA1ng th\u00E1i</th></tr></thead><tbody>';
  DEMO.orders.slice(0,4).forEach(function(o){
    html+='<tr><td style="color:#7B5FFF;font-weight:600">'+o.id+'</td><td>'+o.customer+'</td><td>'+formatVND(o.total)+'</td><td>'+statusBadge(o.status)+'</td></tr>';
  });
  html+='</tbody></table></div></div></div>';

  // Low stock alert
  var lowStock=DEMO.inventory.filter(function(i){return i.stock<=i.min_stock;});
  if(lowStock.length>0){
    html+='<div class="adm-card" style="border-color:rgba(255,70,70,0.2)"><div class="adm-card-header"><span class="adm-card-title" style="color:#FF7070" data-vi="\u26A0 C\u1EA3nh b\u00E1o t\u1ED3n kho th\u1EA5p" data-en="\u26A0 Low Stock Alert">\u26A0 C\u1EA3nh b\u00E1o t\u1ED3n kho th\u1EA5p</span></div><div class="adm-table-wrap"><table class="adm-table"><thead><tr><th data-vi="S\u1EA3n ph\u1EA9m" data-en="Product">S\u1EA3n ph\u1EA9m</th><th data-vi="T\u1ED3n kho" data-en="Stock">T\u1ED3n kho</th><th data-vi="T\u1ED1i thi\u1EC3u" data-en="Minimum">T\u1ED1i thi\u1EC3u</th><th data-vi="M\u1EE9c" data-en="Level">M\u1EE9c</th></tr></thead><tbody>';
    lowStock.forEach(function(i){
      var pct=Math.round(i.stock/i.min_stock*100);
      html+='<tr><td>'+i.name+'</td><td style="color:#FF7070;font-weight:600">'+i.stock+'</td><td>'+i.min_stock+'</td><td><div class="adm-progress-bar" style="width:80px"><div class="adm-progress-fill" style="width:'+pct+'%;background:linear-gradient(90deg,#FF7070,#FFC800)"></div></div></td></tr>';
    });
    html+='</tbody></table></div></div>';
  }

  document.getElementById('admPageContent').innerHTML=html;
}

// ── Analytics Page ───────────────────────────────────────
function renderAnalytics(){
  var html='<div class="adm-stats">';
  var s=DEMO.stats;
  [{l:'T\u1ED5ng doanh thu',v:formatVND(s.totalRevenue),c:s.revenueChange,clr:'#00C896'},
   {l:'\u0110\u01A1n h\u00E0ng',v:s.activeOrders,c:s.ordersChange,clr:'#7B5FFF'},
   {l:'Kh\u00E1ch m\u1EDBi th\u00E1ng n\u00E0y',v:'+127',c:8.3,clr:'#6496FF'},
   {l:'T\u1EF7 l\u1EC7 h\u00E0i l\u00F2ng',v:'96.5%',c:1.2,clr:'#FFC800'}
  ].forEach(function(c){
    var cls=c.c>=0?'up':'down',arr=c.c>=0?'\u2191':'\u2193';
    html+='<div class="adm-stat-card" style="--card-accent:'+c.clr+'"><div class="adm-stat-value">'+c.v+'</div><div class="adm-stat-label">'+c.l+'</div><div class="adm-stat-change '+cls+'">'+arr+' '+Math.abs(c.c)+'%</div></div>';
  });
  html+='</div>';
  html+='<div class="adm-grid-2"><div class="adm-card"><div class="adm-card-title" data-vi="Doanh thu theo th\u00E1ng" data-en="Monthly Revenue">Doanh thu theo th\u00E1ng</div><div class="adm-chart-placeholder" style="margin-top:16px" data-vi="Bi\u1EC3u \u0111\u1ED3 doanh thu s\u1EBD hi\u1EC3n th\u1ECB khi k\u1EBFt n\u1ED1i backend" data-en="Revenue chart available when backend connected">';
  // Simple bar chart via CSS
  html+='<div style="display:flex;align-items:flex-end;gap:8px;height:180px;padding:0 20px;width:100%">';
  [65,80,72,90,85,95,78,88,92,100,88,96].forEach(function(v,i){
    var months=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    html+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:100%;height:'+v+'%;background:linear-gradient(180deg,#00C896,rgba(0,200,150,0.3));border-radius:4px 4px 0 0;min-height:10px"></div><span style="font-size:10px;color:#607870">'+months[i]+'</span></div>';
  });
  html+='</div></div></div>';
  html+='<div class="adm-card"><div class="adm-card-title" data-vi="L\u1ECBch h\u1EB9n theo d\u1ECBch v\u1EE5" data-en="Bookings by Service">L\u1ECBch h\u1EB9n theo d\u1ECBch v\u1EE5</div><div style="margin-top:16px;display:flex;flex-direction:column;gap:12px">';
  [{n:'Kh\u00E1m t\u1ED5ng qu\u00E1t',p:35,c:'#00C896'},{n:'Ti\u00EAm ph\u00F2ng',p:25,c:'#6496FF'},{n:'Ph\u1EABu thu\u1EADt',p:15,c:'#7B5FFF'},{n:'Spa & Grooming',p:15,c:'#FFC800'},{n:'X\u00E9t nghi\u1EC7m',p:10,c:'#FF7070'}].forEach(function(s){
    html+='<div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span style="color:#B8D8D0">'+s.n+'</span><span style="color:'+s.c+';font-weight:600">'+s.p+'%</span></div><div class="adm-progress-bar"><div class="adm-progress-fill" style="width:'+s.p+'%;background:'+s.c+'"></div></div></div>';
  });
  html+='</div></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ── REAL Analytics (Supabase + Chart.js) ──────────────────
window.renderAdmAnalytics = function(){
  var el=document.getElementById('admPageContent');if(!el)return;
  el.innerHTML='<div style="text-align:center;padding:40px;color:#607870">Loading analytics...</div>';

  Promise.all([
    window.AnimaOrders?AnimaOrders.getAll({limit:500}):Promise.resolve([]),
    window.AnimaBookings?AnimaBookings.getAll({limit:500}):Promise.resolve([]),
    window.AnimaCRM?AnimaCRM.getLeads({limit:500}):Promise.resolve([]),
    window.AnimaRatings?AnimaRatings.getAll({limit:500}):Promise.resolve([])
  ]).then(function(res){
    var orders=res[0]||[],bookings=res[1]||[],leads=res[2]||[],ratings=res[3]||[];
    var totalRev=orders.reduce(function(s,o){return s+(o.total_amount||0);},0);
    var totalBookRev=bookings.reduce(function(s,b){return s+(b.service_price||0);},0);
    var gmv=totalRev+totalBookRev;
    var aov=orders.length?(totalRev/orders.length):0;
    var avgRating=ratings.length?(ratings.reduce(function(s,r){return s+r.stars;},0)/ratings.length):0;

    var h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:20px">';
    [{l:'GMV',v:formatVND(gmv),c:'#00C896'},{l:'Đơn hàng',v:orders.length,c:'#60A5FA'},{l:'Lịch hẹn',v:bookings.length,c:'#9B82FF'},{l:'CRM Leads',v:leads.length,c:'#FFB800'},{l:'AOV',v:formatVND(Math.round(aov)),c:'#FF6B9D'},{l:'Rating TB',v:avgRating.toFixed(1)+'⭐',c:'#FFC800'}].forEach(function(k){
      h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:18px;font-weight:700;color:'+k.c+'">'+k.v+'</div><div style="font-size:10px;color:#607870;margin-top:2px">'+k.l+'</div></div>';
    });
    h+='</div>';

    // Charts
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
    h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px"><div style="font-size:13px;font-weight:600;color:#F8F2E0;margin-bottom:12px">Doanh thu theo ngày (7 ngày)</div><canvas id="chartRevenue" height="180"></canvas></div>';
    h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px"><div style="font-size:13px;font-weight:600;color:#F8F2E0;margin-bottom:12px">CRM Funnel</div><canvas id="chartFunnel" height="180"></canvas></div>';
    h+='</div>';

    // Lead source breakdown
    h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px"><div style="font-size:13px;font-weight:600;color:#F8F2E0;margin-bottom:12px">Nguồn Lead</div><canvas id="chartSources" height="120"></canvas></div>';

    el.innerHTML=h;

    // Render charts with Chart.js
    if(typeof Chart!=='undefined'){
      Chart.defaults.color='#607870';Chart.defaults.borderColor='rgba(0,200,150,.08)';

      // Revenue by day (last 7 days)
      var days=[],revByDay=[];
      for(var d=6;d>=0;d--){
        var dt=new Date();dt.setDate(dt.getDate()-d);
        var key=dt.toISOString().split('T')[0];
        days.push(dt.toLocaleDateString('vi-VN',{day:'numeric',month:'short'}));
        var dayRev=orders.filter(function(o){return o.created_at&&o.created_at.startsWith(key);}).reduce(function(s,o){return s+(o.total_amount||0);},0);
        dayRev+=bookings.filter(function(b){return b.created_at&&b.created_at.startsWith(key);}).reduce(function(s,b){return s+(b.service_price||0);},0);
        revByDay.push(dayRev);
      }
      new Chart(document.getElementById('chartRevenue'),{type:'bar',data:{labels:days,datasets:[{label:'Doanh thu',data:revByDay,backgroundColor:'rgba(0,200,150,.6)',borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:function(v){return(v/1000000).toFixed(1)+'M';}}}}}});

      // CRM Funnel
      var funnelData=['new','contacted','qualified','proposal','won'].map(function(s){return leads.filter(function(l){return l.status===s;}).length;});
      new Chart(document.getElementById('chartFunnel'),{type:'bar',data:{labels:['Mới','Liên hệ','Chất lượng','Đề xuất','Thành công'],datasets:[{data:funnelData,backgroundColor:['#60A5FA','#FFB800','#9B82FF','#FF6B9D','#22C55E'],borderRadius:4}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}}}});

      // Lead sources
      var sources={};leads.forEach(function(l){var s=l.source||'unknown';sources[s]=(sources[s]||0)+1;});
      new Chart(document.getElementById('chartSources'),{type:'doughnut',data:{labels:Object.keys(sources),datasets:[{data:Object.values(sources),backgroundColor:['#00C896','#60A5FA','#9B82FF','#FFB800','#FF6B9D','#22C55E']}]},options:{responsive:true,plugins:{legend:{position:'right'}}}});
    }
  });
};
var renderAnalyticsOld=renderAnalytics;

// ── Real Inventory (Supabase) ──────────────────
window.renderAdmInventory = function(){
  var el=document.getElementById('admPageContent');if(!el)return;
  el.innerHTML='<div style="text-align:center;padding:40px;color:#607870">Loading inventory...</div>';
  if(!window.AnimaInventory){el.innerHTML='Supabase not connected';return;}

  AnimaInventory.getAll({limit:200}).then(function(items){
    var lowStock=items.filter(function(i){return i.stock<=i.min_stock;}).length;
    var totalValue=items.reduce(function(s,i){return s+(i.stock||0)*(i.price||0);},0);

    var h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">';
    [{l:'Tổng SKU',v:items.length,c:'#00C896'},{l:'Cảnh báo tồn',v:lowStock,c:'#FF4D6D'},{l:'Giá trị kho',v:formatVND(totalValue),c:'#FFB800'}].forEach(function(k){
      h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:700;color:'+k.c+'">'+k.v+'</div><div style="font-size:9px;color:#607870">'+k.l+'</div></div>';
    });
    h+='</div>';

    h+='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title">Kho hàng ('+items.length+')</span><button class="adm-btn adm-btn-primary" onclick="window._admAddStock()" style="font-size:11px;padding:4px 10px">+ Nhập kho</button></div>';
    h+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>SKU</th><th>Sản phẩm</th><th>Cơ sở</th><th>Tồn kho</th><th>Tối thiểu</th><th>Giá</th><th>Trạng thái</th></tr></thead><tbody>';
    if(!items.length) h+='<tr><td colspan="7" style="text-align:center;padding:30px;color:#607870">Chưa có hàng trong kho</td></tr>';
    items.forEach(function(i){
      var isLow=i.stock<=i.min_stock;
      h+='<tr><td style="font-family:monospace;font-size:11px;color:#7B5FFF">'+i.sku+'</td><td>'+i.product_name+'</td><td style="font-size:11px">'+i.center_id+'</td><td style="font-weight:600;color:'+(isLow?'#FF4D6D':'#F8F2E0')+'">'+i.stock+' '+i.unit+'</td><td>'+i.min_stock+'</td><td style="color:#FFB800">'+formatVND(i.price)+'</td><td>'+(isLow?'<span class="adm-badge adm-badge-red">Thấp</span>':'<span class="adm-badge adm-badge-green">OK</span>')+'</td></tr>';
    });
    h+='</tbody></table></div></div>';
    el.innerHTML=h;
  });
};

window._admAddStock = function(){
  var sku=prompt('SKU (VD: A119-10):');if(!sku)return;
  var name=prompt('Tên sản phẩm:');if(!name)return;
  var center=prompt('Mã cơ sở (VD: CTR-HN):');if(!center)return;
  var stock=parseInt(prompt('Số lượng nhập:')||'0');
  var price=parseInt(prompt('Giá (VNĐ):')||'0');
  AnimaInventory.create({center_id:center,sku:sku,product_name:name,stock:stock,min_stock:5,price:price,unit:'hộp'}).then(function(){
    AnimaInventory.addTransaction({center_id:center,sku:sku,type:'in',quantity:stock,note:'Nhập kho mới',created_by:'admin'});
    renderAdmInventory();
  });
};

// ── Bookings Page ────────────────────────────────────────
function renderBookings(){
  var html='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="T\u1EA5t c\u1EA3 l\u1ECBch h\u1EB9n" data-en="All Bookings">T\u1EA5t c\u1EA3 l\u1ECBch h\u1EB9n</span><button class="adm-btn adm-btn-primary" onclick="admShowBookingForm()">+ Th\u00EAm m\u1EDBi</button></div>';
  html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>ID</th><th data-vi="Kh\u00E1ch h\u00E0ng" data-en="Customer">Kh\u00E1ch h\u00E0ng</th><th data-vi="Th\u00FA c\u01B0ng" data-en="Pet">Th\u00FA c\u01B0ng</th><th data-vi="D\u1ECBch v\u1EE5" data-en="Service">D\u1ECBch v\u1EE5</th><th data-vi="Ng\u00E0y gi\u1EDD" data-en="Date/Time">Ng\u00E0y gi\u1EDD</th><th data-vi="Chi nh\u00E1nh" data-en="Center">Chi nh\u00E1nh</th><th data-vi="Tr\u1EA1ng th\u00E1i" data-en="Status">Tr\u1EA1ng th\u00E1i</th></tr></thead><tbody>';
  DEMO.bookings.forEach(function(b){
    html+='<tr><td style="color:#00C896;font-weight:600">'+b.id+'</td><td>'+b.customer+'</td><td>'+b.pet+'</td><td>'+b.service+'</td><td>'+b.date+'</td><td>'+b.center+'</td><td>'+statusBadge(b.status)+'</td></tr>';
  });
  html+='</tbody></table></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

window.admShowBookingForm = function(){
  admShowModal('<h3 data-vi="Th\u00EAm l\u1ECBch h\u1EB9n m\u1EDBi" data-en="New Booking">Th\u00EAm l\u1ECBch h\u1EB9n m\u1EDBi</h3><div class="adm-form-group"><label>Kh\u00E1ch h\u00E0ng</label><select style="width:100%;padding:10px 14px;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:8px;color:#E8F8F4;font-size:14px;font-family:inherit;"><option>Nguy\u1EC5n V\u0103n An</option><option>Tr\u1EA7n Th\u1ECB B\u00ECnh</option><option>L\u00EA Ho\u00E0ng C\u01B0\u1EDDng</option></select></div><div class="adm-form-group"><label>D\u1ECBch v\u1EE5</label><input placeholder="VD: Kh\u00E1m t\u1ED5ng qu\u00E1t"></div><div class="adm-form-group"><label>Ng\u00E0y gi\u1EDD</label><input type="datetime-local"></div><div class="adm-form-group"><label>Chi nh\u00E1nh</label><select style="width:100%;padding:10px 14px;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:8px;color:#E8F8F4;font-size:14px;font-family:inherit;"><option>HCM - Q1</option><option>HCM - Q7</option><option>HN - C\u1EA7u Gi\u1EA5y</option><option>\u0110\u00E0 N\u1EB5ng</option></select></div><div class="adm-form-actions"><button class="adm-btn adm-btn-secondary" onclick="admCloseModal()">H\u1EE7y</button><button class="adm-btn adm-btn-primary" onclick="admCloseModal()">L\u01B0u</button></div>');
};

// ── Customers Page ───────────────────────────────────────
function renderCustomers(){
  var html='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="Danh s\u00E1ch kh\u00E1ch h\u00E0ng" data-en="Customer List">Danh s\u00E1ch kh\u00E1ch h\u00E0ng</span><button class="adm-btn adm-btn-primary">+ Th\u00EAm m\u1EDBi</button></div>';
  html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>ID</th><th data-vi="H\u1ECD t\u00EAn" data-en="Name">H\u1ECD t\u00EAn</th><th>Email</th><th data-vi="\u0110i\u1EC7n tho\u1EA1i" data-en="Phone">\u0110i\u1EC7n tho\u1EA1i</th><th data-vi="S\u1ED1 pet" data-en="Pets">S\u1ED1 pet</th><th data-vi="L\u01B0\u1EE3t KH" data-en="Visits">L\u01B0\u1EE3t KH</th><th data-vi="Tr\u1EA1ng th\u00E1i" data-en="Status">Tr\u1EA1ng th\u00E1i</th></tr></thead><tbody>';
  DEMO.customers.forEach(function(c){
    html+='<tr><td style="color:#6496FF;font-weight:600">'+c.id+'</td><td><div style="display:flex;align-items:center;gap:8px"><div class="adm-avatar">'+c.name.charAt(0)+'</div>'+c.name+'</div></td><td>'+c.email+'</td><td>'+c.phone+'</td><td style="text-align:center">'+c.pets+'</td><td style="text-align:center">'+c.visits+'</td><td>'+statusBadge(c.status)+'</td></tr>';
  });
  html+='</tbody></table></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ── Pets Page ────────────────────────────────────────────
function renderPets(){
  var html='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="Qu\u1EA3n l\u00FD th\u00FA c\u01B0ng" data-en="Pet Management">Qu\u1EA3n l\u00FD th\u00FA c\u01B0ng</span></div>';
  html+='<div class="adm-stats" style="margin-bottom:0">';
  [{l:'T\u1ED5ng th\u00FA c\u01B0ng',v:'5,621',c:'#00C896'},{l:'Ch\u00F3',v:'3,245',c:'#6496FF'},{l:'M\u00E8o',v:'2,108',c:'#7B5FFF'},{l:'Kh\u00E1c',v:'268',c:'#FFC800'}].forEach(function(s){
    html+='<div class="adm-stat-card" style="--card-accent:'+s.c+'"><div class="adm-stat-value">'+s.v+'</div><div class="adm-stat-label">'+s.l+'</div></div>';
  });
  html+='</div></div>';
  html+='<div class="adm-card"><div class="adm-card-title" data-vi="D\u1EEF li\u1EC7u th\u00FA c\u01B0ng s\u1EBD \u0111\u01B0\u1EE3c \u0111\u1ED3ng b\u1ED9 t\u1EEB backend" data-en="Pet data synced from backend">D\u1EEF li\u1EC7u th\u00FA c\u01B0ng s\u1EBD \u0111\u01B0\u1EE3c \u0111\u1ED3ng b\u1ED9 t\u1EEB backend</div><div class="adm-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21c-4 0-7-2-7-5 0-2 1.5-3.5 3-4.5"/><circle cx="8" cy="4" r="1.5"/><circle cx="15" cy="4" r="1.5"/><circle cx="5" cy="9" r="1.5"/><circle cx="19" cy="9" r="1.5"/></svg><p data-vi="K\u1EBFt n\u1ED1i backend \u0111\u1EC3 xem d\u1EEF li\u1EC7u th\u00FA c\u01B0ng chi ti\u1EBFt" data-en="Connect backend to view detailed pet data">K\u1EBFt n\u1ED1i backend \u0111\u1EC3 xem d\u1EEF li\u1EC7u th\u00FA c\u01B0ng chi ti\u1EBFt</p></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ── Orders Page ──────────────────────────────────────────
function renderOrders(){
  var content=document.getElementById('admPageContent');
  content.innerHTML='<div style="text-align:center;padding:40px;color:#607870">Loading orders...</div>';

  // Load from Supabase + localStorage fallback
  var supaOrders = window.AnimaOrders ? AnimaOrders.getAll({limit:200}) : Promise.resolve([]);
  var localOrders = [];
  try{localOrders=JSON.parse(localStorage.getItem('anima_orders')||'[]');}catch(e){}

  supaOrders.then(function(dbOrders){
    dbOrders = dbOrders || [];
    // Merge: DB orders + local orders not in DB
    var dbCodes = dbOrders.map(function(o){return o.order_code;});
    var extraLocal = localOrders.filter(function(o){return dbCodes.indexOf(o._id||o.id)===-1;});

    var allOrders = dbOrders.map(function(o){
      var items = [];
      try{items=typeof o.items==='string'?JSON.parse(o.items):o.items||[];}catch(e){}
      return {
        id:o.order_code, customer:o.customer_name, phone:o.customer_phone,
        product:items.length>0?items[0].name:'', total:o.total_amount||0,
        date:o.created_at?new Date(o.created_at).toLocaleDateString('vi-VN'):'',
        payment:o.payment_method||'cod', paymentStatus:o.payment_status||'unpaid',
        status:o.order_status||'pending', tracking:o.tracking_code||'',
        center:o.center_name||'', commission:o.commission||0,
        address:o.address||'', notes:o.notes||'',
        _dbId:o.id, _source:'supabase'
      };
    }).concat(extraLocal.map(function(o){
      return {
        id:o._id||o.id, customer:o.customer||o.name, phone:o.phone||'',
        product:o.product||'', total:o.total||0,
        date:o.date||'', payment:o.paymentMethod||o.method||'cod',
        status:o.status||'pending', center:o.centerId||'', _source:'local'
      };
    }));

    // Pipeline KPIs
    var oPending=allOrders.filter(function(o){return o.status==='pending';}).length;
    var oConfirmed=allOrders.filter(function(o){return o.status==='confirmed';}).length;
    var oShipped=allOrders.filter(function(o){return o.status==='shipped';}).length;
    var oDelivered=allOrders.filter(function(o){return o.status==='delivered';}).length;
    var totalRev=allOrders.reduce(function(s,o){return s+(o.total||0);},0);
    var html='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;margin-bottom:12px">';
    [{l:'Ch\u1EDD',v:oPending,c:'#F59E0B'},{l:'X\u00E1c nh\u1EADn',v:oConfirmed,c:'#60A5FA'},{l:'\u0110ang giao',v:oShipped,c:'#9B82FF'},{l:'\u0110\u00E3 giao',v:oDelivered,c:'#22C55E'},{l:'T\u1ED5ng',v:allOrders.length,c:'#00C896'},{l:'Doanh thu',v:formatVND(totalRev),c:'#FFB800'}].forEach(function(k){
      html+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:8px;padding:8px;text-align:center"><div style="font-size:16px;font-weight:700;color:'+k.c+'">'+k.v+'</div><div style="font-size:9px;color:#607870">'+k.l+'</div></div>';
    });
    html+='</div>';
    html+='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="T\u1EA5t c\u1EA3 \u0111\u01A1n h\u00E0ng" data-en="All Orders">T\u1EA5t c\u1EA3 \u0111\u01A1n h\u00E0ng ('+allOrders.length+')</span>';
    html+='<button class="adm-btn adm-btn-secondary" onclick="admNav(document.querySelector(\'[data-page=orders]\'),\'orders\')" style="font-size:11px;padding:4px 10px">\u21BB</button></div>';
    html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr>';
    html+='<th>M\u00E3 \u0111\u01A1n</th><th>Kh\u00E1ch</th><th>SP</th><th>T\u1ED5ng</th><th>TT</th><th>Thanh to\u00E1n</th><th>Tr\u1EA1ng th\u00E1i</th><th>V\u1EADn \u0111\u01A1n</th>';
    html+='</tr></thead><tbody>';

    if(allOrders.length===0){
      html+='<tr><td colspan="8" style="text-align:center;padding:30px;color:#607870">Ch\u01B0a c\u00F3 \u0111\u01A1n h\u00E0ng n\u00E0o</td></tr>';
    } else {
      allOrders.forEach(function(o){
        var payLabels={cod:'COD',bank:'CK',momo:'MoMo'};
        var statusLabels={pending:'Ch\u1EDD',confirmed:'X\u00E1c nh\u1EADn',processing:'X\u1EED l\u00FD',shipped:'Giao',delivered:'\u0110\u00E3 giao',cancelled:'H\u1EE7y'};
        var payStatusLabels={unpaid:'Ch\u01B0a TT',pending:'Ch\u1EDD TT',paid:'\u0110\u00E3 TT',refunded:'Ho\u00E0n ti\u1EC1n'};
        var payStatusColors={unpaid:'#FF4D6D',pending:'#F59E0B',paid:'#22C55E',refunded:'#9B82FF'};
        html+='<tr>';
        html+='<td style="color:#7B5FFF;font-weight:600;font-size:10px;font-family:monospace">'+o.id+'</td>';
        html+='<td style="font-weight:500;font-size:11px">'+o.customer+'</td>';
        html+='<td style="font-size:10px;max-width:100px;overflow:hidden;text-overflow:ellipsis">'+(o.product||'\u2014')+'</td>';
        html+='<td style="font-weight:600;color:#FFB800;font-size:11px">'+formatVND(o.total)+'</td>';
        // Payment method
        html+='<td><span class="adm-badge adm-badge-blue" style="font-size:9px">'+(payLabels[o.payment]||o.payment)+'</span></td>';
        // Payment status
        html+='<td>';
        if(o._dbId){
          html+='<select onchange="ordUpdatePayment(\''+o._dbId+'\',this.value)" style="font-size:10px;background:#0A1218;color:'+(payStatusColors[o.paymentStatus||'unpaid']||'#F59E0B')+';border:1px solid rgba(0,200,150,0.15);border-radius:4px;padding:2px 4px;font-weight:600">';
          ['unpaid','pending','paid','refunded'].forEach(function(ps){
            html+='<option value="'+ps+'"'+((o.paymentStatus||'unpaid')===ps?' selected':'')+'>'+(payStatusLabels[ps]||ps)+'</option>';
          });
          html+='</select>';
        } else {
          html+='<span style="font-size:10px;color:#F59E0B">Ch\u01B0a TT</span>';
        }
        html+='</td>';
        // Order status
        html+='<td>';
        if(o._dbId){
          html+='<select onchange="ordUpdateStatus(\''+o._dbId+'\',this.value)" style="font-size:10px;background:#0A1218;color:#B8D8D0;border:1px solid rgba(0,200,150,0.15);border-radius:4px;padding:2px 4px">';
          ['pending','confirmed','processing','shipped','delivered','cancelled'].forEach(function(s){
            html+='<option value="'+s+'"'+(o.status===s?' selected':'')+'>'+(statusLabels[s]||s)+'</option>';
          });
          html+='</select>';
        } else {
          html+='<span class="adm-badge adm-badge-yellow" style="font-size:9px">'+(statusLabels[o.status]||o.status)+'</span>';
        }
        html+='</td>';
        // Tracking
        html+='<td style="font-size:10px;color:#60A5FA;font-family:monospace">'+(o.tracking||'\u2014')+'</td>';
        html+='</tr>';
      });
    }
    html+='</tbody></table></div></div>';
    content.innerHTML=html;
    if(typeof applyTranslations==='function') applyTranslations();
  }).catch(function(e){
    // Fallback to DEMO data if Supabase fails
    var html='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title">All Orders (Demo)</span></div>';
    html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Payment</th><th>Status</th></tr></thead><tbody>';
    DEMO.orders.forEach(function(o){
      html+='<tr><td style="color:#7B5FFF;font-weight:600">'+o.id+'</td><td>'+o.customer+'</td><td style="text-align:center">'+o.items+'</td><td>'+formatVND(o.total)+'</td><td>'+o.date+'</td><td>'+statusBadge(o.payment)+'</td><td>'+statusBadge(o.status)+'</td></tr>';
    });
    html+='</tbody></table></div></div>';
    content.innerHTML=html;
  });
}

window.ordUpdateStatus=function(id,status){
  if(!window.AnimaOrders) return;
  var updateData = {order_status: status, updated_at: new Date().toISOString()};
  // Auto-set timestamps
  if(status==='shipped') updateData.shipped_at = new Date().toISOString();
  if(status==='delivered') updateData.delivered_at = new Date().toISOString();
  // If shipped, ask for tracking code
  if(status==='shipped'){
    var code = prompt('Nhập mã vận đơn (tracking code):');
    if(code) updateData.tracking_code = code;
  }
  // If cancelled, ask reason
  if(status==='cancelled'){
    var reason = prompt('Lý do hủy:');
    if(reason) updateData.notes = reason;
  }
  AnimaOrders.update(id, updateData).then(function(){
    if(typeof showToast==='function') showToast('Đã cập nhật: '+status, '#00C896');
    admNav(document.querySelector('[data-page=orders]'),'orders');
  });
};
window.ordUpdatePayment=function(id,payStatus){
  if(!window.AnimaOrders) return;
  AnimaOrders.update(id, {payment_status: payStatus, updated_at: new Date().toISOString()}).then(function(){
    if(typeof showToast==='function') showToast('Thanh toán: '+payStatus, '#FFB800');
    admNav(document.querySelector('[data-page=orders]'),'orders');
  });
};

// ── Inventory Page ───────────────────────────────────────
function renderInventory(){
  var html='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="Qu\u1EA3n l\u00FD kho h\u00E0ng" data-en="Inventory Management">Qu\u1EA3n l\u00FD kho h\u00E0ng</span><button class="adm-btn adm-btn-primary">+ Th\u00EAm m\u1EDBi</button></div>';
  html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>SKU</th><th data-vi="T\u00EAn s\u1EA3n ph\u1EA9m" data-en="Product">T\u00EAn s\u1EA3n ph\u1EA9m</th><th data-vi="Danh m\u1EE5c" data-en="Category">Danh m\u1EE5c</th><th data-vi="T\u1ED3n kho" data-en="Stock">T\u1ED3n kho</th><th data-vi="T\u1ED1i thi\u1EC3u" data-en="Min">T\u1ED1i thi\u1EC3u</th><th data-vi="Gi\u00E1" data-en="Price">Gi\u00E1</th><th data-vi="Tr\u1EA1ng th\u00E1i" data-en="Status">Tr\u1EA1ng th\u00E1i</th></tr></thead><tbody>';
  DEMO.inventory.forEach(function(i){
    var st=i.stock<=i.min_stock?'<span class="adm-badge adm-badge-red">Th\u1EA5p</span>':'<span class="adm-badge adm-badge-green">OK</span>';
    var catLabels={vaccine:'V\u1EAFc xin',medicine:'Thu\u1ED1c',food:'Th\u1EE9c \u0103n',grooming:'Grooming',equipment:'Thi\u1EBFt b\u1ECB'};
    html+='<tr><td style="color:#607870;font-family:monospace;font-size:12px">'+i.sku+'</td><td>'+i.name+'</td><td><span class="adm-badge adm-badge-blue">'+(catLabels[i.category]||i.category)+'</span></td><td style="font-weight:600;color:'+(i.stock<=i.min_stock?'#FF7070':'#E8F8F4')+'">'+i.stock+'</td><td>'+i.min_stock+'</td><td>'+formatVND(i.price)+'</td><td>'+st+'</td></tr>';
  });
  html+='</tbody></table></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ── Centers Page ─────────────────────────────────────────
function renderCenters(){
  var html='<div class="adm-stats">';
  DEMO.centers.forEach(function(c){
    html+='<div class="adm-stat-card" style="--card-accent:'+(c.status==='active'?'#00C896':'#FFC800')+'"><div style="display:flex;justify-content:space-between;align-items:start">'+statusBadge(c.status)+'<span style="font-size:12px;color:#FFC800">\u2605 '+c.rating+'</span></div><div style="font-size:16px;font-weight:600;margin:12px 0 4px;color:#E8F8F4">'+c.name+'</div><div style="font-size:12px;color:#607870;margin-bottom:12px">'+c.address+'</div><div style="display:flex;gap:16px;font-size:12px;color:#B8D8D0"><span>'+c.staff+' nh\u00E2n vi\u00EAn</span><span>'+c.capacity+' ch\u1ED7</span></div></div>';
  });
  html+='</div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ── Staff Page ───────────────────────────────────────────
function renderStaff(){
  var html='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="Danh s\u00E1ch nh\u00E2n vi\u00EAn" data-en="Staff List">Danh s\u00E1ch nh\u00E2n vi\u00EAn</span><button class="adm-btn adm-btn-primary">+ Th\u00EAm m\u1EDBi</button></div>';
  html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>ID</th><th data-vi="H\u1ECD t\u00EAn" data-en="Name">H\u1ECD t\u00EAn</th><th data-vi="Ch\u1EE9c v\u1EE5" data-en="Role">Ch\u1EE9c v\u1EE5</th><th data-vi="Chi nh\u00E1nh" data-en="Center">Chi nh\u00E1nh</th><th>Email</th><th data-vi="Tr\u1EA1ng th\u00E1i" data-en="Status">Tr\u1EA1ng th\u00E1i</th></tr></thead><tbody>';
  DEMO.staff.forEach(function(s){
    html+='<tr><td style="color:#7B5FFF;font-weight:600">'+s.id+'</td><td><div style="display:flex;align-items:center;gap:8px"><div class="adm-avatar">'+s.name.replace(/^BS\\. /,'').charAt(0)+'</div>'+s.name+'</div></td><td>'+s.role+'</td><td>'+s.center+'</td><td style="color:#607870;font-size:12px">'+s.email+'</td><td>'+statusBadge(s.status)+'</td></tr>';
  });
  html+='</tbody></table></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ── Settings Page ────────────────────────────────────────
function renderSettings(){
  var html='<div class="adm-grid-2"><div class="adm-card"><div class="adm-card-title" data-vi="C\u00E0i \u0111\u1EB7t chung" data-en="General Settings">C\u00E0i \u0111\u1EB7t chung</div><div style="margin-top:16px"><div class="adm-form-group"><label data-vi="T\u00EAn h\u1EC7 th\u1ED1ng" data-en="System Name">T\u00EAn h\u1EC7 th\u1ED1ng</label><input value="AnimaCare Global"></div><div class="adm-form-group"><label data-vi="Email li\u00EAn h\u1EC7" data-en="Contact Email">Email li\u00EAn h\u1EC7</label><input value="doanhnhancaotuan@gmail.com"></div><div class="adm-form-group"><label data-vi="Ng\u00F4n ng\u1EEF m\u1EB7c \u0111\u1ECBnh" data-en="Default Language">Ng\u00F4n ng\u1EEF m\u1EB7c \u0111\u1ECBnh</label><select style="width:100%;padding:10px 14px;background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:8px;color:#E8F8F4;font-size:14px;font-family:inherit;"><option>Ti\u1EBFng Vi\u1EC7t</option><option>English</option></select></div><button class="adm-btn adm-btn-primary" data-vi="L\u01B0u thay \u0111\u1ED5i" data-en="Save Changes">L\u01B0u thay \u0111\u1ED5i</button></div></div>';
  html+='<div class="adm-card"><div class="adm-card-title" data-vi="B\u1EA3o m\u1EADt" data-en="Security">B\u1EA3o m\u1EADt</div><div style="margin-top:16px"><div class="adm-form-group"><label data-vi="Th\u1EDDi gian h\u1EBFt h\u1EA1n OTP (ph\u00FAt)" data-en="OTP Expiry (minutes)">Th\u1EDDi gian h\u1EBFt h\u1EA1n OTP (ph\u00FAt)</label><input type="number" value="5"></div><div class="adm-form-group"><label data-vi="S\u1ED1 l\u1EA7n th\u1EED OTP t\u1ED1i \u0111a" data-en="Max OTP Attempts">S\u1ED1 l\u1EA7n th\u1EED OTP t\u1ED1i \u0111a</label><input type="number" value="3"></div><div class="adm-form-group"><label data-vi="Th\u1EDDi gian session (ph\u00FAt)" data-en="Session Duration (minutes)">Th\u1EDDi gian session (ph\u00FAt)</label><input type="number" value="60"></div><button class="adm-btn adm-btn-primary" data-vi="C\u1EADp nh\u1EADt" data-en="Update">C\u1EADp nh\u1EADt</button></div></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ── Audit Log Page ───────────────────────────────────────
function renderAudit(){
  var html='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title" data-vi="Nh\u1EADt k\u00FD ho\u1EA1t \u0111\u1ED9ng" data-en="Activity Log">Nh\u1EADt k\u00FD ho\u1EA1t \u0111\u1ED9ng</span></div>';
  html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th data-vi="Th\u1EDDi gian" data-en="Time">Th\u1EDDi gian</th><th data-vi="Ng\u01B0\u1EDDi d\u00F9ng" data-en="User">Ng\u01B0\u1EDDi d\u00F9ng</th><th data-vi="H\u00E0nh \u0111\u1ED9ng" data-en="Action">H\u00E0nh \u0111\u1ED9ng</th><th data-vi="Chi ti\u1EBFt" data-en="Detail">Chi ti\u1EBFt</th></tr></thead><tbody>';
  var actionBadge={login:'green',update:'blue',create:'purple',export:'yellow'};
  DEMO.auditLog.forEach(function(a){
    html+='<tr><td style="color:#607870;font-size:12px;white-space:nowrap">'+a.time+'</td><td style="color:#00C896;font-weight:600">'+a.user+'</td><td><span class="adm-badge adm-badge-'+(actionBadge[a.action]||'blue')+'">'+a.action+'</span></td><td>'+a.detail+'</td></tr>';
  });
  html+='</tbody></table></div></div>';
  document.getElementById('admPageContent').innerHTML=html;
}

// ═══════════════════════════════════════════
// CRM LEADS PAGE — Full Supabase Integration
// ═══════════════════════════════════════════
function renderCRM(){
  var content=document.getElementById('admPageContent');
  content.innerHTML='<div style="text-align:center;padding:40px;color:#607870">Loading CRM data...</div>';

  if(!window.AnimaCRM){
    content.innerHTML='<div class="adm-card"><div style="padding:40px;text-align:center;color:#FF7070">Supabase client not loaded. Please refresh the page.</div></div>';
    return;
  }

  Promise.all([
    AnimaCRM.getLeads(),
    AnimaCRM.getStats()
  ]).then(function(results){
    var leads=results[0]||[];
    var stats=results[1]||{};
    var html='';

    // KPIs — compact
    html+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:14px">';
    var kpis=[
      {label:'T\u1ED5ng Leads',value:stats.totalLeads||0,color:'#00C896'},
      {label:'M\u1EDBi',value:stats.newLeads||0,color:'#00BFFF'},
      {label:'\u0110\u00E3 li\u00EAn h\u1EC7',value:stats.contactedLeads||0,color:'#FFB800'},
      {label:'Ch\u1EA5t l\u01B0\u1EE3ng',value:stats.qualifiedLeads||0,color:'#9B82FF'},
      {label:'Th\u00E0nh c\u00F4ng',value:stats.wonLeads||0,color:'#00E676'},
      {label:'\u0110\u01A1n h\u00E0ng',value:stats.totalOrders||0,color:'#FF6B9D'}
    ];
    kpis.forEach(function(k){
      html+='<div style="background:rgba(0,200,150,0.03);border:1px solid rgba(0,200,150,0.1);border-radius:10px;padding:10px 8px;text-align:center">';
      html+='<div style="font-size:20px;font-weight:700;color:'+k.color+'">'+k.value+'</div>';
      html+='<div style="font-size:10px;color:#607870;margin-top:2px">'+k.label+'</div>';
      html+='</div>';
    });
    html+='</div>';

    // Action bar
    html+='<div class="adm-card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding:12px 16px">';
    html+='<div style="display:flex;gap:6px;flex-wrap:wrap">';
    html+='<button class="adm-btn adm-btn-primary" onclick="crmAddLead()" style="font-size:11px;padding:6px 12px">+ Th\u00EAm Lead</button>';
    html+='<button class="adm-btn adm-btn-secondary" onclick="admNav(document.querySelector(\'[data-page=crm]\'),\'crm\')" style="font-size:11px;padding:6px 12px">\u21BB L\u00E0m m\u1EDBi</button>';
    html+='</div>';
    html+='<div style="font-size:12px;color:#607870">T\u1ED5ng: '+leads.length+' leads | Doanh thu: '+(stats.totalRevenue?stats.totalRevenue.toLocaleString():'0')+'\u0111</div>';
    html+='</div></div>';

    // Pipeline view — compact
    html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">';
    var statuses=[
      {key:'new',label:'M\u1EDBi',color:'#00BFFF',icon:'\u25CF'},
      {key:'contacted',label:'\u0110\u00E3 li\u00EAn h\u1EC7',color:'#FFB800',icon:'\u260E'},
      {key:'qualified',label:'Ch\u1EA5t l\u01B0\u1EE3ng',color:'#9B82FF',icon:'\u2605'},
      {key:'proposal',label:'\u0110\u1EC1 xu\u1EA5t',color:'#FF6B9D',icon:'\u270D'},
      {key:'won',label:'Th\u00E0nh c\u00F4ng',color:'#00E676',icon:'\u2714'},
      {key:'lost',label:'M\u1EA5t',color:'#FF5252',icon:'\u2716'}
    ];
    statuses.forEach(function(s){
      var count=leads.filter(function(l){return l.status===s.key;}).length;
      html+='<div onclick="crmFilterStatus(\''+s.key+'\')" style="background:rgba(0,200,150,0.03);border:1px solid rgba(0,200,150,0.1);border-radius:8px;padding:8px 10px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\''+s.color+'\'" onmouseout="this.style.borderColor=\'rgba(0,200,150,0.1)\'">';
      html+='<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:11px;color:'+s.color+';font-weight:600">'+s.icon+' '+s.label+'</span><span style="font-size:16px;font-weight:700;color:'+s.color+'">'+count+'</span></div>';
      html+='</div>';
    });
    html+='</div>';

    // Leads table
    html+='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title">Danh s\u00E1ch Leads</span></div>';
    html+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr>';
    html+='<th>T\u00EAn</th><th>S\u0110T</th><th>Email</th><th>Ngu\u1ED3n</th><th>Tr\u1EA1ng th\u00E1i</th><th>Ng\u00E0y</th><th>Thao t\u00E1c</th>';
    html+='</tr></thead><tbody>';

    if(leads.length===0){
      html+='<tr><td colspan="7" style="text-align:center;padding:30px;color:#607870">Ch\u01B0a c\u00F3 lead n\u00E0o. H\u00E3y \u0111\u1EB7t \u0111\u01A1n ho\u1EB7c g\u1EEDi li\u00EAn h\u1EC7 \u0111\u1EC3 t\u1EA1o lead \u0111\u1EA7u ti\u00EAn!</td></tr>';
    } else {
      leads.forEach(function(l){
        var statusColors={new:'blue',contacted:'yellow',qualified:'purple',proposal:'pink',won:'green',lost:'red'};
        var statusLabels={new:'M\u1EDBi',contacted:'\u0110\u00E3 LH',qualified:'Ch\u1EA5t l\u01B0\u1EE3ng',proposal:'\u0110\u1EC1 xu\u1EA5t',won:'Th\u00E0nh c\u00F4ng',lost:'M\u1EA5t'};
        var date=l.created_at?new Date(l.created_at).toLocaleDateString('vi-VN'):'';
        html+='<tr>';
        html+='<td style="font-weight:600;color:#E8F8F4;cursor:pointer" onclick="crmViewLead(\''+l.id+'\')">'+l.name+'</td>';
        html+='<td style="color:#00C896">'+(l.phone||'—')+'</td>';
        html+='<td style="font-size:12px;color:#607870">'+(l.email||'—')+'</td>';
        html+='<td><span style="font-size:11px;color:#9B82FF;background:rgba(155,130,255,0.08);padding:2px 8px;border-radius:6px">'+(l.source||'web')+'</span></td>';
        html+='<td><span class="adm-badge adm-badge-'+(statusColors[l.status]||'blue')+'">'+(statusLabels[l.status]||l.status)+'</span></td>';
        html+='<td style="font-size:12px;color:#607870;white-space:nowrap">'+date+'</td>';
        html+='<td style="display:flex;gap:4px">';
        html+='<select onchange="crmUpdateStatus(\''+l.id+'\',this.value)" style="font-size:11px;background:#0A1218;color:#B8D8D0;border:1px solid rgba(0,200,150,0.2);border-radius:6px;padding:3px 6px">';
        statuses.forEach(function(s){html+='<option value="'+s.key+'"'+(l.status===s.key?' selected':'')+'>'+s.label+'</option>';});
        html+='</select>';
        html+='<button onclick="crmDeleteLead(\''+l.id+'\')" style="font-size:11px;background:rgba(255,82,82,0.08);border:1px solid rgba(255,82,82,0.2);color:#FF5252;border-radius:6px;padding:3px 8px;cursor:pointer">X</button>';
        html+='</td></tr>';
      });
    }
    html+='</tbody></table></div></div>';

    content.innerHTML=html;
    if(typeof applyTranslations==='function') applyTranslations();
  }).catch(function(e){
    content.innerHTML='<div class="adm-card"><div style="padding:30px;text-align:center;color:#FF7070">L\u1ED7i t\u1EA3i d\u1EEF li\u1EC7u: '+e.message+'</div></div>';
  });
}

// CRM Actions
window.crmUpdateStatus=function(id,status){
  if(!window.AnimaCRM) return;
  AnimaCRM.updateLead(id,{status:status}).then(function(){
    admNav(document.querySelector('[data-page=crm]'),'crm');
  });
};

window.crmDeleteLead=function(id){
  if(!confirm('X\u00F3a lead n\u00E0y?')) return;
  if(!window.AnimaCRM) return;
  AnimaCRM.deleteLead(id).then(function(){
    admNav(document.querySelector('[data-page=crm]'),'crm');
  });
};

window.crmAddLead=function(){
  var html='<div style="display:flex;flex-direction:column;gap:12px;min-width:300px">';
  html+='<h3 style="color:#00C896;margin:0">Th\u00EAm Lead M\u1EDBi</h3>';
  html+='<input id="crmNewName" placeholder="T\u00EAn kh\u00E1ch h\u00E0ng *" style="padding:10px 14px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,200,150,0.2);border-radius:8px;color:#E8F8F4;font-size:14px">';
  html+='<input id="crmNewPhone" placeholder="S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" style="padding:10px 14px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,200,150,0.2);border-radius:8px;color:#E8F8F4;font-size:14px">';
  html+='<input id="crmNewEmail" placeholder="Email" style="padding:10px 14px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,200,150,0.2);border-radius:8px;color:#E8F8F4;font-size:14px">';
  html+='<select id="crmNewSource" style="padding:10px 14px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,200,150,0.2);border-radius:8px;color:#E8F8F4;font-size:14px">';
  html+='<option value="manual">Nh\u1EADp tay</option><option value="phone">G\u1ECDi \u0111i\u1EC7n</option><option value="referral">Gi\u1EDBi thi\u1EC7u</option><option value="social">MXH</option><option value="website_order">Web Order</option><option value="website_contact">Web Contact</option>';
  html+='</select>';
  html+='<textarea id="crmNewNotes" placeholder="Ghi ch\u00FA..." rows="2" style="padding:10px 14px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,200,150,0.2);border-radius:8px;color:#E8F8F4;font-size:14px;resize:none"></textarea>';
  html+='<button onclick="crmSaveNewLead()" class="adm-btn adm-btn-primary" style="padding:12px">L\u01B0u Lead</button>';
  html+='</div>';
  admShowModal(html);
};

window.crmSaveNewLead=function(){
  var name=document.getElementById('crmNewName').value.trim();
  if(!name){alert('Vui l\u00F2ng nh\u1EADp t\u00EAn!');return;}
  AnimaCRM.createLead({
    name:name,
    phone:document.getElementById('crmNewPhone').value.trim(),
    email:document.getElementById('crmNewEmail').value.trim(),
    source:document.getElementById('crmNewSource').value,
    notes:document.getElementById('crmNewNotes').value.trim(),
    status:'new'
  }).then(function(){
    document.getElementById('admModal').classList.remove('show');
    admNav(document.querySelector('[data-page=crm]'),'crm');
  }).catch(function(e){alert('L\u1ED7i: '+e.message);});
};

window.crmViewLead=function(id){
  AnimaCRM.getLead(id).then(function(lead){
    if(!lead) return;
    AnimaCRM.getActivities(id).then(function(activities){
      var html='<div style="min-width:350px">';
      html+='<h3 style="color:#00C896;margin:0 0 16px">'+lead.name+'</h3>';
      html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">';
      html+='<div style="font-size:13px"><span style="color:#607870">S\u0110T:</span> <span style="color:#00C896">'+(lead.phone||'\u2014')+'</span></div>';
      html+='<div style="font-size:13px"><span style="color:#607870">Email:</span> <span style="color:#E8F8F4">'+(lead.email||'\u2014')+'</span></div>';
      html+='<div style="font-size:13px"><span style="color:#607870">Ngu\u1ED3n:</span> <span style="color:#9B82FF">'+(lead.source||'web')+'</span></div>';
      html+='<div style="font-size:13px"><span style="color:#607870">Ng\u00E0y:</span> <span style="color:#E8F8F4">'+new Date(lead.created_at).toLocaleDateString('vi-VN')+'</span></div>';
      html+='</div>';
      if(lead.notes) html+='<div style="background:rgba(0,200,150,0.04);border:1px solid rgba(0,200,150,0.1);border-radius:8px;padding:10px 14px;font-size:13px;color:#B8D8D0;margin-bottom:16px">'+lead.notes+'</div>';

      // Add activity form
      html+='<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:600;color:#607870;margin-bottom:6px">Th\u00EAm ghi ch\u00FA</div>';
      html+='<div style="display:flex;gap:6px"><select id="crmActType" style="padding:8px;background:#0A1218;color:#B8D8D0;border:1px solid rgba(0,200,150,0.2);border-radius:6px;font-size:12px"><option value="note">Ghi ch\u00FA</option><option value="call">G\u1ECDi \u0111i\u1EC7n</option><option value="email">Email</option><option value="meeting">H\u1EB9n g\u1EB7p</option></select>';
      html+='<input id="crmActContent" placeholder="N\u1ED9i dung..." style="flex:1;padding:8px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,200,150,0.2);border-radius:6px;color:#E8F8F4;font-size:12px">';
      html+='<button onclick="crmAddActivity(\''+id+'\')" style="padding:8px 12px;background:rgba(0,200,150,0.1);border:1px solid rgba(0,200,150,0.2);border-radius:6px;color:#00C896;cursor:pointer;font-size:12px">+</button></div></div>';

      // Activity log
      if(activities&&activities.length>0){
        html+='<div style="font-size:12px;font-weight:600;color:#607870;margin-bottom:6px">L\u1ECBch s\u1EED</div>';
        activities.forEach(function(a){
          var typeColors={note:'#607870',call:'#00BFFF',email:'#FFB800',meeting:'#9B82FF',order:'#00E676',chat:'#FF6B9D'};
          html+='<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid rgba(0,200,150,0.05);font-size:12px">';
          html+='<span style="color:'+(typeColors[a.type]||'#607870')+';min-width:60px;font-weight:600">'+a.type+'</span>';
          html+='<span style="color:#B8D8D0;flex:1">'+(a.content||'')+'</span>';
          html+='<span style="color:#607870;white-space:nowrap">'+new Date(a.created_at).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'</span>';
          html+='</div>';
        });
      }
      html+='</div>';
      admShowModal(html);
    });
  });
};

window.crmAddActivity=function(leadId){
  var type=document.getElementById('crmActType').value;
  var content=document.getElementById('crmActContent').value.trim();
  if(!content) return;
  AnimaCRM.addActivity({lead_id:leadId,type:type,content:content,created_by:'admin'}).then(function(){
    crmViewLead(leadId);
  });
};

window.crmFilterStatus=function(status){
  if(!window.AnimaCRM) return;
  AnimaCRM.getLeads({filter:'status=eq.'+status}).then(function(leads){
    // Re-render just the table
    var tbody=document.querySelector('#admPageContent .adm-table tbody');
    if(!tbody) return;
    var html='';
    leads.forEach(function(l){
      var statusColors={new:'blue',contacted:'yellow',qualified:'purple',proposal:'pink',won:'green',lost:'red'};
      var statusLabels={new:'M\u1EDBi',contacted:'\u0110\u00E3 LH',qualified:'Ch\u1EA5t l\u01B0\u1EE3ng',proposal:'\u0110\u1EC1 xu\u1EA5t',won:'Th\u00E0nh c\u00F4ng',lost:'M\u1EA5t'};
      var date=l.created_at?new Date(l.created_at).toLocaleDateString('vi-VN'):'';
      html+='<tr><td style="font-weight:600;color:#E8F8F4;cursor:pointer" onclick="crmViewLead(\''+l.id+'\')">'+l.name+'</td>';
      html+='<td style="color:#00C896">'+(l.phone||'\u2014')+'</td>';
      html+='<td style="font-size:12px;color:#607870">'+(l.email||'\u2014')+'</td>';
      html+='<td><span style="font-size:11px;color:#9B82FF;background:rgba(155,130,255,0.08);padding:2px 8px;border-radius:6px">'+(l.source||'web')+'</span></td>';
      html+='<td><span class="adm-badge adm-badge-'+(statusColors[l.status]||'blue')+'">'+(statusLabels[l.status]||l.status)+'</span></td>';
      html+='<td style="font-size:12px;color:#607870">'+date+'</td>';
      html+='<td><button onclick="crmViewLead(\''+l.id+'\')" style="font-size:11px;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);color:#00C896;border-radius:6px;padding:3px 8px;cursor:pointer">Xem</button></td></tr>';
    });
    tbody.innerHTML=html||'<tr><td colspan="7" style="text-align:center;padding:20px;color:#607870">Kh\u00F4ng c\u00F3 lead</td></tr>';
  });
};

// ── Auto-open dashboard if logged in ─────────────────────
function checkAdminSession(){
  var u=JSON.parse(localStorage.getItem('anima_admin_user')||'null');
  if(u) openAdminDashboard();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',checkAdminSession);
else setTimeout(checkAdminSession,200);

})();
</script>
`;

// Find the insertion point: right before the last </body>
const insertIdx = content.lastIndexOf('</body>');
if (insertIdx === -1) {
  console.error('Could not find </body> tag');
  process.exit(1);
}

content = content.substring(0, insertIdx) + dashboardBlock + '\n' + content.substring(insertIdx);
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('Dashboard injected successfully at position', insertIdx);
console.log('New file size:', content.length);
