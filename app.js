/* مزرعة الملاك ميخائيل – ديروط: واجهة الأب (عربي / English) */
'use strict';

// ===================== التخزين =====================
const store = {
  get(k, d) { try { const v = localStorage.getItem('amf_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('amf_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  del(k) { try { localStorage.removeItem('amf_' + k); } catch (e) { /* ignore */ } },
};

// ===================== اللغة =====================
let LANG = store.get('lang', 'ar');
const STR = {
  ar: {
    loading: 'بيحمّل…', syncing: 'بيحدّث…', back: 'رجوع', connErr: 'مشكلة في الاتصال', retry: 'جرّب تاني', settings: 'الإعدادات',
    badResp: 'السيرفر رد برد مش مفهوم. اتأكد من لينك السكريبت.', genericErr: 'حصل خطأ', cantRefresh: 'مش قادر يحدّث دلوقتي: ',
    tabHome: 'الرئيسية', tabHoshas: 'الحوش', tabJournal: 'السجل', tabPartners: 'الشركاء', newEntry: 'تسجيل حركة جديدة',
    farm: 'مزرعة الملاك ميخائيل', place: 'ديروط', hello: 'أهلاً', helloName: 'أهلاً يا ', install: 'تثبيت الأب',
    installPhone: 'تثبيت الأب على الموبايل', installHint: 'من قايمة ⋮ في Chrome اختار "Install app" أو "Add to Home screen"',
    apiUrl: 'لينك السكريبت (Web app URL)', secret: 'الكود السري', yourName: 'اسمك (بيتسجل مع كل حركة)', namePh: 'مثال: كيرلس',
    enter: 'ادخل', saveTest: 'حفظ واختبار الاتصال', testing: 'بيختبر الاتصال…', connected: 'تم الاتصال بالشيت',
    setupSub: 'أول مرة بس: دخّل لينك السكريبت والكود السري',
    setupHint: 'اللينك والكود بيتحفظوا على الموبايل ده بس. اللينك بتاخده من Apps Script بعد ما تعمل Deploy، والكود هو اللي حددته من قايمة "الأب" في الشيت.',
    reloadLists: 'تحديث القوائم من الشيت', listsUpdated: 'القوائم اتحدثت', logout: 'خروج من الموبايل ده', language: 'اللغة',
    plots: n => `${n} حوش`, feddan: 'فدان', year: 'السنة', yearCost: y => `تكلفة سنة ${y}`, egp: 'ج.م',
    sinceStart: 'التكلفة منذ البداية', perFeddanShort: 'الفدان', cash: 'رصيد الخزنة', yearSales: 'مبيعات السنة',
    partnerBalance: 'ميزان الشركاء', details: 'التفاصيل', monthlyCost: 'التكلفة الشهرية', changingYear: 'بيغيّر السنة…',
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    setupChip: 'تأسيس', producing: 'منتجة', perFeddanUnit: '/ فدان', totalSetup: 'إجمالي تكلفة التأسيس', avgFeddan: 'متوسط الفدان',
    plotsHint: 'الأرقام هنا تراكمية من أول التأسيس، وشاملة نصيب كل حوشة من المصروفات المشتركة وإهلاك الأصول.',
    crop: 'المحصول', variety: 'الصنف', notSet: 'لم يُحدد', sharedPct: 'نصيبها من المشترك', costToDate: 'التكلفة حتى اليوم',
    costPerFeddan: 'تكلفة الفدان', byItem: 'التكلفة حسب البند', noCosts: 'لسه مفيش مصروفات على الحوشة دي', recent: 'آخر الحركات',
    sharedTag: 'نصيب من مشترك', noMoves: 'مفيش حركات',
    newTitle: 'تسجيل جديد', expense: 'مصروف', expenseSub: 'على حوشة أو مشترك، وبيتخصم من الخزنة',
    move: 'حركة شريك', moveSub: 'توريد للخزنة، سحب، أو تسوية بين الشريكين', sale: 'بيع محصول', saleSub: 'والفلوس راحت الخزنة ولا اتوزعت',
    asset: 'أصل ثابت', assetSub: 'بير، طلمبة، سور، ماشيات… بيتهلك على الحوش',
    saving: 'بيحفظ…', saved: 'اتسجّل بنجاح', fromCash: 'من الخزنة', paidOwn: p => `${p} دفع من جيبه`, alreadyRecorded: 'اتسجل في المصروفات قبل كده',
    addExpense: 'تسجيل مصروف', date: 'التاريخ', amount: 'المبلغ (ج.م)', item: 'البند', chargeTo: 'يتحمّل على', specificPlot: 'حوشة محددة',
    sharedArea: 'مشترك (يتوزع بالمساحة)', whoPaid: 'مين دفع؟', supplier: 'المورد / المقاول', supplierPh: 'اختار أو اكتب اسم',
    desc: 'البيان', descPh: 'مثال: تسوية بالليزر', docNo: 'رقم الفاتورة / الإيصال', saveExpense: 'حفظ المصروف',
    cashHint: 'المصروف بيتخصم من الخزنة. فلوس الشركاء بتدخل الخزنة من "حركة شريك ← توريد للخزنة".', enterAmount: 'اكتب المبلغ',
    partner: 'الشريك', moveType: 'نوع الحركة', depositTxt: 'توريد فلوس للخزنة', withdrawTxt: 'سحب فلوس من الخزنة',
    settleTxt: 'دفع للشريك التاني مباشرة (تسوية)', descPh2: 'مثال: تحويل بنكي',
    settleHint: 'التسوية بتتسجل على الاتنين مرة واحدة: على اللي دفع كمدفوعة، وعلى التاني كمستلمة.', saveMove: 'حفظ الحركة',
    plot: 'الحوشة', cropName: 'المحصول', buyer: 'التاجر', qty: 'الكمية (كجم)', price: 'السعر (ج/كجم)', saleTotal: 'إجمالي البيعة',
    whereMoney: 'الفلوس راحت فين؟', toCash: 'دخلت خزنة المزرعة', toSplit: 'اتوزعت على الشريكين حسب النسبة',
    toPartner: p => `استلمها ${p} كلها`, toMixed: 'جزء للخزنة والباقي اتوزع', toBoxAmt: 'المبلغ اللي دخل الخزنة',
    impact: 'الأثر على ميزان الشركاء', notes: 'ملاحظات', saveSale: 'حفظ البيعة', enterQtyPrice: 'اكتب الكمية والسعر',
    assetName: 'الأصل', assetPh: 'مثال: بير ارتوازي، طلمبة، سور', startDate: 'تاريخ التشغيل', life: 'العمر (سنوات)', cost: 'التكلفة (ج.م)',
    allPlots: 'كل الحوش (مشترك بالمساحة)', paidFrom: 'الفلوس اتدفعت منين؟', supplierOnly: 'المورد',
    assetHint: 'تمن الأصل بيتخصم من الخزنة ويتسجل في اليومية، وبعدين بيتهلك كل شهر على عمره والإهلاك بيتوزع على الحوش.',
    saveAsset: 'حفظ الأصل', enterAssetName: 'اكتب اسم الأصل', enterCostLife: 'اكتب التكلفة والعمر',
    journal: 'السجل', refresh: 'تحديث', kExpense: 'مصروف', kMove: 'شريك', kSale: 'بيع', saleOf: 'بيع', cropDefault: 'محصول',
    noEntries: 'لسه مفيش حركات. ابدأ من زرار + تحت.', editInSheet: 'التعديل والمسح بيتعملوا من الشيت نفسه.',
    partners: 'الشركاء', contributions: 'توريدات للخزنة', outOfPocket: 'مدفوع من جيبه', settlementsPaid: 'تسويات دفعها',
    withdrawals: 'سحب من الخزنة', settlementsReceived: 'تسويات استلمها', salesReceived: 'مبيعات استلمها', salesShare: 'نصيبه من مبيعات موزعة',
    net: 'صافي المدفوع', fair: 'المفروض حسب النسبة', addMoveBtn: 'تسجيل توريد أو تسوية',
    isOwed: 'له', owes: 'عليه', even: 'متساوي', settledAll: 'الشريكين متساويين، مفيش تسوية مطلوبة',
    settleSentence: (payer, recv, a, b) => `${payer} يدفع ${a} ج.م لـ${recv} مباشرة، أو يورّد ${b} ج.م للخزنة، عشان الاتنين يتساووا`,
  },
  en: {
    loading: 'Loading…', syncing: 'Updating…', back: 'Back', connErr: 'Connection problem', retry: 'Try again', settings: 'Settings',
    badResp: 'Unexpected server response. Check the script link.', genericErr: 'Something went wrong', cantRefresh: "Couldn't refresh: ",
    tabHome: 'Home', tabHoshas: 'Plots', tabJournal: 'Log', tabPartners: 'Partners', newEntry: 'New entry',
    farm: 'Angel Michael Farm', place: 'Dayrut', hello: 'Hello', helloName: 'Hello, ', install: 'Install app',
    installPhone: 'Install app on this phone', installHint: 'In the Chrome ⋮ menu choose "Install app" or "Add to Home screen"',
    apiUrl: 'Script link (Web app URL)', secret: 'Secret code', yourName: 'Your name (saved with each entry)', namePh: 'e.g. Milad',
    enter: 'Sign in', saveTest: 'Save and test connection', testing: 'Testing connection…', connected: 'Connected to the sheet',
    setupSub: 'First time only: enter the script link and secret code',
    setupHint: 'The link and code are saved on this phone only. The link comes from Apps Script after Deploy, and the code is the one set from the "الأب" menu in the sheet.',
    reloadLists: 'Reload lists from the sheet', listsUpdated: 'Lists updated', logout: 'Sign out on this phone', language: 'Language',
    plots: n => `${n} plots`, feddan: 'feddan', year: 'Year', yearCost: y => `${y} cost`, egp: 'EGP',
    sinceStart: 'Since start', perFeddanShort: 'per feddan', cash: 'Cash box', yearSales: 'Sales this year',
    partnerBalance: 'Partner balance', details: 'Details', monthlyCost: 'Monthly cost', changingYear: 'Changing year…',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    setupChip: 'Setup', producing: 'Producing', perFeddanUnit: '/ feddan', totalSetup: 'Total establishment cost', avgFeddan: 'Average per feddan',
    plotsHint: 'Figures are cumulative since establishment, including each plot’s share of shared expenses and asset depreciation.',
    crop: 'Crop', variety: 'Variety', notSet: 'not set', sharedPct: 'share of shared costs', costToDate: 'Cost to date',
    costPerFeddan: 'Cost per feddan', byItem: 'Cost by item', noCosts: 'No expenses on this plot yet', recent: 'Recent entries',
    sharedTag: 'shared portion', noMoves: 'No entries',
    newTitle: 'New entry', expense: 'Expense', expenseSub: 'On a plot or shared, paid from the cash box',
    move: 'Partner entry', moveSub: 'Deposit, withdrawal, or settlement between partners', sale: 'Crop sale', saleSub: 'Into the cash box or split',
    asset: 'Fixed asset', assetSub: 'Well, pump, fence, roads… depreciated across plots',
    saving: 'Saving…', saved: 'Saved', fromCash: 'From the cash box', paidOwn: p => `${p} paid personally`, alreadyRecorded: 'Already recorded as an expense',
    addExpense: 'New expense', date: 'Date', amount: 'Amount (EGP)', item: 'Item', chargeTo: 'Charge to', specificPlot: 'Specific plot',
    sharedArea: 'Shared (by area)', whoPaid: 'Who paid?', supplier: 'Supplier / contractor', supplierPh: 'Pick or type a name',
    desc: 'Description', descPh: 'e.g. laser leveling', docNo: 'Invoice / receipt no.', saveExpense: 'Save expense',
    cashHint: 'Expenses are paid from the cash box. Partner money goes in through "Partner entry → Deposit to cash box".', enterAmount: 'Enter the amount',
    partner: 'Partner', moveType: 'Type', depositTxt: 'Deposit money to the cash box', withdrawTxt: 'Withdraw money from the cash box',
    settleTxt: 'Pay the other partner directly (settlement)', descPh2: 'e.g. bank transfer',
    settleHint: 'A settlement is recorded for both partners at once: paid for the payer, received for the other.', saveMove: 'Save entry',
    plot: 'Plot', cropName: 'Crop', buyer: 'Buyer', qty: 'Quantity (kg)', price: 'Price (EGP/kg)', saleTotal: 'Sale total',
    whereMoney: 'Where did the money go?', toCash: 'Into the farm cash box', toSplit: 'Split between partners by share',
    toPartner: p => `All received by ${p}`, toMixed: 'Part to cash box, rest split', toBoxAmt: 'Amount into the cash box',
    impact: 'Effect on partner balance', notes: 'Notes', saveSale: 'Save sale', enterQtyPrice: 'Enter quantity and price',
    assetName: 'Asset', assetPh: 'e.g. artesian well, pump, fence', startDate: 'In service from', life: 'Useful life (years)', cost: 'Cost (EGP)',
    allPlots: 'All plots (shared by area)', paidFrom: 'Paid from?', supplierOnly: 'Supplier',
    assetHint: 'The asset price is paid from the cash box and recorded in the journal, then depreciated monthly over its life across plots.',
    saveAsset: 'Save asset', enterAssetName: 'Enter the asset name', enterCostLife: 'Enter cost and life',
    journal: 'Log', refresh: 'Refresh', kExpense: 'Expense', kMove: 'Partner', kSale: 'Sale', saleOf: 'Sale of', cropDefault: 'crop',
    noEntries: 'No entries yet. Start with the + button below.', editInSheet: 'Editing and deleting are done in the sheet.',
    partners: 'Partners', contributions: 'Deposits to cash box', outOfPocket: 'Paid personally', settlementsPaid: 'Settlements paid',
    withdrawals: 'Withdrawals', settlementsReceived: 'Settlements received', salesReceived: 'Sales received', salesShare: 'Share of split sales',
    net: 'Net paid in', fair: 'Fair share', addMoveBtn: 'Record a deposit or settlement',
    isOwed: 'is owed', owes: 'owes', even: 'settled', settledAll: 'Partners are even; no settlement needed',
    settleSentence: (payer, recv, a, b) => `${payer} pays ${a} EGP directly to ${recv}, or deposits ${b} EGP to the cash box, to even out.`,
  },
};
const T = (k, ...a) => { const v = (STR[LANG] && STR[LANG][k]) || STR.ar[k]; return typeof v === 'function' ? v(...a) : v; };

// ترجمة الأسماء اللي جاية من الشيت (الحوش، البنود، القوائم…)
const EXTRA_TR = { 'مصروفات مشتركة (نصيب الحوشة)': 'Shared expenses (plot share)', 'إهلاك الأصول (نصيب الحوشة)': 'Asset depreciation (plot share)', 'أخرى': 'Other' };
const dn = v => (LANG === 'en' && v !== undefined && v !== null ? ((CFG && CFG.tr && CFG.tr[v]) || EXTRA_TR[v] || v) : v);

function applyLang() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';
  document.title = LANG === 'ar' ? 'مزرعة الملاك ميخائيل – ديروط' : 'Angel Michael Farm – Dayrut';
  const tb = $('#tabbar');
  if (tb) {
    tb.setAttribute('aria-label', T('tabHome'));
    [['home', 'tabHome'], ['hoshas', 'tabHoshas'], ['journal', 'tabJournal'], ['partners', 'tabPartners']].forEach(([tab, k]) => {
      const a = tb.querySelector(`[data-tab="${tab}"] span`); if (a) a.textContent = T(k);
    });
    const fab = tb.querySelector('.fab'); if (fab) fab.setAttribute('aria-label', T('newEntry'));
  }
  $('#sync').textContent = T('syncing');
}
function setLang(l) { LANG = l; store.set('lang', l); applyLang(); route(); }
const langBtn = (style) => `<button type="button" class="chip lang-btn" style="${style || ''}" onclick="setLang('${LANG === 'ar' ? 'en' : 'ar'}')" aria-label="${T('language')}">${LANG === 'ar' ? 'EN' : 'ع'}</button>`;

// ===================== الاتصال =====================
const api = {
  url() { return store.get('api', ''); },
  key() { return store.get('key', ''); },
  async get(action, params = {}) {
    const q = new URLSearchParams({ action, key: api.key(), ...params });
    return api._handle(await fetch(api.url() + '?' + q.toString(), { redirect: 'follow' }));
  },
  async post(action, data) {
    // text/plain عشان المتصفح ما يبعتش طلب preflight لـ Apps Script
    const res = await fetch(api.url(), {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, key: api.key(), data }),
    });
    return api._handle(res);
  },
  async _handle(res) {
    let j;
    try { j = await res.json(); } catch (e) { throw new Error(T('badResp')); }
    if (!j.ok) {
      if (j.auth === false) { store.del('key'); }
      throw new Error(j.error || T('genericErr'));
    }
    return j.data;
  },
};

