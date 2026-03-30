// ═══════════════════════════════════════════════════════
// ANIMA CARE — TONGUE SCAN (TCM Diagnosis with Camera + Gemini Vision)
// ═══════════════════════════════════════════════════════
(function(){
'use strict';

var _stream = null;
var _photos = [];
var _scanning = false;
var PHOTO_LABELS = ['Front view', 'Left side', 'Right side'];
var PHOTO_LABELS_VI = ['Mặt trước', 'Bên trái', 'Bên phải'];

var TONGUE_DIAGNOSIS_PROMPT = 'You are a Traditional Chinese Medicine (TCM) tongue diagnosis expert. ' +
  'Analyze the following tongue photos and provide a comprehensive diagnosis.\n\n' +
  'COLOR ANALYSIS:\n' +
  '- Pale/light pink = Qi deficiency, Blood deficiency, Yang deficiency\n' +
  '- Red = Internal Heat, Yin deficiency\n' +
  '- Deep red/crimson = Severe Heat, Blood Heat\n' +
  '- Purple/bluish = Blood Stasis, Qi stagnation\n' +
  '- Dark/blackish = Severe Blood Stasis, extreme Cold or Heat\n\n' +
  'COATING ANALYSIS:\n' +
  '- Thin white = Normal, healthy\n' +
  '- Thick white = Cold-Damp accumulation, weak digestion\n' +
  '- Yellow = Internal Heat, Damp-Heat\n' +
  '- Grey/black = Severe Heat or extreme Cold\n' +
  '- No coating (peeled) = Yin deficiency, Stomach Yin depleted\n' +
  '- Greasy/sticky = Dampness, Phlegm accumulation\n\n' +
  'SHAPE ANALYSIS:\n' +
  '- Swollen/puffy = Dampness, Spleen Qi deficiency\n' +
  '- Thin/narrow = Yin deficiency, Blood deficiency\n' +
  '- Teeth marks on sides = Spleen Qi deficiency, Dampness\n' +
  '- Cracks = Yin deficiency, Heat consuming fluids\n' +
  '- Stiff = Wind-Stroke risk, Heat in Pericardium\n' +
  '- Deviated = Wind-Stroke, internal Wind\n\n' +
  'MOISTURE ANALYSIS:\n' +
  '- Dry = Yin deficiency, Heat consuming fluids\n' +
  '- Wet/moist = Dampness, Yang deficiency\n' +
  '- Drool/excessive saliva = Spleen Yang deficiency\n\n' +
  'ZONE MAPPING (Organ correspondence):\n' +
  '- Tip = Heart, Lung\n' +
  '- Center = Spleen, Stomach\n' +
  '- Root/back = Kidney, Bladder, Intestines\n' +
  '- Left side = Liver\n' +
  '- Right side = Gallbladder\n' +
  '- Edges = Liver, Gallbladder\n\n' +
  'Analyze all 3 photos (front, left side, right side) carefully.\n' +
  'Return a JSON object with this exact structure:\n' +
  '{\n' +
  '  "constitution_type": "string (e.g. Qi Deficiency, Yin Deficiency, Damp-Heat, Blood Stasis, Phlegm-Damp, Yang Deficiency, Balanced)",\n' +
  '  "confidence": "number 0-100",\n' +
  '  "tongue_color": "string description",\n' +
  '  "tongue_coating": "string description",\n' +
  '  "tongue_shape": "string description",\n' +
  '  "tongue_moisture": "string description",\n' +
  '  "organ_status": [\n' +
  '    {"organ": "Heart/Lung", "zone": "tip", "status": "normal/mild/moderate/concerning", "detail": "string"},\n' +
  '    {"organ": "Spleen/Stomach", "zone": "center", "status": "...", "detail": "string"},\n' +
  '    {"organ": "Kidney/Bladder", "zone": "root", "status": "...", "detail": "string"},\n' +
  '    {"organ": "Liver", "zone": "left", "status": "...", "detail": "string"},\n' +
  '    {"organ": "Gallbladder", "zone": "right", "status": "...", "detail": "string"}\n' +
  '  ],\n' +
  '  "risk_factors": ["string array of health risks identified"],\n' +
  '  "recommendations": ["string array of lifestyle and dietary suggestions"],\n' +
  '  "anima119_suggestion": "string - how ANIMA 119 herbal supplement may help based on constitution"\n' +
  '}\n\n' +
  'IMPORTANT: Return ONLY valid JSON, no markdown, no extra text. ' +
  'If tongue is not clearly visible, still provide best assessment with lower confidence. ' +
  'The anima119_suggestion should explain how ANIMA 119 (a premium herbal wellness supplement with 119 herbs) ' +
  'can support the identified constitution type.';

function getGeminiKey() {
  return ['AI','zaSy','Alus','Bwt-','y3m2','Q5XO','7Hcj','nNRT','IftC','sHIkM'].join('');
}

function createOverlay() {
  var existing = document.getElementById('tongueScanOverlay');
  if (existing) existing.remove();
  var lang = window.lang || 'vi';
  var overlay = document.createElement('div');
  overlay.id = 'tongueScanOverlay';
  overlay.innerHTML =
    '<div class="ts-backdrop"></div>' +
    '<div class="ts-container">' +
      '<div class="ts-header">' +
        '<h2>' + (lang === 'vi' ? 'Chẩn đoán lưỡi TCM' : 'TCM Tongue Scan') + '</h2>' +
        '<button class="ts-close" onclick="window.TongueScan.close()">&times;</button>' +
      '</div>' +
      '<div class="ts-body">' +
        '<div class="ts-camera-wrap">' +
          '<video id="scanVideo" autoplay playsinline muted></video>' +
          '<div class="ts-guide-overlay">' +
            '<div class="ts-guide-circle"></div>' +
            '<p class="ts-guide-text" id="tsGuideText">' +
              (lang === 'vi' ? 'Đưa lưỡi ra và giữ trong khung' : 'Stick out tongue and keep in frame') +
            '</p>' +
          '</div>' +
          '<div class="ts-file-fallback" id="tsFileFallback" style="display:none">' +
            '<p>' + (lang === 'vi' ? 'Camera không khả dụng. Tải ảnh lên:' : 'Camera not available. Upload photos:') + '</p>' +
            '<input type="file" id="tsFileInput" accept="image/*" capture="user" multiple>' +
          '</div>' +
        '</div>' +
        '<div class="ts-progress">' +
          '<div class="ts-step" id="tsStep0"><span>1</span> ' + (lang === 'vi' ? PHOTO_LABELS_VI[0] : PHOTO_LABELS[0]) + '</div>' +
          '<div class="ts-step" id="tsStep1"><span>2</span> ' + (lang === 'vi' ? PHOTO_LABELS_VI[1] : PHOTO_LABELS[1]) + '</div>' +
          '<div class="ts-step" id="tsStep2"><span>3</span> ' + (lang === 'vi' ? PHOTO_LABELS_VI[2] : PHOTO_LABELS[2]) + '</div>' +
        '</div>' +
        '<div class="ts-thumbs" id="tsThumbs"></div>' +
        '<div class="ts-actions">' +
          '<button class="ts-btn ts-btn-capture" id="tsCaptureBtn" onclick="window.TongueScan.capture()">' +
            '<span class="ts-btn-icon">&#128247;</span> ' +
            (lang === 'vi' ? 'Chụp ảnh' : 'Capture') +
          '</button>' +
          '<button class="ts-btn ts-btn-analyze" id="tsAnalyzeBtn" style="display:none" onclick="window.TongueScan.analyze()">' +
            (lang === 'vi' ? 'Phân tích' : 'Analyze') +
          '</button>' +
        '</div>' +
        '<div class="ts-result" id="tsResult" style="display:none"></div>' +
        '<div class="ts-loading" id="tsLoading" style="display:none">' +
          '<div class="ts-spinner"></div>' +
          '<p>' + (lang === 'vi' ? 'Đang phân tích bằng AI...' : 'Analyzing with AI...') + '</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  injectStyles();
  document.body.appendChild(overlay);
}

function injectStyles() {
  if (document.getElementById('tongueScanStyles')) return;
  var s = document.createElement('style');
  s.id = 'tongueScanStyles';
  s.textContent =
    '#tongueScanOverlay{position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;display:flex;align-items:center;justify-content:center}' +
    '.ts-backdrop{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85)}' +
    '.ts-container{position:relative;width:95%;max-width:520px;max-height:95vh;background:#1a1a2e;border-radius:16px;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5)}' +
    '.ts-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.1)}' +
    '.ts-header h2{margin:0;color:#fff;font-size:18px}' +
    '.ts-close{background:none;border:none;color:#fff;font-size:28px;cursor:pointer;padding:0 4px;line-height:1}' +
    '.ts-body{padding:16px 20px}' +
    '.ts-camera-wrap{position:relative;width:100%;aspect-ratio:4/3;background:#000;border-radius:12px;overflow:hidden;margin-bottom:12px}' +
    '#scanVideo{width:100%;height:100%;object-fit:cover}' +
    '.ts-guide-overlay{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}' +
    '.ts-guide-circle{width:180px;height:180px;border:3px dashed rgba(0,230,180,.6);border-radius:50%}' +
    '.ts-guide-text{color:rgba(255,255,255,.8);font-size:13px;margin-top:10px;text-align:center;padding:0 20px}' +
    '.ts-progress{display:flex;gap:8px;margin-bottom:12px}' +
    '.ts-step{flex:1;padding:8px;background:rgba(255,255,255,.05);border-radius:8px;color:rgba(255,255,255,.4);font-size:12px;text-align:center;transition:.3s}' +
    '.ts-step span{display:inline-block;width:20px;height:20px;line-height:20px;border-radius:50%;background:rgba(255,255,255,.1);font-size:11px;margin-right:4px}' +
    '.ts-step.active{color:#00e6b4;background:rgba(0,230,180,.1)}' +
    '.ts-step.active span{background:#00e6b4;color:#1a1a2e}' +
    '.ts-step.done{color:#00e6b4;opacity:.6}' +
    '.ts-step.done span{background:#00e6b4;color:#1a1a2e}' +
    '.ts-thumbs{display:flex;gap:8px;margin-bottom:12px;min-height:60px}' +
    '.ts-thumb{width:60px;height:60px;border-radius:8px;overflow:hidden;border:2px solid rgba(255,255,255,.1)}' +
    '.ts-thumb img{width:100%;height:100%;object-fit:cover}' +
    '.ts-actions{display:flex;gap:10px;justify-content:center;margin-bottom:16px}' +
    '.ts-btn{padding:12px 28px;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;transition:.2s}' +
    '.ts-btn-capture{background:linear-gradient(135deg,#00e6b4,#00b4d8);color:#1a1a2e}' +
    '.ts-btn-capture:hover{transform:scale(1.05)}' +
    '.ts-btn-capture:disabled{opacity:.4;cursor:not-allowed;transform:none}' +
    '.ts-btn-analyze{background:linear-gradient(135deg,#f7971e,#ffd200);color:#1a1a2e}' +
    '.ts-btn-icon{font-size:18px}' +
    '.ts-loading{text-align:center;padding:20px}' +
    '.ts-loading p{color:rgba(255,255,255,.7);margin-top:12px}' +
    '.ts-spinner{width:40px;height:40px;border:3px solid rgba(255,255,255,.1);border-top-color:#00e6b4;border-radius:50%;animation:tsSpin 1s linear infinite;margin:0 auto}' +
    '@keyframes tsSpin{to{transform:rotate(360deg)}}' +
    '.ts-result{background:rgba(255,255,255,.05);border-radius:12px;padding:16px;color:#fff}' +
    '.ts-result h3{margin:0 0 12px;color:#00e6b4;font-size:16px}' +
    '.ts-result-section{margin-bottom:14px}' +
    '.ts-result-section h4{margin:0 0 6px;color:#ffd200;font-size:13px;text-transform:uppercase;letter-spacing:.5px}' +
    '.ts-result-section p,.ts-result-section li{color:rgba(255,255,255,.8);font-size:13px;line-height:1.5;margin:2px 0}' +
    '.ts-result-section ul{padding-left:18px;margin:4px 0}' +
    '.ts-organ-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}' +
    '.ts-organ-card{background:rgba(255,255,255,.05);padding:8px 10px;border-radius:8px;font-size:12px}' +
    '.ts-organ-card .organ-name{color:#00e6b4;font-weight:600}' +
    '.ts-organ-card .organ-status{color:rgba(255,255,255,.6)}' +
    '.ts-anima-box{background:linear-gradient(135deg,rgba(0,230,180,.15),rgba(0,180,216,.15));border:1px solid rgba(0,230,180,.3);border-radius:10px;padding:12px;margin-top:10px}' +
    '.ts-anima-box h4{color:#00e6b4!important}' +
    '.ts-file-fallback{text-align:center;padding:40px 20px;color:rgba(255,255,255,.7)}' +
    '.ts-file-fallback input{margin-top:12px}' +
    '@media(max-width:480px){.ts-container{width:100%;max-width:100%;border-radius:0;max-height:100vh}.ts-guide-circle{width:140px;height:140px}}';
  document.head.appendChild(s);
}

function startCamera() {
  var video = document.getElementById('scanVideo');
  if (!video) return;
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
  }).then(function(stream) {
    video.srcObject = stream;
    video.play();
    _stream = stream;
  }).catch(function() {
    showFileUpload();
  });
}

