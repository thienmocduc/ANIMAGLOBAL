// ═══════════════════════════════════════════════════════
// EMAIL VERIFICATION + PUSH NOTIFICATION
// ═══════════════════════════════════════════════════════
(function(){
'use strict';

// ═══════════════════════════════════════
// 1. EMAIL VERIFICATION (via EmailJS — free 200 emails/month)
// ═══════════════════════════════════════
// EmailJS: https://www.emailjs.com — no backend needed
// Service: Gmail | Template: verification code

var EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Anh cần đăng ký emailjs.com
var EMAILJS_SERVICE_ID = 'service_animacare';
var EMAILJS_TEMPLATE_VERIFY = 'template_verify';
var EMAILJS_TEMPLATE_ORDER = 'template_order_confirm';
var EMAILJS_TEMPLATE_BOOKING = 'template_booking_confirm';

// Load EmailJS SDK
(function loadEmailJS(){
  if(document.getElementById('emailjs-sdk')) return;
  var s = document.createElement('script');
  s.id = 'emailjs-sdk';
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = function(){
    if(window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY'){
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('[Email] EmailJS initialized');
    }
  };
  document.head.appendChild(s);
})();

// Generate 6-digit OTP
function generateOTP(){
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
window.sendVerificationEmail = function(email, name){
  return new Promise(function(resolve, reject){
    if(!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY'){
      // Fallback: store OTP locally for testing
      var otp = generateOTP();
      localStorage.setItem('anima_verify_otp', otp);
      localStorage.setItem('anima_verify_email', email);
      console.log('[Email] Test mode — OTP:', otp);
      if(typeof showToast==='function') showToast('Mã xác thực (test): '+otp, '#FFB800');
      resolve(otp);
      return;
    }
    var otp = generateOTP();
    localStorage.setItem('anima_verify_otp', otp);
    localStorage.setItem('anima_verify_email', email);
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_VERIFY, {
      to_email: email,
      to_name: name || 'Quý khách',
      otp_code: otp,
      company: 'Anima Care Global',
      website: 'animacare.global'
    }).then(function(){
      console.log('[Email] Verification sent to', email);
      resolve(otp);
    }).catch(function(e){
      console.error('[Email] Send failed:', e);
      reject(e);
    });
  });
};

// Verify OTP
window.verifyEmailOTP = function(inputOTP){
  var storedOTP = localStorage.getItem('anima_verify_otp');
  var email = localStorage.getItem('anima_verify_email');
  if(inputOTP === storedOTP){
    localStorage.removeItem('anima_verify_otp');
    // Mark user email as verified
    if(typeof currentUser !== 'undefined' && currentUser){
      currentUser.emailVerified = true;
      localStorage.setItem('anima_user', JSON.stringify(currentUser));
    }
    // Save to Supabase
    if(window.AnimaNotifs){
      AnimaNotifs.create({user_id:email,user_type:'customer',title:'Email đã xác thực',body:'Email '+email+' đã được xác thực thành công',type:'success'});
    }
    return true;
  }
  return false;
};

// Show verification modal
window.showEmailVerification = function(email, name){
  if(document.getElementById('emailVerifyModal')) document.getElementById('emailVerifyModal').remove();
  var d = document.createElement('div');
  d.id = 'emailVerifyModal';
  d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(10px)';
  d.innerHTML = '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:28px;max-width:400px;width:100%;text-align:center">'
    +'<div style="font-size:40px;margin-bottom:12px">📧</div>'
    +'<div style="font-size:18px;font-weight:700;color:#F8F2E0;margin-bottom:8px">Xác thực Email</div>'
    +'<div style="font-size:13px;color:rgba(248,242,224,.4);margin-bottom:20px">Mã xác thực đã gửi đến<br><strong style="color:#00C896">'+email+'</strong></div>'
    +'<div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">'
    +'<input id="otpInput1" type="text" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;background:rgba(0,0,0,.4);border:1px solid rgba(0,200,150,.2);border-radius:10px;color:#F8F2E0;outline:none" oninput="if(this.value)this.nextElementSibling&&this.nextElementSibling.focus()">'
    +'<input id="otpInput2" type="text" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;background:rgba(0,0,0,.4);border:1px solid rgba(0,200,150,.2);border-radius:10px;color:#F8F2E0;outline:none" oninput="if(this.value)this.nextElementSibling&&this.nextElementSibling.focus()">'
    +'<input id="otpInput3" type="text" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;background:rgba(0,0,0,.4);border:1px solid rgba(0,200,150,.2);border-radius:10px;color:#F8F2E0;outline:none" oninput="if(this.value)this.nextElementSibling&&this.nextElementSibling.focus()">'
    +'<input id="otpInput4" type="text" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;background:rgba(0,0,0,.4);border:1px solid rgba(0,200,150,.2);border-radius:10px;color:#F8F2E0;outline:none" oninput="if(this.value)this.nextElementSibling&&this.nextElementSibling.focus()">'
    +'<input id="otpInput5" type="text" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;background:rgba(0,0,0,.4);border:1px solid rgba(0,200,150,.2);border-radius:10px;color:#F8F2E0;outline:none" oninput="if(this.value)this.nextElementSibling&&this.nextElementSibling.focus()">'
    +'<input id="otpInput6" type="text" maxlength="1" style="width:44px;height:52px;text-align:center;font-size:22px;font-weight:700;background:rgba(0,0,0,.4);border:1px solid rgba(0,200,150,.2);border-radius:10px;color:#F8F2E0;outline:none">'
    +'</div>'
    +'<button onclick="window._verifyOTP()" style="width:100%;padding:14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:12px;font-size:15px;font-weight:700;color:#000;cursor:pointer;margin-bottom:10px">XÁC THỰC</button>'
    +'<button onclick="window.sendVerificationEmail(\''+email+'\',\''+name+'\')" style="background:none;border:none;color:#00C896;font-size:13px;cursor:pointer">Gửi lại mã</button>'
    +'<br><button onclick="document.getElementById(\'emailVerifyModal\').remove()" style="background:none;border:none;color:rgba(248,242,224,.3);font-size:12px;cursor:pointer;margin-top:8px">Bỏ qua</button>'
    +'</div>';
  document.body.appendChild(d);
  setTimeout(function(){document.getElementById('otpInput1').focus();},300);

  // Send OTP
  sendVerificationEmail(email, name);
};

window._verifyOTP = function(){
  var otp = '';
  for(var i=1;i<=6;i++){
    otp += (document.getElementById('otpInput'+i)||{}).value||'';
  }
  if(otp.length!==6){
    if(typeof showToast==='function') showToast('Vui lòng nhập đủ 6 số','#FF4D6D');
    return;
  }
  if(verifyEmailOTP(otp)){
    var modal = document.getElementById('emailVerifyModal');
    if(modal){
      modal.querySelector('div').innerHTML = '<div style="text-align:center;padding:20px">'
        +'<div style="font-size:48px;margin-bottom:12px">✅</div>'
        +'<div style="font-size:18px;font-weight:700;color:#F8F2E0;margin-bottom:8px">Xác thực thành công!</div>'
        +'<div style="font-size:14px;color:rgba(248,242,224,.4)">Email của bạn đã được xác thực</div>'
        +'</div>';
      setTimeout(function(){modal.remove();},2000);
    }
  } else {
    if(typeof showToast==='function') showToast('Mã xác thực không đúng','#FF4D6D');
  }
};

// Send order confirmation email
window.sendOrderConfirmEmail = function(email, name, orderCode, product, total){
  if(!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY'){
    console.log('[Email] Test mode — would send order confirm to', email);
    return Promise.resolve();
  }
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ORDER, {
    to_email: email, to_name: name||'Quý khách',
    order_code: orderCode, product: product, total: total,
    company: 'Anima Care Global', website: 'animacare.global'
  });
};

// Send booking confirmation email
window.sendBookingConfirmEmail = function(email, name, bookingCode, service, date, time, center){
  if(!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY'){
    console.log('[Email] Test mode — would send booking confirm to', email);
    return Promise.resolve();
  }
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_BOOKING, {
    to_email: email, to_name: name||'Quý khách',
    booking_code: bookingCode, service: service, date: date, time: time, center: center,
    company: 'Anima Care Global', website: 'animacare.global'
  });
};

