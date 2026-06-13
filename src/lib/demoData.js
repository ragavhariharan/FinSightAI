import { categoryMeta } from './categories';

/** Demo mode mock data — budgets/templates only; transactions are never seeded */
export const DEMO_BUDGETS = [
  { cat: 'Food & Dining', spent: 7010, limit: 9000 },
  { cat: 'Shopping', spent: 5698, limit: 7000 },
  { cat: 'Utilities', spent: 9099, limit: 10000 },
  { cat: 'Transport', spent: 5400, limit: 6000 },
  { cat: 'Health', spent: 2180, limit: 3000 },
];

export const DEMO_SNAPSHOT = {
  briefing: 'You are on track to save ₹18,664 this month — 28.7% of take-home. Housing is your biggest spend at 52%. I spotted 2 spending leaks worth reviewing.',
  health_score: 72,
  health_label: 'Good standing',
  health_notes: 'Low debt · Stable income · Build emergency fund',
  monthly_income: 65000,
  monthly_spend: 46336,
  net_savings: 18664,
  savings_rate_pct: 28.7,
  total_budget_limit: 61000,
  budget_used_pct: 89,
  spending_dna: {
    routine: { pct: 55, sub: 'EMI, utilities, groceries' },
    flexible: { pct: 30, sub: 'Food delivery, transport, health' },
    impulse: { pct: 15, sub: 'Shopping, leisure, dining out' },
  },
  forecast: { projected_savings: 18664, points: [0, 640, 1280, 1920, 2560, 3200, 3840, 4480, 5120, 5760, 6400, 7040, 7680, 8320, 8960, 9600, 10240, 10880, 11520, 12160, 12800, 13440, 14080, 14720, 15360, 16000, 16640, 17280, 17920, 18664] },
  leaks: [
    { title: 'Food delivery up 40%', detail: 'Swiggy + Zomato · ₹1,110 this month vs ₹790 avg', delta: 320 },
    { title: 'Shopping spike', detail: 'Amazon + Myntra · ₹5,698 this month vs ₹2,100 avg', delta: 3598 },
  ],
  donut_segments: [
    { name: 'Housing', amount: 24000, pct: 50.4 },
    { name: 'Food & Dining', amount: 7010, pct: 14.7 },
    { name: 'Shopping', amount: 5698, pct: 12.0 },
    { name: 'Transport', amount: 5400, pct: 11.4 },
    { name: 'Utilities', amount: 9099, pct: 19.1 },
  ].map(s => ({ ...s, color: categoryMeta(s.name).color })),
  transaction_count: 13,
  largest_expense: 22000,
};

