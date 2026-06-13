import { useApp } from '../context';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';
import { signInWithGoogle } from '../lib/auth';

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

export default function Auth() {
  const { state, up, goTo, tryDemo, submitAuth } = useApp();
  const { authMode, authEmail, authPassword, authName, authLoading, authError } = state;
  const isSignup = authMode === 'signup';

  async function handleGoogle() {
    up({ authError: '' });
    try {
      await signInWithGoogle();
    } catch (err) {
      up({ authError: err.message || 'Google sign-in failed' });
    }
  }

  return (
    <div className="fs-auth-center">
      <div className="fs-auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 26 }}>
          <Logo showText size={32} />
        </div>

        <h1 className="fs-h2" style={{ textAlign: 'center', marginBottom: 6 }}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="fs-subtitle" style={{ textAlign: 'center', marginBottom: 26 }}>
          {isSignup ? 'Start understanding your finances in minutes' : 'Sign in to continue'}
        </p>

        <div className="fs-tab-group">
          <button className={`fs-tab ${isSignup ? 'active' : ''}`} onClick={() => up({ authMode: 'signup' })}>Create account</button>
          <button className={`fs-tab ${!isSignup ? 'active' : ''}`} onClick={() => up({ authMode: 'login' })}>Sign in</button>
        </div>

        <form onSubmit={submitAuth}>
          {isSignup && (
            <div className="fs-field">
              <label className="fs-field-label">Full name</label>
              <input className="fs-input" value={authName} onChange={e => up({ authName: e.target.value })} placeholder="Arjun Kumar" />
            </div>
          )}
          <div className="fs-field">
            <label className="fs-field-label">Email</label>
            <input className="fs-input" type="email" value={authEmail} onChange={e => up({ authEmail: e.target.value })} placeholder="you@email.com" />
          </div>
          <div className="fs-field">
            <label className="fs-field-label">Password</label>
            <input className="fs-input" type="password" value={authPassword} onChange={e => up({ authPassword: e.target.value })} placeholder="At least 8 characters" />
          </div>
          {authError && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--fs-danger)', marginBottom: 14, textAlign: 'center', lineHeight: 1.5, padding: '10px 12px', background: 'var(--fs-danger-soft)', borderRadius: 'var(--fs-radius-sm)', border: '1px solid #FECDCA' }}>{authError}</p>
          )}
          <button type="submit" className="fs-btn fs-btn-primary" style={{ width: '100%', marginBottom: 12 }} disabled={authLoading}>
            {authLoading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button className="fs-btn fs-btn-secondary" style={{ width: '100%', marginBottom: 12 }} onClick={handleGoogle}>
          <GoogleIcon /> Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 12px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--fs-border)' }} />
          <span className="fs-subtitle" style={{ fontSize: '0.75rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--fs-border)' }} />
        </div>

        <button className="fs-btn fs-btn-secondary" style={{ width: '100%' }} onClick={tryDemo}>
          Continue as demo user
        </button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="fs-btn fs-btn-ghost fs-btn-sm" onClick={() => goTo('landing')} style={{ gap: 6 }}>
            <Icon name="arrowLeft" size={15} /> Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
