/* ============================================================================
   ZARGOLD — PUBLIC SITE CONTROLLER
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var chartDays = 30;
  var chartCode = 'XAU';

  /* ---------------- copy that lives outside the dictionary ----------------- */
  var HERO_TITLE = {
    en: ['Know the real price of gold', 'before you trade.'],
    ps: ['د سرو زرو ریښتینې بیه', 'د پیرودلو دمخه وپېژنئ.'],
    fa: ['قیمت واقعی طلا را', 'پیش از معامله بدانید.']
  };
  var H2MARKET = {
    en: 'Precious metal prices today',
    ps: 'د نن ورځې د فلزاتو بیې',
    fa: 'قیمت فلزات امروز'
  };
  var BAND = {
    title: { en: 'Open your dealer account today', ps: 'نن خپل حساب پرانیزئ', fa: 'امروز حساب خود را باز کنید' },
    text:  { en: 'Verify your identity once, then buy and sell with a full written record of every transaction.',
             ps: 'یو ځل خپل هویت تصدیق کړئ، بیا د هرې راکړې ورځې بشپړ لیکلي تاریخ سره پیرود او پلور وکړئ.',
             fa: 'یک بار هویت خود را تأیید کنید، سپس با سابقه کامل مکتوب هر معامله خرید و فروش کنید.' },
    btn:   { en: 'Open account', ps: 'حساب جوړول', fa: 'ایجاد حساب' },
    btn2:  { en: 'Call the office', ps: 'دفتر ته زنګ ووهئ', fa: 'تماس با دفتر' }
  };
  var STAT3 = { en: 'Crypto assets', ps: 'کریپټو اسعار', fa: 'دارایی‌های کریپتو' };
  var CHART_NOTE = {
    en: 'Trend line is indicative. The live daily close is the figure shown above.',
    ps: 'د کرښې روند یوازې اټکلیز دی. ژوندې ورځنې بیه پورته ښودل شوې.',
    fa: 'خط روند صرفاً نشان‌دهنده است. قیمت زنده روزانه همان رقم بالا است.'
  };
  var FRESH = {
    live:   { en: 'Live data', ps: 'ژوندې معلومات', fa: 'داده‌های زنده' },
    demo:   { en: 'Demo data', ps: 'د نمونې معلومات', fa: 'داده‌های نمونه' },
    asOf:   { en: 'as of', ps: 'د', fa: 'تا تاریخ' },
    sample: { en: 'sample prices', ps: 'نمونې بیې', fa: 'قیمت‌های نمونه' }
  };
  var CONV = {
    amount:    { en: 'Amount', ps: 'اندازه', fa: 'مبلغ' },
    from:      { en: 'From', ps: 'له', fa: 'از' },
    to:        { en: 'To', ps: 'ته', fa: 'به' },
    converted: { en: 'Converted amount', ps: 'بدل شوې اندازه', fa: 'مبلغ تبدیل‌شده' },
    metal:     { en: 'Metal', ps: 'فلز', fa: 'فلز' }
  };
  var NEWS = [
    {
      tag: { en: 'Gold', ps: 'سره زر', fa: 'طلا' },
      title: { en: 'Central bank demand keeps a floor under prices',
               ps: 'د مرکزي بانک غوښتنه د بیې لاندې ملاتړ ساتي',
               fa: 'تقاضای بانک مرکزی کف قیمت را حفظ می‌کند' },
      text: { en: 'Official-sector buying has absorbed selling from ETF outflows, keeping the metal firm above its recent range.',
              ps: 'رسمي سکتور پیرود د ETF وتلو پلور جذب کړی او فلز یې د خپل وروستي حد پورته قوي ساتلی.',
              fa: 'خرید بخش رسمی، فروش خروجی ETF را جذب کرده و فلز را بالاتر از محدوده اخیر محکم نگه داشته است.' },
      meta: { en: '4 min read · Today', ps: '۴ دقیقې لوستل · نن', fa: '۴ دقیقه مطالعه · امروز' }
    },
    {
      tag: { en: 'Afghanistan', ps: 'افغانستان', fa: 'افغانستان' },
      title: { en: 'Kabul sarrafi premium narrows as supply improves',
               ps: 'په کابل کې د صرافي اضافي بیه کموي',
               fa: 'حق‌الضرب صرافی کابل با بهبود عرضه کاهش می‌یابد' },
      text: { en: 'Physical premiums in the Kabul market eased this week as imported stock reached the bazaar.',
              ps: 'په دې اونۍ کې د کابل په بازار کې فزیکي اضافي بیه کمه شوه ځکه وارد شوي توکي بازار ته ورسېدل.',
              fa: 'حق‌الضرب فیزیکی در بازار کابل این هفته کاهش یافت زیرا موجودی وارداتی به بازار رسید.' },
      meta: { en: '3 min read · Yesterday', ps: '۳ دقیقې لوستل · پرون', fa: '۳ دقیقه مطالعه · دیروز' }
    },
    {
      tag: { en: 'Crypto', ps: 'کریپټو', fa: 'کریپتو' },
      title: { en: 'Bitcoin volatility compresses ahead of macro data',
               ps: 'د بټکوین بې‌ثباتي د اقتصادي معلوماتو دمخه کموي',
               fa: 'نوسان بیت‌کوین پیش از داده‌های اقتصادی کاهش می‌یابد' },
      text: { en: 'Realised volatility fell to a two-month low as traders await the next inflation print.',
              ps: 'د بټکوین ریښتینې بې‌ثباتي دوه میاشتني ټیټ حد ته ورسېده ځکه سوداګر د انفلاسیون راتلونکي معلومات ته انتظار باسي.',
              fa: 'نوسان تحقق‌یافته به پایین‌ترین سطح دو ماه رسید زیرا معامله‌گران منتظر داده تورم بعدی هستند.' },
      meta: { en: '5 min read · 2 days ago', ps: '۵ دقیقې لوستل · ۲ ورځې دمخه', fa: '۵ دقیقه مطالعه · ۲ روز پیش' }
    }
  ];
  var WHY = [
    { icon: '<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>', k: 1 },
    { icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>', k: 2 },
    { icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z"/>', k: 3 },
    { icon: '<path d="M12 21s-7-4.5-7-10a7 7 0 0114 0c0 5.5-7 10-7 10z"/><circle cx="12" cy="11" r="2.5"/>', k: 4 }
  ];

  function L(obj) { return obj[UI.locale] || obj.en; }

  /* ---------------- static labels ------------------------------------------ */
  function labels() {
    var set = {
      liveLabel: 'hero.badge', heroSub: 'hero.subtitle', heroCta1: 'cta.viewPrices', heroCta2: 'cta.register',
      statL1: 'hero.stat1', statL2: 'hero.stat2', statL4: 'hero.stat4',
      eyebrowMarket: 'section.market', leadMarket: 'section.marketSub',
      eyebrowCrypto: 'nav.crypto', h2Crypto: 'section.crypto', leadCrypto: 'section.cryptoSub',
      eyebrowFx: 'nav.currency', h2Fx: 'section.currency', leadFx: 'section.currencySub',
      eyebrowCountries: 'nav.countries', h2Countries: 'section.countries', leadCountries: 'section.countriesSub',
      citiesTitle: 'section.cities', citiesSub: 'section.citiesSub',
      eyebrowCalc: 'nav.calculators', h2Calc: 'section.goldCalc', leadCalc: 'section.goldCalcSub',
      eyebrowNews: 'nav.news', h2News: 'section.news', leadNews: 'section.newsSub',
      eyebrowWhy: 'section.why', h2Why: 'section.why', leadWhy: 'section.whySub',
      fxTableTitle: 'nav.currency',
      lblWeight: 'calc.weight', lblUnit: 'calc.unit', lblKarat: 'calc.karat',
      calcOutLabel: 'calc.value', zakatTitle: 'calc.zakatTitle', zakatSub: 'calc.zakatSub',
      lblZWeight: 'calc.weight', lblZKarat: 'calc.karat', zakatDueLabel: 'calc.zakatDue',
      chartTitle: 'nav.charts'
    };
    Object.keys(set).forEach(function (id) {
      var el = $(id); if (el) el.textContent = UI.t(set[id]);
    });
    $('h2Market').textContent = L(H2MARKET);
    $('statL3').textContent = L(STAT3);
    $('statUpdates').textContent = C.crypto.length;
    $('lblAmount').textContent = L(CONV.amount);
    $('lblFrom').textContent = L(CONV.from);
    $('lblTo').textContent = L(CONV.to);
    $('lblResult').textContent = L(CONV.converted);
    $('lblMetal').textContent = L(CONV.metal);

    // hero headline with gold gradient on the second half
    var t = HERO_TITLE[UI.locale] || HERO_TITLE.en;    $('heroTitle').innerHTML = t[0] + ' <em>' + t[1] + '</em>';
    $('heroTitle').setAttribute('dir', C.rtlLocales.indexOf(UI.locale) >= 0 ? 'rtl' : 'ltr');

    $('bandTitle').textContent = L(BAND.title);
    $('bandText').textContent = L(BAND.text);
    $('bandBtn').textContent = L(BAND.btn);
    $('bandBtn2').textContent = L(BAND.btn2);

    // unit + karat option labels
    var unitSel = $('calcUnit');
    if (unitSel) {
      unitSel.options[0].text = UI.t('unit.gram');
      unitSel.options[1].text = UI.t('unit.tola');
      unitSel.options[2].text = UI.t('unit.mesghal');
      unitSel.options[3].text = UI.t('unit.ounce');
    }
    var metalSel = $('calcMetal');
    if (metalSel) {
      metalSel.options[0].text = UI.tr(C.metals[0].name);
      metalSel.options[1].text = UI.tr(C.metals[1].name);
    }
  }

  /* ---------------- ticker -------------------------------------------------- */
  function renderTicker() {
    var s = PRICES.snapshot();
    var cur = UI.currency();
    var fx = s.fx[cur] || 1;
    var items = [];

    C.metals.forEach(function (m) {
      var st = s.metals[m.code]; if (!st) return;
      var local = PRICES.localPerGram(m.code, UI.country);
      items.push({ sym: m.code, val: FMT.money(local, cur), chg: st.chg });
    });
    s.crypto.slice(0, 6).forEach(function (c) {
      items.push({ sym: c.code, val: FMT.num(c.usd * fx, 'en-US', c.usd < 1 ? 4 : 2), chg: c.chg });
    });
    items.push({ sym: 'USD/AFN', val: FMT.num(s.fx.AFN, 'en-US', 2), chg: 0.12 });

    var html = items.map(function (i) {
      var cls = i.chg >= 0 ? 'up' : 'down';
      return '<div class="tick"><span class="tick__sym">' + i.sym + '</span>' +
        '<span class="tick__val">' + i.val + '</span>' +
        (i.chg ? '<span class="tick__chg ' + cls + '">' + (i.chg >= 0 ? '▲' : '▼') + ' ' + Math.abs(i.chg).toFixed(2) + '%</span>' : '') +
        '</div>';
    }).join('');

    $('tickerTrack').innerHTML = html + html;
  }

  /* ---------------- metal cards -------------------------------------------- */
  function renderMetals() {
    var s = PRICES.snapshot();
    var cur = UI.currency();
    var host = $('metalCards');
    if (!host) return;

    host.innerHTML = C.metals.map(function (m, i) {
      var st = s.metals[m.code]; if (!st) return '';
      var perGram = PRICES.localPerGram(m.code, UI.country);
      var tola = perGram * C.units.tola;
      var ounce = perGram * C.units.ounce;
      var pts = PRICES.series(m.code, 7);
      var up = st.chg >= 0;

      return '<div class="card metal reveal is-in" data-code="' + m.code + '" style="cursor:pointer">' +
        '<div class="metal__top">' +
          '<div class="metal__id">' +
            '<div class="metal__icon" style="background:linear-gradient(150deg,' + m.accent + ',' + shade(m.accent) + ')">' + m.symbol + '</div>' +
            '<div><div class="metal__code">' + m.code + '</div><div class="metal__name">' + UI.tr(m.name) + '</div></div>' +
          '</div>' +
          '<span class="chip ' + (up ? 'chip--up' : 'chip--down') + '">' + (up ? '▲' : '▼') + ' ' + Math.abs(st.chg).toFixed(2) + '%</span>' +
        '</div>' +
        '<div class="metal__price">' + FMT.money(perGram, cur) + '</div>' +
        '<div class="metal__unit">' + UI.t('price.perGram') + ' · ' + m.purity + '</div>' +
        '<div class="metal__spark">' + UI.sparkline(pts, m.accent) + '</div>' +
        '<div class="metal__foot">' +
          '<div><span>' + UI.t('price.perTola') + '</span>' + FMT.money(tola, cur) + '</div>' +
          '<div><span>' + UI.t('price.perOunce') + '</span>' + FMT.money(ounce, cur) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    host.querySelectorAll('[data-code]').forEach(function (el) {
      el.addEventListener('click', function () {
        chartCode = el.getAttribute('data-code');
        renderChart();
        $('chartTitle').textContent = UI.tr(metalByCode(chartCode).name) + ' · ' + UI.t('nav.charts');
        document.getElementById('market').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function metalByCode(code) {
    for (var i = 0; i < C.metals.length; i++) if (C.metals[i].code === code) return C.metals[i];
    return C.metals[0];
  }
  function shade(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, ((n >> 16) & 255) - 70), g = Math.max(0, ((n >> 8) & 255) - 60), b = Math.max(0, (n & 255) - 40);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ---------------- chart --------------------------------------------------- */
  function renderChart() {
    var pts = PRICES.series(chartCode, chartDays);
    var host = $('chartHost');
    if (host) host.innerHTML = UI.areaChart(pts);
    var note = $('chartNote');
    if (note) note.textContent = L(CHART_NOTE);
    var m = metalByCode(chartCode);
    var badge = $('chartBadge');
    if (badge) badge.innerHTML = '<i></i> ' + m.code + ' · USD/oz';
  }

  /* ---------------- crypto -------------------------------------------------- */
  function renderCrypto() {
    var s = PRICES.snapshot();
    var cur = UI.currency();
    var fx = s.fx[cur] || 1;

    $('cryptoHead').innerHTML =
      '<th>' + UI.t('table.name') + '</th>' +
      '<th class="num">' + UI.t('table.price') + ' (USD)</th>' +
      '<th class="num">' + UI.t('table.price') + ' (' + cur + ')</th>' +
      '<th class="num">' + UI.t('table.change') + '</th>' +
      '<th class="num">' + UI.t('table.marketCap') + '</th>';

    $('cryptoBody').innerHTML = s.crypto.map(function (c) {
      var meta = C.crypto.filter(function (x) { return x.code === c.code; })[0] || { name: c.code, color: '#888', glyph: '?' };
      var up = c.chg >= 0;
      return '<tr>' +
        '<td><div class="coin"><div class="coin__ic" style="background:' + meta.color + '">' + meta.glyph + '</div>' +
          '<div><div class="coin__n">' + meta.name + '</div><div class="coin__c">' + c.code + '</div></div></div></td>' +
        '<td class="num mono">$' + FMT.num(c.usd, 'en-US', c.usd < 1 ? 4 : 2) + '</td>' +
        '<td class="num mono">' + FMT.money(c.usd * fx, cur) + '</td>' +
        '<td class="num"><span class="chip ' + (up ? 'chip--up' : 'chip--down') + '">' + (up ? '▲' : '▼') + ' ' + Math.abs(c.chg).toFixed(2) + '%</span></td>' +
        '<td class="num mono muted">$' + FMT.compact(c.mcap) + '</td>' +
      '</tr>';
    }).join('');
  }

  /* ---------------- currency ----------------------------------------------- */
  var FX_MAJORS = ['USD', 'AFN', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'TRY', 'IRR', 'INR'];

  function renderCurrency() {
    var s = PRICES.snapshot();
    var sel = $('fxFrom'), sel2 = $('fxTo');
    if (!sel || !sel2) return;

    var opts = FX_MAJORS.filter(function (c) { return s.fx[c]; }).map(function (c) {
      return '<option value="' + c + '">' + c + '</option>';
    }).join('');
    sel.innerHTML = opts; sel2.innerHTML = opts;
    sel.value = UI.currency();
    sel2.value = UI.currency() === 'USD' ? 'AFN' : 'USD';

    $('fxBody').innerHTML = FX_MAJORS.filter(function (c) { return s.fx[c] && c !== 'USD'; }).map(function (c) {
      var rate = s.fx[c];
      var inv = 1 / rate;
      var decRate = rate < 10 ? 4 : (rate > 1000 ? 0 : 2);
      var decInv = inv < 0.01 ? 6 : 4;
      return '<tr><td><b>' + c + '</b></td>' +
        '<td class="num mono">' + FMT.num(rate, 'en-US', decRate) + '</td>' +
        '<td class="num mono muted">1 ' + c + ' = ' + FMT.num(inv, 'en-US', decInv) + ' USD</td></tr>';
    }).join('');

    updateFx();
  }

  function updateFx() {
    var s = PRICES.snapshot();
    var amt = parseFloat($('fxAmount').value) || 0;
    var from = $('fxFrom').value, to = $('fxTo').value;
    var r1 = s.fx[from] || 1, r2 = s.fx[to] || 1;
    var out = amt / r1 * r2;
    $('fxResult').textContent = FMT.money(out, to);
    $('fxRateHint').textContent = '1 ' + from + ' = ' + FMT.num(r2 / r1, 'en-US', 4) + ' ' + to;
  }

  /* ---------------- countries ---------------------------------------------- */
  var FLAG = { AF: '🇦🇫', PK: '🇵🇰', AE: '🇦🇪', SA: '🇸🇦', TR: '🇹🇷', IR: '🇮🇷', IN: '🇮🇳', US: '🇺🇸' };

  function renderCountries() {
    var host = $('countryGrid');
    if (!host) return;

    host.innerHTML = C.countries.map(function (c) {
      var unit = c.unit || 'gram';
      var perUnit = PRICES.localPerGram('XAU', c.code) * (C.units[unit] || 1);
      return '<div class="country' + (c.code === UI.country ? ' is-active' : '') + '" data-country="' + c.code + '">' +
        '<div class="country__flag">' + c.code + '</div>' +
        '<div><div class="country__n">' + UI.tr(c.name) + '</div><div class="country__c">' + c.currency + ' · ' + UI.t('price.per' + unit.charAt(0).toUpperCase() + unit.slice(1)) + '</div></div>' +
        '<div class="country__p">' + FMT.money(perUnit, c.currency) + '<small>' + UI.t('unit.' + unit) + '</small></div>' +
      '</div>';
    }).join('');

    host.querySelectorAll('[data-country]').forEach(function (el) {
      el.addEventListener('click', function () {
        UI.setCountry(el.getAttribute('data-country'));
      });
    });

    renderCities();
  }

  function renderCities() {
    var host = $('cityGrid');
    if (!host) return;
    var c = UI.countryObj();
    var cities = (c.cities && (c.cities[UI.locale] || c.cities.en)) || [];
    var base = PRICES.localPerGram('XAU', c.code);
    var seed = 0;

    host.innerHTML = cities.slice(0, 8).map(function (city, i) {
      // deterministic small provincial spread (+/- 0.6%)
      var jitter = 1 + (((i * 37) % 11) - 5) / 1000;
      var price = base * jitter;
      return '<div class="card card--flat" style="padding:16px">' +
        '<div class="muted" style="font-size:12px">' + city + '</div>' +
        '<div style="font-size:17px;font-weight:700;margin-block-start:6px;font-variant-numeric:tabular-nums">' + FMT.money(price, c.currency) + '</div>' +
        '<div class="muted" style="font-size:11px;margin-block-start:2px">' + UI.t('price.perGram') + ' · 24K</div>' +
      '</div>';
    }).join('');
  }

  /* ---------------- calculators -------------------------------------------- */
  function recalc() {
    var s = PRICES.snapshot();
    var cur = UI.currency();
    var weight = parseFloat($('calcWeight').value) || 0;
    var unit = $('calcUnit').value;
    var karat = +$('calcKarat').value;
    var metal = $('calcMetal').value;

    var grams = weight * (C.units[unit] || 1);
    var perGram = PRICES.localPerGram(metal, UI.country, karat);
    var value = grams * perGram;

    $('calcValue').textContent = FMT.money(value, cur);
    $('calcHint').textContent = FMT.num(grams, 'en-US', 2) + ' g × ' + FMT.money(perGram, cur) + ' / g';

    // zakat
    var zw = parseFloat($('zakatWeight').value) || 0;
    var zk = +$('zakatKarat').value;
    var goldPerGram24 = PRICES.localPerGram('XAU', UI.country, 24);
    var zValue = zw * PRICES.localPerGram('XAU', UI.country, zk);
    var nisab = 85 * goldPerGram24;
    var due = zValue > nisab ? zValue * 0.025 : 0;

    $('zakatValue').textContent = FMT.money(due, cur);
    $('zakatHint').textContent = due > 0
      ? UI.t('calc.nisab') + ': ' + FMT.money(nisab, cur)
      : UI.t('calc.nisab') + ': ' + FMT.money(nisab, cur) + ' — below nisab';
  }

  /* ---------------- news / why --------------------------------------------- */
  function renderNews() {
    $('newsGrid').innerHTML = NEWS.map(function (n) {
      return '<article class="card news reveal is-in">' +
        '<div class="news__img"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg></div>' +
        '<div class="news__tag">' + L(n.tag) + '</div>' +
        '<h3 class="news__h">' + L(n.title) + '</h3>' +
        '<p class="news__p">' + L(n.text) + '</p>' +
        '<div class="news__m">' + L(n.meta) + '</div>' +
      '</article>';
    }).join('');
  }

  function renderWhy() {
    $('whyGrid').innerHTML = WHY.map(function (w) {
      return '<div class="card why reveal is-in">' +
        '<div class="why__ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + w.icon + '</svg></div>' +
        '<div class="why__t">' + UI.t('why.' + w.k + '.title') + '</div>' +
        '<p class="why__p">' + UI.t('why.' + w.k + '.text') + '</p>' +
      '</div>';
    }).join('');
  }

  /* ---------------- hero market widget ------------------------------------- */
  function renderHeroVisual() {
    var host = $('heroVisual');
    if (!host) return;
    var s = PRICES.snapshot();
    var cur = UI.currency();
    var st = s.metals.XAU;
    var price = PRICES.localPerGram('XAU', UI.country);
    var pts = PRICES.series('XAU', 14);
    var up = st && st.chg >= 0;

    var rows = C.metals.slice(1).map(function (m) {
      return '<div class="hv__row"><span>' + UI.tr(m.name) + ' · ' + m.code + '</span>' +
        '<b>' + FMT.money(PRICES.localPerGram(m.code, UI.country), cur) + '</b></div>';
    }).join('');

    host.innerHTML = '<div class="hv">' +
      '<div class="hv__head">' +
        '<span class="hv__sym">XAU / ' + cur + ' · 24K</span>' +
        '<span class="hv__live"><span class="pulse"></span> ' + UI.t('price.live').toUpperCase() + '</span>' +
      '</div>' +
      '<div class="hv__price">' + FMT.money(price, cur) + '</div>' +
      '<div class="hv__sub">' + UI.t('price.perGram') + ' · ' + UI.tr(C.metals[0].name) + '</div>' +
      '<div class="hv__chart">' + UI.sparkline(pts, up ? '#E9B949' : '#E5484D') + '</div>' +
      '<div class="hv__rows">' + rows + '</div>' +
      '<div class="hv__badge"><i>✓</i><div>' + UI.t('dash.approved') + '<small>' + UI.t('why.1.text').slice(0, 38) + '…</small></div></div>' +
    '</div>';
  }

  /* ---------------- data freshness ----------------------------------------- */
  function updateFreshness() {
    var s = PRICES.snapshot();
    var el = liveLabel;
    var foot = document.querySelector('.footer__bar span:last-child');

    if (s.source === 'live') {
      var when = new Date(s.updatedAt);
      var stamp = '\u2066' + when.toLocaleString() + '\u2069';
      if (el) el.textContent = L(FRESH.live) + ' · ' + L(FRESH.asOf) + ' ' + stamp;
      if (foot) foot.textContent = UI.t('price.updated') + ': ' + stamp;
    } else {
      if (el) el.textContent = L(FRESH.demo) + ' · ' + L(FRESH.sample);
      if (foot) foot.textContent = L(FRESH.demo);
    }
  }

  /* ---------------- master render ------------------------------------------ */
  function renderAll() {
    labels();
    renderHeroVisual();
    renderTicker();
    renderMetals();
    renderChart();
    renderCrypto();
    renderCurrency();
    renderCountries();
    recalc();
    renderNews();
    renderWhy();
    updateFreshness();
    UI.observeReveals();
  }

  function refreshLive() {
    renderHeroVisual();
    renderTicker();
    renderMetals();
    renderCrypto();
    renderCountries();
    recalc();
    updateFreshness();
  }

  /* ---------------- boot ---------------------------------------------------- */
  function boot() {
    UI.init();
    STORE.init();
    UI.mount({});

    PRICES.init().then(function () {
      renderAll();

      PRICES.onChange(refreshLive);

      // simulated market heartbeat (demo mode only)
      if (C.dataMode === 'demo') setInterval(PRICES.tick, 45000);

      // wiring
      document.getElementById('rangeTabs').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        this.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-active'); });
        b.classList.add('is-active');
        chartDays = +b.getAttribute('data-days');
        renderChart();
      });

      ['calcWeight', 'calcUnit', 'calcKarat', 'calcMetal'].forEach(function (id) {
        var el = $(id); if (el) el.addEventListener('input', recalc);
        if (el) el.addEventListener('change', recalc);
      });
      ['zakatWeight', 'zakatKarat'].forEach(function (id) {
        var el = $(id); if (el) el.addEventListener('input', recalc);
      });
      ['fxAmount'].forEach(function (id) {
        var el = $(id); if (el) el.addEventListener('input', updateFx);
      });
      ['fxFrom', 'fxTo'].forEach(function (id) {
        var el = $(id); if (el) el.addEventListener('change', updateFx);
      });

      document.addEventListener('zg:country', function () {
        renderHeroVisual(); renderTicker(); renderMetals(); renderCountries(); renderCrypto(); recalc();
        updateFx();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
