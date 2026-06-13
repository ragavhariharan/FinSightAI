/** Fixed onboarding questionnaire — no AI chat */

export const PERSONAS = [
  { id: 'student', label: 'Student' },
  { id: 'salaried_employee', label: 'Salaried employee' },
  { id: 'business_owner', label: 'Business owner' },
];

export const UNIVERSAL_STEPS = [
  {
    id: 'income_frequency',
    title: 'How do you receive income?',
    type: 'radio',
    options: ['Daily', 'Weekly', 'Monthly'],
  },
  {
    id: 'income_amount',
    title: 'What is your typical income amount?',
    subtitle: 'Enter your usual amount per period',
    type: 'currency',
    placeholder: '50000',
  },
  {
    id: 'financial_goals',
    title: 'What are your financial goals?',
    subtitle: 'Pick up to 3',
    type: 'checkbox',
    max: 3,
    options: ['Save money', 'Build emergency fund', 'Invest', 'Buy vehicle', 'Buy house', 'Pay debt', 'Grow business', 'Education'],
  },
  {
    id: 'investments',
    title: 'Current investments',
    type: 'checkbox',
    options: ['No investments', 'Stocks', 'Mutual Funds', 'Gold', 'Crypto', 'FD', 'PF/EPF'],
    exclusive: 'No investments',
  },
  {
    id: 'news_interests',
    title: 'News interests',
    subtitle: 'Used to personalise your news feed',
    type: 'checkbox',
    options: ['Indian Markets', 'Personal Finance', 'Mutual Funds', 'Startup News', 'Business News', 'Tax Updates', 'Crypto', 'Global Markets'],
  },
];

export const PERSONA_STEPS = {
  student: [
    { id: 'transport', title: 'How do you usually travel?', type: 'radio', options: ['College Bus', 'Public Transport', 'Own Vehicle', 'Walk/Cycle'] },
    { id: 'fuel_spend', title: 'Fuel spend per month', type: 'currency', showIf: (a) => a.transport === 'Own Vehicle', placeholder: '2000' },
    { id: 'ride_apps', title: 'How often do you use Rapido / Uber / Ola?', type: 'radio', options: ['Never', 'Weekly', 'Few times/week', 'Daily'] },
    { id: 'food_delivery', title: 'Swiggy / Zomato usage?', type: 'radio', options: ['Rarely', 'Weekly', 'Multiple times/week', 'Daily'] },
    { id: 'pocket_money', title: 'Pocket money source', type: 'radio', options: ['Parents', 'Scholarship', 'Part-time Work', 'Internship'] },
    { id: 'saves_monthly', title: 'Do you save money monthly?', type: 'radio', options: ['Yes', 'No'] },
  ],
  salaried_employee: [
    { id: 'monthly_salary', title: 'Monthly salary (take-home)', type: 'currency', placeholder: '65000' },
    { id: 'rent_status', title: 'Rent status', type: 'radio', options: ['Own House', 'Renting'] },
    { id: 'rent_amount', title: 'Rent amount', type: 'currency', showIf: (a) => a.rent_status === 'Renting', placeholder: '15000' },
    { id: 'commute', title: 'Commute', type: 'radio', options: ['Work From Home', 'Public Transport', 'Own Vehicle'] },
    { id: 'emi_type', title: 'Any EMIs?', type: 'radio', options: ['No', 'Home Loan', 'Car Loan', 'Personal Loan'] },
    { id: 'emi_amount', title: 'EMI amount', type: 'currency', showIf: (a) => a.emi_type && a.emi_type !== 'No', placeholder: '22000' },
    { id: 'insurance', title: 'Insurance', type: 'checkbox', options: ['Health', 'Life', 'None'], exclusive: 'None' },
    { id: 'investment_level', title: 'Investment experience', type: 'radio', options: ['Beginner', 'Intermediate', 'Experienced'] },
  ],
  business_owner: [
    { id: 'business_type', title: 'Business type', type: 'radio', options: ['Retail', 'Service', 'Manufacturing', 'Online Business'] },
    { id: 'monthly_revenue', title: 'Monthly revenue', type: 'currency', placeholder: '500000' },
    { id: 'monthly_expenses', title: 'Monthly business expenses', type: 'currency', placeholder: '300000' },
    { id: 'employees', title: 'Employees', type: 'radio', options: ['None', '1-5', '5-20', '20+'] },
    { id: 'accounting', title: 'Accounting method', type: 'radio', options: ['Manual', 'Excel', 'Accounting Software'] },
    { id: 'business_concerns', title: 'Biggest concerns', type: 'checkbox', options: ['Cash Flow', 'Revenue Growth', 'Inventory', 'Expenses', 'Taxes'] },
  ],
};

export function buildOnboardingFlow(personaId) {
  return [
    { id: 'persona', title: 'What best describes you?', type: 'radio', options: PERSONAS.map(p => p.label) },
    ...UNIVERSAL_STEPS,
    ...(PERSONA_STEPS[personaId] || PERSONA_STEPS.salaried_employee),
  ];
}

export function personaIdFromLabel(label) {
  return PERSONAS.find(p => p.label === label)?.id || 'salaried_employee';
}

export function personaLabelFromId(id) {
  return PERSONAS.find(p => p.id === id)?.label || 'Salaried employee';
}

export function visibleSteps(personaId, answers) {
  return buildOnboardingFlow(personaId).filter(step => {
    if (step.id === 'persona') return true;
    if (step.showIf && !step.showIf(answers)) return false;
    return true;
  });
}

export function isStepComplete(step, answers) {
  const val = answers[step.id];
  if (step.type === 'currency') return val != null && String(val).trim() !== '';
  if (step.type === 'checkbox') return Array.isArray(val) && val.length > 0;
  if (step.type === 'radio') return val != null && val !== '';
  return false;
}
