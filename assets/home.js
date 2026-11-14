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
    { t: 'The Content Studio', k: 'System · 2026', s: 'the-content-studio', img: 'content-studio-route.svg', c: '#07081a', n: [['11', 'stops'], ['1', 'brief in'], ['1', 'post out']], d: 'The production system behind every campaign here: a brief goes in, and a checked, captioned post comes out. Videos, carousels and soundtracks are built in code.' },
    { t: 'The B2Ne website', k: 'Website · 2026', s: 'the-b2ne-website', img: 'b2ne-how-we-help.jpg', c: '#dfe9ff', n: [['5', 'pages I made']], d: 'Co-built with B2Ne’s founder. I made the About, How We Help, Services, Pricing and Nexus Academy pages.' },
    { t: 'CRM Graveyard', k: 'LinkedIn series · 2026', s: 'crm-graveyard', img: 'crm-graveyard-close-date.jpg', c: '#0a1466', n: [['14', 'posts'], ['2', 'videos']], d: 'Fourteen posts and two short videos. One B2Ne look, a different visual idea for every post, tracked in a ledger so nothing repeats.' }
  ];

  /* ---------- clock (menu bar and bento) ---------- */
  function timeIn() { return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }); }
  function clock() { $('#barClock').textContent = 'Himachal ' + timeIn(); $('#bClock').textContent = timeIn(); }
  clock(); setInterval(clock, 15000);

  /* ---------- 1. the choice ---------- */
  /* The game is dealt as playing cards. Three rounds, three ways to pick:
   *   1 flash: two cards dealt face-down, flipped up for ~1.2s, then "which line do you remember?"
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
    return dots() + '<p class="k b">ROUND ' + (r + 1) + ' OF 3<span class="mode">' + { flash: 'FLASH TEST', pull: 'PULL', weigh: 'WEIGH IT' }[x.mode] + '</span></p>' +
      '<h2 class="round-h">' + (x.mode === 'flash' ? 'Watch closely. You get about a second.' : x.q) + '</h2>';
  }
  function later(fn, ms) { return setTimeout(fn, reduce ? 0 : ms); }
  // keep the game on screen: jump back to its top for each round, and show new blocks as they appear
  function toTop() { var p = $('#play'); if (Math.abs(p.getBoundingClientRect().top) > 4) p.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function show_(el) { if (el) setTimeout(function () { el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }, 60); }

  function intro() {
    r = 0; picks = [];
    game.innerHTML = '<div class="intro"><div><p class="k b type" id="typeK"></p><h1 class="split">' + words('I study why people', '') + ' ' + words('choose.', 'em') + '<br>' + words('Let’s test you.', '', 5) + '</h1>' +
      '<p class="lede fade">Three rounds with real posts I made. Remember, pull, weigh. At the end I’ll tell you what persuades you, and how I’d write a campaign for you.</p>' +
      '<div class="row fade"><button class="go mag" id="start" type="button">Deal me in →</button><a class="ghost" href="#work">Just show me the work</a></div></div>' +
      '<div class="deck" id="deck" role="button" tabindex="0" aria-label="Shuffle and deal">' + backCard() + backCard() + backCard() + backCard() + '<p class="hint">click the deck to shuffle and deal</p></div></div>';
    var go = function () { var d = $('#deck'); if (!d || d.classList.contains('shuffle')) return; d.classList.add('shuffle'); later(round, 900); };
    $('#start').onclick = go; $('#deck').onclick = go;
    $('#deck').onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
    typeOut($('#typeK'), 'RIYA DUTTA · MARKETING CONSULTANT');
    magnet($('#start'));
  }
  function round() { tries = 0; var x = R[r]; ({ flash: flash, pull: pull, weigh: weigh })[x.mode](x); toTop(); }

  // 1 flash
  function flash(x) {
    game.innerHTML = head(x) + '<div class="table" id="table">' + card('a', x.a, 'down dealt', 0) + card('b', x.b, 'down dealt', 1) + '</div><div id="below"></div>';
    var t = $('#table'), n = 3;
    later(function tick() {
      if (n > 0) { t.insertAdjacentHTML('beforeend', '<span class="count" aria-hidden="true">' + n + '</span>'); var c = $('.count', t); setTimeout(function () { c.remove(); }, 550); n--; later(tick, 600); return; }
      show(t, x);
    }, 900);
  }
  function show(t, x) {
    $$('.pcard', t).forEach(function (c) { c.classList.remove('down'); });
    later(function () { $$('.pcard', t).forEach(function (c) { c.classList.add('down'); }); later(function () { ask(x); }, 500); }, reduce ? 3000 : 1200);
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
      if ($('#again1')) $('#again1').onclick = function () { $('#below').innerHTML = ''; toTop(); show($('#table'), x); };
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
      $('.half.a .pcard', st).style.setProperty('--w', v); $('.half.b .pcard', st).style.setProperty('--w', 100 - v);
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
    var mine = x[s], last = r === R.length - 1, p = P[x.p];
    picks[r] = { pick: mine, s: s, proj: x.p, how: how };
    $$('#game .pcard').forEach(function (c) { c.classList.remove('down'); if (c.dataset.s === s) c.classList.add('chosen'); else if (how === 'stuck') c.classList.add('out'); });
    burst();
    $('#below').innerHTML = '<div class="reveal" role="status"><h3>' + { stuck: '“' + mine.t + '” stuck.', pull: 'You pulled for “' + mine.t + '”.', weigh: 'The scale tipped for “' + mine.t + '”.' }[how] + '</h3>' +
      '<p>' + mine.why + ' From <b>' + p.t + '</b>.</p><div class="row"><button class="ghost" type="button" data-proj>Open the project</button><button class="go" type="button" id="next">' + (last ? 'See your hand →' : 'Next round →') + '</button></div></div>';
    $('#next').onclick = next; $('[data-proj]', $('#below')).onclick = function () { openProject(x.p); };
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
      '<p class="k b">YOUR HAND</p><h2>' + sentence + '</h2>' +
      '<div class="reads">' + rows.map(function (w, i) { return '<div class="read"><i>0' + (i + 1) + '</i><small>' + w.rd.label + ' · ' + w.rd.mode + '</small><b>' + w.o.name + '</b><span>' + w.ev + '</span></div>'; }).join('') + '</div>' +
      '<div class="plan"><p class="k">HOW I’D WRITE A CAMPAIGN FOR YOU</p><dl>' + rows.map(function (w) { return '<dt>' + w.rd.step + '</dt><dd>' + w.o.plan + '<button type="button" data-proj="' + w.k.proj + '">See it in ' + P[w.k.proj].t + ' →</button></dd>'; }).join('') + '</dl></div>' +
      '<div class="row"><button class="go" id="hello" type="button">Send me your hand →</button><button class="ghost" id="again" type="button">Deal again</button><a class="ghost" href="#work">See all the work ↓</a></div>' +
      '<div id="slot"></div></div></div>';
    $('#again').onclick = function () { intro(); toTop(); };
    $$('[data-proj]', game).forEach(function (b) { b.onclick = function () { openProject(+b.dataset.proj); }; });
    $('#hello').onclick = function () { compose(rows); };
    toTop();
    burst();
  }

  // the editable card: pre-written from your hand, but every part can be changed before it goes
  function compose(rows) {
    var slot = $('#slot');
    if ($('form', slot)) { $('textarea', slot).focus(); return; }
    slot.innerHTML = '<form class="compose" novalidate><button class="x" type="button" aria-label="Close the card">×</button><span class="ix" aria-hidden="true">R ♥</span><h3>Your card to Riya</h3>' +
      '<span class="lab" id="hc-l">INCLUDE FROM YOUR HAND (tap to leave one out)</span><div class="chipset" id="hc" role="group" aria-labelledby="hc-l">' +
      rows.map(function (w, i) { return '<button type="button" class="chip hand-chip" aria-pressed="true" data-i="' + i + '">' + w.o.name + '</button>'; }).join('') + '</div>' +
      '<span class="lab" id="tc-l">WHAT DO YOU WANT TO TALK ABOUT?</span><div class="chipset" id="tc" role="group" aria-labelledby="tc-l">' +
      TOPICS.map(function (t) { return '<button type="button" class="chip" aria-pressed="false">' + t + '</button>'; }).join('') + '</div>' +
      '<label class="lab" for="hand-msg">YOUR MESSAGE (write anything, it’s yours to edit)</label><textarea id="hand-msg"></textarea>' +
      '<div class="two"><div><label class="lab" for="hand-nm">YOUR NAME</label><input id="hand-nm" autocomplete="name"></div><div><label class="lab" for="hand-em">YOUR EMAIL</label><input id="hand-em" type="email" autocomplete="email"></div></div>' +
      '<p class="err" role="alert"></p><div class="acts"><button class="send" type="submit">Send from my mail app →</button><button class="reset" type="button" id="blank">Start from a blank card</button></div></form>';
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
      s.style.left = Math.random() * 100 + '%'; s.style.background = ['#ecaab2', '#fcf7d9', '#f6e27a', '#f0c5d4'][i % 4]; s.style.animationDelay = Math.random() * .4 + 's';
      host.appendChild(s); setTimeout(s.remove.bind(s), 2200);
    }
  }
  // ---- small motion helpers for the opening ----
  function words(text, wrap, start) {
    return text.split(' ').map(function (w, k) {
      var inner = wrap ? '<' + wrap + '>' + w + '</' + wrap + '>' : w;
      return '<span class="w"><span style="--i:' + ((start || (wrap ? 4 : 0)) + k) + '">' + inner + '</span></span>';
    }).join(' ');
  }
  function typeOut(el, text) {
    if (!el) return; if (reduce) { el.textContent = text; return; }
    var k = 0, id = setInterval(function () { el.textContent = text.slice(0, ++k); if (k >= text.length) clearInterval(id); }, 28);
  }
  var magEl = null;
  function magnet(el) { magEl = el; }
  if (!reduce) $('#play').addEventListener('mousemove', function (e) {
    var el = magEl; if (!el || !el.isConnected || phone.matches) return;
    var b = el.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2), d = Math.hypot(dx, dy);
    el.style.transform = d < 160 ? 'translate(' + dx * .22 + 'px,' + dy * .22 + 'px) rotate(' + dx * .02 + 'deg)' : '';
  });
  // the spotlight and the drifting A/B follow the cursor
  (function () {
    var play = $('#play'), bg = $('.ab-bg');
    if (!play || reduce) return;
    play.addEventListener('mousemove', function (e) {
      var b = play.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      play.style.setProperty('--mx', x * 100 + '%'); play.style.setProperty('--my', y * 100 + '%');
      if (bg) { bg.style.setProperty('--px', (x - .5) * -40 + 'px'); bg.style.setProperty('--py', (y - .5) * -30 + 'px'); }
    });
  })();
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


  /* ---------- scroll reveals ---------- */
  (function () {
    if (reduce || !('IntersectionObserver' in window)) return;
    var groups = [['#path h2, #about h2, #path .k, #about .k', 0], ['#kList li', .07], ['#bento .t', .06], ['#contact .ico', .06]];
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    groups.forEach(function (g) { $$(g[0]).forEach(function (el, i) { el.setAttribute('data-rv', ''); el.style.setProperty('--d', (g[1] * i) + 's'); io.observe(el); }); });
  })();
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