let CFG = store.get('cfg', null);
async function loadConfig(force) {
  if (CFG && !force) return CFG;
  CFG = await api.get('config');
  store.set('cfg', CFG);
  return CFG;
}

// ===================== أدوات =====================
function $(s, el = document) { return el.querySelector(s); }
const view = () => $('#view');
const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Math.round(Number(n) || 0).toLocaleString('en-US');
const signed = n => (n > 0.5 ? '+' : n < -0.5 ? '−' : '') + fmt(Math.abs(n));
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const enc = s => encodeURIComponent(s);
const statusWord = b => (b > 0.5 ? T('isOwed') : b < -0.5 ? T('owes') : T('even'));

/** جملة التسوية بتتحسب هنا عشان تظهر باللغة المختارة. */
function settleText(rows) {
  const payer = rows.find(p => p.balance < -0.5), recv = rows.find(p => p.balance > 0.5);
  if (!payer || !recv) return T('settledAll');
  const amt = Math.abs(payer.balance), share = payer.share || 0.5;
  return T('settleSentence', dn(payer.name), dn(recv.name), fmt(amt), fmt(amt / (1 - share)));
}

const ICON = {
  back: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  gear: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  refresh: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
};

function toast(msg, err) {
  const t = $('#toast');
  t.textContent = msg; t.className = err ? 'err' : ''; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, err ? 4500 : 2500);
}
function loading(msg) { view().innerHTML = `<div class="loading"><div class="spinner"></div>${esc(msg || T('loading'))}</div>`; }
function bar(title, back, extra) {
  return `<header class="bar">${back ? `<a class="icon-btn back" href="${back}" aria-label="${T('back')}">${ICON.back}</a>` : ''}<h1>${esc(title)}</h1><span style="flex:1"></span>${extra || ''}</header>`;
}
function errorView(e, retry) {
  view().innerHTML = `${bar(T('connErr'))}<div class="wrap"><div class="card"><p>${esc(e.message)}</p>
    <button class="btn" id="retry">${T('retry')}</button><a class="btn ghost" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="#settings">${T('settings')}</a></div></div>`;
  $('#retry').onclick = retry;
}

