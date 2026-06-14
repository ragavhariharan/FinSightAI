import { useState } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadFunds, addFund, fundMetrics } from '../lib/mutualFunds';
import { searchMutualFunds } from '../lib/api/market';
import { formatRupee } from '../lib/format';
import EmptyState from '../components/ui/EmptyState';

const loadMf = () => loadFunds();

export default function MutualFunds() {
  const { state } = useApp();
  const { data: funds, loading, setData } = useFeatureData(loadMf, []);
  const [form, setForm] = useState({ query: '', units: '', invested: '' });
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);

  async function search(e) {
    e.preventDefault();
    if (!form.query.trim()) return;
    const results = await searchMutualFunds(form.query);
    setMatches(results);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!selected || !form.units || !form.invested) return;
    const fund = {
      id: `mf${Date.now()}`,
      name: selected.name,
      isin: selected.isin,
      units: Number(form.units),
      invested: Number(form.invested),
      nav: selected.nav,
      benchmark: 'Nifty 50',
      benchmarkReturn: 14,
      fundReturn: 12,
      navHistory: [],
    };
    const next = await addFund(fund);
    setData(next);
    setForm({ query: '', units: '', invested: '' });
    setSelected(null);
    setMatches([]);
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      {loading ? (
        <div className="fs-skeleton" style={{ height: 200, borderRadius: 14 }} />
      ) : !funds?.length ? (
        <EmptyState icon="funds" title="No mutual funds" description="Search AMFI registry by fund name and add your holdings." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {funds.map((fund, i) => {
            const m = fundMetrics(fund);
            const under = fund.nav && fund.fundReturn < fund.benchmarkReturn;
            return (
              <div key={fund.id} className={`fs-card fs-card-padded fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div className="fs-h3" style={{ fontSize: '0.95rem' }}>{fund.name}</div>
                    <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>NAV {fund.nav || '—'} · vs {fund.benchmark}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="fs-money" style={{ fontWeight: 700 }}>{formatRupee(m.value)}</div>
                    <div style={{ fontSize: '0.75rem', color: m.gain >= 0 ? 'var(--fs-success)' : 'var(--fs-danger)' }}>{m.gainPct >= 0 ? '+' : ''}{m.gainPct}%</div>
                  </div>
                </div>
                <div className="fs-stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  <div><div className="fs-label">XIRR</div><div style={{ fontWeight: 700, marginTop: 4 }}>{Number.isFinite(m.xirr) ? `${m.xirr}%` : '—'}</div></div>
                  <div><div className="fs-label">Units</div><div style={{ fontWeight: 700, marginTop: 4 }}>{fund.units}</div></div>
                  <div><div className="fs-label">Invested</div><div style={{ fontWeight: 700, marginTop: 4 }}>{formatRupee(fund.invested)}</div></div>
                </div>
                {under && (
                  <div className="fs-card fs-card-padded" style={{ marginTop: 14, padding: 12, background: 'var(--fs-surface-2)' }}>
                    <span className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>
                      Fund may be underperforming {fund.benchmark} — review allocation.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="fs-card fs-card-padded">
        <div className="fs-h3" style={{ marginBottom: 14 }}>Add mutual fund</div>
        <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input className="fs-input" placeholder="Search fund name (AMFI)" value={form.query} onChange={e => setForm(f => ({ ...f, query: e.target.value }))} />
          <button type="submit" className="fs-btn fs-btn-secondary">Search</button>
        </form>
        {matches.length > 0 && (
          <div style={{ marginBottom: 12, maxHeight: 160, overflow: 'auto' }}>
            {matches.map(m => (
              <button key={m.isin} type="button" className={`fs-mcq-option ${selected?.isin === m.isin ? 'selected' : ''}`} style={{ marginBottom: 6 }} onClick={() => setSelected(m)}>
                <span style={{ flex: 1, textAlign: 'left' }}>{m.name}</span>
                <span className="fs-subtitle">NAV {m.nav}</span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: 12 }}>
            <input className="fs-input" type="number" placeholder="Units held" value={form.units} onChange={e => setForm(f => ({ ...f, units: e.target.value }))} required />
            <input className="fs-input" type="number" placeholder="Total invested (₹)" value={form.invested} onChange={e => setForm(f => ({ ...f, invested: e.target.value }))} required />
            <button type="submit" className="fs-btn fs-btn-primary">Add fund</button>
          </form>
        )}
      </div>
    </div>
  );
}
