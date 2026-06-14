import { useMemo } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadChallenges, toggleChallengeStatus, addChallenge, updateChallengeProgress, challengeMessage } from '../lib/challenges';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';

const loadCh = () => loadChallenges();

const PRESETS = [
  { title: 'No-spend weekend', desc: 'Zero discretionary spend Sat–Sun', challenge_type: 'no_spend_weekend', target: 0, unit: '₹', icon: 'shield', xp: 100 },
  { title: 'Cut food delivery 30%', desc: 'vs last month average', challenge_type: 'cut_food_delivery', target: 30, unit: '%', icon: 'food', xp: 150 },
  { title: 'Save ₹5,000 extra', desc: 'Above your usual savings rate', challenge_type: 'extra_savings', target: 5000, unit: '₹', icon: 'savings', xp: 200 },
];

export default function SpendingChallenges() {
  const { state } = useApp();
  const { data: challenges, loading, setData } = useFeatureData(loadCh, []);

  const live = useMemo(
    () => updateChallengeProgress(challenges || [], state.transactions, state.snapshot),
    [challenges, state.transactions, state.snapshot],
  );

  const xp = useMemo(() => {
    return live.reduce((s, ch) => s + (ch.status === 'completed' ? 200 : Math.round(ch.progress * 1.5)), 0);
  }, [live]);

  const level = Math.floor(xp / 300) + 1;
  const levelProgress = (xp % 300) / 300 * 100;

  async function toggle(id, status) {
    const nextStatus = status === 'active' ? 'paused' : 'active';
    const next = await toggleChallengeStatus(id, nextStatus);
    setData(next);
  }

  async function startPreset(preset) {
    const next = await addChallenge(preset);
    setData(next);
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <div className="fs-card fs-card-padded fs-challenge-hero fs-animate-in" style={{ marginBottom: 22 }}>
        <div className="fs-challenge-ring" style={{ borderTopColor: 'var(--fs-brand)', transform: `rotate(${levelProgress * 3.6}deg)` }}>
          <span style={{ transform: `rotate(-${levelProgress * 3.6}deg)` }}>L{level}</span>
        </div>
        <div className="fs-h2" style={{ marginBottom: 4 }}>{xp} XP</div>
        <p className="fs-subtitle" style={{ margin: 0 }}>Complete challenges to level up your money habits</p>
      </div>

      {loading ? (
        <div className="fs-skeleton" style={{ height: 160, borderRadius: 14 }} />
      ) : (
        <>
          <div className="fs-label" style={{ marginBottom: 12 }}>Start a challenge</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
            {PRESETS.map(p => (
              <button
                key={p.title}
                className="fs-card fs-card-padded fs-card-hover"
                style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--fs-border)' }}
                onClick={() => startPreset(p)}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fs-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon name={p.icon} size={20} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{p.title}</div>
                <div className="fs-subtitle" style={{ fontSize: '0.75rem', marginBottom: 8 }}>{p.desc}</div>
                <span className="fs-badge fs-badge-brand">+{p.xp} XP</span>
              </button>
            ))}
          </div>

          {!live.length ? (
            <EmptyState icon="challenge" title="No active challenges" description="Pick a challenge above to start earning XP." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {live.map((ch, i) => {
                const active = ch.status === 'active';
                const done = ch.progress >= 100;
                const onTrack = ch.progress >= 60;
                const statusBadge = done
                  ? { cls: 'fs-badge-success', label: 'Completed' }
                  : onTrack
                    ? { cls: 'fs-badge-brand', label: 'On track' }
                    : { cls: 'fs-badge-warning', label: 'In progress' };
                return (
                  <div key={ch.id} className={`fs-card fs-card-padded fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div className="fs-h3" style={{ fontSize: '0.95rem' }}>{ch.title}</div>
                          <span className={`fs-badge ${statusBadge.cls}`}>{statusBadge.label}</span>
                        </div>
                        <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{ch.desc}</div>
                      </div>
                      <button className={`fs-toggle ${active ? 'on' : ''}`} onClick={() => toggle(ch.id, ch.status)} aria-pressed={active} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div className="fs-progress-track" style={{ height: 10, flex: 1 }}>
                        <div className="fs-progress-fill fs-progress-fill-animated" style={{ width: `${Math.min(100, ch.progress)}%`, background: done ? 'var(--fs-success)' : onTrack ? 'var(--fs-brand)' : 'var(--fs-warning)' }} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: 42 }}>{Math.round(ch.progress)}%</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--fs-text-secondary)' }}>{challengeMessage(ch)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
