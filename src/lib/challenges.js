import { DEMO_CHALLENGES } from './demoData';
import { loadFeature, saveFeature } from './featureStore';
import * as api from './api/features';

export async function loadChallenges(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'challenges', DEMO_CHALLENGES);
  if (!userId) return [];
  return api.fetchChallenges();
}

export async function addChallenge(isDemoMode, userId, ch) {
  if (isDemoMode) {
    const items = loadFeature('demo', 'challenges', DEMO_CHALLENGES);
    const next = [...items, { ...ch, id: `c${Date.now()}`, status: 'active', progress: 0, current: 0 }];
    saveFeature('demo', 'challenges', next);
    return next;
  }
  await api.insertChallenge(ch);
  return loadChallenges(isDemoMode, userId);
}

export async function toggleChallengeStatus(isDemoMode, userId, id, currentStatus) {
  const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
  if (isDemoMode) {
    const items = loadFeature('demo', 'challenges', DEMO_CHALLENGES);
    const next = items.map(c => c.id === id ? { ...c, status: nextStatus } : c);
    saveFeature('demo', 'challenges', next);
    return next;
  }
  await api.updateChallengeStatus(id, nextStatus);
  return loadChallenges(isDemoMode, userId);
}

export function updateChallengeProgress(challenges, transactions, snapshot) {
  const foodSpend = transactions.filter(t => t.category === 'Food & Dining' && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const weekendSpend = transactions.filter(t => {
    if (t.amount >= 0) return false;
    const d = new Date(t.txn_date || t.date);
    return d.getDay() === 0 || d.getDay() === 6;
  }).reduce((s, t) => s + Math.abs(t.amount), 0);

  return challenges.map(c => {
    const type = c.challenge_type || inferType(c);
    if (type === 'no_spend_weekend' || c.id === 'c1') {
      const progress = weekendSpend === 0 ? 100 : Math.max(0, 100 - Math.min(100, Math.round((weekendSpend / 2000) * 100)));
      return { ...c, current: weekendSpend, progress };
    }
    if (type === 'cut_food_delivery' || c.id === 'c2') {
      const cutPct = foodSpend > 0 ? Math.min(30, Math.round((foodSpend / 10000) * 30)) : 0;
      const progress = Math.min(100, Math.round((cutPct / (c.target || 30)) * 100));
      return { ...c, current: cutPct, progress };
    }
    if (type === 'extra_savings' || c.id === 'c3') {
      const saved = snapshot?.net_savings || 0;
      const progress = Math.min(100, Math.round((saved / (c.target || 5000)) * 100));
      return { ...c, current: Math.min(saved, c.target), progress };
    }
    return { ...c, progress: c.progress || 0, current: c.current || 0 };
  });
}

function inferType(c) {
  const t = (c.title || '').toLowerCase();
  if (t.includes('no-spend') || t.includes('weekend')) return 'no_spend_weekend';
  if (t.includes('delivery') || t.includes('food')) return 'cut_food_delivery';
  if (t.includes('save')) return 'extra_savings';
  return 'custom';
}

export function challengeMessage(challenge) {
  if ((challenge.challenge_type || inferType(challenge)) === 'no_spend_weekend' || challenge.id === 'c1') {
    return challenge.progress >= 80
      ? 'Great discipline — keep the no-spend streak going.'
      : `Weekend discretionary spend is ₹${challenge.current}. Aim for zero non-essentials.`;
  }
  if ((challenge.challenge_type || inferType(challenge)) === 'cut_food_delivery' || challenge.id === 'c2') {
    return challenge.progress >= 100
      ? 'You hit the delivery cut target this month.'
      : `Delivery spend cut at ${challenge.current}% — ${(challenge.target || 30) - challenge.current}% more to go.`;
  }
  return challenge.progress >= 100
    ? 'Extra savings goal achieved for this month.'
    : `₹${(challenge.current || 0).toLocaleString('en-IN')} of ₹${(challenge.target || 0).toLocaleString('en-IN')} extra saved.`;
}
