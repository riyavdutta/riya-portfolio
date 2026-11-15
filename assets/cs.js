/*
 * Case study pages: behaviour for the sections in cs.css. Everything is optional: each block runs only if its section is on the page.
 */
(function () {
  'use strict';
  var $ = function (s, e) { return (e || document).querySelector(s); };
  var $$ = function (s, e) { return Array.prototype.slice.call((e || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, touch = matchMedia('(hover: none)').matches;
  function light(hex) { var n = parseInt(hex.replace('#', ''), 16); return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 150; }
  function ink(hex) { return light(hex) ? '#2a1a1e' : '#f4efe6'; }
  function seen(el, fn, th) {
    if (!('IntersectionObserver' in window)) return fn();
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { o.disconnect(); fn(); } }, { threshold: th || .4 }); o.observe(el);
  }
  var posts = [];
  var data = $('#posts'); if (data) try { posts = JSON.parse(data.textContent); } catch (e) {}

  /* ---------- the rail and the reading bar ---------- */
  var parts = $$('[data-label]'), rail = $('#rail');
  rail.innerHTML = parts.map(function (p) { return '<li><a href="#' + p.id + '"><i></i><span>' + p.dataset.label + '</span></a></li>'; }).join('');
  var railA = $$('a', rail);

  /* ---------- the hero: posts spiral into the cover, the title settles ---------- */
  var kin = $('#kin'), txt = kin.textContent, li = 0;
  kin.innerHTML = txt.split(' ').map(function (w) { return '<span class="w" aria-hidden="true">' + w.split('').map(function (ch) { return '<span class="l" style="--i:' + (li++) + '">' + ch + '</span>'; }).join('') + '</span>'; }).join(' ') + '<span class="sr-only">' + txt + '</span>';
  var L = $$('.l', kin);
  function settle() { kin.classList.add('settle'); setTimeout(function () { kin.classList.remove('settle'); }, 600 + L.length * 28 + 1100); }
  var pics = posts.filter(function (p) { return p.img; }).slice(0, 16);
  if (reduce || pics.length < 4 || scrollY > 100) settle();
  else {
    var ar = document.createElement('div'); ar.className = 'arrive'; document.body.appendChild(ar);
    var th = pics.map(function (p) { var d = document.createElement('div'); d.className = 'th'; d.innerHTML = '<img src="' + p.img + '" alt="">'; ar.appendChild(d); return d; });
    var N = th.length, R = Math.min(innerWidth * .36, 280), rad = th.map(function () { return R; }), base = th.map(function (_, i) { return i * 360 / N; }), t = 0, go = false, k = 0;
    var cv = $('#cover').getBoundingClientRect(), tx = cv.left + cv.width / 2 - innerWidth / 2, ty = cv.top + cv.height / 2 - innerHeight / 2, done = false;
    var finish = function () { if (done) return; done = true; ar.classList.add('gone'); setTimeout(function () { ar.remove(); }, 500); settle(); };
    (function f() {
      if (done) return;
      t += go ? 3 : 1;
      th.forEach(function (el, i) { if (go) rad[i] += (0 - rad[i]) * .09; var a = (base[i] + t) * Math.PI / 180; el.style.transform = 'translate(' + (Math.cos(a) * rad[i] + tx * k) + 'px,' + (Math.sin(a) * rad[i] * .72 + ty * k) + 'px) rotate(' + Math.cos(a) * 8 + 'deg)'; });
      if (go) k = Math.min(1, k + .03);
      if (go && rad[0] < 3) return finish();
      requestAnimationFrame(f);
    })();
    setTimeout(function () { go = true; }, 700);
    setTimeout(finish, 2500); // never let the opening hold the page
  }
  // afterwards the title lightens where the cursor is
  if (!touch && !reduce) $('.hero').addEventListener('mousemove', function (e) {
    if (kin.classList.contains('settle')) return;
    L.forEach(function (s) { var b = s.getBoundingClientRect(), d = Math.hypot(b.left + b.width / 2 - e.clientX, b.top + b.height / 2 - e.clientY), f = Math.max(0, 1 - d / 240); s.style.fontVariationSettings = "'wght' " + Math.round(800 - f * 600) + ",'opsz' 96"; });
  });
  var cov = $('#cover>img, #cover>svg');
  if (cov && !touch && !reduce) {
    $('#cover').addEventListener('mousemove', function (e) { var b = cov.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5; cov.style.transform = 'rotateY(' + x * 14 + 'deg) rotateX(' + (-y * 14) + 'deg)'; });
    $('#cover').addEventListener('mouseleave', function () { cov.style.transform = ''; });
  }
  var more = $('#more');
  if (more) more.onclick = function () { var on = $('#morefacts').classList.toggle('on'); more.setAttribute('aria-expanded', on); $('.ar', more).textContent = on ? '↑' : '↓'; };

  /* ---------- filling text: wrap each word so it can light up ---------- */
  function wrapWords(el) {
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], n;
    while ((n = walk.nextNode())) nodes.push(n);
    nodes.forEach(function (tn) {
      var frag = document.createDocumentFragment();
      tn.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w)); else { var s = document.createElement('span'); s.className = 'wd'; s.textContent = w; frag.appendChild(s); } });
      tn.parentNode.replaceChild(frag, tn);
    });
    return $$('.wd', el);
  }
  var fills = $$('.fill').map(function (el) { return { el: el, w: wrapWords(el), after: el.parentNode.querySelector('.after') }; });

  /* ---------- statement tiles: one open at a time ---------- */
  $$('.tiles').forEach(function (g) {
    var ts = $$('.tile', g);
    ts.forEach(function (t) {
      var open = function () { ts.forEach(function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-expanded', x === t); }); };
      t.addEventListener('click', open); if (!touch) t.addEventListener('mouseenter', open);
    });
  });

  /* ---------- rules: one open at a time ---------- */
  $$('.rules').forEach(function (r) {
    var ls = $$('li', r);
    ls.forEach(function (l) { $('button', l).onclick = function () { var was = l.classList.contains('on'); ls.forEach(function (x) { x.classList.remove('on'); $('button', x).setAttribute('aria-expanded', 'false'); }); if (!was) { l.classList.add('on'); $('button', l).setAttribute('aria-expanded', 'true'); } }; });
  });

  /* ---------- numbers count up when they arrive ---------- */
  $$('.num strong').forEach(function (el) {
    var m = el.textContent.match(/^(\D*)([\d.,]+)(.*)$/); if (!m || reduce) return;
    var pre = m[1], raw = m[2].replace(/,/g, ''), post = m[3], to = parseFloat(raw), dec = (raw.split('.')[1] || '').length, comma = m[2].indexOf(',') > -1;
    var fmt = function (v) { var s = v.toFixed(dec); if (comma) s = Number(s).toLocaleString('en-GB', { minimumFractionDigits: dec }); return pre + s + post; };
    el.textContent = fmt(0);
    seen(el, function () { var t0 = performance.now(); (function f(now) { var p = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(f); })(t0); }, .6);
  });

  /* ---------- quoted lines in the short cards type themselves out ---------- */
  $$('.typed').forEach(function (el) {
    var full = el.dataset.t; if (reduce) { el.textContent = full; return; }
    el.textContent = '';
    seen(el, function () { el.classList.add('go'); var k = 0, id = setInterval(function () { el.textContent = full.slice(0, ++k); if (k >= full.length) { clearInterval(id); setTimeout(function () { el.classList.remove('go'); }, 1500); } }, 40); }, .8);
  });

  /* ---------- palette: the section takes on the colour you point at; pairs flip ---------- */
  $$('.look').forEach(function (lk) {
    var bs = $$('.sw button', lk);
    bs.forEach(function (b) {
      var tint = function () { var h = b.dataset.hex; lk.style.background = h; lk.style.color = ink(h); lk.classList.add('tinted'); bs.forEach(function (x) { x.classList.toggle('on', x === b); }); };
      b.addEventListener('mouseenter', tint); b.addEventListener('click', tint);
    });
    $('.sw', lk).addEventListener('mouseleave', function () { lk.style.background = ''; lk.style.color = ''; lk.classList.remove('tinted'); bs.forEach(function (x) { x.classList.remove('on'); }); });
    $$('.pair', lk).forEach(function (p) { p.onclick = function () { p.classList.toggle('on'); p.setAttribute('aria-pressed', p.classList.contains('on')); }; });
  });

  /* ---------- scroll: reading bar, rail, filling text, sliding chapters ---------- */
  var chap = $('.chap'), track = chap && $('.track', chap), cd = chap ? $$('.dots i', chap) : [];
  function onScroll() {
    var h = document.documentElement; $('.bar').style.setProperty('--sp', scrollY / Math.max(1, h.scrollHeight - innerHeight));
    var cur = -1; parts.forEach(function (p, i) { if (p.getBoundingClientRect().top < innerHeight * .4) cur = i; }); railA.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    fills.forEach(function (f) {
      var b = f.el.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .85 - b.top) / (innerHeight * .5 + b.height * .5)));
      f.w.forEach(function (w, i) { w.classList.toggle('on', i < p * f.w.length); }); if (f.after) f.after.classList.toggle('on', p >= 1);
    });
    if (chap) {
      var cb = chap.getBoundingClientRect(), cp = Math.min(1, Math.max(0, -cb.top / (chap.offsetHeight - innerHeight))), max = track.scrollWidth - innerWidth;
      track.style.transform = 'translateX(' + (-cp * Math.max(0, max)) + 'px)';
      cd.forEach(function (d, i) { d.classList.toggle('on', i === Math.min(cd.length - 1, Math.floor(cp * cd.length * .999))); });
    }
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  /* ---------- the strip: drag or flick through the posts ---------- */
  var strip = $('#strip');
  if (strip) {
    var belt = $('.belt', strip), x = 0, v = 0, down = false, lx = 0, moved = 0, hint = $('.hintrow');
    var minX = function () { return Math.min(0, strip.clientWidth - belt.scrollWidth); };
    if (touch) { strip.style.overflowX = 'auto'; strip.addEventListener('scroll', function () { var m = strip.scrollWidth - strip.clientWidth; hint.style.setProperty('--sx', m ? strip.scrollLeft / m : 0); }, { passive: true }); }
    else {
      strip.addEventListener('pointerdown', function (e) { down = true; moved = 0; lx = e.clientX; v = 0; strip.classList.add('drag'); });
      addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx); x += dx; v = dx; });
      addEventListener('pointerup', function () { down = false; strip.classList.remove('drag'); });
      strip.addEventListener('click', function (e) { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);
      strip.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { x -= e.deltaX; e.preventDefault(); } }, { passive: false });
      var vis = true; if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(strip);
      (function f() {
        if (vis || down) {
          var mn = minX(); if (!down) { x += v; v *= .93; }
          x = Math.max(mn - 40, Math.min(40, x)); if (!down) { if (x > 0) x *= .85; if (x < mn) x = mn + (x - mn) * .85; }
          belt.style.transform = 'translateX(' + x + 'px)'; hint.style.setProperty('--sx', mn ? x / mn : 0);
        }
        requestAnimationFrame(f);
      })();
      // keyboard: tabbing to a post brings it into view
      belt.addEventListener('focusin', function (e) { var p = e.target.closest('.post'); if (!p) return; var sb = strip.getBoundingClientRect(), pb = p.getBoundingClientRect(); if (pb.left < sb.left) x += sb.left - pb.left + 40; else if (pb.right > sb.right) x -= pb.right - sb.right + 40; v = 0; });
    }
  }

  /* ---------- the viewer: posts, carousels, videos, captions; also single pictures ---------- */
  var view = $('#view'), at = 0, slide = 0, opener = null, typing = null, single = null;
  function typeCap(t) { clearInterval(typing); var el = $('#vc'); if (reduce) { el.textContent = t; return; } var k = 0; el.textContent = ''; typing = setInterval(function () { k += 3; el.textContent = t.slice(0, k); if (k >= t.length) clearInterval(typing); }, 16); }
  function media() {
    var p = single || posts[at], m = $('#vm');
    if (p.video) m.innerHTML = '<video src="' + p.video + '" poster="' + p.img + '" controls playsinline autoplay muted loop></video>';
    else if (p.slides) {
      m.innerHTML = '<img class="tapnext" src="' + p.slides[slide] + '" alt="Slide ' + (slide + 1) + ' of ' + p.slides.length + '"><div class="slides">' + p.slides.map(function (_, i) { return '<button type="button" aria-label="Slide ' + (i + 1) + '" class="' + (i === slide ? 'on' : '') + '" data-s="' + i + '"></button>'; }).join('') + '</div>';
      $$('.slides button', m).forEach(function (b) { b.onclick = function () { slide = +b.dataset.s; media(); }; });
      $('img', m).onclick = function () { slide = (slide + 1) % p.slides.length; media(); };
    } else m.innerHTML = '<img src="' + p.img + '" alt="' + (p.alt || p.title || '') + '">';
  }
  function show(i) {
    single = null; view.classList.remove('single');
    at = (i + posts.length) % posts.length; slide = 0; var p = posts[at];
    $('#vw').textContent = ['No. ' + p.no, p.fmt ? p.fmt.toUpperCase() : '', p.when || ''].filter(Boolean).join(' · ');
    $('#vt').textContent = p.title; $('#vi').textContent = (at + 1) + ' / ' + posts.length + (p.slides ? ' · tap the picture for the next slide' : '');
    var lk = $('#vl'); if (p.link) { lk.href = p.link; lk.hidden = false; } else lk.hidden = true;
    media(); typeCap(p.text || '');
  }
  function openView(el) { opener = el; view.classList.add('on'); document.body.style.overflow = 'hidden'; $('#vx').focus(); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]'); if (b) { openView(b); show(+b.dataset.open); return; }
    var z = e.target.closest('[data-zoom]'); if (z) {
      openView(z); single = { img: z.dataset.zoom, alt: z.dataset.alt, title: z.dataset.title }; view.classList.add('single');
      $('#vw').textContent = z.dataset.kick || ''; $('#vt').textContent = z.dataset.title || ''; $('#vi').textContent = ''; $('#vl').hidden = true; media(); typeCap(z.dataset.alt || '');
    }
  });
  function closeV() { view.classList.remove('on'); document.body.style.overflow = ''; $('#vm').innerHTML = ''; clearInterval(typing); if (opener) opener.focus({ preventScroll: true }); }
  if (view) {
    $('#vx').onclick = closeV; $('#vp').onclick = function () { show(at - 1); }; $('#vn').onclick = function () { show(at + 1); };
    view.addEventListener('click', function (e) { if (e.target === view) closeV(); });
    addEventListener('keydown', function (e) { if (!view.classList.contains('on')) return; if (e.key === 'Escape') closeV(); if (single) return; if (e.key === 'ArrowRight') show(at + 1); if (e.key === 'ArrowLeft') show(at - 1); });
  }

  /* ---------- the next case: the arrow leans toward you ---------- */
  var nx = $('.next'), arr = $('.next .arr');
  if (nx && !touch && !reduce) {
    nx.addEventListener('mousemove', function (e) { var b = arr.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2); arr.style.transform = 'translate(' + dx * .25 + 'px,' + dy * .25 + 'px)'; });
    nx.addEventListener('mouseleave', function () { arr.style.transform = ''; });
  }

  /* ---------- blocks rise in ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15 });
    $$('.sw button,.pair,.card,.num,.rules li,.tile').forEach(function (el, i) { el.setAttribute('data-rv', ''); el.style.setProperty('--d', (i % 5) * .06 + 's'); io.observe(el); });
  }
})();
