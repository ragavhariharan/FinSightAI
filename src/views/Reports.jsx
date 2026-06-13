import { useMemo } from 'react';
import { buildDonut } from '../context';
import { HoverEl } from '../utils';

export default function Reports() {
  const segments = useMemo(() => buildDonut(), []);

  return (
    <>
      {/* Tab bar */}
      <div style={{ display:'flex', gap:2, marginBottom:24, borderBottom:'1px solid #E8E8E2' }}>
        <button style={{ padding:'10px 18px', background:'none', border:'none', borderBottom:'2px solid #E8570A', marginBottom:-1, fontSize:14, fontWeight:600, color:'#E8570A', cursor:'pointer', fontFamily:'inherit' }}>Spending</button>
<HoverEl as="button" style={{ padding:'10px 18px', background:'none', border:'none', fontSize:14, fontWeight:500, color:'#6E6E73', cursor:'pointer', fontFamily:'inherit' }} hoverStyle={{ color:'#1A1A1A' }}>Income</HoverEl>
        <div style={{ flex:1 }} />
        <HoverEl as="button" style={{ padding:'7px 14px', background:'white', border:'1.5px solid #E8E8E2', borderRadius:8, fontSize:13, fontWeight:500, color:'#4B4B4F', cursor:'pointer', alignSelf:'center', fontFamily:'inherit' }} hoverStyle={{ background:'#F5F5F3' }}>This month</HoverEl>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          { value:'₹65,000', label:'TOTAL INCOME', color:'#1A8A4A' },
          { value:'₹46,336', label:'TOTAL EXPENSES', color:'#D63B2F' },
          { value:'₹18,664', label:'NET SAVINGS', color:'#1A1A1A' },
          { value:'28.7%', label:'SAVINGS RATE', color:'#1A1A1A' },
        ].map(({ value, label, color }) => (
          <div key={label} style={{ background:'white', borderRadius:12, padding:16, border:'1px solid #E8E8E2', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:700, color, letterSpacing:'-0.5px', marginBottom:4 }}>{value}</div>
            <div style={{ fontSize:11, fontWeight:600, color:'#9B9B9F', letterSpacing:'0.5px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Donut chart */}
      <div style={{ background:'white', borderRadius:14, padding:28, border:'1px solid #E8E8E2', marginBottom:18, display:'flex', gap:36, alignItems:'center' }}>
        <div style={{ flexShrink:0, position:'relative', width:200, height:200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ position:'absolute', top:0, left:0 }}>
            {segments.map((seg, i) => (
              <path key={i} d={seg.d} fill={seg.color} />
            ))}
          </svg>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
            <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', whiteSpace:'nowrap' }}>₹47,587</div>
            <div style={{ fontSize:12, color:'#9B9B9F', marginTop:1 }}>Total</div>
          </div>
        </div>
        <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 28px' }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:seg.color, flexShrink:0, marginTop:2 }} />
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{seg.name}</div>
                <div style={{ fontSize:12, color:'#9B9B9F' }}>{seg.totalStr} ({seg.pct}%)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