export const DEMO_STOCKS = [
  { id: 's1', symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', qty: 25, avgPrice: 1580, basePrice: 1642 },
  { id: 's2', symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', qty: 40, avgPrice: 620, basePrice: 798 },
  { id: 's3', symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', qty: 10, avgPrice: 2450, basePrice: 2890 },
];

export const DEMO_MUTUAL_FUNDS = [
  { id: 'mf1', name: 'Parag Parikh Flexi Cap', isin: 'INF879O01027', units: 420.5, invested: 180000, nav: 78.4, benchmark: 'Nifty 500', benchmarkReturn: 14.2, fundReturn: 11.8, navHistory: [72, 73, 74, 75, 76, 77, 78.4] },
  { id: 'mf2', name: 'Mirae Asset Large Cap', isin: 'INF769K01AX2', units: 310, invested: 150000, nav: 112.2, benchmark: 'Nifty 50', benchmarkReturn: 16.1, fundReturn: 12.4, navHistory: [105, 106, 108, 109, 110, 111, 112.2] },
];

export const DEMO_SIP_GOALS = [
  { id: 'g1', title: 'House down payment', target: 1000000, years: 5, saved: 186000, monthlySip: 12500, category: 'Large cap + debt hybrid' },
  { id: 'g2', title: 'Emergency fund', target: 300000, years: 2, saved: 95000, monthlySip: 8500, category: 'Liquid / ultra-short' },
];

export const DEMO_NET_WORTH = {
  assets: [
    { id: 'a1', label: 'Savings accounts', amount: 420000 },
    { id: 'a3', label: 'PPF / EPF', amount: 280000 },
    { id: 'a4', label: 'Gold', amount: 95000 },
  ],
  liabilities: [
    { id: 'l1', label: 'Home loan outstanding', amount: 3200000 },
    { id: 'l2', label: 'Credit card', amount: 42000 },
  ],
};

export const DEMO_NEWS_POOL = [
  { id: 'n1', title: 'Petrol prices rise ₹2.50/litre in metros', summary: 'OMCs revised fuel rates after crude uptick — impacts daily commuters.', source: 'Economic Times', tags: ['fuel', 'transport'], date: '2025-06-13', image: 'https://images.unsplash.com/photo-1633945274309-2c16c9682a8e?w=600&h=600&fit=crop' },
  { id: 'n2', title: 'HDFC Bank Q4 net profit up 8% YoY', summary: 'Asset quality stable; NIM compression in focus for investors.', source: 'Mint', tags: ['HDFCBANK', 'banking'], date: '2025-06-12', image: 'https://images.unsplash.com/photo-1541354328608-1b8a2f0c81c8?w=600&h=600&fit=crop' },
  { id: 'n3', title: 'SBI announces revised home loan rates', summary: 'Starting 8.50% for salaried — may affect your EMI planning.', source: 'Business Standard', tags: ['SBIN', 'housing', 'banking'], date: '2025-06-11', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=600&fit=crop' },
  { id: 'n4', title: 'SEBI tightens mutual fund expense ratio norms', summary: 'Direct plans may see lower TER — relevant for long-term SIP investors.', source: 'Moneycontrol', tags: ['mutualfunds', 'investing'], date: '2025-06-10', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=600&fit=crop' },
  { id: 'n5', title: 'Food delivery apps hike platform fees', summary: 'Swiggy and Zomato adjust fees in select cities.', source: 'Inc42', tags: ['food', 'shopping'], date: '2025-06-09', image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=600&fit=crop' },
  { id: 'n6', title: 'New tax regime slabs unchanged in Budget', summary: 'Old vs new regime choice remains key for salaried taxpayers.', source: 'Livemint', tags: ['tax', 'salaried'], date: '2025-06-08', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=600&fit=crop' },
];

export const DEMO_BILL_SPLITS = [
  { id: 'b1', title: 'Goa trip — Airbnb', total: 12000, paidBy: 'You', members: [{ name: 'You', share: 3000 }, { name: 'Rahul', share: 3000, owes: 3000 }, { name: 'Priya', share: 3000, owes: 3000 }, { name: 'Arjun', share: 3000, owes: 3000 }] },
  { id: 'b2', title: 'Flat utilities — June', total: 4500, paidBy: 'You', members: [{ name: 'You', share: 1500 }, { name: 'Roommate A', share: 1500, owes: 1500 }, { name: 'Roommate B', share: 1500, owes: 1500 }] },
];

export const DEMO_CHALLENGES = [
  { id: 'c1', title: 'No-spend weekend', desc: 'Zero discretionary spend Sat–Sun', target: 0, current: 480, unit: '₹', status: 'active', progress: 52 },
  { id: 'c2', title: 'Cut food delivery 30%', desc: 'vs last month average', target: 30, current: 18, unit: '%', status: 'active', progress: 60 },
  { id: 'c3', title: 'Save ₹5,000 extra', desc: 'Above your usual savings rate', target: 5000, current: 3200, unit: '₹', status: 'active', progress: 64 },
];

export const DEMO_TAX_PROFILE = {
  annualIncome: 780000,
  investments80C: 125000,
  healthInsurance80D: 25000,
  homeLoanInterest: 180000,
  nps80CCD: 50000,
};
