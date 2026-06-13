import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadNewsPool, getPersonalizedNews } from '../lib/news';
import { loadHoldings } from '../lib/stocks';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { refreshNewsFeed } from '../lib/api/market';

const loadNews = (isDemo, uid) => loadNewsPool(isDemo, uid);

function stripResidualHtml(text = '') {
  return text.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

export default function NewsFeed() {
  const { state } = useApp();
  const { data: pool, loading, setData } = useFeatureData(loadNews, []);
  const [refreshing, setRefreshing] = useState(false);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    loadHoldings(state.isDemoMode, state.user?.id).then(setStocks);
  }, [state.isDemoMode, state.user?.id]);

  const items = useMemo(() => {
    if (!pool) return [];
    return getPersonalizedNews(state.transactions, stocks, pool, state.questionnaire || {});
  }, [state.transactions, stocks, pool, state.questionnaire]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      if (!state.isDemoMode) await refreshNewsFeed(true);
      const fresh = await loadNewsPool(state.isDemoMode, state.user?.id);
      setData(fresh);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <p className="fs-subtitle fs-animate-in" style={{ margin: 0 }}>
          Headlines tailored to your interests and spending.
        </p>
        <button className="fs-btn fs-btn-secondary fs-btn-sm" onClick={handleRefresh} disabled={refreshing}>
          <Icon name="refresh" size={15} /> {refreshing ? 'Fetching…' : 'Refresh'}
        </button>
      </div>
      {loading && !pool ? (
        <div className="fs-news-grid">
          {[1, 2, 3].map(i => <div key={i} className="fs-skeleton" style={{ aspectRatio: 1, borderRadius: 14 }} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="news" title="No matching news" description="Complete onboarding interests or add transactions to personalise your feed." />
      ) : (
        <div className="fs-news-grid">
          {items.slice(0, 12).map((item, i) => {
            const href = item.link || `https://news.google.com/search?q=${encodeURIComponent(item.title)}`;
            return (
              <a
                key={item.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`fs-news-card fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}
              >
                {item.image ? (
                  <img
                    className="fs-news-card-img"
                    src={item.image}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="fs-news-card-noimg">No preview</div>
                )}
                <div className="fs-news-card-body">
                  <div className="fs-news-card-title">{stripResidualHtml(item.title)}</div>
                  <div className="fs-news-card-meta">{item.source} · {item.date}</div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
