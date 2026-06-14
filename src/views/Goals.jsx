import { useState } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadGoals, addGoal, goalProgress, timelineToDays, formatGoalTimeline } from '../lib/goals';
import { formatRupee } from '../lib/format';
import Icon from '../components/ui/Icon';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';

const loadG = (isDemo, uid) => loadGoals(isDemo, uid);

export default function Goals() {
  const { state } = useApp();
  const { snapshot } = state;
  const snap = snapshot || {};
  const { data: goals, loading, setData } = useFeatureData(loadG, []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', target: '', timeline_value: 6, timeline_unit: 'months' });
  const savings = snap.net_savings || 0;
  const income = snap.monthly_income || 0;

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title || !form.target) return;
    const goal = {
      id: `g${Date.now()}`,
      title: form.title,
      target: Number(form.target),
      target_days: timelineToDays(form.timeline_value, form.timeline_unit),
      target_years: form.timeline_unit === 'years' ? Number(form.timeline_value) : undefined,
      icon: 'goals',
      color: '#1F7A5E',
    };
    const next = await addGoal(state.isDemoMode, state.user?.id, goal);
    setData(next);
    setForm({ title: '', target: '', timeline_value: 6, timeline_unit: 'months' });
    setShowAdd(false);
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <header className="fs-animate-in" style={{ marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="fs-h1" style={{ marginBottom: 4 }}>Savings goals</h2>
          <p className="fs-subtitle">Set a target and timeline — we track progress from your monthly savings</p>
        </div>
        <button className="fs-btn fs-btn-primary fs-btn-sm" onClick={() => setShowAdd(!showAdd)}>Add goal</button>
      </header>

      {showAdd && (
        <form onSubmit={handleAdd} className="fs-card fs-card-padded" style={{ marginBottom: 18, display: 'grid', gap: 12 }}>
          <input className="fs-input" placeholder="Goal name (e.g. House down payment)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <input className="fs-input" type="number" placeholder="Target amount (₹)" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="fs-label" style={{ display: 'block', marginBottom: 6 }}>Timeline</label>
              <input className="fs-input" type="number" min="1" value={form.timeline_value} onChange={e => setForm(f => ({ ...f, timeline_value: e.target.value }))} required />
            </div>
            <div>
              <label className="fs-label" style={{ display: 'block', marginBottom: 6 }}>Unit</label>
              <Select
                value={form.timeline_unit}
                onChange={v => setForm(f => ({ ...f, timeline_unit: v }))}
                options={[
                  { value: 'days', label: 'Days' },
                  { value: 'months', label: 'Months' },
                  { value: 'years', label: 'Years' },
                ]}
              />
            </div>
          </div>
          <button type="submit" className="fs-btn fs-btn-primary">Save goal</button>
        </form>
      )}

      {loading ? (
        <div className="fs-skeleton" style={{ height: 120, borderRadius: 14 }} />
      ) : !goals?.length ? (
        <EmptyState icon="goals" title="No goals yet" description="Example: save ₹5 lakh in 2 years for a vehicle down payment." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map((goal, i) => {
            const current = Math.max(0, savings);
            const { pct, remaining, monthlyNeeded, onTrack } = goalProgress(goal, current, income);
            const timelineLabel = formatGoalTimeline(goal);
            return (
              <div key={goal.id} className={`fs-card fs-card-padded fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon name={goal.icon || 'goals'} size={22} style={{ color: goal.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{goal.title}</div>
                      <div className="fs-subtitle fs-money" style={{ fontSize: '0.75rem' }}>
                        {formatRupee(goal.target)} {timelineLabel}
                      </div>
                    </div>
                  </div>
                  <span className={`fs-badge ${onTrack ? 'fs-badge-brand' : 'fs-badge-muted'}`}>{pct}%</span>
                </div>
                <div className="fs-progress-track" style={{ height: 8, marginBottom: 8 }}>
                  <div className="fs-progress-fill fs-progress-fill-animated" style={{ width: `${pct}%`, background: goal.color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{formatRupee(current)} saved this month</span>
                  <span className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{formatRupee(remaining)} to go</span>
                </div>
                {monthlyNeeded > 0 && (
                  <p className="fs-subtitle" style={{ marginTop: 10, marginBottom: 0, fontSize: '0.8125rem' }}>
                    Need ~{formatRupee(monthlyNeeded)}/mo to hit this {timelineLabel}{onTrack ? ' — you\'re on pace.' : '.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {income > 0 && (
        <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-3" style={{ marginTop: 18 }}>
          <div className="fs-label" style={{ marginBottom: 8 }}>This month</div>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, margin: 0 }}>
            At your current {snap.savings_rate_pct || 0}% savings rate, you&apos;re putting away {formatRupee(savings)} from {formatRupee(income)} income.
          </p>
        </div>
      )}
    </div>
  );
}