// ===================== الكاش على الموبايل =====================
// بيعرض آخر بيانات محفوظة فوراً، وبعدين بيحدّثها من الشيت في الخلفية.
const FRESH_MS = 60 * 1000; // لو البيانات أحدث من دقيقة مش بنطلبها تاني
function putView(key, d) { store.set('v_' + key, { t: Date.now(), d }); }
function markStale() { ['dash', 'journal', 'partners'].forEach(k => { const v = store.get('v_' + k, null); if (v) { v.t = 0; store.set('v_' + k, v); } }); }

async function showCached(cacheKey, fetcher, render, retry) {
  const key = 'v_' + cacheKey, here = location.hash;
  const raw = store.get(key, null);
  const old = raw && raw.d !== undefined ? raw : null;
  const sync = $('#sync');
  if (old) render(old.d); else loading();
  if (old && Date.now() - old.t < FRESH_MS) return;
  sync.hidden = false;
  try {
    const fresh = await fetcher();
    putView(cacheKey, fresh);
    if (location.hash === here) render(fresh);
  } catch (e) {
    if (!old) errorView(e, retry);
    else toast(T('cantRefresh') + e.message, true);
  } finally { sync.hidden = true; }
}

// طلب واحد بيجيب الرئيسية والسجل والشركاء مرة واحدة
async function fetchAll() {
  await loadConfig();
  let all;
  try { all = await api.get('all'); }
  catch (e) {
    if (!/غير معروف/.test(e.message)) throw e; // السكريبت لسه على نسخة قديمة
    return api.get('dashboard');
  }
  putView('journal', all.journal); putView('partners', all.partners);
  return all.dashboard;
}

