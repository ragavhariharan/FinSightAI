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
