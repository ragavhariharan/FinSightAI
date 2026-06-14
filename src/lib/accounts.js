import { supabase } from './supabase';

import { chartColor, CHART_PALETTE } from './chartColors';

const DEMO_ACCOUNTS = [
  { id: 'a1', name: 'HDFC Savings', institution: 'HDFC Bank', balance: 420000, is_default: true, color: chartColor(0) },
  { id: 'a2', name: 'ICICI Credit', institution: 'ICICI Bank', balance: 42000, is_default: false, color: chartColor(1) },
];

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

function withChartColors(accounts) {
  return (accounts || []).map((a, i) => ({ ...a, color: chartColor(i) }));
}

export async function fetchAccounts(isDemoMode) {
  if (isDemoMode) {
    try {
      const raw = localStorage.getItem('finsight_accounts_demo');
      if (raw) return withChartColors(JSON.parse(raw));
    } catch { /* ignore */ }
    return DEMO_ACCOUNTS.map(a => ({ ...a }));
  }
  const { data, error } = await supabase.from('bank_accounts').select('*').order('created_at');
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

export const ACCOUNT_PALETTE = CHART_PALETTE;

export function paletteColor(index) {
  return chartColor(index);
}

export async function saveAccountsDemo(accounts) {
  localStorage.setItem('finsight_accounts_demo', JSON.stringify(accounts));
}

export async function adjustAccountBalance(isDemoMode, accountName, delta) {
  const accounts = await fetchAccounts(isDemoMode);
  if (!accounts.length) return accounts;

  let target = accounts.find(a => a.name === accountName);
  if (!target) target = defaultAccount(accounts);
  if (!target) return accounts;

  const next = accounts.map(a =>
    a.id === target.id ? { ...a, balance: Math.round((a.balance || 0) + delta) } : a,
  );

  if (isDemoMode) {
    await saveAccountsDemo(next);
    return next;
  }

  const { error } = await supabase.from('bank_accounts')
    .update({ balance: next.find(a => a.id === target.id).balance })
    .eq('id', Number(target.id));
  if (error) throw error;
  return fetchAccounts(false);
}

export async function setDefaultAccountOnly(isDemoMode, id) {
  const accounts = await fetchAccounts(isDemoMode);
  const next = accounts.map(a => ({ ...a, is_default: a.id === id }));

  if (isDemoMode) {
    await saveAccountsDemo(next);
    return next;
  }

  const user_id = await uid();
  await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', user_id);
  const { error } = await supabase.from('bank_accounts').update({ is_default: true }).eq('id', Number(id));
  if (error) throw error;
  return fetchAccounts(false);
}

export async function upsertAccount(isDemoMode, account) {
  if (isDemoMode) {
    const list = await fetchAccounts(true);
    const next = account.id
      ? list.map(a => a.id === account.id ? { ...a, ...account } : a)
      : [...list, { ...account, id: `a${Date.now()}`, color: account.color || paletteColor(list.length) }];
    await saveAccountsDemo(next);
    return next;
  }
  const user_id = await uid();
  if (account.is_default) {
    await supabase.from('bank_accounts').update({ is_default: false }).eq('user_id', user_id);
  }
  const row = {
    user_id,
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
  return fetchAccounts(false);
}

export async function deleteAccount(isDemoMode, id) {
  if (isDemoMode) {
    const list = (await fetchAccounts(true)).filter(a => a.id !== id);
    await saveAccountsDemo(list);
    return list;
  }
  const { error } = await supabase.from('bank_accounts').delete().eq('id', Number(id));
  if (error) throw error;
  return fetchAccounts(false);
}

export function totalBalance(accounts) {
  return accounts.reduce((s, a) => s + (a.balance || 0), 0);
}

export function defaultAccount(accounts) {
  return accounts.find(a => a.is_default) || accounts[0] || null;
}
