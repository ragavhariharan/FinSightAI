import { useMemo } from 'react';
import { useApp, buildForecast } from '../context';
import { HoverEl } from '../utils';

function buildForecastPaths(points) {
  if (!points?.length) return buildForecast();
  const w = 560, h = 110, pad = 6;
  const nums = points.map(d => Number(d) || 0);
  const max = Math.max(...nums) + 1000;
  const pts = nums.map((d, i) => ({
    x: (i / (nums.length - 1)) * w,
    y: h - pad - (d / max) * (h - pad * 2),
  }));
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(0) + ' ' + p.y.toFixed(0)).join(' ');
  const area = line + ' L ' + w + ' ' + h + ' L 0 ' + h + ' Z';
  return { line, area };
}

function buildGaugeFromScore(score) {
  const cx = 60, cy = 60, r = 46;
  const circ = 2 * Math.PI * r;
  const s = Number(score) || 0;
  const offset = circ * (1 - s / 100);
  const color = s >= 70 ? '#1A8A4A' : s >= 50 ? '#F59E0B' : '#D63B2F';
  return { score: s, color, circumference: circ.toFixed(1), dashOffset: offset.toFixed(1), transform: `rotate(-90 ${cx} ${cy})` };
}

const fmt = n => '₹' + Math.abs(Number(n) || 0).toLocaleString('en-IN');

