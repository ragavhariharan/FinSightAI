import { supabase } from '../supabase';

export async function fetchSnapshot() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('dashboard_snapshots')
    .select('snapshot')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.snapshot || null;
}

export async function ensureSnapshot() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const existing = await fetchSnapshot();
  if (existing && Object.keys(existing).length) return existing;

  const { error } = await supabase.rpc('recompute_dashboard_snapshot', { p_user_id: user.id });
  if (error) {
    console.warn('recompute_dashboard_snapshot:', error.message);
    return existing || {};
  }
  return fetchSnapshot();
}
