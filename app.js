/* مزرعة الملاك ميخائيل – ديروط: واجهة الأب */
'use strict';

// ===================== التخزين والاتصال =====================
const store = {
  get(k, d) { try { const v = localStorage.getItem('amf_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('amf_' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  del(k) { try { localStorage.removeItem('amf_' + k); } catch (e) { /* ignore */ } },
};

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
    try { j = await res.json(); } catch (e) { throw new Error('السيرفر رد برد مش مفهوم. اتأكد من لينك السكريبت.'); }
    if (!j.ok) {
      if (j.auth === false) { store.del('key'); }
      throw new Error(j.error || 'حصل خطأ');
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
const $ = (s, el = document) => el.querySelector(s);
const view = () => $('#view');
const esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Math.round(Number(n) || 0).toLocaleString('en-US');
const signed = n => (n > 0.5 ? '+' : n < -0.5 ? '−' : '') + fmt(Math.abs(n));
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const enc = s => encodeURIComponent(s);

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
function loading(msg) { view().innerHTML = `<div class="loading"><div class="spinner"></div>${esc(msg || 'بيحمّل…')}</div>`; }
function bar(title, back, extra) {
  return `<header class="bar">${back ? `<a class="icon-btn" href="${back}" aria-label="رجوع">${ICON.back}</a>` : ''}<h1>${esc(title)}</h1><span style="flex:1"></span>${extra || ''}</header>`;
}
function errorView(e, retry) {
  view().innerHTML = `${bar('مشكلة في الاتصال')}<div class="wrap"><div class="card"><p>${esc(e.message)}</p>
    <button class="btn" id="retry">جرّب تاني</button><a class="btn ghost" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="#settings">الإعدادات</a></div></div>`;
  $('#retry').onclick = retry;
}


// بيعرض آخر بيانات محفوظة على الموبايل فوراً، وبعدين بيحدّثها من الشيت في الخلفية.
const FRESH_MS = 60 * 1000; // لو البيانات أحدث من دقيقة مش بنطلبها تاني
function putView(key, d) { store.set('v_' + key, { t: Date.now(), d }); }
function markStale() { ['dash', 'journal', 'partners'].forEach(k => { const v = store.get('v_' + k, null); if (v) { v.t = 0; store.set('v_' + k, v); } }); }

async function showCached(cacheKey, fetcher, render, retry) {
  const key = 'v_' + cacheKey, here = location.hash;
  const raw = store.get(key, null);
  const old = raw && raw.d !== undefined ? raw : null; // بيتجاهل الكاش بتاع النسخة القديمة
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
    else toast('مش قادر يحدّث دلوقتي: ' + e.message, true);
  } finally { sync.hidden = true; }
}

// طلب واحد بيجيب الرئيسية والسجل والشركاء مرة واحدة
async function fetchAll() {
  await loadConfig();
  let all;
  try { all = await api.get('all'); }
  catch (e) {
    // لو السكريبت لسه على النسخة القديمة اللي مفيهاش 'all'
    if (!/غير معروف/.test(e.message)) throw e;
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
window.addEventListener('DOMContentLoaded', route);

// ===================== التثبيت كأبلكيشن =====================
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; const b = $('#installBtn'); if (b) b.hidden = false; });
async function doInstall() {
  if (!installEvt) return toast('من قايمة ⋮ في Chrome اختار "Install app" أو "Add to Home screen"');
  installEvt.prompt(); await installEvt.userChoice; installEvt = null;
  const b = $('#installBtn'); if (b) b.hidden = true;
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

// ===================== الإعداد أول مرة =====================
function settingsForm(isSetup) {
  return `<form id="setForm">
    <div class="field"><label for="api">لينك السكريبت (Web app URL)</label>
      <input id="api" dir="ltr" inputmode="url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(api.url())}" required></div>
    <div class="field"><label for="key">الكود السري</label>
      <input id="key" dir="ltr" type="password" autocomplete="current-password" value="${esc(api.key())}" required></div>
    <div class="field"><label for="user">اسمك (بيتسجل مع كل حركة)</label>
      <input id="user" value="${esc(store.get('user', ''))}" placeholder="مثال: كيرلس"></div>
    <button class="btn" type="submit">${isSetup ? 'ادخل' : 'حفظ واختبار الاتصال'}</button>
  </form>`;
}

async function saveSettings(ev) {
  ev.preventDefault();
  const btn = ev.target.querySelector('button[type=submit]');
  store.set('api', $('#api').value.trim());
  store.set('key', $('#key').value.trim());
  store.set('user', $('#user').value.trim());
  btn.disabled = true; btn.textContent = 'بيختبر الاتصال…';
  try {
    await api.get('ping');
    await loadConfig(true);
    toast('تم الاتصال بالشيت');
    location.hash = '#home'; route();
  } catch (e) {
    toast(e.message, true);
    btn.disabled = false; btn.textContent = 'جرّب تاني';
  }
}

function viewSetup() {
  view().innerHTML = `<section class="hero"><h1>مزرعة الملاك ميخائيل – ديروط</h1><span class="sub">أول مرة بس: دخّل لينك السكريبت والكود السري</span></section>
    <div class="wrap"><div class="card">${settingsForm(true)}</div>
    <p class="hint">اللينك والكود بيتحفظوا على الموبايل ده بس. اللينك بتاخده من Apps Script بعد ما تعمل Deploy، والكود هو اللي حددته من قايمة "الأب" في الشيت.</p></div>`;
  $('#setForm').onsubmit = saveSettings;
}

function viewSettings() {
  view().innerHTML = `${bar('الإعدادات', '#home')}<div class="wrap"><div class="card">${settingsForm(false)}</div>
    <button class="btn" id="install2">تثبيت الأب على الموبايل</button>
    <button class="btn ghost" id="reloadCfg">تحديث القوائم من الشيت</button>
    <button class="btn ghost" id="logout">خروج من الموبايل ده</button></div>`;
  $('#setForm').onsubmit = saveSettings;
  $('#install2').onclick = doInstall;
  $('#reloadCfg').onclick = async () => { try { await loadConfig(true); toast('القوائم اتحدثت'); } catch (e) { toast(e.message, true); } };
  $('#logout').onclick = () => { ['api', 'key', 'cfg', 'v_dash', 'v_journal', 'v_partners'].forEach(store.del); CFG = null; location.hash = ''; route(); };
}

// ===================== الرئيسية =====================
function viewHome() {
  showCached('dash', fetchAll, renderHome, viewHome);
}
function renderHome(d) {
  const cfg = CFG || { hoshas: [], years: [] };
  const maxM = Math.max(1, ...d.monthly.map(m => m.cost));
  const years = (cfg.years || []).map(y => `<option ${y == d.year ? 'selected' : ''}>${y}</option>`).join('');
  const partnerPill = p => {
    const cls = p.balance > 0.5 ? 'pill-pos' : p.balance < -0.5 ? 'pill-neg' : 'pill-zero';
    const tcls = p.balance > 0.5 ? 'pos' : p.balance < -0.5 ? 'neg' : '';
    return `<div class="row ${cls}"><b>${esc(p.name)}</b><b class="${tcls}">${signed(p.balance)} ${esc(p.status)}</b></div>`;
  };
  view().innerHTML = `
  <section class="hero">
    <div class="top"><span class="sub">${esc(store.get('user', '') ? 'أهلاً يا ' + store.get('user', '') : 'أهلاً')}</span>
      <span><button class="chip" id="installBtn" ${installEvt ? '' : 'hidden'} style="border:0;margin-inline-end:6px">تثبيت الأب</button><a class="icon-btn" style="color:#fff" href="#settings" aria-label="الإعدادات">${ICON.gear}</a></span></div>
    <h1>${esc(cfg.farm || 'مزرعة الملاك ميخائيل')} – ${esc(cfg.location || 'ديروط')}</h1>
    <div class="top"><span class="sub">${cfg.hoshas.length} حوش · ${fmt(d.total.area)} فدان</span>
      <label class="sub">السنة <select class="year-select" id="year" aria-label="السنة">${years}</select></label></div>
  </section>
  <div class="wrap">
    <section class="card">
      <span class="muted">تكلفة سنة ${esc(d.year)}</span>
      <span class="big">${fmt(d.kpis.yearCost)} <small style="font-size:15px">ج.م</small></span>
      <span class="muted">التكلفة منذ البداية ${fmt(d.kpis.totalCost)} · الفدان ${fmt(d.kpis.perFeddan)}</span>
    </section>
    <div class="grid2">
      <div class="kpi"><span class="muted">رصيد الخزنة</span><span class="v ${d.kpis.cash < 0 ? 'neg' : ''}">${fmt(d.kpis.cash)}</span></div>
      <div class="kpi"><span class="muted">مبيعات السنة</span><span class="v">${fmt(d.kpis.yearSales)}</span></div>
    </div>
    <section class="card">
      <div class="row"><h2>ميزان الشركاء</h2><a href="#partners">التفاصيل</a></div>
      ${d.partners.map(partnerPill).join('')}
      <div class="note">${esc(d.settleText)}</div>
    </section>
    <section class="card">
      <h2>التكلفة الشهرية</h2>
      <div class="bars">${d.monthly.map(m => `<div class="b" title="${esc(m.month)}: ${fmt(m.cost)}"><i style="height:${Math.round(m.cost / maxM * 100)}%"></i><span>${esc(String(m.month).slice(0, 3))}</span></div>`).join('')}</div>
    </section>
    <section style="display:flex;flex-direction:column;gap:10px">
      <h2 style="font-size:16px">الحوش</h2>
      <div class="grid2">${d.hoshas.map(hoshaCard).join('')}</div>
    </section>
  </div>`;
  $('#installBtn').onclick = doInstall;
  $('#year').onchange = async ev => {
    loading('بيغيّر السنة…');
    try { await api.post('setYear', { year: Number(ev.target.value) }); markStale(); } catch (e) { toast(e.message, true); }
    viewHome();
  };
}

function hoshaCard(h) {
  return `<a class="hosha-card" href="#hosha/${enc(h.name)}">
    <div class="row"><span class="name">${esc(h.name)}</span><span class="chip soft">${esc(h.status === 'منتجة' ? 'منتجة' : 'تأسيس')}</span></div>
    <span class="muted">${h.area} فدان · ${esc(h.crop || '—')}</span>
    <span class="v">${fmt(h.totalCost)}</span>
    <span class="muted">${fmt(h.perFeddan)} / فدان</span></a>`;
}

function viewHoshas() { showCached('dash', () => api.get('dashboard'), renderHoshas, viewHoshas); }
function renderHoshas(d) {
  view().innerHTML = `${bar('الحوش')}<div class="wrap">
    <div class="card"><div class="row"><span class="muted">إجمالي تكلفة التأسيس</span><b>${fmt(d.total.totalCost)}</b></div>
    <div class="row"><span class="muted">متوسط الفدان</span><b>${fmt(d.total.perFeddan)}</b></div></div>
    <div class="grid2">${d.hoshas.map(hoshaCard).join('')}</div>
    <p class="hint">الأرقام هنا تراكمية من أول التأسيس، وشاملة نصيب كل حوشة من المصروفات المشتركة وإهلاك الأصول.</p></div>`;
}

function viewHosha(name) { showCached('hosha_' + name, () => api.get('hosha', { name }), renderHosha, () => viewHosha(name)); }
function renderHosha(h) {
  const max = Math.max(1, ...h.breakdown.map(b => b.amount));
  view().innerHTML = `
  <section class="hero">
    <div class="top"><a class="icon-btn" style="color:#fff" href="#hoshas" aria-label="رجوع">${ICON.back}</a>
      <h1 style="flex:1">${esc(h.name)}</h1><span class="chip">${esc(h.status)}</span></div>
    <span class="sub">${h.area} فدان · المحصول: ${esc(h.crop || 'لم يُحدد')} · الصنف: ${esc(h.variety || 'لم يُحدد')} · نصيبها من المشترك ${Math.round(h.ratio * 1000) / 10}%</span>
    <div class="grid2" style="margin-top:6px">
      <div><span class="sub">التكلفة حتى اليوم</span><div class="mid">${fmt(h.total)}</div></div>
      <div><span class="sub">تكلفة الفدان</span><div class="mid">${fmt(h.perFeddan)}</div></div>
    </div>
  </section>
  <div class="wrap">
    <section class="card"><h2>التكلفة حسب البند</h2>
      ${h.breakdown.length ? h.breakdown.map(b => `<div style="display:flex;flex-direction:column;gap:4px">
        <div class="row"><span>${esc(b.name)}</span><b>${fmt(b.amount)}</b></div>
        <div class="meter"><i style="width:${Math.round(b.amount / max * 100)}%"></i></div></div>`).join('') : '<div class="empty">لسه مفيش مصروفات على الحوشة دي</div>'}
    </section>
    <section class="list"><h2 style="font-size:15px">آخر الحركات</h2>
      ${h.recent.length ? h.recent.map(r => `<div class="item"><div><div class="t">${esc(r.title)}${r.shared ? '<span class="tag">نصيب من مشترك</span>' : ''}</div>
        <div class="s">${esc(r.date)} · ${esc(r.by || '')}${r.desc ? ' · ' + esc(r.desc) : ''}</div></div><span class="a">${fmt(r.amount)}</span></div>`).join('') : '<div class="empty">مفيش حركات</div>'}
    </section>
  </div>`;
}

// ===================== الإضافة =====================
function viewAdd() {
  view().innerHTML = `${bar('تسجيل جديد', '#home')}<div class="wrap"><div class="menu-grid">
    <a href="#expense"><b>مصروف</b><span>على حوشة أو مشترك، من الخزنة أو من جيب شريك</span></a>
    <a href="#move"><b>حركة شريك</b><span>توريد للخزنة، سحب، أو تسوية بين الشريكين</span></a>
    <a href="#sale"><b>بيع محصول</b><span>والفلوس راحت الخزنة ولا اتوزعت</span></a>
    <a href="#asset"><b>أصل ثابت</b><span>بير، طلمبة، سور، ماشيات… بيتهلك على الحوش</span></a>
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
    btn.disabled = true; const old = btn.textContent; btn.textContent = 'بيحفظ…';
    try { const r = await api.post(action, data); markStale(); toast('اتسجّل بنجاح'); done(r); }
    catch (e) { toast(e.message, true); }
    finally { btn.disabled = false; btn.textContent = old; }
  };
}

function itemOptions(cfg, filter) {
  const groups = {};
  cfg.items.filter(filter || (() => true)).forEach(i => { (groups[i.group] = groups[i.group] || []).push(i.name); });
  return Object.keys(groups).map(g => `<optgroup label="${esc(g)}">${groups[g].map(n => `<option>${esc(n)}</option>`).join('')}</optgroup>`).join('');
}
function payOptions(cfg, name, includeNone) {
  return (includeNone ? [`<label class="opt"><input type="radio" name="${name}" value="" checked>اتسجل في المصروفات قبل كده</label>`] : [])
    .concat(cfg.payMethods.map((p, i) => `<label class="opt"><input type="radio" name="${name}" value="${esc(p)}" ${!includeNone && i === 0 ? 'checked' : ''}>${p === 'الخزنة' ? 'من الخزنة' : esc(p) + ' دفع من جيبه'}</label>`)).join('');
}
const supplierList = cfg => `<datalist id="suppliers">${(cfg.suppliers || []).map(s => `<option value="${esc(s)}">`).join('')}</datalist>`;
const hoshaChips = cfg => `<div class="chips" data-seg="hosha">${cfg.hoshas.map((h, i) => `<button type="button" data-v="${esc(h.name)}" aria-pressed="${i === 0}">${esc(String(h.name).replace('حوشة ', ''))}</button>`).join('')}</div>`;

async function viewExpense() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewExpense); }
  view().innerHTML = `${bar('تسجيل مصروف', '#add')}<div class="wrap"><form id="f" novalidate>
    <div class="grid2">
      <div class="field"><label for="date">التاريخ</label><input id="date" type="date" value="${today()}" required></div>
      <div class="field"><label for="amount">المبلغ (ج.م)</label><input id="amount" type="number" inputmode="decimal" min="0" step="any" required></div>
    </div>
    <div class="field"><label for="item">البند</label><select id="item">${itemOptions(cfg, i => i.group !== 'أصول')}</select></div>
    <fieldset><legend>يتحمّل على</legend>
      <div class="seg" data-seg="ctype"><button type="button" data-v="hosha" aria-pressed="true">حوشة محددة</button><button type="button" data-v="shared" aria-pressed="false">مشترك (يتوزع بالمساحة)</button></div>
      <div id="hoshaBox">${hoshaChips(cfg)}</div>
    </fieldset>
    <fieldset><legend>مين دفع؟</legend>${payOptions(cfg, 'paid')}<p class="hint" id="payHint"></p></fieldset>
    <div class="field"><label for="supplier">المورد / المقاول</label><input id="supplier" list="suppliers" placeholder="اختار أو اكتب اسم">${supplierList(cfg)}</div>
    <div class="field"><label for="desc">البيان</label><input id="desc" placeholder="مثال: تسوية بالليزر"></div>
    <div class="field"><label for="doc">رقم الفاتورة / الإيصال</label><input id="doc"></div>
    <button class="btn" type="submit">حفظ المصروف</button>
  </form></div>`;
  const f = $('#f');
  segInit(f, (seg, v) => { if (seg === 'ctype') $('#hoshaBox').hidden = v !== 'hosha'; });
  const hint = () => { const p = radioVal('paid'); $('#payHint').textContent = p && p !== 'الخزنة' ? `المبلغ هيتحسب لـ${p} كأنه ورّده، والمصروف نفسه بيتقسم على الشريكين حسب النسبة.` : ''; };
  f.addEventListener('change', hint); hint();
  submitWith(f, 'addExpense', () => {
    const amount = Number($('#amount').value);
    if (!(amount > 0)) throw new Error('اكتب المبلغ');
    return {
      date: $('#date').value, amount, item: $('#item').value,
      center: segVal('ctype') === 'shared' ? 'مشترك' : segVal('hosha'),
      paidBy: radioVal('paid'), supplier: $('#supplier').value, desc: $('#desc').value, docNo: $('#doc').value,
    };
  }, () => { CFG = null; store.del('cfg'); $('#amount').value = ''; $('#desc').value = ''; $('#doc').value = ''; });
}

async function viewMove() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewMove); }
  const types = [
    ['توريد للخزنة', 'توريد فلوس للخزنة'],
    ['سحب من الخزنة', 'سحب فلوس من الخزنة'],
    ['تسوية مدفوعة', 'دفع للشريك التاني مباشرة (تسوية)'],
  ];
  view().innerHTML = `${bar('حركة شريك', '#add')}<div class="wrap"><form id="f" novalidate>
    <fieldset><legend>الشريك</legend><div class="seg" data-seg="partner">${cfg.partners.map((p, i) => `<button type="button" data-v="${esc(p.name)}" aria-pressed="${i === 0}">${esc(p.name)}</button>`).join('')}</div></fieldset>
    <fieldset><legend>نوع الحركة</legend>${types.map((t, i) => `<label class="opt"><input type="radio" name="type" value="${t[0]}" ${i === 0 ? 'checked' : ''}>${t[1]}</label>`).join('')}</fieldset>
    <div class="grid2">
      <div class="field"><label for="date">التاريخ</label><input id="date" type="date" value="${today()}"></div>
      <div class="field"><label for="amount">المبلغ (ج.م)</label><input id="amount" type="number" inputmode="decimal" min="0" step="any"></div>
    </div>
    <div class="field"><label for="desc">البيان</label><input id="desc" placeholder="مثال: تحويل بنكي"></div>
    <p class="hint">التسوية بتتسجل على الاتنين مرة واحدة: على اللي دفع كمدفوعة، وعلى التاني كمستلمة.</p>
    <button class="btn" type="submit">حفظ الحركة</button>
  </form></div>`;
  const f = $('#f'); segInit(f);
  submitWith(f, 'addMove', () => {
    const amount = Number($('#amount').value);
    if (!(amount > 0)) throw new Error('اكتب المبلغ');
    return { date: $('#date').value, partner: segVal('partner'), type: radioVal('type'), amount, desc: $('#desc').value };
  }, () => { $('#amount').value = ''; $('#desc').value = ''; });
}

async function viewSale() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewSale); }
  const partners = cfg.partners.map(p => p.name);
  view().innerHTML = `${bar('بيع محصول', '#add')}<div class="wrap"><form id="f" novalidate>
    <div class="grid2">
      <div class="field"><label for="date">التاريخ</label><input id="date" type="date" value="${today()}"></div>
      <div class="field"><label for="hosha">الحوشة</label><select id="hosha">${cfg.hoshas.map(h => `<option>${esc(h.name)}</option>`).join('')}</select></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="crop">المحصول</label><input id="crop"></div>
      <div class="field"><label for="buyer">التاجر</label><input id="buyer"></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="qty">الكمية (كجم)</label><input id="qty" type="number" inputmode="decimal" min="0" step="any"></div>
      <div class="field"><label for="price">السعر (ج/كجم)</label><input id="price" type="number" inputmode="decimal" min="0" step="any"></div>
    </div>
    <div class="total-box"><span class="muted">إجمالي البيعة</span><span class="mid" id="total">0 ج.م</span></div>
    <fieldset><legend>الفلوس راحت فين؟</legend>
      <label class="opt"><input type="radio" name="dest" value="الخزنة" checked>دخلت خزنة المزرعة</label>
      <label class="opt"><input type="radio" name="dest" value="توزيع على الشريكين">اتوزعت على الشريكين حسب النسبة</label>
      ${partners.map(p => `<label class="opt"><input type="radio" name="dest" value="${esc(p)}">استلمها ${esc(p)} كلها</label>`).join('')}
      <label class="opt"><input type="radio" name="dest" value="تقسيم">جزء للخزنة والباقي اتوزع</label>
      <div class="field" id="splitBox" hidden><label for="toBox">المبلغ اللي دخل الخزنة</label><input id="toBox" type="number" inputmode="decimal" min="0" step="any"></div>
    </fieldset>
    <section class="card" id="impact"></section>
    <div class="field"><label for="notes">ملاحظات</label><input id="notes"></div>
    <button class="btn" type="submit">حفظ البيعة</button>
  </form></div>`;
  const f = $('#f');
  const calc = () => {
    const total = (Number($('#qty').value) || 0) * (Number($('#price').value) || 0);
    $('#total').textContent = fmt(total) + ' ج.م';
    const dest = radioVal('dest');
    $('#splitBox').hidden = dest !== 'تقسيم';
    const eff = {}; partners.forEach(p => { eff[p] = 0; });
    if (partners.indexOf(dest) !== -1) {
      cfg.partners.forEach(p => { eff[p.name] = (p.name === dest ? -total : 0) + p.share * total; });
    }
    const rows = partners.map(p => `<div class="row"><span>${esc(p)}</span><b class="${eff[p] > 0.5 ? 'pos' : eff[p] < -0.5 ? 'neg' : ''}">${signed(eff[p])}</b></div>`).join('');
    $('#impact').innerHTML = `<b style="font-size:13px">الأثر على ميزان الشركاء</b>${rows}`;
  };
  f.addEventListener('input', calc); f.addEventListener('change', calc); calc();
  submitWith(f, 'addSale', () => {
    const qty = Number($('#qty').value), price = Number($('#price').value);
    if (!(qty > 0) || !(price > 0)) throw new Error('اكتب الكمية والسعر');
    return {
      date: $('#date').value, hosha: $('#hosha').value, crop: $('#crop').value, buyer: $('#buyer').value,
      qty, price, dest: radioVal('dest'), toTreasury: Number($('#toBox').value) || 0, notes: $('#notes').value,
    };
  }, () => { $('#qty').value = ''; $('#price').value = ''; calc(); });
}

async function viewAsset() {
  loading();
  let cfg; try { cfg = await loadConfig(); } catch (e) { return errorView(e, viewAsset); }
  view().innerHTML = `${bar('أصل ثابت', '#add')}<div class="wrap"><form id="f" novalidate>
    <div class="field"><label for="name">الأصل</label><input id="name" placeholder="مثال: بير ارتوازي، طلمبة، سور"></div>
    <div class="grid2">
      <div class="field"><label for="date">تاريخ التشغيل</label><input id="date" type="date" value="${today()}"></div>
      <div class="field"><label for="life">العمر (سنوات)</label><input id="life" type="number" inputmode="decimal" min="0" step="any" value="10"></div>
    </div>
    <div class="field"><label for="cost">التكلفة (ج.م)</label><input id="cost" type="number" inputmode="decimal" min="0" step="any"></div>
    <div class="field"><label for="center">يتحمّل على</label><select id="center"><option value="مشترك">كل الحوش (مشترك بالمساحة)</option>${cfg.hoshas.map(h => `<option>${esc(h.name)}</option>`).join('')}</select></div>
    <fieldset><legend>الفلوس اتدفعت منين؟</legend>${payOptions(cfg, 'paid', true)}</fieldset>
    <div class="field"><label for="supplier">المورد</label><input id="supplier" list="suppliers">${supplierList(cfg)}</div>
    <p class="hint">الأصل بيتهلك كل شهر على عمره، والإهلاك بيتوزع على الحوش. ولو اخترت مين دفع، المبلغ بيتسجل في اليومية كمان عشان الخزنة وميزان الشركاء.</p>
    <button class="btn" type="submit">حفظ الأصل</button>
  </form></div>`;
  const f = $('#f');
  submitWith(f, 'addAsset', () => {
    if (!$('#name').value.trim()) throw new Error('اكتب اسم الأصل');
    const cost = Number($('#cost').value), life = Number($('#life').value);
    if (!(cost > 0) || !(life > 0)) throw new Error('اكتب التكلفة والعمر');
    return { name: $('#name').value.trim(), date: $('#date').value, cost, life, center: $('#center').value, paidBy: radioVal('paid'), supplier: $('#supplier').value };
  }, () => { location.hash = '#home'; });
}

// ===================== السجل والشركاء =====================
function viewJournal() { showCached('journal', () => api.get('journal'), renderJournal, viewJournal); }
function renderJournal(items) {
  const label = { expense: 'مصروف', move: 'شريك', sale: 'بيع' };
  const sub = i => i.kind === 'expense' ? `${esc(i.center)} · ${esc(i.by)}${i.supplier ? ' · ' + esc(i.supplier) : ''}`
    : i.kind === 'move' ? esc(i.partner) : `${esc(i.center)} · ${esc(i.dest)}${i.buyer ? ' · ' + esc(i.buyer) : ''}`;
  view().innerHTML = `${bar('السجل', '', `<a class="icon-btn" href="#journal" onclick="markStale();route();return false" aria-label="تحديث">${ICON.refresh}</a>`)}
  <div class="wrap"><div class="list">${items.length ? items.map(i => `<div class="item"><div>
    <div class="t">${esc(i.title)}<span class="tag">${label[i.kind]}</span></div>
    <div class="s">${esc(i.date)} · ${sub(i)}${i.desc ? ' · ' + esc(i.desc) : ''}</div></div>
    <span class="a ${i.kind === 'sale' ? 'pos' : ''}">${fmt(i.amount)}</span></div>`).join('') : '<div class="empty">لسه مفيش حركات. ابدأ من زرار + تحت.</div>'}</div>
  <p class="hint">التعديل والمسح بيتعملوا من الشيت نفسه.</p></div>`;
}

function viewPartners() { showCached('partners', () => api.get('partners'), renderPartners, viewPartners); }
function renderPartners(d) {
  const card = p => {
    const cls = p.balance > 0.5 ? 'pos' : p.balance < -0.5 ? 'neg' : '';
    const line = (l, v) => `<div class="row"><span class="muted">${l}</span><span>${fmt(v)}</span></div>`;
    return `<section class="card" style="border:2px solid ${p.balance > 0.5 ? 'var(--pos)' : p.balance < -0.5 ? 'var(--neg)' : 'var(--border)'}">
      <div class="row"><h2>${esc(p.name)} <span class="muted">(${Math.round(p.share * 100)}%)</span></h2><b class="${cls}" style="font-size:18px">${signed(p.balance)} ${esc(p.status)}</b></div>
      ${line('توريدات للخزنة', p.contributions)}${line('مدفوع من جيبه', p.outOfPocket)}${line('تسويات دفعها', p.settlementsPaid)}
      ${line('سحب من الخزنة', p.withdrawals)}${line('تسويات استلمها', p.settlementsReceived)}${line('مبيعات استلمها', p.salesReceived)}${line('نصيبه من مبيعات موزعة', p.salesShare)}
      <div class="row" style="border-top:1px solid var(--border);padding-top:6px"><b>صافي المدفوع</b><b>${fmt(p.net)}</b></div>
      <div class="row"><span class="muted">المفروض حسب النسبة</span><span>${fmt(p.fair)}</span></div></section>`;
  };
  view().innerHTML = `${bar('الشركاء')}<div class="wrap">${d.rows.map(card).join('')}
    <div class="note">${esc(d.settleText)}</div>
    <a class="btn" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="#move">تسجيل توريد أو تسوية</a></div>`;
}
