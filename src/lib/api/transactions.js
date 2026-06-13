import { supabase } from '../supabase';

export async function fetchTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('txn_date', { ascending: false })
    .order('id', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function insertTransaction(tx) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(tx)
    .select()
    .single();
  if (error) throw error;
  return data;
}
