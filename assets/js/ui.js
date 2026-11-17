/* ============================================================================
   ZARGOLD — UI LAYER
   Shell rendering, locale switching, SVG charts, toasts, modals.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;
  var LS_KEY = 'zargold.locale';
  var LS_COUNTRY = 'zargold.country';

  var UI = {
    locale: C.defaultLocale,
    country: C.defaultCountry,
    _subs: []
  };

  /* ---------------- locale -------------------------------------------------- */
  UI.init = function () {
    var saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) {}

    // allow ?lang=ps / ?lang=fa for shareable, language-specific links
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q && C.locales.indexOf(q) >= 0) saved = q;
    } catch (e) {}

    UI.locale = C.locales.indexOf(saved) >= 0 ? saved : C.defaultLocale;

    var savedCountry = null;
    try { savedCountry = localStorage.getItem(LS_COUNTRY); } catch (e) {}
    UI.country = savedCountry || C.defaultCountry;

    applyHtmlLang();
  };

  function applyHtmlLang() {
    var d = document.documentElement;
    d.lang = UI.locale;
    d.dir = C.rtlLocales.indexOf(UI.locale) >= 0 ? 'rtl' : 'ltr';
  }

  UI.setLocale = function (loc) {
    if (C.locales.indexOf(loc) < 0) return;
    UI.locale = loc;
    try { localStorage.setItem(LS_KEY, loc); } catch (e) {}
    applyHtmlLang();
    document.dispatchEvent(new CustomEvent('zg:locale'));
  };

  UI.setCountry = function (code) {
    UI.country = code;
    try { localStorage.setItem(LS_COUNTRY, code); } catch (e) {}
    document.dispatchEvent(new CustomEvent('zg:country'));
  };

  UI.on = function (fn) { UI._subs.push(fn); };

  /* ---------------- helpers ------------------------------------------------- */
  UI.t = function (k) { return window.t(k, UI.locale); };
  UI.tr = function (obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[UI.locale] || obj.en || '';
  };
  UI.countryObj = function () { return window.PRICES.getCountry(UI.country); };
  UI.currency = function () { return UI.countryObj().currency; };

  UI.initials = function (name) {
    return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0]; }).join('').toUpperCase();
  };

  UI.timeAgo = function (iso) {
    var d = new Date(iso).getTime();
    var s = Math.round((Date.now() - d) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min';
    if (s < 86400) return Math.floor(s / 3600) + ' h';
    return Math.floor(s / 86400) + ' d';
  };

  UI.dateFmt = function (iso) {
    try {
      return new Intl.DateTimeFormat(UI.locale === 'ps' || UI.locale === 'fa' ? 'en-GB' : UI.locale,
        { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
    } catch (e) { return new Date(iso).toLocaleDateString(); }
  };

  UI.arrow = function (chg) {
    return chg >= 0 ? '▲' : '▼';
  };

  /* ---------------- charts -------------------------------------------------- */
  function pathFrom(points, w, h, pad) {
    if (!points.length) return '';
    var vals = points.map(function (p) { return p.v; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || 1;
    var stepX = (w - pad * 2) / Math.max(points.length - 1, 1);
    return points.map(function (p, i) {
      var x = pad + i * stepX;
      var y = h - pad - ((p.v - min) / span) * (h - pad * 2);
      return (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
    }).join(' ');
  }

  UI.sparkline = function (points, color) {
    color = color || '#E9B949';
    var w = 200, h = 46, pad = 3;
    var d = pathFrom(points, w, h, pad);
    var id = 'sp' + Math.random().toString(36).slice(2, 8);
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" width="100%" height="100%">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity=".30"/>' +
      '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + d + ' L' + (w - pad) + ',' + (h - pad) + ' L' + pad + ',' + (h - pad) + ' Z" fill="url(#' + id + ')"/>' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
  };

  UI.areaChart = function (points, opts) {
    opts = opts || {};
    var w = 760, h = 260, padL = 54, padR = 12, padT = 14, padB = 26;
    var vals = points.map(function (p) { return p.v; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = (max - min) || 1;
    var pad = (span * 0.12);
    min -= pad; max += pad; span = max - min;

    function X(i) { return padL + (i * (w - padL - padR)) / Math.max(points.length - 1, 1); }
    function Y(v) { return h - padB - ((v - min) / span) * (h - padT - padB); }

    var line = points.map(function (p, i) {
      return (i === 0 ? 'M' : 'L') + X(i).toFixed(1) + ',' + Y(p.v).toFixed(1);
    }).join(' ');
    var area = line + ' L' + X(points.length - 1).toFixed(1) + ',' + (h - padB) + ' L' + X(0).toFixed(1) + ',' + (h - padB) + ' Z';

    var grid = '', labels = '';
    for (var g = 0; g <= 4; g++) {
      var y = padT + ((h - padT - padB) * g) / 4;
      grid += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + y.toFixed(1) + '"/>';
      var v = min + span * (1 - g / 4);
      labels += '<text x="' + (padL - 8) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="end">' +
        window.FMT.num(v, 'en-US', v > 1000 ? 0 : 2) + '</text>';
    }

    var xl = '';
    var step = Math.max(1, Math.floor(points.length / 5));
    for (var i = 0; i < points.length; i += step) {
      var dt = new Date(points[i].t);
      xl += '<text x="' + X(i).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' +
        (dt.getMonth() + 1) + '/' + dt.getDate() + '</text>';
    }

    var lastX = X(points.length - 1), lastY = Y(points[points.length - 1].v);

    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="goldFade" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#E9B949" stop-opacity=".26"/>' +
      '<stop offset="100%" stop-color="#E9B949" stop-opacity="0"/></linearGradient></defs>' +
      '<g class="chart__grid">' + grid + '</g>' +
      '<path class="chart__area" d="' + area + '"/>' +
      '<path class="chart__line" d="' + line + '"/>' +
      '<circle class="chart__dot" cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="4"/>' +
      '<g class="chart__labels">' + labels + xl + '</g>' +
      '</svg>';
  };

  /* ---------------- toast --------------------------------------------------- */
  UI.toast = function (msg, kind) {
    var root = document.querySelector('.toast-root');
    if (!root) {
      root = document.createElement('div');
      root.className = 'toast-root';
      document.body.appendChild(root);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    if (kind === 'error') el.style.borderInlineStartColor = 'var(--down)';
    if (kind === 'ok') el.style.borderInlineStartColor = 'var(--up)';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      el.style.transition = 'all .25s';
      setTimeout(function () { el.remove(); }, 260);
    }, 3200);
  };

  /* ---------------- reveal on scroll --------------------------------------- */
  UI.observeReveals = function () {
    var items = [].slice.call(document.querySelectorAll('.reveal:not(.is-in)'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('is-in'); });
      return;
    }

    // anything already within (or above) the viewport shows immediately
    var vh = window.innerHeight || document.documentElement.clientHeight;
    items.forEach(function (i) {
      if (i.getBoundingClientRect().top < vh) i.classList.add('is-in');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });

    items.forEach(function (i) { if (!i.classList.contains('is-in')) io.observe(i); });

    // safety net: never leave content invisible
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (i) { i.classList.add('is-in'); });
    }, 2500);
  };

  /* ---------------- chrome (header / footer) ------------------------------- */
  var NAV = [
    ['#market', 'nav.gold'],
    ['#crypto', 'nav.crypto'],
    ['#currency', 'nav.currency'],
    ['#countries', 'nav.countries'],
    ['#calculators', 'nav.calculators'],
    ['#insights', 'nav.news']
  ];

  UI.header = function (opts) {
    opts = opts || {};
    var user = window.STORE.currentUser();
    var name = UI.tr(C.brand.name);
    var langLabel = { en: 'English', ps: 'پښتو', fa: 'دری' };

    var navHtml = NAV.map(function (n) {
      return '<a href="' + n[0] + '">' + UI.t(n[1]) + '</a>';
    }).join('');

    var actions = '';
    if (user && user.role === 'admin') {
      actions = '<a class="btn btn--ghost btn--sm" href="admin.html">' + UI.t('admin.title') + '</a>';
    } else if (user) {
      actions = '<a class="btn btn--ghost btn--sm" href="account.html">' + UI.t('dash.title') + '</a>';
    } else {
      actions = '<a class="btn btn--quiet btn--sm" href="account.html#signin">' + UI.t('cta.signin') + '</a>' +
        '<a class="btn btn--gold btn--sm" href="account.html#register">' + UI.t('cta.register') + '</a>';
    }

    var langItems = C.locales.map(function (l) {
      return '<button data-loc="' + l + '" aria-current="' + (l === UI.locale) + '">' +
        '<span>' + langLabel[l] + '</span><span class="mono" style="font-size:11px;opacity:.6">' + l.toUpperCase() + '</span></button>';
    }).join('');

    var mobileNav = NAV.map(function (n) {
      return '<a href="' + n[0] + '">' + UI.t(n[1]) + '</a>';
    }).join('') + '<a href="account.html">' + UI.t('dash.title') + '</a>';

    return '<header class="hdr">' +
      '<div class="wrap hdr__inner">' +
        '<a class="brand" href="index.html">' +
          '<div class="brand__mark">' + C.brand.initials + '</div>' +
          '<div><div class="brand__name">' + name.replace(/([A-Z][a-z]+)$/, '<span>$1</span>') + '</div>' +
          '<div class="brand__sub">Gold &amp; Markets</div></div>' +
        '</a>' +
        '<nav class="nav">' + navHtml + '</nav>' +
        '<div class="hdr__actions">' +
          '<div class="langswitch" id="langswitch">' +
            '<button class="langswitch__btn" id="langBtn" aria-haspopup="true" aria-expanded="false">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z"/></svg>' +
              langLabel[UI.locale] +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>' +
            '</button>' +
            '<div class="langswitch__menu" role="menu">' + langItems + '</div>' +
          '</div>' +
          actions +
          '<button class="menu-btn" id="menuBtn" aria-label="Menu">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-nav" id="mobileNav">' + mobileNav + '</div>' +
    '</header>';
  };

  UI.footer = function () {
    var name = UI.tr(C.brand.name);
    return '<footer class="footer">' +
      '<div class="wrap">' +
        '<div class="footer__grid">' +
          '<div>' +
            '<a class="brand" href="index.html"><div class="brand__mark">' + C.brand.initials + '</div>' +
            '<div><div class="brand__name">' + name + '</div><div class="brand__sub">Gold &amp; Markets</div></div></a>' +
            '<p class="footer__about">' + UI.tr(C.brand.tagline) + '</p>' +
            '<p class="disclaimer">' + UI.t('footer.disclaimer') + '</p>' +
          '</div>' +
          '<div><h4>' + UI.t('footer.quick') + '</h4><ul>' +
            '<li><a href="#market">' + UI.t('nav.gold') + '</a></li>' +
            '<li><a href="#crypto">' + UI.t('nav.crypto') + '</a></li>' +
            '<li><a href="#currency">' + UI.t('nav.currency') + '</a></li>' +
            '<li><a href="#calculators">' + UI.t('nav.calculators') + '</a></li>' +
          '</ul></div>' +
          '<div><h4>' + UI.t('footer.legal') + '</h4><ul>' +
            '<li><a href="#">' + UI.t('footer.terms') + '</a></li>' +
            '<li><a href="#">' + UI.t('footer.privacy') + '</a></li>' +
            '<li><a href="#">' + UI.t('footer.refund') + '</a></li>' +
          '</ul></div>' +
          '<div><h4>' + UI.t('footer.contact') + '</h4><ul>' +
            '<li><a href="tel:' + C.brand.phone.replace(/\s/g, '') + '">' + C.brand.phone + '</a></li>' +
            '<li><a href="mailto:' + C.brand.email + '">' + C.brand.email + '</a></li>' +
            '<li><span class="muted" style="font-size:13.5px">' + UI.tr(C.brand.address) + '</span></li>' +
            '<li><span class="muted" style="font-size:13.5px">' + UI.tr(C.brand.hours) + '</span></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer__bar">' +
          '<span>© ' + new Date().getFullYear() + ' ' + C.brand.legalName + '. ' + UI.t('footer.rights') + '</span>' +
          '<span>' + UI.t('price.updated') + ': ' + new Date().toLocaleTimeString() + '</span>' +
        '</div>' +
      '</div>' +
    '</footer>';
  };

  UI.mbar = function () {
    return '<div class="mbar">' +
      '<a href="tel:' + C.brand.phone.replace(/\s/g, '') + '"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z"/></svg>' + UI.t('footer.contact') + '</a>' +
      '<a href="#market" class="is-primary"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>' + UI.t('nav.gold') + '</a>' +
      '<a href="account.html"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>' + UI.t('dash.title') + '</a>' +
    '</div>';
  };

  /* ---------------- mount + wire ------------------------------------------- */
  UI.mount = function (opts) {
    opts = opts || {};
    var hdrSlot = document.getElementById('hdr');
    var ftrSlot = document.getElementById('ftr');
    if (hdrSlot) hdrSlot.innerHTML = UI.header(opts);
    if (ftrSlot) ftrSlot.innerHTML = UI.footer();
    if (!opts.noMobileBar) document.body.insertAdjacentHTML('beforeend', UI.mbar());

    // language menu
    document.addEventListener('click', function (e) {
      var sw = document.getElementById('langswitch');
      if (!sw) return;
      if (e.target.closest('#langBtn')) {
        sw.classList.toggle('is-open');
        return;
      }
      var loc = e.target.closest('[data-loc]');
      if (loc) { UI.setLocale(loc.getAttribute('data-loc')); return; }
      sw.classList.remove('is-open');
    });

    var mb = document.getElementById('menuBtn');
    if (mb) mb.addEventListener('click', function () {
      var mn = document.getElementById('mobileNav');
      if (mn) mn.classList.toggle('is-open');
    });

    document.addEventListener('zg:locale', function () {
      if (opts.reRender) opts.reRender();
      else window.location.reload();
    });
  };

  window.UI = UI;
})();
