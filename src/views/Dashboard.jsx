import { useMemo } from 'react';
import { useApp } from '../context';
import { ASSISTANT_NAME } from '../lib/assistant';
import { gaugeFromScore, forecastPathsFromPoints, formatRupee, currentMonthLabel } from '../lib/format';
import { buildBriefing, dashboardSubtitle } from '../lib/briefing';
import { chartColor } from '../lib/chartColors';
import { sortTransactionsDesc } from '../lib/snapshot';
import { userTransactionsOnly } from '../lib/format';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import Icon from '../components/ui/Icon';
import CategoryIcon from '../components/ui/CategoryIcon';
import EmptyState from '../components/ui/EmptyState';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ label, value, format, sub, accent, delay, icon }) {
  return (
    <div className={`fs-card fs-card-padded fs-stat-card fs-card-hover fs-animate-in fs-animate-in-delay-${delay}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="fs-label">{label}</div>
        {icon && <span style={{ color: 'var(--fs-text-muted)' }}><Icon name={icon} size={17} /></span>}
      </div>
      <div className="fs-stat-value" style={{ color: accent || 'var(--fs-text)' }}>
        {typeof value === 'number' ? <AnimatedNumber value={value} format={format} /> : value}
      </div>
      {sub && <div className="fs-subtitle" style={{ marginTop: 6, fontSize: '0.8125rem' }}>{sub}</div>}
    </div>
  );
}

function HealthRing({ score }) {
  const g = gaugeFromScore(score);
  return (
    <div style={{ position: 'relative', width: 128, height: 128, flexShrink: 0 }}>
      <svg width="128" height="128" viewBox="0 0 120 120">
        <circle className="fs-ring-track" cx="60" cy="60" r="46" fill="none" strokeWidth="10" />
        <circle
          className="fs-ring-fill"
          cx="60" cy="60" r="46" fill="none" strokeWidth="10" strokeLinecap="round"
          stroke={g.color}
          strokeDasharray={g.circumference}
          strokeDashoffset={g.dashOffset}
          transform={g.transform}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="fs-metric fs-metric-lg" style={{ color: g.color, lineHeight: 1 }}>
          <AnimatedNumber value={g.score} format={(n) => Math.round(n)} />
        </div>
        <div className="fs-label" style={{ marginTop: 3 }}>Health</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, up, setActiveNav } = useApp();
  const { snapshot, fullName, dataLoading, transactions, questionnaire } = state;
  const snap = snapshot || {};
  const forecast = useMemo(() => forecastPathsFromPoints(snap.forecast?.points), [snap.forecast]);
  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const todayLineX = ((Math.min(today, daysInMonth) - 1) / Math.max(daysInMonth - 1, 1)) * 560;
  const mtdSavings = snap.net_savings ?? forecast.pts?.[today - 1]?.value ?? 0;
  const categoryDna = useMemo(() => (snap.donut_segments || []).slice(0, 6), [snap.donut_segments]);
  const leaks = snap.leaks || [];
  const briefing = useMemo(() => buildBriefing(snap, questionnaire || {}), [snap, questionnaire]);
  const firstName = (fullName || 'there').split(' ')[0];
  const recent = useMemo(
    () => sortTransactionsDesc(userTransactionsOnly(transactions)),
    [transactions],
  );

  if (dataLoading && !snapshot) {
    return (
      <div className="fs-content-inner">
        <div className="fs-skeleton" style={{ height: 116, borderRadius: 14, marginBottom: 18 }} />
        <div className="fs-stat-grid-3" style={{ marginBottom: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="fs-skeleton" style={{ height: 108, borderRadius: 14 }} />)}
        </div>
        <div className="fs-grid-2">
          {[1, 2].map(i => <div key={i} className="fs-skeleton" style={{ height: 220, borderRadius: 14 }} />)}
        </div>
      </div>
    );
  }

  const empty = !snap.monthly_spend && !userTransactionsOnly(transactions).length;

  return (
    <div className="fs-content-inner fs-view-enter">
      <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 className="fs-h1" style={{ marginBottom: 6 }}>{greeting()}, {firstName}</h2>
          <p className="fs-subtitle" style={{ marginBottom: 16 }}>{currentMonthLabel()} · {dashboardSubtitle(questionnaire || {})}</p>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, margin: 0, color: snap.net_savings < 0 ? 'var(--fs-danger)' : 'var(--fs-text-secondary)' }}>
            {briefing}
          </p>
        </div>
        <HealthRing score={snap.health_score || 0} />
      </div>

      <div className="fs-stat-grid-3" style={{ marginBottom: 18 }}>
        <StatCard
          label="Monthly spend" icon="wallet"
          value={snap.monthly_spend || 0}
          format={(n) => formatRupee(n)}
          sub={`${snap.budget_used_pct || 0}% of ${formatRupee(snap.total_budget_limit || 0)} budget`}
          delay={1}
        />
        <StatCard
          label="Net savings" icon="savings"
          value={snap.net_savings || 0}
          format={(n) => formatRupee(n)}
          sub={`from ${formatRupee(snap.monthly_income || 0)} income`}
          accent="var(--fs-success)"
          delay={2}
        />
        <StatCard
          label="Savings rate" icon="trendUp"
          value={snap.savings_rate_pct || 0}
          format={(n) => `${(Math.round(n * 10) / 10)}%`}
          sub={snap.health_label || 'Getting started'}
          delay={3}
        />
      </div>

      <div className="fs-grid-2 fs-animate-in fs-animate-in-delay-2" style={{ marginBottom: 18 }}>
        <div className="fs-card fs-card-padded">
          <div className="fs-label" style={{ marginBottom: 20 }}>Spending breakdown</div>
          {categoryDna.length === 0 ? (
            <p className="fs-subtitle">Log expenses to see where your money goes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {categoryDna.map((seg, i) => {
                const color = chartColor(i);
                return (
                  <div key={seg.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{seg.name}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{seg.pct || 0}%</span>
                    </div>
                    <div className="fs-progress-track">
                      <div className="fs-progress-fill fs-progress-fill-animated" style={{ width: `${seg.pct || 0}%`, background: color }} />
                    </div>
                    <div className="fs-subtitle" style={{ marginTop: 5, fontSize: '0.72rem' }}>{formatRupee(seg.amount || 0)} this month</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="fs-card fs-card-padded">
          <div className="fs-label" style={{ marginBottom: 6 }}>Savings forecast</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
            <div className="fs-metric fs-metric-lg">
              <AnimatedNumber value={mtdSavings} format={(n) => formatRupee(n)} />{' '}
              <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--fs-text-secondary)' }}>saved so far</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--fs-text-secondary)' }}>
              Projected <strong style={{ color: 'var(--fs-text)' }}>{formatRupee(snap.forecast?.projected_savings || snap.net_savings || 0)}</strong> by month end
            </div>
          </div>
          <p className="fs-subtitle" style={{ fontSize: '0.72rem', marginBottom: 12 }}>
            Solid line = cumulative savings from your transactions · shaded tail = run-rate projection
          </p>
          <svg viewBox="0 0 560 120" style={{ width: '100%', height: 120 }} preserveAspectRatio="none" role="img" aria-label="Monthly savings chart">
            <line x1="0" y1="112" x2="560" y2="112" stroke="var(--fs-border)" strokeWidth="1" />
            <line x1={todayLineX} y1="4" x2={todayLineX} y2="112" stroke="var(--fs-border-strong)" strokeWidth="1" strokeDasharray="4 4" />
            <path d={forecast.area} fill="var(--fs-info-soft)" style={{ animation: 'fs-fade-in 1.2s ease 0.3s both' }} />
            <path
              d={forecast.line} fill="none" stroke="var(--fs-chart-blue)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 1600, strokeDashoffset: 1600, animation: 'fs-draw 1.6s var(--fs-ease) 0.2s forwards' }}
            />
            {(forecast.pts || []).filter((_, i) => i < today).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.2" fill="var(--fs-chart-blue)" stroke="var(--fs-surface-solid)" strokeWidth="1.5" />
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.68rem', color: 'var(--fs-text-muted)' }}>
            <span>Day 1</span>
            <span>Today (day {today})</span>
            <span>Day {daysInMonth}</span>
          </div>
        </div>
      </div>

      {leaks.length > 0 && (
        <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-3" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
            <div className="fs-label">Leak detector</div>
            <span className="fs-badge fs-badge-brand">{leaks.length} found</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaks.map((leak, i) => (
              <div key={i} className="fs-animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--fs-surface-2)', borderRadius: 12, border: '1px solid var(--fs-border)', animationDelay: `${0.1 + i * 0.06}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <Icon name="alert" size={20} style={{ color: 'var(--fs-warning)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{leak.title}</div>
                    <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{leak.detail}</div>
                  </div>
                </div>
                {leak.delta ? <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fs-brand)' }}>+{formatRupee(leak.delta)}</span> : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="fs-card fs-animate-in fs-animate-in-delay-4" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fs-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="fs-h3">Recent activity</div>
            <button className="fs-btn fs-btn-ghost fs-btn-sm" onClick={() => setActiveNav('transactions')} style={{ gap: 5 }}>
              View all <Icon name="chevronRight" size={14} />
            </button>
          </div>
          {recent.map(tx => (
            <div key={tx.id} className="fs-tx-row">
              <CategoryIcon category={tx.category} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{tx.name}</div>
                <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{tx.category}</div>
              </div>
              <div className="fs-money" style={{ fontSize: '0.875rem', fontWeight: 600, color: tx.amountColor }}>{tx.amountStr}</div>
            </div>
          ))}
        </div>
      )}

      {empty && (
        <EmptyState
          icon="message"
          title="Your dashboard is ready"
          description={`Add a transaction manually or tell ${ASSISTANT_NAME} what you spent — your dashboard updates from your real data.`}
          action={<button className="fs-btn fs-btn-primary" onClick={() => up({ showAI: true })}>Open {ASSISTANT_NAME}</button>}
        />
      )}
    </div>
  );
}
