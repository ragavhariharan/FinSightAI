import { useApp } from '../context';
import { HoverEl } from '../utils';
import { signInWithGoogle } from '../lib/auth';

export default function Auth() {
  const { state, up, goTo, tryDemo, submitAuth } = useApp();
  const { authMode, authEmail, authPassword, authName, authLoading, authError } = state;

  async function handleGoogle() {
    up({ authError:'' });
    try {
      await signInWithGoogle();
    } catch (err) {
      up({ authError: err.message || 'Google sign-in failed' });
    }
  }
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
          {authError && (
            <p style={{ fontSize:13, color:'#D63B2F', marginBottom:12, textAlign:'center' }}>{authError}</p>
          )}
          <HoverEl
            as="button"
            type="submit"
            disabled={authLoading}
            style={{ width:'100%', background:authLoading ? '#F5A574' : '#E8570A', color:'white', border:'none', padding:13, borderRadius:10, fontSize:15, fontWeight:700, cursor:authLoading ? 'wait' : 'pointer', marginBottom:12, fontFamily:'inherit' }}
            hoverStyle={{ background:authLoading ? '#F5A574' : '#C94A06' }}
          >{authLoading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}</HoverEl>
        </form>

        <HoverEl
          as="button"
          onClick={handleGoogle}
          style={{ width:'100%', background:'white', color:'#1A1A1A', border:'1.5px solid #E8E8E2', padding:12, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', marginBottom:12, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
          hoverStyle={{ background:'#F5F5F3' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </HoverEl>

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
