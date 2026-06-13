import { useState } from 'react';
import { useApp, getTxGroups } from '../context';
import { HoverEl } from '../utils';

const CATEGORIES = [
  'Paychecks','Housing','Food & Dining','Groceries','Shopping',
  'Transport','Utilities','Insurance','Health','Fitness',
  'Entertainment','Business Revenue','Business Costs','Other',
];

const CATEGORY_EMOJI = {
  'Paychecks':'💼','Housing':'🏠','Food & Dining':'🍔','Groceries':'🛒',
  'Shopping':'🛍','Transport':'🚗','Utilities':'⚡','Insurance':'🛡',
  'Health':'💊','Fitness':'💪','Entertainment':'🎬',
  'Business Revenue':'💼','Business Costs':'🏢','Other':'📌',
};

const today = new Date().toISOString().slice(0, 10);

const inputStyle = {
  width:'100%', padding:'9px 12px', border:'1.5px solid #E8E8E2',
  borderRadius:8, fontSize:13, fontFamily:'inherit', background:'white',
  boxSizing:'border-box', outline:'none',
};
const labelStyle = { fontSize:12, fontWeight:600, color:'#6E6E73', marginBottom:5, display:'block' };

export default function Transactions() {
  const { state, up, addTransaction } = useApp();
  const { txSearch, transactions, isDemoMode } = state;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name:'', amount:'', category:'Food & Dining', txn_date:today, account:'Main', emoji:'🍔', isIncome:false,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const groups = getTxGroups(transactions, txSearch);

  const txns = transactions || [];
  const income   = txns.filter(t => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
  const spending = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const largest  = txns.filter(t => t.amount < 0).reduce((max, t) => Math.max(max, Math.abs(Number(t.amount))), 0);

  function setField(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'category') next.emoji = CATEGORY_EMOJI[v] || '📌';
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.amount) return;
    setSaving(true);
    setSaveError('');
    try {
      const amt = parseFloat(form.amount);
      if (isNaN(amt)) throw new Error('Invalid amount');
      const finalAmt = form.isIncome ? Math.abs(amt) : -Math.abs(amt);
      await addTransaction({
        name: form.name.trim(),
        amount: finalAmt,
        category: form.category,
        txn_date: form.txn_date,
        account: form.account || 'Main',
        emoji: form.emoji,
      });
      setShowModal(false);
      setForm({ name:'', amount:'', category:'Food & Dining', txn_date:today, account:'Main', emoji:'🍔', isIncome:false });
    } catch (err) {
      setSaveError(err.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[
          { label:'TRANSACTIONS',   value: String(txns.length),                            color:'#1A1A1A' },
          { label:'TOTAL INCOME',   value: '+₹' + income.toLocaleString('en-IN'),          color:'#1A8A4A' },
          { label:'TOTAL SPENDING', value: '₹'  + spending.toLocaleString('en-IN'),        color:'#1A1A1A' },
          { label:'LARGEST EXPENSE',value: '₹'  + largest.toLocaleString('en-IN'),         color:'#1A1A1A' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:'white', borderRadius:12, padding:'14px 16px', border:'1px solid #E8E8E2' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.5px', marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search, filters, add */}
      <div style={{ background:'white', borderRadius:12, padding:'10px 14px', marginBottom:14, border:'1px solid #E8E8E2', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, background:'#F5F5F3', borderRadius:8, padding:'7px 11px', flex:1 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#9B9B9F" strokeWidth="1.3" /><path d="M9.5 9.5L12 12" stroke="#9B9B9F" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <input
            value={txSearch}
            onChange={e => up({ txSearch: e.target.value })}
            placeholder="Search transactions..."
            style={{ background:'none', border:'none', fontSize:13, color:'#1A1A1A', width:'100%', fontFamily:'inherit', outline:'none' }}
          />
        </div>
        <HoverEl as="button" style={{ background:'white', border:'1.5px solid #E8E8E2', color:'#4B4B4F', padding:'7px 13px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }} hoverStyle={{ background:'#F5F5F3' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 2.5h10M3 6h6M5 9.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          Filters
        </HoverEl>
        {!isDemoMode && (
          <HoverEl as="button" onClick={() => setShowModal(true)} style={{ background:'#E8570A', color:'white', border:'none', padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5, flexShrink:0 }} hoverStyle={{ background:'#C94A06' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
            Add
          </HoverEl>
        )}
      </div>

      {/* Transaction list */}
      <div style={{ background:'white', borderRadius:14, border:'1px solid #E8E8E2', overflow:'hidden' }}>
        {groups.length === 0 ? (
          <div style={{ padding:32, textAlign:'center', color:'#9B9B9F', fontSize:14 }}>No transactions found</div>
        ) : groups.map(group => (
          <div key={group.date}>
            <div style={{ padding:'9px 16px', background:'#FAFAF8', borderBottom:'1px solid #EEEEEA', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#6E6E73', letterSpacing:'0.2px' }}>{group.date}</span>
              <span style={{ fontSize:12, fontWeight:600, color:'#6E6E73' }}>{group.totalStr}</span>
            </div>
            {group.items.map((tx, idx) => (
              <HoverEl key={tx.id} style={{ display:'flex', alignItems:'center', padding:'13px 16px', borderBottom: idx < group.items.length - 1 ? '1px solid #F5F5F2' : 'none', gap:12 }} hoverStyle={{ background:'#FAFAF8' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#F5F5F3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{tx.emoji}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{tx.name}</div>
                  <div style={{ fontSize:12, color:'#9B9B9F' }}>{tx.category}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:600, flexShrink:0, color:tx.amountColor }}>{tx.amountStr}</div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink:0 }}><path d="M5.5 3.5L9.5 7L5.5 10.5" stroke="#C8C8C0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </HoverEl>
            ))}
          </div>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background:'white', borderRadius:18, padding:28, width:'100%', maxWidth:420, boxShadow:'0 8px 40px rgba(0,0,0,0.16)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h3 style={{ fontSize:17, fontWeight:700, margin:0 }}>Add Transaction</h3>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9B9B9F', fontSize:20, lineHeight:1, padding:4 }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Income / Expense toggle */}
              <div style={{ display:'flex', background:'#F5F5F3', borderRadius:8, padding:3, gap:3 }}>
                {[{ label:'Expense', val:false }, { label:'Income', val:true }].map(({ label, val }) => (
                  <button key={label} type="button" onClick={() => setField('isIncome', val)}
                    style={{ flex:1, padding:'7px 0', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background: form.isIncome === val ? 'white' : 'transparent', color: form.isIncome === val ? '#1A1A1A' : '#9B9B9F', boxShadow: form.isIncome === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                    {label}
                  </button>
                ))}
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <input style={inputStyle} placeholder="e.g. Swiggy order" value={form.name} onChange={e => setField('name', e.target.value)} required />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Amount (₹)</label>
                  <input style={inputStyle} type="number" placeholder="0" min="0" step="0.01" value={form.amount} onChange={e => setField('amount', e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input style={inputStyle} type="date" value={form.txn_date} onChange={e => setField('txn_date', e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, appearance:'none' }} value={form.category} onChange={e => setField('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Account</label>
                  <input style={inputStyle} placeholder="Main" value={form.account} onChange={e => setField('account', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Emoji</label>
                  <input style={inputStyle} placeholder="🍔" value={form.emoji} onChange={e => setField('emoji', e.target.value)} />
                </div>
              </div>

              {saveError && <div style={{ fontSize:13, color:'#D63B2F' }}>{saveError}</div>}

              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:'10px 0', border:'1.5px solid #E8E8E2', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'white' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ flex:1, padding:'10px 0', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit', background: saving ? '#C94A06' : '#E8570A', color:'white', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
