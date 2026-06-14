import { useState } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { fetchAccounts, upsertAccount, setDefaultAccountOnly, deleteAccount, paletteColor } from '../lib/accounts';
import { formatRupee } from '../lib/format';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';

const load = () => fetchAccounts();

const emptyForm = { name: '', institution: '', balance: '', is_default: false };

export default function Accounts() {
  const { refreshAppData } = useApp();
  const { data: accounts, loading, setData } = useFeatureData(load, []);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const total = (accounts || []).reduce((s, a) => s + (a.balance || 0), 0);

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, is_default: !(accounts?.length) });
    setShowForm(true);
  }

  function openEdit(account) {
    setEditingId(account.id);
    setForm({
      name: account.name,
      institution: account.institution || '',
      balance: String(account.balance ?? ''),
      is_default: account.is_default,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const next = await upsertAccount({
        id: editingId || undefined,
        name: form.name.trim(),
        institution: form.institution.trim(),
        balance: Number(form.balance) || 0,
        is_default: form.is_default || !(accounts?.length),
        color: editingId ? undefined : paletteColor((accounts || []).length),
      });
      setData(next);
      closeForm();
      await refreshAppData();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this account? This cannot be undone.')) return;
    const next = await deleteAccount(id);
    setData(next);
    if (editingId === id) closeForm();
    await refreshAppData();
  }

  async function setDefault(id) {
    const next = await setDefaultAccountOnly(id);
    setData(next);
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div className="fs-card fs-card-padded fs-animate-in" style={{ flex: 1, minWidth: 240 }}>
          <div className="fs-label">Total across accounts</div>
          <div className="fs-metric fs-metric-xl" style={{ marginTop: 8 }}>{formatRupee(total)}</div>
          <p className="fs-subtitle" style={{ marginTop: 8, marginBottom: 0 }}>Balances update when you log income or expenses from an account.</p>
        </div>
        {(accounts?.length > 0) && !showForm && (
          <button className="fs-btn fs-btn-primary fs-animate-in" onClick={openAdd}>
            <Icon name="plus" size={16} /> Add account
          </button>
        )}
      </div>

      {loading ? (
        <div className="fs-skeleton" style={{ height: 120, borderRadius: 14 }} />
      ) : !accounts?.length && !showForm ? (
        <EmptyState
          icon="wallet"
          title="No accounts linked"
          description="Add your bank accounts to track balances and power net worth."
          action={<button className="fs-btn fs-btn-primary" onClick={openAdd}>Add account</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {(accounts || []).map(a => (
            <div key={a.id} className="fs-card fs-card-padded" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 12, height: 12, borderRadius: 99, background: a.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {a.name}
                  {a.is_default && <span className="fs-badge fs-badge-brand" style={{ fontSize: '0.65rem' }}>Default</span>}
                </div>
                <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{a.institution || 'Bank account'}</div>
              </div>
              <div className="fs-money" style={{ fontWeight: 700, fontSize: '1rem' }}>{formatRupee(a.balance)}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {!a.is_default && (
                  <button className="fs-btn fs-btn-ghost fs-btn-sm" onClick={() => setDefault(a.id)}>Make default</button>
                )}
                <button className="fs-btn fs-btn-ghost fs-btn-sm" onClick={() => openEdit(a)}>Edit</button>
                <button className="fs-btn fs-btn-ghost fs-btn-sm" style={{ color: 'var(--fs-danger)' }} onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fs-card fs-card-padded">
          <div className="fs-h3" style={{ marginBottom: 14 }}>{editingId ? 'Edit account' : 'Add account'}</div>
          <form onSubmit={handleSave} style={{ display: 'grid', gap: 12 }}>
            <input className="fs-input" placeholder="Account name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input className="fs-input" placeholder="Bank / institution" value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
            <input className="fs-input" type="number" step="1" placeholder="Balance (₹)" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
            <label className="fs-settings-row">
              <span style={{ fontSize: '0.875rem' }}>Default account</span>
              <button
                type="button"
                className={`fs-toggle ${form.is_default ? 'on' : ''}`}
                onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
                aria-pressed={form.is_default}
              />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="fs-btn fs-btn-secondary" style={{ flex: 1 }} onClick={closeForm} disabled={saving}>Cancel</button>
              <button type="submit" className="fs-btn fs-btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Save account'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
