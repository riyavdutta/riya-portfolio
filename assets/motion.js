/*
 * Scroll motion, shared by every page.
 * - Reveals: blocks settle into place as they come into view, one after another.
 * - Folder depth (home): as a folder slides over the one before, the one underneath
 *   dims and sinks slightly, like a real pile.
 * Uses data attributes and children only, because the home page's runtime rewrites
 * the class and style of the elements it controls.
 */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var GROUPS = [
    // home
    '#about > div > div:first-child', '#about > div > div:last-child > *',
    '#work > div > div:first-child',
    '.kit__title', '.kit .tray',
    '#catalogue .records__intro', '#catalogue .crate',
    '#contact > div > div > *',
    '#lab h2', '#lab a',
    // case studies and the Work page
    '.body > section', '.hero__art', '.wi-head p', '.filters', '.postcards > .pcard'
  ];

  function start() {
    var folders = [].slice.call(document.querySelectorAll('[data-on-pointermove^="tm_f"]'));
    if (reduce) return;

    var pending = [];
    GROUPS.forEach(function (sel) {
      [].slice.call(document.querySelectorAll(sel)).forEach(function (e) { if (pending.indexOf(e) < 0) pending.push(e); });
    });
    // folders reveal through their children, because the folder itself carries the tilt
    folders.forEach(function (f) { [].slice.call(f.children).forEach(function (c) { pending.push(c); }); });
    pending = pending.filter(function (e) {
      if (e.closest('[role="dialog"]')) return false;                 // sheets and overlays animate on their own
      var r = e.getBoundingClientRect();
      if (!r.width && !r.height) return false;                        // hidden when the page loads: leave it alone
      var onScreen = r.top < window.innerHeight * 0.92 && r.bottom > 0;
      if (!onScreen) e.setAttribute('data-rv', '');
      return !onScreen;
    });

    function reveal() {
      var vh = window.innerHeight, n = 0;
      pending = pending.filter(function (e) {
        var r = e.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) {
          e.setAttribute('data-rv-d', String(Math.min(n++, 6)));   // stagger the ones that arrive together
          e.setAttribute('data-rv', 'in');
          return false;
        }
        return true;
      });
    }

    function depth() {
      for (var i = 0; i < folders.length; i++) {
        var next = folders[i + 1], d = 0;
        if (next) {
          var a = folders[i].getBoundingClientRect(), b = next.getBoundingClientRect();
          d = Math.max(0, Math.min(1, (a.bottom - b.top) / Math.max(1, a.height)));
        }
        for (var k = 0; k < folders[i].children.length; k++) folders[i].children[k].style.setProperty('--depth', d.toFixed(3));
      }
    }

    var queued = false;
    function frame() { queued = false; reveal(); depth(); }
    function onScroll() {
      if (queued) return;
      queued = true;
      // the timer covers windows that pause animation frames
      var done = false, go = function () { if (!done) { done = true; frame(); } };
      requestAnimationFrame(go); setTimeout(go, 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 50); });
  else setTimeout(start, 50);
})();
