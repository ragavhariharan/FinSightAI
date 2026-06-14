import * as api from './api/features';

export async function loadSipGoals() {
  return api.fetchSipGoals();
}

export async function addSipGoal(goal) {
  await api.insertSipGoal(goal);
  return loadSipGoals();
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
