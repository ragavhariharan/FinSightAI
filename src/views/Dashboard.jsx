import { useMemo } from 'react';
import { buildForecast, buildGauge } from '../context';
import { HoverEl } from '../utils';

export default function Dashboard() {
  const forecast = useMemo(() => buildForecast(), []);
  const gauge = useMemo(() => buildGauge(), []);

  return (
    <>
      {/* Greeting */}
      <div style={{ marginBottom:22 }}>
        <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.4px', marginBottom:3 }}>Good morning, Arjun</h2>
        <p style={{ fontSize:14, color:'#6E6E73' }}>June 13, 2025 · Here is your financial snapshot</p>
      </div>

      {/* Briefing */}
      <div style={{ background:'white', borderRadius:14, padding:'18px 22px', marginBottom:18, border:'1px solid #E8E8E2', borderLeft:'4px solid #E8570A', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L8 5.2H12.7L9.1 7.5L10.5 11.8L6.5 9.4L2.5 11.8L3.9 7.5L.3 5.2H5Z" fill="#E8570A" /></svg>
            <span style={{ fontSize:11, fontWeight:700, color:'#E8570A', letterSpacing:'0.8px' }}>JUNE BRIEFING</span>
          </div>
          <p style={{ fontSize:15, color:'#1A1A1A', lineHeight:1.65 }}>
            You are on track to save <strong>₹18,664</strong> this month — 28.7% of take-home. Housing is your biggest spend at 52%. I spotted <span style={{ color:'#E8570A', fontWeight:600 }}>2 spending leaks</span> worth reviewing.
          </p>
        </div>
        <HoverEl
          as="button"
          style={{ background:'white', border:'1.5px solid #E8E8E2', padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', flexShrink:0 }}
          hoverStyle={{ background:'#F5F5F3' }}
        >View analysis</HoverEl>
      </div>

      {/* 3 stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:18 }}>
        {/* Financial Health */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px', marginBottom:14 }}>FINANCIAL HEALTH</div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <svg width="76" height="76" viewBox="0 0 120 120" style={{ flexShrink:0 }}>
              <circle cx="60" cy="60" r="46" fill="none" stroke="#F0F0EC" strokeWidth="9" />
              <circle cx="60" cy="60" r="46" fill="none" stroke={gauge.color} strokeWidth="9"
                strokeDasharray={gauge.circumference} strokeDashoffset={gauge.dashOffset}
                strokeLinecap="round" transform={gauge.transform} />
              <text x="60" y="55" textAnchor="middle" fill="#1A1A1A" fontSize="22" fontWeight="700">{gauge.score}</text>
              <text x="60" y="71" textAnchor="middle" fill="#9B9B9F" fontSize="10">/ 100</text>
            </svg>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#1A8A4A', marginBottom:5 }}>Good standing</div>
              <div style={{ fontSize:12, color:'#9B9B9F', lineHeight:1.55 }}>Low debt · Stable income · Build emergency fund</div>
            </div>
          </div>
        </div>

        {/* Monthly Spend */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px', marginBottom:12 }}>MONTHLY SPEND</div>
          <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.8px', marginBottom:6 }}>₹46,336</div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 9L6.5 4.5L11 9" stroke="#D63B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize:13, color:'#D63B2F', fontWeight:500 }}>+8.2% vs last month</span>
          </div>
          <div style={{ fontSize:12, color:'#9B9B9F', marginBottom:6 }}>Budget: ₹52,000 · 89% used</div>
          <div style={{ height:4, background:'#F0F0EC', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:'89%', background:'linear-gradient(90deg,#0EA5E9,#E8570A)', borderRadius:2 }} />
          </div>
        </div>

        {/* Savings Rate */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px', marginBottom:12 }}>SAVINGS RATE</div>
          <div style={{ fontSize:28, fontWeight:700, color:'#1A8A4A', letterSpacing:'-0.8px', marginBottom:6 }}>28.7%</div>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4L6.5 8.5L11 4" stroke="#1A8A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize:13, color:'#1A8A4A', fontWeight:500 }}>+2.1% vs last month</span>
          </div>
          <div style={{ fontSize:12, color:'#9B9B9F' }}>₹18,664 saved so far</div>
        </div>
      </div>

      {/* Spending DNA + Forecast */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.7fr', gap:16, marginBottom:18 }}>
        {/* Spending DNA */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px', marginBottom:18 }}>SPENDING DNA</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Routine', pct:55, color:'#0EA5E9', sub:'EMI, utilities, groceries' },
              { label:'Flexible', pct:30, color:'#1A8A4A', sub:'Food delivery, transport, health' },
              { label:'Impulse', pct:15, color:'#E8570A', sub:'Shopping, leisure, dining out' },
            ].map(({ label, pct, color, sub }) => (
              <div key={label}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:500 }}>{label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color }}>{pct}%</span>
                </div>
                <div style={{ height:7, background:'#F0F0EC', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:pct + '%', background:color, borderRadius:4 }} />
                </div>
                <div style={{ fontSize:11, color:'#9B9B9F', marginTop:4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Forecast */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px' }}>SAVINGS FORECAST</div>
            <span style={{ fontSize:12, color:'#6E6E73' }}>June 2025</span>
          </div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px', marginBottom:16 }}>
            ₹18,664 <span style={{ fontSize:13, fontWeight:500, color:'#1A8A4A' }}>projected</span>
          </div>
          <svg viewBox="0 0 560 110" style={{ width:'100%', height:110 }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="fgr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={forecast.area} fill="url(#fgr)" />
            <path d={forecast.line} fill="none" stroke="#0EA5E9" strokeWidth="2.2" />
          </svg>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ fontSize:11, color:'#9B9B9F' }}>Jun 1</span>
            <span style={{ fontSize:11, color:'#9B9B9F' }}>Today · Jun 13</span>
            <span style={{ fontSize:11, color:'#9B9B9F' }}>Jun 30</span>
          </div>
        </div>
      </div>

      {/* Leak Detector */}
      <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px' }}>LEAK DETECTOR</div>
          <span style={{ background:'#FFF2EC', color:'#E8570A', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>2 found</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#FFFAF7', borderRadius:10, border:'1px solid #FAD4C2' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:20 }}>🍕</span>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>Food delivery up 40%</div>
                <div style={{ fontSize:12, color:'#9B9B9F' }}>Swiggy + Zomato · ₹1,110 this month vs ₹790 avg</div>
              </div>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:'#E8570A' }}>+₹320</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#FFFAF7', borderRadius:10, border:'1px solid #FAD4C2' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:20 }}>🛍</span>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>Shopping spike</div>
                <div style={{ fontSize:12, color:'#9B9B9F' }}>Amazon + Myntra · ₹5,698 this month vs ₹2,100 avg</div>
              </div>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:'#E8570A' }}>+₹3,598</span>
          </div>
        </div>
      </div>
    </>
  );
}