export default function Dashboard() {
  const { state } = useApp();
  const { snapshot, fullName } = state;
  const snap = snapshot;

  const income         = snap ? snap.monthly_income       : 65000;
  const spend          = snap ? snap.monthly_spend        : 46336;
  const savings        = snap ? snap.net_savings          : 18664;
  const savingsRate    = snap ? snap.savings_rate_pct     : 28.7;
  const healthScore    = snap ? snap.health_score         : 72;
  const healthLabel    = snap ? snap.health_label         : 'Good standing';
  const healthNotes    = snap ? snap.health_notes         : 'Low debt · Stable income · Build emergency fund';
  const briefingText   = snap ? snap.briefing             : 'You are on track to save ₹18,664 this month — 28.7% of take-home. Housing is your biggest spend at 52%.';
  const budgetLimit    = snap ? snap.total_budget_limit   : 52000;
  const budgetUsedPct  = snap ? snap.budget_used_pct      : 89;
  const spendVsLast    = snap ? snap.spend_vs_last_month_pct    : 0;
  const savingsVsLast  = snap ? snap.savings_vs_last_month_pct  : 0;
  const dna            = snap?.spending_dna ?? {
    routine:  { pct: 55, sub: 'EMI, utilities, groceries' },
    flexible: { pct: 30, sub: 'Food delivery, transport, health' },
    impulse:  { pct: 15, sub: 'Shopping, leisure, dining out' },
  };
  const forecastPoints = snap?.forecast?.points ?? null;
  const leaks          = snap?.leaks ?? [];

  const forecast = useMemo(() => buildForecastPaths(forecastPoints), [forecastPoints]);
  const gauge    = useMemo(() => buildGaugeFromScore(healthScore), [healthScore]);

  const firstName = fullName ? fullName.split(' ')[0] : 'there';
  const now = new Date();
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });
  const dateStr   = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <>
      {/* Greeting */}
      <div style={{ marginBottom:22 }}>
        <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.4px', marginBottom:3 }}>Good morning, {firstName}</h2>
        <p style={{ fontSize:14, color:'#6E6E73' }}>{dateStr} · Here is your financial snapshot</p>
      </div>

      {/* Briefing */}
      <div style={{ background:'white', borderRadius:14, padding:'18px 22px', marginBottom:18, border:'1px solid #E8E8E2', borderLeft:'4px solid #E8570A', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L8 5.2H12.7L9.1 7.5L10.5 11.8L6.5 9.4L2.5 11.8L3.9 7.5L.3 5.2H5Z" fill="#E8570A" /></svg>
            <span style={{ fontSize:11, fontWeight:700, color:'#E8570A', letterSpacing:'0.8px' }}>{monthName.toUpperCase()} BRIEFING</span>
          </div>
          <p style={{ fontSize:15, color:'#1A1A1A', lineHeight:1.65 }}>{briefingText}</p>
        </div>
        <HoverEl as="button" style={{ background:'white', border:'1.5px solid #E8E8E2', padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', flexShrink:0 }} hoverStyle={{ background:'#F5F5F3' }}>
          View analysis
        </HoverEl>
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
              <div style={{ fontSize:13, fontWeight:600, color:gauge.color, marginBottom:5 }}>{healthLabel}</div>
              <div style={{ fontSize:12, color:'#9B9B9F', lineHeight:1.55 }}>{healthNotes}</div>
            </div>
          </div>
        </div>

        {/* Monthly Spend */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px', marginBottom:12 }}>MONTHLY SPEND</div>
          <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.8px', marginBottom:6 }}>{fmt(spend)}</div>
          {spendVsLast !== 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                {spendVsLast > 0
                  ? <path d="M2 9L6.5 4.5L11 9" stroke="#D63B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M2 4L6.5 8.5L11 4" stroke="#1A8A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                }
              </svg>
              <span style={{ fontSize:13, color: spendVsLast > 0 ? '#D63B2F' : '#1A8A4A', fontWeight:500 }}>
                {spendVsLast > 0 ? '+' : ''}{spendVsLast}% vs last month
              </span>
            </div>
          )}
          {budgetLimit > 0 && (
            <>
              <div style={{ fontSize:12, color:'#9B9B9F', marginBottom:6 }}>Budget: {fmt(budgetLimit)} · {budgetUsedPct}% used</div>
              <div style={{ height:4, background:'#F0F0EC', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width: Math.min(100, Number(budgetUsedPct) || 0) + '%', background:'linear-gradient(90deg,#0EA5E9,#E8570A)', borderRadius:2 }} />
              </div>
            </>
          )}
        </div>

        {/* Savings Rate */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px', marginBottom:12 }}>SAVINGS RATE</div>
          <div style={{ fontSize:28, fontWeight:700, color:'#1A8A4A', letterSpacing:'-0.8px', marginBottom:6 }}>{savingsRate}%</div>
          {savingsVsLast !== 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:12 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                {savingsVsLast > 0
                  ? <path d="M2 4L6.5 8.5L11 4" stroke="#1A8A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  : <path d="M2 9L6.5 4.5L11 9" stroke="#D63B2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                }
              </svg>
              <span style={{ fontSize:13, color: savingsVsLast > 0 ? '#1A8A4A' : '#D63B2F', fontWeight:500 }}>
                {savingsVsLast > 0 ? '+' : ''}{savingsVsLast}% vs last month
              </span>
            </div>
          )}
          <div style={{ fontSize:12, color:'#9B9B9F' }}>{fmt(savings)} saved so far</div>
        </div>
      </div>

      {/* Spending DNA + Forecast */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.7fr', gap:16, marginBottom:18 }}>
        {/* Spending DNA */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px', marginBottom:18 }}>SPENDING DNA</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Routine',  key:'routine',  color:'#0EA5E9' },
              { label:'Flexible', key:'flexible', color:'#1A8A4A' },
              { label:'Impulse',  key:'impulse',  color:'#E8570A' },
            ].map(({ label, key, color }) => {
              const d = dna[key] || { pct:0, sub:'' };
              return (
                <div key={key}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:500 }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color }}>{d.pct}%</span>
                  </div>
                  <div style={{ height:7, background:'#F0F0EC', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width: d.pct + '%', background:color, borderRadius:4 }} />
                  </div>
                  <div style={{ fontSize:11, color:'#9B9B9F', marginTop:4 }}>{d.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Savings Forecast */}
        <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px' }}>SAVINGS FORECAST</div>
            <span style={{ fontSize:12, color:'#6E6E73' }}>{now.toLocaleDateString('en-US', { month:'long', year:'numeric' })}</span>
          </div>
          <div style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px', marginBottom:16 }}>
            {fmt(savings)} <span style={{ fontSize:13, fontWeight:500, color:'#1A8A4A' }}>projected</span>
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
            <span style={{ fontSize:11, color:'#9B9B9F' }}>{monthStart}</span>
            <span style={{ fontSize:11, color:'#9B9B9F' }}>Today</span>
            <span style={{ fontSize:11, color:'#9B9B9F' }}>{monthEnd}</span>
          </div>
        </div>
      </div>

      {/* Leak Detector */}
      <div style={{ background:'white', borderRadius:14, padding:20, border:'1px solid #E8E8E2', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9B9F', letterSpacing:'0.8px' }}>LEAK DETECTOR</div>
          <span style={{ background:'#FFF2EC', color:'#E8570A', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
            {leaks.length} found
          </span>
        </div>
        {leaks.length === 0 ? (
          <div style={{ fontSize:14, color:'#9B9B9F', textAlign:'center', padding:'12px 0' }}>
            No spending leaks detected this month
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {leaks.map((leak, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#FFFAF7', borderRadius:10, border:'1px solid #FAD4C2' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:20 }}>{leak.emoji}</span>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600 }}>{leak.title}</div>
                    <div style={{ fontSize:12, color:'#9B9B9F' }}>{leak.sub}</div>
                  </div>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'#E8570A' }}>{leak.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
