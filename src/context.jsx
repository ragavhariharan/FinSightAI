import { createContext, useContext, useState, useCallback } from 'react';
import { signUpWithEmail, signInWithEmail } from './lib/auth';

export const TRANSACTIONS = [
  { id:1,  date:'Jun 13, 2025', name:'Swiggy',               category:'Food & Dining', emoji:'🍔', account:'HDFC Savings', amount:-480   },
  { id:2,  date:'Jun 13, 2025', name:'Uber',                 category:'Transport',     emoji:'🚗', account:'HDFC Savings', amount:-220   },
  { id:3,  date:'Jun 12, 2025', name:'Salary — Infosys',     category:'Paychecks',     emoji:'💼', account:'HDFC Savings', amount:65000  },
  { id:4,  date:'Jun 12, 2025', name:'Amazon.in',            category:'Shopping',      emoji:'🛍', account:'ICICI Credit', amount:-2199  },
  { id:5,  date:'Jun 11, 2025', name:'HDFC Home Loan EMI',   category:'Housing',       emoji:'🏠', account:'HDFC Savings', amount:-22000 },
  { id:6,  date:'Jun 11, 2025', name:'Netflix',              category:'Entertainment', emoji:'🎬', account:'ICICI Credit', amount:-649   },
  { id:7,  date:'Jun 10, 2025', name:'BigBazaar Groceries',  category:'Groceries',     emoji:'🛒', account:'HDFC Savings', amount:-3200  },
  { id:8,  date:'Jun 10, 2025', name:'Airtel Broadband',     category:'Utilities',     emoji:'📡', account:'HDFC Savings', amount:-999   },
  { id:9,  date:'Jun 9, 2025',  name:'LIC Premium',          category:'Insurance',     emoji:'🛡', account:'HDFC Savings', amount:-3500  },
  { id:10, date:'Jun 9, 2025',  name:'Apollo Pharmacy',      category:'Health',        emoji:'💊', account:'HDFC Savings', amount:-680   },
  { id:11, date:'Jun 8, 2025',  name:'Cult.fit Membership',  category:'Fitness',       emoji:'💪', account:'ICICI Credit', amount:-1500  },
  { id:12, date:'Jun 8, 2025',  name:'Myntra',               category:'Shopping',      emoji:'👕', account:'ICICI Credit', amount:-3499  },
  { id:13, date:'Jun 7, 2025',  name:'BESCOM Electricity',   category:'Utilities',     emoji:'⚡', account:'HDFC Savings', amount:-2100  },
  { id:14, date:'Jun 7, 2025',  name:'Zomato',               category:'Food & Dining', emoji:'🍕', account:'HDFC Savings', amount:-550   },
  { id:15, date:'Jun 6, 2025',  name:'Rapido',               category:'Transport',     emoji:'🏍', account:'HDFC Savings', amount:-180   },
  { id:16, date:'Jun 5, 2025',  name:'HPCL Petrol',          category:'Transport',     emoji:'⛽', account:'HDFC Savings', amount:-2200  },
  { id:17, date:'Jun 4, 2025',  name:'Cafe Coffee Day',      category:'Food & Dining', emoji:'☕', account:'HDFC Savings', amount:-380   },
  { id:18, date:'Jun 3, 2025',  name:'Society Maintenance',  category:'Housing',       emoji:'🏢', account:'HDFC Savings', amount:-2000  },
];

export const MCQ_QUESTIONS = [
  { q:'How often do you receive income?',           opts:['Every day','Every week','Monthly (salary)','Irregularly'] },
  { q:'What best describes you?',                   opts:['Student','Salaried employee','Daily wage / gig worker','Business owner'] },
  { q:'What is your primary monthly expense?',      opts:['Rent or home loan EMI','Food and groceries','Education / tuition fees','Business costs'] },
  { q:'How do you currently manage money?',         opts:["I don't track at all","Mental notes only","Spreadsheet or diary","Another finance app"] },
  { q:'What would you most like FinSight to help with?', opts:['Save more each month','Understand where money goes','Plan for a big goal','Manage business finances'] },
];

