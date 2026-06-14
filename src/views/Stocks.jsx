import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadHoldings, addHolding, quoteHoldings, portfolioSummaryText } from '../lib/stocks';
import { formatRupee } from '../lib/format';
import Icon from '../components/ui/Icon';
import EmptyState from '../components/ui/EmptyState';

const loadStocks = (isDemo, uid) => loadHoldings(isDemo, uid);

export default function Stocks() {
  const { state } = useApp();
  const { data: holdings, loading, reload, setData } = useFeatureData(loadStocks, []);
  const [summary, setSummary] = useState({ rows: [], invested: 0, current: 0, changePct: 0 });
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [form, setForm] = useState({ symbol: '', name: '', qty: '', avgPrice: '' });

  useEffect(() => {
    if (!holdings?.length) {
      setSummary({ rows: [], invested: 0, current: 0, changePct: 0 });
      return;
    }
    let cancelled = false;
    setQuotesLoading(true);
    quoteHoldings(holdings, state.isDemoMode).then(s => {
      if (!cancelled) { setSummary(s); setQuotesLoading(false); }
    });
    return () => { cancelled = true; };
  }, [holdings, state.isDemoMode]);

  async function refresh() {
    if (!holdings) return;
    setQuotesLoading(true);
    const s = await quoteHoldings(holdings, state.isDemoMode);
    setSummary(s);
    setQuotesLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.symbol || !form.qty) return;
    const holding = {
      id: `s${Date.now()}`,
      symbol: form.symbol.toUpperCase(),
      name: form.name || form.symbol,
      exchange: 'NSE',
      qty: Number(form.qty),
      avgPrice: Number(form.avgPrice) || 100,
      basePrice: Number(form.avgPrice) || 100,
    };
    const next = await addHolding(state.isDemoMode, state.user?.id, holding);
    setData(next);
    setForm({ symbol: '', name: '', qty: '', avgPrice: '' });
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      {summary.rows.length > 0 && (
        <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18, background: 'var(--fs-surface-2)' }}>
          <div className="fs-label" style={{ color: 'var(--fs-brand)', marginBottom: 8 }}>AI summary</div>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>{portfolioSummaryText(summary)}</p>
        </div>
      )}

      <div className="fs-stat-grid-3 fs-animate-in fs-animate-in-delay-1" style={{ marginBottom: 18 }}>
        <div className="fs-card fs-stat-card"><div className="fs-label">Portfolio value</div><div className="fs-stat-value">{formatRupee(summary.current)}</div></div>
        <div className="fs-card fs-stat-card"><div className="fs-label">Invested</div><div className="fs-stat-value">{formatRupee(summary.invested)}</div></div>
        <div className="fs-card fs-stat-card"><div className="fs-stat-value" style={{ color: summary.changePct >= 0 ? 'var(--fs-success)' : 'var(--fs-danger)' }}>{summary.changePct >= 0 ? '+' : ''}{summary.changePct}%</div><div className="fs-label" style={{ marginTop: 7 }}>Overall return</div></div>
      </div>

      {holdings?.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button className="fs-btn fs-btn-secondary fs-btn-sm" onClick={refresh} disabled={quotesLoading}>
            <Icon name="refresh" size={15} /> {quotesLoading ? 'Loading…' : 'Refresh prices'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="fs-skeleton" style={{ height: 200, borderRadius: 14, marginBottom: 18 }} />
      ) : !holdings?.length ? (
        <EmptyState icon="stocks" title="No holdings" description="Add NSE stocks (e.g. HDFCBANK, SBIN) to track live prices via Yahoo Finance." />
      ) : (
        <div className="fs-card" style={{ overflow: 'hidden', marginBottom: 18 }}>
          {summary.rows.map(row => (
            <div key={row.id} className="fs-tx-row">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{row.symbol}</div>
                <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{row.name} · {row.qty} shares</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="fs-money" style={{ fontWeight: 700 }}>{formatRupee(row.currentPrice * row.qty)}</div>
                <div style={{ fontSize: '0.75rem', color: row.changePct >= 0 ? 'var(--fs-success)' : 'var(--fs-danger)' }}>{row.changePct >= 0 ? '+' : ''}{row.changePct}% today</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fs-card fs-card-padded">
        <div className="fs-h3" style={{ marginBottom: 14 }}>Add holding</div>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input className="fs-input" placeholder="Symbol (e.g. SBIN)" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} required />
          <input className="fs-input" placeholder="Company name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="fs-input" type="number" placeholder="Quantity" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} required />
          <input className="fs-input" type="number" placeholder="Avg buy price (₹)" value={form.avgPrice} onChange={e => setForm(f => ({ ...f, avgPrice: e.target.value }))} />
          <button type="submit" className="fs-btn fs-btn-primary" style={{ gridColumn: '1 / -1' }}>Add stock</button>
        </form>
      </div>
    </div>
  );
}
