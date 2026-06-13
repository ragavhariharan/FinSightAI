import { supabase } from '../supabase';
import { currentMonthStart } from '../format';

export async function fetchBudgetsWithSpent() {
  const { data, error } = await supabase
    .from('budgets_with_spent')
    .select('*')
    .eq('month', currentMonthStart())
    .order('category');
  if (error) throw error;
  const seen = new Set();
  return (data || []).filter(b => {
    if (seen.has(b.category)) return false;
    seen.add(b.category);
    return true;
  }).map(b => ({
    id: b.id,
    cat: b.category,
    icon: b.icon || '💰',
    color: b.color || '#6366F1',
    spent: Number(b.spent) || 0,
    limit: Number(b.limit_amount) || 0,
  }));
}

export async function insertBudget({ category, limit_amount, icon, color }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .upsert({
      user_id: user.id,
      category,
      limit_amount: Number(limit_amount),
      icon: icon || '💰',
      color: color || '#6366F1',
      month: currentMonthStart(),
    }, { onConflict: 'user_id,category,month' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function seedBudgetsFromPersona(personaDb) {
  const { data: config, error: cfgErr } = await supabase
    .from('persona_config')
    .select('default_budget_template')
    .eq('persona', personaDb)
    .single();
  if (cfgErr) throw cfgErr;

  const template = config?.default_budget_template || [];
  if (!template.length) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('month', currentMonthStart())
    .limit(1);

  if (existing?.length) return;

  const rows = template.map(b => ({
    user_id: user.id,
    category: b.category,
    icon: b.icon,
    color: b.color,
    limit_amount: b.limit_amount,
    month: currentMonthStart(),
  }));

  const { error } = await supabase.from('budgets').insert(rows);
  if (error) throw error;
}
