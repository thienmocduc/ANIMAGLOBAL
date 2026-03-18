/* ═══════════════════════════════════════════════════════════════
   AnimaCare Realtime Sync Engine v1.0
   - BroadcastChannel for same-browser cross-tab sync
   - localStorage events for cross-window sync
   - Shared data store with timestamps
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var STORE_KEY = 'anima_sync_store';
var CHANNEL_NAME = 'anima-sync';
var bc = null;
var listeners = {};

// Init BroadcastChannel if supported
try {
  bc = new BroadcastChannel(CHANNEL_NAME);
  bc.onmessage = function(e) {
    if(e.data && e.data.type === 'sync_update') {
      handleRemoteUpdate(e.data);
    }
  };
} catch(ex) {
  // Fallback to storage events only
}

// Storage event for cross-window
window.addEventListener('storage', function(e) {
  if(e.key === STORE_KEY && e.newValue) {
    try {
      var store = JSON.parse(e.newValue);
      notifyListeners(store._lastKey, store[store._lastKey]);
    } catch(ex) {}
  }
});

function getStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch(e) {
    return {};
  }
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function handleRemoteUpdate(data) {
  notifyListeners(data.key, data.value);
}

function notifyListeners(key, value) {
  if(!key) return;
  // Notify specific key listeners
  if(listeners[key]) {
    listeners[key].forEach(function(fn) { try { fn(value, key); } catch(e) {} });
  }
  // Notify wildcard listeners
  if(listeners['*']) {
    listeners['*'].forEach(function(fn) { try { fn(value, key); } catch(e) {} });
  }
}

// Public API
window.AnimaSync = {
  // Set data and broadcast to all tabs
  set: function(key, value) {
    var store = getStore();
    store[key] = value;
    store._lastKey = key;
    store._ts = Date.now();
    saveStore(store);
    // Broadcast
    if(bc) {
      bc.postMessage({ type:'sync_update', key:key, value:value, ts:Date.now() });
    }
    // Notify local listeners too
    notifyListeners(key, value);
  },

  // Get data
  get: function(key, fallback) {
    var store = getStore();
    return store[key] !== undefined ? store[key] : (fallback || null);
  },

  // Listen for changes
  on: function(key, fn) {
    if(!listeners[key]) listeners[key] = [];
    listeners[key].push(fn);
  },

  // Remove listener
  off: function(key, fn) {
    if(!listeners[key]) return;
    listeners[key] = listeners[key].filter(function(f) { return f !== fn; });
  },

  // Merge array data (e.g., add a booking)
  push: function(key, item) {
    var arr = this.get(key, []);
    if(!Array.isArray(arr)) arr = [];
    item._id = item._id || ('id_' + Date.now() + '_' + Math.random().toString(36).substr(2,5));
    item._ts = Date.now();
    arr.push(item);
    this.set(key, arr);
    return item._id;
  },

  // Update item in array by _id
  update: function(key, id, updates) {
    var arr = this.get(key, []);
    if(!Array.isArray(arr)) return false;
    for(var i = 0; i < arr.length; i++) {
      if(arr[i]._id === id) {
        Object.keys(updates).forEach(function(k) { arr[i][k] = updates[k]; });
        arr[i]._ts = Date.now();
        this.set(key, arr);
        return true;
      }
    }
    return false;
  },

  // Delete item from array by _id
  remove: function(key, id) {
    var arr = this.get(key, []);
    if(!Array.isArray(arr)) return false;
    var newArr = arr.filter(function(item) { return item._id !== id; });
    if(newArr.length !== arr.length) {
      this.set(key, newArr);
      return true;
    }
    return false;
  },

  // Batch set multiple keys
  batch: function(updates) {
    var store = getStore();
    Object.keys(updates).forEach(function(k) {
      store[k] = updates[k];
    });
    store._ts = Date.now();
    saveStore(store);
    Object.keys(updates).forEach(function(k) {
      if(bc) bc.postMessage({ type:'sync_update', key:k, value:updates[k], ts:Date.now() });
      notifyListeners(k, updates[k]);
    });
  },

  // Initialize demo data if not exists
  initDemoData: function() {
    if(this.get('_initialized')) return;

    var centers = [
      { _id:'CTR001', name:'Anima Care Hà Nội HQ', nameEn:'Anima Care Hanoi HQ', city:'Hà Nội', cityEn:'Hanoi', address:'286 Nguyễn Xiển, Thanh Liệt', status:'active', manager:'Nguyễn Văn An', phone:'0913156676', type:'Full', capacity:50 },
      { _id:'CTR002', name:'Anima Care Hồ Chí Minh', nameEn:'Anima Care Ho Chi Minh', city:'TP.HCM', cityEn:'HCMC', address:'123 Nguyễn Huệ, Q.1', status:'active', manager:'Trần Thị Bình', phone:'0912345678', type:'Full', capacity:60 },
      { _id:'CTR003', name:'Anima Care Đà Nẵng', nameEn:'Anima Care Da Nang', city:'Đà Nẵng', cityEn:'Da Nang', address:'45 Bạch Đằng', status:'active', manager:'Lê Hoàng Cường', phone:'0923456789', type:'Lite', capacity:30 },
      { _id:'CTR004', name:'Anima Care Hải Phòng', nameEn:'Anima Care Hai Phong', city:'Hải Phòng', cityEn:'Hai Phong', address:'78 Lạch Tray', status:'active', manager:'Phạm Minh Dũng', phone:'0934567890', type:'Lite', capacity:25 },
      { _id:'CTR005', name:'Anima Care Cần Thơ', nameEn:'Anima Care Can Tho', city:'Cần Thơ', cityEn:'Can Tho', address:'90 Trần Hưng Đạo', status:'active', manager:'Hoàng Thị E', phone:'0945678901', type:'Full', capacity:40 },
      { _id:'CTR006', name:'Anima Care Nha Trang', nameEn:'Anima Care Nha Trang', city:'Nha Trang', cityEn:'Nha Trang', address:'56 Trần Phú', status:'active', manager:'Võ Thanh F', phone:'0956789012', type:'Lite', capacity:20 },
      { _id:'CTR007', name:'Anima Care Huế', nameEn:'Anima Care Hue', city:'Huế', cityEn:'Hue', address:'12 Lê Lợi', status:'setup', manager:'Đặng Văn G', phone:'0967890123', type:'Full', capacity:35 },
      { _id:'CTR008', name:'Anima Care Vũng Tàu', nameEn:'Anima Care Vung Tau', city:'Vũng Tàu', cityEn:'Vung Tau', address:'34 Hạ Long', status:'maintenance', manager:'Bùi Thị H', phone:'0978901234', type:'Lite', capacity:20 }
    ];

    var bookings = [];
    var orders = [];
    var customers = [];
    var names = ['Nguyễn Văn An','Trần Thị Bình','Lê Hoàng Cường','Phạm Minh Dũng','Hoàng Thị E','Võ Thanh F','Đặng Văn G','Bùi Thị H','Nguyễn Thị Lan','Trần Văn Khoa'];
    var services = ['Khám tổng quát','Tiêm phòng','Phẫu thuật','Spa & Grooming','Xét nghiệm','Tư vấn dinh dưỡng','Châm cứu','Thảo mộc nhiệt'];
    var statuses = ['confirmed','pending','completed','cancelled'];
    var oStatuses = ['processing','shipped','delivered','pending'];

    for(var i = 0; i < 50; i++) {
      var ctrIdx = i % centers.length;
      var d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*30));
      bookings.push({
        _id: 'BK-' + (2601+i),
        centerId: centers[ctrIdx]._id,
        centerName: centers[ctrIdx].name,
        customer: names[i % names.length],
        service: services[i % services.length],
        date: d.toISOString().split('T')[0],
        time: (8 + (i%10)) + ':' + (i%2===0?'00':'30'),
        status: statuses[i % statuses.length],
        _ts: d.getTime()
      });
    }

    for(var j = 0; j < 30; j++) {
      var ctrIdx2 = j % centers.length;
      var d2 = new Date(); d2.setDate(d2.getDate() - Math.floor(Math.random()*30));
      orders.push({
        _id: 'ORD-' + (3401+j),
        centerId: centers[ctrIdx2]._id,
        centerName: centers[ctrIdx2].name,
        customer: names[j % names.length],
        product: j%3===0 ? 'Anima 119 Standard' : (j%3===1 ? 'Anima 119 Premium' : 'Anima 119 Lite'),
        qty: 1 + Math.floor(Math.random()*5),
        total: (150 + Math.floor(Math.random()*500)) * 1000,
        status: oStatuses[j % oStatuses.length],
        date: d2.toISOString().split('T')[0],
        _ts: d2.getTime()
      });
    }

    for(var k = 0; k < 40; k++) {
      var ctrIdx3 = k % centers.length;
      customers.push({
        _id: 'CUS-' + (1001+k),
        centerId: centers[ctrIdx3]._id,
        centerName: centers[ctrIdx3].name,
        name: names[k % names.length] + (k >= names.length ? ' ' + (Math.floor(k/names.length)+1) : ''),
        phone: '09' + String(10000000 + k*1234567).substr(0,8),
        email: 'customer' + k + '@email.com',
        type: k%3===0 ? 'VIP' : (k%3===1 ? 'Regular' : 'New'),
        visits: Math.floor(Math.random()*20)+1,
        lastVisit: new Date(Date.now() - Math.random()*30*86400000).toISOString().split('T')[0],
        _ts: Date.now()
      });
    }

    var inventory = [
      { _id:'INV001', product:'Anima 119 Standard', sku:'A119-STD', stock:420, minStock:50, price:1250000, centerId:'ALL' },
      { _id:'INV002', product:'Anima 119 Premium', sku:'A119-PRE', stock:42, minStock:20, price:2500000, centerId:'ALL' },
      { _id:'INV003', product:'Anima 119 Lite', sku:'A119-LIT', stock:68, minStock:30, price:750000, centerId:'ALL' },
      { _id:'INV004', product:'Shampoo Spa Premium', sku:'SPA-SH01', stock:15, minStock:20, price:350000, centerId:'ALL' },
      { _id:'INV005', product:'Amoxicillin 500mg', sku:'MED-AM05', stock:4, minStock:20, price:180000, centerId:'ALL' },
      { _id:'INV006', product:'Thảo mộc nhiệt liệu', sku:'TMN-001', stock:200, minStock:30, price:450000, centerId:'ALL' },
      { _id:'INV007', product:'Bộ châm cứu Đông y', sku:'CC-DY01', stock:35, minStock:10, price:1800000, centerId:'ALL' },
      { _id:'INV008', product:'Tinh dầu xông hơi', sku:'TD-XH01', stock:88, minStock:25, price:280000, centerId:'ALL' }
    ];

    var activities = [];
    var actTypes = [
      { t:'booking_new', vi:'{name} đặt lịch {service} tại {center}', en:'{name} booked {service} at {center}' },
      { t:'order_new', vi:'Đơn {id} · {name} đặt {product}', en:'Order {id} · {name} ordered {product}' },
      { t:'customer_new', vi:'Khách hàng mới: {name} tại {center}', en:'New customer: {name} at {center}' },
      { t:'booking_done', vi:'{name} hoàn thành phiên {service}', en:'{name} completed {service} session' },
      { t:'stock_low', vi:'Cảnh báo tồn kho thấp: {product}', en:'Low stock alert: {product}' }
    ];
    for(var a = 0; a < 20; a++) {
      var at = actTypes[a % actTypes.length];
      var ago = a * 12 + Math.floor(Math.random()*10);
      activities.push({
        _id: 'ACT' + a,
        type: at.t,
        vi: at.vi.replace('{name}',names[a%names.length]).replace('{service}',services[a%services.length]).replace('{center}',centers[a%centers.length].name).replace('{id}','ORD-'+(3401+a)).replace('{product}','Anima 119'),
        en: at.en.replace('{name}',names[a%names.length]).replace('{service}',services[a%services.length]).replace('{center}',centers[a%centers.length].nameEn).replace('{id}','ORD-'+(3401+a)).replace('{product}','Anima 119'),
        centerId: centers[a%centers.length]._id,
        ago: ago,
        _ts: Date.now() - ago * 60000
      });
    }

    this.batch({
      centers: centers,
      bookings: bookings,
      orders: orders,
      customers: customers,
      inventory: inventory,
      activities: activities,
      _initialized: true,
      _initDate: new Date().toISOString()
    });
  }
};

// Auto-init demo data
AnimaSync.initDemoData();

})();
