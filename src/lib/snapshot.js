import { categoryMeta } from './categories';

function inCurrentMonth(txnDate) {
  const d = new Date(txnDate);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function recomputeBudgetsFromTransactions(transactions, budgets = []) {
  const spent = {};
  transactions.filter(t => t.amount < 0 && inCurrentMonth(t.txn_date)).forEach(t => {
    spent[t.category] = (spent[t.category] || 0) + Math.abs(t.amount);
  });
  return budgets.map(b => ({ ...b, spent: spent[b.cat] || 0 }));
}

/** Client-side snapshot recompute — keeps dashboard/reports in sync with transactions */
export function recomputeSnapshotFromTransactions(transactions = [], budgets = []) {
  const monthTx = transactions.filter(t => inCurrentMonth(t.txn_date));
  const income = monthTx.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spend = monthTx.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const net = income - spend;
  const rate = income > 0 ? Math.round((net / income) * 1000) / 10 : 0;

  const catMap = {};
  monthTx.filter(t => t.amount < 0).forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount);
  });
  const totalCat = Object.values(catMap).reduce((s, v) => s + v, 0) || 1;
  const donut_segments = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      name,
      amount,
      pct: Math.round((amount / totalCat) * 1000) / 10,
      color: categoryMeta(name).color,
    }));

  const updatedBudgets = recomputeBudgetsFromTransactions(transactions, budgets);
  const totalLimit = updatedBudgets.reduce((s, b) => s + (b.limit || 0), 0);
  const totalSpentBudget = updatedBudgets.reduce((s, b) => s + (b.spent || 0), 0);
  const budget_used_pct = totalLimit ? Math.min(100, Math.round((totalSpentBudget / totalLimit) * 100)) : 0;

  const day = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projected = day > 0 ? Math.round((net / day) * daysInMonth) : net;
  const points = Array.from({ length: 30 }, (_, i) => Math.round((projected / 29) * i));

  const expenses = monthTx.filter(t => t.amount < 0);
  const largest = expenses.length ? Math.max(...expenses.map(t => Math.abs(t.amount))) : 0;

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
    health_score: rate >= 25 ? 78 : rate >= 15 ? 68 : rate >= 0 ? 52 : 35,
    health_label: rate >= 20 ? 'Good standing' : rate >= 0 ? 'Watch spending' : 'Overspending',
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