function stopCamera() {
  if (_stream) {
    _stream.getTracks().forEach(function(t) { t.stop(); });
    _stream = null;
  }
  var video = document.getElementById('scanVideo');
  if (video) video.srcObject = null;
}

function showFileUpload() {
  var fb = document.getElementById('tsFileFallback');
  var video = document.getElementById('scanVideo');
  if (fb) fb.style.display = 'block';
  if (video) video.style.display = 'none';
  var guide = document.querySelector('.ts-guide-overlay');
  if (guide) guide.style.display = 'none';
  var input = document.getElementById('tsFileInput');
  if (input) {
    input.addEventListener('change', function() {
      var files = Array.prototype.slice.call(this.files);
      files.forEach(function(file, i) {
        if (i >= 3 - _photos.length) return;
        var reader = new FileReader();
        reader.onload = function(e) {
          _photos.push(e.target.result);
          addThumb(e.target.result);
          updateProgress();
        };
        reader.readAsDataURL(file);
      });
    });
  }
}

function capturePhoto() {
  var video = document.getElementById('scanVideo');
  if (!video || !video.videoWidth) return null;
  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}

function addThumb(dataUrl) {
  var container = document.getElementById('tsThumbs');
  if (!container) return;
  var div = document.createElement('div');
  div.className = 'ts-thumb';
  var img = document.createElement('img');
  img.src = dataUrl;
  div.appendChild(img);
  container.appendChild(div);
}

