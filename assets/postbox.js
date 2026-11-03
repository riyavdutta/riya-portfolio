/*
 * The contact postcard: write a note, choose a stamp from the sticker sheet,
 * and post it. The card drops into a letterbox, then the visitor's mail app
 * opens with the note ready to send. Nothing is sent from the site itself.
 */
(function () {
  'use strict';
  var TO = 'riyavdutta@gmail.com';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAMP_IDS = ['stamp', 'cherry', 'mountain', 'smile', 'envelope', 'yes', 'ghost', 'record'];

  function stamps() {
    var all = window.RDStickers || [];
    var list = STAMP_IDS.map(function (id) { return all.filter(function (s) { return s.id === id; })[0]; }).filter(Boolean);
    return list.length ? list : [{ id: 'rd', label: 'RD stamp', svg: '<svg viewBox="0 0 92 112"><rect width="92" height="112" fill="#65232b"/><text x="46" y="66" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="34" fill="#fcf7d9">RD</text></svg>' }];
  }

  function setup(back) {
    var send = back.querySelector('[data-mailto]');
    if (!send || back.querySelector('.pb-head')) return;
    var card = back.closest('.pc');
    var list = stamps(), pick = 0;

    // the stamp corner: tap to change the stamp
    var head = document.createElement('div');
    head.className = 'pb-head';
    head.innerHTML = '<span class="pb-to">TO · RIYA DUTTA<br><span>HIMACHAL PRADESH, INDIA</span></span>' +
      '<button type="button" class="pb-stamp" title="Change the stamp"><span class="pb-stamp__art"></span><svg class="pb-mark" aria-hidden="true" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#65232b" stroke-width="3"/><circle cx="50" cy="50" r="24" fill="none" stroke="#65232b" stroke-width="2"/><path d="M4 34h92M4 50h92M4 66h92" stroke="#65232b" stroke-width="2.4" fill="none" stroke-dasharray="7 5"/></svg></button>';
    back.insertBefore(head, back.firstChild);
    var stampBtn = head.querySelector('.pb-stamp'), art = head.querySelector('.pb-stamp__art');
    function showStamp() {
      art.innerHTML = list[pick].svg;
      stampBtn.setAttribute('aria-label', 'Stamp: ' + list[pick].label + '. Change the stamp');
    }
    stampBtn.addEventListener('click', function () { pick = (pick + 1) % list.length; showStamp(); stampBtn.setAttribute('data-bump', String(Date.now() % 2)); });
    showStamp();

    // the letterbox and the note shown after posting
    var holder = card.parentElement;
    var box = document.createElement('div');
    box.className = 'pb-box';
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<div class="pb-plate"><span class="pb-slot"></span><span class="pb-plate__label">LETTERS</span></div>' +
      '<div class="pb-done" hidden><p class="pb-done__title">Posted.</p><p class="pb-done__text">Your mail app should open with your postcard. Press send there and it’s on its way.</p>' +
      '<p class="pb-done__text pb-done__alt">Nothing opened? Write to <a href="mailto:' + TO + '">' + TO + '</a>, or <button type="button" class="pb-copy">copy your note</button>.</p>' +
      '<button type="button" class="pb-again">Write another</button></div>';
    holder.insertBefore(box, card.nextSibling);
    var direct = document.createElement('p');
    direct.className = 'pb-direct';
    direct.innerHTML = '<span>Or:</span><button type="button" class="pb-copymail">Copy my email</button><span aria-hidden="true">·</span>' +
      '<a href="mailto:' + TO + '">Open your mail app</a><span aria-hidden="true">·</span><a href="https://www.linkedin.com/in/riyaa-duttaa" rel="me">LinkedIn</a>';
    holder.insertBefore(direct, box.nextSibling);
    direct.querySelector('.pb-copymail').addEventListener('click', function (e) {
      var b = e.currentTarget;
      try { navigator.clipboard.writeText(TO).then(function () { b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = 'Copy my email'; }, 2000); }); }
      catch (err) { b.textContent = TO; }
    });

    var field = function (sel) { var el = back.querySelector(sel); return el ? el.value.trim() : ''; };
    function note() {
      var name = field('input[type="text"]'), from = field('input[type="email"]'), msg = field('textarea');
      return { name: name, from: from, msg: msg,
        body: msg + (name || from ? '\n\n— ' + [name, from].filter(Boolean).join(', ') : '') + '\n\nStamp: ' + list[pick].label };
    }

    function warn(text) {
      var w = back.querySelector('.pb-warn');
      if (!w) { w = document.createElement('span'); w.className = 'pb-warn'; w.setAttribute('role', 'alert'); send.parentNode.insertBefore(w, send); }
      w.textContent = text;
    }

    send.textContent = 'Post it';
    // runs before the page's own handler, which would open the mail app straight away
    send.addEventListener('click', function (e) {
      e.stopPropagation(); e.preventDefault();
      var n = note();
      if (!n.msg) { warn('Write a line or two first.'); back.querySelector('textarea').focus(); return; }
      if (n.from && !/^\S+@\S+\.\S+$/.test(n.from)) { warn('That email looks unfinished.'); back.querySelector('input[type="email"]').focus(); return; }
      var w = back.querySelector('.pb-warn'); if (w) w.remove();
      var href = 'mailto:' + TO + '?subject=' + encodeURIComponent('A postcard' + (n.name ? ' from ' + n.name : '')) + '&body=' + encodeURIComponent(n.body);
      box._note = n.body;
      box.setAttribute('data-open', '');
      stampBtn.setAttribute('data-inked', '');
      var wait = reduce ? 0 : 200;
      setTimeout(function () { card.setAttribute('data-pb', 'posting'); }, wait);
      setTimeout(function () {
        card.setAttribute('data-pb', 'posted');
        box.querySelector('.pb-done').hidden = false;
        box.setAttribute('data-done', '');
        window.location.href = href;
        box.querySelector('.pb-again').focus();
      }, reduce ? 0 : wait + 450);
    }, true);

    box.querySelector('.pb-again').addEventListener('click', function () {
      back.querySelector('textarea').value = '';
      card.removeAttribute('data-pb');
      stampBtn.removeAttribute('data-inked');
      box.removeAttribute('data-open'); box.removeAttribute('data-done');
      box.querySelector('.pb-done').hidden = true;
      back.querySelector('textarea').focus();
    });
    box.querySelector('.pb-copy').addEventListener('click', function (e) {
      var b = e.currentTarget;
      try { navigator.clipboard.writeText(box._note || '').then(function () { b.textContent = 'copied'; }); } catch (err) { b.textContent = 'copy failed'; }
    });
  }

  function start() {
    [].slice.call(document.querySelectorAll('.face2.back')).forEach(function (back) { if (back.querySelector('[data-mailto]')) setup(back); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 60); });
  else setTimeout(start, 60);
})();
