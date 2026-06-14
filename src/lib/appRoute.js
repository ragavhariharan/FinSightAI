import { NAV_SECTIONS } from './nav';

export const APP_VIEWS = NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.id));

export function viewFromPathname(pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  const path = pathname.replace(/\/$/, '') || '/';

  if (path === '/') return { page: 'landing', view: 'dashboard' };
  if (path === '/app' || path === '/dashboard') return { page: 'app', view: 'dashboard' };
  if (path === '/auth') return { page: 'auth', view: null };
  if (path === '/onboarding') return { page: 'onboarding', view: null };

  const view = path.slice(1);
  if (APP_VIEWS.includes(view)) return { page: 'app', view };

  return { page: 'landing', view: 'dashboard' };
}

export function pathnameForAppView(view = 'dashboard') {
  if (!view || view === 'dashboard') return '/dashboard';
  return `/${view}`;
}

export function pathnameForPage(page, activeNav = 'dashboard') {
  if (page === 'landing') return '/';
  if (page === 'auth') return '/auth';
  if (page === 'onboarding' || (page && page.startsWith('onboarding'))) return '/onboarding';
  if (page === 'app') return pathnameForAppView(activeNav);
  return '/';
}

export function syncUrl(page, activeNav, { replace = true } = {}) {
  if (typeof window === 'undefined' || !page) return;
  const path = pathnameForPage(page, activeNav);
  if (window.location.pathname === path) return;
  const state = { page, activeNav };
  if (replace) window.history.replaceState(state, '', path);
  else window.history.pushState(state, '', path);
}

export function readStoredShowAI() {
  try {
    const stored = sessionStorage.getItem('finsight_show_ai');
    if (stored !== null) return stored === '1';
  } catch { /* ignore */ }
  return null;
}

export function storeShowAI(open) {
  try {
    sessionStorage.setItem('finsight_show_ai', open ? '1' : '0');
  } catch { /* ignore */ }
}
