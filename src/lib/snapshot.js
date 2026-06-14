import { chartColor } from './chartColors';

function inCurrentMonth(txnDate) {
  const d = new Date(txnDate);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

/** Cumulative month-to-date savings with run-rate projection for remaining days */
export function buildSavingsForecastPoints(monthTx, today, daysInMonth, projectedTotal) {
  const dailyNet = {};
  monthTx.forEach(t => {
    const d = new Date(`${t.txn_date}T12:00:00`).getDate();
    dailyNet[d] = (dailyNet[d] || 0) + Number(t.amount);
  });

  const points = [];
  let cumulative = 0;
  const safeToday = Math.max(1, today);

  for (let d = 1; d <= daysInMonth; d++) {
    if (d <= today) {
      cumulative += dailyNet[d] || 0;
      points.push(Math.round(cumulative));
    } else {
      const netSoFar = points[today - 1] ?? cumulative;
      const remaining = daysInMonth - safeToday;
      const step = remaining > 0 ? (projectedTotal - netSoFar) / remaining : 0;
      points.push(Math.round(netSoFar + step * (d - safeToday)));
    }
  }

  return points;
}

export function recomputeBudgetsFromTransactions(transactions, budgets = []) {
  const spent = {};
  transactions.filter(t => t.amount < 0 && inCurrentMonth(t.txn_date)).forEach(t => {
    spent[t.category] = (spent[t.category] || 0) + Math.abs(t.amount);
  });
  return budgets.map(b => ({ ...b, spent: spent[b.cat] || 0 }));
}

/** Health score aligned with Postgres recompute_dashboard_snapshot */
export function computeHealthScore({ savings_rate_pct = 0, budget_used_pct = 0, hasActivity = false }) {
  if (!hasActivity) return null;
  const rate = Number(savings_rate_pct) || 0;
  let health = 50 + Math.floor(rate / 2);
  if (budget_used_pct > 100) health -= 15;
  else if (budget_used_pct > 90) health -= 8;
  return Math.min(100, Math.max(0, health));
}

export function healthLabelForScore(score, rate = 0) {
  if (score == null) return 'Add transactions to score';
  if (score >= 70) return 'Good standing';
  if (score >= 50) return rate >= 0 ? 'Fair' : 'Needs attention';
  return 'Needs attention';
}

/** Client-side snapshot recompute — keeps dashboard/reports in sync with transactions */
export function recomputeSnapshotFromTransactions(transactions = [], budgets = []) {
  const monthTx = transactions.filter(t => inCurrentMonth(t.txn_date));
  const income = monthTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spend = monthTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - spend;
  const rate = income > 0 ? Math.round((net / income) * 1000) / 10 : 0;
  const hasActivity = monthTx.length > 0;

  const catMap = {};
  monthTx.filter(t => t.amount < 0).forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
  });
  const totalCat = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
  const donut_segments = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], i) => ({
      name,
      amount,
      pct: Math.round((amount / totalCat) * 1000) / 10,
      color: chartColor(i),
    }));

  const updatedBudgets = recomputeBudgetsFromTransactions(transactions, budgets);
  const totalLimit = updatedBudgets.reduce((s, b) => s + (b.limit || 0), 0);
  const totalSpentBudget = updatedBudgets.reduce((s, b) => s + (b.spent || 0), 0);
  const budget_used_pct = totalLimit ? Math.min(100, Math.round((totalSpentBudget / totalLimit) * 100)) : 0;

  const day = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projected = day > 0 ? Math.round((net / day) * daysInMonth) : net;
  const points = buildSavingsForecastPoints(monthTx, day, daysInMonth, projected);

  const expenses = monthTx.filter(t => t.amount < 0);
  const largest = expenses.length ? Math.max(...expenses.map(t => Math.abs(t.amount))) : 0;
  const health_score = computeHealthScore({ savings_rate_pct: rate, budget_used_pct, hasActivity });

  return {
    monthly_income: income,
    monthly_spend: spend,
    net_savings: net,
    savings_rate_pct: rate,
    total_budget_limit: totalLimit,
    budget_used_pct,
    donut_segments,
    transaction_count: monthTx.length,
    largest_expense: largest,
    health_score,
    health_label: healthLabelForScore(health_score, rate),
    forecast: { projected_savings: projected, points },
    leaks: [],
    spending_dna: {},
  };
}

export function sortTransactionsDesc(transactions = []) {
  return [...transactions].sort((a, b) => {
    const d = (b.txn_date || '').localeCompare(a.txn_date || '');
    if (d !== 0) return d;
    return (b.id || 0) - (a.id || 0);
  });
}
