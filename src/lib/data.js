import { fetchTransactions, purgePhantomTransactions } from './api/transactions';
import { fetchBudgetsWithSpent } from './api/budgets';
import { ensureSnapshot } from './api/dashboard';
import { recomputeSnapshotFromTransactions, recomputeBudgetsFromTransactions } from './snapshot';

export async function loadAppData() {
  await purgePhantomTransactions();

  const [transactions, rawBudgets, dbSnapshot] = await Promise.all([
    fetchTransactions(),
    fetchBudgetsWithSpent(),
    ensureSnapshot(),
  ]);

  const budgets = recomputeBudgetsFromTransactions(transactions, rawBudgets);
  const computed = recomputeSnapshotFromTransactions(transactions, budgets);
  const snapshot = {
    ...(dbSnapshot || {}),
    ...computed,
    forecast: computed.forecast,
    donut_segments: computed.donut_segments?.length ? computed.donut_segments : (dbSnapshot?.donut_segments || []),
    leaks: dbSnapshot?.leaks?.length ? dbSnapshot.leaks : computed.leaks,
  };

  return { transactions, budgets, snapshot };
}
