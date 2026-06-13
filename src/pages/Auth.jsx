import { useApp } from '../context';
import { HoverEl } from '../utils';

export default function Auth() {
  const { state, up, goTo, tryDemo, submitAuth } = useApp();
  const { authMode, authEmail, authPassword, authName } = state;
  const isSignup = authMode === 'signup';

  const tabBase = { flex:1, padding:'8px 12px', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' };

  return (
    <div style={{ minHeight:'100vh', background:'#F7F5F2', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'white', borderRadius:20, padding:40, width:'100%', maxWidth:400, border:'1px solid #E8E8E2', boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center', marginBottom:32 }}>
          <svg width="34" height="34" viewBox="0 0 34 34"><rect width="34" height="34" rx="9" fill="#E8570A" /><path d="M8 25L14 16.5L19.5 20L26 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px' }}>FinSight</span>
        </div>

        <h1 style={{ fontSize:22, fontWeight:700, textAlign:'center', marginBottom:6 }}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{ fontSize:14, color:'#6E6E73', textAlign:'center', marginBottom:28 }}>
          {isSignup ? 'Start understanding your finances in 3 minutes' : 'Sign in to your FinSight account'}
        </p>

        {/* Toggle */}
        <div style={{ display:'flex', background:'#F5F5F3', borderRadius:10, padding:4, marginBottom:24, gap:4 }}>
          <button
            onClick={() => up({ authMode:'signup' })}
            style={{ ...tabBase, background:isSignup ? 'white' : 'transparent', color:isSignup ? '#1A1A1A' : '#6E6E73', boxShadow:isSignup ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >Create account</button>
          <button
            onClick={() => up({ authMode:'login' })}
            style={{ ...tabBase, background:!isSignup ? 'white' : 'transparent', color:!isSignup ? '#1A1A1A' : '#6E6E73', boxShadow:!isSignup ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >Sign in</button>
        </div>

        <form onSubmit={submitAuth}>
          {isSignup && (
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Full name</label>
              <input
                value={authName}
                onChange={e => up({ authName:e.target.value })}
                type="text"
                placeholder="Arjun Kumar"
                style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E8E8E2', borderRadius:9, fontSize:15, color:'#1A1A1A', background:'white', fontFamily:'inherit' }}
              />
            </div>
          )}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Email address</label>
            <input
              value={authEmail}
              onChange={e => up({ authEmail:e.target.value })}
              type="email"
              placeholder="arjun@gmail.com"
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E8E8E2', borderRadius:9, fontSize:15, color:'#1A1A1A', background:'white', fontFamily:'inherit' }}
            />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6 }}>Password</label>
            <input
              value={authPassword}
              onChange={e => up({ authPassword:e.target.value })}
              type="password"
              placeholder="At least 8 characters"
              style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #E8E8E2', borderRadius:9, fontSize:15, color:'#1A1A1A', background:'white', fontFamily:'inherit' }}
            />
          </div>
          <HoverEl
            as="button"
            type="submit"
            style={{ width:'100%', background:'#E8570A', color:'white', border:'none', padding:13, borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:12, fontFamily:'inherit' }}
            hoverStyle={{ background:'#C94A06' }}
          >{isSignup ? 'Create account' : 'Sign in'}</HoverEl>
        </form>

        <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0 12px' }}>
          <div style={{ flex:1, height:1, background:'#E8E8E2' }} />
          <span style={{ fontSize:12, color:'#9B9B9F' }}>or</span>
          <div style={{ flex:1, height:1, background:'#E8E8E2' }} />
        </div>

        <HoverEl
          as="button"
          onClick={tryDemo}
          style={{ width:'100%', background:'white', color:'#1A1A1A', border:'1.5px solid #E8E8E2', padding:12, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}
          hoverStyle={{ background:'#F5F5F3' }}
        >Continue as Demo User</HoverEl>

        <div style={{ textAlign:'center', marginTop:20 }}>
          <HoverEl
            as="button"
            onClick={() => goTo('landing')}
            style={{ background:'none', border:'none', fontSize:13, color:'#9B9B9F', cursor:'pointer', fontFamily:'inherit' }}
            hoverStyle={{ color:'#1A1A1A' }}
          >Back to home</HoverEl>
        </div>
      </div>
    </div>
  );
}
