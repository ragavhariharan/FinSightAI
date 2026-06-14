import { supabase } from './supabase';
import { loadFeature, saveFeature } from './featureStore';

const DEMO_SUBS_KEY = 'user_subscriptions';

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

export const PRESET_SERVICES = new Set([
  ...OTT_SERVICES.map(s => s.service),
  ...OTHER_RECURRING.map(s => s.service),
]);

export function isPresetService(service) {
  return PRESET_SERVICES.has(service);
}

export async function fetchSubscriptions(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', DEMO_SUBS_KEY, []);
  if (!userId) return [];
  const { data, error } = await supabase.from('user_subscriptions').select('*').order('service');
  if (error) throw error;
  return (data || []).map(r => ({
    id: String(r.id),
    service: r.service,
    category: r.category,
    plan: r.plan,
    amount: Number(r.amount) || 0,
    active: r.active,
  }));
}

export async function toggleSubscription(isDemoMode, userId, service, meta, active) {
  if (isDemoMode) {
    const current = loadFeature('demo', DEMO_SUBS_KEY, []);
    const existing = current.find(s => s.service === service);
    let next;
    if (existing) {
      next = current.map(s => s.service === service ? { ...s, active } : s);
    } else if (active) {
      next = [...current, { id: `sub${Date.now()}`, service, category: meta.category, amount: meta.defaultAmount, active: true }];
    } else {
      next = current;
    }
    saveFeature('demo', DEMO_SUBS_KEY, next);
    return next;
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: user.id,
    service,
    category: meta.category,
    amount: meta.defaultAmount,
    active,
    billing_cycle: 'monthly',
  }, { onConflict: 'user_id,service' });
  if (error) throw error;
  return fetchSubscriptions(false, user.id);
}

export async function updateSubscriptionAmount(isDemoMode, userId, service, amount) {
  if (isDemoMode) {
    const current = loadFeature('demo', DEMO_SUBS_KEY, []);
    const next = current.map(s => s.service === service ? { ...s, amount: Number(amount) } : s);
    saveFeature('demo', DEMO_SUBS_KEY, next);
    return next;
  }
  const { error } = await supabase.from('user_subscriptions').update({ amount: Number(amount) }).eq('service', service);
  if (error) throw error;
  return fetchSubscriptions(false, userId);
}

export async function addCustomSubscription(isDemoMode, userId, { service, category, amount }) {
  const name = (service || '').trim();
  if (!name) throw new Error('Enter a name for this recurring expense');
  if (isPresetService(name)) throw new Error('Use the preset card for this service');

  const current = await fetchSubscriptions(isDemoMode, userId);
  if (current.some(s => s.service.toLowerCase() === name.toLowerCase())) {
    throw new Error('This recurring expense already exists');
  }

  const monthly = Number(amount);
  if (!monthly || monthly <= 0) throw new Error('Enter a valid monthly amount');

  if (isDemoMode) {
    const next = [...current, {
      id: `sub${Date.now()}`,
      service: name,
      category: category || 'Other',
      amount: monthly,
      active: true,
    }];
    saveFeature('demo', DEMO_SUBS_KEY, next);
    return next;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('user_subscriptions').insert({
    user_id: user.id,
    service: name,
    category: category || 'Other',
    amount: monthly,
    active: true,
    billing_cycle: 'monthly',
  });
  if (error) throw error;
  return fetchSubscriptions(false, user.id);
}

export async function removeSubscription(isDemoMode, userId, service) {
  if (isPresetService(service)) throw new Error('Preset subscriptions cannot be removed');

  if (isDemoMode) {
    const current = loadFeature('demo', DEMO_SUBS_KEY, []);
    const next = current.filter(s => s.service !== service);
    saveFeature('demo', DEMO_SUBS_KEY, next);
    return next;
  }

  const { error } = await supabase.from('user_subscriptions').delete().eq('service', service);
  if (error) throw error;
  return fetchSubscriptions(false, userId);
}
