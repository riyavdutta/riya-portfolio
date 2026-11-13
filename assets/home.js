/*
 * Home page behaviour. Section by section, matching home.css.
 * Nothing leaves the browser: the poll and the heatmap live in memory only.
 */
(function () {
  'use strict';
  var IMG = 'assets/img/', CASE = 'work/';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = matchMedia('(max-width: 760px)');
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  // the projects (same copy as content/work.json and the case pages)
  var P = [
    { t: 'The Haunted CRM', k: 'LinkedIn campaign · Halloween 2026', s: 'the-haunted-crm', img: 'haunted-crm-teaser.jpg', c: '#1b1550', n: [['15', 'posts'], ['5', 'days'], ['3', 'a day']], d: 'Fifteen CRM problems told as ghost stories across five days: posts, carousels, short videos, a trailer and a checklist people could tick through.' },
    { t: 'The Founder Bottleneck', k: 'LinkedIn campaign · Oct 2026', s: 'the-founder-bottleneck', img: 'founder-bottleneck-sick-day.jpg', c: '#0b0c22', n: [['15', 'pieces'], ['3', 'chapters'], ['4', 'videos']], d: 'One week, fifteen pieces on what stops when everything runs through the founder: images, carousels and short videos.' },
    { t: 'The Content Studio', k: 'System · 2026', s: 'the-content-studio', img: null, c: '#07081a', n: [['11', 'stops'], ['1', 'brief in'], ['1', 'post out']], d: 'The production system behind every campaign here: a brief goes in, and a checked, captioned post comes out. Videos, carousels and soundtracks are built in code.' },
    { t: 'The B2Ne website', k: 'Website · 2026', s: 'the-b2ne-website', img: 'b2ne-how-we-help.jpg', c: '#dfe9ff', n: [['5', 'pages I made']], d: 'Co-built with B2Ne’s founder. I made the About, How We Help, Services, Pricing and Nexus Academy pages.' },
    { t: 'CRM Graveyard', k: 'LinkedIn series · 2026', s: 'crm-graveyard', img: 'crm-graveyard-close-date.jpg', c: '#0a1466', n: [['14', 'posts'], ['2', 'videos']], d: 'Fourteen posts and two short videos. One B2Ne look, a different visual idea for every post, tracked in a ledger so nothing repeats.' },
    { t: 'TRACE-BRL', k: 'Research · 2025 –', s: 'trace-brl', img: null, c: '#cfe3c1', n: [['5', 'dimensions'], ['32', 'research initiatives']], d: 'A five-dimension maturity model for behavioural research labs, applied across 32 research initiatives. Co-authored; under review at Cognition, Technology & Work.' }
  ];

  /* ---------- clock (menu bar and bento) ---------- */
  function timeIn() { return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }); }
  function clock() { $('#barClock').textContent = 'Himachal ' + timeIn(); $('#bClock').textContent = timeIn(); }
  clock(); setInterval(clock, 15000);

  /* ---------- 1. the choice ---------- */
  var R = [
    { q: 'Which one makes you stop scrolling?', a: { img: 'founder-bottleneck-sick-day.jpg', t: 'The Sick Day' }, b: { img: 'founder-bottleneck-sleepless-night.jpg', t: 'The Sleepless Night' }, p: 1 },
    { q: 'Which would you send to your sales team?', a: { img: 'crm-graveyard-close-date.jpg', t: 'The Close Date' }, b: { img: 'crm-graveyard-ouija-board.jpg', t: 'The HubSpot Ouija Board' }, p: 4 },
    { q: 'Which poster gets your click?', a: { img: 'haunted-crm-teaser.jpg', t: 'The Haunted CRM teaser' }, b: { img: 'haunted-crm-three-forecasts.jpg', t: 'The Three Forecasts' }, p: 0 }
  ];
  var game = $('#game'), r = 0, picks = [];
  function intro() {
    r = 0; picks = [];
    game.innerHTML = '<p class="k b">RIYA DUTTA · MARKETING CONSULTANT</p><h1>I study why people <em>choose.</em><br>Let’s test you.</h1>' +
      '<p class="lede">Three quick picks between real posts I made. Choose on instinct, and each pick shows you where it came from.</p>' +
      '<div class="row"><button class="go" id="start" type="button">Start →</button><a class="ghost" href="#work">Just show me the work</a></div>' +
      '<div class="fan" aria-hidden="true"><img src="' + IMG + 'crm-graveyard-ouija-board.jpg" alt=""><img src="' + IMG + 'haunted-crm-teaser.jpg" alt=""><img src="' + IMG + 'founder-bottleneck-sick-day.jpg" alt=""></div>';
    $('#start').onclick = round;
  }
  function round() {
    var x = R[r];
    game.innerHTML = '<div class="dots" aria-hidden="true">' + R.map(function (_, i) { return '<i class="' + (i <= r ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
      '<p class="k b">PICK ' + (r + 1) + ' OF 3</p><h2 style="font-size:clamp(32px,5vw,58px)">' + x.q + '</h2><div class="pair">' +
      ['a', 'b'].map(function (s) { return '<button class="card" type="button" data-s="' + s + '"><b>' + s.toUpperCase() + '</b><img src="' + IMG + x[s].img + '" alt="' + x[s].t + '"></button>'; }).join('') + '</div>';
    $$('.card', game).forEach(function (c) { c.onclick = function () { pick(c); }; });
    $('.card', game).focus({ preventScroll: true });
  }
  function pick(c) {
    var x = R[r], p = P[x.p], mine = x[c.dataset.s], last = r === R.length - 1;
    picks.push(mine.t);
    $$('.card', game).forEach(function (o) { o.disabled = true; o.classList.add(o === c ? 'won' : 'lost'); });
    burst();
    var d = document.createElement('div'); d.className = 'reveal'; d.setAttribute('role', 'status');
    d.innerHTML = '<h3>You picked “' + mine.t + '”.</h3><p>It’s from <b>' + p.t + '</b> (' + p.k + ').</p>' +
      '<div class="row"><button class="ghost" type="button" data-proj>Open the project</button><button class="go" type="button">' + (last ? 'See your result →' : 'Next pick →') + '</button></div>';
    game.appendChild(d);
    $('.go', d).onclick = function () { if (last) end(); else { r++; round(); } };
    $('[data-proj]', d).onclick = function () { openProject(x.p); };
  }
  function end() {
    game.innerHTML = '<p class="k b">THAT’S THREE CHOICES</p><h2>Three picks,<br><em>three campaigns.</em></h2>' +
      '<p class="lede">You chose ' + picks.map(function (t) { return '“' + t + '”'; }).join(', ') + '. That’s the job: working out what makes people pick one thing over another, then making the thing they pick.</p>' +
      '<div class="row"><a class="go" href="#work">See all the work ↓</a><button class="ghost" id="again" type="button">Play again</button></div>';
    $('#again').onclick = intro; burst();
  }
  function burst() {
    if (reduce) return;
    var host = $('#play');
    for (var i = 0; i < 26; i++) {
      var s = document.createElement('i'); s.className = 'confetti';
      s.style.left = Math.random() * 100 + '%'; s.style.background = ['#ecaab2', '#fcf7d9', '#f6e27a', '#f0c5d4'][i % 4]; s.style.animationDelay = Math.random() * .4 + 's';
      host.appendChild(s); setTimeout(s.remove.bind(s), 2200);
    }
  }
  intro();

  /* ---------- 2. kinetic index ---------- */
  var kn = $('#kName'), ws = $('#work'), fl = $('#kFloat'), sh = $('#kSheet');
  kn.innerHTML = kn.textContent.split('').map(function (ch) { return '<span aria-hidden="true">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>'; }).join('') + '<span class="sr-only">Selected work</span>';
  ws.addEventListener('mousemove', function (e) {
    if (reduce) return;
    $$('span[aria-hidden]', kn).forEach(function (s) {
      var b = s.getBoundingClientRect(), dx = b.left + b.width / 2 - e.clientX, dy = b.top + b.height / 2 - e.clientY, d = Math.hypot(dx, dy) || 1;
      if (d < 170) { var f = (170 - d) / 170; s.style.transform = 'translate(' + dx / d * f * 30 + 'px,' + dy / d * f * 30 + 'px) rotate(' + dx / d * f * 10 + 'deg)'; s.style.color = '#ecaab2'; }
      else { s.style.transform = ''; s.style.color = ''; }
    });
    var b = ws.getBoundingClientRect(); fl.style.left = (e.clientX - b.left + 150) + 'px'; fl.style.top = (e.clientY - b.top) + 'px';
  });
  $$('#kList button').forEach(function (b) {
    var i = +b.dataset.i, p = P[i];
    b.onmouseenter = function () { if (p.img && !phone.matches) { fl.src = IMG + p.img; fl.classList.add('on'); } };
    b.onmouseleave = function () { fl.classList.remove('on'); };
    b.onclick = function () { fl.classList.remove('on'); scramble($('strong', b), p.t); setTimeout(function () { openProject(i, true); }, reduce ? 0 : 380); };
  });
  function count(el, to) {
    if (reduce) { el.textContent = to; return; }
    var v = 0, st = Math.max(1, Math.ceil(to / 24)), id = setInterval(function () { v = Math.min(to, v + st); el.textContent = v; if (v >= to) clearInterval(id); }, 30);
  }
  var lastOpener = null;
  function openProject(i, here) {
    var p = P[i]; lastOpener = document.activeElement;
    if (!here) ws.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    sh.innerHTML = '<button class="back" type="button">← Back to the index</button><div class="in">' +
      (p.img ? '<img src="' + IMG + p.img + '" alt="">' : '<div class="ph" style="background:' + p.c + '"></div>') +
      '<div><small class="k">' + p.k.toUpperCase() + '</small><h3>' + p.t + '</h3><p>' + p.d + '</p><div class="nums">' +
      p.n.map(function (x) { return '<div><b data-to="' + x[0] + '">' + x[0] + '</b>' + x[1].toUpperCase() + '</div>'; }).join('') +
      '</div><a class="pill" href="' + CASE + p.s + '/">Read the case study →</a></div></div>';
    sh.classList.add('on'); sh.hidden = false;
    $$('[data-to]', sh).forEach(function (el) { count(el, +el.dataset.to); });
    $('.back', sh).onclick = closeProject; $('.back', sh).focus({ preventScroll: true });
  }
  function closeProject() { sh.classList.remove('on'); if (lastOpener && lastOpener.focus) lastOpener.focus({ preventScroll: true }); }
  function scramble(el, txt) {
    if (reduce) return;
    var g = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#*%', f = 0, id = setInterval(function () {
      el.textContent = txt.split('').map(function (c, i) { return c === ' ' || i < f ? c : g[Math.floor(Math.random() * g.length)]; }).join('');
      f += 2; if (f > txt.length) { clearInterval(id); el.textContent = txt; }
    }, 30);
  }

  /* ---------- 3. the path ---------- */
  var pb = $('#pathBox'), line = $('#pathLine'), L = line.getTotalLength();
  line.style.strokeDasharray = L; line.style.strokeDashoffset = L;
  $$('.stop').forEach(function (b) { b.onclick = function () { b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true'); }; });
  function drawPath() {
    var b = pb.getBoundingClientRect(), prog = Math.min(1, Math.max(0, (innerHeight * .7 - b.top) / b.height));
    line.style.strokeDashoffset = L * (1 - prog); pb.style.setProperty('--prog', prog);
    $$('.stop').forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * .82) s.classList.add('lit'); });
  }
  addEventListener('scroll', drawPath, { passive: true }); addEventListener('resize', drawPath); drawPath();

  /* ---------- 4. bento ---------- */
  $$('#bento .t').forEach(function (t) {
    t.addEventListener('mousemove', function (e) {
      if (reduce || phone.matches || t.classList.contains('on')) return;
      var b = t.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      t.style.transform = 'rotateY(' + x * 8 + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
    t.addEventListener('mouseleave', function () { t.style.transform = ''; });
  });
  $$('#bento .flip').forEach(function (f) { f.onclick = function () { f.style.transform = ''; f.classList.toggle('on'); f.setAttribute('aria-pressed', f.classList.contains('on')); }; });
  var votes = { a: 0, b: 0 };
  $$('.poll button').forEach(function (b) {
    b.onclick = function () {
      votes[b.dataset.v]++; var tot = votes.a + votes.b;
      $$('.poll button').forEach(function (x) { var pc = Math.round(votes[x.dataset.v] / tot * 100); $('i', x).style.width = pc + '%'; $('span', x).textContent = (x.dataset.v === 'a' ? 'Ghosts ' : 'Founders ') + pc + '%'; });
    };
  });

  /* ---------- 5. the desktop ---------- */
  var desk = $('#contact'), z = 10, n = 0, open = {};
  function win(id, title, html, x, y, w) {
    if (open[id] && open[id].isConnected) { open[id].style.zIndex = ++z; if (phone.matches) open[id].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return open[id]; }
    var el = document.createElement('div'); el.className = 'win'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', title);
    el.style.left = x + 'px'; el.style.top = y + 'px'; if (w) el.style.width = w + 'px'; el.style.zIndex = ++z;
    el.innerHTML = '<div class="win-t">' + title + '<button type="button" aria-label="Close ' + title + '">×</button></div><div class="win-b">' + html + '</div>';
    desk.appendChild(el);
    open[id] = el;
    el.addEventListener('pointerdown', function () { el.style.zIndex = ++z; });
    $('.win-t button', el).onclick = function () { el.remove(); };
    var bar = $('.win-t', el), sx, sy, ox, oy;
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.tagName === 'BUTTON' || phone.matches) return;
      sx = e.clientX; sy = e.clientY; ox = el.offsetLeft; oy = el.offsetTop; bar.setPointerCapture(e.pointerId);
      bar.onpointermove = function (m) { el.style.left = Math.max(0, ox + m.clientX - sx) + 'px'; el.style.top = Math.max(0, oy + m.clientY - sy) + 'px'; };
    });
    bar.addEventListener('pointerup', function () { bar.onpointermove = null; });
    return el;
  }
  function off() { return (n++ % 4) * 24; }
  var APPS = {
    mail: function () {
      var w = win('mail', 'New message — to Riya Dutta', '<form class="mail" novalidate><p class="hi">Hello Riya,</p><label for="m1">Message</label><textarea id="m1"></textarea>' +
        '<label for="m2">Your name</label><input id="m2" autocomplete="name"><label for="m3">Your email</label><input id="m3" type="email" autocomplete="email">' +
        '<p class="err" role="alert"></p><button class="pill" type="submit">Send from my mail app →</button></form>', 170 + off(), 40 + off(), 420);
      var f = $('form', w); if (!f || f.dataset.ok) return; f.dataset.ok = 1;
      f.onsubmit = function (e) {
        e.preventDefault();
        var m = $('#m1', f).value.trim(), em = $('#m3', f).value.trim(), nm = $('#m2', f).value.trim(), er = $('.err', f);
        if (!m) { er.textContent = 'Write a line or two first.'; $('#m1', f).focus(); return; }
        if (em && !/^\S+@\S+\.\S+$/.test(em)) { er.textContent = 'That email looks unfinished.'; $('#m3', f).focus(); return; }
        er.textContent = '';
        location.href = 'mailto:riyavdutta@gmail.com?subject=' + encodeURIComponent('Hello' + (nm ? ' from ' + nm : '')) + '&body=' + encodeURIComponent(m + (nm || em ? '\n\n— ' + [nm, em].filter(Boolean).join(', ') : ''));
      };
      $$('input,textarea', f).forEach(function (i) { i.addEventListener('input', function () { $('.err', f).textContent = ''; }); });
    },
    heat: function () {
      var w = win('heat', 'Where you looked', '<div class="heat"><canvas></canvas><p></p></div>', 620 + off(), 40 + off(), 360);
      drawHeat(w); clearInterval(w._t); w._t = setInterval(function () { if (!w.isConnected) return clearInterval(w._t); drawHeat(w); }, 1500);
    },
    studio: function () {
      var st = ['Brief', 'Plan', 'Copy', 'Check', 'Approve', 'Build', 'Render', 'Check', 'Deliver', 'Watch', 'Post'];
      var w = win('studio', 'Content Studio', '<p style="margin-bottom:12px">The route every post takes, from brief to posted piece.</p><div class="route">' +
        st.map(function (s, i) { return '<span>' + String(i + 1).padStart(2, '0') + '<br>' + s + '</span>'; }).join('') +
        '</div><p style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap"><button class="pill" type="button" data-run>Run a brief through it ▶</button><a class="pill pill--line" href="' + CASE + 'the-content-studio/">Case study</a></p>', 300 + off(), 110 + off(), 440);
      $('[data-run]', w).onclick = function () { var sp = $$('.route span', w); sp.forEach(function (s) { s.classList.remove('lit'); }); sp.forEach(function (s, i) { setTimeout(function () { s.classList.add('lit'); }, reduce ? 0 : i * 180); }); };
    },
    kit: function () { win('kit', 'Kit', '<div class="chips light" style="margin:0">' + ['HubSpot', 'LinkedIn', 'WordPress', 'Figma', 'Tobii · GSR', 'SPSS · JMP · R'].map(function (k) { return '<span>' + k + '</span>'; }).join('') + '</div><p style="margin-top:12px">Strategy on Monday, Figma on Tuesday, SPSS by Friday.</p>', 460 + off(), 220 + off(), 330); },
    links: function () { win('links', 'Links', '<p><a href="mailto:riyavdutta@gmail.com">riyavdutta@gmail.com</a></p><p style="margin-top:8px"><a href="https://www.linkedin.com/in/riyaa-duttaa" rel="me">LinkedIn ↗</a></p>', 520 + off(), 300 + off(), 260); }
  };
  $$('[data-open]').forEach(function (b) {
    b.onclick = function () { var id = b.dataset.open; APPS[id](); if (phone.matches && open[id]) open[id].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); };
  });
  var deskOpened = false;
  new IntersectionObserver(function (es) {
    if (es[0].isIntersecting && !deskOpened) { deskOpened = true; APPS.mail(); setTimeout(APPS.heat, reduce ? 0 : 500); }
  }, { threshold: .35 }).observe(desk);
  $('#logo').onclick = function () { desk.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };

  /* the heatmap: where this visitor's attention went on this page (cursor, plus where they paused while scrolling on phones) */
  var pts = [], secT = {}, lastY = innerHeight / 2, lastX = innerWidth / 2;
  addEventListener('pointermove', function (e) { if (pts.length < 6000) pts.push([e.pageX, e.pageY]); lastY = e.clientY; lastX = e.clientX; }, { passive: true });
  var secs = ['play', 'work', 'path', 'about', 'contact'], names = { play: 'the game', work: 'the Work index', path: 'the path', about: 'About', contact: 'this desktop' };
  setInterval(function () {
    if (document.hidden) return;
    var y = scrollY + (phone.matches ? innerHeight / 2 : lastY);
    if (phone.matches && pts.length < 6000) pts.push([innerWidth / 2, y]);
    for (var i = 0; i < secs.length; i++) { var el = document.getElementById(secs[i]); if (y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) { secT[secs[i]] = (secT[secs[i]] || 0) + 1; break; } }
  }, 250);
  function drawHeat(w) {
    var c = $('canvas', w); if (!c) return;
    var docW = document.documentElement.scrollWidth, docH = document.documentElement.scrollHeight, W = 320, sc = W / docW;
    c.width = W; c.height = Math.min(300, Math.round(docH * sc));
    var sy = c.height / docH, x = c.getContext('2d'), col = { play: '#65232b', work: '#140b0a', path: '#fcf7d9', about: '#140b0a', contact: '#ecaab2' };
    secs.forEach(function (id) {
      var el = document.getElementById(id); x.fillStyle = col[id]; x.fillRect(0, el.offsetTop * sy, W, el.offsetHeight * sy);
      x.fillStyle = id === 'path' || id === 'contact' ? '#432720' : '#b9a69c'; x.font = '10px Space Mono'; x.fillText(names[id].toUpperCase(), 6, el.offsetTop * sy + 14);
    });
    x.globalCompositeOperation = 'lighter';
    pts.forEach(function (p) { var g = x.createRadialGradient(p[0] * sc, p[1] * sy, 0, p[0] * sc, p[1] * sy, 10); g.addColorStop(0, 'rgba(255,120,60,.18)'); g.addColorStop(1, 'rgba(255,120,60,0)'); x.fillStyle = g; x.fillRect(p[0] * sc - 10, p[1] * sy - 10, 20, 20); });
    x.globalCompositeOperation = 'source-over';
    var top = Object.keys(secT).sort(function (a, b) { return secT[b] - secT[a]; })[0];
    $('p', w).innerHTML = pts.length < 20 ? (phone.matches ? 'Scroll around the page. This map fills in as you go.' : 'Move your cursor around the page. This map fills in as you go.') :
      'You lingered longest on <b>' + (top ? names[top] : 'the game') + '</b>. Watching where attention goes is what I do for brands: it’s the eye-tracking work, in miniature. Nothing here leaves your browser.';
  }

  /* ---------- ⌘K jump bar ---------- */
  var cmd = $('#cmd'), ci = $('#cmdIn'), cl = $('#cmdList'), sel = 0, cmdOpener = null;
  var items = [['The game', 'Home', '#play'], ['Selected work', 'Section', '#work'], ['The path', 'Section', '#path'], ['About', 'Section', '#about'], ['Say hello', 'Desktop', '#contact'], ['All work', 'Page', 'work/']]
    .map(function (a) { return { t: a[0], k: a[1], go: function () { if (a[2].charAt(0) === '#') $(a[2]).scrollIntoView(); else location.href = a[2]; } }; })
    .concat(P.map(function (p, i) { return { t: p.t, k: 'Project', go: function () { openProject(i); } }; }));
  function list() {
    var q = ci.value.toLowerCase(), f = items.filter(function (i) { return i.t.toLowerCase().indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(0, f.length - 1));
    cl.innerHTML = f.map(function (i, k) { return '<li><button type="button" class="' + (k === sel ? 'sel' : '') + '" data-k="' + items.indexOf(i) + '">' + i.t + '<small>' + i.k + '</small></button></li>'; }).join('');
    $$('button', cl).forEach(function (b) { b.onclick = function () { run(+b.dataset.k); }; });
    return f;
  }
  function closeCmd() { cmd.classList.remove('on'); if (cmdOpener && cmdOpener.focus) cmdOpener.focus({ preventScroll: true }); }
  function run(k) { cmd.classList.remove('on'); items[k].go(); }
  function openCmd() { cmdOpener = document.activeElement; cmd.classList.add('on'); ci.value = ''; sel = 0; list(); ci.focus(); }
  $('#cmdBtn').onclick = openCmd;
  addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (cmd.classList.contains('on')) closeCmd(); else openCmd(); }
    else if (e.key === 'Escape') { if (cmd.classList.contains('on')) closeCmd(); else if (sh.classList.contains('on')) closeProject(); }
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
