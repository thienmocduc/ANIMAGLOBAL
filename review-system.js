/* ═══════════════════════════════════════════════════════════════
   AnimaCare Review & Rating System v1.0
   - Users rate centers (1-5 stars)
   - Users rate KTV (1-5 stars)
   - Review text + photos
   - Data syncs to Admin CRM via AnimaSync
   - Bilingual VI/EN
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var rLang = (typeof lang !== 'undefined') ? lang : 'vi';
function t(vi, en) { return rLang === 'vi' ? vi : en; }

// Listen for lang changes
var origSetLang = window.setLang;
if(typeof origSetLang === 'function') {
  window.setLang = function(l) { rLang = l; origSetLang(l); };
}

// ── Review Modal ──
function createReviewModal() {
  if(document.getElementById('reviewModal')) return;
  var mo = document.createElement('div');
  mo.id = 'reviewModal';
  mo.style.cssText = 'display:none;position:fixed;inset:0;z-index:950;align-items:center;justify-content:center;background:rgba(0,0,0,.8);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)';
  mo.innerHTML = '<div id="reviewContent" style="position:relative;background:#0A1218;border:1px solid rgba(0,200,150,.15);border-radius:20px;width:95%;max-width:440px;max-height:85vh;overflow-y:auto;padding:24px;margin:16px"></div>';
  mo.addEventListener('click', function(e) { if(e.target === mo) closeReview(); });
  document.body.appendChild(mo);

  // Review styles
  var style = document.createElement('style');
  style.textContent = '.rv-stars{display:flex;gap:4px;cursor:pointer}.rv-star{width:32px;height:32px;transition:transform .15s}.rv-star:hover{transform:scale(1.2)}.rv-star.on svg{fill:#F59E0B;stroke:#F59E0B}.rv-star svg{fill:transparent;stroke:rgba(248,242,224,.2);stroke-width:1.5}.rv-tag{display:inline-block;padding:5px 12px;border-radius:16px;font-size:12px;cursor:pointer;border:1px solid rgba(0,200,150,.15);color:rgba(248,242,224,.5);transition:all .2s;margin:0 4px 6px 0}.rv-tag.on{background:rgba(0,200,150,.12);border-color:rgba(0,200,150,.4);color:#00E5A8}';
  document.head.appendChild(style);
}

function closeReview() {
  var mo = document.getElementById('reviewModal');
  if(mo) mo.style.display = 'none';
}

// ── Open Review for Center ──
window.openCenterReview = function(centerId, centerName) {
  createReviewModal();
  var mo = document.getElementById('reviewModal');
  var content = document.getElementById('reviewContent');
  mo.style.display = 'flex';

  var user = null;
  try { user = JSON.parse(localStorage.getItem('anima_current_user')); } catch(e) {}
  if(!user) {
    content.innerHTML = '<div style="text-align:center;padding:20px"><div style="font-size:16px;font-weight:600;color:#F8F2E0;margin-bottom:8px">' + t('Vui l\u00F2ng \u0111\u0103ng nh\u1EADp','Please sign in') + '</div><div style="font-size:13px;color:rgba(248,242,224,.4)">' + t('\u0110\u0103ng nh\u1EADp \u0111\u1EC3 \u0111\u00E1nh gi\u00E1','Sign in to leave a review') + '</div><button onclick="closeReview();if(typeof openAuth===\'function\')openAuth()" style="margin-top:14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:10px;padding:10px 24px;color:#000;font-weight:600;cursor:pointer">' + t('\u0110\u0103ng nh\u1EADp',  'Sign In') + '</button></div>';
    return;
  }

  window._rvData = { type:'center', targetId:centerId, targetName:centerName, rating:0, tags:[], text:'', userId:user.id||user.email, userName:user.name };

  renderReviewForm(content, centerName, 'center');
};

// ── Open Review for KTV ──
window.openKtvReview = function(ktvId, ktvName, centerId) {
  createReviewModal();
  var mo = document.getElementById('reviewModal');
  var content = document.getElementById('reviewContent');
  mo.style.display = 'flex';

  var user = null;
  try { user = JSON.parse(localStorage.getItem('anima_current_user')); } catch(e) {}
  if(!user) {
    content.innerHTML = '<div style="text-align:center;padding:20px"><div style="font-size:16px;font-weight:600;color:#F8F2E0">' + t('Vui l\u00F2ng \u0111\u0103ng nh\u1EADp','Please sign in') + '</div><button onclick="closeReview();if(typeof openAuth===\'function\')openAuth()" style="margin-top:14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:10px;padding:10px 24px;color:#000;font-weight:600;cursor:pointer">' + t('\u0110\u0103ng nh\u1EADp','Sign In') + '</button></div>';
    return;
  }

  window._rvData = { type:'ktv', targetId:ktvId, targetName:ktvName, centerId:centerId||'', rating:0, tags:[], text:'', userId:user.id||user.email, userName:user.name };

  renderReviewForm(content, ktvName, 'ktv');
};

function renderReviewForm(container, targetName, type) {
  var starSvg = '<svg viewBox="0 0 24 24" width="32" height="32"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  var tags = type === 'center'
    ? [t('S\u1EA1ch s\u1EBD','Clean'), t('Tho\u1EA3i m\u00E1i','Comfortable'), t('Chuy\u00EAn nghi\u1EC7p','Professional'), t('Gi\u00E1 h\u1EE3p l\u00FD','Good Price'), t('D\u1ECBch v\u1EE5 t\u1ED1t','Good Service'), t('Kh\u00F4ng gian \u0111\u1EB9p','Nice Space')]
    : [t('Tay ngh\u1EC1 cao','Skilled'), t('Th\u00E2n thi\u1EC7n','Friendly'), t('\u0110\u00FAng gi\u1EDD','Punctual'), t('Chuy\u00EAn m\u00F4n','Expert'), t('Nh\u1EB9 nh\u00E0ng','Gentle'), t('T\u01B0 v\u1EA5n t\u1ED1t','Good Advice')];

  var html = '';
  // Header
  html += '<div style="text-align:center;margin-bottom:20px">';
  html += '<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,' + (type==='center'?'#005A42,#00C896':'#5B3FDF,#7B5FFF') + ');display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px">';
  html += type === 'center'
    ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>'
    : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  html += '</div>';
  html += '<div style="font-size:18px;font-weight:700;color:#F8F2E0">' + t('\u0110\u00E1nh gi\u00E1 ','Rate ') + targetName + '</div>';
  html += '<div style="font-size:12px;color:rgba(248,242,224,.4);margin-top:4px">' + (type==='center' ? t('Tr\u1EA3i nghi\u1EC7m c\u1EE7a b\u1EA1n t\u1EA1i c\u01A1 s\u1EDF n\u00E0y','Your experience at this center') : t('Tr\u1EA3i nghi\u1EC7m v\u1EDBi k\u1EF9 thu\u1EADt vi\u00EAn n\u00E0y','Your experience with this technician')) + '</div>';
  html += '</div>';

  // Stars
  html += '<div style="text-align:center;margin-bottom:20px">';
  html += '<div class="rv-stars" style="justify-content:center" id="rvStars">';
  for(var i = 1; i <= 5; i++) {
    html += '<div class="rv-star" data-val="' + i + '" onclick="window._rvSetStar(' + i + ')">' + starSvg + '</div>';
  }
  html += '</div>';
  html += '<div id="rvStarLabel" style="font-size:13px;color:rgba(248,242,224,.3);margin-top:6px">' + t('Ch\u1EA1m \u0111\u1EC3 \u0111\u00E1nh gi\u00E1','Tap to rate') + '</div>';
  html += '</div>';

  // Quick tags
  html += '<div style="margin-bottom:16px">';
  html += '<div style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">' + t('\u0110\u00E1nh gi\u00E1 nhanh','Quick Tags') + '</div>';
  tags.forEach(function(tag, idx) {
    html += '<span class="rv-tag" data-idx="' + idx + '" onclick="window._rvToggleTag(' + idx + ',this)">' + tag + '</span>';
  });
  html += '</div>';

  // Review text
  html += '<div style="margin-bottom:16px">';
  html += '<div style="font-size:11px;color:rgba(248,242,224,.4);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">' + t('Nh\u1EADn x\u00E9t c\u1EE7a b\u1EA1n','Your Review') + '</div>';
  html += '<textarea id="rvText" placeholder="' + t('Chia s\u1EBB tr\u1EA3i nghi\u1EC7m c\u1EE7a b\u1EA1n...','Share your experience...') + '" style="width:100%;min-height:80px;background:#060C0F;border:1px solid rgba(0,200,150,.12);border-radius:10px;padding:12px;color:#F8F2E0;font-family:Roboto,sans-serif;font-size:14px;resize:vertical;outline:none;box-sizing:border-box"></textarea>';
  html += '</div>';

  // Submit
  html += '<button onclick="window._rvSubmit()" id="rvSubmitBtn" style="width:100%;padding:14px;background:linear-gradient(135deg,' + (type==='center'?'#005A42,#00C896':'#5B3FDF,#7B5FFF') + ');border:none;border-radius:12px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;opacity:.4;pointer-events:none;transition:opacity .2s">' + t('G\u1EEDi \u0111\u00E1nh gi\u00E1','Submit Review') + '</button>';

  // Previous reviews
  html += '<div id="rvPrevious" style="margin-top:20px;border-top:1px solid rgba(0,200,150,.08);padding-top:16px"></div>';

  // Close button
  html += '<button onclick="closeReview()" style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(248,242,224,.4);font-size:14px">\u2715</button>';

  container.innerHTML = html;

  // Load previous reviews
  loadPreviousReviews(type === 'center' ? window._rvData.targetId : window._rvData.targetId);
}

var starLabels = {
  vi: ['', 'R\u1EA5t t\u1EC7', 'T\u1EA1m \u0111\u01B0\u1EE3c', 'T\u1ED1t', 'R\u1EA5t t\u1ED1t', 'Xu\u1EA5t s\u1EAFc!'],
  en: ['', 'Terrible', 'Fair', 'Good', 'Very Good', 'Excellent!']
};

window._rvSetStar = function(val) {
  window._rvData.rating = val;
  var stars = document.querySelectorAll('#rvStars .rv-star');
  stars.forEach(function(s) {
    var v = parseInt(s.getAttribute('data-val'));
    if(v <= val) s.classList.add('on');
    else s.classList.remove('on');
  });
  var label = document.getElementById('rvStarLabel');
  if(label) label.textContent = (rLang === 'vi' ? starLabels.vi : starLabels.en)[val] || '';
  label.style.color = val >= 4 ? '#00E5A8' : val >= 3 ? '#F59E0B' : '#FF4D6D';
  // Enable submit
  var btn = document.getElementById('rvSubmitBtn');
  if(btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
};

window._rvToggleTag = function(idx, el) {
  var tags = window._rvData.tags;
  var i = tags.indexOf(idx);
  if(i === -1) { tags.push(idx); el.classList.add('on'); }
  else { tags.splice(i, 1); el.classList.remove('on'); }
};

window._rvSubmit = function() {
  var data = window._rvData;
  if(!data || data.rating === 0) return;
  data.text = (document.getElementById('rvText').value || '').trim();
  data.createdAt = Date.now();
  data.date = new Date().toISOString().split('T')[0];

  // Save to AnimaSync
  if(window.AnimaSync) {
    AnimaSync.push('reviews', {
      type: data.type,
      targetId: data.targetId,
      targetName: data.targetName,
      centerId: data.centerId || data.targetId,
      rating: data.rating,
      tags: data.tags,
      text: data.text,
      userId: data.userId,
      userName: data.userName,
      date: data.date,
      createdAt: data.createdAt
    });

    // Push activity
    AnimaSync.push('activities', {
      type: 'review_new',
      vi: data.userName + ' \u0111\u00E1nh gi\u00E1 ' + data.rating + '\u2605 cho ' + data.targetName,
      en: data.userName + ' rated ' + data.targetName + ' ' + data.rating + '\u2605',
      centerId: data.centerId || data.targetId,
      ago: 0
    });
  }

  // Also save to localStorage for offline access
  var reviews = [];
  try { reviews = JSON.parse(localStorage.getItem('anima_reviews') || '[]'); } catch(e) {}
  reviews.push(data);
  localStorage.setItem('anima_reviews', JSON.stringify(reviews));

  // Show success
  var content = document.getElementById('reviewContent');
  content.innerHTML = '<div style="text-align:center;padding:30px 20px">' +
    '<div style="width:60px;height:60px;border-radius:50%;background:rgba(0,200,150,.1);display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00E5A8" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
    '<div style="font-size:18px;font-weight:700;color:#00E5A8;margin-bottom:6px">' + t('C\u1EA3m \u01A1n b\u1EA1n!','Thank you!') + '</div>' +
    '<div style="font-size:14px;color:rgba(248,242,224,.5)">' + t('\u0110\u00E1nh gi\u00E1 c\u1EE7a b\u1EA1n \u0111\u00E3 \u0111\u01B0\u1EE3c g\u1EEDi.','Your review has been submitted.') + '</div>' +
    '<div style="display:flex;justify-content:center;gap:4px;margin-top:12px">';
  for(var i = 0; i < 5; i++) {
    content.innerHTML; // force reflow
  }
  var starsHtml = '';
  for(var i = 1; i <= 5; i++) {
    starsHtml += '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + (i <= data.rating ? '#F59E0B' : 'transparent') + '" stroke="' + (i <= data.rating ? '#F59E0B' : 'rgba(248,242,224,.15)') + '" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  content.innerHTML = '<div style="text-align:center;padding:30px 20px">' +
    '<div style="width:60px;height:60px;border-radius:50%;background:rgba(0,200,150,.1);display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00E5A8" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
    '<div style="font-size:18px;font-weight:700;color:#00E5A8;margin-bottom:6px">' + t('C\u1EA3m \u01A1n b\u1EA1n!','Thank you!') + '</div>' +
    '<div style="display:flex;justify-content:center;gap:4px;margin:12px 0">' + starsHtml + '</div>' +
    '<div style="font-size:14px;color:rgba(248,242,224,.5)">' + t('\u0110\u00E1nh gi\u00E1 c\u1EE7a b\u1EA1n \u0111\u00E3 \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn h\u1EC7 th\u1ED1ng.','Your review has been submitted to our system.') + '</div>' +
    '<button onclick="closeReview()" style="margin-top:16px;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2);border-radius:10px;padding:10px 24px;color:#00E5A8;font-weight:600;cursor:pointer">' + t('\u0110\u00F3ng','Close') + '</button></div>';

  if(typeof showToast === 'function') showToast(t('\u0110\u00E1nh gi\u00E1 th\u00E0nh c\u00F4ng!','Review submitted!'), 'var(--g2)');
};

function loadPreviousReviews(targetId) {
  var container = document.getElementById('rvPrevious');
  if(!container) return;

  var allReviews = [];
  try { allReviews = JSON.parse(localStorage.getItem('anima_reviews') || '[]'); } catch(e) {}
  if(window.AnimaSync) {
    var syncReviews = AnimaSync.get('reviews', []);
    syncReviews.forEach(function(r) {
      if(!allReviews.some(function(a) { return a.createdAt === r.createdAt && a.userId === r.userId; })) {
        allReviews.push(r);
      }
    });
  }

  var filtered = allReviews.filter(function(r) { return r.targetId === targetId; });
  if(filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:16px;color:rgba(248,242,224,.2);font-size:13px">' + t('Ch\u01B0a c\u00F3 \u0111\u00E1nh gi\u00E1 n\u00E0o','No reviews yet') + '</div>';
    return;
  }

  // Calculate average
  var avg = filtered.reduce(function(s,r) { return s + r.rating; }, 0) / filtered.length;

  var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">';
  html += '<span style="font-size:24px;font-weight:700;color:#F59E0B">' + avg.toFixed(1) + '</span>';
  html += '<div>';
  var starsHtml = '';
  for(var i = 1; i <= 5; i++) {
    starsHtml += '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (i <= Math.round(avg) ? '#F59E0B' : 'transparent') + '" stroke="' + (i <= Math.round(avg) ? '#F59E0B' : 'rgba(248,242,224,.15)') + '" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  html += '<div>' + starsHtml + '</div>';
  html += '<div style="font-size:11px;color:rgba(248,242,224,.35)">' + filtered.length + ' ' + t('\u0111\u00E1nh gi\u00E1','reviews') + '</div>';
  html += '</div></div>';

  // List reviews
  filtered.sort(function(a,b) { return (b.createdAt||0) - (a.createdAt||0); }).slice(0, 5).forEach(function(r) {
    var initials = (r.userName || 'U').split(' ').map(function(w) { return w[0] || ''; }).join('').substr(0,2).toUpperCase();
    html += '<div style="padding:10px 0;border-bottom:1px solid rgba(0,200,150,.04)">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">';
    html += '<div style="width:28px;height:28px;border-radius:50%;background:rgba(0,200,150,.12);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#00E5A8">' + initials + '</div>';
    html += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:#F8F2E0">' + (r.userName||'User') + '</div>';
    html += '<div style="font-size:10px;color:rgba(248,242,224,.3)">' + (r.date||'') + '</div></div>';
    // Stars
    var rStars = '';
    for(var i = 1; i <= 5; i++) {
      rStars += '<svg width="12" height="12" viewBox="0 0 24 24" fill="' + (i <= r.rating ? '#F59E0B' : 'transparent') + '" stroke="' + (i <= r.rating ? '#F59E0B' : 'rgba(248,242,224,.1)') + '" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    }
    html += '<div>' + rStars + '</div></div>';
    if(r.text) html += '<div style="font-size:13px;color:rgba(248,242,224,.6);line-height:1.5">' + r.text + '</div>';
    html += '</div>';
  });

  container.innerHTML = html;
}

// ── Inject review buttons into site ──
function injectReviewButtons() {
  // Add to user dropdown menu
  var dd = document.getElementById('userDropMenu');
  if(dd && !dd.querySelector('[data-review-btn]')) {
    var logoutItem = dd.querySelector('[onclick*="logoutUser"]');
    if(logoutItem) {
      var reviewItem = document.createElement('div');
      reviewItem.setAttribute('data-review-btn', 'true');
      reviewItem.className = 'dd-hover';
      reviewItem.style.cssText = 'padding:10px 16px;cursor:pointer;color:var(--t2,#ccc);font-size:13px;display:flex;align-items:center;gap:8px';
      reviewItem.onclick = function() {
        if(typeof toggleUserMenu === 'function') toggleUserMenu();
        window.openCenterReview('CTR001', 'Anima Care');
      };
      reviewItem.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' + t('\u0110\u00E1nh gi\u00E1 d\u1ECBch v\u1EE5','Rate Service');
      dd.insertBefore(reviewItem, logoutItem);
    }
  }
}

// ── Hook into nav user update to inject review buttons ──
var origUpdateNav = window.updateNavUser;
if(typeof origUpdateNav === 'function') {
  window.updateNavUser = function() {
    origUpdateNav.apply(this, arguments);
    setTimeout(injectReviewButtons, 100);
  };
}

// Auto-inject on load if user already logged in
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(injectReviewButtons, 500); });
} else {
  setTimeout(injectReviewButtons, 500);
}

})();
