import { useState } from 'react';
import { useApp } from '../context';
import Modal from './ui/Modal';
import Select from './ui/Select';
import CategoryIcon from './ui/CategoryIcon';
import { insertBudget } from '../lib/api/budgets';
import { categoryMeta } from '../lib/categories';

const CATEGORIES = ['Food & Dining', 'Groceries', 'Transport', 'Shopping', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Other'];

export default function AddBudgetModal({ open, onClose, onSaved }) {
  const { up } = useApp();
  const [form, setForm] = useState({ category: 'Food & Dining', limit: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const limit = parseFloat(form.limit);
    if (!limit) return;
    setSaving(true);
    try {
      const meta = categoryMeta(form.category);
      await insertBudget({ category: form.category, limit_amount: limit, color: meta.color, icon: meta.icon });
      await onSaved();
      onClose();
      setForm({ category: 'Food & Dining', limit: '' });
    } catch (err) {
      up({ authError: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add budget category" subtitle="Set a monthly limit to track against">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <CategoryIcon category={form.category} size={28} />
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
          <label className="fs-field-label">Monthly limit (₹)</label>
          <input type="number" className="fs-input" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} placeholder="10000" required />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button type="button" className="fs-btn fs-btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button type="submit" className="fs-btn fs-btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving…' : 'Add budget'}</button>
        </div>
      </form>
    </Modal>
  );
}