export const PERSONA_SCRIPTS = {
  'Salaried employee': [
    "Hi! I am FinSight. Let's build your financial picture. What's your monthly take-home salary after tax?",
    "Got it. What are your fixed monthly commitments — rent, home loan EMI, or insurance?",
    "How much do you typically spend on food and groceries each month?",
    "Do you have any savings goals right now — an emergency fund, a big purchase, or retirement?",
    "Last one: roughly what percentage of your income do you manage to save each month?",
  ],
  'Student': [
    "Hi! I am FinSight. Let's set up your profile. What's your monthly allowance or part-time income?",
    "What are your biggest regular expenses — food delivery, rent, subscriptions?",
    "Do you have any regular bills you pay yourself, like your phone or internet?",
    "Any savings goals, even small ones — like building an emergency fund?",
    "Do you have any loans or credit card debt right now?",
  ],
  'Daily wage / gig worker': [
    "Hi! I am FinSight. On a good week, roughly how much do you earn?",
    "How much does your income vary week to week — a little, or a lot?",
    "What's your biggest regular expense each month?",
    "Do you have any savings set aside for slow weeks or emergencies?",
    "Any loans or informal debts you are repaying right now?",
  ],
  'Business owner': [
    "Hi! I am FinSight. Let's map your business finances. What's your typical monthly revenue?",
    "What are your main operating costs — rent, staff, inventory, or utilities?",
    "Do you keep personal and business finances separate?",
    "What's the biggest financial challenge in your business right now?",
    "Do you have any business loans or credit lines outstanding?",
  ],
};

export const INITIAL_BUDGETS = [
  { cat:'Housing',              icon:'🏠', spent:24000, limit:26000, color:'#0EA5E9' },
  { cat:'Food & Dining',        icon:'🍔', spent:7010,  limit:9000,  color:'#F59E0B' },
  { cat:'Shopping',             icon:'🛍', spent:5698,  limit:7000,  color:'#EC4899' },
  { cat:'Utilities & Insurance',icon:'⚡', spent:9099,  limit:10000, color:'#6366F1' },
  { cat:'Transport',            icon:'🚗', spent:2600,  limit:4000,  color:'#8B5CF6' },
  { cat:'Health & Fitness',     icon:'💪', spent:2180,  limit:3000,  color:'#EF4444' },
];

export function buildForecast() {
  const total = 18664;
  const raw = Array.from({ length:30 }, (_, i) => {
    const base = Math.round(total * (i / 29));
    const noise = Math.round(Math.sin(i * 1.1) * 420 + Math.cos(i * 0.75) * 280);
    return Math.max(0, base + noise);
  });
  raw[29] = total;
  const w = 560, h = 110, pad = 6;
  const max = Math.max(...raw) + 1200;
  const pts = raw.map((d, i) => ({ x:(i / 29) * w, y:h - pad - (d / max) * (h - pad * 2) }));
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(0) + ' ' + p.y.toFixed(0)).join(' ');
  const area = line + ' L ' + w + ' ' + h + ' L 0 ' + h + ' Z';
  return { line, area };
}

