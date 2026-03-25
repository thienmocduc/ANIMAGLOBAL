/* ═══════════════════════════════════════════════════════════════
   AnimaCare Loyalty Points & Referral System v1.0
   - Earn/spend points, tiered levels (Bronze-Platinum)
   - Referral codes with dual-reward
   - Profile tab + Admin overview
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var lLang = (typeof lang !== 'undefined') ? lang : 'vi';
function t(vi, en) { return lLang === 'vi' ? vi : en; }
function money(n) { return (n||0).toLocaleString('vi-VN') + '\u0111'; }
var origSL = window.setLang;
if (typeof origSL === 'function') {
  window.setLang = function(l) { lLang = l; origSL(l); };
}

var TIERS = [
  { level: 1, name: 'Bronze',   min: 0,     max: 4999,  color: '#CD7F32' },
  { level: 2, name: 'Silver',   min: 5000,  max: 19999, color: '#C0C0C0' },
  { level: 3, name: 'Gold',     min: 20000, max: 49999, color: '#FFD700' },
  { level: 4, name: 'Platinum', min: 50000, max: Infinity, color: '#E5E4E2' }
];
var REFERRAL_BONUS = 500;

// ── Helpers ──
function Loy() { return window.AnimaLoyalty; }
function Ref() { return window.AnimaReferrals; }
function uid() { return 'AC-' + Math.random().toString(36).substr(2,4).toUpperCase(); }

// ── Core: Get Level ──
window.getLoyaltyLevel = function(points) {
  points = points || 0;
  for (var i = TIERS.length - 1; i >= 0; i--) {
    if (points >= TIERS[i].min) {
      var tier = TIERS[i];
      var next = TIERS[i + 1];
      return {
        level: tier.level, name: tier.name, color: tier.color,
        nextLevel: next ? next.name : null,
        pointsToNext: next ? next.min - points : 0,
        progress: next ? ((points - tier.min) / (next.min - tier.min) * 100) : 100
      };
    }
  }
  return { level: 1, name: 'Bronze', color: '#CD7F32', nextLevel: 'Silver', pointsToNext: 5000 - points, progress: points / 5000 * 100 };
};

// ── Core: Earn Points ──
window.earnPoints = function(userId, userName, points, type, description, refId) {
  return Loy().getPoints(userId).then(function(rows) {
    var current = rows && rows[0] ? rows[0] : null;
    var newTotal = (current ? current.total_points : 0) + points;
    var lvl = window.getLoyaltyLevel(newTotal);
    var rec = { user_id: userId, user_name: userName, total_points: newTotal, level: lvl.name, updated_at: new Date().toISOString() };
    var save = current ? Loy().updatePoints(userId, rec) : Loy().createPoints(Object.assign({ created_at: new Date().toISOString() }, rec));
    return save.then(function() {
      return Loy().addTransaction({ user_id: userId, points: points, type: type || 'earn', description: description || '', ref_id: refId || null, created_at: new Date().toISOString() });
    }).then(function() { return { total: newTotal, level: lvl }; });
  });
};

// ── Core: Spend Points ──
window.spendPoints = function(userId, points, description) {
  return Loy().getPoints(userId).then(function(rows) {
    var current = rows && rows[0] ? rows[0] : null;
    if (!current || current.total_points < points) return Promise.reject(new Error(t('Kh\u00F4ng \u0111\u1EE7 \u0111i\u1EC3m','Not enough points')));
    var newTotal = current.total_points - points;
    var lvl = window.getLoyaltyLevel(newTotal);
    return Loy().updatePoints(userId, { total_points: newTotal, level: lvl.name, updated_at: new Date().toISOString() }).then(function() {
      return Loy().addTransaction({ user_id: userId, points: -points, type: 'spend', description: description || '', created_at: new Date().toISOString() });
    }).then(function() { return { total: newTotal, level: lvl }; });
  });
};

// ── Core: Generate Referral Code ──
window.generateReferralCode = function(userId) {
  var code = uid();
  return Ref().createCode({ user_id: userId, code: code, uses: 0, created_at: new Date().toISOString() }).then(function() { return code; });
};

// ── Core: Use Referral Code ──
window.useReferralCode = function(code, newUserId, newUserName) {
  return Ref().getCode(code).then(function(rows) {
    if (!rows || !rows[0]) return Promise.reject(new Error(t('M\u00E3 kh\u00F4ng h\u1EE3p l\u1EC7','Invalid code')));
    var ref = rows[0];
    if (ref.user_id === newUserId) return Promise.reject(new Error(t('Kh\u00F4ng th\u1EC3 d\u00F9ng m\u00E3 c\u1EE7a ch\u00EDnh b\u1EA1n','Cannot use your own code')));
    return Ref().recordUse({ code: code, referrer_id: ref.user_id, referred_id: newUserId, created_at: new Date().toISOString() }).then(function() {
      return Ref().incrementUses(code, ref.uses + 1);
    }).then(function() {
      return Promise.all([
        window.earnPoints(ref.user_id, '', REFERRAL_BONUS, 'referral', t('Gi\u1EDBi thi\u1EC7u b\u1EA1n b\u00E8','Referral bonus'), code),
        window.earnPoints(newUserId, newUserName, REFERRAL_BONUS, 'referral', t('\u0110\u01B0\u1EE3c gi\u1EDBi thi\u1EC7u','Referred bonus'), code)
      ]);
    });
  });
};

// ── UI: Tier Benefits ──
function tierBenefits(name) {
  var b = { Bronze: ['1x ' + t('\u0110i\u1EC3m','Points')], Silver: ['1.5x ' + t('\u0110i\u1EC3m','Points'), t('\u01AFu \u0111\u00E3i 5%','5% discount')], Gold: ['2x ' + t('\u0110i\u1EC3m','Points'), t('\u01AFu \u0111\u00E3i 10%','10% discount'), t('D\u1ECBch v\u1EE5 VIP','VIP service')], Platinum: ['3x ' + t('\u0110i\u1EC3m','Points'), t('\u01AFu \u0111\u00E3i 15%','15% discount'), t('D\u1ECBch v\u1EE5 VIP','VIP service'), t('\u0110\u1EB7t l\u1ECBch \u01B0u ti\u00EAn','Priority booking')] };
  return b[name] || b.Bronze;
}

// ── Render: Profile Loyalty Tab ──
window.renderLoyaltyTab = function() {
  var el = document.getElementById('profLoyaltyContent');
  if (!el) return;
  var user = null;
  try { user = JSON.parse(localStorage.getItem('anima_current_user')); } catch(e) {}
  if (!user) { el.innerHTML = '<p style="color:rgba(248,242,224,.4);text-align:center">' + t('\u0110\u0103ng nh\u1EADp \u0111\u1EC3 xem','Sign in to view') + '</p>'; return; }
  el.innerHTML = '<div style="text-align:center;padding:20px"><div class="loader" style="border:3px solid rgba(0,200,150,.2);border-top:3px solid #00C896;border-radius:50%;width:28px;height:28px;animation:spin 1s linear infinite;margin:0 auto"></div></div>';

  Loy().getPoints(user.id || user.email).then(function(rows) {
    var pts = rows && rows[0] ? rows[0].total_points : 0;
    var lvl = window.getLoyaltyLevel(pts);
    var benefits = tierBenefits(lvl.name);

    return Loy().getTransactions(user.id || user.email).then(function(txns) {
      return Ref().getUserCode(user.id || user.email).then(function(codes) {
        var code = codes && codes[0] ? codes[0].code : null;
        var h = '<div style="padding:4px 0">';
        // Points + Level badge
        h += '<div style="text-align:center;margin-bottom:16px"><div style="font-size:32px;font-weight:700;color:#00C896">' + pts.toLocaleString() + '</div>';
        h += '<div style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;background:' + lvl.color + '20;color:' + lvl.color + ';border:1px solid ' + lvl.color + '40">' + lvl.name + '</div></div>';
        // Progress bar
        if (lvl.nextLevel) {
          h += '<div style="margin:0 0 16px"><div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(248,242,224,.4);margin-bottom:4px"><span>' + lvl.name + '</span><span>' + lvl.nextLevel + '</span></div>';
          h += '<div style="height:6px;border-radius:3px;background:rgba(248,242,224,.06)"><div style="height:100%;border-radius:3px;background:linear-gradient(90deg,' + lvl.color + ',#00C896);width:' + Math.min(lvl.progress, 100) + '%"></div></div>';
          h += '<div style="text-align:center;font-size:11px;color:rgba(248,242,224,.3);margin-top:4px">' + lvl.pointsToNext.toLocaleString() + ' ' + t('\u0111i\u1EC3m n\u1EEFa','more points') + '</div></div>';
        }
        // Benefits
        h += '<div style="background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:12px;padding:12px;margin-bottom:16px"><div style="font-size:12px;font-weight:600;color:#F8F2E0;margin-bottom:8px">' + t('Quy\u1EC1n l\u1EE3i','Benefits') + '</div>';
        benefits.forEach(function(b) { h += '<div style="font-size:12px;color:rgba(248,242,224,.5);padding:2px 0">\u2022 ' + b + '</div>'; });
        h += '</div>';
        // Referral
        h += '<div style="background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:12px;padding:12px;margin-bottom:16px"><div style="font-size:12px;font-weight:600;color:#F8F2E0;margin-bottom:8px">' + t('M\u00E3 gi\u1EDBi thi\u1EC7u','Referral Code') + '</div>';
        if (code) {
          h += '<div style="display:flex;align-items:center;gap:8px"><code style="flex:1;background:rgba(248,242,224,.05);padding:8px 12px;border-radius:8px;color:#00C896;font-size:14px;font-weight:600;letter-spacing:1px">' + code + '</code>';
          h += '<button onclick="navigator.clipboard.writeText(\'' + code + '\');this.textContent=\'' + t('\u0110\u00E3 copy','Copied') + '\'" style="background:#00C896;color:#0A1218;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer">' + t('Chia s\u1EBB','Share') + '</button></div>';
        } else {
          h += '<button onclick="generateReferralCode(\'' + (user.id || user.email) + '\').then(function(){renderLoyaltyTab()})" style="background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:10px;padding:10px 20px;color:#0A1218;font-weight:600;cursor:pointer;font-size:12px">' + t('T\u1EA1o m\u00E3','Generate Code') + '</button>';
        }
        h += '</div>';
        // Transaction history
        h += '<div style="font-size:12px;font-weight:600;color:#F8F2E0;margin-bottom:8px">' + t('L\u1ECBch s\u1EED','History') + '</div>';
        if (!txns || !txns.length) {
          h += '<p style="font-size:12px;color:rgba(248,242,224,.3);text-align:center">' + t('Ch\u01B0a c\u00F3 giao d\u1ECBch','No transactions yet') + '</p>';
        } else {
          txns.slice(0, 10).forEach(function(tx) {
            var sign = tx.points > 0 ? '+' : '';
            var col = tx.points > 0 ? '#00C896' : '#FF6B6B';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(248,242,224,.04)"><div><div style="font-size:12px;color:#F8F2E0">' + (tx.description || tx.type) + '</div><div style="font-size:10px;color:rgba(248,242,224,.25)">' + new Date(tx.created_at).toLocaleDateString() + '</div></div><div style="font-size:13px;font-weight:600;color:' + col + '">' + sign + tx.points.toLocaleString() + '</div></div>';
          });
        }
        h += '</div>';
        el.innerHTML = h;
      });
    });
  }).catch(function(e) { el.innerHTML = '<p style="color:#FF6B6B;text-align:center;font-size:12px">' + e.message + '</p>'; });
};

// ── Render: Admin Loyalty Overview ──
window.renderAdmLoyalty = function() {
  var el = document.getElementById('admLoyaltyContent') || document.getElementById('loyaltyAdmin');
  if (!el) return;
  el.innerHTML = '<div style="text-align:center;padding:30px"><div class="loader" style="border:3px solid rgba(0,200,150,.2);border-top:3px solid #00C896;border-radius:50%;width:28px;height:28px;animation:spin 1s linear infinite;margin:0 auto"></div></div>';

  Loy().getAll().then(function(users) {
    users = users || [];
    var totalPts = 0; users.forEach(function(u) { totalPts += u.total_points || 0; });
    var sorted = users.slice().sort(function(a, b) { return (b.total_points || 0) - (a.total_points || 0); });
    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px">';
    h += card(t('T\u1ED5ng th\u00E0nh vi\u00EAn','Total Members'), users.length, '#00C896');
    h += card(t('T\u1ED5ng \u0111i\u1EC3m','Total Points'), totalPts.toLocaleString(), '#FFD700');
    var plat = users.filter(function(u) { return u.level === 'Platinum'; }).length;
    h += card('Platinum', plat, '#E5E4E2');
    h += '</div>';
    // Top earners table
    h += '<div style="font-size:14px;font-weight:600;color:#F8F2E0;margin-bottom:10px">' + t('Top th\u00E0nh vi\u00EAn','Top Members') + '</div>';
    h += '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="border-bottom:1px solid rgba(0,200,150,.12)">';
    h += '<th style="padding:8px;text-align:left;color:rgba(248,242,224,.4)">#</th><th style="padding:8px;text-align:left;color:rgba(248,242,224,.4)">' + t('T\u00EAn','Name') + '</th><th style="padding:8px;text-align:right;color:rgba(248,242,224,.4)">' + t('\u0110i\u1EC3m','Points') + '</th><th style="padding:8px;text-align:center;color:rgba(248,242,224,.4)">' + t('H\u1EA1ng','Level') + '</th></tr></thead><tbody>';
    sorted.slice(0, 20).forEach(function(u, i) {
      var lvl = window.getLoyaltyLevel(u.total_points);
      h += '<tr style="border-bottom:1px solid rgba(248,242,224,.03)"><td style="padding:8px;color:rgba(248,242,224,.3)">' + (i + 1) + '</td><td style="padding:8px;color:#F8F2E0">' + (u.user_name || u.user_id) + '</td><td style="padding:8px;text-align:right;color:#00C896;font-weight:600">' + (u.total_points || 0).toLocaleString() + '</td><td style="padding:8px;text-align:center"><span style="padding:2px 10px;border-radius:10px;font-size:10px;background:' + lvl.color + '20;color:' + lvl.color + '">' + lvl.name + '</span></td></tr>';
    });
    h += '</tbody></table></div>';
    el.innerHTML = h;
  }).catch(function(e) { el.innerHTML = '<p style="color:#FF6B6B;text-align:center;font-size:12px">' + e.message + '</p>'; });
};

function card(label, value, color) {
  return '<div style="background:rgba(0,200,150,.04);border:1px solid rgba(0,200,150,.1);border-radius:14px;padding:16px;text-align:center"><div style="font-size:22px;font-weight:700;color:' + color + '">' + value + '</div><div style="font-size:11px;color:rgba(248,242,224,.4);margin-top:4px">' + label + '</div></div>';
}

})();
