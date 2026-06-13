import { useState, useEffect } from 'react';
import { useApp } from '../context';
import Modal from './ui/Modal';
import Select from './ui/Select';
import { fetchAccounts, defaultAccount } from '../lib/accounts';

const CATEGORIES = ['Food & Dining', 'Groceries', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Paychecks', 'Other'];

export default function AddTransactionModal({ open, onClose, onSaved }) {
  const { addTransaction, up, state } = useApp();
  const { isDemoMode } = state;
  const [form, setForm] = useState({ name: '', amount: '', category: 'Food & Dining', type: 'expense', account: '', isRecurring: false });
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchAccounts(isDemoMode).then(list => {
      setAccounts(list);
      const def = defaultAccount(list);
      setForm(f => ({ ...f, account: def?.name || '' }));
    });
  }, [open, isDemoMode]);

  async function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.name || !amt) return;
    setSaving(true);
    try {
      const amount = form.type === 'income' ? Math.abs(amt) : -Math.abs(amt);
      await addTransaction({
        name: form.name,
        amount,
        category: form.category,
        account: form.account,
        isRecurring: form.isRecurring,
        source: form.isRecurring ? 'recurring' : 'manual',
      });
      if (!isDemoMode && onSaved) await onSaved();
      onClose();
      setForm({ name: '', amount: '', category: 'Food & Dining', type: 'expense', account: form.account, isRecurring: false });
    } catch (err) {
      up({ authError: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add transaction" subtitle="Logged from your default account unless you pick another">
      <form onSubmit={handleSubmit}>
        <div className="fs-field">
          <label className="fs-field-label">Type</label>
          <div className="fs-tab-group" style={{ marginBottom: 0 }}>
            <button type="button" className={`fs-tab ${form.type === 'expense' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'expense' }))}>Expense</button>
            <button type="button" className={`fs-tab ${form.type === 'income' ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, type: 'income' }))}>Income</button>
          </div>
        </div>
        <div className="fs-field">
          <label className="fs-field-label">Description</label>
          <input className="fs-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Swiggy, rent, salary…" required />
        </div>
        <div className="fs-field">
          <label className="fs-field-label">Amount (₹)</label>
          <input type="number" className="fs-input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="500" required />
        </div>
        <div className="fs-field">
          <label className="fs-field-label">Category</label>
          <Select
            value={form.category}
            onChange={v => setForm(f => ({ ...f, category: v }))}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
          />
        </div>
        {accounts.length > 0 && (
          <div className="fs-field">
            <label className="fs-field-label">Account</label>
            <Select
              value={form.account}
              onChange={v => setForm(f => ({ ...f, account: v }))}
              options={accounts.map(a => ({ value: a.name, label: `${a.name}${a.is_default ? ' (default)' : ''}` }))}
            />
          </div>
        )}
        <label className="fs-settings-row" style={{ marginBottom: 12 }}>
          <span style={{ fontSize: '0.875rem' }}>Mark as recurring (subscription, rent, EMI)</span>
          <button
            type="button"
            className={`fs-toggle ${form.isRecurring ? 'on' : ''}`}
            onClick={() => setForm(f => ({ ...f, isRecurring: !f.isRecurring }))}
            aria-pressed={form.isRecurring}
          />
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" className="fs-btn fs-btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button type="submit" className="fs-btn fs-btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Add transaction'}</button>
        </div>
      </form>
    </Modal>
  );
}
