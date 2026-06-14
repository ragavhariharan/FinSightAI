import { getPersonalizedNews as scoreNews } from './newsPersonalize';
import { refreshNewsFeed } from './api/market';
import { fetchNewsCache } from './api/features';
import { normalizeNewsItems } from './newsFormat';

export async function loadNewsPool() {
  try {
    const cached = await fetchNewsCache();
    if (cached?.length) return normalizeNewsItems(cached);
  } catch { /* fall through */ }

  try {
    const items = await refreshNewsFeed(false);
    return normalizeNewsItems(items);
  } catch {
    return [];
  }
}

export async function refreshNewsPoolInBackground(force = false, options = {}) {
  try {
    const items = await refreshNewsFeed(force, options);
    if (!items.length) throw new Error('No articles returned');
    return normalizeNewsItems(items);
  } catch (err) {
    if (force) throw err;
    return null;
  }
}

export function getPersonalizedNews(transactions = [], stocks = [], pool = [], questionnaire = {}) {
  return scoreNews(transactions, stocks, pool, questionnaire);
}
