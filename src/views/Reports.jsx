import { useMemo } from 'react';
import { useApp, buildDonut } from '../context';
import { HoverEl } from '../utils';

function buildDonutFromSegments(segments) {
  if (!segments?.length) return buildDonut();
  const total = segments.reduce((s, c) => s + Number(c.amount || 0), 0);
  if (total === 0) return buildDonut();
  const cx = 100, cy = 100, R = 78, r = 50;
  let a = -Math.PI / 2;
  return segments.map(c => {
    const amt = Number(c.amount || 0);
    const da = (amt / total) * 2 * Math.PI;
    const ea = a + da;
    const g = 0.022;
    const sa = a + g, fa = ea - g;
    const large = (fa - sa) > Math.PI ? 1 : 0;
    const x1 = (cx + R * Math.cos(sa)).toFixed(1), y1 = (cy + R * Math.sin(sa)).toFixed(1);
    const x2 = (cx + R * Math.cos(fa)).toFixed(1), y2 = (cy + R * Math.sin(fa)).toFixed(1);
    const x3 = (cx + r * Math.cos(fa)).toFixed(1), y3 = (cy + r * Math.sin(fa)).toFixed(1);
    const x4 = (cx + r * Math.cos(sa)).toFixed(1), y4 = (cy + r * Math.sin(sa)).toFixed(1);
    const d = `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
    a = ea;
    return {
      ...c,
      name: c.name,
      d,
      pct: c.pct !== undefined ? Number(c.pct).toFixed(1) : ((amt / total) * 100).toFixed(1),
      totalStr: '₹' + amt.toLocaleString('en-IN'),
    };
  });
}

export default function Reports() {
  const { state } = useApp();
  const { snapshot } = state;

  const snap = snapshot;
  const income   = snap ? Number(snap.monthly_income || 0) : 65000;
  const expenses = snap ? Number(snap.monthly_spend  || 0) : 46336;
  const savings  = snap ? Number(snap.net_savings    || 0) : 18664;
  const rate     = snap ? Number(snap.savings_rate_pct || 0) : 28.7;

  const rawSegments = snap?.donut_segments ?? null;
  const segments = useMemo(() => buildDonutFromSegments(rawSegments), [rawSegments]);

  const totalSpend = segments.reduce((s, seg) => s + Number(seg.amount || 0), 0);

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
          { value: '₹' + income.toLocaleString('en-IN'),   label:'TOTAL INCOME',   color:'#1A8A4A' },
          { value: '₹' + expenses.toLocaleString('en-IN'), label:'TOTAL EXPENSES',  color:'#D63B2F' },
          { value: '₹' + savings.toLocaleString('en-IN'),  label:'NET SAVINGS',     color:'#1A1A1A' },
          { value: rate + '%',                              label:'SAVINGS RATE',    color:'#1A1A1A' },
        ].map(({ value, label, color }) => (
          <div key={label} style={{ background:'white', borderRadius:12, padding:16, border:'1px solid #E8E8E2', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:700, color, letterSpacing:'-0.5px', marginBottom:4 }}>{value}</div>
            <div style={{ fontSize:11, fontWeight:600, color:'#9B9B9F', letterSpacing:'0.5px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Donut chart */}
      {segments.length === 0 ? (
        <div style={{ background:'white', borderRadius:14, padding:40, textAlign:'center', border:'1px solid #E8E8E2', color:'#9B9B9F', fontSize:14 }}>
          No spending data for this month yet
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:14, padding:28, border:'1px solid #E8E8E2', marginBottom:18, display:'flex', gap:36, alignItems:'center' }}>
          <div style={{ flexShrink:0, position:'relative', width:200, height:200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ position:'absolute', top:0, left:0 }}>
              {segments.map((seg, i) => (
                <path key={i} d={seg.d} fill={seg.color} />
              ))}
            </svg>
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
              <div style={{ fontSize:16, fontWeight:700, color:'#1A1A1A', whiteSpace:'nowrap' }}>₹{totalSpend.toLocaleString('en-IN')}</div>
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
      )}
    </>
  );
}
