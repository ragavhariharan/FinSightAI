import { useApp } from '../context';
import { ASSISTANT_NAME } from '../lib/assistant';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';
import PasswordInput from '../components/ui/PasswordInput';
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

const BENEFITS = [
  { icon: 'message', text: 'Log transactions by typing naturally — no forms to fill out' },
  { icon: 'trendUp', text: 'Real-time dashboard with health score, budgets, and forecasts' },
  { icon: 'shield', text: 'Your data stays private with encrypted storage and access controls' },
  { icon: 'users', text: 'Onboarding tailored to students, salaried, gig, and business profiles' },
];

export default function Auth() {
  const { state, up, goTo, submitAuth } = useApp();
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
    <div className="fs-auth-page">
      <div className="fs-auth-visual">
        <div className="fs-auth-visual-content">
          <Logo showText size={32} />
          <h2 style={{ marginTop: 48 }}>
            {isSignup ? 'Take control of your finances today' : 'Welcome back to FinSight'}
          </h2>
          <p className="fs-subtitle" style={{ maxWidth: 380 }}>
            {isSignup
              ? 'Join thousands of Indians who track spending, hit savings goals, and get AI-powered insights — all in one place.'
              : `Your dashboard, budgets, and ${ASSISTANT_NAME} are ready. Sign in to pick up where you left off.`}
          </p>
          <div className="fs-auth-benefits">
            {BENEFITS.map(b => (
              <div key={b.text} className="fs-auth-benefit">
                <div className="fs-auth-benefit-icon"><Icon name={b.icon} size={16} /></div>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fs-auth-preview">
          <div className="fs-label" style={{ marginBottom: 10, color: 'var(--fs-brand)' }}>{ASSISTANT_NAME}</div>
          <div className="fs-chat-row fs-chat-row-user" style={{ marginBottom: 10 }}>
            <div className="fs-chat-bubble fs-chat-bubble-user fs-chat-pos-solo" style={{ fontSize: '0.78rem' }}>
              How much did I spend on food this week?
            </div>
          </div>
          <div className="fs-chat-row">
            <div className="fs-chat-bubble fs-chat-bubble-ai fs-chat-pos-solo" style={{ fontSize: '0.78rem' }}>
              Ask about your spending, budgets, or log a transaction in plain language.
            </div>
          </div>
        </div>
      </div>

      <div className="fs-auth-form-side">
        <div className="fs-auth-card">
          <button className="fs-btn fs-btn-ghost fs-btn-sm fs-auth-back" onClick={() => goTo('landing')}>
            <Icon name="arrowLeft" size={15} /> Back to home
          </button>

          <h1 className="fs-h2" style={{ marginBottom: 6 }}>
            {isSignup ? 'Create your account' : 'Sign in'}
          </h1>
          <p className="fs-subtitle" style={{ marginBottom: 26, fontSize: '0.875rem' }}>
            {isSignup ? 'Free forever. No credit card required.' : 'Enter your credentials to continue'}
          </p>

          <form onSubmit={submitAuth}>
            {isSignup && (
              <div className="fs-field">
                <label className="fs-field-label">Full name</label>
                <input className="fs-input" value={authName} onChange={e => up({ authName: e.target.value })} placeholder="Arjun Kumar" autoComplete="name" />
              </div>
            )}
            <div className="fs-field">
              <label className="fs-field-label">Email</label>
              <input className="fs-input" type="email" value={authEmail} onChange={e => up({ authEmail: e.target.value })} placeholder="you@email.com" autoComplete="email" />
            </div>
            <div className="fs-field">
              <label className="fs-field-label">Password</label>
              <PasswordInput
                value={authPassword}
                onChange={e => up({ authPassword: e.target.value })}
                placeholder="At least 8 characters"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </div>
            {authError && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--fs-danger)', marginBottom: 14, textAlign: 'center', lineHeight: 1.5, padding: '10px 12px', background: 'var(--fs-danger-soft)', borderRadius: 'var(--fs-radius-sm)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>{authError}</p>
            )}
            <button type="submit" className="fs-btn fs-btn-primary" style={{ width: '100%', marginBottom: 16, padding: '12px' }} disabled={authLoading}>
              {authLoading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 16px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--fs-border)' }} />
            <span className="fs-subtitle" style={{ fontSize: '0.75rem' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--fs-border)' }} />
          </div>

          <button className="fs-btn fs-btn-secondary" style={{ width: '100%' }} onClick={handleGoogle}>
            <GoogleIcon /> Continue with Google
          </button>

          <p className="fs-auth-switch" style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--fs-text-secondary)' }}>
            {isSignup ? (
              <>Already have an account?{' '}
                <button type="button" className="fs-auth-switch-link" onClick={() => up({ authMode: 'login', authError: '' })}>Sign in</button>
              </>
            ) : (
              <>Don&apos;t have an account?{' '}
                <button type="button" className="fs-auth-switch-link" onClick={() => up({ authMode: 'signup', authError: '' })}>Create one</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