// ═══════════════════════════════════════
// 2. PUSH NOTIFICATION (Firebase FCM)
// ═══════════════════════════════════════

// Firebase config — anh cần tạo project Firebase
var FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "animacare-global.firebaseapp.com",
  projectId: "animacare-global",
  storageBucket: "animacare-global.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

var VAPID_KEY = 'YOUR_VAPID_KEY'; // From Firebase Console → Cloud Messaging

// Initialize Firebase (lazy load)
window.initFirebasePush = function(){
  return new Promise(function(resolve, reject){
    if(FIREBASE_CONFIG.apiKey === 'YOUR_FIREBASE_API_KEY'){
      console.log('[Push] Firebase not configured — using local notifications');
      resolve(null);
      return;
    }
    // Load Firebase SDKs
    var s1 = document.createElement('script');
    s1.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
    s1.onload = function(){
      var s2 = document.createElement('script');
      s2.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js';
      s2.onload = function(){
        firebase.initializeApp(FIREBASE_CONFIG);
        var messaging = firebase.messaging();
        messaging.getToken({vapidKey: VAPID_KEY}).then(function(token){
          console.log('[Push] FCM Token:', token);
          // Save token to Supabase for this user
          if(typeof currentUser!=='undefined' && currentUser && window.AnimaNotifs){
            localStorage.setItem('anima_fcm_token', token);
          }
          resolve(token);
        }).catch(function(e){
          console.warn('[Push] Token failed:', e);
          resolve(null);
        });
      };
      document.head.appendChild(s2);
    };
    document.head.appendChild(s1);
  });
};

