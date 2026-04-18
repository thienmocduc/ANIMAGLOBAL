// ============================================================
// ANIMA Care — Site Features: i18n (VI/EN/ZH) + Theme Toggle + Chatbot
// ============================================================
(function() {
  if (typeof document === 'undefined') return;

  // ============ I18N Dictionary ============
  const DICT = {
    vi: {
      nav_eco: 'Hệ Sinh Thái', nav_119: 'Anima 119', nav_svc: 'Dịch Vụ', nav_chain: 'Chuỗi Trạm', nav_inv: 'Nhà Đầu Tư',
      nav_login: 'Đăng nhập ↗', nav_ios: 'IOS Portal',
      hero_tag: 'Công Ty Cổ Phần Anima Care Global · Thức Tỉnh Năng Lượng Nguyên Sơ',
      hero_title_1: 'Phục Hưng Sự Sống Bên Trong', hero_title_2: 'Qua', hero_title_3: 'Đông Dược Lên Men', hero_title_4: '& Trí Tuệ Nhân Tạo',
      hero_desc: '"Chúng tôi kiến tạo một nền văn minh chăm sóc sức khỏe mới — nơi 5.000 năm trí tuệ Đông Y gặp gỡ Trí Tuệ Nhân Tạo để chữa lành và phục hưng sức sống nguyên sơ cho người Việt và toàn cõi ASEAN."',
      stat_herbs: 'Thảo dược quý', stat_active: 'Hoạt chất sinh học', stat_prov: 'Tỉnh thành', stat_ipo: 'IPO SGX',
      btn_openapp: 'Mở App ANIMA Care ↗', btn_explore: 'Khám phá ↓',
      sec_eco_tag: 'Bốn Trụ Cột', sec_eco_title_1: 'Hệ Sinh Thái', sec_eco_desc: 'Mỗi trụ cột là một mắt xích — kết nối thành vòng lặp flywheel tự tăng trưởng.',
      eco_119_title: 'Anima 119', eco_119_desc: 'Đông dược lên men 3 tầng — Thực thể phân tử sống. 32 thảo dược quý, 119 hoạt chất sinh học.',
      eco_care_title: 'Anima Care', eco_care_desc: 'Chuỗi trung tâm chữa lành vật lý — 34 tỉnh thành. Khai vấn, thảo mộc nhiệt, đả thông kinh lạc.',
      eco_tech_title: 'Anima Tech', eco_tech_desc: 'Nền tảng O2O — App đặt lịch, marketplace, affiliate. Kết nối khách hàng — KTV — Center.',
      eco_ai_title: 'Anima AI', eco_ai_desc: 'AI Engine khai vấn sự sống — Tầm soát da, thiệt chẩn, mống mắt. Cá nhân hóa liệu trình.',
      chat_title: 'ANIMA AI Tư vấn', chat_welcome: 'Xin chào! Mình là trợ lý AI của ANIMA Care. Bạn cần tư vấn về sức khỏe hay sản phẩm?',
      chat_placeholder: 'Nhập câu hỏi của bạn...', chat_send: 'Gửi', chat_open: 'Trợ lý AI',
      lang_label: 'Ngôn ngữ',
    },
    en: {
      nav_eco: 'Ecosystem', nav_119: 'Anima 119', nav_svc: 'Services', nav_chain: 'Centers', nav_inv: 'Investors',
      nav_login: 'Sign in ↗', nav_ios: 'IOS Portal',
      hero_tag: 'Anima Care Global JSC · Awakening Primal Energy',
      hero_title_1: 'Revitalize Life Within', hero_title_2: 'Through', hero_title_3: 'Fermented Herbal Medicine', hero_title_4: '& Artificial Intelligence',
      hero_desc: '"We are building a new healthcare civilization — where 5,000 years of Eastern Medicine wisdom meets Artificial Intelligence to heal and restore primal vitality for Vietnamese and ASEAN people."',
      stat_herbs: 'Rare herbs', stat_active: 'Bio-active compounds', stat_prov: 'Provinces', stat_ipo: 'IPO SGX',
      btn_openapp: 'Open ANIMA Care App ↗', btn_explore: 'Explore ↓',
      sec_eco_tag: 'Four Pillars', sec_eco_title_1: 'ANIMA Ecosystem', sec_eco_desc: 'Each pillar is a link — connected into a self-growing flywheel loop.',
      eco_119_title: 'Anima 119', eco_119_desc: '3-layer fermented herbal medicine — Living molecular entity. 32 rare herbs, 119 bioactive compounds.',
      eco_care_title: 'Anima Care', eco_care_desc: 'Physical healing center chain — 34 provinces. Consultation, herbal heat therapy, meridian opening.',
      eco_tech_title: 'Anima Tech', eco_tech_desc: 'O2O platform — Booking app, marketplace, affiliate. Connecting customers — therapists — centers.',
      eco_ai_title: 'Anima AI', eco_ai_desc: 'AI Engine for life consultation — Skin, tongue, iris diagnosis. Personalized treatment plans.',
      chat_title: 'ANIMA AI Assistant', chat_welcome: 'Hello! I\'m ANIMA Care\'s AI assistant. Do you need advice on health or products?',
      chat_placeholder: 'Type your question...', chat_send: 'Send', chat_open: 'AI Assistant',
      lang_label: 'Language',
    },
    zh: {
      nav_eco: '生态系统', nav_119: 'Anima 119', nav_svc: '服务', nav_chain: '中心链', nav_inv: '投资者',
      nav_login: '登录 ↗', nav_ios: 'IOS 门户',
      hero_tag: 'Anima Care Global 股份公司 · 唤醒原始能量',
      hero_title_1: '复兴内在生命', hero_title_2: '通过', hero_title_3: '发酵草药', hero_title_4: '与人工智能',
      hero_desc: '"我们正在建立一个新的医疗保健文明 — 5000 年的东方医学智慧与人工智能相遇,为越南人民和东盟人民治愈并恢复原始活力。"',
      stat_herbs: '珍稀草药', stat_active: '生物活性物质', stat_prov: '省份', stat_ipo: 'IPO SGX',
      btn_openapp: '打开 ANIMA Care 应用 ↗', btn_explore: '探索 ↓',
      sec_eco_tag: '四大支柱', sec_eco_title_1: 'ANIMA 生态系统', sec_eco_desc: '每个支柱都是一个环节 — 连接成一个自我增长的飞轮循环。',
      eco_119_title: 'Anima 119', eco_119_desc: '三层发酵草药 — 生命分子实体。32 种珍稀草药,119 种生物活性化合物。',
      eco_care_title: 'Anima Care', eco_care_desc: '实体疗愈中心链 — 34 个省份。咨询、草药热疗、经络开通。',
      eco_tech_title: 'Anima Tech', eco_tech_desc: 'O2O 平台 — 预约应用、市场、联盟。连接客户 — 治疗师 — 中心。',
      eco_ai_title: 'Anima AI', eco_ai_desc: 'AI 生命咨询引擎 — 皮肤、舌、虹膜诊断。个性化治疗计划。',
      chat_title: 'ANIMA AI 助手', chat_welcome: '您好! 我是 ANIMA Care 的 AI 助手。您需要健康或产品方面的建议吗?',
      chat_placeholder: '输入您的问题...', chat_send: '发送', chat_open: 'AI 助手',
      lang_label: '语言',
    },
  };

  const LANGS = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  function getLang() { return localStorage.getItem('anima-lang') || 'vi'; }
  function setLang(l) { localStorage.setItem('anima-lang', l); applyLang(l); }

  function applyLang(l) {
    const dict = DICT[l] || DICT.vi;
    document.documentElement.lang = l;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key]) el.innerHTML = dict[key];
    });
    // Update lang badge on button
    const badge = document.getElementById('lang-current-badge');
    if (badge) {
      const lo = LANGS.find(x => x.code === l);
      badge.textContent = lo ? lo.code.toUpperCase() : 'VI';
    }
  }

  // ============ Theme Toggle ============
  function getTheme() { return localStorage.getItem('anima-theme') || 'dark'; }
  function setTheme(t) {
    localStorage.setItem('anima-theme', t);
    document.documentElement.classList.toggle('light', t === 'light');
    document.documentElement.classList.toggle('dark', t === 'dark');
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerHTML = t === 'dark' ? '☀️' : '🌙';
  }

  // ============ UI Controls injection ============
  function injectControls() {
    if (document.getElementById('site-controls')) return;

    const wrap = document.createElement('div');
    wrap.id = 'site-controls';
    wrap.className = 'site-ctl';
    wrap.innerHTML = `
      <button id="theme-toggle-btn" class="ctl-btn" aria-label="Toggle theme" title="Sáng / Tối">🌙</button>
      <div class="ctl-lang">
        <button id="lang-btn" class="ctl-btn" aria-label="Language">
          🌐 <span id="lang-current-badge">VI</span>
        </button>
        <div id="lang-menu" class="ctl-dropdown">
          ${LANGS.map(x => `<button data-lang="${x.code}" class="lang-opt"><span>${x.flag}</span> ${x.label}</button>`).join('')}
        </div>
      </div>
    `;

    // Try to insert into nav-right
    const navRight = document.querySelector('.nav-right');
    if (navRight) {
      navRight.insertBefore(wrap, navRight.firstChild);
    } else {
      // Fallback: fixed top-right
      wrap.style.position = 'fixed';
      wrap.style.top = '16px';
      wrap.style.right = '16px';
      wrap.style.zIndex = '1000';
      document.body.appendChild(wrap);
    }

    // Events
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });

    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.classList.toggle('open');
    });
    document.addEventListener('click', () => langMenu.classList.remove('open'));
    langMenu.querySelectorAll('.lang-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setLang(btn.getAttribute('data-lang'));
        langMenu.classList.remove('open');
      });
    });
  }

  // ============ Chatbot Widget ============
  function injectChatbot() {
    if (document.getElementById('anima-chatbot')) return;
    const w = document.createElement('div');
    w.id = 'anima-chatbot';
    w.innerHTML = `
      <button id="cbot-toggle" class="cbot-toggle" aria-label="Open chatbot">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <span class="cbot-badge"></span>
      </button>
      <div id="cbot-panel" class="cbot-panel">
        <div class="cbot-head">
          <div class="cbot-avatar">🤖</div>
          <div class="cbot-info">
            <div class="cbot-name" data-i18n="chat_title">ANIMA AI Tư vấn</div>
            <div class="cbot-status">● Online</div>
          </div>
          <button id="cbot-close" class="cbot-close" aria-label="Close">✕</button>
        </div>
        <div id="cbot-msgs" class="cbot-msgs">
          <div class="cbot-msg cbot-msg-bot">
            <div class="cbot-avatar-sm">🤖</div>
            <div class="cbot-bubble" data-i18n="chat_welcome">Xin chào! Mình là trợ lý AI của ANIMA Care. Bạn cần tư vấn về sức khỏe hay sản phẩm?</div>
          </div>
        </div>
        <div class="cbot-quick">
          <button class="cbot-chip" data-q="Tư vấn ANIMA 119">ANIMA 119</button>
          <button class="cbot-chip" data-q="Đặt lịch dịch vụ">Đặt lịch</button>
          <button class="cbot-chip" data-q="Chuỗi trạm gần tôi">Trạm gần tôi</button>
          <button class="cbot-chip" data-q="Nhượng quyền">Nhượng quyền</button>
        </div>
        <form id="cbot-form" class="cbot-form">
          <input id="cbot-input" type="text" data-i18n-placeholder="chat_placeholder" placeholder="Nhập câu hỏi của bạn..." autocomplete="off" />
          <button type="submit" class="cbot-send">➤</button>
        </form>
      </div>
    `;
    document.body.appendChild(w);

    const toggle = document.getElementById('cbot-toggle');
    const panel = document.getElementById('cbot-panel');
    const close = document.getElementById('cbot-close');
    const form = document.getElementById('cbot-form');
    const input = document.getElementById('cbot-input');
    const msgs = document.getElementById('cbot-msgs');

    toggle.addEventListener('click', () => panel.classList.add('open'));
    close.addEventListener('click', () => panel.classList.remove('open'));

    function addMsg(text, who) {
      const m = document.createElement('div');
      m.className = 'cbot-msg ' + (who === 'user' ? 'cbot-msg-user' : 'cbot-msg-bot');
      m.innerHTML = who === 'user'
        ? `<div class="cbot-bubble">${text.replace(/</g,'&lt;')}</div>`
        : `<div class="cbot-avatar-sm">🤖</div><div class="cbot-bubble">${text.replace(/</g,'&lt;')}</div>`;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
    }

    async function ask(q) {
      addMsg(q, 'user');
      const typing = document.createElement('div');
      typing.className = 'cbot-msg cbot-msg-bot cbot-typing';
      typing.innerHTML = '<div class="cbot-avatar-sm">🤖</div><div class="cbot-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
      msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;

      try {
        const r = await fetch('https://app.animacare.global/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: q, locale: getLang() })
        });
        typing.remove();
        if (r.ok) {
          const d = await r.json();
          addMsg(d.reply || d.answer || 'Xin lỗi, tôi chưa hiểu câu hỏi. Bạn có thể nói rõ hơn không?', 'bot');
        } else throw new Error('API error');
      } catch (e) {
        typing.remove();
        // Fallback FAQ response
        const ql = q.toLowerCase();
        let answer = 'Cảm ơn anh/chị. Vui lòng nhấn nút "Mở App ANIMA Care" để được tư vấn chi tiết, hoặc gọi hotline 0913-156-676.';
        if (ql.includes('anima 119') || ql.includes('đông dược') || ql.includes('sản phẩm')) {
          answer = '🧬 ANIMA 119 là đông dược lên men 3 tầng với 32 thảo dược quý, 119 hoạt chất sinh học. Giá 1.868.000đ/hộp. Xem chi tiết: app.animacare.global/app/marketplace';
        } else if (ql.includes('đặt lịch') || ql.includes('booking') || ql.includes('lịch')) {
          answer = '📅 Anh/chị có thể đặt lịch dịch vụ tại: app.animacare.global/app/booking — hoặc mở App ANIMA Care.';
        } else if (ql.includes('trạm') || ql.includes('center') || ql.includes('gần')) {
          answer = '🏥 Chuỗi 34 trung tâm ANIMA Care trên toàn quốc. Xem bản đồ: animacare.global/chain.html';
        } else if (ql.includes('nhượng quyền') || ql.includes('franchise')) {
          answer = '🏢 Mô hình nhượng quyền Lite & Full — Royalty 5%. Chi tiết: animacare.global/chain.html#franchise — Hotline: 0913-156-676';
        } else if (ql.includes('giá') || ql.includes('price') || ql.includes('bao nhiêu')) {
          answer = '💰 ANIMA 119: 1.868.000đ/hộp (1 tháng) · Gói 3 tháng: 5.040.000đ (-10%) · ANIMA Tea: 680.000đ/20 gói.';
        }
        addMsg(answer, 'bot');
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      ask(q);
    });

    w.querySelectorAll('.cbot-chip').forEach(c => {
      c.addEventListener('click', () => ask(c.getAttribute('data-q')));
    });
  }

  // ============ Init ============
  function init() {
    setTheme(getTheme());
    injectControls();
    injectChatbot();
    applyLang(getLang());

    // Also apply i18n when new DOM mounted (observer)
    const obs = new MutationObserver(() => applyLang(getLang()));
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
