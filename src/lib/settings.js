const STORAGE_KEY = 'finsight_settings';

export const FEATURES = [
  { id: 'news', label: 'Personalised news feed', desc: 'Financial news filtered to your interests' },
  { id: 'stocks', label: 'Stock portfolio', desc: 'Track equities with live price updates' },
  { id: 'mutualFunds', label: 'Mutual fund tracker', desc: 'NAV and returns' },
  { id: 'netWorth', label: 'Net worth dashboard', desc: 'Wealth across accounts and investments' },
  { id: 'spendingChallenges', label: 'Spending challenges', desc: 'Gamified savings goals' },
  { id: 'goals', label: 'Savings goals', desc: 'Timeline-based targets' },
  { id: 'recurring', label: 'Recurring expenses', desc: 'OTT, rent & subscriptions' },
];

export const THEME_OPTIONS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

const DEFAULT_FEATURES = Object.fromEntries(FEATURES.map(f => [f.id, true]));

const DEFAULTS = {
  theme: 'light',
  sidebarWidth: 248,
  aiPanelWidth: 350,
  sidebarCollapsed: false,
  openAssistant: true,
  features: DEFAULT_FEATURES,
};

export { DEFAULTS };

export function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(theme) {
  if (theme === 'system' || !theme) return getSystemTheme();
  return theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', resolveTheme(theme));
}

export function watchSystemTheme(callback) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => callback(getSystemTheme());
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}

export function initTheme() {
  const settings = loadSettings();
  applyTheme(settings.theme);
  return settings;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS, features: { ...DEFAULT_FEATURES } };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULTS,
      ...parsed,
      features: { ...DEFAULT_FEATURES, ...(parsed.features || {}) },
    };
  } catch {
    return { ...DEFAULTS, features: { ...DEFAULT_FEATURES } };
  }
}

export function saveSettings(patch) {
  const next = { ...loadSettings(), ...patch };
  if (patch.features) next.features = { ...loadSettings().features, ...patch.features };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applyTheme(next.theme);
  applyLayoutWidths(next.sidebarWidth, next.aiPanelWidth);
  return next;
}

export function applyLayoutWidths(sidebarWidth, aiPanelWidth) {
  document.documentElement.style.setProperty('--fs-sidebar', `${sidebarWidth}px`);
  document.documentElement.style.setProperty('--fs-ai-panel', `${aiPanelWidth}px`);
}

export function isFeatureEnabled(settings, featureId) {
  return settings?.features?.[featureId] !== false;
}

export function resetSettings() {
  const next = { ...DEFAULTS, features: { ...DEFAULT_FEATURES } };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  applyTheme(next.theme);
  applyLayoutWidths(next.sidebarWidth, next.aiPanelWidth);
  return next;
}

export function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}
