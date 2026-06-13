import { useMemo } from 'react';
import { useApp } from '../context';
import { donutPathsFromSegments, formatRupee } from '../lib/format';
import { categoryMeta } from '../lib/categories';
import { detectRecurring } from '../lib/recurring';

function inCurrentMonth(txnDate) {
  const d = new Date(txnDate);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function normalizeMerchant(name = '') {
  return name.toLowerCase().trim();
}
import AnimatedNumber from '../components/ui/AnimatedNumber';
import EmptyState from '../components/ui/EmptyState';

export default function Reports() {
  const { state } = useApp();
  const { snapshot, transactions } = state;
  const snap = snapshot || {};

  const segments = useMemo(() => {
    return donutPathsFromSegments(snap.donut_segments).map(seg => ({
      ...seg,
      color: categoryMeta(seg.name).color,
    }));
  }, [snap.donut_segments]);

  const totalSpend = (snap.donut_segments || []).reduce((s, c) => s + (c.amount || 0), 0);
  const daysInMonth = new Date().getDate() || 1;
  const dailyAvg = totalSpend / daysInMonth;

  const topMerchants = useMemo(() => {
    const map = {};
    transactions
      .filter(t => t.amount < 0 && inCurrentMonth(t.txn_date))
      .forEach(t => {
        const key = normalizeMerchant(t.name);
        map[key] = (map[key] || 0) + Math.abs(t.amount);
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, amount]) => [key.charAt(0).toUpperCase() + key.slice(1), amount]);
  }, [transactions]);

  const recurringMonthly = useMemo(() => {
    return detectRecurring(transactions).reduce((s, r) => s + r.amount, 0);
  }, [transactions]);

  const stats = [
    { value: snap.monthly_income || 0, format: (n) => formatRupee(n), label: 'Total income', color: 'var(--fs-success)' },
    { value: snap.monthly_spend || 0, format: (n) => formatRupee(n), label: 'Total expenses', color: 'var(--fs-text)' },
    { value: snap.net_savings || 0, format: (n) => formatRupee(n), label: 'Net savings', color: snap.net_savings < 0 ? 'var(--fs-danger)' : 'var(--fs-text)' },
    { value: snap.savings_rate_pct || 0, format: (n) => `${(Math.round(n * 10) / 10)}%`, label: 'Savings rate', color: 'var(--fs-text)' },
    { value: dailyAvg, format: (n) => formatRupee(n), label: 'Daily spend avg', color: 'var(--fs-text)' },
    { value: recurringMonthly, format: (n) => formatRupee(n), label: 'Recurring / mo', color: 'var(--fs-text)' },
  ];

  const budgetPct = snap.budget_used_pct || 0;

  return (
    <div className="fs-content-inner fs-view-enter">
      <div className="fs-stat-grid" style={{ marginBottom: 18, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {stats.map(({ value, format, label, color }, i) => (
          <div key={label} className={`fs-card fs-stat-card fs-card-hover fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}>
            <div className="fs-stat-value" style={{ color, fontSize: '1.35rem' }}><AnimatedNumber value={value} format={format} /></div>
            <div className="fs-label" style={{ marginTop: 7 }}>{label}</div>
          </div>
        ))}
      </div>

      {budgetPct > 0 && (
        <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="fs-label">Budget used this month</span>
            <span style={{ fontWeight: 700 }}>{budgetPct}%</span>
          </div>
          <div className="fs-progress-track" style={{ height: 10 }}>
            <div
              className="fs-progress-fill"
              style={{
                width: `${Math.min(100, budgetPct)}%`,
                background: budgetPct > 90 ? 'var(--fs-danger)' : budgetPct > 70 ? 'var(--fs-warning)' : 'var(--fs-brand)',
              }}
            />
          </div>
        </div>
      )}

      <div className="fs-grid-2" style={{ marginBottom: 18 }}>
        <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-2">
          <div className="fs-label" style={{ marginBottom: 18 }}>Spending by category</div>
          {segments.length ? (
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flexShrink: 0, position: 'relative', width: 180, height: 180 }}>
                <svg width="180" height="180" viewBox="0 0 200 200">
                  {segments.map((seg, i) => (
                    <path key={i} d={seg.d} fill={seg.color} />
                  ))}
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div className="fs-money" style={{ fontFamily: "'Sora', sans-serif", fontSize: '1rem', fontWeight: 700 }}>
                    <AnimatedNumber value={totalSpend} format={(n) => formatRupee(n)} />
                  </div>
                  <div className="fs-subtitle" style={{ fontSize: '0.72rem' }}>Total spent</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                {segments.map((seg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: '0.875rem' }}>{seg.name}</div>
                    <div className="fs-subtitle fs-money" style={{ fontSize: '0.75rem' }}>{seg.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon="reports" title="No spending data" description="Add transactions this month to see breakdown." />
          )}
        </div>

        <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-3">
          <div className="fs-label" style={{ marginBottom: 14 }}>Top merchants</div>
          {topMerchants.length === 0 ? (
            <p className="fs-subtitle">No expense transactions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topMerchants.map(([name, amount], i) => {
                const pct = totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0;
                return (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{name}</span>
                      <span className="fs-money" style={{ fontWeight: 600 }}>{formatRupee(amount)}</span>
                    </div>
                    <div className="fs-progress-track" style={{ height: 6 }}>
                      <div className="fs-progress-fill" style={{ width: `${pct}%`, background: 'var(--fs-brand)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {(snap.leaks || []).length > 0 && (
        <div className="fs-card fs-card-padded fs-animate-in">
          <div className="fs-label" style={{ marginBottom: 14 }}>Spending alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {snap.leaks.map((leak, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--fs-surface-2)', borderRadius: 10, fontSize: '0.875rem' }}>
                <strong>{leak.title || 'Alert'}</strong>
                {leak.detail && <span className="fs-subtitle"> — {leak.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
