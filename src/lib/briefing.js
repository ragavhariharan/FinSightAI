import { formatRupee } from './format';

/** Intelligent dashboard briefing from snapshot + questionnaire */
export function buildBriefing(snap = {}, questionnaire = {}) {
  const income = snap.monthly_income || 0;
  const spend = snap.monthly_spend || 0;
  const savings = snap.net_savings ?? (income - spend);
  const rate = snap.savings_rate_pct || 0;
  const txCount = snap.transaction_count || 0;
  const goals = questionnaire.financial_goals || [];

  if (txCount === 0 && income === 0) {
    const goalHint = goals[0] ? ` You said you want to ${goals[0].toLowerCase()} — log your first transaction to get started.` : ' Log your first transaction to unlock insights.';
    return `Welcome! Your dashboard is ready.${goalHint}`;
  }

  if (savings < 0) {
    return `You're overspending by ${formatRupee(Math.abs(savings))} this month — ${formatRupee(spend)} out vs ${formatRupee(income)} in. Review your top categories and trim discretionary spends.`;
  }

  if (rate >= 25) {
    return `Strong month — you're saving ${formatRupee(savings)} (${rate}% of income). ${goals.includes('Build emergency fund') ? 'Your emergency fund goal is on track.' : 'Keep this pace going.'}`;
  }

  if (rate >= 10) {
    return `You're saving ${formatRupee(savings)} this month (${rate}% of take-home). ${spend > income * 0.8 ? 'Spending is high relative to income — check Reports for where to cut.' : 'Steady progress — a small bump could hit your goals faster.'}`;
  }

  if (savings === 0 && spend > 0) {
    return `You've broken even this month — ${formatRupee(spend)} spent matching your income. Look for leaks in food delivery and subscriptions.`;
  }

  return `You've spent ${formatRupee(spend)} of ${formatRupee(income)} income this month, saving ${formatRupee(savings)}. ${snap.budget_used_pct > 90 ? 'Your budget is nearly exhausted — review Budget.' : 'See Reports for a full category breakdown.'}`;
}

export function dashboardSubtitle(questionnaire = {}) {
  const freq = questionnaire.income_frequency;
  if (freq) return `Tracking your ${freq.toLowerCase()} finances`;
  return "Here's where your money stands today";
}
