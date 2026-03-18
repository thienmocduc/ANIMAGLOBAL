/* AnimaCare Mobile JS Fix — force responsive grids on small screens */
(function(){
  function fixMobileGrids(){
    var w = window.innerWidth;
    if(w > 768) return;

    // Force 1-column grids on mobile
    var grids = {
      '.fg': '1fr',
      '.eco-grid': '1fr',
      '.steps-grid': '1fr',
      '.tech-grid': '1fr',
      '.st-grid': '1fr',
      '.intro-pillars': '1fr'
    };
    Object.keys(grids).forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        el.style.setProperty('grid-template-columns', grids[sel], 'important');
        if(sel === '.fg'){
          el.style.setProperty('gap', '20px', 'important');
          el.style.setProperty('text-align', 'center', 'important');
        }
      });
    });

    // intro-stats: 2 columns
    document.querySelectorAll('.intro-stats').forEach(function(el){
      el.style.setProperty('grid-template-columns', 'repeat(2,1fr)', 'important');
      el.style.setProperty('gap', '0', 'important');
    });

    // Fix all inline grids with 3+ columns
    document.querySelectorAll('[style]').forEach(function(el){
      var s = el.getAttribute('style') || '';
      if(s.indexOf('grid-template-columns') === -1) return;
      // Check if it has 3+ columns
      if(/repeat\([3-9]/.test(s) || /1fr\s+1fr\s+1fr/.test(s) || /2\.2fr/.test(s)){
        el.style.setProperty('grid-template-columns', '1fr', 'important');
      }
    });

    // Fix overlay padding
    document.querySelectorAll('[style*="padding:0 48px"],[style*="padding: 0 48px"]').forEach(function(el){
      el.style.setProperty('padding-left', '16px', 'important');
      el.style.setProperty('padding-right', '16px', 'important');
    });
    document.querySelectorAll('[style*="padding:48px"],[style*="padding:60px"],[style*="padding:80px"]').forEach(function(el){
      el.style.setProperty('padding', '20px 16px', 'important');
    });
  }

  // Run on load and resize
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', fixMobileGrids);
  } else {
    fixMobileGrids();
  }

  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fixMobileGrids, 200);
  });

  // Also run when overlays open (they may have grids too)
  var origOpen = window.openStore;
  if(origOpen){
    window.openStore = function(){
      origOpen.apply(this, arguments);
      setTimeout(fixMobileGrids, 100);
    };
  }
})();
