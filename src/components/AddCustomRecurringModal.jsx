import { useState } from 'react';
import Modal from './ui/Modal';
import Select from './ui/Select';
import CategoryIcon from './ui/CategoryIcon';

const CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Utilities',
  'Insurance',
  'Entertainment',
  'Health',
  'Other',
];

export default function AddCustomRecurringModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', category: 'Other', amount: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleClose() {
    setForm({ name: '', category: 'Other', amount: '' });
    setError('');
    onClose();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({
        service: form.name,
        category: form.category,
        amount: form.amount,
      });
      handleClose();
    } catch (err) {
      setError(err.message || 'Could not add recurring expense');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add custom recurring"
      subtitle="Track EMIs, gym memberships, cloud storage, or any monthly bill"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <CategoryIcon category={form.category} size={28} />
        </div>
        <div className="fs-field">
          <label className="fs-field-label">Name</label>
          <input
            className="fs-input"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Gym membership, iCloud, EMI"
            required
            autoFocus
          />
        </div>
        <div className="fs-field">
          <label className="fs-field-label">Category</label>
          <Select
            value={form.category}
            onChange={v => setForm(f => ({ ...f, category: v }))}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
          />
        </div>
        <div className="fs-field">
          <label className="fs-field-label">Monthly amount (₹)</label>
          <input
            type="number"
            className="fs-input"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            placeholder="999"
            min="1"
            required
          />
        </div>
        {error && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--fs-danger)', marginBottom: 14, padding: '10px 12px', background: 'var(--fs-danger-soft)', borderRadius: 'var(--fs-radius-sm)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" className="fs-btn fs-btn-secondary" style={{ flex: 1 }} onClick={handleClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="fs-btn fs-btn-primary" style={{ flex: 1 }} disabled={saving}>
            {saving ? 'Adding…' : 'Add recurring'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
