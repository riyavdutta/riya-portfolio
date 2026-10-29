/*
 * Sticker sheet: peel a sticker off the sheet and stick it anywhere on the page.
 * Placed stickers are remembered per page in this browser only (localStorage).
 * Tap or press Enter on a placed sticker to peel it back off.
 */
(function () {
  'use strict';

  var INK = '#432720', CHERRY = '#65232b', VANILLA = '#fcf7d9', BLOSSOM = '#ecaab2', PINK = '#f0c5d4',
      SAGE = '#b7c9a8', SAGE_DEEP = '#8da37c', SLATE = '#9db2c0', SLATE_DEEP = '#56707f', IVORY = '#f8e5d7';
  var MONO = "'Space Mono', monospace", SERIF = "'Playfair Display', Georgia, serif";

  function perf(w, h, r, gap) {
    var c = '';
    for (var x = gap / 2; x < w; x += gap) c += '<circle cx="' + x + '" cy="0" r="' + r + '"/><circle cx="' + x + '" cy="' + h + '" r="' + r + '"/>';
    for (var y = gap / 2; y < h; y += gap) c += '<circle cx="0" cy="' + y + '" r="' + r + '"/><circle cx="' + w + '" cy="' + y + '" r="' + r + '"/>';
    return c;
  }

  var STICKERS = [
    { id: 'stamp', label: 'RD stamp', w: 92, svg:
      '<svg viewBox="0 0 92 112"><defs><mask id="sk-perf"><rect width="92" height="112" fill="#fff"/><g fill="#000">' + perf(92, 112, 4, 11.5) + '</g></mask></defs>' +
      '<rect width="92" height="112" fill="' + VANILLA + '" mask="url(#sk-perf)"/><rect x="9" y="9" width="74" height="94" fill="' + CHERRY + '"/>' +
      '<text x="46" y="64" text-anchor="middle" font-family="' + SERIF + '" font-style="italic" font-size="34" fill="' + VANILLA + '">RD</text>' +
      '<text x="46" y="90" text-anchor="middle" font-family="' + MONO + '" font-size="7.5" letter-spacing="1.5" fill="' + PINK + '">FIRST CLASS</text></svg>' },
    { id: 'airmail', label: 'Par avion label', w: 132, svg:
      '<svg viewBox="0 0 132 58"><defs><pattern id="sk-air" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="' + CHERRY + '"/><rect x="8" width="8" height="16" fill="' + SLATE_DEEP + '"/></pattern></defs>' +
      '<rect width="132" height="58" rx="4" fill="url(#sk-air)"/><rect x="7" y="7" width="118" height="44" rx="2" fill="' + VANILLA + '"/>' +
      '<text x="66" y="29" text-anchor="middle" font-family="' + MONO + '" font-weight="700" font-size="13" letter-spacing="2" fill="' + SLATE_DEEP + '">PAR AVION</text>' +
      '<text x="66" y="43" text-anchor="middle" font-family="' + SERIF + '" font-style="italic" font-size="11" fill="' + CHERRY + '">by air mail</text></svg>' },
    { id: 'yes', label: 'Say yes speech bubble', w: 108, svg:
      '<svg viewBox="0 0 108 86"><path d="M12 6h84a10 10 0 0 1 10 10v38a10 10 0 0 1-10 10H46l-18 16 3-16H12A10 10 0 0 1 2 54V16A10 10 0 0 1 12 6z" fill="' + BLOSSOM + '"/>' +
      '<text x="54" y="44" text-anchor="middle" font-family="' + SERIF + '" font-style="italic" font-size="24" fill="' + CHERRY + '">say yes!</text></svg>' },
    { id: 'smile', label: 'Smiling face', w: 86, svg:
      '<svg viewBox="0 0 86 86"><circle cx="43" cy="43" r="41" fill="' + VANILLA + '" stroke="' + CHERRY + '" stroke-width="3"/>' +
      '<text x="43" y="52" text-anchor="middle" font-family="' + MONO + '" font-weight="700" font-size="25" fill="' + CHERRY + '">^_^</text></svg>' },
    { id: 'postmark', label: 'Himachal Pradesh postmark', w: 104, svg:
      '<svg viewBox="0 0 104 104"><defs><path id="sk-ring" d="M52,52 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0"/></defs><circle cx="52" cy="52" r="50" fill="' + IVORY + '"/>' +
      '<circle cx="52" cy="52" r="45" fill="none" stroke="' + CHERRY + '" stroke-width="2.5"/><circle cx="52" cy="52" r="24" fill="none" stroke="' + CHERRY + '" stroke-width="1.5"/>' +
      '<text font-family="' + MONO + '" font-size="8.6" letter-spacing="1.4" fill="' + CHERRY + '"><textPath href="#sk-ring">HIMACHAL PRADESH · INDIA · </textPath></text>' +
      '<text x="52" y="57" text-anchor="middle" font-family="' + SERIF + '" font-style="italic" font-size="15" fill="' + CHERRY + '">2026</text></svg>' },
    { id: 'cherry', label: 'Cherries', w: 86, svg:
      '<svg viewBox="0 0 86 96"><path d="M44 10c-4 20-14 34-22 44M44 10c2 18 10 32 22 42" fill="none" stroke="' + SAGE_DEEP + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M44 10c10-8 24-8 32 0-10 8-22 8-32 0z" fill="' + SAGE + '"/><circle cx="22" cy="68" r="19" fill="' + CHERRY + '"/><circle cx="64" cy="66" r="19" fill="#8e3b4a"/>' +
      '<circle cx="15" cy="61" r="5" fill="' + PINK + '" opacity=".7"/><circle cx="57" cy="59" r="5" fill="' + PINK + '" opacity=".7"/></svg>' },
    { id: 'record', label: 'Vinyl record', w: 98, svg:
      '<svg viewBox="0 0 98 98"><circle cx="49" cy="49" r="47" fill="#2b1711"/><circle cx="49" cy="49" r="38" fill="none" stroke="#4a332b" stroke-width="1"/><circle cx="49" cy="49" r="31" fill="none" stroke="#4a332b" stroke-width="1"/>' +
      '<circle cx="49" cy="49" r="17" fill="' + SAGE + '"/><circle cx="49" cy="49" r="2.6" fill="#2b1711"/><path d="M20 30a36 36 0 0 1 22-16" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<text x="49" y="45" text-anchor="middle" font-family="' + MONO + '" font-size="6" letter-spacing="1" fill="' + INK + '">SIDE A</text></svg>' },
    { id: 'fragile', label: 'Handle with care label', w: 128, svg:
      '<svg viewBox="0 0 128 54"><rect width="128" height="54" rx="3" fill="' + CHERRY + '"/><rect x="5" y="5" width="118" height="44" rx="2" fill="none" stroke="' + VANILLA + '" stroke-width="1.2" stroke-dasharray="3 3"/>' +
      '<path d="M22 15h12l-1 10a5 5 0 0 1-10 0z M28 30v9 M23 39h10" fill="none" stroke="' + VANILLA + '" stroke-width="2" stroke-linecap="round"/>' +
      '<text x="80" y="25" text-anchor="middle" font-family="' + MONO + '" font-weight="700" font-size="10" letter-spacing="1.4" fill="' + VANILLA + '">HANDLE</text>' +
      '<text x="80" y="39" text-anchor="middle" font-family="' + MONO + '" font-weight="700" font-size="10" letter-spacing="1.4" fill="' + VANILLA + '">WITH CARE</text></svg>' },
    { id: 'ghost', label: 'Little ghost', w: 80, svg:
      '<svg viewBox="0 0 80 96"><path d="M40 4C20 4 8 20 8 40v48l10-8 11 8 11-8 11 8 11-8 10 8V40C72 20 60 4 40 4z" fill="#fffdf5" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="29" cy="40" r="5" fill="' + INK + '"/><circle cx="51" cy="40" r="5" fill="' + INK + '"/><ellipse cx="40" cy="56" rx="6" ry="7" fill="' + INK + '"/>' +
      '<circle cx="22" cy="50" r="4" fill="' + BLOSSOM + '" opacity=".8"/><circle cx="58" cy="50" r="4" fill="' + BLOSSOM + '" opacity=".8"/></svg>' },
    { id: 'envelope', label: 'Envelope with a heart seal', w: 112, svg:
      '<svg viewBox="0 0 112 78"><rect x="2" y="2" width="108" height="74" rx="4" fill="' + VANILLA + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M4 6l52 38 52-38" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M56 54c-7-6-13-10-13-16a6.5 6.5 0 0 1 13-2 6.5 6.5 0 0 1 13 2c0 6-6 10-13 16z" fill="' + CHERRY + '"/></svg>' },
    { id: 'mountain', label: 'Mountains badge', w: 100, svg:
      '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="' + SLATE + '"/><clipPath id="sk-mt"><circle cx="50" cy="50" r="48"/></clipPath>' +
      '<g clip-path="url(#sk-mt)"><circle cx="70" cy="30" r="9" fill="' + VANILLA + '"/><path d="M-4 82L30 38l16 20 14-16 44 40z" fill="' + SLATE_DEEP + '"/><path d="M30 38l7 9-7 4-7-4z M60 42l6 7-6 3-5-3z" fill="' + VANILLA + '"/>' +
      '<path d="M-4 100V76l26-10 30 8 24-6 28 8v24z" fill="' + SAGE_DEEP + '"/></g></svg>' },
    { id: 'firstclass', label: 'Hello ribbon', w: 112, svg:
      '<svg viewBox="0 0 112 64"><path d="M0 14h18v40H0l8-20z M112 14H94v40h18l-8-20z" fill="#8e3b4a"/><rect x="12" y="6" width="88" height="40" rx="3" fill="' + BLOSSOM + '"/>' +
      '<text x="56" y="33" text-anchor="middle" font-family="' + SERIF + '" font-style="italic" font-size="20" fill="' + CHERRY + '">hello!</text></svg>' }
  ];

  var KEY = 'rd-stickers:' + location.pathname;
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var byId = {}; STICKERS.forEach(function (s) { byId[s.id] = s; });

  var placed = load().filter(function (p) { return byId[p.id]; });
  var layer, sheet, launcher, slots = {}, countEl;

  function docH() { return Math.max(document.documentElement.scrollHeight, document.body.scrollHeight); }

  function art(s, cls) {
    var el = document.createElement('span');
    el.className = 'sk-art ' + (cls || '');
    el.style.width = s.w + 'px';
    el.innerHTML = s.svg;
    return el;
  }

  function persist() {
    save(placed.map(function (p) { return { id: p.id, x: p.x, y: p.y, r: p.r }; }));
    refreshSheet();
  }

  function refreshSheet() {
    STICKERS.forEach(function (s) {
      var used = placed.some(function (p) { return p.id === s.id; });
      slots[s.id].classList.toggle('is-used', used);
      slots[s.id].setAttribute('aria-label', s.label + (used ? ', on the page. Peel it off the page to put it back.' : ', drag onto the page or press Enter'));
      slots[s.id].disabled = used;
    });
    if (countEl) countEl.textContent = placed.length + ' of ' + STICKERS.length + ' stuck';
  }

  function position(p) {
    p.el.style.left = (p.x * 100) + '%';
    p.el.style.top = (p.y * docH()) + 'px';
    p.el.style.setProperty('--r', p.r + 'deg');
  }

  function makePlaced(p, slap) {
    var s = byId[p.id];
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'sk-placed' + (slap && !reduce ? ' sk-slap' : '');
    el.setAttribute('aria-label', s.label + ' sticker. Press Enter to peel it off.');
    el.appendChild(art(s));
    p.el = el;
    layer.appendChild(el);
    position(p);
    dragify(el, function () { return { kind: 'placed', p: p }; });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); peel(p); } });
  }

  function peel(p) {
    var el = p.el;
    placed = placed.filter(function (q) { return q !== p; });
    persist();
    if (reduce) { el.remove(); return; }
    el.classList.add('sk-peel');
    setTimeout(function () { el.remove(); }, 380);
  }

  function place(id, clientX, clientY, slap) {
    var rect = layer.getBoundingClientRect();
    var p = { id: id, x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / docH(), r: Math.round((Math.random() * 24 - 12)) };
    placed.push(p);
    makePlaced(p, slap);
    persist();
  }

  // drag from the sheet or move a placed sticker; a click without movement peels a placed one
  function dragify(el, info) {
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || el.disabled) return;
      var src = info(); var s = byId[src.kind === 'sheet' ? src.id : src.p.id];
      var sx = e.clientX, sy = e.clientY, moved = false, ghost = null, box = el.getBoundingClientRect();
      var ox = sx - (box.left + box.width / 2), oy = sy - (box.top + box.height / 2);
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
      function move(ev) {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 5) return;
        if (!moved) {
          moved = true;
          ghost = art(s, 'sk-ghost');
          document.body.appendChild(ghost);
          if (src.kind === 'placed') el.style.visibility = 'hidden';
          document.documentElement.classList.add('sk-dragging');
        }
        ghost.style.left = (ev.clientX - ox) + 'px';
        ghost.style.top = (ev.clientY - oy) + 'px';
      }
      function up(ev) {
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        document.documentElement.classList.remove('sk-dragging');
        if (!moved) { if (src.kind === 'placed') peel(src.p); return; }
        ghost.remove();
        var cx = ev.clientX - ox, cy = ev.clientY - oy;
        var r = sheet.getBoundingClientRect();
        var overSheet = sheet.classList.contains('is-open') && cx > r.left && cx < r.right && cy > r.top && cy < r.bottom;
        if (src.kind === 'sheet') { if (!overSheet) place(s.id, cx, cy, true); }
        else if (overSheet) { peel(src.p); }
        else {
          var lr = layer.getBoundingClientRect();
          src.p.x = (cx - lr.left) / lr.width; src.p.y = (cy - lr.top) / docH();
          el.style.visibility = ''; position(src.p); persist();
        }
      }
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }

  function openSheet(open) {
    sheet.classList.toggle('is-open', open);
    sheet.setAttribute('aria-hidden', open ? 'false' : 'true');
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var first = sheet.querySelector('.sk-slot:not([disabled])') || sheet.querySelector('.sk-close'); if (first) first.focus(); }
    else launcher.focus();
  }

  function build() {
    // the home page's stamp book runs along the bottom on phones; sit above it
    if (document.querySelector('aside[aria-label="Stamp book"]')) document.documentElement.classList.add('sk-dock');
    layer = document.createElement('div');
    layer.className = 'sk-layer';
    document.body.appendChild(layer);

    launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'sk-launcher';
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-controls', 'sk-sheet');
    launcher.innerHTML = '<span class="sk-launcher__peel" aria-hidden="true"></span><span>Sticker sheet</span>';
    document.body.appendChild(launcher);

    sheet = document.createElement('section');
    sheet.id = 'sk-sheet';
    sheet.className = 'sk-sheet';
    sheet.setAttribute('aria-label', 'Sticker sheet');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.innerHTML = '<div class="sk-head"><div><p class="sk-kicker">STICKER SHEET · No. 01</p><p class="sk-title">Peel one off, stick it anywhere.</p></div>' +
      '<button type="button" class="sk-close" aria-label="Close the sticker sheet">✕</button></div><div class="sk-grid"></div>' +
      '<div class="sk-foot"><span class="sk-count"></span><button type="button" class="sk-clear">Peel them all off</button></div>' +
      '<p class="sk-note">Tap a sticker on the page to peel it off. They stay here, in your browser only.</p>';
    document.body.appendChild(sheet);
    var grid = sheet.querySelector('.sk-grid');
    countEl = sheet.querySelector('.sk-count');
    STICKERS.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sk-slot';
      b.style.setProperty('--r', ((i % 3) - 1) * 4 + 'deg');
      b.appendChild(art(s));
      slots[s.id] = b;
      grid.appendChild(b);
      dragify(b, function () { return { kind: 'sheet', id: s.id }; });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (b.disabled) return;
        place(s.id, window.innerWidth * (0.3 + Math.random() * 0.4), window.innerHeight * (0.3 + Math.random() * 0.3), true);
      });
    });
    launcher.addEventListener('click', function () { openSheet(!sheet.classList.contains('is-open')); });
    sheet.querySelector('.sk-close').addEventListener('click', function () { openSheet(false); });
    sheet.querySelector('.sk-clear').addEventListener('click', function () { placed.slice().forEach(peel); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet.classList.contains('is-open')) openSheet(false); });

    placed.forEach(function (p) { makePlaced(p, false); });
    refreshSheet();
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { placed.forEach(position); }, 120); });
    // the page can grow after fonts and images load
    setTimeout(function () { placed.forEach(position); }, 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
