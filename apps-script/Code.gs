/**
 * مزرعة الملاك ميخائيل – ديروط
 * سكريبت الشيت: بيشتغل كـ API للأب.
 *
 * التركيب:
 * 1) من الشيت: Extensions ← Apps Script، والصق الملف ده مكان الكود الموجود.
 * 2) ارجع للشيت واعمل Refresh، هتلاقي قايمة "الأب" فوق ← "تحديد الكود السري".
 * 3) من Apps Script: Deploy ← New deployment ← Web app
 *    Execute as: Me    ،   Who has access: Anyone
 * 4) انسخ لينك الـ Web app وحطه في الأب أول مرة.
 */

const SH = {
  dash: 'الرئيسية',
  journal: 'اليومية',
  moves: 'حركات الشركاء',
  sales: 'المبيعات',
  assets: 'الأصول',
  hosha: 'الحوش',
  items: 'البنود',
  suppliers: 'الموردين',
  settings: 'الإعدادات',
};

// ===================== قايمة الشيت =====================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('الأب')
    .addItem('تحديد الكود السري', 'setAppKey')
    .addToUi();
}

function setAppKey() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('الكود السري للأب', 'اكتب كود من ٦ حروف أو أرقام على الأقل. أي حد هيستخدم الأب محتاج الكود ده.', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const key = String(res.getResponseText()).trim();
  if (key.length < 6) { ui.alert('الكود لازم يكون ٦ حروف أو أرقام على الأقل.'); return; }
  PropertiesService.getScriptProperties().setProperty('APP_KEY', key);
  ui.alert('تم حفظ الكود السري.');
}

// ===================== نقطة الدخول =====================
function doGet(e) {
  return handle_(e.parameter || {}, null);
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (err) { return out_({ ok: false, error: 'بيانات مش مفهومة' }); }
  return handle_(body, body.data || {});
}

