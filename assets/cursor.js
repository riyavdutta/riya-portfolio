/*
 * Custom cursor: a small dot that becomes a stamp with one word over anything clickable
 * (Read, Turn, Post…), and leaves a faint postmark where you click.
 * Off on touch screens and for people who've asked for less motion; the normal cursor stays there.
 */
(function () {
  'use strict';
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  // the word for what's under the cursor: most specific first
  var WORDS = [
    ['[data-on-click="postmark"]', 'Stamp'],
    ['[data-on-click="flipCard"]', 'Turn'],
    ['[data-on-click="toggleQuick"]', 'Open'],
    ['[data-on-click^="open_"]', 'View'],
    ['.pf-post', 'Post'],
    ['a[href^="mailto:"]', 'Write'],
    ['a[href*="linkedin.com"]', 'Visit'],
    ['a[href*="work/"]', 'Read'],
    ['a[href^="#"]', 'Go'],
    ['a, button, [role="button"], [role="tab"], summary, label[for]', 'Open']
  ];
  var FIELDS = 'input, textarea, select, [contenteditable]';

  var rc = document.createElement('div');
  rc.className = 'rc';
  rc.hidden = true;
  rc.setAttribute('aria-hidden', 'true');
  rc.innerHTML = '<span class="rc__dot"></span><span class="rc__stamp"><span></span></span>';
  var word = rc.querySelector('.rc__stamp > span');
  var x = 0, y = 0, queued = false;

  function place() {
    queued = false;
    rc.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  }
  function wordFor(el) {
    if (!el || !el.closest) return '';
    for (var i = 0; i < WORDS.length; i++) {
      var hit = el.closest(WORDS[i][0]);
      if (hit && !hit.disabled) return WORDS[i][1];
    }
    return '';
  }

  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    var t = e.target, typing = t.closest && t.closest(FIELDS);
    rc.hidden = !!typing;                       // the text caret takes over in fields
    var w = typing ? '' : wordFor(t);
    if (w) word.textContent = w;
    rc.classList.toggle('is-on', !!w);
    if (!queued) { queued = true; requestAnimationFrame(place); }
  }, { passive: true });

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    rc.classList.add('is-down');
    if (e.target.closest && e.target.closest(FIELDS)) return;
    var m = document.createElement('span');
    m.className = 'rc-mark';
    m.style.left = e.clientX + 'px'; m.style.top = e.clientY + 'px';
    document.body.appendChild(m);
    setTimeout(function () { m.remove(); }, 700);
  });
  document.addEventListener('pointerup', function () { rc.classList.remove('is-down'); });
  document.documentElement.addEventListener('mouseleave', function () { rc.hidden = true; });
  document.documentElement.addEventListener('mouseenter', function () { rc.hidden = false; });

  function start() {
    document.body.appendChild(rc);
    document.documentElement.classList.add('has-cursor');   // the dot appears on the first mouse move
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
