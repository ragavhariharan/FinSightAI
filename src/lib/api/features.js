import { supabase } from '../supabase';

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// ─── Stocks ───────────────────────────────────────────────────────────────────

export async function fetchStockHoldings() {
  const { data, error } = await supabase.from('stock_holdings').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(r => ({
    id: String(r.id),
    symbol: r.symbol,
    name: r.name,
    exchange: r.exchange || 'NSE',
    qty: Number(r.qty),
    avgPrice: Number(r.avg_price),
    basePrice: Number(r.avg_price),
  }));
}

export async function upsertStockHolding(holding) {
  const user_id = await uid();
  const { data, error } = await supabase.from('stock_holdings').upsert({
    user_id,
    symbol: holding.symbol.toUpperCase(),
    name: holding.name,
    exchange: holding.exchange || 'NSE',
    qty: holding.qty,
    avg_price: holding.avgPrice,
  }, { onConflict: 'user_id,symbol,exchange' }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteStockHolding(id) {
  const { error } = await supabase.from('stock_holdings').delete().eq('id', Number(id));
  if (error) throw error;
}

// ─── Mutual funds ─────────────────────────────────────────────────────────────

export async function fetchMutualFunds() {
  const { data, error } = await supabase.from('mutual_fund_holdings').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(r => ({
    id: String(r.id),
    name: r.name,
    isin: r.isin,
    units: Number(r.units),
    invested: Number(r.invested),
    nav: 0,
    benchmark: r.benchmark || 'Nifty 50',
    benchmarkReturn: 14,
    fundReturn: 12,
    navHistory: [],
  }));
}

export async function insertMutualFund(fund) {
  const user_id = await uid();
  const { data, error } = await supabase.from('mutual_fund_holdings').insert({
    user_id,
    name: fund.name,
    isin: fund.isin,
    units: fund.units,
    invested: fund.invested,
    benchmark: fund.benchmark || 'Nifty 50',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMutualFund(id) {
  const { error } = await supabase.from('mutual_fund_holdings').delete().eq('id', Number(id));
  if (error) throw error;
}

// ─── SIP goals ────────────────────────────────────────────────────────────────

export async function fetchSipGoals() {
  const { data, error } = await supabase.from('sip_goals').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(r => ({
    id: String(r.id),
    title: r.title,
    target: Number(r.target),
    years: r.years,
    saved: Number(r.saved),
    monthlySip: Number(r.monthly_sip) || 0,
    category: r.category || '',
  }));
}

export async function insertSipGoal(goal) {
  const user_id = await uid();
  const { data, error } = await supabase.from('sip_goals').insert({
    user_id,
    title: goal.title,
    target: goal.target,
    years: goal.years,
    saved: goal.saved || 0,
    monthly_sip: goal.monthlySip,
    category: goal.category,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateSipGoal(id, patch) {
  const row = {};
  if (patch.saved != null) row.saved = patch.saved;
  if (patch.monthlySip != null) row.monthly_sip = patch.monthlySip;
  const { error } = await supabase.from('sip_goals').update(row).eq('id', Number(id));
  if (error) throw error;
}

// ─── Net worth ────────────────────────────────────────────────────────────────

export async function fetchNetWorthItems() {
  const { data, error } = await supabase.from('net_worth_items').select('*').order('created_at');
  if (error) throw error;
  const assets = (data || []).filter(r => r.item_type === 'asset').map(r => ({
    id: String(r.id), label: r.label, amount: Number(r.amount),
  }));
  const liabilities = (data || []).filter(r => r.item_type === 'liability').map(r => ({
    id: String(r.id), label: r.label, amount: Number(r.amount),
  }));
  return { assets, liabilities };
}

export async function insertNetWorthItem(item) {
  const user_id = await uid();
  const { data, error } = await supabase.from('net_worth_items').insert({
    user_id,
    item_type: item.item_type,
    label: item.label,
    amount: item.amount,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNetWorthItem(id) {
  const { error } = await supabase.from('net_worth_items').delete().eq('id', Number(id));
  if (error) throw error;
}

// ─── Tax profile ──────────────────────────────────────────────────────────────

const EMPTY_TAX = {
  annualIncome: 0,
  investments80C: 0,
  healthInsurance80D: 0,
  homeLoanInterest: 0,
  nps80CCD: 0,
};

export async function fetchTaxProfile() {
  const user_id = await uid();
  const { data, error } = await supabase.from('tax_profiles').select('*').eq('user_id', user_id).maybeSingle();
  if (error) throw error;
  if (!data) {
    const fromFields = await deriveTaxFromProfileFields(user_id);
    return fromFields;
  }
  return {
    annualIncome: Number(data.annual_income),
    investments80C: Number(data.investments_80c),
    healthInsurance80D: Number(data.health_insurance_80d),
    homeLoanInterest: Number(data.home_loan_interest),
    nps80CCD: Number(data.nps_80ccd),
  };
}

async function deriveTaxFromProfileFields(user_id) {
  const { data } = await supabase.from('profile_fields').select('field_key, value_numeric').eq('user_id', user_id);
  const fields = Object.fromEntries((data || []).map(f => [f.field_key, Number(f.value_numeric) || 0]));
  const monthly = fields.monthly_income || fields.take_home_salary || 0;
  return {
    ...EMPTY_TAX,
    annualIncome: monthly ? monthly * 12 : 0,
    investments80C: fields.investments_80c || 0,
    healthInsurance80D: fields.health_insurance_80d || 0,
    homeLoanInterest: fields.home_loan_interest || 0,
  };
}

export async function saveTaxProfile(profile) {
  const user_id = await uid();
  const { error } = await supabase.from('tax_profiles').upsert({
    user_id,
    annual_income: profile.annualIncome,
    investments_80c: profile.investments80C,
    health_insurance_80d: profile.healthInsurance80D,
    home_loan_interest: profile.homeLoanInterest,
    nps_80ccd: profile.nps80CCD,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ─── Bill splits ──────────────────────────────────────────────────────────────

export async function fetchBillSplits() {
  const { data, error } = await supabase.from('bill_splits').select('*').order('split_date', { ascending: false });
  if (error) throw error;
  return (data || []).map(r => ({
    id: String(r.id),
    title: r.title,
    total: Number(r.total),
    paidBy: r.paid_by,
    date: r.split_date,
    members: r.members || [],
  }));
}

export async function insertBillSplit(split) {
  const user_id = await uid();
  const { data, error } = await supabase.from('bill_splits').insert({
    user_id,
    title: split.title,
    total: split.total,
    paid_by: split.paidBy || 'You',
    split_date: split.date || new Date().toISOString().slice(0, 10),
    members: split.members,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateBillSplit(id, members) {
  const { error } = await supabase.from('bill_splits').update({ members }).eq('id', Number(id));
  if (error) throw error;
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export async function fetchChallenges() {
  const { data, error } = await supabase.from('spending_challenges').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(r => ({
    id: String(r.id),
    title: r.title,
    desc: r.description || '',
    target: Number(r.target),
    current: 0,
    unit: r.unit,
    status: r.status === 'paused' ? 'paused' : 'active',
    progress: 0,
  }));
}

export async function insertChallenge(ch) {
  const user_id = await uid();
  const { data, error } = await supabase.from('spending_challenges').insert({
    user_id,
    title: ch.title,
    description: ch.desc,
    challenge_type: ch.challenge_type || 'custom',
    target: ch.target,
    unit: ch.unit || '₹',
    status: 'active',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateChallengeStatus(id, status) {
  const { error } = await supabase.from('spending_challenges').update({ status }).eq('id', Number(id));
  if (error) throw error;
}

// ─── Savings goals ────────────────────────────────────────────────────────────

export async function fetchSavingsGoals() {
  const { data, error } = await supabase.from('savings_goals').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.goal_key || String(r.id),
    dbId: r.id,
    title: r.title,
    target: Number(r.target),
    target_years: Number(r.target_years) || 2,
    target_days: Number(r.target_days) || null,
    icon: r.icon || 'goals',
    color: r.color || '#1F7A5E',
  }));
}

export async function insertSavingsGoal(goal) {
  const user_id = await uid();
  const row = {
    user_id,
    title: goal.title.trim(),
    target: Number(goal.target),
    icon: goal.icon || 'goals',
    color: goal.color || '#1F7A5E',
  };
  const targetDays = goal.target_days ?? timelineToDays(goal.target_years || 2, 'years');
  const extended = { ...row };
  if (targetDays > 0) {
    extended.target_days = targetDays;
    extended.target_years = goal.target_years || Math.max(1, Math.ceil(targetDays / 365));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + targetDays);
    extended.target_date = targetDate.toISOString().slice(0, 10);
  }
  let { data, error } = await supabase.from('savings_goals').insert(extended).select().single();
  if (error && /column/i.test(error.message || '')) {
    ({ data, error } = await supabase.from('savings_goals').insert(row).select().single());
  }
  if (error) throw error;
  return data;
}

function timelineToDays(value, unit = 'years') {
  const v = Math.max(1, Number(value) || 1);
  if (unit === 'days') return v;
  if (unit === 'months') return Math.round(v * 30.44);
  return Math.round(v * 365.25);
}

export async function deleteSavingsGoal(id) {
  const dbId = Number(id);
  if (!dbId || Number.isNaN(dbId)) throw new Error('Invalid goal id');
  const { error } = await supabase.from('savings_goals').delete().eq('id', dbId);
  if (error) throw error;
}

// ─── News cache ───────────────────────────────────────────────────────────────

export async function fetchNewsCache() {
  const { data, error } = await supabase.from('news_cache').select('items').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data?.items || [];
}
