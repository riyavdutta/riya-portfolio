/* Work page and 404: the title's letters take a bright colour as you pass; the Work filters. */
(function () {
  'use strict';
  var C = ['#d02b8f', '#7a3cff', '#00a9bd', '#a86bff', '#e3bd00', '#6cb800'];
  document.querySelectorAll('.big-t').forEach(function (t) {
    t.innerHTML = Array.from(t.textContent).map(function (c) { return c === ' ' ? ' ' : '<span>' + c + '</span>'; }).join('');
    t.querySelectorAll('span').forEach(function (s) {
      s.addEventListener('pointerenter', function () {
        s.style.color = C[Math.floor(Math.random() * C.length)];
        clearTimeout(s._t); s._t = setTimeout(function () { s.style.color = ''; }, 1400);
      });
    });
  });

  // filters: cards that don't match fade out, then step aside
  var bar = document.querySelector('.filters');
  if (!bar) return;
  var cards = Array.from(document.querySelectorAll('.card'));
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var t = b.dataset.tag;
    cards.forEach(function (c) {
      var show = t === 'all' || c.dataset.tags.split(' ').indexOf(t) > -1;
      if (show) { c.classList.remove('gone'); requestAnimationFrame(function () { c.classList.remove('out'); }); }
      else { c.classList.add('out'); setTimeout(function () { if (c.classList.contains('out')) c.classList.add('gone'); }, 380); }
    });
  });
})();
