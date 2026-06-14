import { useMemo, useState } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { detectRecurring } from '../lib/recurring';
import { formatRupee, formatTxnDate } from '../lib/format';
import {
  fetchSubscriptions,
  toggleSubscription,
  updateSubscriptionAmount,
  addCustomSubscription,
  removeSubscription,
  isPresetService,
  OTT_SERVICES,
  OTHER_RECURRING,
} from '../lib/subscriptions';
import CategoryIcon from '../components/ui/CategoryIcon';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import AddCustomRecurringModal from '../components/AddCustomRecurringModal';

const loadSubs = (isDemo, uid) => fetchSubscriptions(isDemo, uid);

const STREAMING = OTT_SERVICES.filter(s => s.service !== 'Spotify');
const MUSIC = OTT_SERVICES.filter(s => s.service === 'Spotify');

export default function Recurring() {
  const { state } = useApp();
  const { transactions } = state;
  const { data: subs, loading, setData } = useFeatureData(loadSubs, []);
  const [amountEdits, setAmountEdits] = useState({});
  const [showAddCustom, setShowAddCustom] = useState(false);

  const recurring = useMemo(() => detectRecurring(transactions), [transactions]);
  const activeSubs = (subs || []).filter(s => s.active);
  const subMonthly = activeSubs.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const detectedMonthly = recurring.reduce((s, r) => s + r.amount, 0);

  const customSubs = useMemo(
    () => (subs || []).filter(s => !isPresetService(s.service)),
    [subs],
  );

  async function handleToggle(service, meta, active) {
    const next = await toggleSubscription(state.isDemoMode, state.user?.id, service, meta, active);
    setData(next);
  }

  async function saveAmount(service) {
    const val = amountEdits[service];
    if (val == null) return;
    const next = await updateSubscriptionAmount(state.isDemoMode, state.user?.id, service, val);
    setData(next);
    setAmountEdits(e => ({ ...e, [service]: undefined }));
  }

  async function handleAddCustom(payload) {
    const next = await addCustomSubscription(state.isDemoMode, state.user?.id, payload);
    setData(next);
  }

  async function handleRemove(service) {
    const next = await removeSubscription(state.isDemoMode, state.user?.id, service);
    setData(next);
    setAmountEdits(e => {
      const copy = { ...e };
      delete copy[service];
      return copy;
    });
  }

  function SubCard({ meta, custom = false }) {
    const row = (subs || []).find(s => s.service === meta.service);
    const active = !!row?.active;
    const amount = amountEdits[meta.service] ?? row?.amount ?? meta.defaultAmount;

    return (
      <div
        className={`fs-sub-card ${active ? 'active' : ''}`}
        onClick={() => handleToggle(meta.service, meta, !active)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleToggle(meta.service, meta, !active)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: active ? 10 : 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{meta.service}</div>
            <div className="fs-subtitle" style={{ fontSize: '0.72rem' }}>{meta.category}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {custom && (
              <button
                type="button"
                className="fs-btn fs-btn-ghost fs-btn-icon"
                style={{ width: 30, height: 30 }}
                title="Remove"
                aria-label={`Remove ${meta.service}`}
                onClick={e => { e.stopPropagation(); handleRemove(meta.service); }}
              >
                <Icon name="trash" size={15} />
              </button>
            )}
            <button
              type="button"
              className={`fs-toggle ${active ? 'on' : ''}`}
              onClick={e => { e.stopPropagation(); handleToggle(meta.service, meta, !active); }}
              aria-pressed={active}
            />
          </div>
        </div>
        {active && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <span className="fs-subtitle" style={{ fontSize: '0.75rem' }}>₹</span>
            <input
              className="fs-input fs-input-sm"
              type="number"
              style={{ flex: 1 }}
              value={amount}
              onChange={e => setAmountEdits(ed => ({ ...ed, [meta.service]: e.target.value }))}
            />
            <button type="button" className="fs-btn fs-btn-brand fs-btn-sm" onClick={() => saveAmount(meta.service)}>Save</button>
          </div>
        )}
        {active && (
          <div className="fs-subtitle" style={{ marginTop: 8, fontSize: '0.75rem', fontWeight: 600 }}>
            {formatRupee(Number(amount) || 0)}/month
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <AddCustomRecurringModal
        open={showAddCustom}
        onClose={() => setShowAddCustom(false)}
        onSave={handleAddCustom}
      />

      <header className="fs-animate-in" style={{ marginBottom: 22 }}>
        <h2 className="fs-h1" style={{ marginBottom: 4 }}>Recurring & subscriptions</h2>
        <p className="fs-subtitle">
          ~{formatRupee(subMonthly + detectedMonthly)}/mo committed · {activeSubs.length} active subscriptions
        </p>
      </header>

      <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
          <div className="fs-label" style={{ marginBottom: 0 }}>Custom recurring</div>
          <button type="button" className="fs-btn fs-btn-secondary fs-btn-sm" onClick={() => setShowAddCustom(true)}>
            <Icon name="plus" size={15} /> Add custom
          </button>
        </div>
        {loading ? (
          <div className="fs-skeleton" style={{ height: 80, borderRadius: 10 }} />
        ) : customSubs.length === 0 ? (
          <p className="fs-subtitle" style={{ fontSize: '0.8125rem', margin: 0 }}>
            Add gym fees, EMIs, insurance premiums, or any bill that repeats every month.
          </p>
        ) : (
          <div className="fs-sub-grid">
            {customSubs.map(row => (
              <SubCard
                key={row.service}
                custom
                meta={{
                  service: row.service,
                  category: row.category || 'Other',
                  defaultAmount: row.amount || 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18 }}>
        <div className="fs-label" style={{ marginBottom: 14 }}>Streaming (OTT)</div>
        {loading ? (
          <div className="fs-skeleton" style={{ height: 80, borderRadius: 10 }} />
        ) : (
          <div className="fs-sub-grid">
            {STREAMING.map(meta => <SubCard key={meta.service} meta={meta} />)}
          </div>
        )}
      </div>

      <div className="fs-grid-2" style={{ marginBottom: 18 }}>
        <div className="fs-card fs-card-padded fs-animate-in">
          <div className="fs-label" style={{ marginBottom: 14 }}>Music</div>
          {loading ? <div className="fs-skeleton" style={{ height: 60, borderRadius: 10 }} /> : (
            <div className="fs-sub-grid" style={{ gridTemplateColumns: '1fr' }}>
              {MUSIC.map(meta => <SubCard key={meta.service} meta={meta} />)}
            </div>
          )}
        </div>
        <div className="fs-card fs-card-padded fs-animate-in">
          <div className="fs-label" style={{ marginBottom: 14 }}>Rent</div>
          {loading ? <div className="fs-skeleton" style={{ height: 60, borderRadius: 10 }} /> : (
            <div className="fs-sub-grid" style={{ gridTemplateColumns: '1fr' }}>
              {OTHER_RECURRING.map(meta => <SubCard key={meta.service} meta={meta} />)}
            </div>
          )}
        </div>
      </div>

      <div className="fs-label" style={{ marginBottom: 12 }}>Detected from transactions</div>
      <p className="fs-subtitle" style={{ marginBottom: 12, fontSize: '0.8125rem' }}>
        Mark transactions as recurring when logging, or log the same merchant twice to auto-detect.
      </p>
      {recurring.length === 0 ? (
        <EmptyState
          icon="recurring"
          title="No patterns detected yet"
          description="Log repeat expenses with the recurring toggle, or identical merchants 2+ times."
        />
      ) : (
        <div className="fs-card" style={{ overflow: 'hidden' }}>
          {recurring.map((item) => (
            <div key={item.name} className="fs-tx-row">
              <CategoryIcon category={item.category} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.name}</div>
                <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>
                  {item.category} · {item.frequency} · {item.count}× logged
                  {item.flagged && ' · Marked recurring'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="fs-money" style={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatRupee(item.amount)}</div>
                <div className="fs-subtitle fs-money" style={{ fontSize: '0.6875rem' }}>Last {formatTxnDate(item.lastDate)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
