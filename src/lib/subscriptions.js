import { supabase } from './supabase';
import { requireAuthUser } from './api/auth';

export const OTT_SERVICES = [
  { service: 'Netflix', category: 'Entertainment', defaultAmount: 649 },
  { service: 'Amazon Prime', category: 'Entertainment', defaultAmount: 299 },
  { service: 'Disney+ Hotstar', category: 'Entertainment', defaultAmount: 499 },
  { service: 'Spotify', category: 'Entertainment', defaultAmount: 119 },
  { service: 'YouTube Premium', category: 'Entertainment', defaultAmount: 129 },
];

export const OTHER_RECURRING = [
  { service: 'Rent', category: 'Housing', defaultAmount: 15000 },
];

const PRESET_SERVICES = new Set([
  ...OTT_SERVICES.map(s => s.service),
  ...OTHER_RECURRING.map(s => s.service),
]);

export function isPresetService(service) {
  return PRESET_SERVICES.has(service);
}

export async function fetchSubscriptions() {
  const user = await requireAuthUser();
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('service');
  if (error) throw error;
  return data || [];
}

export async function toggleSubscription(service, meta, active) {
  const user = await requireAuthUser();
  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: user.id,
    service,
    category: meta.category,
    plan: meta.plan || null,
    amount: meta.amount ?? null,
    billing_cycle: meta.billing_cycle || 'monthly',
    active,
  }, { onConflict: 'user_id,service' });
  if (error) throw error;
  return fetchSubscriptions();
}

export async function updateSubscriptionAmount(service, amount) {
  const user = await requireAuthUser();
  const { error } = await supabase.from('user_subscriptions')
    .update({ amount: Number(amount) })
    .eq('user_id', user.id)
    .eq('service', service);
  if (error) throw error;
  return fetchSubscriptions();
}

export async function addCustomSubscription({ service, category, amount }) {
  const user = await requireAuthUser();
  const { error } = await supabase.from('user_subscriptions').insert({
    user_id: user.id,
    service,
    category: category || 'Entertainment',
    amount: amount != null ? Number(amount) : null,
    active: true,
  });
  if (error) throw error;
  return fetchSubscriptions();
}

export async function removeSubscription(service) {
  const user = await requireAuthUser();
  const { error } = await supabase.from('user_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('service', service);
  if (error) throw error;
  return fetchSubscriptions();
}
