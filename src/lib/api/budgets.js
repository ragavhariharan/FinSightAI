import { supabase } from '../supabase';

export async function fetchBudgetsWithSpent() {
  const { data, error } = await supabase
    .from('budgets_with_spent')
    .select('*')
    .order('category');
  if (error) throw error;
  return data ?? [];
}

export async function insertBudget(budget) {
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();
  if (error) throw error;
  return data;
}
