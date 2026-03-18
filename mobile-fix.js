/* AnimaCare Mobile JS Fix v2 — force responsive on small screens */
(function(){
  function fixMobileGrids(){
    var w = window.innerWidth;
    if(w > 768) return;

    // Force 1-column grids on mobile
    var grids = {'.fg':'1fr','.eco-grid':'1fr','.steps-grid':'1fr','.tech-grid':'1fr','.st-grid':'1fr','.intro-pillars':'1fr'};
    Object.keys(grids).forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        el.style.setProperty('grid-template-columns',grids[sel],'important');
        if(sel==='.fg'){
          el.style.setProperty('gap','20px','important');
          el.style.setProperty('text-align','center','important');
        }
      });
    });

    // intro-stats: 2 columns, bigger cards
    document.querySelectorAll('.intro-stats').forEach(function(el){
      el.style.setProperty('grid-template-columns','repeat(2,1fr)','important');
      el.style.setProperty('gap','0','important');
      el.style.setProperty('border-radius','14px','important');
    });
    document.querySelectorAll('.is-card').forEach(function(el){
      el.style.setProperty('padding','18px 8px','important');
    });
    document.querySelectorAll('.is-num').forEach(function(el){
      el.style.setProperty('font-size','24px','important');
    });

    // eco-card full width, no truncation
    document.querySelectorAll('.eco-card').forEach(function(el){
      el.style.setProperty('padding','22px 18px','important');
    });
    document.querySelectorAll('.eco-desc').forEach(function(el){
      el.style.setProperty('-webkit-line-clamp','unset','important');
      el.style.setProperty('display','block','important');
      el.style.setProperty('overflow','visible','important');
    });

    // Fix all inline grids with 3+ columns
    document.querySelectorAll('[style]').forEach(function(el){
      var s=el.getAttribute('style')||'';
      if(s.indexOf('grid-template-columns')===-1) return;
      if(/repeat\([3-9]/.test(s)||/1fr\s+1fr\s+1fr/.test(s)||/2\.2fr/.test(s)){
        el.style.setProperty('grid-template-columns','1fr','important');
      }
    });

    // Fix overlay padding (72px, 48px, 60px, 80px → 14-16px)
    document.querySelectorAll('[style*="padding"]').forEach(function(el){
      var s=el.getAttribute('style')||'';
      if(/padding:\s*\d+px\s+[4-9]\dpx/.test(s)||/padding:\s*0\s+[4-9]\dpx/.test(s)||/padding:\s*[4-9]\dpx\s+[4-9]\dpx/.test(s)){
        el.style.setProperty('padding-left','14px','important');
        el.style.setProperty('padding-right','14px','important');
      }
      if(/padding:\s*72px/.test(s)){
        el.style.setProperty('padding','20px 14px','important');
      }
    });

    // Fix IPO overlay specifically
    fixIPO();
  }

  function fixIPO(){
    var ipo=document.getElementById('ipoOverlay');
    if(!ipo) return;
    // ip-wrap
    ipo.querySelectorAll('.ip-wrap').forEach(function(el){
      el.style.setProperty('padding','20px 14px 40px','important');
    });
    // ip-hero h2
    ipo.querySelectorAll('.ip-hero h2, .ip-hero [style*="font-size:48px"]').forEach(function(el){
      el.style.setProperty('font-size','26px','important');
      el.style.setProperty('line-height','1.3','important');
    });
    ipo.querySelectorAll('.ip-hero em').forEach(function(el){
      el.style.setProperty('font-size','28px','important');
    });
    ipo.querySelectorAll('.ip-hero p').forEach(function(el){
      el.style.setProperty('font-size','14px','important');
      el.style.setProperty('padding','0','important');
    });
    // val-grid → 1 col
    ipo.querySelectorAll('.ip-val-grid').forEach(function(el){
      el.style.setProperty('grid-template-columns','1fr','important');
    });
    // bench-grid → 1 or 2 col
    ipo.querySelectorAll('.ip-bench-grid').forEach(function(el){
      el.style.setProperty('grid-template-columns',window.innerWidth<=480?'1fr':'1fr 1fr','important');
    });
    // capital rows → stack vertically
    ipo.querySelectorAll('.ip-cap-row').forEach(function(el){
      el.style.setProperty('grid-template-columns','1fr','important');
      el.style.setProperty('gap','4px','important');
      el.style.setProperty('padding','10px 14px','important');
    });
    // timeline items
    ipo.querySelectorAll('.ip-tl-item').forEach(function(el){
      el.style.setProperty('flex-direction','column','important');
      el.style.setProperty('gap','8px','important');
    });
    // kpi grids
    ipo.querySelectorAll('.ip-kpi-grid').forEach(function(el){
      el.style.setProperty('grid-template-columns',window.innerWidth<=480?'1fr':'repeat(2,1fr)','important');
    });
    // Large fonts inside IPO
    ipo.querySelectorAll('[style*="font-size"]').forEach(function(el){
      var s=el.getAttribute('style')||'';
      var m=s.match(/font-size:\s*(\d+)px/);
      if(m){
        var sz=parseInt(m[1]);
        if(sz>=48) el.style.setProperty('font-size','26px','important');
        else if(sz>=36) el.style.setProperty('font-size','22px','important');
        else if(sz>=28) el.style.setProperty('font-size','20px','important');
      }
    });
  }

  // Hook into overlay open functions to fix grids when they appear
  function hookFn(name){
    var orig=window[name];
    if(typeof orig==='function'){
      window[name]=function(){
        orig.apply(this,arguments);
        setTimeout(fixMobileGrids,150);
      };
    }
  }

  function init(){
    fixMobileGrids();
    // Hook overlay openers
    ['openStore','openIPO','openA119','openAnimaCare','openAnimaTech','openAnimaAI',
     'openTraining','openFranchise','openKPI','openContact'].forEach(hookFn);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  } else {
    init();
  }

  var resizeTimer;
  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(fixMobileGrids,200);
  });
})();
