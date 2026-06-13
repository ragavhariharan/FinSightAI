import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { signUpWithEmail, signInWithEmail, signOut, resolveSessionState, getProfile } from './lib/auth';
import { supabase, PERSONA_LABEL_TO_DB } from './lib/supabase';
import { PUBLIC_PAGES, emptyAuthState } from './lib/routing';
import { saveOnboardingCache, loadOnboardingCache, clearOnboardingCache, mergeWithCache } from './lib/onboardingCache';

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
    authInitializing:true,
    user:null,
    fullName:'',
    avatarInitials:'U',
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
    isDemoMode:false,
  });

  const up = useCallback((patch) => setState(s => ({ ...s, ...patch })), []);
  const signingOutRef = useRef(false);
  const demoModeRef = useRef(false);
  const seedingDemoRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  async function fetchOnboardingChat(userId, persona, dataPath) {
    try {
      const { data, error } = await supabase
        .from('onboarding_chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const msgs = data.map(m => ({
          role: m.role === 'assistant' ? 'ai' : 'user',
          text: m.content
        }));
        
        const lastAIChat = [...data].reverse().find(m => m.role === 'assistant');
        const qIndex = lastAIChat ? lastAIChat.question_index : 0;
        
        return { chatMessages: msgs, chatQuestionIndex: qIndex };
      }
    } catch (err) {
      console.error('Error fetching onboarding chat messages:', err);
    }
    
    const scripts = PERSONA_SCRIPTS[persona] || PERSONA_SCRIPTS['Salaried employee'];
    const isUpload = dataPath === 'upload';
    const initialText = isUpload 
      ? `I see you uploaded your bank statement. Let's verify a few details. ${scripts[0]}` 
      : scripts[0];
      
    return {
      chatMessages: [{ role: 'ai', text: initialText }],
      chatQuestionIndex: 0
    };
  }

  // Session listener — single source of truth for auth routing
  useEffect(() => {
    let mounted = true;

    async function applySession(session, event) {
      if (!mounted) return;

      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // During sign-out or demo seeding, ignore session events
      if ((signingOutRef.current || seedingDemoRef.current) && session) return;

      // Demo mode — no real session, keep demo dashboard
      if (!session && demoModeRef.current) {
        setState(s => ({ ...s, authInitializing: false }));
        return;
      }

      if (!session) {
        demoModeRef.current = false;
        setState(s => ({
          ...s,
          ...emptyAuthState('landing'),
          authInitializing: false,
          budgets: INITIAL_BUDGETS,
        }));
        return;
      }

      // Real login clears demo mode
      demoModeRef.current = false;

      // Avoid overwriting active onboarding page/state if session is already established for the same user.
      // Exception: if we are on onboarding-chat with an empty messages list, fall through to restore from DB.
      if (stateRef.current && stateRef.current.user && stateRef.current.user.id === session.user.id) {
        const cur = stateRef.current;
        const needsChatRestore = cur.page === 'onboarding-chat' && cur.chatMessages.length === 0;
        if (!needsChatRestore) {
          setState(s => ({
            ...s,
            user: session.user,
            authInitializing: false,
            authLoading: false,
          }));
          return;
        }
        // Fall through to re-fetch chatMessages from DB
      }

      const rawRoute = await resolveSessionState(session);
      if (!mounted || signingOutRef.current) return;

      // Merge DB route with localStorage cache — if profile row was missing,
      // the cache preserves the user's actual progress (MCQ step, page, persona).
      const route = mergeWithCache(session.user.id, rawRoute, rawRoute.profileMissing);

      let chatPatch = {};
      if (route.page === 'onboarding-chat') {
        try {
          const profile = await getProfile(session.user.id);
          chatPatch = await fetchOnboardingChat(session.user.id, route.persona, profile.onboarding_data_path);
        } catch {
          // Profile row missing — fetchOnboardingChat will use the fallback initial message
          chatPatch = await fetchOnboardingChat(session.user.id, route.persona, 'skip');
        }
      }

      setState(s => ({
        ...s,
        ...route,
        ...chatPatch,
        authInitializing: false,
        authLoading: false,
        budgets: INITIAL_BUDGETS,
      }));
    }


    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      applySession(session, event);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function goTo(page, extra = {}) {
    setState(s => {
      // Logged-in users cannot browse landing/auth without signing out
      if (s.user && PUBLIC_PAGES.includes(page)) return s;
      // Logged-out users cannot access app/onboarding without auth (except demo)
      if (!s.user && !s.isDemoMode && !PUBLIC_PAGES.includes(page)) {
        return { ...s, page: 'auth', authMode: 'signup', ...extra };
      }
      return { ...s, page, ...extra };
    });
  }

  function startChat(persona) {
    const scripts = PERSONA_SCRIPTS[persona] || PERSONA_SCRIPTS['Salaried employee'];
    up({ page:'onboarding-chat', chatMessages:[], chatQuestionIndex:0, chatTyping:true, persona });
    setTimeout(() => up({ chatMessages:[{ role:'ai', text:scripts[0] }], chatTyping:false }), 900);
  }

  function selectMCQOption(idx) {
    const { mcqStep, mcqAnswers, user } = state;
    const updated = { ...mcqAnswers, [mcqStep]:idx };
    if (mcqStep === MCQ_QUESTIONS.length - 1) {
      const p = MCQ_QUESTIONS[1].opts[updated[1]] || 'Salaried employee';
      up({ mcqAnswers:updated, persona:p });

      // Save checkpoint: MCQ done, moving to data-choice
      if (user) {
        saveOnboardingCache(user.id, { page: 'onboarding-data-choice', mcqStep: MCQ_QUESTIONS.length, mcqAnswers: updated, persona: p, chatQuestionIndex: 0 });
        supabase.from('profiles').update({
          mcq_answers: updated,
          persona: PERSONA_LABEL_TO_DB[p] || 'salaried_employee',
          onboarding_status: 'data_choice_pending',
        }).eq('id', user.id).then(({ error }) => {
          if (error) console.error('Error updating profile:', error);
        });
      }
      goTo('onboarding-data-choice');
    } else {
      up({ mcqAnswers:updated, mcqStep:mcqStep + 1 });

      // Save checkpoint: mid-MCQ
      if (user) {
        saveOnboardingCache(user.id, { page: 'onboarding-mcq', mcqStep: mcqStep + 1, mcqAnswers: updated, persona: state.persona, chatQuestionIndex: 0 });
        supabase.from('profiles').update({
          mcq_answers: updated,
          onboarding_status: 'mcq_in_progress',
        }).eq('id', user.id).then(({ error }) => {
          if (error) console.error('Error updating profile:', error);
        });
      }
    }
  }

  async function skipStatementUpload() {
    const { user } = state;
    up({ authLoading: true, authError: '' });
    try {
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            onboarding_data_path: 'skip',
            onboarding_status: 'chat_in_progress',
          })
          .eq('id', user.id);
        if (error) throw error;
      }
      const p = state.persona || 'Salaried employee';
      const scripts = PERSONA_SCRIPTS[p] || PERSONA_SCRIPTS['Salaried employee'];
      const firstMsg = { role: 'ai', text: scripts[0] };

      // Save first AI message to DB so page-refresh can restore it
      if (user) {
        await supabase.from('onboarding_chat_messages').delete().eq('user_id', user.id);
        await supabase.from('onboarding_chat_messages').insert({
          user_id: user.id, role: 'assistant', content: firstMsg.text, question_index: 0
        });
        // Save checkpoint so reload returns to chat page, not quiz step 0
        saveOnboardingCache(user.id, { page: 'onboarding-chat', mcqStep: MCQ_QUESTIONS.length, mcqAnswers: state.mcqAnswers, persona: p, chatQuestionIndex: 0 });
      }

      // Show typing indicator briefly then reveal first message — no blank screen
      up({ authLoading: false, page: 'onboarding-chat', chatMessages: [], chatQuestionIndex: 0, chatTyping: true, persona: p });
      setTimeout(() => up({ chatMessages: [firstMsg], chatTyping: false }), 500);
      return; // skip finally's authLoading reset since we already cleared it
    } catch (err) {
      console.error('Error skipping upload:', err);
      up({ authError: err.message || 'Failed to update onboarding flow.' });
    }
    up({ authLoading: false });
  }

  async function handleStatementUpload(file) {
    const { user } = state;
    console.log('CSV file selected for onboarding data:', file);
    up({ authLoading: true, authError: '' });
    try {
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            onboarding_data_path: 'upload',
            onboarding_status: 'chat_in_progress',
          })
          .eq('id', user.id);
        if (error) throw error;
      }
      const p = state.persona || 'Salaried employee';
      const scripts = PERSONA_SCRIPTS[p] || PERSONA_SCRIPTS['Salaried employee'];
      const firstText = `I see you uploaded your bank statement. Let's verify a few details. ${scripts[0]}`;
      const firstMsg = { role: 'ai', text: firstText };

      // Save first AI message to DB so page-refresh can restore it
      if (user) {
        await supabase.from('onboarding_chat_messages').delete().eq('user_id', user.id);
        await supabase.from('onboarding_chat_messages').insert({
          user_id: user.id, role: 'assistant', content: firstText, question_index: 0
        });
        // Save checkpoint so reload returns to chat page, not quiz step 0
        saveOnboardingCache(user.id, { page: 'onboarding-chat', mcqStep: MCQ_QUESTIONS.length, mcqAnswers: state.mcqAnswers, persona: p, chatQuestionIndex: 0 });
      }

      up({ authLoading: false, page: 'onboarding-chat', chatMessages: [], chatQuestionIndex: 0, chatTyping: true, persona: p });
      setTimeout(() => up({ chatMessages: [firstMsg], chatTyping: false }), 500);
      return;
    } catch (err) {
      console.error('Error handling statement upload:', err);
      up({ authError: err.message || 'Failed to initialize database with statement.' });
    }
    up({ authLoading: false });
  }

  function sendChatMessage() {
    const { chatInputVal, chatMessages, chatQuestionIndex, persona, user } = state;
    if (!chatInputVal.trim()) return;
    const scripts = PERSONA_SCRIPTS[persona] || PERSONA_SCRIPTS['Salaried employee'];
    const userMsg = { role: 'user', text: chatInputVal };
    const msgs = [...chatMessages, userMsg];
    up({ chatMessages: msgs, chatInputVal: '', chatTyping: true });

    // Persist user message to DB
    if (user) {
      supabase.from('onboarding_chat_messages').insert({
        user_id: user.id, role: 'user', content: chatInputVal, question_index: chatQuestionIndex
      }).then(({ error }) => { if (error) console.warn('Chat save error:', error); });
    }

    const next = chatQuestionIndex + 1;
    if (next >= scripts.length) {
      const finalText = "Perfect! I have a clear picture of your finances. Setting up your personalized dashboard now...";
      setTimeout(() => {
        const final = [...msgs, { role: 'ai', text: finalText }];
        up({ chatMessages: final, chatTyping: false, chatQuestionIndex: next });

        // Persist final AI message
        if (user) {
          supabase.from('onboarding_chat_messages').insert({
            user_id: user.id, role: 'assistant', content: finalText, question_index: next
          }).then(({ error }) => { if (error) console.warn('Chat save error:', error); });
        }

        setTimeout(() => {
          if (user) {
            supabase.from('profiles').update({ onboarding_status: 'complete' }).eq('id', user.id);
            clearOnboardingCache(user.id); // onboarding done — remove local checkpoint
          }
          up({ page: 'app', activeNav: 'dashboard', aiMessages: [{ role: 'ai', text: `Welcome! Your ${persona} profile is live. Ask me anything about your finances, or just tell me about a transaction.` }] });
        }, 1600);
      }, 1100);
    } else {
      const aiReply = scripts[next];
      setTimeout(() => {
        up({ chatMessages: [...msgs, { role: 'ai', text: aiReply }], chatTyping: false, chatQuestionIndex: next });

        // Persist AI reply
        if (user) {
          supabase.from('onboarding_chat_messages').insert({
            user_id: user.id, role: 'assistant', content: aiReply, question_index: next
          }).then(({ error }) => { if (error) console.warn('Chat save error:', error); });
        }
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

  async function tryDemo() {
    if (state.user) {
      signingOutRef.current = true;
      try {
        await signOut();
      } catch { /* continue into demo */ }
      signingOutRef.current = false;
    }
    
    seedingDemoRef.current = true;
    demoModeRef.current = false;
    up({ authLoading: true, authError: '' });
    const email = 'demo@finsight.app';
    const password = 'DemoUser123!';
    const fullName = 'Arjun Kumar';

    try {
      let { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (signUpError) throw signUpError;
          data = signUpData;
        } else {
          throw error;
        }
      }

      const userId = data.user.id;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_demo: true,
          persona: 'salaried_employee',
          onboarding_status: 'complete',
          onboarding_data_path: 'demo'
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;

      if (count === 0) {
        const dateMap = {
          'Jun 13, 2025': '2026-06-13',
          'Jun 12, 2025': '2026-06-12',
          'Jun 11, 2025': '2026-06-11',
          'Jun 10, 2025': '2026-06-10',
          'Jun 9, 2025':  '2026-06-09',
          'Jun 8, 2025':  '2026-06-08',
          'Jun 7, 2025':  '2026-06-07',
          'Jun 6, 2025':  '2026-06-06',
          'Jun 5, 2025':  '2026-06-05',
          'Jun 4, 2025':  '2026-06-04',
          'Jun 3, 2025':  '2026-06-03',
        };

        const seededTxns = TRANSACTIONS.map(tx => {
          const dateStr = dateMap[tx.date] || '2026-06-13';
          let sType = 'flexible';
          if (['Housing', 'Utilities', 'Insurance', 'Groceries'].includes(tx.category)) sType = 'routine';
          else if (['Food & Dining', 'Transport', 'Health', 'Fitness'].includes(tx.category)) sType = 'flexible';
          else sType = 'impulse';

          return {
            user_id: userId,
            txn_date: dateStr,
            name: tx.name,
            category: tx.category,
            emoji: tx.emoji,
            account: tx.account,
            amount: tx.amount,
            source: 'seed',
            spending_type: sType
          };
        });

        const { error: seedError } = await supabase
          .from('transactions')
          .insert(seededTxns);

        if (seedError) throw seedError;

        const defaultBudgets = [
          { user_id: userId, category:'Housing',              icon:'🏠', limit_amount:26000, month:'2026-06-01', color:'#0EA5E9' },
          { user_id: userId, category:'Food & Dining',        icon:'🍔', limit_amount:9000,  month:'2026-06-01', color:'#F59E0B' },
          { user_id: userId, category:'Shopping',             icon:'🛍', limit_amount:7000,  month:'2026-06-01', color:'#EC4899' },
          { user_id: userId, category:'Utilities & Insurance',icon:'⚡', limit_amount:10000, month:'2026-06-01', color:'#6366F1' },
          { user_id: userId, category:'Transport',            icon:'🚗', limit_amount:4000,  month:'2026-06-01', color:'#8B5CF6' },
          { user_id: userId, category:'Health & Fitness',     icon:'💪', limit_amount:3000,  month:'2026-06-01', color:'#EF4444' },
        ];

        const { error: budgetError } = await supabase
          .from('budgets')
          .insert(defaultBudgets);

        if (budgetError) throw budgetError;
      }

      seedingDemoRef.current = false;
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        const patch = await resolveSessionState(currentSession);
        setState(s => ({
          ...s,
          ...patch,
          user: currentSession.user,
          authInitializing: false,
          authLoading: false
        }));
      }
    } catch (err) {
      seedingDemoRef.current = false;
      console.error('Demo login error:', err);
      up({ authError: err.message || 'Demo login failed' });
    } finally {
      up({ authLoading: false });
    }
  }


  async function submitAuth(e) {
    e.preventDefault();
    const { authMode, authEmail, authPassword, authName } = state;
    demoModeRef.current = false;
    up({ authLoading: true, authError: '' });
    try {
      if (authMode === 'signup') {
        const data = await signUpWithEmail({ email: authEmail, password: authPassword, fullName: authName });
        if (!data.session) {
          up({
            authLoading: false,
            authError: 'Account created! Check your email to confirm, then sign in.',
          });
          return;
        }
      } else {
        await signInWithEmail({ email: authEmail, password: authPassword });
      }
      // onAuthStateChange handles routing
    } catch (err) {
      up({ authError: err.message || 'Authentication failed', authLoading: false });
    }
  }

  async function handleSignOut() {
    if (state.isDemoMode) {
      demoModeRef.current = false;
      up({ ...emptyAuthState('landing'), budgets: INITIAL_BUDGETS });
      return;
    }
    signingOutRef.current = true;
    demoModeRef.current = false;
    if (state.user) {
      clearOnboardingCache(state.user.id);
    }
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      signingOutRef.current = false;
    }
    setState(s => ({
      ...s,
      ...emptyAuthState('landing'),
      authInitializing: false,
      budgets: INITIAL_BUDGETS,
    }));
  }

  const value = { state, up, goTo, startChat, selectMCQOption, sendChatMessage, sendAIMessage, tryDemo, submitAuth, handleSignOut, skipStatementUpload, handleStatementUpload };


  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
