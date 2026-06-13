import { supabase } from '../supabase';

export async function fetchSnapshot() {
  const { data, error } = await supabase
    .from('dashboard_snapshots')
    .select('snapshot')
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.snapshot ?? null;
}
