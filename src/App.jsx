import { AppProvider, useApp } from './context';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import OnboardingMCQ from './pages/OnboardingMCQ';
import OnboardingChat from './pages/OnboardingChat';
import AppShell from './pages/AppShell';

function Router() {
  const { state } = useApp();
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
