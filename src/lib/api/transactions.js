import { supabase } from '../supabase';
import { mapTransactionRow, userTransactionsOnly } from '../format';
import { isPhantomTransaction } from '../phantomTransactions';

export async function purgePhantomTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('transactions')
    .select('id, name')
    .eq('user_id', user.id);
  if (error) throw error;

  const ids = (data || []).filter(isPhantomTransaction).map(r => r.id);
  if (!ids.length) return 0;

  const { error: delErr } = await supabase.from('transactions').delete().in('id', ids);
  if (delErr) throw delErr;

  await supabase.rpc('recompute_dashboard_snapshot', { p_user_id: user.id });
  return ids.length;
}

export async function fetchTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .neq('source', 'seed')
    .order('txn_date', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;
  return userTransactionsOnly((data || []).map(mapTransactionRow));
}

export async function insertTransaction({ name, amount, category, txn_date, emoji, account, source = 'manual', notes }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      name,
      amount: Number(amount),
      category,
      txn_date: txn_date || new Date().toISOString().slice(0, 10),
      emoji: emoji || '💰',
      account: account || 'Main',
      source: source === 'recurring' ? 'manual' : source,
      notes: notes || (source === 'recurring' ? 'recurring' : null),
    })
    .select()
    .single();
  if (error) throw error;
  return mapTransactionRow(data);
}

export async function bulkInsertTransactions(rows) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = rows.map(r => ({
    user_id: user.id,
    name: r.name,
    amount: Number(r.amount),
    category: r.category || 'Other',
    txn_date: r.txn_date,
    emoji: r.emoji || '💰',
    account: r.account || 'Main',
    source: 'upload',
  }));

  const { error } = await supabase.from('transactions').insert(payload);
  if (error) throw error;
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export function txSummary(transactions) {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spend = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const expenses = transactions.filter(t => t.amount < 0);
  const largest = expenses.length ? Math.max(...expenses.map(t => Math.abs(t.amount))) : 0;
  return {
    count: transactions.length,
    income,
    spend,
    net: income - spend,
    largest,
  };
}