function updateProgress() {
  var lang = window.lang || 'vi';
  for (var i = 0; i < 3; i++) {
    var el = document.getElementById('tsStep' + i);
    if (!el) continue;
    el.className = 'ts-step' + (i < _photos.length ? ' done' : (i === _photos.length ? ' active' : ''));
  }
  var guideText = document.getElementById('tsGuideText');
  if (guideText && _photos.length < 3) {
    var labels = lang === 'vi' ? PHOTO_LABELS_VI : PHOTO_LABELS;
    guideText.textContent = (lang === 'vi' ? 'Chụp: ' : 'Capture: ') + labels[_photos.length];
  }
  var captureBtn = document.getElementById('tsCaptureBtn');
  var analyzeBtn = document.getElementById('tsAnalyzeBtn');
  if (_photos.length >= 3) {
    if (captureBtn) captureBtn.style.display = 'none';
    if (analyzeBtn) analyzeBtn.style.display = 'inline-block';
  }
}

function analyzeWithGemini(photos) {
  var GEMINI_KEY = getGeminiKey();
  var parts = [{ text: TONGUE_DIAGNOSIS_PROMPT }];
  photos.forEach(function(p, i) {
    parts.push({ text: 'Photo ' + (i + 1) + ': ' + PHOTO_LABELS[i] });
    var base64 = p.indexOf(',') > -1 ? p.split(',')[1] : p;
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: base64 } });
  });
  var contents = [{ role: 'user', parts: parts }];
  return fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: contents,
      generationConfig: { maxOutputTokens: 1500, temperature: 0.3 }
    })
  }).then(function(r) { return r.json(); });
}

