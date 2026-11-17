/* ============================================================================
   ZARGOLD — ADMINISTRATION
   Account approval queue, customer directory, transaction ledger.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var view = 'overview';
  var search = '';

  function money(v) { return FMT.money(v, 'AFN'); }
  function initials(n) { return UI.initials(n); }

  /* ---------------- login --------------------------------------------------- */
  function renderLogin() {
    $('adminLogin').hidden = false;
    $('adminView').hidden = true;
    $('lgTitle').textContent = UI.t('admin.loginTitle');
    $('lgSub').textContent = UI.t('admin.loginSub');
    $('lgBtn').textContent = UI.t('auth.signin');
    $('lgHint').innerHTML = C.dataMode === 'demo'
      ? '<div class="card card--flat" style="margin-block-start:20px;padding:12px 14px;font-size:12.5px">' +
        '<span class="muted">Demo administrator:</span> <span class="mono">admin@zargold.af / admin123</span></div>'
      : '';
  }

  function doLogin(e) {
    e.preventDefault();
    var res = STORE.login($('lgEmail').value, $('lgPass').value);
    if (res.error || res.user.role !== 'admin') {
      $('lgAlert').innerHTML = '<div class="alert alert--err"><span>⚠</span><span>Invalid administrator credentials.</span></div>';
      return;
    }
    location.reload();
  }

  /* ---------------- shell --------------------------------------------------- */
  function renderShell() {
    $('adminLogin').hidden = true;
    $('adminView').hidden = false;

    $('navOverview').textContent = UI.t('admin.overview');
    $('navAccounts').childNodes[0].nodeValue = UI.t('admin.accounts') + ' ';
    $('navTx').textContent = UI.t('admin.transactions');
    $('adminLogout').textContent = UI.t('cta.logout');

    var pending = STORE.stats().pending;
    $('pendingBadge').innerHTML = pending
      ? '<span class="pill pill--pending" style="margin-inline-start:6px">' + pending + '</span>' : '';

    setView(view);
  }

  function setView(v) {
    view = v;
    ['overview', 'accounts', 'transactions'].forEach(function (x) {
      var n = { overview: 'navOverview', accounts: 'navAccounts', transactions: 'navTx' }[x];
      $(n).classList.toggle('is-active', x === v);
    });

    var titles = {
      overview: UI.t('admin.overview'),
      accounts: UI.t('admin.accounts'),
      transactions: UI.t('admin.transactions')
    };
    $('pgTitle').textContent = titles[v];
    $('pgSub').textContent = v === 'overview'
      ? 'Approve new customers and monitor the ledger.'
      : (v === 'accounts' ? 'Every registered customer and their approval status.' : 'Every purchase and sale recorded against a customer.');

    $('pgActions').innerHTML = v === 'transactions'
      ? '<button class="btn btn--gold btn--sm" id="btnAddTx">+ ' + UI.t('admin.addTx') + '</button>'
      : (v === 'accounts' ? '<button class="btn btn--ghost btn--sm" id="btnExport">Export CSV</button>' : '');

    if (v === 'transactions') {
      var b = $('btnAddTx'); if (b) b.addEventListener('click', openNewTx);
    }
    if (v === 'accounts') {
      var ex = $('btnExport'); if (ex) ex.addEventListener('click', exportCsv);
    }

    renderKpis();
    if (v === 'overview') renderOverview();
    if (v === 'accounts') renderAccounts();
    if (v === 'transactions') renderTxs();
  }

  function renderKpis() {
    var s = STORE.stats();
    var k = [
      { l: UI.t('admin.pendingCount'), v: s.pending, d: UI.t('admin.accounts') },
      { l: UI.t('admin.totalUsers'), v: s.approved, d: UI.t('dash.approved') },
      { l: UI.t('admin.totalTx'), v: s.txCount, d: '' },
      { l: UI.t('admin.volume'), v: money(s.volume), d: 'AFN' }
    ];
    $('kpis').innerHTML = k.map(function (x) {
      return '<div class="kpi"><div class="kpi__l">' + x.l + '</div><div class="kpi__v">' + x.v + '</div><div class="kpi__d">' + x.d + '</div></div>';
    }).join('');
  }

  /* ---------------- overview ------------------------------------------------ */
  function renderOverview() {
    var pending = STORE.users().filter(function (u) { return u.status === 'pending'; });
    var recent = STORE.transactions().slice(0, 6);

    var pendingHtml = pending.length
      ? pending.map(function (u) {
          return '<div class="between" style="padding:14px 20px;border-block-end:1px solid var(--line-soft)">' +
            '<div class="who"><div class="avatar">' + initials(u.name) + '</div>' +
              '<div><b>' + u.name + '</b><span>' + u.email + ' · ' + u.city + '</span></div></div>' +
            '<div class="row">' +
              '<button class="btn btn--danger btn--sm" data-reject="' + u.id + '">' + UI.t('admin.reject') + '</button>' +
              '<button class="btn btn--ok btn--sm" data-approve="' + u.id + '">' + UI.t('admin.approve') + '</button>' +
            '</div></div>';
        }).join('')
      : '<div class="empty">' + UI.t('admin.noPending') + '</div>';

    var txHtml = recent.length
      ? '<div class="tbl-wrap"><table class="tbl"><tbody>' + recent.map(function (t) {
          var u = STORE.getUser(t.userId) || { name: '—' };
          return '<tr><td class="mono" style="font-size:12px">' + t.ref + '</td>' +
            '<td>' + u.name + '</td>' +
            '<td>' + t.item + '</td>' +
            '<td class="num mono">' + FMT.money(t.total, t.currency) + '</td>' +
            '<td>' + txPill(t.status) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : '<div class="empty">' + UI.t('dash.noTx') + '</div>';

    $('viewHost').innerHTML =
      '<div class="panel" style="margin-block-end:20px">' +
        '<div class="panel__head"><span class="panel__title">' + UI.t('admin.pendingCount') + '</span>' +
        '<span class="pill pill--pending"><i></i>' + pending.length + '</span></div>' + pendingHtml + '</div>' +
      '<div class="panel"><div class="panel__head"><span class="panel__title">' + UI.t('admin.transactions') + '</span>' +
      '<button class="btn btn--quiet btn--sm" data-goto="transactions">' + UI.t('cta.seeAll') + '</button></div>' + txHtml + '</div>';

    wireRowActions();
    var go = $('viewHost').querySelector('[data-goto]');
    if (go) go.addEventListener('click', function () { setView('transactions'); });
  }

  function txPill(s) {
    return '<span class="pill pill--' + s + '"><i></i>' + (UI.t('tx.status.' + s)) + '</span>';
  }

  function wireRowActions() {
    $('viewHost').querySelectorAll('[data-approve]').forEach(function (b) {
      b.addEventListener('click', function () {
        STORE.approve(b.getAttribute('data-approve'));
        UI.toast(UI.t('admin.saved') + ' — ' + UI.t('dash.approved'), 'ok');
        renderKpis(); renderOverview(); updateBadge();
      });
    });
    $('viewHost').querySelectorAll('[data-reject]').forEach(function (b) {
      b.addEventListener('click', function () { openReject(b.getAttribute('data-reject')); });
    });
  }

  function updateBadge() {
    var p = STORE.stats().pending;
    $('pendingBadge').innerHTML = p ? '<span class="pill pill--pending" style="margin-inline-start:6px">' + p + '</span>' : '';
  }

  /* ---------------- accounts ------------------------------------------------ */
  var accFilter = 'all';

  function renderAccounts() {
    var users = STORE.users().filter(function (u) {
      if (accFilter !== 'all' && u.status !== accFilter) return false;
      if (!search) return true;
      var q = search.toLowerCase();
      return (u.name + ' ' + u.email + ' ' + u.city).toLowerCase().indexOf(q) >= 0;
    });

    var tabs = ['all', 'pending', 'approved', 'rejected'].map(function (f) {
      var label = f === 'all' ? UI.t('admin.all') : (f === 'pending' ? UI.t('dash.pending') : (f === 'approved' ? UI.t('dash.approved') : UI.t('dash.rejected')));
      return '<button data-filter="' + f + '" class="' + (accFilter === f ? 'is-active' : '') + '">' + label + '</button>';
    }).join('');

    $('viewHost').innerHTML =
      '<div class="toolbar">' +
        '<div class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>' +
        '<input class="input" id="accSearch" placeholder="' + UI.t('admin.search') + '" value="' + search + '"></div>' +
        '<div class="tabs" id="accTabs">' + tabs + '</div>' +
      '</div>' +
      '<div class="panel"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>' + UI.t('admin.customer') + '</th><th>' + UI.t('auth.city') + '</th><th>' + UI.t('admin.registered') + '</th>' +
        '<th>' + UI.t('tx.status') + '</th><th class="num">' + UI.t('admin.actions') + '</th>' +
      '</tr></thead><tbody>' +
      (users.length ? users.map(function (u) {
        var actions = u.status === 'pending'
          ? '<button class="btn btn--danger btn--sm" data-reject="' + u.id + '">' + UI.t('admin.reject') + '</button> ' +
            '<button class="btn btn--ok btn--sm" data-approve="' + u.id + '">' + UI.t('admin.approve') + '</button>'
          : (u.status === 'approved'
              ? '<button class="btn btn--quiet btn--sm" data-reject="' + u.id + '">' + UI.t('admin.reject') + '</button>'
              : '<button class="btn btn--quiet btn--sm" data-approve="' + u.id + '">' + UI.t('admin.approve') + '</button>');
        return '<tr><td><div class="who"><div class="avatar">' + initials(u.name) + '</div>' +
          '<div><b>' + u.name + '</b><span>' + u.email + '</span></div></div></td>' +
          '<td>' + (u.city || '—') + '</td>' +
          '<td>' + UI.dateFmt(u.createdAt) + '</td>' +
          '<td>' + statusPill(u.status) + '</td>' +
          '<td class="num" style="white-space:nowrap">' + actions + '</td></tr>';
      }).join('') : '<tr><td colspan="5"><div class="empty">No customers found.</div></td></tr>') +
      '</tbody></table></div></div>';

    var si = $('accSearch');
    si.addEventListener('input', function () { search = si.value; renderAccounts(); });

    $('accTabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]'); if (!b) return;
      accFilter = b.getAttribute('data-filter'); renderAccounts();
    });

    wireRowActions();
  }

  function statusPill(s) {
    var cls = s === 'approved' ? 'approved' : (s === 'pending' ? 'pending' : 'rejected');
    var label = s === 'approved' ? UI.t('dash.approved') : (s === 'pending' ? UI.t('dash.pending') : UI.t('dash.rejected'));
    return '<span class="pill pill--' + cls + '"><i></i>' + label + '</span>';
  }

  /* ---------------- transactions -------------------------------------------- */
  function renderTxs() {
    var list = STORE.transactions().filter(function (t) {
      if (!search) return true;
      var u = STORE.getUser(t.userId) || { name: '' };
      var q = search.toLowerCase();
      return (t.ref + ' ' + t.item + ' ' + u.name).toLowerCase().indexOf(q) >= 0;
    });

    $('viewHost').innerHTML =
      '<div class="toolbar">' +
        '<div class="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>' +
        '<input class="input" id="txSearch" placeholder="' + UI.t('admin.search') + '" value="' + search + '"></div>' +
      '</div>' +
      '<div class="panel"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>' + UI.t('tx.ref') + '</th><th>' + UI.t('admin.customer') + '</th><th>' + UI.t('tx.date') + '</th>' +
        '<th>' + UI.t('tx.item') + '</th><th class="num">' + UI.t('tx.weight') + '</th>' +
        '<th class="num">' + UI.t('tx.total') + '</th><th>' + UI.t('tx.status') + '</th>' +
      '</tr></thead><tbody>' +
      (list.length ? list.map(function (t) {
        var u = STORE.getUser(t.userId) || { name: '—' };
        var kg = t.unit === 'gram' ? t.weight : t.weight * (C.units[t.unit] || 1);
        return '<tr><td class="mono" style="font-size:12px">' + t.ref + '</td>' +
          '<td>' + u.name + '</td>' +
          '<td>' + UI.dateFmt(t.date) + '</td>' +
          '<td>' + t.item + '</td>' +
          '<td class="num mono">' + FMT.num(kg, UI.locale, 2) + ' g</td>' +
          '<td class="num mono">' + FMT.money(t.total, t.currency) + '</td>' +
          '<td><select class="input" data-status="' + t.id + '" style="padding:5px 8px;font-size:12px;width:auto">' +
            ['pending', 'confirmed', 'delivered', 'cancelled'].map(function (s) {
              return '<option value="' + s + '"' + (t.status === s ? ' selected' : '') + '>' + UI.t('tx.status.' + s) + '</option>';
            }).join('') +
          '</select></td></tr>';
      }).join('') : '<tr><td colspan="7"><div class="empty">' + UI.t('dash.noTx') + '</div></td></tr>') +
      '</tbody></table></div></div>';

    var si = $('txSearch');
    si.addEventListener('input', function () { search = si.value; renderTxs(); });

    $('viewHost').querySelectorAll('[data-status]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        STORE.updateTransaction(sel.getAttribute('data-status'), { status: sel.value });
        UI.toast(UI.t('admin.saved'), 'ok');
        renderKpis();
      });
    });
  }

  /* ---------------- reject modal -------------------------------------------- */
  function openReject(id) {
    var u = STORE.getUser(id);
    if (!u) return;
    $('modalBox').innerHTML =
      '<div class="modal__head"><h3>' + UI.t('admin.reject') + ' — ' + u.name + '</h3>' +
        '<button class="btn btn--quiet btn--sm" data-close="1">✕</button></div>' +
      '<div class="modal__body">' +
        '<div class="alert alert--warn"><span>⚠</span><span>' + u.email + '</span></div>' +
        '<div class="field"><label>' + UI.t('admin.rejectReason') + '</label>' +
        '<textarea class="input" id="rejectReason" rows="3" placeholder="e.g. Identification document could not be verified."></textarea></div>' +
      '</div>' +
      '<div class="modal__foot">' +
        '<button class="btn btn--ghost btn--sm" data-close="1">' + UI.t('cta.cancel') + '</button>' +
        '<button class="btn btn--danger btn--sm" id="confirmReject">' + UI.t('admin.reject') + '</button>' +
      '</div>';
    openModal();

    $('confirmReject').addEventListener('click', function () {
      STORE.reject(id, $('rejectReason').value);
      closeModal();
      UI.toast(UI.t('admin.saved'), 'ok');
      renderKpis(); updateBadge();
      if (view === 'overview') renderOverview(); else if (view === 'accounts') renderAccounts();
      else renderTxs();
    });
  }

  /* ---------------- new transaction modal ----------------------------------- */
  function openNewTx() {
    var users = STORE.users().filter(function (u) { return u.status === 'approved'; });
    var gold = PRICES.localPerGram('XAU', UI.country);

    $('modalBox').innerHTML =
      '<div class="modal__head"><h3>' + UI.t('admin.newTx') + '</h3>' +
        '<button class="btn btn--quiet btn--sm" data-close="1">✕</button></div>' +
      '<div class="modal__body">' +
        '<div class="field"><label>' + UI.t('admin.customer') + '</label><select class="input" id="txUser">' +
          users.map(function (u) { return '<option value="' + u.id + '">' + u.name + ' — ' + u.email + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field--row">' +
          '<div class="field"><label>' + UI.t('tx.item') + '</label><input class="input" id="txItem" value="Gold bar 24K"></div>' +
          '<div class="field"><label>' + UI.t('tx.purity') + '</label><input class="input" id="txPurity" value="999"></div>' +
        '</div>' +
        '<div class="field--row">' +
          '<div class="field"><label>' + UI.t('tx.weight') + '</label><input class="input" id="txWeight" type="number" value="10" step="any"></div>' +
          '<div class="field"><label>' + UI.t('calc.unit') + '</label><select class="input" id="txUnit">' +
            '<option value="gram">gram</option><option value="tola">tola</option><option value="mesghal">mesghal</option><option value="ounce">ounce</option>' +
          '</select></div>' +
        '</div>' +
        '<div class="field--row">' +
          '<div class="field"><label>' + UI.t('tx.total') + ' (AFN)</label><input class="input" id="txTotal" type="number" value="89060" step="any"></div>' +
          '<div class="field"><label>' + UI.t('tx.method') + '</label><select class="input" id="txMethod">' +
            '<option>Cash</option><option>Bank transfer</option><option>Hawala</option></select></div>' +
        '</div>' +
        '<div class="field"><label>' + UI.t('tx.status') + '</label><select class="input" id="txStatus">' +
          ['pending', 'confirmed', 'delivered'].map(function (s) { return '<option value="' + s + '">' + UI.t('tx.status.' + s) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field"><label>' + UI.t('tx.note') + '</label><input class="input" id="txNote" placeholder="Optional"></div>' +
      '</div>' +
      '<div class="modal__foot">' +
        '<button class="btn btn--ghost btn--sm" data-close="1">' + UI.t('cta.cancel') + '</button>' +
        '<button class="btn btn--gold btn--sm" id="saveTx">' + UI.t('cta.save') + '</button>' +
      '</div>';
    openModal();

    // auto-suggest total from the live price
    function suggest() {
      var w = parseFloat($('txWeight').value) || 0;
      var unit = $('txUnit').value;
      var grams = w * (C.units[unit] || 1);
      $('txTotal').value = Math.round(grams * gold);
    }
    $('txWeight').addEventListener('input', suggest);
    $('txUnit').addEventListener('change', suggest);
    suggest();

    $('saveTx').addEventListener('click', function () {
      if (!users.length) { closeModal(); return; }
      STORE.addTransaction({
        userId: $('txUser').value,
        item: $('txItem').value,
        purity: $('txPurity').value,
        weight: $('txWeight').value,
        unit: $('txUnit').value,
        total: $('txTotal').value,
        currency: 'AFN',
        method: $('txMethod').value,
        status: $('txStatus').value,
        note: $('txNote').value,
        code: $('txItem').value.toLowerCase().indexOf('silver') >= 0 ? 'XAG' : 'XAU',
        karat: 24
      });
      closeModal();
      UI.toast(UI.t('admin.saved'), 'ok');
      renderKpis(); renderTxs();
    });
  }

  function openModal() {
    $('modalRoot').classList.add('is-open');
    $('modalRoot').querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closeModal);
    });
  }
  function closeModal() { $('modalRoot').classList.remove('is-open'); }

  /* ---------------- CSV export ---------------------------------------------- */
  function exportCsv() {
    var rows = [['Name', 'Email', 'Phone', 'City', 'Status', 'Registered']];
    STORE.users().forEach(function (u) {
      rows.push([u.name, u.email, u.phone, u.city, u.status, u.createdAt]);
    });
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'zargold-customers.csv';
    a.click();
    UI.toast('CSV exported', 'ok');
  }

  /* ---------------- boot ---------------------------------------------------- */
  function boot() {
    UI.init();
    STORE.init();

    // demo-only quick access: admin.html?as=admin
    if (C.dataMode === 'demo' && new URLSearchParams(location.search).get('as') === 'admin') {
      STORE.login(C.demoAdmin.email, C.demoAdmin.password);
    }

    var user = STORE.currentUser();
    UI.mount({ noMobileBar: true });

    if (!user || user.role !== 'admin') {
      renderLogin();
      $('lgForm').addEventListener('submit', doLogin);
    } else {
      renderShell();
    }

    document.querySelectorAll('[data-view]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        search = '';
        setView(a.getAttribute('data-view'));
      });
    });
    $('adminLogout').addEventListener('click', function (e) {
      e.preventDefault(); STORE.logout(); location.href = 'index.html';
    });
    $('modalRoot').addEventListener('click', function (e) {
      if (e.target === $('modalRoot')) closeModal();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
