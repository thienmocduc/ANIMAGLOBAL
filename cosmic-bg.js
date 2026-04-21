// Cosmic Background — Luan xa 4,5,6,7 + twinkling stars (khong sao bang)
// v2 — REMOVED MutationObserver (gay freeze UI). Chi mount 1 lan vao body.
(function () {
  if (typeof document === 'undefined') return;

  function populate(root) {
    if (root.dataset.cosmicMounted === '1') return;
    root.dataset.cosmicMounted = '1';

    var orbs = [
      { c: 'rgba(16,185,129,.22)', s: 420, pos: 'top:30%;left:15%',    anim: 'cosmic-chakra4', dur: 18, delay: 0   },
      { c: 'rgba(99,102,241,.20)', s: 380, pos: 'top:20%;right:10%',   anim: 'cosmic-chakra5', dur: 22, delay: -4  },
      { c: 'rgba(20,184,166,.18)', s: 340, pos: 'bottom:15%;left:35%', anim: 'cosmic-chakra6', dur: 20, delay: -8  },
      { c: 'rgba(139,92,246,.16)', s: 460, pos: 'top:10%;left:40%',    anim: 'cosmic-chakra7', dur: 24, delay: -12 }
    ];
    orbs.forEach(function (o) {
      var d = document.createElement('div');
      d.className = 'cosmic-orb';
      d.style.cssText =
        'width:' + o.s + 'px;height:' + o.s + 'px;' + o.pos +
        ';background:radial-gradient(circle,' + o.c + ',transparent 70%)' +
        ';animation:' + o.anim + ' ' + o.dur + 's ease-in-out infinite' +
        ';animation-delay:' + o.delay + 's';
      root.appendChild(d);
    });

    var colors = ['#a78bfa', '#818cf8', '#10b981', '#14b8a6', '#6366f1', '#8b5cf6'];
    for (var i = 0; i < 32; i++) {
      var s = document.createElement('div');
      s.className = 'cosmic-star';
      var col = colors[i % 6];
      var size = Math.random() > 0.7 ? 3 : 2;
      s.style.cssText =
        'left:' + ((0.03 + Math.random() * 0.94) * 100) + '%' +
        ';top:' + ((0.03 + Math.random() * 0.94) * 100) + '%' +
        ';animation-delay:' + (Math.random() * 5) + 's' +
        ';animation-duration:' + (2 + Math.random() * 4) + 's' +
        ';background:' + col +
        ';width:' + size + 'px;height:' + size + 'px' +
        ';box-shadow:0 0 6px ' + col;
      root.appendChild(s);
    }
  }

  function init() {
    if (document.getElementById('cosmic-bg-root')) return;
    var root = document.createElement('div');
    root.id = 'cosmic-bg-root';
    root.className = 'cosmic-bg-wrap';
    root.setAttribute('aria-hidden', 'true');
    populate(root);
    // insert as first child so it stays behind everything
    if (document.body.firstChild) document.body.insertBefore(root, document.body.firstChild);
    else document.body.appendChild(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
