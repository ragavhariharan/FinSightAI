import { useState } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { fetchAccounts, upsertAccount, setDefaultAccountOnly, paletteColor } from '../lib/accounts';
import { formatRupee } from '../lib/format';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';

const load = (isDemo) => fetchAccounts(isDemo);

export default function Accounts() {
  const { state } = useApp();
  const { data: accounts, loading, setData } = useFeatureData(load, []);
  const [form, setForm] = useState({ name: '', institution: '', balance: '', is_default: false });
  const [showForm, setShowForm] = useState(false);
  const total = (accounts || []).reduce((s, a) => s + (a.balance || 0), 0);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name) return;
    const next = await upsertAccount(state.isDemoMode, {
      name: form.name,
      institution: form.institution,
      balance: Number(form.balance) || 0,
      is_default: form.is_default || !(accounts?.length),
      color: paletteColor((accounts || []).length),
    });
    setData(next);
    setForm({ name: '', institution: '', balance: '', is_default: false });
    setShowForm(false);
  }

  async function setDefault(id) {
    const next = await setDefaultAccountOnly(state.isDemoMode, id);
    setData(next);
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18 }}>
        <div className="fs-label">Total across accounts</div>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '2rem', fontWeight: 700, marginTop: 8 }}>{formatRupee(total)}</div>
        <p className="fs-subtitle" style={{ marginTop: 8 }}>Balances update when you log income or expenses from an account.</p>
      </div>

      {loading ? (
        <div className="fs-skeleton" style={{ height: 120, borderRadius: 14 }} />
      ) : !accounts?.length ? (
        <EmptyState icon="wallet" title="No accounts linked" description="Add your bank accounts to track balances and power net worth." action={<button className="fs-btn fs-btn-primary" onClick={() => setShowForm(true)}>Add account</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {accounts.map(a => (
            <div key={a.id} className="fs-card fs-card-padded" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 12, height: 12, borderRadius: 99, background: a.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {a.name}
                  {a.is_default && <span className="fs-badge fs-badge-brand" style={{ fontSize: '0.65rem' }}>Default</span>}
                </div>
                <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{a.institution || 'Bank account'}</div>
              </div>
              <div className="fs-money" style={{ fontWeight: 700, fontSize: '1rem' }}>{formatRupee(a.balance)}</div>
              {!a.is_default && (
                <button className="fs-btn fs-btn-ghost fs-btn-sm" onClick={() => setDefault(a.id)}>Make default</button>
              )}
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button className="fs-btn fs-btn-primary" onClick={() => setShowForm(true)}>
          <Icon name="plus" size={16} /> Add account
        </button>
      ) : (
        <div className="fs-card fs-card-padded">
          <div className="fs-h3" style={{ marginBottom: 14 }}>Add account</div>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: 12 }}>
            <input className="fs-input" placeholder="Account name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input className="fs-input" placeholder="Bank / institution" value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
            <input className="fs-input" type="number" placeholder="Opening balance (₹)" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
            <label className="fs-settings-row">
              <span style={{ fontSize: '0.875rem' }}>Set as default account</span>
              <button
                type="button"
                className={`fs-toggle ${form.is_default ? 'on' : ''}`}
                onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
                aria-pressed={form.is_default}
              />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="fs-btn fs-btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="fs-btn fs-btn-primary" style={{ flex: 1 }}>Save account</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
