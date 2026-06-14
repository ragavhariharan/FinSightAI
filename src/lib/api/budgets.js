import { supabase } from '../supabase';
import { currentMonthStart } from '../format';
import { requireAuthUser } from './auth';

export async function fetchBudgetsWithSpent() {
  const user = await requireAuthUser();

  const { data, error } = await supabase
    .from('budgets')
    .select('id, category, icon, color, limit_amount')
    .eq('user_id', user.id)
    .eq('month', currentMonthStart())
    .order('category');
  if (error) throw error;

  return (data || []).map(b => ({
    id: b.id,
    cat: b.category,
    icon: b.icon || '💰',
    color: b.color || '#6366F1',
    spent: 0,
    limit: Number(b.limit_amount) || 0,
  }));
}

export async function updateBudget(id, { limit_amount }) {
  const user = await requireAuthUser();

  const { data, error } = await supabase
    .from('budgets')
    .update({ limit_amount: Number(limit_amount) })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
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
