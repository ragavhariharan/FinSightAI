import * as api from './api/features';

export async function loadGoals() {
  return api.fetchSavingsGoals();
}

export async function addGoal(goal) {
  await api.insertSavingsGoal(goal);
  return loadGoals();
}

export function timelineToDays(value, unit = 'years') {
  const v = Math.max(1, Number(value) || 1);
  if (unit === 'days') return v;
  if (unit === 'months') return Math.round(v * 30.44);
  return Math.round(v * 365.25);
}

export function formatGoalTimeline(goal) {
  const days = goal.target_days || timelineToDays(goal.target_years || 2, 'years');
  if (days < 60) return `in ${days} day${days > 1 ? 's' : ''}`;
  if (days < 730) {
    const m = Math.round(days / 30.44);
    return `in ${m} month${m > 1 ? 's' : ''}`;
  }
  const y = Math.round((days / 365.25) * 10) / 10;
  return `in ${y} year${y > 1 ? 's' : ''}`;
}

export function goalProgress(goal, currentAmount, monthlyIncome = 0) {
  const pct = goal.target > 0 ? Math.min(100, Math.round((currentAmount / goal.target) * 100)) : 0;
  const totalDays = goal.target_days || timelineToDays(goal.target_years || 2, 'years');
  const months = totalDays / 30.44;
  const monthlyNeeded = months > 0 ? Math.ceil(goal.target / months) : 0;
  const onTrack = monthlyIncome > 0 ? currentAmount >= monthlyNeeded * 0.8 : pct >= 5;
  return {
    pct,
    current: currentAmount,
    remaining: Math.max(0, goal.target - currentAmount),
    monthlyNeeded,
    onTrack,
    totalDays,
  };
}
