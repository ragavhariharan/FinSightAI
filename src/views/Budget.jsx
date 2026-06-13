import { useState } from 'react';
import { useApp } from '../context';
import { HoverEl } from '../utils';

const BUDGET_CATEGORIES = [
  { category:'Housing',              icon:'🏠', color:'#0EA5E9' },
  { category:'Food & Dining',        icon:'🍔', color:'#F59E0B' },
  { category:'Groceries',            icon:'🛒', color:'#F59E0B' },
  { category:'Shopping',             icon:'🛍', color:'#EC4899' },
  { category:'Utilities & Insurance',icon:'⚡', color:'#6366F1' },
  { category:'Transport',            icon:'🚗', color:'#8B5CF6' },
  { category:'Health & Fitness',     icon:'💪', color:'#EF4444' },
  { category:'Entertainment',        icon:'🎬', color:'#EC4899' },
  { category:'Business Costs',       icon:'🏢', color:'#6366F1' },
  { category:'Other',                icon:'📌', color:'#6B7280' },
];

const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

const inputStyle = {
  width:'100%', padding:'9px 12px', border:'1.5px solid #E8E8E2',
  borderRadius:8, fontSize:13, fontFamily:'inherit', background:'white',
  boxSizing:'border-box', outline:'none',
};
const labelStyle = { fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:5, display:'block' };

export default function Budget() {
  const { state, addBudget } = useApp();
  const { budgets, isDemoMode } = state;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category:'Food & Dining', icon:'🍔', color:'#F59E0B', limit_amount:'' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  function setField(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'category') {
        const preset = BUDGET_CATEGORIES.find(c => c.category === v);
        if (preset) { next.icon = preset.icon; next.color = preset.color; }
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const limit = parseFloat(form.limit_amount);
    if (isNaN(limit) || limit <= 0) return;
    setSaving(true);
    setSaveError('');
    try {
      await addBudget({
        category: form.category,
        icon: form.icon,
        color: form.color,
        limit_amount: limit,
        month: currentMonth,
      });
      setShowModal(false);
      setForm({ category:'Food & Dining', icon:'🍔', color:'#F59E0B', limit_amount:'' });
    } catch (err) {
      setSaveError(err.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  }

  const items = (budgets || []).map(b => {
    const limit = Number(b.limit_amount || b.limit || 0);
    const spent = Number(b.spent || 0);
    const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    const remain = limit - spent;
    const barColor = pct >= 90 ? '#EF4444' : pct >= 75 ? '#F59E0B' : (b.color || '#0EA5E9');
    return {
      ...b,
      cat: b.category || b.cat,
      limit, spent, pct, barColor,
      spentStr:  '₹' + spent.toLocaleString('en-IN'),
      limitStr:  '₹' + limit.toLocaleString('en-IN'),
      remainStr: remain >= 0 ? '₹' + remain.toLocaleString('en-IN') : '₹0',
      remainNegative: remain < 0,
    };
  });

  const totalSpent = items.reduce((s, b) => s + b.spent, 0);
  const totalLimit = items.reduce((s, b) => s + b.limit, 0);

  const now = new Date();
  const monthLabel = now.toLocaleDateString('en-US', { month:'long', year:'numeric' });

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px', marginBottom:3 }}>{monthLabel} Budget</h2>
          <p style={{ fontSize:14, color:'#6E6E73' }}>₹{totalSpent.toLocaleString('en-IN')} spent of ₹{totalLimit.toLocaleString('en-IN')} budgeted</p>
        </div>
        {!isDemoMode && (
          <HoverEl as="button" onClick={() => setShowModal(true)} style={{ background:'#E8570A', color:'white', border:'none', padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }} hoverStyle={{ background:'#C94A06' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
            Add budget
          </HoverEl>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ background:'white', borderRadius:14, padding:40, textAlign:'center', border:'1px solid #E8E8E2', color:'#9B9B9F', fontSize:14 }}>
          No budgets set yet.{!isDemoMode && ' Click "Add budget" to get started.'}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {items.map(item => (
            <div key={item.cat} style={{ background:'white', borderRadius:14, padding:'18px 20px', border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:20 }}>{item.icon}</span>
                  <span style={{ fontSize:15, fontWeight:600 }}>{item.cat}</span>
                </div>
                <div>
                  <span style={{ fontSize:14, fontWeight:700 }}>{item.spentStr}</span>
                  <span style={{ fontSize:13, color:'#9B9B9F' }}> / {item.limitStr}</span>
                </div>
              </div>
              <div style={{ height:7, background:'#F0F0EC', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width: item.pct + '%', background:item.barColor, borderRadius:4, transition:'width 0.6s ease' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
                <span style={{ fontSize:12, color:'#9B9B9F' }}>{item.pct}% used</span>
                <span style={{ fontSize:12, color: item.remainNegative ? '#D63B2F' : '#9B9B9F' }}>{item.remainStr} left</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Budget Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background:'white', borderRadius:18, padding:28, width:'100%', maxWidth:380, boxShadow:'0 8px 40px rgba(0,0,0,0.16)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h3 style={{ fontSize:17, fontWeight:700, margin:0 }}>Add Budget</h3>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9B9B9F', fontSize:20, lineHeight:1, padding:4 }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, appearance:'none' }} value={form.category} onChange={e => setField('category', e.target.value)}>
                  {BUDGET_CATEGORIES.map(c => <option key={c.category}>{c.category}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Monthly Limit (₹)</label>
                <input style={inputStyle} type="number" placeholder="e.g. 8000" min="1" step="1" value={form.limit_amount} onChange={e => setField('limit_amount', e.target.value)} required />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Icon</label>
                  <input style={inputStyle} placeholder="🍔" value={form.icon} onChange={e => setField('icon', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Color</label>
                  <input style={{ ...inputStyle, padding:'6px 12px', height:38 }} type="color" value={form.color} onChange={e => setField('color', e.target.value)} />
                </div>
              </div>

              {saveError && <div style={{ fontSize:13, color:'#D63B2F' }}>{saveError}</div>}

              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:'10px 0', border:'1.5px solid #E8E8E2', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'white' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex:1, padding:'10px 0', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit', background: saving ? '#C94A06' : '#E8570A', color:'white', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Add Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
