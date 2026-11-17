/* ============================================================================
   ZARGOLD — ACCOUNT (auth + customer dashboard)
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var mode = 'signin';

  var TXT = {
    sideTitle: { en: 'A verified account, a written record, and the real market price.',
                 ps: 'تصدیق شوی حساب، لیکلی تاریخ، او ریښتینې مارکېټ بیه.',
                 fa: 'حساب تأییدشده، سابقه مکتوب و قیمت واقعی بازار.' },
    f1t: { en: 'Account review', ps: 'د حساب کتنه', fa: 'بررسی حساب' },
    f1s: { en: 'Every registration is checked by our team.', ps: 'هر ثبت نام زموږ ټیم کتنې ته نیسي.', fa: 'هر ثبت‌نام توسط تیم ما بررسی می‌شود.' },
    f2t: { en: 'Transaction history', ps: 'د راکړې ورکړې تاریخ', fa: 'تاریخچه معاملات' },
    f2s: { en: 'Weight, purity, price and reference for every purchase.', ps: 'د هرې پیرود وزن، عیار، بیه او حواله.', fa: 'وزن، عیار، قیمت و مرجع هر خرید.' },
    f3t: { en: 'Private by default', ps: 'په اصل کې محرم', fa: 'به‌صورت پیش‌فرض محرمانه' },
    f3s: { en: 'Your documents and balances stay confidential.', ps: 'ستاسو اسناد او بیلانس محرم پاتې کېږي.', fa: 'اسناد و بیلانس شما محرمانه می‌ماند.' },
    account: { en: 'Account', ps: 'حساب', fa: 'حساب' },
    overview: { en: 'Overview', ps: 'لنډیز', fa: 'نمای کلی' },
    txs: { en: 'Transactions', ps: 'راکړې ورکړې', fa: 'معاملات' },
    prices: { en: 'Live prices', ps: 'ژوندې بیې', fa: 'قیمت‌های زنده' },
    since: { en: 'Member since', ps: 'غړی له', fa: 'عضو از' },
    errMissing: { en: 'Please fill in all required fields.', ps: 'مهرباني وکړئ ټول اړین ځایونه ډک کړئ.', fa: 'لطفاً همه فیلدهای لازم را پر کنید.' },
    errExists: { en: 'An account with this email already exists.', ps: 'په دې برېښنالیک سره حساب لا دمخه شته.', fa: 'حسابی با این ایمیل قبلاً وجود دارد.' },
    errNoUser: { en: 'No account found with this email.', ps: 'په دې برېښنالیک هېڅ حساب ونه موندل شو.', fa: 'حسابی با این ایمیل یافت نشد.' },
    errBadPass: { en: 'Incorrect password.', ps: 'پټنوم سم نه دی.', fa: 'رمز عبور نادرست است.' },
    errRejected: { en: 'This account was not approved. Please contact the office.', ps: 'دا حساب تایید نه شو. مهرباني وکړئ دفتر سره اړیکه ونیسئ.', fa: 'این حساب تأیید نشد. لطفاً با دفتر تماس بگیرید.' },
    created: { en: 'Account created. Our team will review it within one working day.',
               ps: 'حساب جوړ شو. زموږ ټیم به یې په یوه کاري ورځ کې وګوري.',
               fa: 'حساب ایجاد شد. تیم ما آن را در یک روز کاری بررسی می‌کند.' },
    demo: { en: 'Demo accounts', ps: 'د نمونې حسابونه', fa: 'حساب‌های نمونه' },
    invoiceTitle: { en: 'Transaction details', ps: 'د راکړې ورکړې تفصیلات', fa: 'جزئیات معامله' },
    print: { en: 'Print', ps: 'چاپ', fa: 'چاپ' }
  };
  function L(o) { return o[UI.locale] || o.en; }

  /* ---------------- auth view ---------------------------------------------- */
  function renderAuth() {
    $('authView').hidden = false;
    $('dashView').hidden = true;

    $('authEyebrow').textContent = UI.t('auth.demoHint') === 'Demo administrator' ? 'Dealer account' : 'Dealer account';
    $('authSideTitle').textContent = L(TXT.sideTitle);
    $('asF1t').textContent = L(TXT.f1t); $('asF1s').textContent = L(TXT.f1s);
    $('asF2t').textContent = L(TXT.f2t); $('asF2s').textContent = L(TXT.f2s);
    $('asF3t').textContent = L(TXT.f3t); $('asF3s').textContent = L(TXT.f3s);

    $('tabSignin').textContent = UI.t('auth.signin');
    $('tabRegister').textContent = UI.t('cta.register');
    ['tabSignin', 'tabRegister'].forEach(function (id) {
      $(id).classList.toggle('is-active', (id === 'tabSignin') === (mode === 'signin'));
    });

    $('authTitle').textContent = mode === 'signin' ? UI.t('auth.signinTitle') : UI.t('auth.registerTitle');
    $('authSub').textContent = mode === 'signin' ? UI.t('auth.signinSub') : UI.t('auth.registerSub');

    var f = '';
    if (mode === 'register') {
      f += field('name', UI.t('auth.name'), 'text', 'Ahmad Wali');
      f += field('phone', UI.t('auth.phone'), 'tel', '+93 700 000 000');
      f += field('city', UI.t('auth.city'), 'text', 'Kabul');
      f += field('email', UI.t('auth.email'), 'email', 'you@example.com');
      f += field('password', UI.t('auth.password'), 'password', '••••••••');
      f += '<button type="submit" class="btn btn--gold btn--block" style="margin-block-start:8px">' + UI.t('auth.create') + '</button>';
      f += '<p class="muted" style="font-size:11.5px;margin-block-start:14px;text-align:center">' + UI.t('auth.terms') + '</p>';
    } else {
      f += field('email', UI.t('auth.email'), 'email', 'you@example.com');
      f += field('password', UI.t('auth.password'), 'password', '••••••••');
      f += '<button type="submit" class="btn btn--gold btn--block" style="margin-block-start:8px">' + UI.t('auth.signin') + '</button>';
      f += '<p class="auth__link" style="margin-block-start:16px">' + UI.t('auth.noAccount') + ' <a href="#" data-switch="register">' + UI.t('cta.register') + '</a></p>';
    }
    $('authForm').innerHTML = f;

    var hint = '';
    if (C.dataMode === 'demo') {
      hint = '<div class="card card--flat" style="margin-block-start:22px;padding:14px 16px">' +
        '<div class="muted" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;margin-block-end:8px">' + L(TXT.demo) + '</div>' +
        '<div style="font-size:12.5px;line-height:1.9">' +
        '<div class="between"><span>Approved customer</span><span class="mono">ahmad@example.com / ahmad123</span></div>' +
        '<div class="between"><span>Pending approval</span><span class="mono">fatima@example.com / fatima123</span></div>' +
        '<div class="between"><span>Administrator</span><span class="mono">admin@zargold.af / admin123</span></div>' +
        '</div></div>';
    }
    $('authHint').innerHTML = hint;
  }

  function field(name, label, type, placeholder) {
    return '<div class="field"><label for="f_' + name + '">' + label + '</label>' +
      '<input class="input" id="f_' + name + '" name="' + name + '" type="' + type + '" placeholder="' + placeholder + '" ' +
      (type === 'password' ? 'autocomplete="current-password"' : '') + ' required></div>';
  }

  function alertHtml(kind, msg) {
    var icon = kind === 'err' ? '⚠' : (kind === 'ok' ? '✓' : 'ℹ');
    return '<div class="alert alert--' + kind + '"><span>' + icon + '</span><span>' + msg + '</span></div>';
  }

  function submitAuth(e) {
    e.preventDefault();
    var form = e.target;
    var data = {
      name: (form.name && form.name.value || '').trim(),
      email: (form.email && form.email.value || '').trim(),
      phone: (form.phone && form.phone.value || '').trim(),
      city: (form.city && form.city.value || '').trim(),
      password: (form.password && form.password.value || '')
    };

    if (mode === 'register') {
      if (!data.name || !data.email || !data.password) {
        $('authAlert').innerHTML = alertHtml('err', L(TXT.errMissing)); return;
      }
      var r = STORE.register(data);
      if (r.error === 'exists') { $('authAlert').innerHTML = alertHtml('err', L(TXT.errExists)); return; }
      if (r.error) { $('authAlert').innerHTML = alertHtml('err', L(TXT.errMissing)); return; }
      STORE.login(data.email, data.password);
      $('authAlert').innerHTML = alertHtml('ok', L(TXT.created));
      setTimeout(function () { location.href = 'account.html'; }, 900);
      return;
    }

    var res = STORE.login(data.email, data.password);
    if (res.error) {
      var map = { 'no-user': TXT.errNoUser, 'bad-pass': TXT.errBadPass, 'rejected': TXT.errRejected };
      $('authAlert').innerHTML = alertHtml('err', L(map[res.error] || TXT.errMissing));
      return;
    }
    if (res.user.role === 'admin') { location.href = 'admin.html'; return; }
    location.href = 'account.html';
  }

  /* ---------------- dashboard ---------------------------------------------- */
  function renderDash(user) {
    $('authView').hidden = true;
    $('dashView').hidden = false;

    $('sideLabel').textContent = L(TXT.account);
    $('sideDash').textContent = L(TXT.overview);
    $('sideHistory').textContent = L(TXT.txs);
    $('sidePrices').textContent = L(TXT.prices);
    $('sideLogout').textContent = UI.t('cta.logout');

    $('dashTitle').textContent = UI.t('dash.title');
    $('dashWelcome').textContent = UI.t('dash.welcome') + ', ' + user.name;
    $('dashHeadRight').innerHTML = statusPill(user.status);

    // banner
    var banner = '';
    if (user.status === 'pending') {
      banner = '<div class="alert alert--warn"><span>⏳</span><div><b>' + UI.t('dash.pending') + '</b><br>' + UI.t('dash.pendingText') + '</div></div>';
    } else if (user.status === 'rejected') {
      banner = '<div class="alert alert--err"><span>⚠</span><div><b>' + UI.t('dash.rejected') + '</b><br>' +
        UI.t('dash.rejectedText') + (user.reason ? '<br><i style="opacity:.8">' + user.reason + '</i>' : '') + '</div></div>';
    }
    $('dashAlert').innerHTML = banner;

    var tx = STORE.transactionsFor(user.id);
    var canSee = user.status === 'approved';
    var total = tx.reduce(function (s, t) { return s + (t.total || 0); }, 0);
    var last = tx.length ? tx[0].date : null;

    var kpis = [
      { l: UI.t('dash.totalBought'), v: canSee ? FMT.money(total, 'AFN') : '—', d: '' },
      { l: UI.t('dash.txCount'), v: canSee ? tx.length : '—', d: '' },
      { l: UI.t('dash.lastActivity'), v: last ? UI.dateFmt(last) : '—', d: '' },
      { l: L(TXT.since), v: UI.dateFmt(user.createdAt), d: '' }
    ];
    $('dashKpis').innerHTML = kpis.map(function (k) {
      return '<div class="kpi"><div class="kpi__l">' + k.l + '</div><div class="kpi__v">' + k.v + '</div><div class="kpi__d">' + k.d + '</div></div>';
    }).join('');

    $('historyTitle').textContent = UI.t('dash.transactions');
    $('txHead').innerHTML =
      '<th>' + UI.t('tx.ref') + '</th><th>' + UI.t('tx.date') + '</th><th>' + UI.t('tx.item') + '</th>' +
      '<th class="num">' + UI.t('tx.weight') + '</th><th class="num">' + UI.t('tx.total') + '</th>' +
      '<th>' + UI.t('tx.status') + '</th><th></th>';

    if (!canSee) {
      $('txBody').innerHTML = '<tr><td colspan="7"><div class="empty">' +
        '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>' +
        UI.t('dash.locked') + '</div></td></tr>';
      $('historyCount').textContent = '';
      return;
    }

    $('historyCount').textContent = tx.length + ' ' + UI.t('dash.txCount').toLowerCase();

    if (!tx.length) {
      $('txBody').innerHTML = '<tr><td colspan="7"><div class="empty">' + UI.t('dash.noTx') + '</div></td></tr>';
      return;
    }

    $('txBody').innerHTML = tx.map(function (t) {
      var kg = t.unit === 'gram' ? t.weight : t.weight * (C.units[t.unit] || 1);
      return '<tr>' +
        '<td class="mono" style="font-size:12.5px">' + t.ref + '</td>' +
        '<td>' + UI.dateFmt(t.date) + '</td>' +
        '<td><b>' + t.item + '</b>' + (t.karat && t.item.indexOf(t.karat + 'K') < 0 ? ' <span class="muted">· ' + t.karat + 'K</span>' : '') + '</td>' +
        '<td class="num mono">' + FMT.num(kg, UI.locale, 2) + ' g</td>' +
        '<td class="num mono">' + FMT.money(t.total, t.currency) + '</td>' +
        '<td>' + txPill(t.status) + '</td>' +
        '<td class="num"><button class="btn btn--quiet btn--sm" data-inv="' + t.id + '">' + UI.t('dash.invoice') + '</button></td>' +
      '</tr>';
    }).join('');

    $('txBody').querySelectorAll('[data-inv]').forEach(function (b) {
      b.addEventListener('click', function () { openInvoice(b.getAttribute('data-inv')); });
    });
  }

  function statusPill(s) {
    var cls = s === 'approved' ? 'approved' : (s === 'pending' ? 'pending' : 'rejected');
    var label = s === 'approved' ? UI.t('dash.approved') : (s === 'pending' ? UI.t('dash.pending') : UI.t('dash.rejected'));
    return '<span class="pill pill--' + cls + '"><i></i>' + label + '</span>';
  }
  function txPill(s) {
    return '<span class="pill pill--' + s + '"><i></i>' + UI.t('tx.status.' + s) + '</span>';
  }

  /* ---------------- invoice modal ------------------------------------------ */
  function openInvoice(id) {
    var t = STORE.transactions().filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    var kg = t.unit === 'gram' ? t.weight : t.weight * (C.units[t.unit] || 1);

    $('modalBox').innerHTML =
      '<div class="modal__head"><h3>' + L(TXT.invoiceTitle) + '</h3>' +
        '<button class="btn btn--quiet btn--sm" data-close="1">✕</button></div>' +
      '<div class="modal__body">' +
        '<div class="between" style="margin-block-end:16px"><div class="mono" style="font-size:13px">' + t.ref + '</div>' + txPill(t.status) + '</div>' +
        row(UI.t('tx.date'), UI.dateFmt(t.date)) +
        row(UI.t('tx.item'), t.item) +
        row(UI.t('tx.weight'), FMT.num(kg, UI.locale, 2) + ' g (' + t.weight + ' ' + UI.t('unit.' + t.unit) + ')') +
        row(UI.t('tx.purity'), t.purity) +
        row(UI.t('tx.method'), t.method) +
        row(UI.t('tx.note'), t.note || '—') +
        '<div class="between" style="margin-block-start:18px;padding-block-start:14px;border-block-start:1px solid var(--line)">' +
          '<b>' + UI.t('tx.total') + '</b><b style="font-size:19px;color:var(--gold-2)">' + FMT.money(t.total, t.currency) + '</b></div>' +
      '</div>' +
      '<div class="modal__foot">' +
        '<button class="btn btn--ghost btn--sm" data-close="1">' + UI.t('cta.close') + '</button>' +
        '<button class="btn btn--gold btn--sm" onclick="window.print()">' + L(TXT.print) + '</button>' +
      '</div>';

    $('modalRoot').classList.add('is-open');
    $('modalRoot').querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { $('modalRoot').classList.remove('is-open'); });
    });
  }

  function row(k, v) {
    return '<div class="between" style="padding-block:7px;font-size:13.5px"><span class="muted">' + k + '</span><span>' + v + '</span></div>';
  }

  /* ---------------- boot ---------------------------------------------------- */
  function boot() {
    UI.init();
    STORE.init();

    var hash = (location.hash || '').replace('#', '');
    if (hash === 'register') mode = 'register';

    // demo-only quick access: account.html?as=ahmad | fatima
    if (C.dataMode === 'demo') {
      var asUser = new URLSearchParams(location.search).get('as');
      var accounts = {
        ahmad: ['ahmad@example.com', 'ahmad123'],
        fatima: ['fatima@example.com', 'fatima123'],
        bilal: ['bilal@example.com', 'bilal123']
      };
      if (asUser && accounts[asUser]) STORE.login(accounts[asUser][0], accounts[asUser][1]);
    }

    var user = STORE.currentUser();

    UI.mount({ noMobileBar: true });

    if (!user) {
      renderAuth();
    } else if (user.role === 'admin') {
      location.href = 'admin.html';
    } else {
      renderDash(user);
    }

    $('authForm').addEventListener('submit', submitAuth);
    $('authTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-mode]'); if (!b) return;
      mode = b.getAttribute('data-mode');
      $('authAlert').innerHTML = '';
      renderAuth();
    });
    $('authForm').addEventListener('click', function (e) {
      var s = e.target.closest('[data-switch]'); if (!s) return;
      e.preventDefault();
      mode = s.getAttribute('data-switch');
      renderAuth();
    });
    $('sideLogout').addEventListener('click', function (e) {
      e.preventDefault(); STORE.logout(); location.href = 'index.html';
    });
    $('modalRoot').addEventListener('click', function (e) {
      if (e.target === $('modalRoot')) $('modalRoot').classList.remove('is-open');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
