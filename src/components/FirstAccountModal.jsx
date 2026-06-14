import { useState } from 'react';
import { useApp } from '../context';
import { upsertAccount } from '../lib/accounts';
import Icon from './ui/Icon';

export default function FirstAccountModal({ open, onClose, onSaved }) {
  const { up } = useApp();
  const [form, setForm] = useState({ name: '', institution: '', balance: '' });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await upsertAccount({
        name: form.name.trim(),
        institution: form.institution.trim(),
        balance: Number(form.balance) || 0,
        is_default: true,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      up({ authError: err.message || 'Could not save account' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fs-overlay fs-overlay-blur fs-overlay-enter" onClick={onClose}>
      <div className="fs-modal fs-modal-enter fs-first-account-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--fs-brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Icon name="wallet" size={24} style={{ color: 'var(--fs-brand)' }} />
        </div>
        <h2 className="fs-h2" style={{ marginBottom: 8 }}>Link your bank account</h2>
        <p className="fs-subtitle" style={{ marginBottom: 22, lineHeight: 1.6 }}>
          Add your primary account so FinSight can show your balance on the dashboard and track net worth.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <input
            className="fs-input"
            placeholder="Account name (e.g. HDFC Savings)"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            autoFocus
          />
          <input
            className="fs-input"
            placeholder="Bank / institution (optional)"
            value={form.institution}
            onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
          />
          <input
            className="fs-input"
            type="number"
            min="0"
            step="1"
            placeholder="Current balance (₹)"
            value={form.balance}
            onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" className="fs-btn fs-btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={saving}>
              Skip for now
            </button>
            <button type="submit" className="fs-btn fs-btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving…' : 'Save account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
