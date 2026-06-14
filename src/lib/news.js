import { getPersonalizedNews as scoreNews } from './newsPersonalize';
import { refreshNewsFeed } from './api/market';
import { fetchNewsCache } from './api/features';
import { normalizeNewsItems } from './newsFormat';
import { DEMO_NEWS_POOL } from './demoData';
import { loadFeature } from './featureStore';

function seededShuffle(items, seed) {
  const arr = [...items];
  let s = Math.abs(seed) % 2147483646 || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function rotateDemoPool(pool, { rotation = 0, excludeTitles = [] } = {}) {
  const exclude = new Set(excludeTitles.map((t) => t.toLowerCase()));
  let candidates = pool.filter((item) => !exclude.has(item.title.toLowerCase()));
  if (candidates.length < 6) candidates = [...pool];
  return seededShuffle(candidates, rotation || Date.now());
}

export async function loadNewsPool(isDemoMode) {
  if (isDemoMode) return normalizeNewsItems(loadFeature('demo', 'news_pool', DEMO_NEWS_POOL));

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

/** Fetch news — pass force=true on manual refresh to bypass cache and rotate the article set. */
export async function refreshNewsPoolInBackground(force = false, options = {}) {
  if (options.isDemoMode) {
    const base = normalizeNewsItems(loadFeature('demo', 'news_pool', DEMO_NEWS_POOL));
    const rotated = rotateDemoPool(base, options);
    return normalizeNewsItems(rotated);
  }

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
