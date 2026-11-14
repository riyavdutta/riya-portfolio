/*
 * The Content Studio case page: one real post runs through the eleven stops.
 * Data comes from the JSON block next to the section (content/cases/the-content-studio.json,
 * section type "studiorun"). Without JavaScript the static list of stops stays visible.
 */
(function () {
  'use strict';
  var box = document.querySelector('.srun');
  var dataEl = document.querySelector('.srun-data');
  if (!box || !dataEl) return;
  var D = JSON.parse(dataEl.textContent), ROOT = box.getAttribute('data-root') || '';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, e) { return (e || document).querySelector(s); };
  var $$ = function (s, e) { return Array.prototype.slice.call((e || document).querySelectorAll(s)); };
  var P = D.post, VID = ROOT + P.video, POSTER = ROOT + P.poster;
  var stopsEl = $('.srun-stops', box), stage = $('.srun-stage', box), cur = 0, timer = null;
  var fallback = box.parentNode.querySelector('.srun-static');
  if (fallback) fallback.hidden = true;
  box.hidden = false;

  var ART = [brief, plan, copy, check, approve, build, render, check2, deliver, watch, post];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  stopsEl.innerHTML = D.items.map(function (s, i) {
    return '<li><button type="button" data-i="' + i + '"><i>' + pad(i + 1) + '</i><span>' + s.t + (s.you ? '<span class="srun-me" aria-label="Riya signs off">RD</span>' : '') + '</span></button></li>';
  }).join('');
  $$('button', stopsEl).forEach(function (b) { b.onclick = function () { stop(); go(+b.dataset.i); }; });

  function go(i) {
    cur = i; var s = D.items[i];
    $$('li', stopsEl).forEach(function (li, k) { li.classList.toggle('on', k === i); li.classList.toggle('done', k < i); });
    var on = $$('li', stopsEl)[i]; if (on && on.scrollIntoView && stopsEl.scrollWidth > stopsEl.clientWidth) on.scrollIntoView({ block: 'nearest', inline: 'center' });
    stage.innerHTML = '<div class="srun-meta">STOP ' + pad(i + 1) + ' OF ' + D.items.length + (s.you ? '<span class="srun-you">RD · RIYA SIGNS OFF HERE</span>' : '') + '</div>' +
      '<h3>' + s.t + '</h3><p class="srun-what">' + s.d + '</p><div class="srun-art"></div>' +
      '<div class="srun-ctrl"><button type="button" data-a="prev">← Back</button><button type="button" class="srun-go" data-a="play">' + (timer ? '❚❚ Pause' : 'Run it ▶') + '</button><button type="button" data-a="next">Next →</button><span>' + P.title + ' · ' + P.when + '</span></div>';
    ART[i]($('.srun-art', stage));
    $('[data-a="prev"]', stage).onclick = function () { stop(); go(Math.max(0, cur - 1)); };
    $('[data-a="next"]', stage).onclick = function () { stop(); go(Math.min(D.items.length - 1, cur + 1)); };
    $('[data-a="play"]', stage).onclick = function () { if (timer) stop(); else start(); };
  }
  function start() { if (cur === D.items.length - 1) cur = -1; timer = 1; tick(); }
  function tick() { if (!timer) return; go(cur + 1); if (cur === D.items.length - 1) { stop(); return; } timer = setTimeout(tick, cur === 6 || cur === 9 ? 5200 : 3400); }
  function stop() { clearTimeout(timer); timer = null; var p = $('[data-a="play"]', stage); if (p) p.textContent = 'Run it ▶'; }

  /* ---------- the artefact at each stop ---------- */
  function delay(i, step) { return ' style="animation-delay:' + (reduce ? 0 : i * step) + 's"'; }
  function brief(a) {
    a.innerHTML = '<div class="srun-paper srun-brief"><dl>' + P.brief.map(function (r, i) { return '<dt' + delay(i, .12) + '>' + r[0] + '</dt><dd' + delay(i, .12) + '>' + r[1] + '</dd>'; }).join('') + '</dl></div>';
  }
  function plan(a) {
    a.innerHTML = '<div class="srun-week">' + P.plan.map(function (d) {
      return '<div class="srun-day"><b>' + d.day + '</b><span class="srun-band" style="background:' + d.c + '"></span><small>' + d.t + '</small>' + (d.slot ? '<span class="srun-slot">' + d.slot + '</span>' : '') + '</div>';
    }).join('') + '</div>';
  }
  function capLines(anim) { return P.caption.map(function (l, i) { return '<p' + (anim ? ' class="srun-in"' + delay(i, .35) : '') + '>' + l + '</p>'; }).join(''); }
  function copy(a) { a.innerHTML = '<div class="srun-paper srun-cap">' + capLines(true) + '</div>'; }
  function check(a) {
    a.innerHTML = '<ul class="srun-rules">' + D.rules.map(function (r, i) { return '<li class="srun-in"' + delay(i, .3) + '><i aria-hidden="true">✓</i><div><b>' + r.t + '</b><span>' + r.d + '</span></div></li>'; }).join('') + '</ul>';
  }
  function approve(a) { a.innerHTML = '<div class="srun-paper srun-cap srun-approved">' + capLines(false) + '<div class="srun-stamp">APPROVED<small>RD · WORDS LOCKED</small></div></div>'; }
  function frames(a, ticks, label) {
    a.innerHTML = '<div><div class="srun-frames">' + [0, 1, 2, 3].map(function (i) {
      return '<figure class="srun-in"' + delay(i, .15) + '><canvas width="240" height="300" role="img" aria-label="' + label + ' ' + (i + 1) + ' of the video"></canvas>' + (ticks ? '<span class="srun-tick" aria-hidden="true">✓</span>' : '') + '<figcaption>' + label.toUpperCase() + ' ' + (i + 1) + '</figcaption></figure>';
    }).join('') + '</div>' + (ticks ? '<div class="srun-checks"></div>' : '') + '</div>';
    grab($$('canvas', a), ticks ? $('.srun-checks', a) : null);
  }
  function build(a) { frames(a, false, 'Scene'); }
  function check2(a) { frames(a, true, 'Frame'); }
  // draw four frames from the real video into the canvases
  function grab(cs, ck) {
    var v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.playsInline = true; v.src = VID;
    v.addEventListener('loadedmetadata', function () {
      var dur = v.duration || 8, k = 0;
      function next() {
        if (k >= cs.length) { if (ck) ck.innerHTML = '<span>✓ ' + dur.toFixed(1) + ' s long</span><span>✓ soundtrack in place</span><span>✓ every scene sampled</span>'; return; }
        v.currentTime = Math.min(dur - .1, dur * (k + .5) / cs.length);
      }
      v.addEventListener('seeked', function () {
        if (!cs[k] || !cs[k].isConnected) return;
        var c = cs[k], x = c.getContext('2d'), vw = v.videoWidth, vh = v.videoHeight, r = Math.max(c.width / vw, c.height / vh);
        x.drawImage(v, (c.width - vw * r) / 2, (c.height - vh * r) / 2, vw * r, vh * r); k++; next();
      });
      next();
    }, { once: true });
  }
  function vid() { return '<div class="srun-vid"><video src="' + VID + '" poster="' + POSTER + '" muted autoplay playsinline loop></video><button type="button">🔊 Sound on</button></div>'; }
  function sound(a) { var v = $('video', a), b = $('.srun-vid button', a); b.onclick = function () { v.muted = !v.muted; b.textContent = v.muted ? '🔊 Sound on' : '🔇 Sound off'; if (!v.muted) v.play(); }; }
  function render(a) {
    a.innerHTML = '<div class="srun-render">' + vid() + '<div><p class="srun-lab">RENDERING</p><p class="srun-big">Video and soundtrack</p><div class="srun-bar"><i></i></div><p class="srun-small">The soundtrack is synthesised in code: no samples.</p></div></div>';
    sound(a);
  }
  function deliver(a) {
    a.innerHTML = '<div class="srun-tree">' + P.files.map(function (f, i) { return '<div class="srun-in' + (f[1] ? ' srun-new' : '') + '"' + delay(i, .25) + '>' + f[0] + '</div>'; }).join('') +
      '<div class="srun-in srun-note"' + delay(P.files.length, .25) + '>Example layout: finished work sits apart from drafts, named by posting date.</div></div>';
  }
  function watch(a) {
    a.innerHTML = '<div class="srun-watch">' + vid() + '<div class="srun-paper srun-cap">' + capLines(false) + ('speechSynthesis' in window ? '<button type="button" class="srun-speak">▶ Read the caption aloud</button>' : '') + '</div></div>';
    sound(a);
    var sp = $('.srun-speak', a); if (!sp) return;
    sp.onclick = function () {
      speechSynthesis.cancel(); var ps = $$('.srun-cap p', a);
      P.caption.forEach(function (l, i) {
        var u = new SpeechSynthesisUtterance(l);
        u.onstart = function () { ps.forEach(function (p) { p.classList.remove('srun-read'); }); ps[i].classList.add('srun-read'); };
        if (i === P.caption.length - 1) u.onend = function () { ps[i].classList.remove('srun-read'); };
        speechSynthesis.speak(u);
      });
    };
  }
  function post(a) {
    a.innerHTML = '<div class="srun-post"><header><i>' + P.time + '</i><div><b>Posted</b><small>' + P.day + ' · LinkedIn</small></div></header><p>' + P.caption.join('\n') + '</p>' +
      '<img src="' + POSTER + '" alt="' + P.title + ', as posted"><div class="srun-first"><b>First comment:</b> ' + P.cta + '</div></div>';
  }

  // arrow keys move between stops while the run is on screen
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { stop(); go(Math.min(D.items.length - 1, cur + 1)); }
    if (e.key === 'ArrowLeft') { stop(); go(Math.max(0, cur - 1)); }
  });
  go(0);
})();
