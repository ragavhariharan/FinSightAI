import { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadNetWorth } from '../lib/netWorth';
import { fetchAccounts, totalBalance } from '../lib/accounts';
import { chartColor } from '../lib/chartColors';
import { loadHoldings, quoteHoldings } from '../lib/stocks';
import { loadFunds, fundMetrics } from '../lib/mutualFunds';
import { formatRupee, donutPathsFromSegments } from '../lib/format';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';

const loadNw = () => loadNetWorth();
const loadAcc = () => fetchAccounts();

export default function NetWorth() {
  const { state, setActiveNav } = useApp();
  const { data, loading } = useFeatureData(loadNw, []);
  const { data: accounts, loading: accLoading } = useFeatureData(loadAcc, [state.transactions?.length]);
  const [stockValue, setStockValue] = useState(0);
  const [mfValue, setMfValue] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const holdings = await loadHoldings();
      const funds = await loadFunds();
      const summary = await quoteHoldings(holdings);
      if (!cancelled) {
        setStockValue(summary.current);
        setMfValue(funds.reduce((s, f) => s + fundMetrics(f).value, 0));
      }
    })();
    return () => { cancelled = true; };
  }, [state.user?.id]);

  const bankTotal = totalBalance(accounts || []);
  const liabilities = (data?.liabilities || []).reduce((s, l) => s + l.amount, 0);

  const accountSegments = useMemo(() => {
    const list = accounts || [];
    if (!list.length) return [];
    const total = bankTotal || 1;
    return list.map((a, i) => ({
      name: a.name,
      amount: a.balance,
      pct: Math.round((a.balance / total) * 100),
      color: chartColor(i),
    }));
  }, [accounts, bankTotal]);

  const piePaths = useMemo(() => donutPathsFromSegments(accountSegments), [accountSegments]);

  const investmentTotal = stockValue + mfValue;
  const totalAssets = bankTotal + investmentTotal + (data?.assets || []).reduce((s, a) => s + a.amount, 0);
  const net = totalAssets - liabilities;

  if (loading || accLoading) {
    return <div className="fs-content-inner"><div className="fs-skeleton" style={{ height: 200, borderRadius: 14 }} /></div>;
  }

  const empty = !accounts?.length && !investmentTotal && !liabilities;

  return (
    <div className="fs-content-inner fs-view-enter">
      {empty ? (
        <EmptyState
          icon="networth"
          title="Track your net worth"
          description="Add bank accounts under Accounts — balances update automatically when you log transactions."
          action={<button className="fs-btn fs-btn-primary" onClick={() => setActiveNav('accounts')}>Go to Accounts</button>}
        />
      ) : (
        <>
          <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18, textAlign: 'center', padding: '36px 24px' }}>
            <div className="fs-label" style={{ marginBottom: 10 }}>Net worth</div>
            <div className="fs-metric fs-metric-xl" style={{ letterSpacing: '-0.025em', color: net >= 0 ? 'var(--fs-text)' : 'var(--fs-danger)' }}>
              <AnimatedNumber value={net} format={(n) => formatRupee(n)} />
            </div>
            <p className="fs-subtitle" style={{ marginTop: 10 }}>
              {formatRupee(totalAssets)} assets{liabilities > 0 ? ` · ${formatRupee(liabilities)} liabilities` : ''}
            </p>
          </div>

          <div className="fs-grid-2" style={{ marginBottom: 18 }}>
            {accounts?.length > 0 && (
              <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-1">
                <div className="fs-label" style={{ marginBottom: 16 }}>Cash & bank accounts</div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                  {piePaths.length > 0 && (
                    <svg width="120" height="120" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
                      {piePaths.map((seg, i) => (
                        <path key={i} d={seg.d} fill={seg.color} />
                      ))}
                    </svg>
                  )}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div className="fs-metric" style={{ fontSize: '1.5rem', marginBottom: 12 }}>
                      <AnimatedNumber value={bankTotal} format={(n) => formatRupee(n)} />
                    </div>
                    {accountSegments.map(seg => (
                      <div key={seg.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.8125rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{seg.name}</span>
                        <span className="fs-money" style={{ fontWeight: 600 }}>{formatRupee(seg.amount)}</span>
                        <span className="fs-subtitle">{seg.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-2">
              <div className="fs-label" style={{ marginBottom: 16 }}>Investments</div>
              {investmentTotal === 0 ? (
                <p className="fs-subtitle">Link stocks or mutual funds to include live market values.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {stockValue > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="stocks" size={18} />
                        <span style={{ fontWeight: 600 }}>Stocks</span>
                      </div>
                      <span className="fs-money" style={{ fontWeight: 700 }}>{formatRupee(stockValue)}</span>
                    </div>
                  )}
                  {mfValue > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon name="funds" size={18} />
                        <span style={{ fontWeight: 600 }}>Mutual funds</span>
                      </div>
                      <span className="fs-money" style={{ fontWeight: 700 }}>{formatRupee(mfValue)}</span>
                    </div>
                  )}
                  <div style={{ paddingTop: 10, borderTop: '1px solid var(--fs-border-light)', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="fs-subtitle">Total investments</span>
                    <span className="fs-money" style={{ fontWeight: 700 }}>{formatRupee(investmentTotal)}</span>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <button className="fs-btn fs-btn-secondary fs-btn-sm" onClick={() => setActiveNav('stocks')}>Stocks</button>
                <button className="fs-btn fs-btn-secondary fs-btn-sm" onClick={() => setActiveNav('mutualFunds')}>Mutual funds</button>
              </div>
            </div>
          </div>

          {liabilities > 0 && (
            <div className="fs-card fs-card-padded fs-animate-in">
              <div className="fs-label" style={{ marginBottom: 12 }}>Liabilities</div>
              {(data?.liabilities || []).map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--fs-border-light)' }}>
                  <span>{l.label}</span>
                  <span className="fs-money" style={{ fontWeight: 600, color: 'var(--fs-danger)' }}>{formatRupee(l.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
