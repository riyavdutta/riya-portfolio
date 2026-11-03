/*
 * The contact postcard: write a message, add your name and email, press "Post it".
 * The stamp gets franked, the card drops away, and the visitor's mail app opens
 * with the note ready to send. Nothing is sent from the site itself.
 */
(function () {
  'use strict';
  var TO = 'riyavdutta@gmail.com';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setup(form) {
    var done = form.parentNode.querySelector('.pf-done');
    var warn = form.querySelector('.pf-warn');
    var val = function (sel) { return form.querySelector(sel).value.trim(); };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = val('[name="name"]'), from = val('[name="email"]'), msg = val('[name="message"]');
      if (!msg) { warn.textContent = 'Write a line or two first.'; form.querySelector('[name="message"]').focus(); return; }
      if (from && !/^\S+@\S+\.\S+$/.test(from)) { warn.textContent = 'That email looks unfinished.'; form.querySelector('[name="email"]').focus(); return; }
      warn.textContent = '';
      var body = msg + (name || from ? '\n\n— ' + [name, from].filter(Boolean).join(', ') : '');
      var href = 'mailto:' + TO + '?subject=' + encodeURIComponent('A postcard' + (name ? ' from ' + name : '')) + '&body=' + encodeURIComponent(body);
      form.setAttribute('data-state', 'posting');
      setTimeout(function () {
        form.setAttribute('data-state', 'posted');
        done.hidden = false;
        window.location.href = href;
        done.querySelector('.pf-again').focus();
      }, reduce ? 0 : 750);
    });

    done.querySelector('.pf-again').addEventListener('click', function () {
      form.querySelector('[name="message"]').value = '';
      form.removeAttribute('data-state');
      done.hidden = true;
      form.querySelector('[name="message"]').focus();
    });
  }

  function start() { [].slice.call(document.querySelectorAll('form.pf')).forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 60); });
  else setTimeout(start, 60);
})();
