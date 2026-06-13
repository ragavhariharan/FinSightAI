import { DEMO_SIP_GOALS } from './demoData';
import { loadFeature, saveFeature } from './featureStore';
import * as api from './api/features';

export async function loadSipGoals(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'sip_goals', DEMO_SIP_GOALS);
  if (!userId) return [];
  return api.fetchSipGoals();
}

export async function addSipGoal(isDemoMode, userId, goal) {
  if (isDemoMode) {
    const current = loadFeature('demo', 'sip_goals', DEMO_SIP_GOALS);
    const next = [...current, goal];
    saveFeature('demo', 'sip_goals', next);
    return next;
  }
  await api.insertSipGoal(goal);
  return loadSipGoals(isDemoMode, userId);
}

export function requiredMonthlySip(target, years, annualReturn = 0.12) {
  const r = annualReturn / 12;
  const n = years * 12;
  if (r === 0) return Math.ceil(target / n);
  const sip = target * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
  return Math.ceil(sip / 100) * 100;
}

export function goalProgress(goal) {
  const pct = goal.target ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
  const required = requiredMonthlySip(goal.target - goal.saved, Math.max(1, goal.years));
  return { pct, required, remaining: Math.max(0, goal.target - goal.saved) };
}
