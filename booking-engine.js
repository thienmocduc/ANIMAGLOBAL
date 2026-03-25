// ═══════════════════════════════════════════════════════
// ANIMA CARE — BOOKING ENGINE (Uber-style)
// Flow: Select Service → Select Center → Select Date/Time → Match KTV → Confirm
// ═══════════════════════════════════════════════════════
(function(){
'use strict';

var SERVICES = [
  {sku:'SVC-SCAN',name:'Khai Vấn AI (Tầm Soát)',nameEn:'AI Assessment',price:350000,duration:30,icon:'🔬'},
  {sku:'SVC-HERB',name:'Thảo Mộc Nhiệt',nameEn:'Herbal Heat Therapy',price:850000,duration:90,icon:'🌿'},
  {sku:'SVC-BATH',name:'Bồn Ngâm Thảo Mộc',nameEn:'Herbal Soak Bath',price:650000,duration:60,icon:'🛁'},
  {sku:'SVC-ACU',name:'Châm Cứu Chuẩn',nameEn:'Acupuncture',price:750000,duration:60,icon:'📍'},
  {sku:'SVC-MASS',name:'Massage Kinh Lạc',nameEn:'Meridian Massage',price:950000,duration:90,icon:'💆'},
  {sku:'SVC-STEAM',name:'Xông Hơi Thảo Mộc',nameEn:'Herbal Steam',price:550000,duration:45,icon:'♨️'},
  {sku:'SVC-FULL',name:'Liệu Trình Toàn Phần',nameEn:'Full Treatment',price:2500000,duration:180,icon:'⭐'}
];

var TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00',
  '18:00','18:30','19:00','19:30'
];

var _bkState = { step:1, service:null, center:null, date:null, time:null, ktv:null };

function t(vi,en){ return (typeof lang!=='undefined'&&lang==='en') ? en : vi; }
function money(n){ return (n||0).toLocaleString('vi-VN')+'đ'; }

// ── Open Booking Modal ──
window.openBooking = function(preselect){
  _bkState = { step:1, service:preselect||null, center:null, date:null, time:null, ktv:null };
  if(preselect) _bkState.step = 2;
  renderBooking();
  var m = document.getElementById('bookingModal');
  if(m){ m.style.opacity='1'; m.style.visibility='visible'; document.body.style.overflow='hidden'; }
};

window.closeBooking = function(){
  var m = document.getElementById('bookingModal');
  if(m){ m.style.opacity='0'; m.style.visibility='hidden'; document.body.style.overflow=''; }
};

// ── Render Current Step ──
function renderBooking(){
  var c = document.getElementById('bookingContent');
  if(!c) return;
  var steps = [
    {n:1,l:t('Dịch vụ','Service')},
    {n:2,l:t('Cơ sở','Center')},
    {n:3,l:t('Ngày & Giờ','Date & Time')},
    {n:4,l:t('Xác nhận','Confirm')}
  ];
  var h = '';
  // Progress bar
  h+='<div style="display:flex;align-items:center;gap:4px;margin-bottom:20px">';
  steps.forEach(function(s,i){
    var active = s.n <= _bkState.step;
    h+='<div style="flex:1;height:3px;border-radius:2px;background:'+(active?'#00C896':'rgba(0,200,150,.15)')+';transition:background .3s"></div>';
  });
  h+='</div>';
  h+='<div style="font-size:11px;color:rgba(248,242,224,.35);text-align:center;margin-bottom:16px">'+t('Bước','Step')+' '+_bkState.step+'/4 — '+steps[_bkState.step-1].l+'</div>';

  if(_bkState.step===1) h+=renderStep1();
  else if(_bkState.step===2) h+=renderStep2();
  else if(_bkState.step===3) h+=renderStep3();
  else if(_bkState.step===4) h+=renderStep4();

  c.innerHTML = h;
}

// ── Step 1: Chọn Dịch Vụ ──
function renderStep1(){
  var h='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:14px">'+t('Chọn dịch vụ','Select Service')+'</div>';
  h+='<div style="display:flex;flex-direction:column;gap:8px">';
  SERVICES.forEach(function(s){
    h+='<div onclick="window._bkSelectService(\''+s.sku+'\')" style="display:flex;align-items:center;gap:12px;padding:14px;background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:12px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'rgba(0,200,150,.3)\'" onmouseout="this.style.borderColor=\'rgba(0,200,150,.1)\'">';
    h+='<div style="font-size:24px;width:40px;text-align:center">'+s.icon+'</div>';
    h+='<div style="flex:1"><div style="font-size:14px;font-weight:600;color:#F8F2E0">'+s.name+'</div><div style="font-size:12px;color:rgba(248,242,224,.4)">'+s.duration+' '+t('phút','min')+'</div></div>';
    h+='<div style="font-size:14px;font-weight:700;color:#00C896">'+money(s.price)+'</div>';
    h+='</div>';
  });
  h+='</div>';
  return h;
}

window._bkSelectService = function(sku){
  _bkState.service = SERVICES.find(function(s){return s.sku===sku;});
  _bkState.step = 2;
  renderBooking();
};

// ── Step 2: Chọn Cơ Sở ──
function renderStep2(){
  var centers = [];
  if(window.AnimaSync){
    centers = AnimaSync.get('centers',[]).filter(function(c){return c.tier===1;});
  }
  var h='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:4px">'+t('Chọn cơ sở','Select Center')+'</div>';
  h+='<div style="font-size:12px;color:rgba(248,242,224,.3);margin-bottom:14px">'+(_bkState.service?_bkState.service.name:'')+'</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
  centers.forEach(function(c){
    h+='<div onclick="window._bkSelectCenter(\''+c._id+'\')" style="padding:12px;background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:10px;cursor:pointer;transition:all .2s;text-align:center" onmouseover="this.style.borderColor=\'rgba(0,200,150,.3)\'" onmouseout="this.style.borderColor=\'rgba(0,200,150,.1)\'">';
    h+='<div style="font-size:13px;font-weight:600;color:#F8F2E0">'+c.city+'</div>';
    h+='<div style="font-size:10px;color:rgba(248,242,224,.3)">'+c.name+'</div>';
    h+='</div>';
  });
  h+='</div>';
  h+='<div style="margin-top:12px"><button onclick="_bkState.step=1;renderBooking()" style="background:none;border:none;color:#00C896;font-size:13px;cursor:pointer">← '+t('Quay lại','Back')+'</button></div>';
  return h;
}

window._bkSelectCenter = function(cid){
  var centers = window.AnimaSync ? AnimaSync.get('centers',[]) : [];
  _bkState.center = centers.find(function(c){return c._id===cid;});
  _bkState.step = 3;
  renderBooking();
};

// ── Step 3: Chọn Ngày & Giờ ──
function renderStep3(){
  var h='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:4px">'+t('Chọn ngày & giờ','Select Date & Time')+'</div>';
  h+='<div style="font-size:12px;color:rgba(248,242,224,.3);margin-bottom:14px">'+(_bkState.service?_bkState.service.name:'')+' · '+(_bkState.center?_bkState.center.city:'')+'</div>';

  // Date picker — next 14 days
  h+='<div style="font-size:13px;font-weight:600;color:rgba(248,242,224,.5);margin-bottom:8px">'+t('Ngày','Date')+'</div>';
  h+='<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch">';
  var today = new Date();
  for(var d=1;d<=14;d++){
    var dt = new Date(today); dt.setDate(today.getDate()+d);
    var dayName = dt.toLocaleDateString('vi-VN',{weekday:'short'});
    var dayNum = dt.getDate();
    var month = dt.getMonth()+1;
    var val = dt.toISOString().split('T')[0];
    var sel = _bkState.date === val;
    h+='<div onclick="window._bkSelectDate(\''+val+'\')" style="min-width:52px;padding:10px 8px;text-align:center;border-radius:10px;cursor:pointer;border:1px solid '+(sel?'#00C896':'rgba(0,200,150,.1)')+';background:'+(sel?'rgba(0,200,150,.12)':'rgba(0,200,150,.03)')+';transition:all .2s;flex-shrink:0">';
    h+='<div style="font-size:10px;color:rgba(248,242,224,.4)">'+dayName+'</div>';
    h+='<div style="font-size:16px;font-weight:700;color:'+(sel?'#00C896':'#F8F2E0')+'">'+dayNum+'</div>';
    h+='<div style="font-size:9px;color:rgba(248,242,224,.3)">T'+month+'</div>';
    h+='</div>';
  }
  h+='</div>';

  // Time slots
  if(_bkState.date){
    h+='<div style="font-size:13px;font-weight:600;color:rgba(248,242,224,.5);margin:12px 0 8px">'+t('Giờ','Time')+'</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
    TIME_SLOTS.forEach(function(slot){
      var sel = _bkState.time === slot;
      h+='<div onclick="window._bkSelectTime(\''+slot+'\')" style="padding:10px 4px;text-align:center;border-radius:8px;cursor:pointer;font-size:13px;font-weight:'+(sel?'700':'500')+';color:'+(sel?'#000':'#F8F2E0')+';background:'+(sel?'linear-gradient(135deg,#005A42,#00C896)':'rgba(0,200,150,.04)')+';border:1px solid '+(sel?'#00C896':'rgba(0,200,150,.08)')+';transition:all .2s">'+slot+'</div>';
    });
    h+='</div>';
  }

  // Next button
  if(_bkState.date && _bkState.time){
    h+='<button onclick="_bkState.step=4;renderBooking()" style="width:100%;margin-top:16px;padding:14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:12px;font-size:15px;font-weight:700;color:#000;cursor:pointer;letter-spacing:.5px">'+t('Tiếp tục','Continue')+' →</button>';
  }
  h+='<div style="margin-top:12px"><button onclick="_bkState.step=2;renderBooking()" style="background:none;border:none;color:#00C896;font-size:13px;cursor:pointer">← '+t('Quay lại','Back')+'</button></div>';
  return h;
}

window._bkSelectDate = function(d){ _bkState.date=d; _bkState.time=null; renderBooking(); };
window._bkSelectTime = function(t){ _bkState.time=t; renderBooking(); };

// ── Step 4: Xác Nhận & Đặt Lịch ──
function renderStep4(){
  var s = _bkState.service;
  var c = _bkState.center;
  var u = (typeof currentUser!=='undefined' && currentUser) ? currentUser : {};
  var dateStr = _bkState.date ? new Date(_bkState.date).toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long'}) : '';

  var h='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:16px">'+t('Xác nhận đặt lịch','Confirm Booking')+'</div>';

  // Summary card
  h+='<div style="background:rgba(0,200,150,.05);border:1px solid rgba(0,200,150,.15);border-radius:14px;padding:16px;margin-bottom:16px">';
  h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:24px">'+(s?s.icon:'')+'</span><div><div style="font-size:15px;font-weight:700;color:#F8F2E0">'+(s?s.name:'')+'</div><div style="font-size:12px;color:rgba(248,242,224,.4)">'+(s?s.duration:'')+' '+t('phút','min')+'</div></div></div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">';
  h+='<div><span style="color:rgba(248,242,224,.4)">'+t('Cơ sở','Center')+':</span><br><strong style="color:#F8F2E0">'+(c?c.city:'')+'</strong></div>';
  h+='<div><span style="color:rgba(248,242,224,.4)">'+t('Ngày','Date')+':</span><br><strong style="color:#F8F2E0">'+dateStr+'</strong></div>';
  h+='<div><span style="color:rgba(248,242,224,.4)">'+t('Giờ','Time')+':</span><br><strong style="color:#00C896">'+(_bkState.time||'')+'</strong></div>';
  h+='<div><span style="color:rgba(248,242,224,.4)">'+t('Giá','Price')+':</span><br><strong style="color:#FFB800">'+money(s?s.price:0)+'</strong></div>';
  h+='</div></div>';

  // Customer info
  h+='<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">';
  h+='<input id="bkName" type="text" placeholder="'+t('Họ và tên','Full name')+'" value="'+(u.name||'')+'" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px 14px;font-size:14px;color:#F8F2E0;outline:none">';
  h+='<input id="bkPhone" type="tel" placeholder="'+t('Số điện thoại','Phone')+'" value="'+(u.phone||'')+'" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px 14px;font-size:14px;color:#F8F2E0;outline:none">';
  h+='<textarea id="bkNotes" rows="2" placeholder="'+t('Ghi chú (triệu chứng, yêu cầu đặc biệt...)','Notes (symptoms, special requests...)')+'" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px 14px;font-size:14px;color:#F8F2E0;outline:none;resize:none"></textarea>';
  h+='</div>';

  // Submit
  h+='<button id="bkSubmitBtn" onclick="window._bkSubmit()" style="width:100%;padding:15px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:12px;font-size:16px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;transition:opacity .2s">'+t('XÁC NHẬN ĐẶT LỊCH','CONFIRM BOOKING')+'</button>';
  h+='<div style="text-align:center;margin-top:8px;font-size:11px;color:rgba(248,242,224,.3)">'+t('Miễn phí hủy trước 2 giờ','Free cancellation up to 2 hours before')+'</div>';
  h+='<div style="margin-top:12px"><button onclick="_bkState.step=3;renderBooking()" style="background:none;border:none;color:#00C896;font-size:13px;cursor:pointer">← '+t('Quay lại','Back')+'</button></div>';
  return h;
}

// ── Submit Booking ──
window._bkSubmit = function(){
  var name = (document.getElementById('bkName')||{}).value||'';
  var phone = (document.getElementById('bkPhone')||{}).value||'';
  var notes = (document.getElementById('bkNotes')||{}).value||'';
  if(!name||!phone){ alert(t('Vui lòng nhập họ tên và số điện thoại','Please enter name and phone')); return; }

  var btn = document.getElementById('bkSubmitBtn');
  if(btn){ btn.disabled=true; btn.textContent=t('Đang xử lý...','Processing...'); }

  var s = _bkState.service;
  var c = _bkState.center;
  var bookingCode = 'BK-'+Date.now().toString(36).toUpperCase();
  var commRate = 0.40; // 40% service commission
  var commission = Math.round((s?s.price:0)*commRate);

  var bookingData = {
    booking_code: bookingCode,
    customer_name: name,
    customer_phone: phone,
    customer_email: (typeof currentUser!=='undefined'&&currentUser)?currentUser.email||'':'',
    service_name: s?s.name:'',
    service_sku: s?s.sku:'',
    service_price: s?s.price:0,
    center_id: c?c._id:'',
    center_name: c?c.city||c.name:'',
    booking_date: _bkState.date,
    booking_time: _bkState.time,
    duration_minutes: s?s.duration:60,
    status: 'pending',
    payment_method: 'cod',
    payment_status: 'unpaid',
    commission: commission,
    notes: notes
  };

  // Save to Supabase
  var savePromise = window.AnimaBookings ? AnimaBookings.create(bookingData) : Promise.resolve(null);

  savePromise.then(function(result){
    console.log('[Booking] Saved:', result);
    // Also save to AnimaSync for cross-tab
    if(window.AnimaSync){
      AnimaSync.push('bookings', Object.assign({_id:bookingCode}, bookingData));
      AnimaSync.push('activities',{type:'booking_new',vi:name+' đặt lịch '+s.name+' tại '+(c?c.city:''),en:name+' booked '+s.name+' at '+(c?c.city:''),ago:0});
    }
    // Create CRM lead
    if(window.AnimaCRM){
      AnimaCRM.createLead({name:name,phone:phone,source:'booking',status:'hot',notes:'Đặt lịch: '+s.name+' ngày '+_bkState.date+' '+_bkState.time,tags:['booking',s.sku]}).catch(function(){});
    }
    // Create notification for center
    if(window.AnimaNotifs && c){
      AnimaNotifs.create({user_id:c._id,user_type:'center',title:'Booking mới: '+s.name,body:name+' - '+phone+' - '+_bkState.date+' '+_bkState.time,type:'booking',link:bookingCode}).catch(function(){});
    }
    // Show success
    showBookingSuccess(bookingCode);
  }).catch(function(e){
    console.error('[Booking] Error:', e);
    // Fallback: save to localStorage
    var bks = JSON.parse(localStorage.getItem('anima_bookings')||'[]');
    bks.push(Object.assign({_id:bookingCode,createdAt:new Date().toISOString()}, bookingData));
    localStorage.setItem('anima_bookings', JSON.stringify(bks));
    showBookingSuccess(bookingCode);
  });
};

function showBookingSuccess(code){
  var c = document.getElementById('bookingContent');
  if(!c) return;
  c.innerHTML = '<div style="text-align:center;padding:20px 0">'
    +'<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#005A42,#00C896);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px">✓</div>'
    +'<div style="font-size:20px;font-weight:700;color:#F8F2E0;margin-bottom:8px">'+t('Đặt Lịch Thành Công!','Booking Confirmed!')+'</div>'
    +'<div style="font-size:13px;color:rgba(248,242,224,.4);margin-bottom:4px">'+t('Mã đặt lịch','Booking Code')+'</div>'
    +'<div style="font-size:16px;font-weight:700;color:#00C896;font-family:monospace;margin-bottom:16px">'+code+'</div>'
    +'<div style="font-size:13px;color:rgba(248,242,224,.5);margin-bottom:20px;line-height:1.6">'
    +t('Cơ sở sẽ xác nhận trong 30 phút.<br>Bạn sẽ nhận thông báo khi KTV được phân công.',
       'Center will confirm within 30 minutes.<br>You will be notified when a technician is assigned.')
    +'</div>'
    +'<button onclick="closeBooking()" style="padding:12px 32px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:10px;font-size:14px;font-weight:700;color:#000;cursor:pointer">'+t('Đóng','Close')+'</button>'
    +'</div>';
}

// ── Inject Modal HTML ──
function injectBookingModal(){
  if(document.getElementById('bookingModal')) return;
  var d = document.createElement('div');
  d.id = 'bookingModal';
  d.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;align-items:flex-start;justify-content:center;padding:20px;padding-top:5vh;opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s;overflow-y:auto';
  d.innerHTML = '<div onclick="closeBooking()" style="position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(10px)"></div>'
    +'<div style="position:relative;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;background:#0A1218;border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:24px;box-shadow:0 40px 100px rgba(0,0,0,.9)">'
    +'<button onclick="closeBooking()" style="position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(255,77,109,.08);border:1px solid rgba(255,77,109,.2);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#FF4D6D;font-size:14px">✕</button>'
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">'
    +'<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#005A42,#00C896);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>'
    +'<div><div style="font-size:15px;font-weight:700;color:#F8F2E0">'+t('Đặt Lịch Chăm Sóc','Book Wellness Session')+'</div><div style="font-size:11px;color:rgba(248,242,224,.35)">Anima Care Global</div></div>'
    +'</div>'
    +'<div id="bookingContent"></div>'
    +'</div>';
  document.body.appendChild(d);
}

// Init
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', injectBookingModal);
else injectBookingModal();

})();
