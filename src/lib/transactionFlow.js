import { mapTransactionRow } from './format';
import { insertTransaction, deleteTransaction } from './api/transactions';
import { fetchAccounts, adjustAccountBalance, defaultAccount } from './accounts';
import { recomputeSnapshotFromTransactions, recomputeBudgetsFromTransactions, sortTransactionsDesc } from './snapshot';
import { saveDemoTransactions } from './data';

export async function resolveAccountName(isDemoMode, accountName) {
  const accounts = await fetchAccounts(isDemoMode);
  if (accountName && accounts.some(a => a.name === accountName)) return accountName;
  const def = defaultAccount(accounts);
  return def?.name || accountName || 'Main';
}

/** Apply a new transaction everywhere: list, snapshot, budgets, account balance */
export async function recordTransaction({
  isDemoMode,
  state,
  up,
  refreshAppData,
  payload,
}) {
  const account = await resolveAccountName(isDemoMode, payload.account);
  const row = {
    txn_date: payload.txn_date || new Date().toISOString().slice(0, 10),
    name: payload.name,
    amount: Number(payload.amount),
    category: payload.category,
    emoji: payload.emoji || '💰',
    account,
    notes: payload.isRecurring ? 'recurring' : payload.notes,
    source: payload.source || 'manual',
  };

  if (isDemoMode) {
    const mapped = mapTransactionRow({ id: Date.now(), ...row });
    const transactions = sortTransactionsDesc([mapped, ...state.transactions]);
    const budgets = recomputeBudgetsFromTransactions(transactions, state.budgets || []);
    const snapshot = recomputeSnapshotFromTransactions(transactions, budgets);
    await adjustAccountBalance(true, account, row.amount);
    saveDemoTransactions(transactions);
    up({ transactions, budgets, snapshot });
    return mapped;
  }

  const created = await insertTransaction({
    ...row,
    account,
    notes: row.notes,
  });
  await adjustAccountBalance(false, account, row.amount);
  if (refreshAppData) await refreshAppData();
  return created;
}

/** Reverse a deleted transaction */
export async function undoTransaction({
  isDemoMode,
  state,
  up,
  refreshAppData,
  tx,
}) {
  if (!tx) return;

  if (isDemoMode) {
    const transactions = sortTransactionsDesc(state.transactions.filter(t => t.id !== tx.id));
    const budgets = recomputeBudgetsFromTransactions(transactions, state.budgets || []);
    const snapshot = recomputeSnapshotFromTransactions(transactions, budgets);
    await adjustAccountBalance(true, tx.account, -tx.amount);
    saveDemoTransactions(transactions);
    up({ transactions, budgets, snapshot });
    return;
  }

  await deleteTransaction(tx.id);
  await adjustAccountBalance(false, tx.account, -tx.amount);
  if (refreshAppData) await refreshAppData();
}