// ===================== التوجيه =====================
const routes = {
  home: viewHome, hoshas: viewHoshas, hosha: viewHosha, add: viewAdd, expense: viewExpense, sale: viewSale,
  move: viewMove, asset: viewAsset, journal: viewJournal, partners: viewPartners, settings: viewSettings,
};

function route() {
  if (!api.url() || !api.key()) { $('#tabbar').hidden = true; return viewSetup(); }
  $('#tabbar').hidden = false;
  const [name, arg] = (location.hash.slice(1) || 'home').split('/');
  document.querySelectorAll('#tabbar [data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === name));
  window.scrollTo(0, 0);
  (routes[name] || viewHome)(arg ? decodeURIComponent(arg) : undefined);
}
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => { applyLang(); route(); });

// ===================== التثبيت كأبلكيشن =====================
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; const b = $('#installBtn'); if (b) b.hidden = false; });
async function doInstall() {
  if (!installEvt) return toast(T('installHint'));
  installEvt.prompt(); await installEvt.userChoice; installEvt = null;
  const b = $('#installBtn'); if (b) b.hidden = true;
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

// ===================== الإعداد =====================
function settingsForm(isSetup) {
  return `<form id="setForm">
    <div class="field"><label for="api">${T('apiUrl')}</label>
      <input id="api" dir="ltr" inputmode="url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(api.url())}" required></div>
    <div class="field"><label for="key">${T('secret')}</label>
      <input id="key" dir="ltr" type="password" autocomplete="current-password" value="${esc(api.key())}" required></div>
    <div class="field"><label for="user">${T('yourName')}</label>
      <input id="user" value="${esc(store.get('user', ''))}" placeholder="${T('namePh')}"></div>
    <button class="btn" type="submit">${isSetup ? T('enter') : T('saveTest')}</button>
  </form>`;
}

async function saveSettings(ev) {
  ev.preventDefault();
  const btn = ev.target.querySelector('button[type=submit]');
  store.set('api', $('#api').value.trim());
  store.set('key', $('#key').value.trim());
  store.set('user', $('#user').value.trim());
  btn.disabled = true; btn.textContent = T('testing');
  try {
    await api.get('ping');
    await loadConfig(true);
    toast(T('connected'));
    location.hash = '#home'; route();
  } catch (e) {
    toast(e.message, true);
    btn.disabled = false; btn.textContent = T('retry');
  }
}

function viewSetup() {
  view().innerHTML = `<section class="hero"><div class="top"><h1>${T('farm')} – ${T('place')}</h1>${langBtn()}</div><span class="sub">${T('setupSub')}</span></section>
    <div class="wrap"><div class="card">${settingsForm(true)}</div><p class="hint">${T('setupHint')}</p></div>`;
  $('#setForm').onsubmit = saveSettings;
}

function viewSettings() {
  view().innerHTML = `${bar(T('settings'), '#home')}<div class="wrap">
    <div class="card"><span class="muted">${T('language')}</span>
      <div class="seg" id="langSeg"><button type="button" data-v="ar" aria-pressed="${LANG === 'ar'}">العربية</button><button type="button" data-v="en" aria-pressed="${LANG === 'en'}">English</button></div></div>
    <div class="card">${settingsForm(false)}</div>
    <button class="btn" id="install2">${T('installPhone')}</button>
    <button class="btn ghost" id="reloadCfg">${T('reloadLists')}</button>
    <button class="btn ghost" id="logout">${T('logout')}</button></div>`;
  $('#langSeg').onclick = ev => { const b = ev.target.closest('button'); if (b && b.dataset.v !== LANG) setLang(b.dataset.v); };
  $('#setForm').onsubmit = saveSettings;
  $('#install2').onclick = doInstall;
  $('#reloadCfg').onclick = async () => { try { await loadConfig(true); toast(T('listsUpdated')); } catch (e) { toast(e.message, true); } };
  $('#logout').onclick = () => { ['api', 'key', 'cfg', 'v_dash', 'v_journal', 'v_partners'].forEach(store.del); CFG = null; location.hash = ''; route(); };
}

// ===================== الرئيسية =====================
function viewHome() { showCached('dash', fetchAll, renderHome, viewHome); }
function renderHome(d) {
  const cfg = CFG || { hoshas: [], years: [] };
  const maxM = Math.max(1, ...d.monthly.map(m => m.cost));
  const years = (cfg.years || []).map(y => `<option ${y == d.year ? 'selected' : ''}>${y}</option>`).join('');
  const user = store.get('user', '');
  const partnerPill = p => {
    const cls = p.balance > 0.5 ? 'pill-pos' : p.balance < -0.5 ? 'pill-neg' : 'pill-zero';
    const tcls = p.balance > 0.5 ? 'pos' : p.balance < -0.5 ? 'neg' : '';
    return `<div class="row ${cls}"><b>${esc(dn(p.name))}</b><b class="${tcls}">${signed(p.balance)} ${statusWord(p.balance)}</b></div>`;
  };
  view().innerHTML = `
  <section class="hero">
    <div class="top"><span class="sub">${esc(user ? T('helloName') + user : T('hello'))}</span>
      <span style="display:flex;align-items:center;gap:6px"><button class="chip" id="installBtn" ${installEvt ? '' : 'hidden'} style="border:0">${T('install')}</button>${langBtn()}<a class="icon-btn" style="color:#fff" href="#settings" aria-label="${T('settings')}">${ICON.gear}</a></span></div>
    <h1>${T('farm')} – ${T('place')}</h1>
    <div class="top"><span class="sub">${T('plots', cfg.hoshas.length)} · ${fmt(d.total.area)} ${T('feddan')}</span>
      <label class="sub">${T('year')} <select class="year-select" id="year" aria-label="${T('year')}">${years}</select></label></div>
  </section>
  <div class="wrap">
    <section class="card">
      <span class="muted">${T('yearCost', esc(d.year))}</span>
      <span class="big">${fmt(d.kpis.yearCost)} <small style="font-size:15px">${T('egp')}</small></span>
      <span class="muted">${T('sinceStart')} ${fmt(d.kpis.totalCost)} · ${T('perFeddanShort')} ${fmt(d.kpis.perFeddan)}</span>
    </section>
    <div class="grid2">
      <div class="kpi"><span class="muted">${T('cash')}</span><span class="v ${d.kpis.cash < 0 ? 'neg' : ''}">${fmt(d.kpis.cash)}</span></div>
      <div class="kpi"><span class="muted">${T('yearSales')}</span><span class="v">${fmt(d.kpis.yearSales)}</span></div>
    </div>
    <section class="card">
      <div class="row"><h2>${T('partnerBalance')}</h2><a href="#partners">${T('details')}</a></div>
      ${d.partners.map(partnerPill).join('')}
      <div class="note">${esc(settleText(d.partners))}</div>
    </section>
    <section class="card">
      <h2>${T('monthlyCost')}</h2>
      <div class="bars">${d.monthly.map((m, i) => `<div class="b" title="${esc(T('months')[i])}: ${fmt(m.cost)}"><i style="height:${Math.round(m.cost / maxM * 100)}%"></i><span>${esc(T('months')[i].slice(0, 3))}</span></div>`).join('')}</div>
    </section>
    <section style="display:flex;flex-direction:column;gap:10px">
      <h2 style="font-size:16px">${T('tabHoshas')}</h2>
      <div class="grid2">${d.hoshas.map(hoshaCard).join('')}</div>
    </section>
  </div>`;
  $('#installBtn').onclick = doInstall;
  $('#year').onchange = async ev => {
    loading(T('changingYear'));
    try { await api.post('setYear', { year: Number(ev.target.value) }); markStale(); } catch (e) { toast(e.message, true); }
    viewHome();
  };
}

function hoshaCard(h) {
  return `<a class="hosha-card" href="#hosha/${enc(h.name)}">
    <div class="row"><span class="name">${esc(dn(h.name))}</span><span class="chip soft">${h.status === 'منتجة' ? T('producing') : T('setupChip')}</span></div>
    <span class="muted">${h.area} ${T('feddan')} · ${esc(h.crop || '—')}</span>
    <span class="v">${fmt(h.totalCost)}</span>
    <span class="muted">${fmt(h.perFeddan)} ${T('perFeddanUnit')}</span></a>`;
}

function viewHoshas() { showCached('dash', () => api.get('dashboard'), renderHoshas, viewHoshas); }
function renderHoshas(d) {
  view().innerHTML = `${bar(T('tabHoshas'))}<div class="wrap">
    <div class="card"><div class="row"><span class="muted">${T('totalSetup')}</span><b>${fmt(d.total.totalCost)}</b></div>
    <div class="row"><span class="muted">${T('avgFeddan')}</span><b>${fmt(d.total.perFeddan)}</b></div></div>
    <div class="grid2">${d.hoshas.map(hoshaCard).join('')}</div>
    <p class="hint">${T('plotsHint')}</p></div>`;
}

function viewHosha(name) { showCached('hosha_' + name, () => api.get('hosha', { name }), renderHosha, () => viewHosha(name)); }
function renderHosha(h) {
  const max = Math.max(1, ...h.breakdown.map(b => b.amount));
  view().innerHTML = `
  <section class="hero">
    <div class="top"><a class="icon-btn back" style="color:#fff" href="#hoshas" aria-label="${T('back')}">${ICON.back}</a>
      <h1 style="flex:1">${esc(dn(h.name))}</h1><span class="chip">${esc(dn(h.status))}</span></div>
    <span class="sub">${h.area} ${T('feddan')} · ${T('crop')}: ${esc(h.crop || T('notSet'))} · ${T('variety')}: ${esc(h.variety || T('notSet'))} · ${T('sharedPct')} ${Math.round(h.ratio * 1000) / 10}%</span>
    <div class="grid2" style="margin-top:6px">
      <div><span class="sub">${T('costToDate')}</span><div class="mid">${fmt(h.total)}</div></div>
      <div><span class="sub">${T('costPerFeddan')}</span><div class="mid">${fmt(h.perFeddan)}</div></div>
    </div>
  </section>
  <div class="wrap">
    <section class="card"><h2>${T('byItem')}</h2>
      ${h.breakdown.length ? h.breakdown.map(b => `<div style="display:flex;flex-direction:column;gap:4px">
        <div class="row"><span>${esc(dn(b.name))}</span><b>${fmt(b.amount)}</b></div>
        <div class="meter"><i style="width:${Math.round(b.amount / max * 100)}%"></i></div></div>`).join('') : `<div class="empty">${T('noCosts')}</div>`}
    </section>
    <section class="list"><h2 style="font-size:15px">${T('recent')}</h2>
      ${h.recent.length ? h.recent.map(r => `<div class="item"><div><div class="t">${esc(dn(r.title))}${r.shared ? `<span class="tag">${T('sharedTag')}</span>` : ''}</div>
        <div class="s">${esc(r.date)} · ${esc(dn(r.by || ''))}${r.desc ? ' · ' + esc(r.desc) : ''}</div></div><span class="a">${fmt(r.amount)}</span></div>`).join('') : `<div class="empty">${T('noMoves')}</div>`}
    </section>
  </div>`;
}

// ===================== الإضافة =====================
function viewAdd() {
  view().innerHTML = `${bar(T('newTitle'), '#home')}<div class="wrap"><div class="menu-grid">
    <a href="#expense"><b>${T('expense')}</b><span>${T('expenseSub')}</span></a>
    <a href="#move"><b>${T('move')}</b><span>${T('moveSub')}</span></a>
    <a href="#sale"><b>${T('sale')}</b><span>${T('saleSub')}</span></a>
    <a href="#asset"><b>${T('asset')}</b><span>${T('assetSub')}</span></a>
  </div></div>`;
}

function segInit(root, onChange) {
  root.querySelectorAll('[data-seg]').forEach(group => {
    group.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      group.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      onChange && onChange(group.dataset.seg, b.dataset.v);
    });
  });
}
const segVal = name => { const b = document.querySelector(`[data-seg="${name}"] [aria-pressed="true"]`); return b ? b.dataset.v : ''; };
const radioVal = name => { const r = document.querySelector(`input[name="${name}"]:checked`); return r ? r.value : ''; };

