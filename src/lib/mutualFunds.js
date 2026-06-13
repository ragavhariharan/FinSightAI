import { DEMO_MUTUAL_FUNDS } from './demoData';
import { loadFeature, saveFeature } from './featureStore';
import * as api from './api/features';
import { fetchNavByIsin } from './api/market';

export async function loadFunds(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'mutual_funds', DEMO_MUTUAL_FUNDS);
  if (!userId) return [];
  const funds = await api.fetchMutualFunds();
  return enrichFundsWithNav(funds);
}

export async function addFund(isDemoMode, userId, fund) {
  if (isDemoMode) {
    const current = loadFeature('demo', 'mutual_funds', DEMO_MUTUAL_FUNDS);
    const next = [...current, fund];
    saveFeature('demo', 'mutual_funds', next);
    return next;
  }
  await api.insertMutualFund(fund);
  return loadFunds(isDemoMode, userId);
}

async function enrichFundsWithNav(funds) {
  const withIsin = funds.filter(f => f.isin);
  if (!withIsin.length) return funds;
  try {
    const navData = await fetchNavByIsin(withIsin.map(f => f.isin));
    const navMap = Object.fromEntries(navData.filter(n => n.nav).map(n => [n.isin, n]));
    return funds.map(f => {
      const hit = f.isin ? navMap[f.isin] : null;
      return hit ? { ...f, nav: hit.nav, name: hit.name || f.name } : f;
    });
  } catch {
    return funds;
  }
}

export function computeXirr(flows, guess = 0.12) {
  if (!flows.length) return 0;
  let rate = guess;
  for (let i = 0; i < 40; i++) {
    let f = 0;
    let df = 0;
    const t0 = flows[0].date;
    flows.forEach(({ amount, date }) => {
      const years = (date - t0) / (365.25 * 86400000);
      const den = Math.pow(1 + rate, years);
      f += amount / den;
      df -= (years * amount) / (den * (1 + rate));
    });
    if (Math.abs(df) < 1e-9) break;
    const next = rate - f / df;
    if (Math.abs(next - rate) < 1e-6) return Math.round(next * 1000) / 10;
    rate = next;
  }
  return Math.round(rate * 1000) / 10;
}

export function fundMetrics(fund) {
  const nav = Number(fund.nav) || 0;
  const units = Number(fund.units) || 0;
  const invested = Number(fund.invested) || 0;
  const value = units * nav;
  const gain = value - invested;
  const gainPct = invested > 0 ? Math.round((gain / invested) * 1000) / 10 : 0;
  const underperformYears = (fund.fundReturn || 0) < (fund.benchmarkReturn || 0) ? 3 : 0;
  let xirr = gainPct;
  if (nav > 0 && invested > 0 && value > 0) {
    const computed = computeXirr([
      { amount: -invested, date: Date.now() - 365 * 86400000 * 2 },
      { amount: value, date: Date.now() },
    ]);
    xirr = Number.isFinite(computed) ? computed : (Number.isFinite(gainPct) ? gainPct : null);
  }
  return { value, gain, gainPct, xirr: Number.isFinite(xirr) ? xirr : null, underperformYears };
}