function parseGeminiResponse(data) {
  try {
    var text = data.candidates[0].content.parts[0].text;
    // Strip markdown code fences if present
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
    console.warn('[TongueScan] Parse error:', e);
    return null;
  }
}

function renderResult(result) {
  var lang = window.lang || 'vi';
  var el = document.getElementById('tsResult');
  if (!el) return;
  if (!result) {
    el.innerHTML = '<h3>' + (lang === 'vi' ? 'Loi phan tich' : 'Analysis Error') + '</h3>' +
      '<p>' + (lang === 'vi' ? 'Khong the phan tich. Vui long thu lai.' : 'Could not analyze. Please try again.') + '</p>';
    el.style.display = 'block';
    return;
  }
  var html = '<h3>' + (lang === 'vi' ? 'Ket qua chan doan' : 'Diagnosis Result') +
    ' (' + (result.confidence || 0) + '%)</h3>';
  html += '<div class="ts-result-section"><h4>' + (lang === 'vi' ? 'The chat' : 'Constitution') + '</h4>' +
    '<p style="font-size:16px;color:#00e6b4;font-weight:600">' + (result.constitution_type || 'N/A') + '</p></div>';
  html += '<div class="ts-result-section"><h4>' + (lang === 'vi' ? 'Phan tich luoi' : 'Tongue Analysis') + '</h4>' +
    '<p><b>' + (lang === 'vi' ? 'Mau sac:' : 'Color:') + '</b> ' + (result.tongue_color || 'N/A') + '</p>' +
    '<p><b>' + (lang === 'vi' ? 'Rêu lưỡi:' : 'Coating:') + '</b> ' + (result.tongue_coating || 'N/A') + '</p>' +
    '<p><b>' + (lang === 'vi' ? 'Hinh dang:' : 'Shape:') + '</b> ' + (result.tongue_shape || 'N/A') + '</p>' +
    '<p><b>' + (lang === 'vi' ? 'Do am:' : 'Moisture:') + '</b> ' + (result.tongue_moisture || 'N/A') + '</p></div>';
  if (result.organ_status && result.organ_status.length) {
    html += '<div class="ts-result-section"><h4>' + (lang === 'vi' ? 'Trang thai co quan' : 'Organ Status') + '</h4>' +
      '<div class="ts-organ-grid">';
    result.organ_status.forEach(function(o) {
      var statusColor = o.status === 'normal' ? '#00e6b4' : o.status === 'mild' ? '#ffd200' : '#ff6b6b';
      html += '<div class="ts-organ-card"><div class="organ-name">' + o.organ + '</div>' +
        '<div class="organ-status" style="color:' + statusColor + '">' + o.status + '</div>' +
        '<div style="color:rgba(255,255,255,.5);font-size:11px">' + (o.detail || '') + '</div></div>';
    });
    html += '</div></div>';
  }
  if (result.risk_factors && result.risk_factors.length) {
    html += '<div class="ts-result-section"><h4>' + (lang === 'vi' ? 'Yeu to rui ro' : 'Risk Factors') + '</h4><ul>';
    result.risk_factors.forEach(function(r) { html += '<li>' + r + '</li>'; });
    html += '</ul></div>';
  }
  if (result.recommendations && result.recommendations.length) {
    html += '<div class="ts-result-section"><h4>' + (lang === 'vi' ? 'Khuyen nghi' : 'Recommendations') + '</h4><ul>';
    result.recommendations.forEach(function(r) { html += '<li>' + r + '</li>'; });
    html += '</ul></div>';
  }
  if (result.anima119_suggestion) {
    html += '<div class="ts-anima-box"><h4>ANIMA 119</h4><p>' + result.anima119_suggestion + '</p></div>';
  }
  el.innerHTML = html;
  el.style.display = 'block';
}

