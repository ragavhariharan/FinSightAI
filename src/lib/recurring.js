/** Detect likely recurring expenses from transaction history */
function normalizeName(name = '') {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

function amountsSimilar(a, b, tolerance = 0.15) {
  const avg = (a + b) / 2;
  if (!avg) return a === b;
  return Math.abs(a - b) / avg <= tolerance;
}

function inferFrequency(dates) {
  if (dates.length < 2) return 'Recurring';
  const sorted = [...dates].map(d => new Date(d).getTime()).filter(Boolean).sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) gaps.push((sorted[i] - sorted[i - 1]) / 86400000);
  const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  if (avgGap <= 10) return 'Weekly';
  if (avgGap <= 20) return 'Bi-weekly';
  if (avgGap <= 45) return 'Monthly';
  return 'Recurring';
}

export function detectRecurring(transactions) {
  const expenses = transactions.filter(t => t.amount < 0);
  const flagged = expenses.filter(t => t.notes === 'recurring' || t.source === 'recurring');
  const groups = {};

  for (const tx of expenses) {
    const key = normalizeName(tx.name);
    if (!key) continue;
    if (!groups[key]) {
      groups[key] = { name: tx.name, category: tx.category, emoji: tx.emoji, amounts: [], dates: [], flagged: false };
    }
    groups[key].amounts.push(Math.abs(tx.amount));
    groups[key].dates.push(tx.txn_date);
    if (tx.notes === 'recurring' || tx.source === 'recurring') groups[key].flagged = true;
  }

  // Single flagged recurring transactions count immediately
  flagged.forEach(tx => {
    const key = normalizeName(tx.name);
    if (groups[key]) groups[key].flagged = true;
  });

  return Object.values(groups)
    .filter(g => g.flagged || g.amounts.length >= 2)
    .filter(g => {
      if (g.flagged) return true;
      const base = g.amounts[0];
      return g.amounts.every(a => amountsSimilar(a, base));
    })
    .map(g => {
      const avg = g.amounts.reduce((s, a) => s + a, 0) / g.amounts.length;
      const latest = [...g.dates].sort().reverse()[0];
      return {
        name: g.name,
        category: g.category,
        emoji: g.emoji,
        amount: Math.round(avg),
        frequency: inferFrequency(g.dates),
        count: g.amounts.length,
        lastDate: latest,
        flagged: g.flagged,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
