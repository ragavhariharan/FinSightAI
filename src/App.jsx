import { AppProvider, useApp } from './context';
import Logo from './components/ui/Logo';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import AppShell from './pages/AppShell';

function AuthLoading() {
  return (
    <div className="fs-auth-center">
      <div style={{ textAlign: 'center' }} className="fs-animate-in">
        <Logo size={40} style={{ justifyContent: 'center', marginBottom: 18 }} />
        <p className="fs-subtitle" style={{ marginBottom: 18 }}>Loading FinSight…</p>
        <div style={{ width: 140, height: 3, background: 'var(--fs-surface-3)', borderRadius: 99, margin: '0 auto', overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', background: 'var(--fs-brand)', borderRadius: 99, animation: 'fs-progress-indeterminate 1.2s ease infinite' }} />
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { state } = useApp();
  if (state.authInitializing) return <AuthLoading />;

  switch (state.page) {
    case 'landing': return <Landing />;
    case 'auth': return <Auth />;
    case 'onboarding':
    case 'onboarding-mcq': return <Onboarding />;
    case 'onboarding-data-choice':
    case 'onboarding-chat':
      return <Onboarding />;
    case 'app': return <AppShell />;
    default: return <Landing />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
