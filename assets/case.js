/* Case study pages: tracking bar, the stamp sheet viewer, and work index filters. */
(function () {
  'use strict';

  // tracking bar: Posted → Sorted → In transit → Delivered as you read
  var fill = document.querySelector('.track__fill');
  var stops = document.querySelectorAll('.track__stop');
  var bar = document.querySelector('.track[role="progressbar"]');
  if (fill) {
    var onScroll = function () {
      var h = document.documentElement;
      var p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, h.scrollHeight - window.innerHeight)));
      fill.style.width = (p * 100).toFixed(1) + '%';
      var step = p >= 0.97 ? 3 : p >= 0.6 ? 2 : p >= 0.2 ? 1 : 0;
      stops.forEach(function (s, i) { s.classList.toggle('on', i <= step); });
      if (bar) bar.setAttribute('aria-valuenow', Math.round(p * 100));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // stamp sheets: pick a stamp to see the piece large, with its caption
  document.querySelectorAll('[data-sheet]').forEach(function (sheet) {
    var items = JSON.parse(sheet.querySelector('script[type="application/json"]').textContent);
    var stamps = sheet.querySelectorAll('.stamp');
    var view = sheet.querySelector('.view');
    var el = function (sel) { return view.querySelector(sel); };
    var cur = 0;

    function media(it) {
      var box = el('.view__media');
      box.querySelectorAll('video').forEach(function (v) { v.pause(); });
      if (it.video) {
        box.innerHTML = '<video controls playsinline preload="none"></video><p class="label" style="margin-top:8px">VIDEO · PRESS PLAY FOR SOUND</p>';
        var v = box.querySelector('video'); v.src = it.video; v.poster = it.img;
      } else if (it.slides && it.slides.length) {
        box.innerHTML = '<div class="car"><div class="car__track"></div><button type="button" aria-label="Previous slide">‹</button><button type="button" aria-label="Next slide">›</button></div>' +
          '<p class="label" style="margin-top:8px">SLIDE <span class="car__now">1</span> / ' + it.slides.length + ' · SWIPE OR USE THE ARROWS</p>';
        var track = box.querySelector('.car__track');
        it.slides.forEach(function (src, k) { var im = new Image(); im.src = src; im.alt = 'Slide ' + (k + 1); im.loading = 'lazy'; track.appendChild(im); });
        var btns = box.querySelectorAll('.car button');
        btns[0].addEventListener('click', function () { track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }); });
        btns[1].addEventListener('click', function () { track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }); });
        track.addEventListener('scroll', function () { box.querySelector('.car__now').textContent = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)) + 1; }, { passive: true });
      } else {
        box.innerHTML = '';
        var im = new Image(); im.src = it.img; im.alt = it.title; box.appendChild(im);
      }
    }

    function show(i) {
      cur = (i + items.length) % items.length;
      var it = items[cur];
      stamps.forEach(function (b, k) { b.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); });
      el('.view__no').textContent = 'No. ' + it.no + (it.fmt ? ' · ' + it.fmt.toUpperCase() : '');
      el('.view__when').textContent = it.when || '';
      el('h3').textContent = it.title;
      el('.view__cap').textContent = it.text || '';
      var link = el('.view__link');
      if (link) { if (it.link) { link.href = it.link; link.hidden = false; } else link.hidden = true; }
      el('.view__count').textContent = (cur + 1) + ' / ' + items.length;
      media(it);
    }

    stamps.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });
    el('.view__prev').addEventListener('click', function () { show(cur - 1); });
    el('.view__next').addEventListener('click', function () { show(cur + 1); });
    sheet.addEventListener('keydown', function (e) {
      if (e.target.closest('.car__track')) return;
      if (e.key === 'ArrowRight') { show(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show(cur - 1); e.preventDefault(); }
    });
    show(0);
  });

  // work index: filter postcards by what each piece shows
  var filters = document.querySelector('.filters');
  if (filters) {
    var cards = document.querySelectorAll('.pcard[data-tags]');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var tag = b.getAttribute('data-tag');
      filters.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cards.forEach(function (c) { c.hidden = tag !== 'all' && c.getAttribute('data-tags').split(' ').indexOf(tag) < 0; });
    });
  }
})();