async function submitWith(form, action, collect, done) {
  form.onsubmit = async ev => {
    ev.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    let data;
    try { data = collect(); } catch (e) { return toast(e.message, true); }
    data.user = store.get('user', '');
    btn.disabled = true; const old = btn.textContent; btn.textContent = T('saving');
    try { const r = await api.post(action, data); markStale(); toast(T('saved')); done(r); }
    catch (e) { toast(e.message, true); }
    finally { btn.disabled = false; btn.textContent = old; }
  };
}

// القيم اللي بتتبعت للشيت بتفضل بالعربي، واللي بيظهر بس هو اللي بيتترجم
function itemOptions(cfg, filter) {
  const groups = {};
  cfg.items.filter(filter || (() => true)).forEach(i => { (groups[i.group] = groups[i.group] || []).push(i.name); });
  return Object.keys(groups).map(g => `<optgroup label="${esc(dn(g))}">${groups[g].map(n => `<option value="${esc(n)}">${esc(dn(n))}</option>`).join('')}</optgroup>`).join('');
}
function payOptions(cfg, name, includeNone) {
  return (includeNone ? [`<label class="opt"><input type="radio" name="${name}" value="" checked>${T('alreadyRecorded')}</label>`] : [])
    .concat(cfg.payMethods.map((p, i) => `<label class="opt"><input type="radio" name="${name}" value="${esc(p)}" ${!includeNone && i === 0 ? 'checked' : ''}>${p === 'الخزنة' ? T('fromCash') : esc(T('paidOwn', dn(p)))}</label>`)).join('');
}
const supplierList = cfg => `<datalist id="suppliers">${(cfg.suppliers || []).map(s => `<option value="${esc(s)}">`).join('')}</datalist>`;
const hoshaChips = cfg => `<div class="chips" data-seg="hosha">${cfg.hoshas.map((h, i) => `<button type="button" data-v="${esc(h.name)}" aria-pressed="${i === 0}" aria-label="${esc(dn(h.name))}">${esc(String(dn(h.name)).replace(/^(حوشة|Plot)\s*/, ''))}</button>`).join('')}</div>`;
const hoshaOptions = cfg => cfg.hoshas.map(h => `<option value="${esc(h.name)}">${esc(dn(h.name))}</option>`).join('');

