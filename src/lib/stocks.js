import * as api from './api/features';
import { fetchStockQuotes } from './api/market';

export async function loadHoldings() {
  return api.fetchStockHoldings();
}

export async function addHolding(holding) {
  await api.upsertStockHolding(holding);
  return api.fetchStockHoldings();
}

export async function quoteHoldings(holdings) {
  if (!holdings.length) return { rows: [], invested: 0, current: 0, dayPnl: 0, changePct: 0 };

  try {
    const quotes = await fetchStockQuotes(holdings.map(h => ({ symbol: h.symbol, exchange: h.exchange })));
    const quoteMap = Object.fromEntries(quotes.map(q => [q.symbol, q]));
    const rows = holdings.map(h => {
      const q = quoteMap[h.symbol.toUpperCase()];
      const currentPrice = q?.price ?? h.avgPrice;
      return { ...h, currentPrice, changePct: q?.changePct ?? 0, dayChange: Math.round((currentPrice - h.avgPrice) * h.qty) };
    });
    const invested = rows.reduce((s, h) => s + h.avgPrice * h.qty, 0);
    const current = rows.reduce((s, h) => s + h.currentPrice * h.qty, 0);
    const dayPnl = rows.reduce((s, h) => s + (h.currentPrice - h.avgPrice) * h.qty, 0);
    const changePct = invested ? Math.round(((current - invested) / invested) * 1000) / 10 : 0;
    return { rows, invested, current, dayPnl, changePct };
  } catch {
    return { rows: holdings, invested: 0, current: 0, dayPnl: 0, changePct: 0 };
  }
}

export function portfolioSummaryText(summary) {
  const dir = summary.changePct >= 0 ? 'up' : 'down';
  const worst = [...summary.rows].sort((a, b) => a.changePct - b.changePct)[0];
  let extra = '';
  if (worst && worst.changePct < -1) extra = ` — mostly ${worst.name} drag.`;
  return `Your portfolio is ${dir} ${Math.abs(summary.changePct)}% today${extra}`;
}
