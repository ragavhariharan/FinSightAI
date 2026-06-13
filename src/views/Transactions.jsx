import { useApp, getTxGroups } from '../context';
import { HoverEl } from '../utils';

export default function Transactions() {
  const { state, up } = useApp();
  const { txSearch } = state;
  const groups = getTxGroups(txSearch);

  return (
    <>
      {/* Summary strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
        {[
          { label:'TRANSACTIONS', value:'18', color:'#1A1A1A' },
          { label:'TOTAL INCOME', value:'+₹65,000', color:'#1A8A4A' },
          { label:'TOTAL SPENDING', value:'₹46,336', color:'#1A1A1A' },
          { label:'LARGEST EXPENSE', value:'₹22,000', color:'#1A1A1A' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:'white', borderRadius:12, padding:'14px 16px', border:'1px solid #E8E8E2' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.5px', marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div style={{ background:'white', borderRadius:12, padding:'10px 14px', marginBottom:14, border:'1px solid #E8E8E2', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, background:'#F5F5F3', borderRadius:8, padding:'7px 11px', flex:1 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#9B9B9F" strokeWidth="1.3" /><path d="M9.5 9.5L12 12" stroke="#9B9B9F" strokeWidth="1.3" strokeLinecap="round" /></svg>
          <input
            value={txSearch}
            onChange={e => up({ txSearch:e.target.value })}
            placeholder="Search transactions..."
            style={{ background:'none', border:'none', fontSize:13, color:'#1A1A1A', width:'100%', fontFamily:'inherit' }}
          />
        </div>
        <HoverEl
          as="button"
          style={{ background:'white', border:'1.5px solid #E8E8E2', color:'#4B4B4F', padding:'7px 13px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}
          hoverStyle={{ background:'#F5F5F3' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 2.5h10M3 6h6M5 9.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          Filters
        </HoverEl>
        <HoverEl
          as="button"
          style={{ background:'white', border:'1.5px solid #E8E8E2', color:'#4B4B4F', padding:'7px 13px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}
          hoverStyle={{ background:'#F5F5F3' }}
        >Sort</HoverEl>
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
              <HoverEl
                key={tx.id}
                style={{
                  display:'flex', alignItems:'center', padding:'13px 16px',
                  borderBottom: idx < group.items.length - 1 ? '1px solid #F5F5F2' : 'none',
                  gap:12,
                }}
                hoverStyle={{ background:'#FAFAF8' }}
              >
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
    </>
  );
}
