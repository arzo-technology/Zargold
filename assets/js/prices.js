/* ============================================================================
   ZARGOLD — PRICE ENGINE
   ----------------------------------------------------------------------------
   One interface, two back ends:
     dataMode 'demo' -> deterministic seeded market, no network required
     dataMode 'live' -> real providers (metals / crypto / FX), cached in memory

   Public API
     PRICES.init()                 -> Promise
     PRICES.snapshot()             -> {fx, metals, crypto, updatedAt, source}
     PRICES.spotPerUnit(code,unit) -> USD price per gram / tola / ounce / mesghal
     PRICES.localPerGram(code)     -> local-currency price per gram (with premium)
     PRICES.series(code, days)     -> [{t, v}] historical series
     PRICES.onChange(fn)           -> subscribe
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;

  /* ---------------- deterministic PRNG (stable demo data per day) --------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function daySeed() {
    var d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  /* ---------------- demo baseline (deliberately conservative) ------------- */
  var DEMO_BASE = {
    fx: { USD: 1, AFN: 65.35, PKR: 281.50, AED: 3.6725, SAR: 3.75, TRY: 42.80, IRR: 42000, INR: 88.20, EUR: 0.92, GBP: 0.79 },
    metals: {
      XAU: { usd: 4182.40, chg: 0.42 },
      XAG: { usd: 52.36, chg: -0.18 },
      XPT: { usd: 1418.00, chg: 0.91 },
      XPD: { usd: 1176.50, chg: -0.55 }
    },
    crypto: [
      { code: 'BTC',  usd: 97420.00, chg:  1.24, mcap: 1931000000000, vol: 41200000000 },
      { code: 'ETH',  usd: 3418.60,  chg:  0.86, mcap: 412000000000,  vol: 19800000000 },
      { code: 'USDT', usd: 1.0002,   chg:  0.01, mcap: 142000000000,  vol: 63000000000 },
      { code: 'BNB',  usd: 692.40,   chg: -0.34, mcap: 101000000000,  vol: 2100000000 },
      { code: 'SOL',  usd: 198.20,   chg:  2.11, mcap: 96000000000,   vol: 5400000000 },
      { code: 'XRP',  usd: 2.348,    chg: -1.05, mcap: 134000000000,  vol: 3900000000 },
      { code: 'ADA',  usd: 0.8210,   chg:  0.44, mcap: 29000000000,   vol: 780000000 },
      { code: 'TRX',  usd: 0.2884,   chg:  0.12, mcap: 25000000000,   vol: 610000000 },
      { code: 'TON',  usd: 5.412,    chg: -0.78, mcap: 13500000000,   vol: 240000000 },
      { code: 'DOGE', usd: 0.1912,   chg:  1.62, mcap: 28000000000,   vol: 1500000000 }
    ]
  };

  /* ---------------- state ------------------------------------------------- */
  var state = {
    fx: {},
    metals: {},
    crypto: [],
    updatedAt: null,
    source: 'demo'
  };
  var listeners = [];

  /* ---------------- demo generation --------------------------------------- */
  function buildDemo() {
    var rnd = mulberry32(daySeed());
    state.fx = Object.assign({}, DEMO_BASE.fx);
    // small daily drift on AFN so the demo feels alive
    state.fx.AFN = +(DEMO_BASE.fx.AFN + (rnd() - 0.5) * 0.6).toFixed(2);

    state.metals = {};
    Object.keys(DEMO_BASE.metals).forEach(function (code) {
      var b = DEMO_BASE.metals[code];
      state.metals[code] = {
        usd: +(b.usd * (1 + (rnd() - 0.5) * 0.012)).toFixed(2),
        chg: +(b.chg + (rnd() - 0.5) * 0.5).toFixed(2)
      };
    });

    state.crypto = DEMO_BASE.crypto.map(function (c) {
      return {
        code: c.code,
        usd: +(c.usd * (1 + (rnd() - 0.5) * 0.02)).toFixed(c.usd < 1 ? 4 : 2),
        chg: +(c.chg + (rnd() - 0.5) * 2).toFixed(2),
        mcap: c.mcap,
        vol: c.vol
      };
    });

    state.updatedAt = Date.now();
    state.source = 'demo';
  }

  /* ---------------- live adapters ----------------------------------------- */
  function fetchJSON(url, opts) {
    return fetch(url, opts).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /* ---------------- live adapters + cache --------------------------------- */
  var CACHE_KEY = 'zargold.livecache.v2';

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeCache(p) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function applyPayload(p) {
    if (p.fx) state.fx = p.fx;
    if (p.metals) state.metals = p.metals;
    if (p.crypto) state.crypto = p.crypto;
    state.updatedAt = p.dataAt || p.at || Date.now();
    state.source = 'live';
    seriesCache = {};
  }

  function cgId(c) { return c.cg || c.name.toLowerCase().replace(/\s+/g, '-'); }

  function loadLive() {
    var L = C.live;
    var cache = readCache();
    var maxAge = (C.liveCacheMinutes || 60) * 60000;

    // ?refresh=1 forces a real fetch, even if the cache is still warm
    var force = false;
    try {
      if (typeof location !== 'undefined' && location.search) {
        force = new URLSearchParams(location.search).get('refresh') === '1';
      }
    } catch (e) {}

    // fresh cache: no network call at all (protects the API quota)
    if (!force && cache && cache.at && (Date.now() - cache.at) < maxAge) {
      applyPayload(cache);
      return Promise.resolve();
    }

    var got = { fx: null, metals: null, crypto: null, dataAt: 0, afnFromMetals: null };

    var pFx = fetchJSON(L.fx.url).then(function (d) {
      if (d && d.rates) got.fx = d.rates;
    }).catch(function () {});

    var pCrypto = fetchJSON(L.crypto.url +
      '?ids=' + C.crypto.map(cgId).join(',') +
      '&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true'
    ).then(function (d) {
      if (!d) return;
      got.crypto = C.crypto.map(function (c) {
        var row = d[cgId(c)];
        if (!row) return null;
        return {
          code: c.code, usd: row.usd,
          chg: +(row.usd_24h_change || 0).toFixed(2),
          mcap: row.usd_market_cap || 0, vol: row.usd_24h_vol || 0
        };
      }).filter(Boolean);
    }).catch(function () {});

    var pMetals = null;
    if (L.metals && L.metals.key) {
      pMetals = fetchJSON(L.metals.url + '?api_key=' + encodeURIComponent(L.metals.key) +
        '&base=USD&currencies=' + L.metals.currencies
      ).then(function (d) {
        if (!d || !d.rates) return;
        if (d.timestamp) got.dataAt = d.timestamp * 1000;
        var next = {};
        C.metals.forEach(function (m) {
          var direct = d.rates['USD' + m.code];
          var inverse = d.rates[m.code];
          var usd = direct ? +direct : (inverse ? 1 / inverse : null);
          if (!usd || !isFinite(usd)) return;
          var prev = (cache && cache.metals && cache.metals[m.code]) ? cache.metals[m.code].usd : null;
          next[m.code] = {
            usd: +usd.toFixed(2),
            chg: prev ? +(((usd - prev) / prev) * 100).toFixed(2) : 0
          };
        });
        if (Object.keys(next).length) got.metals = next;
        if (d.rates.AFN) got.afnFromMetals = d.rates.AFN;
      }).catch(function () {});
    }

    return Promise.all([pFx, pCrypto, pMetals]).then(function () {
      var nothing = !got.fx && !got.metals && !(got.crypto && got.crypto.length);
      if (nothing && !cache) return;            // stay on demo data

      var fx = got.fx;
      if (!fx || !fx.AFN) {
        fx = Object.assign({}, fx || (cache && cache.fx) || state.fx);
        if (!fx.AFN && got.afnFromMetals) fx.AFN = got.afnFromMetals;
      }

      var payload = {
        at: Date.now(),
        dataAt: got.dataAt || Date.now(),
        fx: fx,
        metals: got.metals || (cache && cache.metals) || state.metals,
        crypto: (got.crypto && got.crypto.length) ? got.crypto : ((cache && cache.crypto) || state.crypto)
      };
      applyPayload(payload);
      writeCache(payload);
      emit();
    });
  }

  /* ---------------- derived maths ----------------------------------------- */
  var UNITS = C.units;

  // USD per 1 unit of weight, for a metal
  function spotPerUnit(code, unit) {
    var m = state.metals[code];
    if (!m) return 0;
    return m.usd / UNITS.ounce * (UNITS[unit] || 1);
  }

  // Local-currency price per gram including the dealer premium
  function localPerGram(code, countryCode, karat) {
    var country = getCountry(countryCode);
    var fx = state.fx[country.currency] || 1;
    var DP = C.dealerPremium || { AF: 0.015, default: 0.008, silver: 0.02 };
    var premium = (code === 'XAG')
      ? (DP.silver || 0.02)
      : (country.code === 'AF' ? (DP.AF || 0) : (DP.default || 0));
    var usdPerGram = spotPerUnit(code, 'gram');
    var purity = karat ? karat / 24 : 1;
    return usdPerGram * fx * (1 + premium) * purity;
  }

  function getCountry(code) {
    code = code || C.defaultCountry;
    for (var i = 0; i < C.countries.length; i++) if (C.countries[i].code === code) return C.countries[i];
    return C.countries[0];
  }

  /* ---------------- historical series ------------------------------------- */
  var seriesCache = {};
  function series(code, days) {
    days = days || 30;
    var key = code + ':' + days;
    if (seriesCache[key]) return seriesCache[key];

    var rnd = mulberry32(daySeed() + days * 7 + code.length);
    var current = state.metals[code] ? state.metals[code].usd
      : (state.crypto.find(function (c) { return c.code === code; }) || {}).usd || 100;
    var out = [];
    var vol = code === 'XAU' ? 0.011 : (code === 'BTC' ? 0.035 : 0.05);
    var v = current * (0.92 + rnd() * 0.06);

    for (var i = days; i >= 0; i--) {
      var drift = (current - v) / (i + 1);
      v = v + drift + (rnd() - 0.5) * v * vol;
      var d = new Date();
      d.setDate(d.getDate() - i);
      out.push({ t: d.getTime(), v: i === 0 ? current : +v.toFixed(2) });
    }
    seriesCache[key] = out;
    return out;
  }

  /* ---------------- lifecycle --------------------------------------------- */
  function init() {
    buildDemo();                       // always have data immediately
    if (C.dataMode === 'live') {
      return loadLive().then(function () { emit(); }).catch(function () { emit(); });
    }
    return Promise.resolve();
  }

  function tick() {
    if (C.dataMode !== 'demo') return;
    // gentle random walk so the UI feels live during a demo
    Object.keys(state.metals).forEach(function (code) {
      var m = state.metals[code];
      var delta = m.usd * (Math.random() - 0.5) * 0.0006;
      m.usd = +(m.usd + delta).toFixed(2);
    });
    state.crypto.forEach(function (c) {
      c.usd = +(c.usd * (1 + (Math.random() - 0.5) * 0.0008)).toFixed(c.usd < 1 ? 4 : 2);
    });
    state.updatedAt = Date.now();
    seriesCache = {};
    emit();
  }

  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (f) { try { f(state); } catch (e) {} }); }

  function snapshot() {
    return { fx: state.fx, metals: state.metals, crypto: state.crypto, updatedAt: state.updatedAt, source: state.source };
  }

  /* ---------------- formatting -------------------------------------------- */
  function fmtNum(value, locale, decimals) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    var d = decimals === undefined ? (Math.abs(value) >= 1000 ? 0 : 2) : decimals;
    try {
      return new Intl.NumberFormat(locale === 'ps' || locale === 'fa' ? 'en-US' : locale || 'en-US',
        { minimumFractionDigits: d, maximumFractionDigits: d }).format(value);
    } catch (e) {
      return value.toFixed(d);
    }
  }

  var CURRENCY_LABEL = { AFN: 'AFN', USD: 'USD', PKR: 'PKR', AED: 'AED', SAR: 'SAR', TRY: 'TRY', IRR: 'IRR', INR: 'INR', EUR: 'EUR', GBP: 'GBP' };

  function money(value, currency, locale) {
    var zeroDec = ['AFN', 'IRR', 'PKR', 'INR'];
    var dec;
    if (value !== 0 && Math.abs(value) < 1) dec = 4;
    else if (zeroDec.indexOf(currency) >= 0) dec = 0;
    else dec = 2;
    // LRI/PDI isolates keep "8,906 AFN" reading left-to-right inside RTL pages
    return '\u2066' + fmtNum(value, locale, dec) + ' ' + (CURRENCY_LABEL[currency] || currency) + '\u2069';
  }

  function compact(value, locale) {
    try {
      return new Intl.NumberFormat(locale === 'ps' || locale === 'fa' ? 'en-US' : 'en-US',
        { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    } catch (e) { return String(value); }
  }

  window.PRICES = {
    init: init, tick: tick, snapshot: snapshot, onChange: onChange,
    spotPerUnit: spotPerUnit, localPerGram: localPerGram, series: series,
    getCountry: getCountry, getState: function () { return state; }
  };

  window.FMT = { num: fmtNum, money: money, compact: compact };
})();