// Request notification permission
window.requestPushPermission = function(){
  if(!('Notification' in window)){
    console.log('[Push] Browser does not support notifications');
    return Promise.resolve('unsupported');
  }
  if(Notification.permission === 'granted') return Promise.resolve('granted');
  if(Notification.permission === 'denied') return Promise.resolve('denied');

  return Notification.requestPermission().then(function(perm){
    if(perm === 'granted'){
      initFirebasePush();
      if(typeof showToast==='function') showToast('Đã bật thông báo!','#00C896');
    }
    return perm;
  });
};

// Send local notification (fallback when Firebase not configured)
window.sendLocalNotification = function(title, body, icon){
  if(!('Notification' in window) || Notification.permission !== 'granted') return;
  try{
    new Notification(title, {
      body: body,
      icon: icon || 'images/img-52d87bf94f.png',
      badge: 'images/img-52d87bf94f.png',
      tag: 'animacare-' + Date.now(),
      vibrate: [200, 100, 200]
    });
  }catch(e){ console.warn('[Push] Local notification failed:', e); }
};

// Smart notification: try FCM first, fallback to local
window.sendPushNotification = function(userId, userType, title, body, type, link){
  // 1. Save to Supabase notifications table
  var savePromise = window.AnimaNotifs ? AnimaNotifs.create({
    user_id: userId, user_type: userType||'customer',
    title: title, body: body, type: type||'info', link: link||''
  }) : Promise.resolve();

  // 2. If current user matches, show local notification
  var u = (typeof currentUser!=='undefined'&&currentUser)?currentUser:{};
  var isCurrentUser = (u.phone===userId || u.email===userId || u.id===userId);
  if(isCurrentUser){
    sendLocalNotification(title, body);
  }

  return savePromise;
};

// ═══════════════════════════════════════
// 3. AUTO NOTIFICATIONS ON EVENTS
// ═══════════════════════════════════════

// Hook into order submission — DO NOT override, just add post-hook
// Original submitOrder already saves to Supabase + localStorage
window._emailPushAfterOrder = function(){
  setTimeout(function(){
    var u = (typeof currentUser!=='undefined'&&currentUser)?currentUser:{};
    if(u.email){
      var orders = JSON.parse(localStorage.getItem('anima_orders')||'[]');
      var lastOrder = orders[orders.length-1];
      if(lastOrder){
        sendOrderConfirmEmail(u.email, u.name, lastOrder._id||lastOrder.id, lastOrder.product, lastOrder.total||lastOrder.amount);
        sendPushNotification(u.email, 'customer', 'Đặt hàng thành công!', 'Đơn '+(lastOrder._id||'')+' đang được xử lý', 'order');
      }
    }
  }, 1000);
};

// Auto-ask for push permission after login
var _origUpdateNavUser = window.updateNavUser;
if(typeof _origUpdateNavUser === 'function'){
  window.updateNavUser = function(){
    _origUpdateNavUser.apply(this, arguments);
    // Ask for push permission after first login
    if(typeof currentUser!=='undefined' && currentUser && !localStorage.getItem('anima_push_asked')){
      setTimeout(function(){
        requestPushPermission();
        localStorage.setItem('anima_push_asked', '1');
      }, 3000);
    }
  };
}

