import { useApp } from '../context';
import { HoverEl } from '../utils';

export default function Budget() {
  const { state } = useApp();
  const { budgets } = state;

  const items = budgets.map(b => {
    const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
    const remain = b.limit - b.spent;
    const barColor = pct >= 90 ? '#EF4444' : pct >= 75 ? '#F59E0B' : b.color;
    return {
      ...b, pct,
      spentStr: '₹' + b.spent.toLocaleString('en-IN'),
      limitStr: '₹' + b.limit.toLocaleString('en-IN'),
      remainStr: remain >= 0 ? '₹' + remain.toLocaleString('en-IN') : '₹0',
      barColor,
      remainNegative: remain < 0,
    };
  });

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px', marginBottom:3 }}>June 2025 Budget</h2>
          <p style={{ fontSize:14, color:'#6E6E73' }}>₹{totalSpent.toLocaleString('en-IN')} spent of ₹{totalLimit.toLocaleString('en-IN')} budgeted</p>
        </div>
        <HoverEl
          as="button"
          style={{ background:'#E8570A', color:'white', border:'none', padding:'9px 18px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}
          hoverStyle={{ background:'#C94A06' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Add budget
        </HoverEl>
      </div>

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
              <div style={{ height:'100%', width:item.pct + '%', background:item.barColor, borderRadius:4, transition:'width 0.6s ease' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
              <span style={{ fontSize:12, color:'#9B9B9F' }}>{item.pct}% used</span>
              <span style={{ fontSize:12, color:item.remainNegative ? '#D63B2F' : '#9B9B9F' }}>{item.remainStr} left</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