async function viewExpense() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewExpense); }
  view().innerHTML = `${bar(T('addExpense'), '#add')}<div class="wrap"><form id="f" novalidate>
    <div class="grid2">
      <div class="field"><label for="date">${T('date')}</label><input id="date" type="date" value="${today()}" required></div>
      <div class="field"><label for="amount">${T('amount')}</label><input id="amount" type="number" inputmode="decimal" min="0" step="any" required></div>
    </div>
    <div class="field"><label for="item">${T('item')}</label><select id="item">${itemOptions(cfg, i => i.group !== 'أصول')}</select></div>
    <fieldset><legend>${T('chargeTo')}</legend>
      <div class="seg" data-seg="ctype"><button type="button" data-v="hosha" aria-pressed="true">${T('specificPlot')}</button><button type="button" data-v="shared" aria-pressed="false">${T('sharedArea')}</button></div>
      <div id="hoshaBox">${hoshaChips(cfg)}</div>
    </fieldset>
    <p class="hint">${T('cashHint')}</p>
    <div class="field"><label for="supplier">${T('supplier')}</label><input id="supplier" list="suppliers" placeholder="${T('supplierPh')}">${supplierList(cfg)}</div>
    <div class="field"><label for="desc">${T('desc')}</label><input id="desc" placeholder="${T('descPh')}"></div>
    <div class="field"><label for="doc">${T('docNo')}</label><input id="doc"></div>
    <button class="btn" type="submit">${T('saveExpense')}</button>
  </form></div>`;
  const f = $('#f');
  segInit(f, (seg, v) => { if (seg === 'ctype') $('#hoshaBox').hidden = v !== 'hosha'; });
  submitWith(f, 'addExpense', () => {
    const amount = Number($('#amount').value);
    if (!(amount > 0)) throw new Error(T('enterAmount'));
    return {
      date: $('#date').value, amount, item: $('#item').value,
      center: segVal('ctype') === 'shared' ? 'مشترك' : segVal('hosha'),
      paidBy: 'الخزنة', supplier: $('#supplier').value, desc: $('#desc').value, docNo: $('#doc').value,
    };
  }, () => { CFG = null; store.del('cfg'); $('#amount').value = ''; $('#desc').value = ''; $('#doc').value = ''; });
}

