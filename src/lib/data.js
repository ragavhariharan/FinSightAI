import { fetchTransactions, purgePhantomTransactions } from './api/transactions';
import { fetchBudgetsWithSpent } from './api/budgets';
import { ensureSnapshot } from './api/dashboard';
import { DEMO_BUDGETS } from './demoData';
import { recomputeSnapshotFromTransactions, recomputeBudgetsFromTransactions, sortTransactionsDesc } from './snapshot';
import { userTransactionsOnly } from './format';

const DEMO_TX_KEY = 'finsight_demo_transactions';
const DEMO_TX_VERSION_KEY = 'finsight_demo_tx_version';
const DEMO_TX_VERSION = '4';

export function clearDemoSession() {
  try {
    localStorage.removeItem(DEMO_TX_KEY);
    localStorage.setItem(DEMO_TX_VERSION_KEY, DEMO_TX_VERSION);
  } catch { /* ignore */ }
}

export function saveDemoTransactions(transactions) {
  try {
    localStorage.setItem(DEMO_TX_KEY, JSON.stringify(userTransactionsOnly(transactions)));
    localStorage.setItem(DEMO_TX_VERSION_KEY, DEMO_TX_VERSION);
  } catch { /* ignore */ }
}

function loadDemoTransactions() {
  try {
    if (localStorage.getItem(DEMO_TX_VERSION_KEY) !== DEMO_TX_VERSION) {
      clearDemoSession();
      return [];
    }
    const raw = localStorage.getItem(DEMO_TX_KEY);
    if (raw) return userTransactionsOnly(JSON.parse(raw));
  } catch { /* ignore */ }
  return [];
}

export async function loadAppData(isDemoMode) {
  if (isDemoMode) {
    const transactions = sortTransactionsDesc(loadDemoTransactions());
    const budgets = recomputeBudgetsFromTransactions(transactions, DEMO_BUDGETS.map(b => ({ ...b })));
    const snapshot = recomputeSnapshotFromTransactions(transactions, budgets);
    return { transactions, budgets, snapshot };
  }

  await purgePhantomTransactions();

  const [transactions, budgets, snapshot] = await Promise.all([
    fetchTransactions(),
    fetchBudgetsWithSpent(),
    ensureSnapshot(),
  ]);

  return { transactions, budgets, snapshot: snapshot || {} };
}