function handle_(p, data) {
  try {
    const key = PropertiesService.getScriptProperties().getProperty('APP_KEY');
    if (!key) return out_({ ok: false, error: 'لسه ما اتحددش كود سري من الشيت (قايمة الأب)' });
    if (String(p.key || '') !== key) return out_({ ok: false, error: 'الكود السري غلط', auth: false });

    const a = p.action;
    let result;
    if (data === null) {
      if (a === 'ping') result = { pong: true };
      else if (a === 'config') result = getConfig_();
      else if (a === 'dashboard') result = getDashboard_();
      else if (a === 'journal') result = getRecent_(Number(p.limit) || 60);
      else if (a === 'hosha') result = getHosha_(p.name);
      else if (a === 'partners') result = getPartners_();
      else throw new Error('طلب غير معروف');
    } else {
      const lock = LockService.getScriptLock();
      lock.waitLock(20000);
      try {
        if (a === 'addExpense') result = addExpense_(data);
        else if (a === 'addMove') result = addMove_(data);
        else if (a === 'addSale') result = addSale_(data);
        else if (a === 'addAsset') result = addAsset_(data);
        else if (a === 'setYear') result = setYear_(data);
        else throw new Error('طلب غير معروف');
        SpreadsheetApp.flush();
      } finally { lock.releaseLock(); }
    }
    return out_({ ok: true, data: result });
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ===================== أدوات =====================
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sh_(name) {
  const s = ss_().getSheetByName(name);
  if (!s) throw new Error('مش لاقي تاب: ' + name);
  return s;
}
function nonEmpty_(arr) { return arr.map(r => r[0]).filter(v => v !== '' && v !== null); }
function col_(sheet, a1) { return nonEmpty_(sheet.getRange(a1).getValues()); }
function num_(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function fmtDate_(d) { return d instanceof Date ? Utilities.formatDate(d, 'Africa/Cairo', 'yyyy-MM-dd') : String(d || ''); }

function parseDate_(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) throw new Error('التاريخ مش مظبوط');
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** آخر صف فيه تاريخ في عمود B (بيتجاهل أعمدة المعادلات). */
function lastDataRow_(sheet) {
  const vals = sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1).getValues();
  for (let i = vals.length - 1; i >= 0; i--) if (vals[i][0] !== '' && vals[i][0] !== null) return i + 2;
  return 1;
}

function nextId_(sheet, lastRow) {
  if (lastRow < 2) return 1;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(r => num_(r[0]));
  return Math.max(0, ...ids) + 1;
}

/** بيكتب قيم في أعمدة معينة بس، عشان أعمدة المعادلات تفضل شغالة. */
function writeCols_(sheet, row, map) {
  Object.keys(map).forEach(c => sheet.getRange(row, Number(c)).setValue(map[c]));
}

function requireIn_(value, list, label) {
  if (list.indexOf(value) === -1) throw new Error(label + ' مش موجود في القوائم: ' + value);
}

function amount_(v, label) {
  const n = Number(v);
  if (!isFinite(n) || n <= 0) throw new Error((label || 'المبلغ') + ' لازم يكون رقم أكبر من صفر');
  return Math.round(n * 100) / 100;
}

function ensureSupplier_(name) {
  name = String(name || '').trim();
  if (!name) return '';
  const s = sh_(SH.suppliers);
  const names = col_(s, 'A2:A' + s.getMaxRows());
  if (names.indexOf(name) === -1) s.getRange(names.length + 2, 1).setValue(name);
  return name;
}

// ===================== القراءة =====================
function getConfig_() {
  const st = sh_(SH.settings);
  const h = sh_(SH.hosha).getRange('A2:H9').getValues();
  const it = sh_(SH.items).getRange('A2:B100').getValues().filter(r => r[0] !== '');
  const sup = sh_(SH.suppliers);
  return {
    farm: st.getRange('C4').getValue(),
    location: st.getRange('C5').getValue(),
    partners: st.getRange('B10:C11').getValues().filter(r => r[0] !== '').map(r => ({ name: r[0], share: num_(r[1]) })),
    hoshas: h.filter(r => r[0] !== '').map(r => ({ name: r[0], area: num_(r[1]), crop: r[2], variety: r[3], status: r[5], ratio: num_(r[7]) })),
    items: it.map(r => ({ name: r[0], group: r[1] })),
    payMethods: col_(st, 'B16:B18'),
    costCenters: col_(st, 'C16:C25'),
    moveTypes: col_(st, 'D16:D19'),
    saleDest: col_(st, 'E16:E19'),
    years: col_(st, 'G16:G26'),
    suppliers: col_(sup, 'A2:A' + sup.getMaxRows()),
    year: sh_(SH.dash).getRange('C4').getValue(),
  };
}

function getDashboard_() {
  const d = sh_(SH.dash);
  const k = d.getRange('B7:G7').getValues()[0];
  const p = d.getRange('B11:F12').getValues();
  const h = d.getRange('B17:H25').getValues();
  const m = d.getRange('B29:C40').getValues();
  return {
    year: d.getRange('C4').getValue(),
    kpis: { yearCost: num_(k[0]), totalCost: num_(k[1]), perFeddan: num_(k[2]), cash: num_(k[3]), yearSales: num_(k[4]), assets: num_(k[5]) },
    partners: p.filter(r => r[0] !== '').map(r => ({ name: r[0], share: num_(r[1]), net: num_(r[2]), balance: num_(r[3]), status: r[4] })),
    settleText: d.getRange('B13').getValue(),
    hoshas: h.slice(0, 8).map(r => ({ name: r[0], area: num_(r[1]), status: r[2], crop: r[3], yearCost: num_(r[4]), totalCost: num_(r[5]), perFeddan: num_(r[6]) })),
    total: { area: num_(h[8][1]), yearCost: num_(h[8][4]), totalCost: num_(h[8][5]), perFeddan: num_(h[8][6]) },
    monthly: m.map(r => ({ month: r[0], cost: num_(r[1]) })),
  };
}

function getPartners_() {
  const s = sh_('ميزان الشركاء');
  const rows = s.getRange('B4:N5').getValues();
  return {
    rows: rows.map(r => ({
      name: r[0], share: num_(r[1]), contributions: num_(r[2]), outOfPocket: num_(r[3]), settlementsPaid: num_(r[4]),
      withdrawals: num_(r[5]), settlementsReceived: num_(r[6]), salesReceived: num_(r[7]), salesShare: num_(r[8]),
      net: num_(r[9]), fair: num_(r[10]), balance: num_(r[11]), status: r[12],
    })),
    settleText: s.getRange('B8').getValue(),
  };
}

function getRecent_(limit) {
  const items = [];
  const j = sh_(SH.journal), jl = lastDataRow_(j);
  if (jl >= 2) j.getRange(2, 1, jl - 1, 14).getValues().forEach(r => {
    if (r[1] === '') return;
    items.push({ kind: 'expense', id: r[0], date: fmtDate_(r[1]), title: r[4], group: r[5], center: r[6], amount: num_(r[7]), by: r[8], supplier: r[9], desc: r[10] });
  });
  const m = sh_(SH.moves), ml = lastDataRow_(m);
  if (ml >= 2) m.getRange(2, 1, ml - 1, 8).getValues().forEach(r => {
    if (r[1] === '') return;
    items.push({ kind: 'move', id: r[0], date: fmtDate_(r[1]), title: r[4], partner: r[3], amount: num_(r[5]), desc: r[7] });
  });
  const s = sh_(SH.sales), sl = lastDataRow_(s);
  if (sl >= 2) s.getRange(2, 1, sl - 1, 12).getValues().forEach(r => {
    if (r[1] === '') return;
    items.push({ kind: 'sale', id: r[0], date: fmtDate_(r[1]), title: 'بيع ' + (r[5] || 'محصول'), center: r[4], buyer: r[6], amount: num_(r[9]), dest: r[10] });
  });
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return items.slice(0, limit);
}

function getHosha_(name) {
  const cfg = sh_(SH.hosha).getRange('A2:H9').getValues().find(r => r[0] === name);
  if (!cfg) throw new Error('الحوشة مش موجودة');
  const ratio = num_(cfg[7]), area = num_(cfg[1]);
  const groups = {};
  const recent = [];
  let direct = 0, shared = 0;
  const j = sh_(SH.journal), jl = lastDataRow_(j);
  if (jl >= 2) j.getRange(2, 1, jl - 1, 11).getValues().forEach(r => {
    if (r[1] === '') return;
    const amt = num_(r[7]);
    if (r[6] === name) {
      direct += amt;
      const g = r[5] || 'أخرى';
      groups[g] = (groups[g] || 0) + amt;
      recent.push({ date: fmtDate_(r[1]), title: r[4], amount: amt, by: r[8], desc: r[10], shared: false });
    } else if (r[6] === 'مشترك') {
      shared += amt;
      recent.push({ date: fmtDate_(r[1]), title: r[4], amount: amt * ratio, by: r[8], desc: r[10], shared: true });
    }
  });
  let dep = 0;
  const a = sh_(SH.assets), al = a.getRange('B2:B').getValues().filter(r => r[0] !== '').length;
  if (al) a.getRange(2, 1, a.getMaxRows() - 1, 11).getValues().forEach(r => {
    if (r[1] === '') return;
    if (r[5] === 'مشترك') dep += num_(r[9]) * ratio;
    else if (r[5] === name) dep += num_(r[9]);
  });
  const breakdown = Object.keys(groups).map(g => ({ name: g, amount: groups[g] }));
  if (shared) breakdown.push({ name: 'مصروفات مشتركة (نصيب الحوشة)', amount: shared * ratio });
  if (dep) breakdown.push({ name: 'إهلاك الأصول (نصيب الحوشة)', amount: dep });
  breakdown.sort((x, y) => y.amount - x.amount);
  const total = direct + shared * ratio + dep;
  recent.sort((x, y) => (x.date < y.date ? 1 : -1));
  return {
    name, area, crop: cfg[2], variety: cfg[3], status: cfg[5], ratio,
    total, perFeddan: area ? total / area : 0, breakdown, recent: recent.slice(0, 25),
  };
}

// ===================== الكتابة =====================
function addExpense_(d) {
  const cfg = getConfig_();
  requireIn_(d.item, cfg.items.map(x => x.name), 'البند');
  requireIn_(d.center, cfg.costCenters, 'مركز التكلفة');
  requireIn_(d.paidBy, cfg.payMethods, 'طريقة الدفع');
  const s = sh_(SH.journal);
  const last = lastDataRow_(s), row = last + 1, id = nextId_(s, last);
  writeCols_(s, row, {
    1: id, 2: parseDate_(d.date), 5: d.item, 7: d.center, 8: amount_(d.amount), 9: d.paidBy,
    10: ensureSupplier_(d.supplier), 11: d.desc || '', 12: d.docNo || '', 13: d.user || '', 14: d.notes || '',
  });
  return { id };
}

function addMove_(d) {
  const cfg = getConfig_();
  requireIn_(d.partner, cfg.partners.map(x => x.name), 'الشريك');
  requireIn_(d.type, cfg.moveTypes, 'نوع الحركة');
  const s = sh_(SH.moves);
  const amt = amount_(d.amount);
  const add = (partner, type, desc) => {
    const last = lastDataRow_(s), row = last + 1, id = nextId_(s, last);
    writeCols_(s, row, { 1: id, 2: parseDate_(d.date), 4: partner, 5: type, 6: amt, 8: desc || '' });
    return id;
  };
  const ids = [add(d.partner, d.type, d.desc)];
  // التسوية بين الشريكين بتتسجل مرتين: مدفوعة على اللي دفع، ومستلمة على التاني.
  if (d.type === 'تسوية مدفوعة') {
    const other = cfg.partners.map(x => x.name).find(n => n !== d.partner);
    if (other) ids.push(add(other, 'تسوية مستلمة', (d.desc ? d.desc + ' – ' : '') + 'من ' + d.partner));
  }
  return { ids };
}

function addSale_(d) {
  const cfg = getConfig_();
  requireIn_(d.hosha, cfg.hoshas.map(x => x.name), 'الحوشة');
  const s = sh_(SH.sales);
  const qty = amount_(d.qty, 'الكمية'), price = amount_(d.price, 'السعر');
  const total = qty * price;
  const parts = [];
  if (d.dest === 'تقسيم') {
    const toBox = Number(d.toTreasury) || 0;
    if (toBox <= 0 || toBox >= total) throw new Error('المبلغ اللي داخل الخزنة لازم يكون أقل من إجمالي البيعة');
    parts.push({ dest: 'الخزنة', qty: qty * (toBox / total) });
    parts.push({ dest: 'توزيع على الشريكين', qty: qty * (1 - toBox / total) });
  } else {
    requireIn_(d.dest, cfg.saleDest, 'وجهة الفلوس');
    parts.push({ dest: d.dest, qty });
  }
  const ids = parts.map(p => {
    const last = lastDataRow_(s), row = last + 1, id = nextId_(s, last);
    writeCols_(s, row, {
      1: id, 2: parseDate_(d.date), 5: d.hosha, 6: d.crop || '', 7: d.buyer || '', 8: Math.round(p.qty * 1000) / 1000,
      9: price, 11: p.dest, 12: d.notes || '',
    });
    return id;
  });
  return { ids, total };
}

function addAsset_(d) {
  const cfg = getConfig_();
  const centers = cfg.costCenters.filter(c => c !== 'أصل ثابت');
  requireIn_(d.center, centers, 'يتحمّل على');
  const life = amount_(d.life, 'العمر');
  const cost = amount_(d.cost, 'التكلفة');
  const s = sh_(SH.assets);
  const names = col_(s, 'B2:B' + s.getMaxRows());
  const row = names.length + 2;
  const code = 'A' + (names.length + 1);
  writeCols_(s, row, { 1: code, 2: d.name, 3: parseDate_(d.date), 4: cost, 5: life, 6: d.center, 12: d.notes || '' });
  let journalId = null;
  if (d.paidBy) {
    const assetItem = cfg.items.find(x => x.group === 'أصول');
    if (!assetItem) throw new Error('مفيش بند في مجموعة "أصول" في تاب البنود');
    journalId = addExpense_({ date: d.date, item: assetItem.name, center: 'أصل ثابت', amount: cost, paidBy: d.paidBy, supplier: d.supplier, desc: d.name, user: d.user }).id;
  }
  return { code, journalId };
}

function setYear_(d) {
  const y = Number(d.year);
  if (getConfig_().years.indexOf(y) === -1) throw new Error('السنة مش في القايمة');
  sh_(SH.dash).getRange('C4').setValue(y);
  return { year: y };
}
