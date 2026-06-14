import { supabase } from './supabase';
import { chartColor, CHART_PALETTE } from './chartColors';
import { requireAuthUser } from './api/auth';

export const ACCOUNT_PALETTE = CHART_PALETTE;

export function paletteColor(index) {
  return chartColor(index);
}

function withChartColors(accounts) {
  return (accounts || []).map((a, i) => ({ ...a, color: a.color || chartColor(i) }));
}

export async function fetchAccounts() {
  const user = await requireAuthUser();
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at');
  if (error) throw error;
  return withChartColors((data || []).map(r => ({
    id: String(r.id),
    name: r.name,
    institution: r.institution,
    balance: Number(r.balance),
    is_default: r.is_default,
    color: r.color,
  })));
}

export async function adjustAccountBalance(accountName, delta) {
  const accounts = await fetchAccounts();
  if (!accounts.length) return accounts;

  let target = accounts.find(a => a.name === accountName);
  if (!target) target = defaultAccount(accounts);
  if (!target) return accounts;

  const next = accounts.map(a =>
    a.id === target.id ? { ...a, balance: Math.round((a.balance || 0) + delta) } : a,
  );

  const { error } = await supabase.from('bank_accounts')
    .update({ balance: next.find(a => a.id === target.id).balance })
    .eq('id', Number(target.id));
  if (error) throw error;
  return fetchAccounts();
}

export async function setDefaultAccountOnly(id) {
  const user = await requireAuthUser();
  await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', user.id);
  const { error } = await supabase.from('bank_accounts').update({ is_default: true }).eq('id', Number(id));
  if (error) throw error;
  return fetchAccounts();
}

export async function upsertAccount(account) {
  const user = await requireAuthUser();
  const list = await fetchAccounts();
  if (account.is_default) {
    await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', user.id);
  }
  const row = {
    user_id: user.id,
    name: account.name,
    institution: account.institution || null,
    balance: Number(account.balance) || 0,
    is_default: !!account.is_default,
    color: account.color || chartColor(list.length),
  };
  if (account.id && !String(account.id).startsWith('a')) {
    const { error } = await supabase.from('bank_accounts').update(row).eq('id', Number(account.id));
    if (error) throw error;
  } else {
    const { error } = await supabase.from('bank_accounts').insert(row);
    if (error) throw error;
  }
  return fetchAccounts();
}

export async function deleteAccount(id) {
  const { error } = await supabase.from('bank_accounts').delete().eq('id', Number(id));
  if (error) throw error;
  return fetchAccounts();
}

export function totalBalance(accounts) {
  return accounts.reduce((s, a) => s + (a.balance || 0), 0);
}

export function defaultAccount(accounts) {
  return accounts.find(a => a.is_default) || accounts[0] || null;
}
