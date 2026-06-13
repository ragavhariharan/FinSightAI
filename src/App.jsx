import { AppProvider, useApp } from './context';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import OnboardingMCQ from './pages/OnboardingMCQ';
import OnboardingChat from './pages/OnboardingChat';
import AppShell from './pages/AppShell';

function AuthLoading() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F7F5F2' }}>
      <div style={{ textAlign:'center' }}>
        <svg width="36" height="36" viewBox="0 0 36 36" style={{ marginBottom:12 }}>
          <rect width="36" height="36" rx="9" fill="#E8570A" />
          <path d="M8 26L14 17L19 20.5L28 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <p style={{ fontSize:14, color:'#6E6E73' }}>Loading FinSight…</p>
      </div>
    </div>
  );
}

function Router() {
  const { state } = useApp();

  if (state.authInitializing) return <AuthLoading />;

  switch (state.page) {
    case 'landing':        return <Landing />;
    case 'auth':           return <Auth />;
    case 'onboarding-mcq': return <OnboardingMCQ />;
    case 'onboarding-chat':return <OnboardingChat />;
    case 'app':            return <AppShell />;
    default:               return <Landing />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
