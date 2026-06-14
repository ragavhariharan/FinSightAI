import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadNewsPool, getPersonalizedNews, refreshNewsPoolInBackground } from '../lib/news';
import { loadHoldings } from '../lib/stocks';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';

const loadNews = (isDemo) => loadNewsPool(isDemo);
const NEWS_LIMIT = 48;

function NewsCardImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className="fs-news-card-noimg"><Icon name="news" size={28} /></div>;
  }
  return (
    <img
      className="fs-news-card-img"
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default function NewsFeed() {
  const { state } = useApp();
  const { data: pool, loading, setData } = useFeatureData(loadNews, []);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [refreshEpoch, setRefreshEpoch] = useState(0);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    loadHoldings(state.isDemoMode, state.user?.id).then(setStocks);
  }, [state.isDemoMode, state.user?.id]);

  useEffect(() => {
    if (state.isDemoMode || loading) return;
    let cancelled = false;
    refreshNewsPoolInBackground(false).then((fresh) => {
      if (!cancelled && fresh?.length) setData(fresh);
    });
    return () => { cancelled = true; };
  }, [state.isDemoMode, loading, setData]);

  const items = useMemo(() => {
    if (!pool) return [];
    return getPersonalizedNews(state.transactions, stocks, pool, state.questionnaire || {});
  }, [state.transactions, stocks, pool, state.questionnaire]);

  async function handleRefresh() {
    setRefreshing(true);
    setRefreshError('');
    try {
      const fresh = await refreshNewsPoolInBackground(true, {
        isDemoMode: state.isDemoMode,
        rotation: refreshEpoch + 1,
        excludeTitles: (pool || []).map((item) => item.title),
      });
      if (fresh?.length) {
        setData(fresh);
        setRefreshEpoch((n) => n + 1);
      } else {
        setRefreshError('Could not load new articles. Try again in a moment.');
      }
    } catch {
      setRefreshError('Refresh failed. Check your connection and try again.');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <p className="fs-subtitle fs-animate-in" style={{ margin: '0 0 18px' }}>
        Headlines tailored to your interests, spending, and holdings.
      </p>

      {loading && !pool ? (
        <div className="fs-news-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="fs-news-card fs-news-card-skeleton">
              <div className="fs-skeleton" style={{ aspectRatio: '16 / 9', borderRadius: 0 }} />
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="fs-skeleton" style={{ height: 14, width: '40%' }} />
                <div className="fs-skeleton" style={{ height: 18, width: '95%' }} />
                <div className="fs-skeleton" style={{ height: 18, width: '80%' }} />
                <div className="fs-skeleton" style={{ height: 12, width: '100%' }} />
                <div className="fs-skeleton" style={{ height: 12, width: '88%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <EmptyState icon="news" title="No matching news" description="Complete onboarding interests or add transactions to personalise your feed." />
          ) : (
            <div className="fs-news-grid">
              {items.slice(0, NEWS_LIMIT).map((item, i) => {
                const href = item.link || `https://news.google.com/search?q=${encodeURIComponent(item.title)}`;
                return (
                  <a
                    key={item.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`fs-news-card fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}
                  >
                    <div className="fs-news-card-img-wrap">
                      <NewsCardImage src={item.image} alt="" />
                    </div>
                    <div className="fs-news-card-body">
                      <div className="fs-news-card-meta">{item.source}{item.dateLabel ? ` · ${item.dateLabel}` : ''}</div>
                      <div className="fs-news-card-title">{item.title}</div>
                      {item.summary && <p className="fs-news-card-summary">{item.summary}</p>}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 28, paddingBottom: 8 }}>
            <button className="fs-btn fs-btn-secondary" onClick={handleRefresh} disabled={refreshing}>
              <Icon name="refresh" size={16} /> {refreshing ? 'Refreshing…' : 'Refresh feed'}
            </button>
            {refreshError && (
              <p className="fs-subtitle" style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--fs-danger)' }}>
                {refreshError}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
