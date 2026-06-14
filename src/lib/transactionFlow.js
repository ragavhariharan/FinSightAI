import { insertTransaction, deleteTransaction } from './api/transactions';
import { fetchAccounts, adjustAccountBalance, defaultAccount } from './accounts';

export async function resolveAccountName(accountName) {
  const accounts = await fetchAccounts();
  if (accountName && accounts.some(a => a.name === accountName)) return accountName;
  const def = defaultAccount(accounts);
  return def?.name || accountName || 'Main';
}

export async function recordTransaction({ refreshAppData, payload }) {
  const account = await resolveAccountName(payload.account);
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

  const created = await insertTransaction({
    ...row,
    account,
    notes: row.notes,
  });
  await adjustAccountBalance(account, row.amount);
  if (refreshAppData) await refreshAppData();
  return created;
}

export async function undoTransaction({ refreshAppData, tx }) {
  if (!tx) return;
  await deleteTransaction(tx.id);
  await adjustAccountBalance(tx.account, -tx.amount);
  if (refreshAppData) await refreshAppData();
}
