import { DEMO_STOCKS } from './demoData';
import { loadFeature, saveFeature } from './featureStore';
import * as api from './api/features';
import { fetchStockQuotes } from './api/market';

export async function loadHoldings(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'stocks', DEMO_STOCKS);
  if (!userId) return [];
  return api.fetchStockHoldings();
}

export async function saveHoldings(isDemoMode, userId, holdings) {
  if (isDemoMode) {
    saveFeature('demo', 'stocks', holdings);
    return;
  }
  // Real users: individual upserts handled by add/delete; bulk replace not needed
}

export async function addHolding(isDemoMode, userId, holding) {
  if (isDemoMode) {
    const current = loadFeature('demo', 'stocks', DEMO_STOCKS);
    const next = [...current, holding];
    saveFeature('demo', 'stocks', next);
    return next;
  }
  await api.upsertStockHolding(holding);
  return api.fetchStockHoldings();
}

export async function quoteHoldings(holdings, isDemoMode) {
  if (!holdings.length) return { rows: [], invested: 0, current: 0, dayPnl: 0, changePct: 0 };

  if (isDemoMode) {
    return portfolioSummarySimulated(holdings);
  }

  try {
    const quotes = await fetchStockQuotes(holdings.map(h => ({ symbol: h.symbol, exchange: h.exchange })));
    const quoteMap = Object.fromEntries(quotes.map(q => [q.symbol, q]));
    const rows = holdings.map(h => {
      const q = quoteMap[h.symbol.toUpperCase()];
      const currentPrice = q?.price ?? h.avgPrice;
      const changePct = q?.changePct ?? 0;
      return { ...h, currentPrice, changePct, dayChange: Math.round((currentPrice - h.avgPrice) * h.qty) };
    });
    const invested = rows.reduce((s, h) => s + h.avgPrice * h.qty, 0);
    const current = rows.reduce((s, h) => s + h.currentPrice * h.qty, 0);
    const dayPnl = rows.reduce((s, h) => s + (h.currentPrice - h.avgPrice) * h.qty, 0);
    const changePct = invested ? Math.round(((current - invested) / invested) * 1000) / 10 : 0;
    return { rows, invested, current, dayPnl, changePct };
  } catch {
    return portfolioSummarySimulated(holdings);
  }
}

function portfolioSummarySimulated(holdings) {
  const day = Math.floor(Date.now() / 86400000);
  const rows = holdings.map(h => {
    const seed = h.symbol.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const drift = Math.sin(day * 0.7 + seed) * 0.028;
    const currentPrice = Math.round((h.avgPrice || h.basePrice) * (1 + drift) * 100) / 100;
    const changePct = Math.round(((currentPrice - (h.avgPrice || h.basePrice)) / (h.avgPrice || h.basePrice)) * 1000) / 10;
    return { ...h, currentPrice, changePct };
  });
  const invested = rows.reduce((s, h) => s + h.avgPrice * h.qty, 0);
  const current = rows.reduce((s, h) => s + h.currentPrice * h.qty, 0);
  const changePct = invested ? Math.round(((current - invested) / invested) * 1000) / 10 : 0;
  return { rows, invested, current, dayPnl: current - invested, changePct };
}

export function portfolioSummary(holdings) {
  return portfolioSummarySimulated(holdings);
}

export function portfolioSummaryText(summary) {
  const dir = summary.changePct >= 0 ? 'up' : 'down';
  const worst = [...summary.rows].sort((a, b) => a.changePct - b.changePct)[0];
  let extra = '';
  if (worst && worst.changePct < -1) extra = ` — mostly ${worst.name} drag.`;
  return `Your portfolio is ${dir} ${Math.abs(summary.changePct)}% today${extra}`;
}
