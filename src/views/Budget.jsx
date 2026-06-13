import { useState } from 'react';
import { useApp } from '../context';
import { currentMonthLabel, formatRupee } from '../lib/format';
import { categoryMeta } from '../lib/categories';
import AddBudgetModal from '../components/AddBudgetModal';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import CategoryIcon from '../components/ui/CategoryIcon';
import EmptyState from '../components/ui/EmptyState';

export default function Budget() {
  const { state, refreshAppData } = useApp();
  const { budgets, dataLoading } = state;
  const [showAdd, setShowAdd] = useState(false);

  const items = budgets.map(b => {
    const pct = b.limit ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
    const remain = b.limit - b.spent;
    const base = categoryMeta(b.cat).color;
    const barColor = pct >= 90 ? 'var(--fs-danger)' : pct >= 75 ? 'var(--fs-warning)' : base;
    return { ...b, pct, remain, barColor, remainNegative: remain < 0 };
  });

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const overallPct = totalLimit ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;

  return (
    <div className="fs-content-inner fs-view-enter">
      <AddBudgetModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={refreshAppData} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="fs-animate-in">
          <h2 className="fs-h1" style={{ marginBottom: 4 }}>{currentMonthLabel()} budget</h2>
          <p className="fs-subtitle">
            {formatRupee(totalSpent)} spent of {formatRupee(totalLimit)} budgeted
          </p>
        </div>
        <button className="fs-btn fs-btn-primary fs-animate-in fs-animate-in-delay-1" onClick={() => setShowAdd(true)}>
          Add category
        </button>
      </div>

      {totalLimit > 0 && (
        <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-1" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span className="fs-label">Overall budget usage</span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: overallPct >= 90 ? 'var(--fs-danger)' : 'var(--fs-text)' }}>
              <AnimatedNumber value={overallPct} format={(n) => `${Math.round(n)}%`} />
            </span>
          </div>
          <div className="fs-progress-track" style={{ height: 10 }}>
            <div className="fs-progress-fill fs-progress-fill-animated" style={{ width: `${overallPct}%`, background: overallPct >= 90 ? 'var(--fs-danger)' : 'var(--fs-brand)' }} />
          </div>
        </div>
      )}

      {dataLoading && !budgets.length ? (
        <div className="fs-skeleton" style={{ height: 200, borderRadius: 14 }} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="budget"
          title="No budgets set up"
          description="Complete onboarding to get persona-based budgets, or add categories manually."
          action={<button className="fs-btn fs-btn-primary" onClick={() => setShowAdd(true)}>Create first budget</button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {items.map((item, i) => (
            <div key={item.id || item.cat} className={`fs-card fs-card-padded fs-card-hover fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <CategoryIcon category={item.cat} size={38} iconSize={18} />
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.cat}</div>
                    <div className="fs-subtitle" style={{ fontSize: '0.72rem' }}>{item.pct}% used</div>
                  </div>
                </div>
                {item.pct >= 90 && <span className="fs-badge fs-badge-muted" style={{ color: 'var(--fs-danger)', fontSize: '0.65rem', padding: '3px 9px' }}>Near limit</span>}
              </div>
              <div className="fs-progress-track" style={{ marginBottom: 10 }}>
                <div className="fs-progress-fill fs-progress-fill-animated" style={{ width: `${item.pct}%`, background: item.barColor, transitionDelay: `${i * 0.05}s` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="fs-money" style={{ fontSize: '0.95rem', fontWeight: 700 }}>{formatRupee(item.spent)} <span className="fs-subtitle" style={{ fontSize: '0.8125rem', fontWeight: 400 }}>/ {formatRupee(item.limit)}</span></span>
                <span className="fs-money" style={{ fontSize: '0.75rem', fontWeight: 600, color: item.remainNegative ? 'var(--fs-danger)' : 'var(--fs-text-secondary)' }}>
                  {item.remainNegative ? `${formatRupee(Math.abs(item.remain))} over` : `${formatRupee(item.remain)} left`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
