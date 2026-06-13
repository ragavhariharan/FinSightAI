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

const DEFAULT_FEATURES = Object.fromEntries(FEATURES.map(f => [f.id, true]));

const DEFAULTS = {
  theme: 'light',
  sidebarWidth: 248,
  aiPanelWidth: 350,
  sidebarCollapsed: false,
  features: DEFAULT_FEATURES,
};

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

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
}

export function applyLayoutWidths(sidebarWidth, aiPanelWidth) {
  document.documentElement.style.setProperty('--fs-sidebar', `${sidebarWidth}px`);
  document.documentElement.style.setProperty('--fs-ai-panel', `${aiPanelWidth}px`);
}

export function isFeatureEnabled(settings, featureId) {
  return settings?.features?.[featureId] !== false;
}
