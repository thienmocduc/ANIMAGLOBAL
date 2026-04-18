// Cosmic Background — Luan xa 4,5,6,7 + sao bang cheo ngang
// Dung chung: animacare.global, app.animacare.global, ios.animacare.global
(function() {
  if (typeof document === 'undefined') return;

  function populate(root) {
    if (root.dataset.cosmicMounted === '1') return;
    root.dataset.cosmicMounted = '1';

    const orbs = [
      { c: 'rgba(16,185,129,.22)',  s: 420, pos: 'top:30%;left:15%', anim: 'cosmic-chakra4', dur: 18, delay: 0 },
      { c: 'rgba(99,102,241,.2)',   s: 380, pos: 'top:20%;right:10%', anim: 'cosmic-chakra5', dur: 22, delay: -4 },
      { c: 'rgba(20,184,166,.18)',  s: 340, pos: 'bottom:15%;left:35%', anim: 'cosmic-chakra6', dur: 20, delay: -8 },
      { c: 'rgba(139,92,246,.16)',  s: 460, pos: 'top:10%;left:40%', anim: 'cosmic-chakra7', dur: 24, delay: -12 }
    ];
    orbs.forEach(o => {
      const d = document.createElement('div');
      d.className = 'cosmic-orb';
      d.style.cssText = `width:${o.s}px;height:${o.s}px;${o.pos};background:radial-gradient(circle,${o.c},transparent 70%);animation:${o.anim} ${o.dur}s ease-in-out infinite;animation-delay:${o.delay}s`;
      root.appendChild(d);
    });

    const colors = ['#a78bfa','#818cf8','#10b981','#14b8a6','#6366f1','#8b5cf6'];
    for (let i = 0; i < 32; i++) {
      const s = document.createElement('div');
      s.className = 'cosmic-star';
      const col = colors[i % 6];
      const size = Math.random() > .7 ? 3 : 2;
      s.style.cssText = `left:${(.03 + Math.random()*.94)*100}%;top:${(.03 + Math.random()*.94)*100}%;animation-delay:${Math.random()*5}s;animation-duration:${2 + Math.random()*4}s;background:${col};width:${size}px;height:${size}px;box-shadow:0 0 6px ${col}`;
      root.appendChild(s);
    }

    for (let i = 0; i < 6; i++) {
      const s = document.createElement('div');
      s.className = 'cosmic-shoot';
      const col = colors[i % colors.length];
      s.style.cssText = `top:${8 + 14*i}%;animation-delay:${1.5*i}s;animation-duration:${6 + i*.4}s;background:linear-gradient(90deg,transparent,${col} 40%,#fff 50%,${col} 60%,transparent);box-shadow:0 0 12px ${col},0 0 24px ${col}`;
      root.appendChild(s);
    }
  }

  function mountTo(target) {
    if (!target || target.dataset.cosmicMounted === '1') return;
    // target duoc du an mark san san — populate directly
    populate(target);
  }

  function mountDefaultBody() {
    // Neu body khong co cosmic-target thi mount vao body
    if (document.getElementById('cosmic-target')) return;
    if (document.getElementById('cosmic-bg-root')) return;
    const root = document.createElement('div');
    root.id = 'cosmic-bg-root';
    root.className = 'cosmic-bg-wrap';
    root.setAttribute('aria-hidden', 'true');
    populate(root);
    document.body.insertBefore(root, document.body.firstChild);
  }

  function scan() {
    // Tat ca cosmic-target tren trang (co the co nhieu layout long nhau)
    const targets = document.querySelectorAll('#cosmic-target, [data-cosmic-target]');
    let found = false;
    targets.forEach(t => {
      // Them class cosmic-bg-wrap neu chua co
      if (!t.classList.contains('cosmic-bg-wrap')) t.classList.add('cosmic-bg-wrap');
      t.style.position = t.style.position || 'absolute';
      mountTo(t);
      found = true;
    });
    if (!found) mountDefaultBody();
  }

  // Quan sat DOM changes — khi React swap layout se co cosmic-target moi
  function observeDOM() {
    const obs = new MutationObserver(() => scan());
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  function init() {
    scan();
    observeDOM();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
