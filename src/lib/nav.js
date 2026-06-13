/** Central nav config — filtered by settings.features */
export const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', feature: null },
      { id: 'netWorth', label: 'Net worth', icon: 'networth', feature: 'netWorth' },
      { id: 'transactions', label: 'Transactions', icon: 'transactions', feature: null },
      { id: 'reports', label: 'Reports', icon: 'reports', feature: null },
      { id: 'budget', label: 'Budget', icon: 'budget', feature: null },
      { id: 'accounts', label: 'Accounts', icon: 'wallet', feature: null },
      { id: 'recurring', label: 'Recurring', icon: 'recurring', feature: 'recurring' },
      { id: 'goals', label: 'Goals', icon: 'goals', feature: 'goals' },
    ],
  },
  {
    label: 'Investments',
    items: [
      { id: 'stocks', label: 'Stocks', icon: 'stocks', feature: 'stocks' },
      { id: 'mutualFunds', label: 'Mutual funds', icon: 'funds', feature: 'mutualFunds' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'news', label: 'News feed', icon: 'news', feature: 'news' },
      { id: 'challenges', label: 'Challenges', icon: 'challenge', feature: 'spendingChallenges' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: 'settings', feature: null },
    ],
  },
];

export const PAGE_META = {
  dashboard: { title: 'Dashboard', subtitle: 'Your financial snapshot' },
  netWorth: { title: 'Net worth', subtitle: 'Total wealth across accounts and investments' },
  transactions: { title: 'Transactions', subtitle: 'Every rupee in and out' },
  reports: { title: 'Reports', subtitle: 'Where your money goes' },
  budget: { title: 'Budget', subtitle: 'Stay on track this month' },
  accounts: { title: 'Accounts', subtitle: 'Bank balances and default account' },
  recurring: { title: 'Recurring', subtitle: 'Subscriptions, rent & repeat bills' },
  goals: { title: 'Goals', subtitle: 'Save toward targets on a timeline' },
  stocks: { title: 'Stock portfolio', subtitle: 'Holdings and daily performance' },
  mutualFunds: { title: 'Mutual funds', subtitle: 'NAV and returns' },
  news: { title: 'News feed', subtitle: 'Personalised to your interests' },
  challenges: { title: 'Challenges', subtitle: 'Gamified spending discipline' },
  settings: { title: 'Settings', subtitle: 'Preferences and features' },
};

export function visibleNav(settings) {
  return NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => !item.feature || settings.features?.[item.feature] !== false),
  })).filter(s => s.items.length > 0);
}
