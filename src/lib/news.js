import { getPersonalizedNews as scoreNews } from './newsPersonalize';
import { refreshNewsFeed } from './api/market';
import { fetchNewsCache } from './api/features';
import { DEMO_NEWS_POOL } from './demoData';
import { loadFeature, saveFeature } from './featureStore';

export async function loadNewsPool(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'news_pool', DEMO_NEWS_POOL);
  try {
    const cached = await fetchNewsCache();
    if (cached?.length) return cached;
    return await refreshNewsFeed();
  } catch {
    return [];
  }
}

export function getPersonalizedNews(transactions = [], stocks = [], pool = [], questionnaire = {}) {
  return scoreNews(transactions, stocks, pool, questionnaire);
}
