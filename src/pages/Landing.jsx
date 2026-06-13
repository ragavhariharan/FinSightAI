import { useApp } from '../context';
import { HoverEl } from '../utils';

const Logo = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <rect width="30" height="30" rx="8" fill="#E8570A" />
    <path d="M7 21L12.5 14L17.5 17.5L23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default function Landing() {
  const { goTo, tryDemo } = useApp();

  return (
    <div style={{ color:'#1A1A1A', background:'#FFFFFF' }}>
      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.93)', backdropFilter:'blur(12px)', borderBottom:'1px solid #E8E8E2', height:60, display:'flex', alignItems:'center', padding:'0 48px', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Logo />
          <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.3px' }}>FinSight</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <HoverEl
            as="button"
            onClick={() => goTo('auth', { authMode:'login' })}
            style={{ background:'transparent', border:'none', padding:'8px 18px', fontSize:14, fontWeight:500, color:'#4B4B4F', cursor:'pointer', borderRadius:8 }}
            hoverStyle={{ background:'#F5F5F3', color:'#1A1A1A' }}
          >Sign in</HoverEl>
          <HoverEl
            as="button"
            onClick={() => goTo('auth', { authMode:'signup' })}
            style={{ background:'#E8570A', color:'white', border:'none', padding:'9px 20px', borderRadius:9, fontSize:14, fontWeight:600, cursor:'pointer' }}
            hoverStyle={{ background:'#C94A06' }}
          >Get started</HoverEl>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:1140, margin:'0 auto', padding:'88px 48px 100px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#FFF2EC', border:'1px solid #FDDACC', borderRadius:20, padding:'5px 14px', marginBottom:28 }}>
            <span style={{ width:6, height:6, background:'#E8570A', borderRadius:'50%', display:'inline-block' }} />
            <span style={{ fontSize:12, fontWeight:600, color:'#E8570A', letterSpacing:'0.3px' }}>AI-powered · Built for India</span>
          </div>
          <h1 style={{ fontSize:52, fontWeight:700, lineHeight:1.08, marginBottom:22, letterSpacing:'-1.8px' }}>Your finances,<br />finally understood.</h1>
          <p style={{ fontSize:18, color:'#6E6E73', lineHeight:1.65, marginBottom:38, maxWidth:440 }}>FinSight builds your financial profile through conversation — then helps you manage everything just by talking to it.</p>
          <div style={{ display:'flex', gap:12, marginBottom:36, flexWrap:'wrap' }}>
            <HoverEl
              as="button"
              onClick={() => goTo('auth', { authMode:'signup' })}
              style={{ background:'#E8570A', color:'white', border:'none', padding:'14px 28px', borderRadius:11, fontSize:16, fontWeight:700, cursor:'pointer' }}
              hoverStyle={{ background:'#C94A06' }}
            >Get started free</HoverEl>
            <HoverEl
              as="button"
              onClick={tryDemo}
              style={{ background:'white', color:'#1A1A1A', border:'1.5px solid #E8E8E2', padding:'14px 28px', borderRadius:11, fontSize:16, fontWeight:600, cursor:'pointer' }}
              hoverStyle={{ background:'#F5F5F3' }}
            >Try the demo</HoverEl>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['Student','Salaried','Daily Earner','Business Owner'].map(t => (
              <span key={t} style={{ background:'#F5F5F3', borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:500, color:'#6E6E73' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* App mockup */}
        <div>
          <div style={{ background:'white', borderRadius:18, boxShadow:'0 28px 80px rgba(0,0,0,0.13)', border:'1px solid #E8E8E2', overflow:'hidden' }}>
            {/* Browser chrome */}
            <div style={{ height:38, background:'#F5F5F3', borderBottom:'1px solid #E8E8E2', display:'flex', alignItems:'center', padding:'0 14px', gap:6 }}>
              {['#DDDDD5','#DDDDD5','#DDDDD5'].map((c, i) => (
                <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:c }} />
              ))}
              <div style={{ flex:1, margin:'0 12px', height:20, background:'#EBEBE3', borderRadius:4 }} />
            </div>
            <div style={{ display:'flex', height:360 }}>
              {/* Mini sidebar */}
              <div style={{ width:100, background:'white', borderRight:'1px solid #E8E8E2', padding:'12px 8px', display:'flex', flexDirection:'column', gap:3, flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:5, padding:4, marginBottom:10 }}>
                  <div style={{ width:16, height:16, borderRadius:4, background:'#E8570A', flexShrink:0 }} />
                  <div style={{ height:7, borderRadius:4, background:'#1A1A1A', width:44, opacity:0.75 }} />
                </div>
                <div style={{ height:26, borderRadius:6, background:'#FFF2EC', display:'flex', alignItems:'center', gap:5, padding:'0 6px' }}>
                  <div style={{ width:7, height:7, borderRadius:2, background:'#E8570A', flexShrink:0 }} />
                  <div style={{ height:5, borderRadius:3, background:'#E8570A', width:48, opacity:0.5 }} />
                </div>
                {[[52,'#C8C8C0','#DDDDD5'],[40,'#C8C8C0','#DDDDD5'],[44,'#C8C8C0','#DDDDD5']].map(([w,ic,bg], i) => (
                  <div key={i} style={{ height:24, display:'flex', alignItems:'center', gap:5, padding:'0 6px' }}>
                    <div style={{ width:7, height:7, borderRadius:2, background:ic, flexShrink:0 }} />
                    <div style={{ height:5, borderRadius:3, background:bg, width:w }} />
                  </div>
                ))}
              </div>
              {/* Mini main */}
              <div style={{ flex:1, background:'#F7F5F2', padding:16, overflow:'hidden' }}>
                <div style={{ height:9, borderRadius:5, background:'#1A1A1A', width:140, marginBottom:14, opacity:0.75 }} />
                <div style={{ background:'white', borderRadius:8, padding:'10px 12px', marginBottom:10, border:'1px solid #E8E8E2', borderLeft:'3px solid #E8570A' }}>
                  <div style={{ height:5, borderRadius:3, background:'#E8570A', width:60, marginBottom:7, opacity:0.7 }} />
                  <div style={{ height:4, borderRadius:2, background:'#DDDDD5', width:'100%', marginBottom:4 }} />
                  <div style={{ height:4, borderRadius:2, background:'#DDDDD5', width:'80%' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                  <div style={{ background:'white', borderRadius:8, padding:8, border:'1px solid #E8E8E2' }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', border:'2.5px solid #F0F0EC', borderTopColor:'#1A8A4A', margin:'0 auto 6px' }} />
                    <div style={{ height:5, borderRadius:3, background:'#DDDDD5', width:24, margin:'0 auto' }} />
                  </div>
                  <div style={{ background:'white', borderRadius:8, padding:8, border:'1px solid #E8E8E2' }}>
                    <div style={{ height:7, borderRadius:4, background:'#1A1A1A', width:44, margin:'0 auto 5px', opacity:0.7 }} />
                    <div style={{ height:4, borderRadius:2, background:'#DDDDD5', width:36, margin:'0 auto' }} />
                  </div>
                  <div style={{ background:'white', borderRadius:8, padding:8, border:'1px solid #E8E8E2' }}>
                    <div style={{ height:7, borderRadius:4, background:'#1A8A4A', width:32, margin:'0 auto 5px' }} />
                    <div style={{ height:4, borderRadius:2, background:'#DDDDD5', width:40, margin:'0 auto' }} />
                  </div>
                </div>
                <div style={{ background:'white', borderRadius:8, padding:10, border:'1px solid #E8E8E2' }}>
                  <div style={{ height:5, borderRadius:3, background:'#DDDDD5', width:80, marginBottom:8 }} />
                  <svg width="100%" height="55" viewBox="0 0 200 55" preserveAspectRatio="none">
                    <path d="M0 50 C30 38,50 28,70 32 S110 18,130 22 S170 8,200 12 L200 55 L0 55 Z" fill="rgba(14,165,233,0.1)" />
                    <path d="M0 50 C30 38,50 28,70 32 S110 18,130 22 S170 8,200 12" fill="none" stroke="#0EA5E9" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              {/* Mini AI chat */}
              <div style={{ width:88, background:'white', borderLeft:'1px solid #E8E8E2', padding:'10px 8px', display:'flex', flexDirection:'column', gap:8, overflow:'hidden', flexShrink:0 }}>
                <div style={{ height:7, borderRadius:4, background:'#1A1A1A', width:60, opacity:0.65, marginBottom:4 }} />
                <div style={{ background:'#EDEDEA', borderRadius:'3px 10px 10px 10px', padding:'7px 6px' }}>
                  <div style={{ height:3, borderRadius:2, background:'#C8C8C0', width:56, marginBottom:3 }} />
                  <div style={{ height:3, borderRadius:2, background:'#C8C8C0', width:44 }} />
                </div>
                <div style={{ background:'#FFF2EC', borderRadius:'10px 3px 10px 10px', padding:'7px 6px', marginLeft:8 }}>
                  <div style={{ height:3, borderRadius:2, background:'#FDDACC', width:36 }} />
                </div>
                <div style={{ background:'#EDEDEA', borderRadius:'3px 10px 10px 10px', padding:'7px 6px' }}>
                  <div style={{ height:3, borderRadius:2, background:'#C8C8C0', width:52, marginBottom:3 }} />
                  <div style={{ height:3, borderRadius:2, background:'#C8C8C0', width:40 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background:'#F7F5F2', padding:'88px 48px' }}>
        <div style={{ maxWidth:1140, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ fontSize:38, fontWeight:700, letterSpacing:'-1px', marginBottom:14 }}>Built different. Built for you.</h2>
            <p style={{ fontSize:17, color:'#6E6E73', maxWidth:480, margin:'0 auto', lineHeight:1.65 }}>No spreadsheets. No manual entry. Just a conversation that understands your financial reality.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            <div style={{ background:'white', borderRadius:18, padding:32, border:'1px solid #E8E8E2', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width:48, height:48, borderRadius:13, background:'#FFF2EC', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L13.2 7.8L19.5 8.6L15 12.8L16.4 19L11 16L5.6 19L7 12.8L2.5 8.6L8.8 7.8Z" fill="#E8570A" /></svg>
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10, letterSpacing:'-0.2px' }}>Persona-Aware Intelligence</h3>
              <p style={{ fontSize:14, color:'#6E6E73', lineHeight:1.65 }}>Student, daily earner, or business owner — FinSight adapts its questions, insights, and language to your financial reality.</p>
            </div>
            <div style={{ background:'white', borderRadius:18, padding:32, border:'1px solid #E8E8E2', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width:48, height:48, borderRadius:13, background:'#EDFBF1', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 13L8 8L12 11L18 5" stroke="#1A8A4A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="18" cy="17" r="2" fill="#1A8A4A" /><path d="M18 14.8V15" stroke="#1A8A4A" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10, letterSpacing:'-0.2px' }}>Conversational Data Entry</h3>
              <p style={{ fontSize:14, color:'#6E6E73', lineHeight:1.65 }}>Just talk to FinSight. "I spent ₹500 on groceries" is enough — the AI extracts, categorizes, and updates your profile in real time.</p>
            </div>
            <div style={{ background:'white', borderRadius:18, padding:32, border:'1px solid #E8E8E2', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ width:48, height:48, borderRadius:13, background:'#EEF0FF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="14" width="3.5" height="5" rx="1" fill="#6366F1" /><rect x="9.25" y="9" width="3.5" height="10" rx="1" fill="#6366F1" /><rect x="15.5" y="4" width="3.5" height="15" rx="1" fill="#6366F1" /></svg>
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:10, letterSpacing:'-0.2px' }}>Live Dashboard Reactivity</h3>
              <p style={{ fontSize:14, color:'#6E6E73', lineHeight:1.65 }}>Every chat message updates your dashboard live. Type a transaction, watch your health score and forecast recalculate instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:'#1A1A1A', padding:'88px 48px', textAlign:'center' }}>
        <h2 style={{ fontSize:38, fontWeight:700, color:'white', letterSpacing:'-1px', marginBottom:16 }}>Start understanding your money today.</h2>
        <p style={{ fontSize:17, color:'#9B9B9F', marginBottom:36, maxWidth:440, margin:'0 auto 36px', lineHeight:1.65 }}>Takes 3 minutes. No bank credentials. No CSV. Just a conversation.</p>
        <HoverEl
          as="button"
          onClick={() => goTo('auth', { authMode:'signup' })}
          style={{ background:'#E8570A', color:'white', border:'none', padding:'16px 40px', borderRadius:12, fontSize:17, fontWeight:700, cursor:'pointer' }}
          hoverStyle={{ background:'#C94A06' }}
        >Create your free account</HoverEl>
      </section>

      {/* Footer */}
      <footer style={{ background:'#1A1A1A', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'24px 48px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="22" height="22" viewBox="0 0 22 22"><rect width="22" height="22" rx="6" fill="#E8570A" /><path d="M5 16L9.5 10L14 13L18 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span style={{ fontSize:14, fontWeight:600, color:'white' }}>FinSight</span>
        </div>
        <span style={{ fontSize:13, color:'#6E6E73' }}>© 2025 FinSight AI · All rights reserved.</span>
      </footer>
    </div>
  );
}
