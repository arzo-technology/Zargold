/* ============================================================================
   ZARGOLD — WHITE-LABEL CONFIGURATION
   ----------------------------------------------------------------------------
   This is the ONLY file you need to edit to rebrand the whole platform for a
   different gold dealer. Brand, contact details, countries, metals, coins,
   feature switches and API endpoints all live here.

   dataMode:
     'demo' -> deterministic sample prices, works fully offline (bid preview)
     'live' -> calls the providers configured in CONFIG.live (production)
   ========================================================================== */

window.CONFIG = {
  brand: {
    name:     { en: 'ZarGold', ps: 'زرګولډ', fa: 'زرگلد' },
    initials: 'ZG',
    tagline:  {
      en: 'Live gold, silver and crypto prices for Afghanistan',
      ps: 'د افغانستان لپاره د سرو زرو، سپینو زرو او کریپټو ژوندې بیې',
      fa: 'قیمت‌های زنده طلا، نقره و کریپتو برای افغانستان'
    },
    legalName: 'ZarGold Exchange Ltd.',
    phone:     '+93 700 000 000',
    whatsapp:  '93700000000',
    email:     'hello@zargold.af',
    address: {
      en: 'Sarai Shahzada, Kabul, Afghanistan',
      ps: 'سرای شهزاده، کابل، افغانستان',
      fa: 'سرای شهزاده، کابل، افغانستان'
    },
    hours: { en: 'Sat–Thu, 8:00 – 17:00', ps: 'شنبه–پنجشنبه، ۸:۰۰ – ۱۷:۰۰', fa: 'شنبه–پنجشنبه، ۸:۰۰ – ۱۷:۰۰' }
  },

  /* ---------- Localisation -------------------------------------------------- */
  defaultLocale: 'en',
  locales: ['en', 'ps', 'fa'],
  rtlLocales: ['ps', 'fa'],

  /* ---------- Market scope --------------------------------------------------
     Afghanistan is the primary market. Other countries are fully supported and
     are listed here — remove entries to narrow the site, or extend the array.
     ------------------------------------------------------------------------ */
  defaultCountry: 'AF',
  countries: [
    { code: 'AF', currency: 'AFN', decimals: 0, unit: 'gram',
      name: { en: 'Afghanistan', ps: 'افغانستان', fa: 'افغانستان' },
      cities: { en: ['Kabul', 'Herat', 'Kandahar', 'Mazar-i-Sharif', 'Jalalabad', 'Kunduz', 'Ghazni'],
                ps: ['کابل', 'هرات', 'کندهار', 'مزار شریف', 'جلال آباد', 'کندز', 'غزني'],
                fa: ['کابل', 'هرات', 'قندهار', 'مزار شریف', 'جلال‌آباد', 'کندز', 'غزنی'] } },

    { code: 'PK', currency: 'PKR', decimals: 0, unit: 'tola',
      name: { en: 'Pakistan', ps: 'پاکستان', fa: 'پاکستان' },
      cities: { en: ['Peshawar', 'Quetta', 'Lahore', 'Karachi', 'Islamabad'],
                ps: ['پېښور', 'کوټه', 'لاهور', 'کراچي', 'اسلام آباد'],
                fa: ['پشاور', 'کویته', 'لاهور', 'کراچی', 'اسلام‌آباد'] } },

    { code: 'AE', currency: 'AED', decimals: 2, unit: 'gram',
      name: { en: 'United Arab Emirates', ps: 'متحده عربي امارات', fa: 'امارات متحده عربی' },
      cities: { en: ['Dubai', 'Abu Dhabi', 'Sharjah'], ps: ['دوبۍ', 'ابوظبي', 'شارجه'], fa: ['دبی', 'ابوظبی', 'شارجه'] } },

    { code: 'SA', currency: 'SAR', decimals: 2, unit: 'gram',
      name: { en: 'Saudi Arabia', ps: 'سعودي عربستان', fa: 'عربستان سعودی' },
      cities: { en: ['Riyadh', 'Jeddah', 'Mecca'], ps: ['ریاض', 'جده', 'مکه'], fa: ['ریاض', 'جده', 'مکه'] } },

    { code: 'TR', currency: 'TRY', decimals: 0, unit: 'gram',
      name: { en: 'Türkiye', ps: 'ترکیه', fa: 'ترکیه' },
      cities: { en: ['Istanbul', 'Ankara', 'Izmir'], ps: ['استانبول', 'انقره', 'ازمر'], fa: ['استانبول', 'آنکارا', 'ازمیر'] } },

    { code: 'IR', currency: 'IRR', decimals: 0, unit: 'gram',
      name: { en: 'Iran', ps: 'ایران', fa: 'ایران' },
      cities: { en: ['Tehran', 'Mashhad', 'Isfahan'], ps: ['تهران', 'مشهد', 'اصفهان'], fa: ['تهران', 'مشهد', 'اصفهان'] } },

    { code: 'IN', currency: 'INR', decimals: 0, unit: 'gram',
      name: { en: 'India', ps: 'هند', fa: 'هند' },
      cities: { en: ['Delhi', 'Mumbai', 'Jaipur'], ps: ['دهلی', 'ممبای', 'جیپور'], fa: ['دهلی', 'مومبای', 'جیپور'] } },

    { code: 'US', currency: 'USD', decimals: 2, unit: 'ounce',
      name: { en: 'United States', ps: 'متحده ایالات', fa: 'ایالات متحده' },
      cities: { en: ['New York', 'Chicago', 'Los Angeles'], ps: ['نیویارک', 'شیکاګو', 'لاس انجلس'], fa: ['نیویورک', 'شیکاگو', 'لس‌آنجلس'] } }
  ],

  /* ---------- Dealer premium -----------------------------------------------
     Percentage added on top of the international spot price, because a sarraf
     in Kabul sells above the world price. Set AF to 0 to show pure spot.
     This is the main reason your figure differs from international sites. */
  dealerPremium: { AF: 0.015, default: 0.008, silver: 0.02 },

  /* ---------- Units -------------------------------------------------------- */
  units: {
    ounce:   31.1034768,
    tola:    11.6638038,
    mesghal: 4.6083,
    gram:    1
  },

  /* ---------- Metals ------------------------------------------------------- */
  metals: [
    { code: 'XAU', symbol: 'Au', purity: '999', karats: [24, 22, 21, 18, 14],
      name: { en: 'Gold', ps: 'سره زر', fa: 'طلا' }, accent: '#E9B949' },
    { code: 'XAG', symbol: 'Ag', purity: '999', karats: [],
      name: { en: 'Silver', ps: 'سپین زر', fa: 'نقره' }, accent: '#C9D3DF' },
    { code: 'XPT', symbol: 'Pt', purity: '950', karats: [],
      name: { en: 'Platinum', ps: 'پلاټینم', fa: 'پلاتین' }, accent: '#A9B7C6' },
    { code: 'XPD', symbol: 'Pd', purity: '950', karats: [],
      name: { en: 'Palladium', ps: 'پالاډیم', fa: 'پالادیوم' }, accent: '#B8AFA4' }
  ],

  /* ---------- Crypto ------------------------------------------------------- */
  // 'cg' is the CoinGecko id used for live prices (they differ from tickers).
  crypto: [
    { code: 'BTC',  name: 'Bitcoin',  cg: 'bitcoin',           color: '#F7931A', glyph: '₿' },
    { code: 'ETH',  name: 'Ethereum', cg: 'ethereum',          color: '#627EEA', glyph: 'Ξ' },
    { code: 'USDT', name: 'Tether',   cg: 'tether',            color: '#26A17B', glyph: '₮' },
    { code: 'BNB',  name: 'BNB',      cg: 'binancecoin',       color: '#F3BA2F', glyph: 'B' },
    { code: 'SOL',  name: 'Solana',   cg: 'solana',            color: '#9945FF', glyph: 'S' },
    { code: 'XRP',  name: 'XRP',      cg: 'ripple',            color: '#23292F', glyph: 'X' },
    { code: 'ADA',  name: 'Cardano',  cg: 'cardano',           color: '#0033AD', glyph: 'A' },
    { code: 'TRX',  name: 'TRON',     cg: 'tron',              color: '#EF0027', glyph: 'T' },
    { code: 'TON',  name: 'Toncoin',  cg: 'the-open-network',  color: '#0098EA', glyph: '◈' },
    { code: 'DOGE', name: 'Dogecoin', cg: 'dogecoin',          color: '#C2A633', glyph: 'Ð' }
  ],

  /* ---------- Feature switches --------------------------------------------- */
  features: {
    accounts:       true,   // customer registration
    adminApproval:  true,   // new accounts require approval
    transactions:   true,   // purchase ledger
    crypto:         true,
    countries:      true,
    calculators:    true,
    charts:         true,
    news:           true
  },

  /* ---------- Demo preview links -------------------------------------------
     Lets you open account.html?as=ahmad or admin.html?as=admin to jump
     straight into a dashboard for a presentation.
     THIS IS A LOGIN BYPASS. Set it to false before real customers exist. */
  devPreview: true,

  /* ---------- Data mode & providers --------------------------------------- */
  dataMode: 'live',            // 'demo' | 'live'
  refreshSeconds: 60,          // UI refresh cadence
  // Live responses are cached in the browser for this long.
  // The free MetalpriceAPI plan allows 100 requests/month and publishes ONE
  // close per day (23:59 UTC), so 8 hours ≈ 90 calls/month: comfortably inside
  // the quota while picking up each new daily close the same morning.
  // For real 5-minute prices you need the paid plan, then set this to 5.
  liveCacheMinutes: 480,
  live: {
    metals: {
      url: 'https://api.metalpriceapi.com/v1/latest',
      key: 'e43b2052242881087bc9f5f9e46280ee',
      currencies: 'XAU,XAG,XPT,XPD,AFN'
    },
    crypto: {
      url: 'https://api.coingecko.com/api/v3/simple/price',
      vs: 'usd'
    },
    fx: { url: 'https://open.er-api.com/v6/latest/USD' }
  },

  /* ---------- Demo-only admin credentials --------------------------------- */
  demoAdmin: { email: 'admin@zargold.af', password: 'admin123', name: 'Site Administrator' }
};
