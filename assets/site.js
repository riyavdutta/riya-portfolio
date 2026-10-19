/*
 * A tiny binding runtime for the site's interactive pages.
 *
 * Each page ships two layouts: the desktop one in the live DOM and the phone one
 * in a <template data-variant="phone">. Below the breakpoint the phone layout
 * replaces the desktop one before anything is bound.
 *
 * Markup bindings, all filled from the page component's renderVals():
 *   data-t="key"            text content
 *   data-b-<attr>="...{{key}}..."   attribute template
 *   data-if="key"           shown when truthy
 *   data-on-<event>="key"   event handler
 */
(function () {
  'use strict';

  var PHONE = '(max-width: 760px)';
  var HOLE = /\{\{\s*([\w.]+)\s*\}\}/g;

  function DCLogic() { this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    this.state = Object.assign({}, this.state, patch);
    schedule();
  };
  window.DCLogic = DCLogic;

  var comp = null, vals = {}, binds = [], frame = 0;

  function lookup(key) {
    return key.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, vals);
  }

  function str(v) { return v == null ? '' : String(v); }

  function chooseLayout() {
    var tpl = document.querySelector('template[data-variant="phone"]');
    var desk = document.querySelector('[data-variant="desk"]');
    if (!tpl || !desk || !window.matchMedia(PHONE).matches) return;
    var holder = document.createElement('div');
    holder.setAttribute('data-variant', 'phone');
    holder.appendChild(tpl.content.cloneNode(true));
    desk.replaceWith(holder);
  }

  function collect() {
    binds = [];
    document.querySelectorAll('[data-t]').forEach(function (el) {
      binds.push({ el: el, kind: 't', key: el.getAttribute('data-t') });
    });
    document.querySelectorAll('[data-if]').forEach(function (el) {
      binds.push({ el: el, kind: 'if', key: el.getAttribute('data-if') });
    });
    document.querySelectorAll('*').forEach(function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (a) {
        if (a.name.indexOf('data-b-') === 0) {
          binds.push({ el: el, kind: 'attr', name: a.name.slice(7), tpl: a.value });
        } else if (a.name.indexOf('data-on-') === 0) {
          var key = a.value;
          el.addEventListener(a.name.slice(8), function (e) {
            var fn = lookup(key);
            if (typeof fn === 'function') fn(e);
          });
        }
      });
    });
  }

  function render() {
    frame = 0;
    vals = comp.renderVals() || {};
    binds.forEach(function (b) {
      if (b.kind === 't') {
        var s = str(lookup(b.key));
        if (b.el.textContent !== s) b.el.textContent = s;
      } else if (b.kind === 'if') {
        var d = lookup(b.key) ? 'contents' : 'none';
        if (b.el.style.display !== d) b.el.style.display = d;
      } else {
        var v = b.tpl.replace(HOLE, function (_, k) { return str(lookup(k)); });
        if (b.el.getAttribute(b.name) !== v) b.el.setAttribute(b.name, v);
      }
    });
  }

  // Batch updates into the next frame; the timer covers windows that pause animation frames.
  function schedule() {
    if (!comp || frame) return;
    frame = 1;
    var done = false;
    var go = function () { if (!done) { done = true; render(); } };
    window.requestAnimationFrame(go);
    window.setTimeout(go, 50);
  }

  window.Site = {
    mount: function (layouts) {
      chooseLayout();
      var isPhone = !!document.querySelector('[data-variant="phone"]:not(template)');
      var Component = (isPhone && layouts.phone) || layouts.desk;
      collect();
      comp = new Component();
      render();
      if (comp.componentDidMount) comp.componentDidMount();
      // Crossing the breakpoint swaps layouts; a reload keeps it simple. The postcard is kept in localStorage.
      var mq = window.matchMedia(PHONE);
      var onChange = function () { window.location.reload(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
      // "Send" on the contact postcard opens the visitor's mail app with what they wrote.
      document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('[data-mailto]');
        if (!btn) return;
        var card = btn.closest('.face2') || document;
        var get = function (sel) { var el = card.querySelector(sel); return el ? el.value.trim() : ''; };
        var name = get('input[type="text"]'), from = get('input[type="email"]'), msg = get('textarea');
        var body = msg + (name || from ? '\n\n— ' + [name, from].filter(Boolean).join(', ') : '');
        window.location.href = 'mailto:' + btn.getAttribute('data-mailto') +
          '?subject=' + encodeURIComponent('Hello from your portfolio' + (name ? ', from ' + name : '')) +
          '&body=' + encodeURIComponent(body);
      });
    }
  };
})();
