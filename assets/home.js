/*
 * Home page behaviour. Section by section, matching home.css.
 * Nothing leaves the browser: the poll and the heatmap live in memory only.
 */
(function () {
  'use strict';
  var IMG = 'assets/img/', CASE = 'work/';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none)').matches;
  var phone = matchMedia('(max-width: 860px)');
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function seq(pre, n) { var a = []; for (var i = 1; i <= n; i++) a.push(pre + (i < 10 ? '0' : '') + i + '.jpg'); return a; }

  // the ten bright colours headlines pick up, and a check for the light ones (they get dark text)
  var FUN = ['#2f5bff', '#00a36c', '#7a3cff', '#d02b8f', '#00a9bd', '#e3bd00', '#0a74da', '#6cb800', '#a86bff', '#1fa0ff'];
  function light(hex) { var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) > 150; }
  function ink(hex) { return light(hex) ? '#2a1a1e' : '#f4efe6'; }

  // the projects (same copy as content/work.json and the case pages)
  var P = [
    { t: 'The Haunted CRM', k: 'LinkedIn campaign · Halloween 2026', s: 'the-haunted-crm', img: 'haunted-crm-teaser.jpg', pieces: seq('haunted-crm-', 15), n: [['15', 'posts'], ['5', 'days'], ['3', 'a day']], d: 'Fifteen CRM problems told as ghost stories across five days: posts, carousels, short videos, a trailer and a checklist people could tick through.' },
    { t: 'The Founder Bottleneck', k: 'LinkedIn campaign · Oct 2026', s: 'the-founder-bottleneck', img: 'founder-bottleneck-sick-day.jpg', pieces: seq('founder-bottleneck-', 15), n: [['15', 'pieces'], ['3', 'chapters'], ['4', 'videos']], d: 'One week, fifteen pieces on what stops when everything runs through the founder: images, carousels and short videos.' },
    { t: 'The Content Studio', k: 'System · 2026', s: 'the-content-studio', img: 'content-studio-route.svg', pieces: Array(11).join('.').split('.').map(function () { return 'content-studio-route.svg'; }), n: [['11', 'stops'], ['1', 'brief in'], ['1', 'post out']], d: 'The production system behind every campaign here: a brief goes in, and a checked, captioned post comes out. Videos, carousels and soundtracks are built in code.' },
    { t: 'The B2Ne website', k: 'Website · 2026', s: 'the-b2ne-website', img: 'b2ne-page-how-we-help.jpg', pieces: ['b2ne-page-about-us.jpg', 'b2ne-page-how-we-help.jpg', 'b2ne-page-nexus-academy.jpg', 'b2ne-page-our-crew.jpg', 'b2ne-page-pricing.jpg', 'b2ne-page-services.jpg', 'b2ne-page-website-health-check.jpg'], n: [['5', 'pages I made']], d: 'Co-built with B2Ne’s founder. I made the About, How We Help, Services, Pricing and Nexus Academy pages.' },
    { t: 'CRM Graveyard', k: 'LinkedIn series · 2026', s: 'crm-graveyard', img: 'crm-graveyard-close-date.jpg', pieces: seq('crm-graveyard-', 16), n: [['14', 'posts'], ['2', 'videos']], d: 'Fourteen posts and two short videos. One B2Ne look, a different visual idea for every post, tracked in a ledger so nothing repeats.' }
  ];

  /* ---------- fun colours on headlines ---------- */
  // (the bright colours are kept for the opening headline only; everything else stays burgundy)

  /* ---------- clock (menu bar and bento) ---------- */
  function timeIn() { return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }); }
  function clock() { $('#barClock').textContent = 'Himachal ' + timeIn(); $('#bClock').textContent = timeIn(); }
  clock(); setInterval(clock, 15000);

  /* ---------- decoding links and magnetic buttons ---------- */
  var G = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*';
  function decode(el, txt) {
    if (reduce) return; clearInterval(el._id); var f = 0;
    el._id = setInterval(function () {
      el.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < f ? c : G[Math.floor(Math.random() * G.length)]; }).join('');
      f += .6; if (f >= txt.length) { clearInterval(el._id); el.textContent = txt; }
    }, 28);
  }
  $$('.bar nav a').forEach(function (a) { a.addEventListener('mouseenter', function () { decode(a, a.dataset.t); }); });
  var mags = [];
  function magnet(el, reach, pull) { if (el) mags.push({ el: el, reach: reach, pull: pull }); }
  if (!reduce && !touch) addEventListener('mousemove', function (e) {
    mags = mags.filter(function (m) { return m.el.isConnected; });
    mags.forEach(function (m) {
      var b = m.el.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2), d = Math.hypot(dx, dy);
      m.el.style.transform = d < m.reach ? 'translate(' + dx * m.pull + 'px,' + dy * m.pull + 'px)' : '';
    });
  });
  magnet($('#hiBtn'), 110, .25); magnet($('#mag'), 240, .3);

  /* ---------- 1. the game ---------- */
  /* The game is dealt as playing cards. Three rounds, three ways to pick:
   *   1 flash: two cards dealt face-down, flipped up for ~2.5s, then "which line do you remember?"
   *   2 pull:  two face-up cards; drag the divider toward your pick
   *   3 weigh: two cards on a scale; hold a side until it touches down
   * Each pick reveals a trait ('tr'), the reason the post works ('why'), and how Riya would write
   * for someone who picks it ('brief'). The result is "your hand": the three cards you kept. */
  var R = [
    { mode: 'flash', q: 'Which line do you remember?', p: 1,
      a: { img: 'founder-bottleneck-sick-day.jpg', t: 'The Sick Day', line: '“You stayed home. So did the pipeline.”', tr: 'costs you can see', why: 'It shows a cost you can see: one day off, and the pipeline stops.', brief: 'Show the damage: the missed deal, the stalled pipeline, the number that moved.' },
      b: { img: 'founder-bottleneck-sleepless-night.jpg', t: 'The Sleepless Night', line: '“You went to bed. The deals came too.”', tr: 'costs you can feel', why: 'It shows a cost you can feel: the deals you carry to bed.', brief: 'Lead with the feeling: the 2 a.m. worry, not the spreadsheet.' } },
    { mode: 'pull', q: 'Pull the line toward the one you’d send your sales team.', p: 4,
      a: { img: 'crm-graveyard-close-date.jpg', t: 'The Close Date', tr: 'a straight joke', why: 'It’s a straight joke: the close date that moves every month, exactly as it happens.', brief: 'Keep the joke plain. If they’ve lived it, they’ll laugh and share it.' },
      b: { img: 'crm-graveyard-ouija-board.jpg', t: 'The HubSpot Ouija Board', tr: 'absurd humour', why: 'It’s absurd humour: asking a Ouija board where the pipeline went.', brief: 'Push the metaphor until it’s ridiculous, then land the point.' } },
    { mode: 'weigh', q: 'Hold to add weight to the one you’d click.', p: 0,
      a: { img: 'haunted-crm-teaser.jpg', t: 'The Haunted CRM teaser', tr: 'a big promise', why: 'It’s a big promise: horror stories from inside your CRM, coming soon.', brief: 'Open with one big idea, then prove it post by post.' },
      b: { img: 'haunted-crm-three-forecasts.jpg', t: 'The Three Forecasts', tr: 'one specific problem', why: 'It’s one specific problem: three forecasts, and nobody knows which is real.', brief: 'Skip the slogan. Name one problem they have today.' } }
  ];
  // How each round is read at the end. Round 1 tests what sticks, round 2 what you'd share, round 3 what earns a click.
  var READ = [
    { label: 'WHAT STICKS WITH YOU', mode: 'FLASH TEST', step: 'Hook',
      a: { name: 'A cost you can see', clause: 'you remember the cost you can see', me: 'I remember the cost I can see', plan: 'Open on the visible damage: the stalled pipeline, the missed deal, the number that moved.' },
      b: { name: 'A cost you can feel', clause: 'you remember the cost you can feel', me: 'I remember the cost I can feel', plan: 'Open on the feeling: the 2 a.m. worry, before any numbers.' },
      none: { name: 'Nothing stuck yet', ev: 'Neither first line stayed with you.', clause: 'neither first line stuck with you', me: 'neither first line stuck with me', plan: 'Start with the first line: test a few until one is remembered.' } },
    { label: 'WHAT YOU’D SHARE', mode: 'PULL', step: 'Tone',
      a: { name: 'A straight joke', clause: 'you’d share the joke you’ve lived', me: 'I’d share the joke I’ve lived', plan: 'Keep the humour plain: the moment they’ve lived, told exactly as it happens.' },
      b: { name: 'Absurd humour', clause: 'you’d share the joke that goes too far', me: 'I’d share the joke that goes too far', plan: 'Push one metaphor until it’s ridiculous, then land the point.' } },
    { label: 'WHAT EARNS YOUR CLICK', mode: 'WEIGH IT', step: 'Ask',
      a: { name: 'A big promise', clause: 'you click for a big promise', me: 'I click for a big promise', plan: 'Sell one big idea first, then prove it post by post.' },
      b: { name: 'One specific problem', clause: 'you click for one specific problem', me: 'I click for one specific problem', plan: 'Name one problem they have today, and offer to fix that one.' } }
  ];
  var TOPICS = ['A campaign', 'My positioning', 'Working together', 'A research project', 'Just saying hi'];
  var game = $('#game'), r = 0, picks = [], tries = 0;
  function suit(s) { return s === 'a' ? '♥' : '♠'; }
  function card(s, x, cls, i) {
    return '<div class="pcard ' + (cls || '') + '" data-s="' + s + '" style="--i:' + (i || 0) + '"><div class="pc-in"><div class="face">' +
      '<span class="ix tl" aria-hidden="true">' + s.toUpperCase() + '<small>' + suit(s) + '</small></span><img src="' + IMG + x.img + '" alt="' + x.t + '" draggable="false">' +
      '<span class="ix br" aria-hidden="true">' + s.toUpperCase() + '<small>' + suit(s) + '</small></span></div><div class="back"></div></div></div>';
  }
  function backCard() { return '<div class="pcard down" aria-hidden="true"><div class="pc-in"><div class="face"></div><div class="back"></div></div></div>'; }
  function dots() { return '<div class="dots" aria-hidden="true">' + R.map(function (_, i) { return '<i class="' + (i <= r ? 'on' : '') + '"></i>'; }).join('') + '</div>'; }
  function head(x) {
    return dots() + '<p class="lab">Round ' + (r + 1) + ' of 3<span class="mode">' + { flash: 'FLASH TEST', pull: 'PULL', weigh: 'WEIGH IT' }[x.mode] + '</span></p>' +
      '<h2 class="round-h">' + (x.mode === 'flash' ? 'Watch closely. You get a couple of seconds.' : x.q) + '</h2>';
  }
  function later(fn, ms) { return setTimeout(fn, reduce ? 0 : ms); }
  // keep the game on screen: jump back to its top for each round, and show new blocks as they appear
  function toTop() { var p = $('#play'), bh = $('.bar').offsetHeight; if (Math.abs(p.getBoundingClientRect().top - bh) > 4) p.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function show_(el) { if (el) setTimeout(function () { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }, 60); }

  // the opening headline: each letter gets heavier as your cursor nears it, and the closest catch a colour
  var kinL = [], breathe = null;
  function kinetic(k) {
    var text = k.textContent;
    k.innerHTML = text.split(' ').map(function (w) { return '<span class="w" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="l">' + c + '</span>'; }).join('') + '</span>'; }).join(' ') + '<span class="sr-only">' + text + '</span>';
    kinL = $$('.l', k);
    clearInterval(breathe);
    if (touch && !reduce) {
      var t = 0;
      breathe = setInterval(function () {
        if (!k.isConnected) return clearInterval(breathe);
        t += .05; kinL.forEach(function (s, i) {
          var wv = (Math.sin(t - i * .35) + 1) / 2; s.style.fontVariationSettings = "'wght' " + Math.round(200 + wv * 600) + ",'opsz' 96";
          if (wv > .97 && !s._hot) { s._hot = 1; s.style.color = FUN[Math.floor(Math.random() * FUN.length)]; setTimeout(function () { s.style.color = ''; s._hot = 0; }, 1100); }
        });
      }, 50);
    }
  }
  if (!touch && !reduce) {
    $('#play').addEventListener('mousemove', function (e) {
      if (!kinL.length || !kinL[0].isConnected) return;
      kinL.forEach(function (s) {
        var b = s.getBoundingClientRect(), d = Math.hypot(b.left + b.width / 2 - e.clientX, b.top + b.height / 2 - e.clientY), f = Math.max(0, 1 - d / 260);
        s.style.fontVariationSettings = "'wght' " + Math.round(200 + f * 600) + ",'opsz' 96"; s.style.transform = 'translateY(' + (-f * 6) + 'px)';
        if (f > .75 && !s._hot) { s._hot = 1; s.style.color = FUN[Math.floor(Math.random() * FUN.length)]; setTimeout(function () { s.style.color = ''; s._hot = 0; }, 1100); }
      });
    });
    $('#play').addEventListener('mouseleave', function () { kinL.forEach(function (s) { s.style.fontVariationSettings = "'wght' 200,'opsz' 96"; s.style.transform = ''; }); });
  }

  function intro() {
    r = 0; picks = [];
    game.innerHTML = '<div class="intro"><div><p class="lab type" id="typeK"></p><h1 class="kin" id="kin">I study why people choose.</h1>' +
      '<p class="lede fade">Three rounds with real posts I made. Remember, pull, weigh. At the end I’ll tell you what persuades you, and how I’d write a campaign for you.</p>' +
      '<div class="row fade"><button class="go" id="start" type="button">Deal me in →</button><a class="ghost" href="#work">Just show me the work</a></div></div>' +
      '<div class="deck" id="deck" role="button" tabindex="0" aria-label="Shuffle and deal">' + backCard() + backCard() + backCard() + backCard() + '<p class="dhint">' + (touch ? 'tap the deck to shuffle and deal' : 'click the deck to shuffle and deal') + '</p></div></div>';
    kinetic($('#kin'));
    var go = function () { var d = $('#deck'); if (!d || d.classList.contains('shuffle')) return; d.classList.add('shuffle'); later(round, 900); };
    $('#start').onclick = go; $('#deck').onclick = go;
    $('#deck').onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    typeOut($('#typeK'), 'Riya Dutta · Marketing consultant');
    magnet($('#start'), 150, .2);
  }
  function round() { tries = 0; var x = R[r]; ({ flash: flash, pull: pull, weigh: weigh })[x.mode](x); toTop(); }

  // 1 flash
  function flash(x) {
    game.innerHTML = head(x) + '<div class="felt" id="felt">' + card('a', x.a, 'down dealt', 0) + card('b', x.b, 'down dealt', 1) + '</div><div id="below"></div>';
    var t = $('#felt'), n = 3;
    later(function tick() {
      if (n > 0) { t.insertAdjacentHTML('beforeend', '<span class="count" aria-hidden="true">' + n + '</span>'); var c = $('.count', t); setTimeout(function () { c.remove(); }, 550); n--; later(tick, 600); return; }
      show(t, x);
    }, 900);
  }
  function show(t, x) {
    $$('.pcard', t).forEach(function (c) { c.classList.remove('down'); });
    later(function () { $$('.pcard', t).forEach(function (c) { c.classList.add('down'); }); later(function () { ask(x); }, 500); }, reduce ? 4000 : 2500);
  }
  function ask(x) {
    var lines = [['a', x.a.line], ['b', x.b.line]].sort(function () { return Math.random() - .5; });
    $('#below').innerHTML = '<div class="ask"><h3>' + x.q + '</h3>' + lines.map(function (l) { return '<button class="line" type="button" data-s="' + l[0] + '">' + l[1] + '</button>'; }).join('') +
      '<button class="none" type="button" id="none">I don’t remember either</button></div>';
    $$('#below .line').forEach(function (b) { b.onclick = function () { decide(x, b.dataset.s, 'stuck'); }; });
    $('#below .line').focus({ preventScroll: true });
    show_($('#below .ask'));
    $('#none').onclick = function () {
      tries++;
      $('#below').innerHTML = '<div class="reveal" role="status"><h3>Neither stuck.</h3><p>That’s a result too: both posts need a stronger first line.' + (tries < 2 ? ' Want one more look?' : '') + '</p><div class="row">' +
        (tries < 2 ? '<button class="go" type="button" id="again1">Flash them again</button>' : '') + '<button class="ghost" type="button" id="skip1">Skip this round</button></div></div>';
      if ($('#again1')) $('#again1').onclick = function () { $('#below').innerHTML = ''; toTop(); show($('#felt'), x); };
      show_($('#below .reveal'));
      $('#skip1').onclick = function () { picks[r] = { none: true, proj: x.p }; next(); };
    };
  }

  // 2 pull
  function pull(x) {
    game.innerHTML = head(x) + '<div class="pull" id="pull" role="slider" tabindex="0" aria-label="Drag toward your pick: left for ' + x.a.t + ', right for ' + x.b.t + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' +
      '<div class="halves"><div class="half a">' + card('a', x.a, 'dealt', 0) + '</div><div class="half b">' + card('b', x.b, 'dealt', 1) + '</div></div>' +
      '<div class="divider"></div><div class="knob" aria-hidden="true">⟷</div><span class="goal" style="left:16px">pull right for A</span><span class="goal" style="right:16px">pull left for B</span></div><div id="below"></div>';
    var st = $('#pull'), on = false, done = false, v = 50;
    function size(val) {
      v = val; st.style.setProperty('--x', v + '%'); st.setAttribute('aria-valuenow', Math.round(v));
      if (!done && v > 78) { done = true; on = false; decide(x, 'a', 'pull'); }
      if (!done && v < 22) { done = true; on = false; decide(x, 'b', 'pull'); }
    }
    size(50);
    function set(e) { var b = st.getBoundingClientRect(); size(Math.min(94, Math.max(6, (e.clientX - b.left) / b.width * 100))); }
    st.addEventListener('pointerdown', function (e) { if (done) return; on = true; st.setPointerCapture(e.pointerId); set(e); });
    st.addEventListener('pointermove', function (e) { if (on && !done) set(e); });
    st.addEventListener('pointerup', function () { on = false; });
    st.addEventListener('keydown', function (e) { if (done) return; if (e.key === 'ArrowRight') { e.preventDefault(); size(Math.min(94, v + 8)); } if (e.key === 'ArrowLeft') { e.preventDefault(); size(Math.max(6, v - 8)); } });
  }

  // 3 weigh
  function weigh(x) {
    game.innerHTML = head(x) + '<div class="scale"><div class="beam" id="beam"><div class="pan l">' + card('a', x.a, 'dealt', 0) + '</div><div class="pan r">' + card('b', x.b, 'dealt', 1) + '</div></div><div class="pivot"></div></div>' +
      '<div class="holds"><button class="hold" type="button" data-w="-1">Hold for A ♥</button><button class="hold" type="button" data-w="1">Hold for B ♠</button></div><div id="below"></div>';
    var tilt = 0, dir = 0, done = false, last = performance.now(), beam = $('#beam'), MAX = 16;
    var id = setInterval(function () {
      var now = performance.now(), dt = Math.min(.1, (now - last) / 1000); last = now;
      if (done || !beam.isConnected) return clearInterval(id);
      if (dir) tilt = Math.max(-MAX, Math.min(MAX, tilt + dir * dt * 12)); else tilt *= Math.pow(.2, dt);
      beam.style.setProperty('--tilt', tilt + 'deg');
      if (Math.abs(tilt) >= MAX) { done = true; dir = 0; $$('.hold').forEach(function (b) { b.disabled = true; }); decide(x, tilt < 0 ? 'a' : 'b', 'weigh'); }
    }, 16);
    function press(w) { return function () { if (!done) dir = w; }; }
    function lift() { dir = 0; }
    $$('.hold').forEach(function (b) {
      b.addEventListener('pointerdown', press(+b.dataset.w));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) { b.addEventListener(e, lift); });
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(+b.dataset.w)(); } });
      b.addEventListener('keyup', lift);
    });
    $$('#beam .pcard').forEach(function (c) {
      var w = c.dataset.s === 'a' ? -1 : 1;
      c.addEventListener('pointerdown', function (e) { c.setPointerCapture(e.pointerId); press(w)(); });
      ['pointerup', 'pointercancel'].forEach(function (e) { c.addEventListener(e, lift); });
    });
  }

  function decide(x, s, how) {
    var mine = x[s], last = r === R.length - 1, p = P[x.p], col = '#800020';
    picks[r] = { pick: mine, s: s, proj: x.p, how: how };
    $$('#game .pcard').forEach(function (c) {
      c.classList.remove('down');
      if (c.dataset.s === s) { c.classList.add('chosen'); c.style.setProperty('--pick', col); c.style.setProperty('--pickfg', ink(col)); }
      else if (how === 'stuck') c.classList.add('out');
    });
    burst();
    $('#below').innerHTML = '<div class="reveal" role="status"><h3>' + { stuck: '“' + mine.t + '” stuck.', pull: 'You pulled for “' + mine.t + '”.', weigh: 'The scale tipped for “' + mine.t + '”.' }[how] + '</h3>' +
      '<p>' + mine.why + ' From <b>' + p.t + '</b>.</p><div class="row"><button class="ghost" type="button" data-proj>Open the project</button><button class="go" type="button" id="next">' + (last ? 'See your hand →' : 'Next round →') + '</button></div></div>';
    $('#next').onclick = next; $('[data-proj]', $('#below')).onclick = function () { gatherOpen(x.p); };
    $('#next').focus({ preventScroll: true });
    show_($('#below .reveal'));
  }
  function next() { if (r === R.length - 1) end(); else { r++; round(); } }

  function end() {
    var rows = R.map(function (x, i) {
      var k = picks[i] || { none: true, proj: x.p }, rd = READ[i], o = k.none ? rd.none : rd[k.s];
      var ev = k.none ? o.ev : { stuck: 'You remembered ' + k.pick.line, pull: 'You pulled for ' + k.pick.t + '.', weigh: 'The scale tipped for ' + k.pick.t + '.' }[k.how];
      return { k: k, rd: rd, o: o, ev: ev };
    });
    var sentence = rows[0].o.clause + ', ' + rows[1].o.clause + ', and ' + rows[2].o.clause + '.';
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    game.innerHTML = '<div class="final"><div class="hand">' + rows.map(function (w, i) { return w.k.none ? backCard() : card(w.k.s, w.k.pick, '', i); }).join('') + '</div><div>' +
      '<p class="lab">Your hand</p><h2>' + sentence + '</h2>' +
      '<div class="reads">' + rows.map(function (w, i) { return '<div class="read"><i>0' + (i + 1) + '</i><small>' + w.rd.label + ' · ' + w.rd.mode + '</small><b>' + w.o.name + '</b><span>' + w.ev + '</span></div>'; }).join('') + '</div>' +
      '<div class="plan"><p class="lab">How I’d write a campaign for you</p><dl>' + rows.map(function (w) { return '<dt>' + w.rd.step + '</dt><dd>' + w.o.plan + '<button type="button" data-proj="' + w.k.proj + '">See it in ' + P[w.k.proj].t + ' →</button></dd>'; }).join('') + '</dl></div>' +
      '<div class="row"><button class="go" id="hello" type="button">Send me your hand →</button><button class="ghost" id="again" type="button">Deal again</button><a class="ghost" href="#work">See all the work ↓</a></div>' +
      '<div id="slot"></div></div></div>';
    $('#again').onclick = function () { intro(); toTop(); };
    $$('[data-proj]', game).forEach(function (b) { b.onclick = function () { gatherOpen(+b.dataset.proj); }; });
    $('#hello').onclick = function () { compose(rows); };
    toTop();
    burst();
  }

  // the editable card: pre-written from your hand, but every part can be changed before it goes
  function compose(rows) {
    var slot = $('#slot');
    if ($('form', slot)) { $('textarea', slot).focus(); return; }
    slot.innerHTML = '<form class="compose" novalidate><button class="x" type="button" aria-label="Close the card">×</button><span class="ix" aria-hidden="true">R ♥</span><h3>Your card to Riya</h3>' +
      '<span class="lab" id="hc-l">Include from your hand (tap to leave one out)</span><div class="chipset" id="hc" role="group" aria-labelledby="hc-l">' +
      rows.map(function (w, i) { return '<button type="button" class="chip hand-chip" aria-pressed="true" data-i="' + i + '">' + w.o.name + '</button>'; }).join('') + '</div>' +
      '<span class="lab" id="tc-l">What do you want to talk about?</span><div class="chipset" id="tc" role="group" aria-labelledby="tc-l">' +
      TOPICS.map(function (t) { return '<button type="button" class="chip" aria-pressed="false">' + t + '</button>'; }).join('') + '</div>' +
      '<label class="lab" for="hand-msg">Your message (write anything, it’s yours to edit)</label><textarea id="hand-msg"></textarea>' +
      '<div class="two"><div><label class="lab" for="hand-nm">Your name</label><input id="hand-nm" autocomplete="name"></div><div><label class="lab" for="hand-em">Your email</label><input id="hand-em" type="email" autocomplete="email"></div></div>' +
      '<p class="err" role="alert"></p><div class="acts"><button class="go send" type="submit">Send from my mail app →</button><button class="reset" type="button" id="blank">Start from a blank card</button></div></form>';
    var f = $('form', slot), ta = $('#hand-msg'), on = [true, true, true], topic = '', edited = false, mine = rows.map(function (w) { return w.o.me; });
    function draft() {
      var parts = mine.filter(function (_, i) { return on[i]; }), cl = '';
      if (parts.length === 1) cl = parts[0];
      else if (parts.length) cl = parts.slice(0, -1).join(', ') + (parts.length > 2 ? ',' : '') + ' and ' + parts[parts.length - 1];
      return (cl ? 'Hi Riya,\nI played your game. ' + cl.charAt(0).toUpperCase() + cl.slice(1) + '.\n\nI’d like to talk about ' : 'Hi Riya,\n\nI’d like to talk about ') +
        (topic ? topic.charAt(0).toLowerCase() + topic.slice(1) + '. ' : '');
    }
    function fit() { ta.style.height = 'auto'; ta.style.height = Math.max(160, ta.scrollHeight + 6) + 'px'; }
    ta.value = draft(); setTimeout(fit, 0);
    ta.addEventListener('input', function () { edited = true; $('.err', f).textContent = ''; fit(); });
    $$('#hc .chip', f).forEach(function (c) { c.onclick = function () { var i = +c.dataset.i; on[i] = !on[i]; c.setAttribute('aria-pressed', on[i]); if (!edited) ta.value = draft(); fit(); }; });
    $$('#tc .chip', f).forEach(function (c) {
      c.onclick = function () {
        var was = c.getAttribute('aria-pressed') === 'true';
        $$('#tc .chip', f).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', !was); topic = was ? '' : c.textContent;
        if (!edited) ta.value = draft(); else if (topic) ta.value = ta.value.replace(/\s*$/, ' ') + topic.toLowerCase() + '. '; fit();
      };
    });
    $('#blank', f).onclick = function () { ta.value = 'Hi Riya,\n\n'; edited = true; fit(); ta.focus(); };
    $('.x', f).onclick = function () { slot.innerHTML = ''; $('#hello').focus(); };
    $$('input', f).forEach(function (i) { i.addEventListener('input', function () { $('.err', f).textContent = ''; }); });
    f.onsubmit = function (e) {
      e.preventDefault();
      var m = ta.value.trim(), nm = $('#hand-nm').value.trim(), em = $('#hand-em').value.trim(), er = $('.err', f);
      if (m.replace(/^Hi Riya,?/, '').trim().length < 3) { er.textContent = 'Write a line or two first.'; ta.focus(); return; }
      if (em && !/^\S+@\S+\.\S+$/.test(em)) { er.textContent = 'That email looks unfinished.'; $('#hand-em').focus(); return; }
      er.textContent = '';
      location.href = 'mailto:riyavdutta@gmail.com?subject=' + encodeURIComponent('My hand, from your site' + (nm ? ' (' + nm + ')' : '')) +
        '&body=' + encodeURIComponent(m + (nm || em ? '\n\n— ' + [nm, em].filter(Boolean).join(', ') : ''));
    };
    show_(f);
    ta.focus({ preventScroll: true }); ta.setSelectionRange(ta.value.length, ta.value.length);
  }
  function burst() {
    if (reduce) return;
    var host = $('#play');
    for (var i = 0; i < 26; i++) {
      var s = document.createElement('i'); s.className = 'confetti';
      s.style.left = Math.random() * 100 + '%'; s.style.background = ['#800020', '#5e0018', '#d9a3ad', '#fffcf6'][i % 4]; s.style.animationDelay = Math.random() * .4 + 's';
      host.appendChild(s); setTimeout(s.remove.bind(s), 2200);
    }
  }
  function typeOut(el, text) {
    if (!el) return; if (reduce) { el.textContent = text; return; }
    var k = 0, id = setInterval(function () { el.textContent = text.slice(0, ++k); if (k >= text.length) clearInterval(id); }, 28);
  }
  intro();

  /* ---------- the marquee: speeds up and leans with your scroll ---------- */
  (function () {
    var names = P.map(function (p) { return p.t; }).join(' · ') + ' · ', r1 = $('#r1'), r2 = $('#r2'), html = '';
    for (var i = 0; i < 4; i++) html += '<span>' + names + '</span>';
    r1.innerHTML = r2.innerHTML = html;
    if (reduce) return;
    var x1 = 0, x2 = -900, vel = 0, last = scrollY, vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe($('.mq'));
    (function f() {
      var y = scrollY, d = y - last; last = y; vel += (d - vel) * .12;
      if (vis) {
        var s = 1.1 + Math.abs(vel) * .6, dir = vel < -.5 ? -1 : 1, w = r1.scrollWidth / 4;
        x1 -= s * dir; x2 += s * dir; if (x1 < -w) x1 += w; if (x1 > 0) x1 -= w; if (x2 > 0) x2 -= w; if (x2 < -w) x2 += w;
        var sk = Math.max(-14, Math.min(14, vel * .5));
        r1.style.transform = 'translateX(' + x1 + 'px) skewX(' + (-sk) + 'deg)'; r2.style.transform = 'translateX(' + x2 + 'px) skewX(' + sk + 'deg)';
      }
      requestAnimationFrame(f);
    })();
  })();

  /* ---------- 2. work: decode on hover, image follows, click = the pieces spiral into the campaign ---------- */
  $('#list').innerHTML = P.map(function (p, i) { return '<button type="button" data-i="' + i + '"><i>0' + (i + 1) + '</i><b>' + p.t + '</b><small>' + p.k.toUpperCase() + '</small></button>'; }).join('');
  var fol = $('#follow');
  addEventListener('mousemove', function (e) { if (fol.classList.contains('on')) { fol.style.left = (e.clientX + 130) + 'px'; fol.style.top = e.clientY + 'px'; } });
  $$('#list button').forEach(function (b) {
    var i = +b.dataset.i, p = P[i], nm = $('b', b);
    b.addEventListener('mouseenter', function (e) { decode(nm, p.t); if (!touch && !phone.matches) { fol.src = IMG + p.img; fol.style.left = (e.clientX + 130) + 'px'; fol.style.top = e.clientY + 'px'; fol.classList.add('on'); } });
    b.addEventListener('mouseleave', function () { fol.classList.remove('on'); });
    b.onclick = function () { fol.classList.remove('on'); gatherOpen(i); };
  });
  function count(el, to) {
    if (reduce) { el.textContent = to; return; }
    var v = 0, st = Math.max(1, Math.ceil(to / 24)), id = setInterval(function () { v = Math.min(to, v + st); el.textContent = v; if (v >= to) clearInterval(id); }, 30);
  }
  var raf = null, lastOpener = null, ov = $('#open');
  function gatherOpen(i) {
    var p = P[i], core = $('#core');
    lastOpener = document.activeElement;
    $$('.th', ov).forEach(function (x) { x.remove(); });
    core.classList.remove('on'); ov.classList.remove('done');
    core.innerHTML = '<small>' + p.k.toUpperCase() + '</small><h3>' + p.t + '</h3><p>' + p.d + '</p><div class="nums">' +
      p.n.map(function (x, k) { return '<div><b data-to="' + x[0] + '">' + x[0] + '</b>' + x[1].toUpperCase() + '</div>'; }).join('') +
      '</div><a class="btn" href="' + CASE + p.s + '/">Read the case study →</a>';
    ov.setAttribute('aria-label', p.t);
    ov.classList.add('on'); document.body.style.overflow = 'hidden';
    var th = p.pieces.map(function (src) { var d = document.createElement('div'); d.className = 'th'; d.innerHTML = '<img src="' + IMG + src + '" alt="">'; ov.appendChild(d); return d; });
    var N = th.length, base = th.map(function (_, k) { return k * 360 / N; }), RR = Math.min(innerWidth * .38, 300), rad = th.map(function () { return RR * 1.6; }), tg = th.map(function () { return RR; }), t = 0, spd = .6;
    cancelAnimationFrame(raf);
    (function f() {
      t += spd;
      th.forEach(function (el, k) { rad[k] += (tg[k] - rad[k]) * .08; var a = (base[k] + t) * Math.PI / 180; el.style.transform = 'translate(' + Math.cos(a) * rad[k] + 'px,' + Math.sin(a) * rad[k] * .72 + 'px) rotate(' + Math.cos(a) * 8 + 'deg)'; el.style.opacity = rad[k] < 14 ? 0 : 1; });
      raf = requestAnimationFrame(f);
    })();
    setTimeout(function () { spd = 1.8; th.forEach(function (_, k) { setTimeout(function () { tg[k] = 0; }, reduce ? 0 : k * 60); }); }, reduce ? 0 : 900);
    // the pieces have gathered: fade them out under the text, then stop
    setTimeout(function () { ov.classList.add('done'); core.classList.add('on'); spd = .2; tg = tg.map(function () { return 0; }); $$('[data-to]', core).forEach(function (el) { count(el, +el.dataset.to); }); setTimeout(function () { cancelAnimationFrame(raf); }, 600); }, reduce ? 0 : 900 + N * 60 + 400);
    $('#closeOpen').focus({ preventScroll: true });
  }
  function closeOpen() { ov.classList.remove('on'); document.body.style.overflow = ''; cancelAnimationFrame(raf); if (lastOpener && lastOpener.focus) lastOpener.focus({ preventScroll: true }); }
  $('#closeOpen').onclick = closeOpen;

  /* ---------- 3. look around: a torch over every campaign ---------- */
  (function () {
    var tz = $('#torch'), g = $('#tgrid'), all = P[0].pieces.slice(0, 6).concat(P[1].pieces.slice(0, 6), P[4].pieces.slice(0, 6)), seen = {}, nSeen = 0, touched = false;
    g.innerHTML = all.map(function (s) { return '<img src="' + IMG + s + '" alt="" loading="lazy">'; }).join('');
    if (touch) $('#thint').textContent = 'Touch to look around';
    function at(x, y) { tz.style.setProperty('--x', x + 'px'); tz.style.setProperty('--y', y + 'px'); }
    function move(cx, cy) {
      var b = tz.getBoundingClientRect(); at(cx - b.left, cy - b.top); $('#thint').style.opacity = 0; touched = true;
      var el = document.elementsFromPoint(cx, cy).filter(function (e) { return e.tagName === 'IMG' && g.contains(e); })[0];
      if (el && !seen[el.src]) { seen[el.src] = 1; nSeen++; $('#tsay').textContent = 'You’ve looked at ' + nSeen + ' of ' + all.length + ' posts'; }
    }
    tz.addEventListener('pointermove', function (e) { move(e.clientX, e.clientY); });
    tz.addEventListener('pointerdown', function (e) { tz.style.setProperty('--r', '180px'); move(e.clientX, e.clientY); });
    tz.addEventListener('pointerup', function () { tz.style.setProperty('--r', '120px'); });
    tz.addEventListener('pointerleave', function () { if (!touch) at(-300, -300); });
    // on phones the torch drifts on its own until you touch it
    if (touch && !reduce) {
      var t = 0, vis = false;
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(tz);
      (function f() { if (!touched && vis) { t += .012; at(tz.clientWidth * (.5 + .32 * Math.sin(t * 1.3)), tz.clientHeight * (.5 + .3 * Math.sin(t * 2.1))); } if (!touched) requestAnimationFrame(f); })();
    }
  })();

  /* ---------- 4. the path: pinned scroll through five stops ---------- */
  var S = [
    ['2019 – 2023', 'B.Sc. (Hons.) Horticulture', 'Dr. YS Parmar University of Horticulture and Forestry', 'A horticulture degree spent testing hypotheses on plants.'],
    ['2024 – 2025', 'Management Trainee', 'HDFC Bank', 'A bank traineeship chasing deposit targets: branch revenue up 30% year on year; ₹1.36 crore CASA target met.'],
    ['2024 – 2026', 'MBA, Marketing and Business Analytics', 'LM Thapar School of Management', 'An MBA in analytics, on the Emerging Leaders scholarship.'],
    ['2025', 'Research Intern, ISLab', 'University of the Aegean · Samos', 'A summer tracking eyes in a Greek UI/UX lab, in behavioural and cognitive methods. Third prize at DIGIBUS.'],
    ['2026 – now', 'Marketing Consultant', 'Business To Nexus (B2Ne) and Nodinite · Remote', 'The ideas that used to live in a scrapbook now live in decks, campaigns and research.']
  ];
  $('#steps').innerHTML = S.map(function (s) { return '<li><small>' + s[0] + '</small><b>' + s[1] + '</b></li>'; }).join('');
  (function () {
    var pin = $('#pin'), li = $$('#steps li'), big = $('#bigcard'), last = -1;
    function upd() {
      var b = pin.getBoundingClientRect(), total = pin.offsetHeight - innerHeight, p = Math.min(1, Math.max(0, -b.top / total)), k = Math.min(S.length - 1, Math.floor(p * S.length * .999));
      pin.style.setProperty('--p', p.toFixed(3));
      li.forEach(function (x, i) { x.classList.toggle('on', i <= k); x.classList.toggle('now', i === k); });
      $('.pinhint').style.opacity = p > .92 ? 0 : 1;
      if (k !== last) {
        last = k; $('#bigY').textContent = S[k][0]; $('#bigT').textContent = S[k][1]; $('#bigO').textContent = S[k][2]; $('#bigM').textContent = S[k][3];
        var bg = k === S.length - 1 ? '#800020' : FUN[(k * 3) % FUN.length]; big.style.background = bg; big.style.color = ink(bg);
      }
    }
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  })();

  /* ---------- 5. bento ---------- */
  $$('#bento .t').forEach(function (t) {
    t.addEventListener('mousemove', function (e) {
      if (reduce || touch || t.classList.contains('on')) return;
      var b = t.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      t.style.transform = 'rotateY(' + x * 8 + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
    t.addEventListener('mouseleave', function () { t.style.transform = ''; });
  });
  $$('#bento .flip').forEach(function (f, i) {
    var c = FUN[(i * 3 + 2) % FUN.length]; f.style.setProperty('--c', c); f.style.setProperty('--fg', ink(c));
    f.onclick = function () { f.style.transform = ''; f.classList.toggle('on'); f.setAttribute('aria-pressed', f.classList.contains('on')); };
  });
  var votes = { a: 0, b: 0 };
  $$('.poll button').forEach(function (b, i) {
    b.style.setProperty('--c', FUN[i ? 3 : 4] + '55');
    b.onclick = function () {
      votes[b.dataset.v]++; var tot = votes.a + votes.b;
      $$('.poll button').forEach(function (x) { var pc = Math.round(votes[x.dataset.v] / tot * 100); $('i', x).style.width = pc + '%'; $('span', x).textContent = (x.dataset.v === 'a' ? 'Ghosts ' : 'Founders ') + pc + '%'; });
    };
  });

  /* ---------- 6. throwable posts ---------- */
  (function () {
    var box = $('#toss'), ids = ['haunted-crm-teaser.jpg', 'founder-bottleneck-sick-day.jpg', 'crm-graveyard-ouija-board.jpg', 'founder-bottleneck-sleepless-night.jpg', 'haunted-crm-three-forecasts.jpg', 'crm-graveyard-close-date.jpg'], z = 1, vis = true;
    var B = ids.map(function (id, i) { var im = document.createElement('img'); im.src = IMG + id; im.alt = ''; im.draggable = false; box.appendChild(im); return { el: im, x: 0, y: 0, vx: 0, vy: 0, a: (i - 2.5) * 6, va: 0, drag: false }; });
    function bounds() { var w = B[0].el.offsetWidth || 150; return { W: box.clientWidth - w, H: box.clientHeight - w * 1.25 }; }
    var bb = bounds();
    B.forEach(function (b, i) { b.x = bb.W * (i / (B.length - 1)); b.y = 50 + (i % 2) * Math.max(0, bb.H - 80) * .8; });
    var lx = 0, ly = 0, lt = 0;
    B.forEach(function (b) {
      b.el.addEventListener('pointerdown', function (e) { b.drag = true; b.el.classList.add('grab'); b.el.setPointerCapture(e.pointerId); lx = e.clientX; ly = e.clientY; lt = performance.now(); b.vx = b.vy = 0; b.el.style.zIndex = ++z; });
      b.el.addEventListener('pointermove', function (e) { if (!b.drag) return; var now = performance.now(), dt = Math.max(1, now - lt), dx = e.clientX - lx, dy = e.clientY - ly; b.x += dx; b.y += dy; b.vx = dx / dt * 16; b.vy = dy / dt * 16; b.va = b.vx * .4; lx = e.clientX; ly = e.clientY; lt = now; });
      ['pointerup', 'pointercancel'].forEach(function (ev) { b.el.addEventListener(ev, function () { b.drag = false; b.el.classList.remove('grab'); }); });
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(box);
    function step() {
      var o = bounds();
      B.forEach(function (b) {
        if (!b.drag) {
          b.x += b.vx; b.y += b.vy; b.a += b.va; b.vx *= .95; b.vy *= .95; b.va *= .92;
          if (b.x < 0) { b.x = 0; b.vx *= -.7; } if (b.x > o.W) { b.x = o.W; b.vx *= -.7; } if (b.y < 0) { b.y = 0; b.vy *= -.7; } if (b.y > o.H) { b.y = o.H; b.vy *= -.7; }
        }
        b.el.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px) rotate(' + b.a + 'deg)';
      });
    }
    step();
    (function f() { if (vis) step(); requestAnimationFrame(f); })();
  })();

  /* ---------- 7. the desktop ---------- */
  var desk = $('#desk'), z = 10, n = 0, open = {};
  var WC = { mail: '#2f5bff', heat: '#00a36c', studio: '#7a3cff', kit: '#e3bd00', links: '#d02b8f' };
  $$('.ico').forEach(function (b) { var c = WC[b.dataset.open], i = $('i', b); i.style.setProperty('--c', c); i.style.setProperty('--fg', ink(c)); });
    function win(id, title, html, x, y, w) {
    if (open[id] && open[id].isConnected) { open[id].style.zIndex = ++z; if (phone.matches) open[id].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return open[id]; }
    var el = document.createElement('div'); el.className = 'win'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', title);
    el.style.left = x + 'px'; el.style.top = y + 'px'; if (w) el.style.width = w + 'px'; el.style.zIndex = ++z;
    el.innerHTML = '<div class="win-t" style="--c:' + WC[id] + ';--fg:' + ink(WC[id]) + '">' + title + '<button type="button" aria-label="Close ' + title + '">×</button></div><div class="win-b">' + html + '</div>';
    desk.appendChild(el);
    open[id] = el;
    el.addEventListener('pointerdown', function () { el.style.zIndex = ++z; });
    $('.win-t button', el).onclick = function () { el.remove(); };
    var bar = $('.win-t', el), sx, sy, ox, oy;
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.tagName === 'BUTTON' || phone.matches) return;
      sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; bar.setPointerCapture(e.pointerId);
      bar.onpointermove = function (m) { el.style.left = Math.max(0, Math.min(desk.clientWidth - 60, ox + m.clientX - sx)) + 'px'; el.style.top = Math.max(0, Math.min(desk.clientHeight - 40, oy + m.clientY - sy)) + 'px'; };
    });
    bar.addEventListener('pointerup', function () { bar.onpointermove = null; });
    return el;
  }
  function off() { return (n++ % 4) * 24; }
  var APPS = {
    mail: function () {
      var w = win('mail', 'New message — to Riya Dutta', '<form class="mail" novalidate><p class="hi">Hello Riya,</p><label for="m1">Message</label><textarea id="m1"></textarea>' +
        '<label for="m2">Your name</label><input id="m2" autocomplete="name"><label for="m3">Your email</label><input id="m3" type="email" autocomplete="email">' +
        '<p class="err" role="alert"></p><button class="pill" type="submit">Send from my mail app →</button></form>', 150 + off(), 30 + off(), 420);
      var f = $('form', w); if (!f || f.dataset.ok) return w; f.dataset.ok = 1;
      f.onsubmit = function (e) {
        e.preventDefault();
        var m = $('#m1', f).value.trim(), em = $('#m3', f).value.trim(), nm = $('#m2', f).value.trim(), er = $('.err', f);
        if (!m) { er.textContent = 'Write a line or two first.'; $('#m1', f).focus(); return; }
        if (em && !/^\S+@\S+\.\S+$/.test(em)) { er.textContent = 'That email looks unfinished.'; $('#m3', f).focus(); return; }
        er.textContent = '';
        location.href = 'mailto:riyavdutta@gmail.com?subject=' + encodeURIComponent('Hello' + (nm ? ' from ' + nm : '')) + '&body=' + encodeURIComponent(m + (nm || em ? '\n\n— ' + [nm, em].filter(Boolean).join(', ') : ''));
      };
      $$('input,textarea', f).forEach(function (i) { i.addEventListener('input', function () { $('.err', f).textContent = ''; }); });
      return w;
    },
    heat: function () {
      var w = win('heat', 'Where you looked', '<div class="heat"><canvas></canvas><p></p></div>', 610 + off(), 40 + off(), 360);
      drawHeat(w); clearInterval(w._t); w._t = setInterval(function () { if (!w.isConnected) return clearInterval(w._t); drawHeat(w); }, 1500);
      return w;
    },
    studio: function () {
      var st = ['Brief', 'Plan', 'Copy', 'Check', 'Approve', 'Build', 'Render', 'Check', 'Deliver', 'Watch', 'Post'];
      var w = win('studio', 'Content Studio', '<p style="margin-bottom:12px">The route every post takes, from brief to posted piece.</p><div class="route">' +
        st.map(function (s, i) { return '<span style="--c:' + FUN[i % FUN.length] + ';--fg:' + ink(FUN[i % FUN.length]) + '">' + (i < 9 ? '0' : '') + (i + 1) + '<br>' + s + '</span>'; }).join('') +
        '</div><p style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="pill" type="button" data-run>Run a brief through it ▶</button><a class="pill--line" href="' + CASE + 'the-content-studio/">Case study</a></p>', 300 + off(), 110 + off(), 440);
      $('[data-run]', w).onclick = function () { var sp = $$('.route span', w); sp.forEach(function (s) { s.classList.remove('lit'); }); sp.forEach(function (s, i) { setTimeout(function () { s.classList.add('lit'); }, reduce ? 0 : i * 180); }); };
      return w;
    },
    kit: function () { return win('kit', 'Kit', '<div class="chips light" style="margin:0">' + ['HubSpot', 'LinkedIn', 'WordPress', 'Figma', 'Tobii · GSR', 'SPSS · JMP · R'].map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div><p style="margin-top:12px">Strategy on Monday, Figma on Tuesday, SPSS by Friday.</p>', 460 + off(), 220 + off(), 330); },
    links: function () { return win('links', 'Links', '<p><a href="mailto:riyavdutta@gmail.com">riyavdutta@gmail.com</a></p><p style="margin-top:8px"><a href="https://www.linkedin.com/in/riyaa-duttaa" rel="me">LinkedIn ↗</a></p>', 520 + off(), 300 + off(), 260); }
  };
  $$('[data-open]').forEach(function (b) {
    b.onclick = function () { var id = b.dataset.open; APPS[id](); if (phone.matches && open[id]) open[id].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); };
  });
  var deskOpened = false;
  function openDesk() { if (deskOpened) return; deskOpened = true; APPS.mail(); setTimeout(APPS.heat, reduce ? 0 : 500); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) openDesk(); }, { threshold: .35 }).observe(desk);
  // the big button: open the mail window and put the cursor in it
  $('#mag').onclick = function () {
    deskOpened = true; var w = APPS.mail(), ta = $('#m1', w);
    (phone.matches ? w : desk).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: phone.matches ? 'start' : 'center' });
    if (ta) setTimeout(function () { ta.focus({ preventScroll: true }); }, reduce ? 0 : 400);
  };

  /* the heatmap: where this visitor's attention went on this page (cursor, plus where they paused while scrolling on phones) */
  var pts = [], secT = {}, lastY = innerHeight / 2;
  addEventListener('pointermove', function (e) { if (pts.length < 6000) pts.push([e.pageX, e.pageY]); lastY = e.clientY; }, { passive: true });
  var secs = ['play', 'work', 'look', 'path', 'about', 'table', 'contact'],
    names = { play: 'the game', work: 'the Work list', look: 'Look around', path: 'the path', about: 'About', table: 'the posts you can throw', contact: 'this desktop' };
  setInterval(function () {
    if (document.hidden) return;
    var y = scrollY + (touch || phone.matches ? innerHeight / 2 : lastY);
    if ((touch || phone.matches) && pts.length < 6000) pts.push([innerWidth / 2, y]);
    for (var i = 0; i < secs.length; i++) { var el = document.getElementById(secs[i]); if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) { secT[secs[i]] = (secT[secs[i]] || 0) + 1; break; } }
  }, 250);
  function drawHeat(w) {
    var c = $('canvas', w); if (!c) return;
    var docW = document.documentElement.scrollWidth, docH = document.documentElement.scrollHeight, W = 320, sc = W / docW;
    c.width = W; c.height = Math.min(300, Math.round(docH * sc));
    var sy = c.height / docH, x = c.getContext('2d');
    secs.forEach(function (id, i) {
      var el = document.getElementById(id); x.fillStyle = i % 2 ? '#ebe2d4' : '#f4efe6'; x.fillRect(0, el.offsetTop * sy, W, el.offsetHeight * sy);
      x.fillStyle = '#7d726b'; x.font = '600 9px "Bricolage Grotesque", sans-serif'; x.fillText(names[id].toUpperCase(), 6, el.offsetTop * sy + 12);
    });
    pts.forEach(function (p) { var g = x.createRadialGradient(p[0] * sc, p[1] * sy, 0, p[0] * sc, p[1] * sy, 9); g.addColorStop(0, 'rgba(128,0,32,.16)'); g.addColorStop(1, 'rgba(128,0,32,0)'); x.fillStyle = g; x.fillRect(p[0] * sc - 9, p[1] * sy - 9, 18, 18); });
    var top = Object.keys(secT).sort(function (a, b) { return secT[b] - secT[a]; })[0];
    $('p', w).innerHTML = pts.length < 20 ? (touch ? 'Scroll around the page. This map fills in as you go.' : 'Move your cursor around the page. This map fills in as you go.') :
      'You lingered longest on <b>' + (top ? names[top] : 'the game') + '</b>. Watching where attention goes is what I do for brands: it’s the eye-tracking work, in miniature. Nothing here leaves your browser.';
  }

  /* ---------- scroll reveals ---------- */
  (function () {
    if (reduce || !('IntersectionObserver' in window)) return;
    var groups = [['#list button', .07], ['#bento .t', .06], ['#desk .ico', .06]];
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    groups.forEach(function (g) { $$(g[0]).forEach(function (el, i) { el.setAttribute('data-rv', ''); el.style.setProperty('--d', (g[1] * i) + 's'); io.observe(el); }); });
  })();

  /* ---------- ⌘K jump bar ---------- */
  var cmd = $('#cmd'), ci = $('#cmdIn'), cl = $('#cmdList'), sel = 0, cmdOpener = null;
  var items = [['The game', 'Home', '#play'], ['Selected work', 'Section', '#work'], ['Look around', 'Section', '#look'], ['The path', 'Section', '#path'], ['About', 'Section', '#about'], ['Throw the posts', 'Section', '#table'], ['Say hello', 'Desktop', '#contact'], ['All work', 'Page', 'work/']]
    .map(function (a) { return { t: a[0], k: a[1], go: function () { if (a[2].charAt(0) === '#') $(a[2]).scrollIntoView(); else location.href = a[2]; } }; })
    .concat(P.map(function (p, i) { return { t: p.t, k: 'Project', go: function () { gatherOpen(i); } }; }));
  function list() {
    var q = ci.value.toLowerCase(), f = items.filter(function (i) { return i.t.toLowerCase().indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(0, f.length - 1));
    cl.innerHTML = f.map(function (i, k) { return '<li><button type="button" class="' + (k === sel ? 'sel' : '') + '" data-k="' + items.indexOf(i) + '">' + i.t + '<small>' + i.k + '</small></button></li>'; }).join('');
    $$('button', cl).forEach(function (b) { b.onclick = function () { run(+b.dataset.k); }; });
    return f;
  }
  function closeCmd() { cmd.classList.remove('on'); if (cmdOpener && cmdOpener.focus) cmdOpener.focus({ preventScroll: true }); }
  function run(k) { cmd.classList.remove('on'); if (ov.classList.contains('on')) closeOpen(); items[k].go(); }
  function openCmd() { cmdOpener = document.activeElement; cmd.classList.add('on'); ci.value = ''; sel = 0; list(); ci.focus(); }
  $('#cmdBtn').onclick = openCmd;
  addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (cmd.classList.contains('on')) closeCmd(); else openCmd(); }
    else if (e.key === 'Escape') { if (cmd.classList.contains('on')) closeCmd(); else if (ov.classList.contains('on')) closeOpen(); }
  });
  ci.addEventListener('input', function () { sel = 0; list(); });
  ci.addEventListener('keydown', function (e) {
    var f = list();
    if (e.key === 'ArrowDown') { sel = Math.min(f.length - 1, sel + 1); list(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); list(); e.preventDefault(); }
    if (e.key === 'Enter' && f[sel]) run(items.indexOf(f[sel]));
  });
  cmd.addEventListener('click', function (e) { if (e.target === cmd) closeCmd(); });
})();