export function buildDonut() {
  const cats = [
    { name:'Housing',       amount:24000, color:'#0EA5E9' },
    { name:'Food & Dining', amount:7010,  color:'#F59E0B' },
    { name:'Shopping',      amount:5698,  color:'#EC4899' },
    { name:'Utilities',     amount:9099,  color:'#6366F1' },
    { name:'Transport',     amount:2600,  color:'#8B5CF6' },
    { name:'Health & Fitness', amount:2180, color:'#EF4444' },
  ];
  const total = cats.reduce((s, c) => s + c.amount, 0);
  const cx = 100, cy = 100, R = 78, r = 50;
  let a = -Math.PI / 2;
  return cats.map(c => {
    const da = (c.amount / total) * 2 * Math.PI;
    const ea = a + da;
    const g = 0.022;
    const sa = a + g, fa = ea - g;
    const large = (fa - sa) > Math.PI ? 1 : 0;
    const x1 = (cx + R * Math.cos(sa)).toFixed(1), y1 = (cy + R * Math.sin(sa)).toFixed(1);
    const x2 = (cx + R * Math.cos(fa)).toFixed(1), y2 = (cy + R * Math.sin(fa)).toFixed(1);
    const x3 = (cx + r * Math.cos(fa)).toFixed(1), y3 = (cy + r * Math.sin(fa)).toFixed(1);
    const x4 = (cx + r * Math.cos(sa)).toFixed(1), y4 = (cy + r * Math.sin(sa)).toFixed(1);
    const d = `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
    a = ea;
    return { ...c, d, pct:((c.amount / total) * 100).toFixed(1), totalStr:'₹' + c.amount.toLocaleString('en-IN') };
  });
}

export function buildGauge() {
  const score = 72, cx = 60, cy = 60, r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return { score, color:'#1A8A4A', circumference:circ.toFixed(1), dashOffset:offset.toFixed(1), transform:`rotate(-90 ${cx} ${cy})` };
}

export function getAIReply(q) {
  const ql = q.toLowerCase();
  if (ql.includes('overspend') || ql.includes('spend too'))
    return "Your biggest overspend this month is Shopping — ₹5,698 vs your ₹7,000 budget. You're also 40% above your food delivery average. Everything else is on track.";
  if (ql.includes('cut') || ql.includes('reduce') || ql.includes('save more'))
    return "Top 3 cuts: (1) Food delivery — cooking 2 more days/week saves ~₹320/month. (2) Impulse shopping — ₹5,698 vs ₹2,100 avg. (3) Review streaming subscriptions — you may have overlap.";
  if (ql.includes('forecast') || ql.includes('project'))
    return "At current pace you will save ₹18,664 in June — 28.7%. Skip one shopping trip and that rises to ₹22,000+. Want me to model a specific scenario?";
  if (ql.includes('health') || ql.includes('score'))
    return "Your Financial Health Score is 72/100. Strengths: stable income, low EMI-to-income ratio (34%), consistent bill payments. Gap: emergency fund is 1.4 months — target is 3 months.";
  if (ql.includes('afford') || ql.includes('can i buy') || ql.includes('can i get'))
    return "Running that scenario: a one-time ₹15,000 purchase would cut this month's savings to ~₹3,664 (5.6%). Your budget can absorb it, but you would be at your limit.";
  if (ql.includes('₹') || ql.includes('spent') || ql.includes('paid') || ql.includes('bought')) {
    const m = ql.match(/₹[\d,]+|\d{3,}/);
    const amt = m ? '₹' + m[0].replace('₹', '').replace(',', '') : 'that amount';
    return `Got it — logged ${amt} as an expense. Your Spending DNA and forecast have updated. Daily budget buffer is now ₹412.`;
  }
  return "Based on your Salaried employee profile, you're tracking well this month. The biggest opportunity is cutting impulse shopping. Want a detailed breakdown of any category?";
}

export function getTxGroups(txSearch) {
  const q = txSearch.toLowerCase();
  const filtered = q
    ? TRANSACTIONS.filter(t => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    : TRANSACTIONS;
  const map = {};
  filtered.forEach(t => {
    if (!map[t.date]) map[t.date] = { date:t.date, items:[] };
    map[t.date].items.push(t);
  });
  return Object.values(map).map(g => {
    const net = g.items.reduce((s, t) => s + t.amount, 0);
    return {
      ...g,
      totalStr: (net > 0 ? '+' : '') + '₹' + Math.abs(net).toLocaleString('en-IN'),
      items: g.items.map(t => ({
        ...t,
        amountStr: (t.amount > 0 ? '+' : '') + '₹' + Math.abs(t.amount).toLocaleString('en-IN'),
        amountColor: t.amount > 0 ? '#1A8A4A' : '#1A1A1A',
      })),
    };
  });
}

const AppContext = createContext({});

export function AppProvider({ children }) {
  const [state, setState] = useState({
    page:'landing',
    authMode:'signup',
    authEmail:'', authPassword:'', authName:'',
    mcqStep:0, mcqAnswers:{}, persona:'Salaried employee',
    chatMessages:[], chatInputVal:'', chatTyping:false, chatQuestionIndex:0,
    activeNav:'dashboard', showAI:true,
    aiMessages:[], aiInputVal:'', aiTyping:false,
    txSearch:'',
    budgets:INITIAL_BUDGETS,
    authLoading:false,
    authError:'',
  });

  const up = useCallback((patch) => setState(s => ({ ...s, ...patch })), []);

  function goTo(page, extra) { up({ page, ...(extra || {}) }); }

  function startChat(persona) {
    const scripts = PERSONA_SCRIPTS[persona] || PERSONA_SCRIPTS['Salaried employee'];
    up({ page:'onboarding-chat', chatMessages:[], chatQuestionIndex:0, chatTyping:true, persona });
    setTimeout(() => up({ chatMessages:[{ role:'ai', text:scripts[0] }], chatTyping:false }), 900);
  }

  function selectMCQOption(idx) {
    const { mcqStep, mcqAnswers } = state;
    const updated = { ...mcqAnswers, [mcqStep]:idx };
    if (mcqStep === MCQ_QUESTIONS.length - 1) {
      const p = MCQ_QUESTIONS[1].opts[updated[1]] || 'Salaried employee';
      up({ mcqAnswers:updated, persona:p });
      setTimeout(() => startChat(p), 350);
    } else {
      up({ mcqAnswers:updated, mcqStep:mcqStep + 1 });
    }
  }

  function sendChatMessage() {
    const { chatInputVal, chatMessages, chatQuestionIndex, persona } = state;
    if (!chatInputVal.trim()) return;
    const scripts = PERSONA_SCRIPTS[persona] || PERSONA_SCRIPTS['Salaried employee'];
    const msgs = [...chatMessages, { role:'user', text:chatInputVal }];
    up({ chatMessages:msgs, chatInputVal:'', chatTyping:true });
    const next = chatQuestionIndex + 1;
    if (next >= scripts.length) {
      setTimeout(() => {
        const final = [...msgs, { role:'ai', text:"Perfect! I have a clear picture of your finances. Setting up your personalized dashboard now..." }];
        up({ chatMessages:final, chatTyping:false, chatQuestionIndex:next });
        setTimeout(() => {
          up({ page:'app', activeNav:'dashboard', aiMessages:[{ role:'ai', text:`Welcome! Your ${persona} profile is live. Ask me anything about your finances, or just tell me about a transaction.` }] });
        }, 1600);
      }, 1100);
    } else {
      setTimeout(() => {
        up({ chatMessages:[...msgs, { role:'ai', text:scripts[next] }], chatTyping:false, chatQuestionIndex:next });
      }, 1100);
    }
  }

  function sendAIMessage(text) {
    const txt = text || state.aiInputVal;
    if (!txt || !txt.trim()) return;
    const msgs = [...state.aiMessages, { role:'user', text:txt }];
    up({ aiMessages:msgs, aiInputVal:'', aiTyping:true });
    const reply = getAIReply(txt);
    setTimeout(() => up({ aiMessages:[...msgs, { role:'ai', text:reply }], aiTyping:false }), 900 + Math.random() * 400);
  }

  function tryDemo() {
    up({
      page:'app', activeNav:'dashboard', persona:'Salaried employee',
      aiMessages:[{ role:'ai', text:"Welcome to FinSight demo! Your Salaried employee profile is loaded. Try asking 'what can I cut?' or type 'I spent ₹500 on groceries' to see the AI in action." }]
    });
  }

  async function submitAuth(e) {
    e.preventDefault();
    const { authMode, authEmail, authPassword, authName } = state;
    up({ authLoading:true, authError:'' });
    try {
      if (authMode === 'signup') {
        await signUpWithEmail({ email:authEmail, password:authPassword, fullName:authName });
      } else {
        await signInWithEmail({ email:authEmail, password:authPassword });
      }
      goTo('onboarding-mcq', { mcqStep:0, mcqAnswers:{} });
    } catch (err) {
      up({ authError: err.message || 'Authentication failed' });
    } finally {
      up({ authLoading:false });
    }
  }

  const value = { state, up, goTo, startChat, selectMCQOption, sendChatMessage, sendAIMessage, tryDemo, submitAuth };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