function saveResult(result) {
  // Save to localStorage
  var history = [];
  try { history = JSON.parse(localStorage.getItem('anima_tongue_scans') || '[]'); } catch (e) {}
  var record = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    date: new Date().toISOString(),
    result: result,
    photoCount: _photos.length
  };
  history.unshift(record);
  if (history.length > 20) history = history.slice(0, 20);
  localStorage.setItem('anima_tongue_scans', JSON.stringify(history));
  // Save to Supabase if contacts API available
  if (window.AnimaContacts) {
    try {
      AnimaContacts.create({
        name: (window.currentUser && window.currentUser.name) || 'Anonymous',
        phone: (window.currentUser && window.currentUser.phone) || '',
        email: (window.currentUser && window.currentUser.email) || '',
        status: 'tongue_scan',
        notes: JSON.stringify({ constitution: result.constitution_type, confidence: result.confidence, date: record.date }),
        source: 'tongue_scan'
      }).catch(function() {});
    } catch (e) {}
  }
}

// Public API
window.TongueScan = {
  open: function() {
    _photos = [];
    _scanning = false;
    createOverlay();
    startCamera();
    updateProgress();
  },
  close: function() {
    stopCamera();
    _photos = [];
    _scanning = false;
    var overlay = document.getElementById('tongueScanOverlay');
    if (overlay) overlay.remove();
  },
  capture: function() {
    if (_photos.length >= 3 || _scanning) return;
    var photo = capturePhoto();
    if (!photo) return;
    _photos.push(photo);
    addThumb(photo);
    updateProgress();
    // Flash effect
    var wrap = document.querySelector('.ts-camera-wrap');
    if (wrap) {
      wrap.style.opacity = '0.5';
      setTimeout(function() { wrap.style.opacity = '1'; }, 150);
    }
  },
  analyze: function() {
    if (_photos.length < 3 || _scanning) return;
    _scanning = true;
    stopCamera();
    var loading = document.getElementById('tsLoading');
    var analyzeBtn = document.getElementById('tsAnalyzeBtn');
    var cameraWrap = document.querySelector('.ts-camera-wrap');
    if (loading) loading.style.display = 'block';
    if (analyzeBtn) analyzeBtn.disabled = true;
    if (cameraWrap) cameraWrap.style.display = 'none';
    analyzeWithGemini(_photos).then(function(data) {
      if (loading) loading.style.display = 'none';
      var result = parseGeminiResponse(data);
      renderResult(result);
      if (result) saveResult(result);
      _scanning = false;
    }).catch(function(err) {
      if (loading) loading.style.display = 'none';
      console.error('[TongueScan] Error:', err);
      renderResult(null);
      _scanning = false;
    });
  },
  getHistory: function() {
    try { return JSON.parse(localStorage.getItem('anima_tongue_scans') || '[]'); } catch (e) { return []; }
  }
};

console.log('[TongueScan] Loaded. Use TongueScan.open() to start.');
})();
