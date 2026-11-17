# ZarGold — Gold & Crypto Price Platform

A complete, working demonstration build for a gold dealer in Afghanistan:
live market prices in three languages, verified customer accounts, an approval
workflow, and a transaction ledger.

**No installation, no build step, no internet required.** Open `index.html` in
Chrome and the whole platform runs.

---

## Pages

| File | What it is |
|---|---|
| `index.html` | Public website — hero, live prices, charts, crypto, currency, countries, calculators, insights |
| `account.html` | Customer sign-in, registration and personal dashboard |
| `admin.html` | Administration — approval queue, customer directory, transaction ledger |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Approved customer (has 4 transactions) | `ahmad@example.com` | `ahmad123` |
| Pending approval | `fatima@example.com` | `fatima123` |
| Administrator | `admin@zargold.af` | `admin123` |

Quick preview links (demo mode only):

- Customer dashboard — `account.html?as=ahmad`
- Pending-account view — `account.html?as=fatima`
- Admin panel — `admin.html?as=admin`
- Pashto site — `index.html?lang=ps`
- Dari site — `index.html?lang=fa`

---

## What works right now

- Full trilingual interface (English / Pashto / Dari) with true right-to-left layout
- Language switcher in the header, remembered between visits
- Prices per gram, tola, mesghal and ounce, converted to AFN with a dealer premium
- Country selector (Afghanistan primary + 7 other countries), province price cards
- 7 / 30 / 90-day charts, gold and silver calculator, zakat calculator
- Currency converter with live rate table
- Customer registration → admin approval → rejection with written reason
- Transaction ledger: record a purchase, change its status, printable invoice
- CSV export of the customer list
- All data persists in the browser (localStorage)

---

## Rebranding

Everything is driven by **`assets/js/config.js`**:

- `brand` — name, initials, tagline, phone, WhatsApp, email, address, hours
- `countries` — which countries appear; `defaultCountry`
- `metals` / `crypto` — which instruments are listed
- `features` — turn accounts, approval, charts, calculators or news on and off
- `dataMode` — `'demo'` or `'live'`
- `live` — API endpoints and keys

Change that one file and the whole platform rebrands.

---

## Live prices (currently switched on)

`dataMode` is already set to `'live'` and a MetalpriceAPI key is configured, so
these are **real market prices**, not samples:

| Provider | Data | Update frequency |
|---|---|---|
| MetalpriceAPI | Gold, silver, platinum, palladium | **Daily close on the free plan**; every 5 minutes on the paid plan |
| CoinGecko (keyless) | 10 cryptocurrencies | ~1 minute |
| ExchangeRate-API (keyless) | USD → AFN and other currencies | Daily |

The site always shows the true data timestamp next to the "Live data" badge and
in the footer, so nobody is misled about freshness.

### Running it

Live mode must be served over HTTP — browsers block API calls from `file://`:

```
node serve.mjs          # http://127.0.0.1:4173
node serve.mjs 8080     # custom port
```

Opening `index.html` directly still works, but it will fall back to the sample
prices because the API calls are blocked.

### Free-plan quota

The free plan allows **100 requests/month**. To protect it, live responses are
cached in the browser for **12 hours** (`liveCacheMinutes: 720`), which is about
60 metal calls a month. Lower that value once a paid plan is active — the paid
Basic Plus plan ($20/month) gives 5-minute updates and 50,000 calls.

### ⚠️ About the API key

The key sits in `config.js`, which every visitor can read. That is normal for a
front-end-only build, but anyone can copy it and spend your quota. For a paid
key, move the calls behind a small server endpoint that holds the key privately.
The free key shipped here is low risk, but rotate it before going public.


---

## What is demonstration-only

This build proves the product and the workflow. Before it handles real customers:

| Demo behaviour | Production requirement |
|---|---|
| Accounts stored in `localStorage` | Server-side database (Postgres) |
| Passwords base64-encoded | Hashed with bcrypt/argon2 |
| No real email sent | Transactional email (Resend/Postmark) |
| Approval handled in one browser | Shared database, so staff and customers see the same state |
| No document upload | TCA/KYC document upload with private storage |
| Client-side only | Server-side API with authentication and audit log |

The data layer is deliberately isolated in `assets/js/store.js`, with the same
function signatures a REST API would expose (`register`, `login`, `approve`,
`reject`, `addTransaction`, `updateTransaction`). Swapping it for real endpoints
is a contained change — the UI does not need to be rewritten.

---

## Files

```
zargold/
  index.html              public website
  account.html            customer portal
  admin.html              administration
  assets/
    css/app.css           design system (dark + gold, RTL-aware)
    js/config.js          white-label configuration
    js/i18n.js            English / Pashto / Dari dictionary
    js/prices.js          price engine + live API adapters
    js/store.js           accounts, approvals, transactions
    js/ui.js              header, footer, charts, toasts
    js/app.js             public site controller
    js/account.js         auth + dashboard
    js/admin.js           admin panel
  preview-*.png           rendered screenshots
```

---

## Before launch

1. Replace the placeholder brand details in `config.js`.
2. Have a native speaker review the Pashto and Dari text, especially the legal and financial wording.
3. Confirm the legal entity name and the price disclaimer with the dealer's lawyer.
4. Decide who maintains the local Kabul (sarrafi) rate, and how often.
5. Move the data layer to a real database and add hashed passwords.