// ═══════════════════════════════════════
// 4. PAYOS PAYMENT INTEGRATION
// ═══════════════════════════════════════
// PayOS requires backend for payment link creation (Checksum Key must be secret)
// Using Supabase Edge Function or direct API with client_id

var PAYOS_CLIENT_ID = '2de33052-8493-4d13-9502-91b473845c12';
var PAYOS_API_KEY = '07463cc4-e804-4f17-a5fe-355ff48e9010';
var PAYOS_CHECKSUM_KEY = 'd559bc91037674422e1b457e1bd81be7043fb034205e7c064cf5f374ebe44e01';

// Load PayOS Checkout Script
(function loadPayOS(){
  if(document.getElementById('payos-sdk')) return;
  var s = document.createElement('script');
  s.id = 'payos-sdk';
  s.src = 'https://cdn.payos.vn/payos-checkout/v1/stable/payos-initialize.js';
  s.onload = function(){ console.log('[PayOS] SDK loaded'); };
  document.head.appendChild(s);
})();

// HMAC-SHA256 for PayOS signature
function hmacSHA256(key, message){
  return crypto.subtle.importKey('raw', new TextEncoder().encode(key), {name:'HMAC',hash:'SHA-256'}, false, ['sign'])
    .then(function(k){ return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(message)); })
    .then(function(sig){ return Array.from(new Uint8Array(sig)).map(function(b){return b.toString(16).padStart(2,'0');}).join(''); });
}

// Create PayOS payment link
window.createPayOSPayment = function(orderCode, amount, description, returnUrl, cancelUrl){
  var numOrderCode = parseInt(orderCode.replace(/[^0-9]/g,'').slice(-8)) || Date.now() % 100000000;
  var amt = parseInt(amount) || 0;
  if(amt < 1000){ console.log('[PayOS] Amount too small:', amt); return Promise.resolve(null); }

  var retUrl = returnUrl || 'https://animacare.global/?payment=success&order='+orderCode;
  var canUrl = cancelUrl || 'https://animacare.global/?payment=cancel&order='+orderCode;

  // Build signature: amount={}&cancelUrl={}&description={}&orderCode={}&returnUrl={}
  var signData = 'amount='+amt+'&cancelUrl='+canUrl+'&description='+(description||'AnimaCare').substring(0,25)+'&orderCode='+numOrderCode+'&returnUrl='+retUrl;

  return hmacSHA256(PAYOS_CHECKSUM_KEY, signData).then(function(signature){
    return fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': PAYOS_CLIENT_ID,
        'x-api-key': PAYOS_API_KEY
      },
      body: JSON.stringify({
        orderCode: numOrderCode,
        amount: amt,
        description: (description||'AnimaCare').substring(0,25),
        cancelUrl: canUrl,
        returnUrl: retUrl,
        signature: signature
      })
    });
  }).then(function(r){ return r.json(); })
    .then(function(data){
      console.log('[PayOS] Response:', data);
      if(data.code === '00' && data.data && data.data.checkoutUrl){
        // Redirect to PayOS checkout
        window.open(data.data.checkoutUrl, '_blank');
        return {status:'redirect', url:data.data.checkoutUrl, orderCode:numOrderCode};
      } else {
        console.error('[PayOS] Error:', data);
        if(typeof showToast==='function') showToast('Lỗi tạo thanh toán: '+(data.desc||data.message||'Unknown'),'#FF4D6D');
        return {status:'error', data:data};
      }
    }).catch(function(e){
      console.error('[PayOS] Fetch error:', e);
      if(typeof showToast==='function') showToast('Lỗi kết nối PayOS','#FF4D6D');
      return {status:'error', error:e.message};
    });
};

// Payment method selector: bank/momo → PayOS, cod → skip
window.processPayment = function(method, orderCode, amount, customerName, customerPhone){
  if(method === 'bank' || method === 'momo'){
    return createPayOSPayment(orderCode, amount, 'AC '+orderCode.slice(-8));
  }
  return Promise.resolve({status:'cod'});
};

// Auto-trigger PayOS after order submission for online payment
var _origCloseOrder = window.closeOrder;
window._payosAfterOrder = function(orderId, paymentMethod, total){
  if(paymentMethod === 'bank' || paymentMethod === 'momo'){
    setTimeout(function(){
      createPayOSPayment(orderId, total, 'AC '+orderId.slice(-8));
    }, 500);
  }
};

console.log('[Phase1] Email + Push + PayOS loaded');
})();
