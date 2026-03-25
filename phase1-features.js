// ═══════════════════════════════════════════════════════
// PHASE 1 MVP: WALLET + RATING + KYC
// ═══════════════════════════════════════════════════════
(function(){
'use strict';
function t(vi,en){return(typeof lang!=='undefined'&&lang==='en')?en:vi;}
function money(n){return(n||0).toLocaleString('vi-VN')+'đ';}

// ═══════════════════════════════════════
// 1. WALLET SYSTEM (KTV + Center)
// ═══════════════════════════════════════

// Auto-credit wallet when booking completed
window.completeBookingAndPay = function(bookingId, ktvId, ktvName, centerId, commission){
  if(!window.AnimaWallets) return Promise.resolve();
  // Ensure KTV wallet exists
  return AnimaWallets.getOrCreate(ktvId, 'ktv', ktvName).then(function(){
    // Credit KTV 70% of commission, Center 30%
    var ktvShare = Math.round(commission * 0.7);
    var centerShare = commission - ktvShare;
    var p1 = AnimaWallets.addEarning(ktvId, ktvShare, 'Hoa hồng buổi #'+bookingId, bookingId, 'booking');
    var p2 = centerId ? AnimaWallets.getOrCreate(centerId,'center',centerId).then(function(){
      return AnimaWallets.addEarning(centerId, centerShare, 'Hoa hồng cơ sở #'+bookingId, bookingId, 'booking');
    }) : Promise.resolve();
    return Promise.all([p1, p2]);
  });
};

// KTV Withdrawal Request
window.requestWithdrawal = function(ownerId, ownerName, amount, bankName, bankAccount, bankHolder){
  if(!window.AnimaWallets || !window.AnimaWithdrawals) return Promise.reject('Not ready');
  return AnimaWallets.get(ownerId).then(function(w){
    if(!w) throw new Error('Ví không tồn tại');
    if(w.balance < amount) throw new Error('Số dư không đủ ('+money(w.balance)+')');
    // Deduct balance
    var newBal = w.balance - amount;
    return Promise.all([
      AnimaWallets.update(w.id, {balance: newBal, total_withdrawn: (w.total_withdrawn||0)+amount}),
      AnimaWithdrawals.create({
        wallet_id: w.id, owner_id: ownerId, owner_name: ownerName,
        amount: amount, bank_name: bankName||w.bank_name, bank_account: bankAccount||w.bank_account,
        bank_holder: bankHolder||w.bank_holder, status: 'pending'
      }),
      sbPushTx(w.id, 'withdrawal', -amount, 'Yêu cầu rút tiền', null, null, newBal)
    ]);
  });
};

function sbPushTx(walletId, type, amount, desc, refId, refType, balAfter){
  if(!window.AnimaWallets) return Promise.resolve();
  var SB='https://pvhfzqopcorzaoghbywo.supabase.co';
  var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGZ6cW9wY29yemFvZ2hieXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjIyNDksImV4cCI6MjA4NzY5ODI0OX0.rv1CJizk4GpFjOw7I5ifipyEYv2TMSGeQbdf358PjBU';
  return fetch(SB+'/rest/v1/wallet_transactions',{
    method:'POST',headers:{'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Prefer':'return=representation'},
    body:JSON.stringify({wallet_id:walletId,type:type,amount:amount,description:desc||'',reference_id:refId||'',reference_type:refType||'',balance_after:balAfter||0})
  }).then(function(r){return r.json();});
}

// ═══════════════════════════════════════
// 2. RATING SYSTEM
// ═══════════════════════════════════════

// Show rating popup after completed booking
window.showRatingPopup = function(bookingId, ktvId, ktvName){
  if(document.getElementById('ratingModal')) document.getElementById('ratingModal').remove();
  var d = document.createElement('div');
  d.id = 'ratingModal';
  d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.85);backdrop-filter:blur(10px)';

  var stars = 0;
  d.innerHTML = '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:28px;max-width:400px;width:100%;text-align:center">'
    +'<div style="font-size:40px;margin-bottom:12px">⭐</div>'
    +'<div style="font-size:18px;font-weight:700;color:#F8F2E0;margin-bottom:4px">'+t('Đánh giá buổi trị liệu','Rate your session')+'</div>'
    +'<div style="font-size:13px;color:rgba(248,242,224,.4);margin-bottom:16px">KTV: <strong style="color:#00C896">'+(ktvName||t('Kỹ thuật viên','Technician'))+'</strong></div>'
    +'<div id="ratingStars" style="display:flex;justify-content:center;gap:8px;margin-bottom:16px">'
    +[1,2,3,4,5].map(function(n){return '<div onclick="window._setRatingStar('+n+')" style="cursor:pointer;font-size:32px;opacity:.3;transition:all .2s" data-star="'+n+'">★</div>';}).join('')
    +'</div>'
    +'<div id="ratingLabel" style="font-size:14px;color:#FFB800;font-weight:600;margin-bottom:12px;min-height:20px"></div>'
    +'<textarea id="ratingComment" rows="3" placeholder="'+t('Chia sẻ cảm nhận của bạn...','Share your experience...')+'" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;font-size:14px;color:#F8F2E0;outline:none;resize:none;margin-bottom:16px"></textarea>'
    +'<div style="display:flex;gap:8px">'
    +'<button onclick="document.getElementById(\'ratingModal\').remove()" style="flex:1;padding:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#F8F2E0;font-size:14px;cursor:pointer">'+t('Bỏ qua','Skip')+'</button>'
    +'<button id="ratingSubmitBtn" onclick="window._submitRating(\''+bookingId+'\',\''+ktvId+'\',\''+ktvName+'\')" style="flex:2;padding:12px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:10px;color:#000;font-size:14px;font-weight:700;cursor:pointer;opacity:.5" disabled>'+t('Gửi đánh giá','Submit')+'</button>'
    +'</div></div>';
  document.body.appendChild(d);
  window._currentRatingStars = 0;
};

var ratingLabels = {1:'Rất tệ',2:'Tệ',3:'Bình thường',4:'Tốt',5:'Xuất sắc'};
window._setRatingStar = function(n){
  window._currentRatingStars = n;
  var starsEl = document.querySelectorAll('#ratingStars [data-star]');
  starsEl.forEach(function(s){
    var v = parseInt(s.getAttribute('data-star'));
    s.style.opacity = v <= n ? '1' : '.3';
    s.style.color = v <= n ? '#FFB800' : '#F8F2E0';
    s.style.transform = v <= n ? 'scale(1.15)' : 'scale(1)';
  });
  var label = document.getElementById('ratingLabel');
  if(label) label.textContent = ratingLabels[n] || '';
  var btn = document.getElementById('ratingSubmitBtn');
  if(btn){ btn.disabled = false; btn.style.opacity = '1'; }
};

window._submitRating = function(bookingId, ktvId, ktvName){
  var stars = window._currentRatingStars || 0;
  if(stars < 1) return;
  var comment = (document.getElementById('ratingComment')||{}).value||'';
  var u = (typeof currentUser!=='undefined'&&currentUser)?currentUser:{};
  var btn = document.getElementById('ratingSubmitBtn');
  if(btn){btn.disabled=true;btn.textContent=t('Đang gửi...','Sending...');}

  var ratingData = {
    booking_id: bookingId,
    rater_type: 'customer',
    rater_name: u.name || 'Khách',
    rated_type: 'ktv',
    rated_id: ktvId,
    rated_name: ktvName || '',
    stars: stars,
    comment: comment,
    tags: JSON.stringify(stars>=4?['positive']:stars<=2?['negative']:['neutral'])
  };

  var p = window.AnimaRatings ? AnimaRatings.create(ratingData) : Promise.resolve(null);
  p.then(function(){
    var modal = document.getElementById('ratingModal');
    if(modal){
      modal.querySelector('div').innerHTML = '<div style="text-align:center;padding:20px">'
        +'<div style="font-size:48px;margin-bottom:12px">🙏</div>'
        +'<div style="font-size:18px;font-weight:700;color:#F8F2E0;margin-bottom:8px">'+t('Cảm ơn bạn!','Thank you!')+'</div>'
        +'<div style="font-size:14px;color:rgba(248,242,224,.4)">'+t('Đánh giá của bạn giúp cải thiện dịch vụ','Your feedback helps us improve')+'</div>'
        +'</div>';
      setTimeout(function(){modal.remove();},2000);
    }
    // Notify KTV
    if(window.AnimaNotifs){
      AnimaNotifs.create({user_id:ktvId,user_type:'ktv',title:'Đánh giá mới: '+stars+'⭐',body:(u.name||'Khách')+': '+comment,type:'rating',link:bookingId}).catch(function(){});
    }
  }).catch(function(e){
    console.error('[Rating]',e);
    if(btn){btn.textContent=t('Lỗi, thử lại','Error, retry');btn.disabled=false;}
  });
};

// ═══════════════════════════════════════
// 3. KYC VERIFICATION (KTV đăng ký)
// ═══════════════════════════════════════

window.showKYCForm = function(){
  if(document.getElementById('kycModal')) document.getElementById('kycModal').remove();
  var d = document.createElement('div');
  d.id = 'kycModal';
  d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:20px;padding-top:5vh;overflow-y:auto;background:rgba(0,0,0,.85);backdrop-filter:blur(10px)';
  d.innerHTML = '<div style="background:#0A1218;border:1px solid rgba(0,200,150,.2);border-radius:20px;padding:28px;max-width:480px;width:100%">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><div style="font-size:18px;font-weight:700;color:#F8F2E0">'+t('Đăng Ký Kỹ Thuật Viên','KTV Registration')+'</div><button onclick="document.getElementById(\'kycModal\').remove()" style="background:none;border:none;color:#FF4D6D;font-size:18px;cursor:pointer">✕</button></div>'
    +'<div style="font-size:13px;color:rgba(248,242,224,.4);margin-bottom:16px">'+t('Hoàn thành hồ sơ để trở thành KTV chính thức của Anima Care','Complete your profile to become an official Anima Care technician')+'</div>'
    +'<div style="display:flex;flex-direction:column;gap:12px">'
    // Name
    +'<div><label style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">'+t('Họ và tên','Full name')+'</label>'
    +'<input id="kycName" type="text" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;font-size:14px;color:#F8F2E0;outline:none"></div>'
    // Phone
    +'<div><label style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">'+t('Số điện thoại','Phone')+'</label>'
    +'<input id="kycPhone" type="tel" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;font-size:14px;color:#F8F2E0;outline:none"></div>'
    // Email
    +'<div><label style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">Email</label>'
    +'<input id="kycEmail" type="email" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;font-size:14px;color:#F8F2E0;outline:none"></div>'
    // CCCD
    +'<div><label style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">'+t('Số CCCD/CMND','ID Number')+'</label>'
    +'<input id="kycIdNum" type="text" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;font-size:14px;color:#F8F2E0;outline:none"></div>'
    // Center
    +'<div><label style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">'+t('Cơ sở đăng ký','Preferred Center')+'</label>'
    +'<select id="kycCenter" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;font-size:14px;color:#F8F2E0;outline:none"><option value="">— '+t('Chọn cơ sở','Select center')+' —</option></select></div>'
    // Experience
    +'<div><label style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">'+t('Kinh nghiệm (năm)','Experience (years)')+'</label>'
    +'<input id="kycExp" type="number" min="0" max="50" value="0" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(0,200,150,.15);border-radius:10px;padding:12px;font-size:14px;color:#F8F2E0;outline:none"></div>'
    // Specialties
    +'<div><label style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">'+t('Chuyên môn','Specialties')+'</label>'
    +'<div id="kycSpecs" style="display:flex;flex-wrap:wrap;gap:6px">'
    +['Massage','Châm cứu','Xông hơi','Bồn ngâm','Thảo mộc nhiệt','AI Scan','Khai vấn'].map(function(s){
      return '<button type="button" onclick="this.classList.toggle(\'on\');this.style.background=this.classList.contains(\'on\')?\'rgba(0,200,150,.2)\':\'transparent\';this.style.color=this.classList.contains(\'on\')?\'#00C896\':\'rgba(248,242,224,.5)\';this.style.borderColor=this.classList.contains(\'on\')?\'#00C896\':\'rgba(0,200,150,.15)\'" style="padding:6px 12px;border-radius:16px;border:1px solid rgba(0,200,150,.15);background:transparent;color:rgba(248,242,224,.5);font-size:12px;cursor:pointer;transition:all .2s" data-spec="'+s+'">'+s+'</button>';
    }).join('')
    +'</div></div>'
    // Submit
    +'<button onclick="window._submitKYC()" style="width:100%;margin-top:8px;padding:14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:12px;font-size:15px;font-weight:700;color:#000;cursor:pointer">'+t('NỘP HỒ SƠ','SUBMIT APPLICATION')+'</button>'
    +'<div style="font-size:11px;color:rgba(248,242,224,.3);text-align:center;margin-top:8px">'+t('Admin sẽ xét duyệt trong 24-48 giờ','Admin will review within 24-48 hours')+'</div>'
    +'</div></div>';
  document.body.appendChild(d);

  // Populate centers
  if(window.AnimaSync){
    var sel = document.getElementById('kycCenter');
    AnimaSync.get('centers',[]).filter(function(c){return c.tier===1;}).forEach(function(c){
      var opt = document.createElement('option');
      opt.value = c._id; opt.textContent = c.city+' — '+c.name;
      sel.appendChild(opt);
    });
  }
};

window._submitKYC = function(){
  var name = (document.getElementById('kycName')||{}).value||'';
  var phone = (document.getElementById('kycPhone')||{}).value||'';
  var email = (document.getElementById('kycEmail')||{}).value||'';
  var idNum = (document.getElementById('kycIdNum')||{}).value||'';
  var center = (document.getElementById('kycCenter')||{}).value||'';
  var exp = parseInt((document.getElementById('kycExp')||{}).value||'0');
  if(!name||!phone||!idNum){alert(t('Vui lòng điền đầy đủ thông tin','Please fill all required fields'));return;}

  var specs = [];
  document.querySelectorAll('#kycSpecs .on').forEach(function(b){specs.push(b.getAttribute('data-spec'));});

  var data = {
    ktv_name:name, ktv_phone:phone, ktv_email:email,
    id_number:idNum, center_id:center,
    specialties:JSON.stringify(specs), experience_years:exp, status:'pending'
  };

  var p = window.AnimaKYC ? AnimaKYC.create(data) : Promise.resolve(null);
  p.then(function(r){
    console.log('[KYC] Submitted:',r);
    // Also save to AnimaSync
    if(window.AnimaSync) AnimaSync.push('kyc_requests', Object.assign({_id:'KYC-'+Date.now()},data));
    // Notify admin
    if(window.AnimaNotifs) AnimaNotifs.create({user_id:'admin',user_type:'admin',title:'KYC mới: '+name,body:phone+' — '+specs.join(', '),type:'kyc'}).catch(function(){});

    var modal = document.getElementById('kycModal');
    if(modal){
      modal.querySelector('div').innerHTML = '<div style="text-align:center;padding:30px">'
        +'<div style="font-size:48px;margin-bottom:12px">✅</div>'
        +'<div style="font-size:18px;font-weight:700;color:#F8F2E0;margin-bottom:8px">'+t('Nộp hồ sơ thành công!','Application submitted!')+'</div>'
        +'<div style="font-size:14px;color:rgba(248,242,224,.4);margin-bottom:20px">'+t('Admin sẽ xét duyệt trong 24-48 giờ. Bạn sẽ nhận thông báo khi được phê duyệt.','Admin will review within 24-48 hours. You will be notified upon approval.')+'</div>'
        +'<button onclick="document.getElementById(\'kycModal\').remove()" style="padding:12px 24px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:10px;color:#000;font-weight:700;cursor:pointer">'+t('Đóng','Close')+'</button>'
        +'</div>';
    }
  }).catch(function(e){
    console.error('[KYC]',e);
    alert(t('Lỗi gửi hồ sơ, vui lòng thử lại','Error submitting, please try again'));
  });
};

// ═══════════════════════════════════════
// 4. ADMIN: Wallet Management + KYC Review
// ═══════════════════════════════════════

// Render Wallets page in admin
window.renderAdmWallets = function(){
  var el = document.getElementById('admPageContent'); if(!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#607870">Loading wallets...</div>';
  if(!window.AnimaWallets){el.innerHTML='<div style="padding:40px;color:#607870">Supabase not connected</div>';return;}

  Promise.all([
    fetch('https://pvhfzqopcorzaoghbywo.supabase.co/rest/v1/wallets?select=*&order=total_earned.desc&limit=50',{headers:{'apikey':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGZ6cW9wY29yemFvZ2hieXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjIyNDksImV4cCI6MjA4NzY5ODI0OX0.rv1CJizk4GpFjOw7I5ifipyEYv2TMSGeQbdf358PjBU'}}).then(function(r){return r.json();}),
    AnimaWithdrawals.getAll({limit:50})
  ]).then(function(results){
    var wallets = results[0]||[];
    var withdrawals = results[1]||[];
    var totalBalance = wallets.reduce(function(s,w){return s+(w.balance||0);},0);
    var totalEarned = wallets.reduce(function(s,w){return s+(w.total_earned||0);},0);
    var pendingWD = withdrawals.filter(function(w){return w.status==='pending';});

    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">';
    [{l:'Tổng ví',v:wallets.length,c:'#00C896'},{l:'Tổng số dư',v:money(totalBalance),c:'#FFB800'},{l:'Tổng earned',v:money(totalEarned),c:'#60A5FA'},{l:'Rút tiền chờ',v:pendingWD.length,c:'#FF4D6D'}].forEach(function(k){
      h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:700;color:'+k.c+'">'+k.v+'</div><div style="font-size:9px;color:#607870">'+k.l+'</div></div>';
    });
    h+='</div>';

    // Pending withdrawals
    if(pendingWD.length){
      h+='<div class="adm-card" style="margin-bottom:12px"><div class="adm-card-header"><span class="adm-card-title" style="color:#FF4D6D">⚠ Yêu cầu rút tiền ('+pendingWD.length+')</span></div>';
      h+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>KTV</th><th>Số tiền</th><th>Ngân hàng</th><th>STK</th><th>Ngày</th><th>Action</th></tr></thead><tbody>';
      pendingWD.forEach(function(w){
        h+='<tr><td style="font-weight:600">'+w.owner_name+'</td><td style="color:#FFB800;font-weight:700">'+money(w.amount)+'</td><td>'+w.bank_name+'</td><td style="font-family:monospace;font-size:11px">'+w.bank_account+'</td><td style="font-size:11px">'+new Date(w.created_at).toLocaleDateString('vi-VN')+'</td>';
        h+='<td><button onclick="window._admApproveWD(\''+w.id+'\')" class="adm-btn adm-btn-primary" style="font-size:10px;padding:4px 8px;margin-right:4px">Duyệt</button><button onclick="window._admRejectWD(\''+w.id+'\')" class="adm-btn" style="font-size:10px;padding:4px 8px;background:rgba(255,77,109,.1);color:#FF4D6D;border:1px solid rgba(255,77,109,.2)">Từ chối</button></td></tr>';
      });
      h+='</tbody></table></div></div>';
    }

    // All wallets
    h+='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title">Tất cả ví ('+wallets.length+')</span></div>';
    h+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>Chủ ví</th><th>Loại</th><th>Số dư</th><th>Tổng earned</th><th>Đã rút</th></tr></thead><tbody>';
    wallets.forEach(function(w){
      h+='<tr><td style="font-weight:600">'+w.owner_name+'</td><td><span class="adm-badge adm-badge-'+(w.owner_type==='ktv'?'blue':'green')+'">'+(w.owner_type==='ktv'?'KTV':'Center')+'</span></td><td style="color:#FFB800;font-weight:600">'+money(w.balance)+'</td><td style="color:#00C896">'+money(w.total_earned)+'</td><td>'+money(w.total_withdrawn)+'</td></tr>';
    });
    h+='</tbody></table></div></div>';
    el.innerHTML = h;
  });
};

window._admApproveWD = function(id){
  if(!confirm('Duyệt yêu cầu rút tiền?')) return;
  AnimaWithdrawals.approve(id,'Đã chuyển khoản').then(function(){renderAdmWallets();});
};
window._admRejectWD = function(id){
  var reason = prompt('Lý do từ chối:');
  if(!reason) return;
  AnimaWithdrawals.reject(id,reason).then(function(){renderAdmWallets();});
};

// Render KYC page in admin
window.renderAdmKYC = function(){
  var el = document.getElementById('admPageContent'); if(!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#607870">Loading KYC...</div>';
  if(!window.AnimaKYC){el.innerHTML='<div style="padding:40px;color:#607870">Supabase not connected</div>';return;}

  AnimaKYC.getAll({limit:50}).then(function(kycs){
    var pending = kycs.filter(function(k){return k.status==='pending';});
    var approved = kycs.filter(function(k){return k.status==='approved';});

    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">';
    [{l:'Tổng đơn KYC',v:kycs.length,c:'#00C896'},{l:'Chờ duyệt',v:pending.length,c:'#F59E0B'},{l:'Đã duyệt',v:approved.length,c:'#22C55E'}].forEach(function(k){
      h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:700;color:'+k.c+'">'+k.v+'</div><div style="font-size:9px;color:#607870">'+k.l+'</div></div>';
    });
    h+='</div>';

    h+='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title">Hồ sơ KTV ('+kycs.length+')</span></div>';
    h+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>Tên</th><th>SĐT</th><th>CCCD</th><th>Kinh nghiệm</th><th>Chuyên môn</th><th>Cơ sở</th><th>Trạng thái</th><th>Action</th></tr></thead><tbody>';
    kycs.forEach(function(k){
      var specs = [];try{specs=typeof k.specialties==='string'?JSON.parse(k.specialties):k.specialties||[];}catch(e){}
      var statusColors = {pending:'yellow',approved:'green',rejected:'red'};
      var statusLabels = {pending:'Chờ duyệt',approved:'Đã duyệt',rejected:'Từ chối'};
      h+='<tr><td style="font-weight:600">'+k.ktv_name+'</td><td>'+k.ktv_phone+'</td><td style="font-family:monospace;font-size:11px">'+k.id_number+'</td><td>'+k.experience_years+' năm</td><td style="font-size:10px">'+specs.join(', ')+'</td><td style="font-size:11px">'+k.center_id+'</td>';
      h+='<td><span class="adm-badge adm-badge-'+(statusColors[k.status]||'yellow')+'">'+(statusLabels[k.status]||k.status)+'</span></td>';
      h+='<td>';
      if(k.status==='pending'){
        h+='<button onclick="window._admApproveKYC(\''+k.id+'\')" class="adm-btn adm-btn-primary" style="font-size:10px;padding:4px 8px;margin-right:4px">Duyệt</button>';
        h+='<button onclick="window._admRejectKYC(\''+k.id+'\')" class="adm-btn" style="font-size:10px;padding:4px 8px;background:rgba(255,77,109,.1);color:#FF4D6D;border:1px solid rgba(255,77,109,.2)">Từ chối</button>';
      }
      h+='</td></tr>';
    });
    h+='</tbody></table></div></div>';
    el.innerHTML = h;
  });
};

window._admApproveKYC = function(id){
  if(!confirm('Duyệt KTV này?')) return;
  AnimaKYC.approve(id,'Đã xác minh').then(function(){renderAdmKYC();});
};
window._admRejectKYC = function(id){
  var reason = prompt('Lý do từ chối:');
  if(!reason) return;
  AnimaKYC.reject(id,reason).then(function(){renderAdmKYC();});
};

// Render Bookings management in admin
window.renderAdmBookings = function(){
  var el = document.getElementById('admPageContent'); if(!el) return;
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#607870">Loading bookings...</div>';
  if(!window.AnimaBookings){el.innerHTML='<div style="padding:40px;color:#607870">Supabase not connected</div>';return;}

  AnimaBookings.getAll({limit:100}).then(function(bookings){
    var pending = bookings.filter(function(b){return b.status==='pending';}).length;
    var confirmed = bookings.filter(function(b){return b.status==='confirmed';}).length;
    var completed = bookings.filter(function(b){return b.status==='completed';}).length;
    var totalRev = bookings.reduce(function(s,b){return s+(b.service_price||0);},0);

    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;margin-bottom:12px">';
    [{l:'Chờ',v:pending,c:'#F59E0B'},{l:'Xác nhận',v:confirmed,c:'#60A5FA'},{l:'Hoàn thành',v:completed,c:'#22C55E'},{l:'Tổng',v:bookings.length,c:'#00C896'},{l:'Doanh thu',v:money(totalRev),c:'#FFB800'}].forEach(function(k){
      h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:8px;padding:8px;text-align:center"><div style="font-size:14px;font-weight:700;color:'+k.c+'">'+k.v+'</div><div style="font-size:9px;color:#607870">'+k.l+'</div></div>';
    });
    h+='</div>';

    h+='<div class="adm-card"><div class="adm-card-header"><span class="adm-card-title">Lịch hẹn ('+bookings.length+')</span><button class="adm-btn adm-btn-secondary" onclick="renderAdmBookings()" style="font-size:10px;padding:4px 8px">↻</button></div>';
    h+='<div class="adm-table-wrap"><table class="adm-table"><thead><tr><th>Mã</th><th>Khách</th><th>Dịch vụ</th><th>Cơ sở</th><th>Ngày</th><th>Giờ</th><th>Giá</th><th>Trạng thái</th></tr></thead><tbody>';

    var statusLabels={pending:'Chờ',confirmed:'Xác nhận',in_progress:'Đang làm',completed:'Hoàn thành',cancelled:'Hủy',no_show:'Vắng'};

    bookings.forEach(function(b){
      h+='<tr><td style="font-family:monospace;font-size:10px;color:#7B5FFF">'+b.booking_code+'</td>';
      h+='<td style="font-weight:500;font-size:11px">'+b.customer_name+'</td>';
      h+='<td style="font-size:11px">'+b.service_name+'</td>';
      h+='<td style="font-size:10px">'+b.center_name+'</td>';
      h+='<td style="font-size:11px">'+b.booking_date+'</td>';
      h+='<td style="font-size:11px;color:#00C896;font-weight:600">'+b.booking_time+'</td>';
      h+='<td style="font-size:11px;color:#FFB800;font-weight:600">'+money(b.service_price)+'</td>';
      h+='<td><select onchange="window._admUpdateBooking(\''+b.id+'\',this.value)" style="font-size:10px;background:#0A1218;color:#B8D8D0;border:1px solid rgba(0,200,150,.15);border-radius:4px;padding:2px 4px">';
      ['pending','confirmed','in_progress','completed','cancelled','no_show'].forEach(function(s){
        h+='<option value="'+s+'"'+(b.status===s?' selected':'')+'>'+(statusLabels[s]||s)+'</option>';
      });
      h+='</select></td></tr>';
    });
    h+='</tbody></table></div></div>';
    el.innerHTML = h;
  });
};

window._admUpdateBooking = function(id, status){
  var updateData = {status:status, updated_at:new Date().toISOString()};
  if(status==='completed'){
    updateData.check_out_at = new Date().toISOString();
    // Auto-credit wallet
    AnimaBookings.getAll({filter:'id=eq.'+id}).then(function(bks){
      if(bks&&bks[0]){
        var b=bks[0];
        if(b.ktv_id && b.commission){
          completeBookingAndPay(b.booking_code, b.ktv_id, b.ktv_name, b.center_id, b.commission);
        }
      }
    });
  }
  if(status==='in_progress') updateData.check_in_at = new Date().toISOString();
  AnimaBookings.update(id, updateData).then(function(){
    if(typeof showToast==='function') showToast('Cập nhật: '+status,'#00C896');
  });
};

console.log('[Phase1] Wallet + Rating + KYC loaded');
})();