async function viewMove() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewMove); }
  const types = [['توريد للخزنة', T('depositTxt')], ['سحب من الخزنة', T('withdrawTxt')], ['تسوية مدفوعة', T('settleTxt')]];
  view().innerHTML = `${bar(T('move'), '#add')}<div class="wrap"><form id="f" novalidate>
    <fieldset><legend>${T('partner')}</legend><div class="seg" data-seg="partner">${cfg.partners.map((p, i) => `<button type="button" data-v="${esc(p.name)}" aria-pressed="${i === 0}">${esc(dn(p.name))}</button>`).join('')}</div></fieldset>
    <fieldset><legend>${T('moveType')}</legend>${types.map((t, i) => `<label class="opt"><input type="radio" name="type" value="${t[0]}" ${i === 0 ? 'checked' : ''}>${t[1]}</label>`).join('')}</fieldset>
    <div class="grid2">
      <div class="field"><label for="date">${T('date')}</label><input id="date" type="date" value="${today()}"></div>
      <div class="field"><label for="amount">${T('amount')}</label><input id="amount" type="number" inputmode="decimal" min="0" step="any"></div>
    </div>
    <div class="field"><label for="desc">${T('desc')}</label><input id="desc" placeholder="${T('descPh2')}"></div>
    <p class="hint">${T('settleHint')}</p>
    <button class="btn" type="submit">${T('saveMove')}</button>
  </form></div>`;
  const f = $('#f'); segInit(f);
  submitWith(f, 'addMove', () => {
    const amount = Number($('#amount').value);
    if (!(amount > 0)) throw new Error(T('enterAmount'));
    return { date: $('#date').value, partner: segVal('partner'), type: radioVal('type'), amount, desc: $('#desc').value };
  }, () => { $('#amount').value = ''; $('#desc').value = ''; });
}

async function viewSale() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewSale); }
  const partners = cfg.partners.map(p => p.name);
  view().innerHTML = `${bar(T('sale'), '#add')}<div class="wrap"><form id="f" novalidate>
    <div class="grid2">
      <div class="field"><label for="date">${T('date')}</label><input id="date" type="date" value="${today()}"></div>
      <div class="field"><label for="hosha">${T('plot')}</label><select id="hosha">${hoshaOptions(cfg)}</select></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="crop">${T('cropName')}</label><input id="crop"></div>
      <div class="field"><label for="buyer">${T('buyer')}</label><input id="buyer"></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="qty">${T('qty')}</label><input id="qty" type="number" inputmode="decimal" min="0" step="any"></div>
      <div class="field"><label for="price">${T('price')}</label><input id="price" type="number" inputmode="decimal" min="0" step="any"></div>
    </div>
    <div class="total-box"><span class="muted">${T('saleTotal')}</span><span class="mid" id="total">0 ${T('egp')}</span></div>
    <fieldset><legend>${T('whereMoney')}</legend>
      <label class="opt"><input type="radio" name="dest" value="الخزنة" checked>${T('toCash')}</label>
      <label class="opt"><input type="radio" name="dest" value="توزيع على الشريكين">${T('toSplit')}</label>
      ${partners.map(p => `<label class="opt"><input type="radio" name="dest" value="${esc(p)}">${esc(T('toPartner', dn(p)))}</label>`).join('')}
      <label class="opt"><input type="radio" name="dest" value="تقسيم">${T('toMixed')}</label>
      <div class="field" id="splitBox" hidden><label for="toBox">${T('toBoxAmt')}</label><input id="toBox" type="number" inputmode="decimal" min="0" step="any"></div>
    </fieldset>
    <section class="card" id="impact"></section>
    <div class="field"><label for="notes">${T('notes')}</label><input id="notes"></div>
    <button class="btn" type="submit">${T('saveSale')}</button>
  </form></div>`;
  const f = $('#f');
  const calc = () => {
    const total = (Number($('#qty').value) || 0) * (Number($('#price').value) || 0);
    $('#total').textContent = fmt(total) + ' ' + T('egp');
    const dest = radioVal('dest');
    $('#splitBox').hidden = dest !== 'تقسيم';
    const eff = {}; partners.forEach(p => { eff[p] = 0; });
    if (partners.indexOf(dest) !== -1) {
      cfg.partners.forEach(p => { eff[p.name] = (p.name === dest ? -total : 0) + p.share * total; });
    }
    const rows = partners.map(p => `<div class="row"><span>${esc(dn(p))}</span><b class="${eff[p] > 0.5 ? 'pos' : eff[p] < -0.5 ? 'neg' : ''}">${signed(eff[p])}</b></div>`).join('');
    $('#impact').innerHTML = `<b style="font-size:13px">${T('impact')}</b>${rows}`;
  };
  f.addEventListener('input', calc); f.addEventListener('change', calc); calc();
  submitWith(f, 'addSale', () => {
    const qty = Number($('#qty').value), price = Number($('#price').value);
    if (!(qty > 0) || !(price > 0)) throw new Error(T('enterQtyPrice'));
    return {
      date: $('#date').value, hosha: $('#hosha').value, crop: $('#crop').value, buyer: $('#buyer').value,
      qty, price, dest: radioVal('dest'), toTreasury: Number($('#toBox').value) || 0, notes: $('#notes').value,
    };
  }, () => { $('#qty').value = ''; $('#price').value = ''; calc(); });
}

