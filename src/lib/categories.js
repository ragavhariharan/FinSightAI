/**
 * Single source of truth mapping a transaction/budget category to its icon and
 * accent color. Keeps colors consistent and professional across the whole app,
 * regardless of what emoji/color the data row happens to carry.
 */
const META = {
  'Paychecks':              { icon: 'income',        color: '#1F7A5E' },
  'Business Revenue':       { icon: 'business',      color: '#1F7A5E' },
  'Housing':                { icon: 'housing',       color: '#3E63DD' },
  'Food & Dining':          { icon: 'food',          color: '#C2453C' },
  'Groceries':              { icon: 'groceries',     color: '#0E8C82' },
  'Transport':              { icon: 'transport',     color: '#6E56CF' },
  'Shopping':               { icon: 'shopping',      color: '#B83280' },
  'Utilities':              { icon: 'utilities',     color: '#C28A00' },
  'Utilities & Insurance':  { icon: 'utilities',     color: '#C28A00' },
  'Insurance':              { icon: 'insurance',     color: '#5B6472' },
  'Entertainment':          { icon: 'entertainment', color: '#7A5AF8' },
  'Health':                 { icon: 'health',        color: '#C2453C' },
  'Health & Fitness':       { icon: 'fitness',       color: '#0E8C82' },
  'Fitness':                { icon: 'fitness',        color: '#0E8C82' },
  'Business Costs':         { icon: 'business',      color: '#A5602B' },
  'Other':                  { icon: 'other',         color: '#5B6472' },
};

const DEFAULT = { icon: 'other', color: '#5B6472' };

export function categoryMeta(category) {
  return META[category] || DEFAULT;
}

export function categoryList() {
  return Object.keys(META);
}

/** hex -> rgba string with given alpha (for soft icon backgrounds). */
export function tint(hex, alpha = 0.12) {
  const h = (hex || '#5B6472').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
