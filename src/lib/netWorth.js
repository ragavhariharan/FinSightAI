import { DEMO_NET_WORTH } from './demoData';
import { loadFeature, saveFeature } from './featureStore';
import * as api from './api/features';

export async function loadNetWorth(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'net_worth', DEMO_NET_WORTH);
  if (!userId) return { assets: [], liabilities: [] };
  return api.fetchNetWorthItems();
}

export async function addNetWorthItem(isDemoMode, userId, item) {
  if (isDemoMode) {
    const data = loadFeature('demo', 'net_worth', DEMO_NET_WORTH);
    const key = item.item_type === 'liability' ? 'liabilities' : 'assets';
    const next = { ...data, [key]: [...data[key], { id: `n${Date.now()}`, label: item.label, amount: item.amount }] };
    saveFeature('demo', 'net_worth', next);
    return next;
  }
  await api.insertNetWorthItem(item);
  return loadNetWorth(isDemoMode, userId);
}

export function computeNetWorth(data, extras = {}) {
  const assets = data.assets.reduce((s, a) => s + a.amount, 0) + (extras.stockValue || 0) + (extras.mfValue || 0);
  const liabilities = data.liabilities.reduce((s, l) => s + l.amount, 0);
  return { assets, liabilities, net: assets - liabilities };
}