async function viewAsset() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewAsset); }
  view().innerHTML = `${bar(T('asset'), '#add')}<div class="wrap"><form id="f" novalidate>
    <div class="field"><label for="name">${T('assetName')}</label><input id="name" placeholder="${T('assetPh')}"></div>
    <div class="grid2">
      <div class="field"><label for="date">${T('startDate')}</label><input id="date" type="date" value="${today()}"></div>
      <div class="field"><label for="life">${T('life')}</label><input id="life" type="number" inputmode="decimal" min="0" step="any" value="10"></div>
    </div>
    <div class="field"><label for="cost">${T('cost')}</label><input id="cost" type="number" inputmode="decimal" min="0" step="any"></div>
    <div class="field"><label for="center">${T('chargeTo')}</label><select id="center"><option value="مشترك">${T('allPlots')}</option>${hoshaOptions(cfg)}</select></div>
    <div class="field"><label for="supplier">${T('supplierOnly')}</label><input id="supplier" list="suppliers">${supplierList(cfg)}</div>
    <p class="hint">${T('assetHint')}</p>
    <button class="btn" type="submit">${T('saveAsset')}</button>
  </form></div>`;
  const f = $('#f');
  submitWith(f, 'addAsset', () => {
    if (!$('#name').value.trim()) throw new Error(T('enterAssetName'));
    const cost = Number($('#cost').value), life = Number($('#life').value);
    if (!(cost > 0) || !(life > 0)) throw new Error(T('enterCostLife'));
    return { name: $('#name').value.trim(), date: $('#date').value, cost, life, center: $('#center').value, paidBy: 'الخزنة', supplier: $('#supplier').value };
  }, () => { location.hash = '#home'; });
}

// ===================== السجل والشركاء =====================
function viewJournal() { showCached('journal', () => api.get('journal'), renderJournal, viewJournal); }
function renderJournal(items) {
  const label = { expense: T('kExpense'), move: T('kMove'), sale: T('kSale') };
  const title = i => i.kind === 'sale' ? `${T('saleOf')} ${String(i.title || '').replace(/^بيع\s*/, '') || T('cropDefault')}` : dn(i.title);
  const sub = i => i.kind === 'expense' ? `${esc(dn(i.center))} · ${esc(dn(i.by))}${i.supplier ? ' · ' + esc(i.supplier) : ''}`
    : i.kind === 'move' ? esc(dn(i.partner)) : `${esc(dn(i.center))} · ${esc(dn(i.dest))}${i.buyer ? ' · ' + esc(i.buyer) : ''}`;
  view().innerHTML = `${bar(T('journal'), '', `<a class="icon-btn" href="#journal" onclick="markStale();route();return false" aria-label="${T('refresh')}">${ICON.refresh}</a>`)}
  <div class="wrap"><div class="list">${items.length ? items.map(i => `<div class="item"><div>
    <div class="t">${esc(title(i))}<span class="tag">${label[i.kind]}</span></div>
    <div class="s">${esc(i.date)} · ${sub(i)}${i.desc ? ' · ' + esc(i.desc) : ''}</div></div>
    <span class="a ${i.kind === 'sale' ? 'pos' : ''}">${fmt(i.amount)}</span></div>`).join('') : `<div class="empty">${T('noEntries')}</div>`}</div>
  <p class="hint">${T('editInSheet')}</p></div>`;
}

function viewPartners() { showCached('partners', () => api.get('partners'), renderPartners, viewPartners); }
function renderPartners(d) {
  const card = p => {
    const cls = p.balance > 0.5 ? 'pos' : p.balance < -0.5 ? 'neg' : '';
    const line = (k, v) => `<div class="row"><span class="muted">${T(k)}</span><span>${fmt(v)}</span></div>`;
    return `<section class="card" style="border:2px solid ${p.balance > 0.5 ? 'var(--pos)' : p.balance < -0.5 ? 'var(--neg)' : 'var(--border)'}">
      <div class="row"><h2>${esc(dn(p.name))} <span class="muted">(${Math.round(p.share * 100)}%)</span></h2><b class="${cls}" style="font-size:18px">${signed(p.balance)} ${statusWord(p.balance)}</b></div>
      ${line('contributions', p.contributions)}${line('outOfPocket', p.outOfPocket)}${line('settlementsPaid', p.settlementsPaid)}
      ${line('withdrawals', p.withdrawals)}${line('settlementsReceived', p.settlementsReceived)}${line('salesReceived', p.salesReceived)}${line('salesShare', p.salesShare)}
      <div class="row" style="border-top:1px solid var(--border);padding-top:6px"><b>${T('net')}</b><b>${fmt(p.net)}</b></div>
      <div class="row"><span class="muted">${T('fair')}</span><span>${fmt(p.fair)}</span></div></section>`;
  };
  view().innerHTML = `${bar(T('partners'))}<div class="wrap">${d.rows.map(card).join('')}
    <div class="note">${esc(settleText(d.rows))}</div>
    <a class="btn" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="#move">${T('addMoveBtn')}</a></div>`;
}
