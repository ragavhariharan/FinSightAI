import { chartColor } from './chartColors';

export function formatRupee(n, { signed = false } = {}) {
  const val = Number(n) || 0;
  const str = '₹' + Math.abs(val).toLocaleString('en-IN');
  if (signed && val > 0) return '+' + str;
  if (val < 0) return '-' + str;
  return str;
}

export function formatTxnDate(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function currentMonthLabel() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function currentMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function gaugeFromScore(score) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  const cx = 60, cy = 60, r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - s / 100);
  const color = s >= 70 ? '#62D492' : s >= 50 ? '#D97706' : '#C53030';
  return { score: s, color, circumference: circ.toFixed(1), dashOffset: offset.toFixed(1), transform: `rotate(-90 ${cx} ${cy})` };
}

export function forecastPathsFromPoints(points) {
  const raw = Array.isArray(points) && points.length ? points.map(Number) : [0];
  const w = 560, h = 110, pad = 8;
  const min = Math.min(...raw, 0);
  const max = Math.max(...raw, 1);
  const range = max - min || 1;
  const pts = raw.map((d, i) => ({
    x: (i / Math.max(raw.length - 1, 1)) * w,
    y: h - pad - ((d - min) / range) * (h - pad * 2),
    value: d,
  }));
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  const area = line + ` L ${w} ${h} L 0 ${h} Z`;
  return { line, area, pts, min, max };
}

export function donutPathsFromSegments(segments) {
  const cats = (segments || []).filter(s => s.amount > 0);
  if (!cats.length) return [];
  const total = cats.reduce((s, c) => s + c.amount, 0);
  const cx = 100, cy = 100, R = 78, r = 50;
  let a = -Math.PI / 2;
  return cats.map((c, i) => {
    const da = (c.amount / total) * 2 * Math.PI;
    const ea = a + da;
    const g = 0.022;
    const sa = a + g, fa = ea - g;
    const large = (fa - sa) > Math.PI ? 1 : 0;
    const x1 = (cx + R * Math.cos(sa)).toFixed(1), y1 = (cy + R * Math.sin(sa)).toFixed(1);
    const x2 = (cx + R * Math.cos(fa)).toFixed(1), y2 = (cy + R * Math.sin(fa)).toFixed(1);
    const x3 = (cx + r * Math.cos(fa)).toFixed(1), y3 = (cy + r * Math.sin(fa)).toFixed(1);
    const x4 = (cx + r * Math.cos(sa)).toFixed(1), y4 = (cy + r * Math.sin(sa)).toFixed(1);
    const d = `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
    a = ea;
    return {
      ...c,
      color: chartColor(i),
      d,
      pct: ((c.amount / total) * 100).toFixed(1),
      totalStr: formatRupee(c.amount),
    };
  });
}

import { isPhantomTransaction } from './phantomTransactions';

/** User-logged transactions only — excludes seed/demo rows */
export function isUserTransaction(tx) {
  if (!tx) return false;
  if (tx.source === 'seed') return false;
  if (isPhantomTransaction(tx)) return false;
  // Legacy demo rows stored in localStorage before v3 (numeric ids 1–13)
  if (typeof tx.id === 'number' && tx.id >= 1 && tx.id <= 13) return false;
  return true;
}

export function userTransactionsOnly(transactions = []) {
  return transactions.filter(isUserTransaction);
}

export function mapTransactionRow(row) {
  return {
    id: row.id,
    date: formatTxnDate(row.txn_date),
    txn_date: row.txn_date,
    name: row.name,
    category: row.category,
    emoji: row.emoji || '💰',
    account: row.account || 'Main',
    amount: Number(row.amount),
    amountStr: formatRupee(row.amount, { signed: true }),
    amountColor: row.amount > 0 ? 'var(--fs-success)' : 'var(--fs-text)',
    notes: row.notes,
    source: row.source,
  };
}

export function filterTransactions(transactions, opts = {}) {
  const {
    search = '',
    type = 'all',
    period = 'month',
    category = '',
    recurringOnly = false,
    recurringNames = new Set(),
    sort = 'date_desc',
  } = opts;

  const q = search.toLowerCase();
  let list = transactions.filter(t => {
    if (q && !t.name.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
    if (type === 'income' && t.amount <= 0) return false;
    if (type === 'expense' && t.amount >= 0) return false;
    if (category && t.category !== category) return false;
    if (recurringOnly && !recurringNames.has(t.name.toLowerCase())) return false;
    return true;
  });

  const now = new Date();
  const cutoff = new Date(now);
  if (period === 'day') cutoff.setDate(now.getDate() - 1);
  else if (period === '10d') cutoff.setDate(now.getDate() - 10);
  else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
  else if (period === '2month') cutoff.setMonth(now.getMonth() - 2);

  if (period !== 'all') {
    list = list.filter(t => {
      const d = new Date(t.txn_date || t.date);
      return !Number.isNaN(d.getTime()) && d >= cutoff;
    });
  }

  if (sort === 'amount_asc') list.sort((a, b) => a.amount - b.amount);
  else if (sort === 'amount_desc') list.sort((a, b) => b.amount - a.amount);
  else list.sort((a, b) => (b.txn_date || b.date).localeCompare(a.txn_date || a.date));

  return list;
}

export function groupTransactions(transactions, search = '', opts = {}) {
  const filtered = typeof search === 'object' && search !== null
    ? filterTransactions(transactions, search)
    : filterTransactions(transactions, { search, ...opts });
  const map = {};
  filtered.forEach(t => {
    if (!map[t.date]) map[t.date] = { date: t.date, items: [] };
    map[t.date].items.push(t);
  });
  return Object.values(map).map(g => {
    const net = g.items.reduce((s, t) => s + t.amount, 0);
    return {
      ...g,
      totalStr: formatRupee(net, { signed: true }),
    };
  });
}
