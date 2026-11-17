/* ============================================================================
   ZARGOLD — DATA STORE (client demo)
   ----------------------------------------------------------------------------
   Persists users, approval state, transactions and the email log in
   localStorage so the whole workflow can be demonstrated with no server.

   Production replacement: the same function signatures map 1:1 onto a REST
   API (POST /auth/register, PATCH /admin/users/:id/approve, POST /transactions).
   Only this file changes.
   ========================================================================== */

(function () {
  'use strict';

  var KEY = 'zargold.v2';
  var db = { users: [], transactions: [], emails: [], session: null, seq: 1000 };

  /* ---------------- demo passwords ---------------------------------------- */
  function hash(s) { return btoa(unescape(encodeURIComponent('zg$' + s))); }

  /* ---------------- persistence ------------------------------------------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) db = JSON.parse(raw);
    } catch (e) { /* ignore */ }
    if (!db.users.length) seed();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }

  /* ---------------- seed data --------------------------------------------- */
  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(10 + (n % 6), 15, 0, 0);
    return d.toISOString();
  }

  function seed() {
    db.users = [
      {
        id: 'usr_ahmad', role: 'customer', name: 'Ahmad Wali Karimi',
        email: 'ahmad@example.com', phone: '+93 700 112 233', city: 'Kabul',
        pass: hash('ahmad123'), status: 'approved',
        createdAt: daysAgo(64), decidedAt: daysAgo(63), reason: ''
      },
      {
        id: 'usr_fatima', role: 'customer', name: 'Fatima Noori',
        email: 'fatima@example.com', phone: '+93 744 556 677', city: 'Herat',
        pass: hash('fatima123'), status: 'pending',
        createdAt: daysAgo(1), decidedAt: null, reason: ''
      },
      {
        id: 'usr_bilal', role: 'customer', name: 'Bilal Sadat',
        email: 'bilal@example.com', phone: '+93 788 990 011', city: 'Mazar-i-Sharif',
        pass: hash('bilal123'), status: 'pending',
        createdAt: daysAgo(0), decidedAt: null, reason: ''
      },
      {
        id: 'usr_sara', role: 'customer', name: 'Sara Ahmadi',
        email: 'sara@example.com', phone: '+93 707 334 455', city: 'Kandahar',
        pass: hash('sara123'), status: 'rejected',
        createdAt: daysAgo(9), decidedAt: daysAgo(8),
        reason: 'Identification document could not be verified.'
      }
    ];

    db.transactions = [
      { id: 'tx_1', ref: 'ZG-2026-0101', userId: 'usr_ahmad', date: daysAgo(58), type: 'buy',
        code: 'XAU', item: 'Gold bar 24K', karat: 24, weight: 50, unit: 'gram', purity: '999',
        unitPrice: 0, total: 418500, currency: 'AFN', method: 'Bank transfer', status: 'delivered',
        note: 'Delivered in person, Kabul office.' },
      { id: 'tx_2', ref: 'ZG-2026-0102', userId: 'usr_ahmad', date: daysAgo(41), type: 'buy',
        code: 'XAU', item: 'Gold coins 22K', karat: 22, weight: 2, unit: 'tola', purity: '916',
        unitPrice: 0, total: 179200, currency: 'AFN', method: 'Hawala', status: 'delivered',
        note: '' },
      { id: 'tx_3', ref: 'ZG-2026-0103', userId: 'usr_ahmad', date: daysAgo(23), type: 'buy',
        code: 'XAG', item: 'Silver bar', karat: 0, weight: 500, unit: 'gram', purity: '999',
        unitPrice: 0, total: 54800, currency: 'AFN', method: 'Cash', status: 'delivered',
        note: '' },
      { id: 'tx_4', ref: 'ZG-2026-0104', userId: 'usr_ahmad', date: daysAgo(3), type: 'buy',
        code: 'XAU', item: 'Gold bar 24K', karat: 24, weight: 25, unit: 'gram', purity: '999',
        unitPrice: 0, total: 221250, currency: 'AFN', method: 'Bank transfer', status: 'confirmed',
        note: 'Awaiting collection.' }
    ];
    db.emails = [
      { id: 'em_1', to: 'fatima@example.com', subject: 'Your ZarGold account is under review', at: daysAgo(1), kind: 'pending' },
      { id: 'em_2', to: 'sara@example.com', subject: 'Your registration was not approved', at: daysAgo(8), kind: 'rejected' }
    ];
    db.session = null;
    db.seq = 200;
    save();
  }

  /* ---------------- users -------------------------------------------------- */
  function uid() { db.seq++; return 'usr_' + db.seq.toString(36) + Date.now().toString(36).slice(-3); }
  function txid() { db.seq++; return 'tx_' + Date.now().toString(36) + db.seq.toString(36); }

  function register(data) {
    var email = (data.email || '').trim().toLowerCase();
    if (!email || !data.password || !data.name) return { error: 'missing' };
    if (db.users.some(function (u) { return u.email.toLowerCase() === email; })) return { error: 'exists' };

    var user = {
      id: uid(), role: 'customer', name: data.name.trim(), email: email,
      phone: (data.phone || '').trim(), city: data.city || '',
      pass: hash(data.password), status: window.CONFIG.features.adminApproval ? 'pending' : 'approved',
      createdAt: new Date().toISOString(), decidedAt: null, reason: ''
    };
    db.users.push(user);
    mail(user.email, 'Account created — under review', 'pending');
    save();
    return { user: user };
  }

  function login(email, password) {
    email = (email || '').trim().toLowerCase();

    // demo administrator
    var A = window.CONFIG.demoAdmin;
    if (email === A.email.toLowerCase() && password === A.password) {
      var admin = db.users.find(function (u) { return u.role === 'admin'; });
      if (!admin) {
        admin = { id: 'usr_admin', role: 'admin', name: A.name, email: A.email, phone: '', city: 'Kabul',
                  pass: hash(A.password), status: 'approved', createdAt: daysAgo(90), decidedAt: daysAgo(90), reason: '' };
        db.users.push(admin);
      }
      db.session = admin.id; save();
      return { user: admin };
    }

    var u = db.users.find(function (x) { return x.email.toLowerCase() === email; });
    if (!u) return { error: 'no-user' };
    if (u.pass !== hash(password)) return { error: 'bad-pass' };
    if (u.status === 'rejected') return { error: 'rejected' };
    db.session = u.id; save();
    return { user: u };
  }

  function logout() { db.session = null; save(); }
  function currentUser() { return db.users.find(function (u) { return u.id === db.session; }) || null; }
  function users() { return db.users.filter(function (u) { return u.role === 'customer'; }); }
  function getUser(id) { return db.users.find(function (u) { return u.id === id; }) || null; }

  function approve(id) {
    var u = getUser(id); if (!u) return;
    u.status = 'approved'; u.decidedAt = new Date().toISOString(); u.reason = '';
    mail(u.email, 'Your ZarGold account has been approved', 'approved');
    save();
  }
  function reject(id, reason) {
    var u = getUser(id); if (!u) return;
    u.status = 'rejected'; u.decidedAt = new Date().toISOString(); u.reason = reason || '';
    mail(u.email, 'Your registration was not approved', 'rejected');
    save();
  }

  /* ---------------- transactions ------------------------------------------ */
  function transactions() {
    return db.transactions.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  }
  function transactionsFor(userId) {
    return transactions().filter(function (t) { return t.userId === userId; });
  }
  function nextRef() {
    var n = db.transactions.length + 105;
    return 'ZG-' + new Date().getFullYear() + '-' + String(n).padStart(4, '0');
  }
  function addTransaction(data) {
    var t = {
      id: txid(), ref: nextRef(), userId: data.userId,
      date: data.date || new Date().toISOString(),
      type: data.type || 'buy', code: data.code || 'XAU',
      item: data.item || '', karat: +data.karat || 0,
      weight: +data.weight || 0, unit: data.unit || 'gram', purity: data.purity || '999',
      unitPrice: +data.unitPrice || 0, total: +data.total || 0,
      currency: data.currency || 'AFN', method: data.method || 'Cash',
      status: data.status || 'confirmed', note: data.note || ''
    };
    db.transactions.push(t);
    mail(getUser(t.userId) ? getUser(t.userId).email : '', 'Transaction ' + t.ref + ' recorded', 'tx');
    save();
    return t;
  }
  function updateTransaction(id, patch) {
    var t = db.transactions.find(function (x) { return x.id === id; });
    if (t) { Object.assign(t, patch); save(); }
    return t;
  }

  /* ---------------- simulated email ---------------------------------------- */
  function mail(to, subject, kind) {
    db.emails.unshift({ id: 'em_' + Date.now().toString(36), to: to, subject: subject, at: new Date().toISOString(), kind: kind });
    if (db.emails.length > 40) db.emails.length = 40;
  }
  function emails() { return db.emails; }

  /* ---------------- stats -------------------------------------------------- */
  function stats() {
    var customers = users();
    var approved = customers.filter(function (u) { return u.status === 'approved'; }).length;
    var pending = customers.filter(function (u) { return u.status === 'pending'; }).length;
    var active = db.transactions.filter(function (t) { return t.status !== 'cancelled'; });
    var volume = active.reduce(function (s, t) { return s + (t.total || 0); }, 0);
    return {
      total: customers.length, approved: approved, pending: pending,
      rejected: customers.filter(function (u) { return u.status === 'rejected'; }).length,
      txCount: active.length, volume: volume
    };
  }

  function reset() { localStorage.removeItem(KEY); db = { users: [], transactions: [], emails: [], session: null, seq: 1000 }; seed(); }

  window.STORE = {
    init: load, register: register, login: login, logout: logout,
    currentUser: currentUser, users: users, getUser: getUser,
    approve: approve, reject: reject,
    transactions: transactions, transactionsFor: transactionsFor,
    addTransaction: addTransaction, updateTransaction: updateTransaction,
    emails: emails, stats: stats, reset: reset
  };
})();
