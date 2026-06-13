import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { signUpWithEmail, signInWithEmail, signOut, resolveSessionState } from './lib/auth';
import { supabase, PERSONA_LABEL_TO_DB } from './lib/supabase';
import { PUBLIC_PAGES, demoAppState, emptyAuthState } from './lib/routing';
import { loadAppData, clearDemoSession } from './lib/data';
import { sendCopilotMessage, getLocalCopilotResponse } from './lib/api/copilot';
import { completeOnboarding } from './lib/api/onboarding';
import { formatAuthError } from './lib/formatAuthError';
import { loadSettings, saveSettings, applyTheme, applyLayoutWidths } from './lib/settings';
import { groupTransactions, mapTransactionRow } from './lib/format';
import { recordTransaction, undoTransaction } from './lib/transactionFlow';

const COPILOT_SESSION_KEY = 'finsight_copilot_msgs';

function copilotWelcome(persona, fullName) {
  const first = (fullName || '').split(' ')[0];
  return `Hi${first ? ` ${first}` : ''}! I'm your FinSight copilot. Log transactions or ask about your ${persona || 'finances'}.`;
}

function loadCopilotFromSession(persona, fullName) {
  try {
    const raw = sessionStorage.getItem(COPILOT_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [{ role: 'ai', text: copilotWelcome(persona, fullName) }];
}

function saveCopilotToSession(msgs) {
  try {
    sessionStorage.setItem(COPILOT_SESSION_KEY, JSON.stringify(msgs));
  } catch { /* ignore */ }
}

const AppContext = createContext({});

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const settings = loadSettings();
    applyTheme(settings.theme);
    applyLayoutWidths(settings.sidebarWidth, settings.aiPanelWidth);
    return {
    page:'landing',
    authInitializing:true,
    user:null,
    fullName:'',
    avatarInitials:'U',
    authMode:'signup',
    authEmail:'', authPassword:'', authName:'',
    mcqStep:0, mcqAnswers:{}, persona:'Salaried employee',
    onboardingStep: 0,
    questionnaire: {},
    activeNav:'dashboard', showAI:true,
    aiMessages:[], aiInputVal:'', aiTyping:false,
    txSearch:'',
    transactions:[],
    budgets:[],
    snapshot:null,
    dataLoading:false,
    authLoading:false,
    authError:'',
    isDemoMode:false,
    settings,
  };
  });

  const up = useCallback((patch) => setState(s => ({ ...s, ...patch })), []);
  const signingOutRef = useRef(false);
  const demoModeRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const refreshAppData = useCallback(async () => {
    const s = stateRef.current;
    if (!s.user && !s.isDemoMode) return;
    up({ dataLoading: true });
    try {
      const data = await loadAppData(s.isDemoMode);
      up({ ...data, dataLoading: false });
    } catch (err) {
      console.error(err);
      up({ dataLoading: false });
    }
  }, [up]);

  useEffect(() => {
    let mounted = true;

    async function applySession(session) {
      if (!mounted) return;
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      if (signingOutRef.current && session) return;
      if (!session && demoModeRef.current) {
        setState(s => ({ ...s, authInitializing: false }));
        return;
      }
      if (!session) {
        demoModeRef.current = false;
        setState(s => ({ ...s, ...emptyAuthState('landing'), authInitializing: false, transactions: [], budgets: [], snapshot: null }));
        return;
      }
      demoModeRef.current = false;
      const route = await resolveSessionState(session);
      if (!mounted || signingOutRef.current) return;
      setState(s => ({ ...s, ...route, authInitializing: false, authLoading: false, transactions: [], budgets: [], snapshot: null }));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (state.page === 'app' && (state.user || state.isDemoMode)) {
      refreshAppData();
      const welcome = loadCopilotFromSession(state.persona, state.fullName);
      up({ aiMessages: welcome });
    }
  }, [state.page, state.user, state.isDemoMode, refreshAppData, up]);

  function goTo(page, extra = {}) {
    setState(s => {
      if (s.user && PUBLIC_PAGES.includes(page)) return s;
      if (!s.user && !s.isDemoMode && !PUBLIC_PAGES.includes(page)) {
        return { ...s, page: 'auth', authMode: 'signup', ...extra };
      }
      return { ...s, page, ...extra };
    });
  }

  function updateSettings(patch) {
    const next = saveSettings(patch);
    up({ settings: next });
  }

  function setSidebarWidth(w) {
    updateSettings({ sidebarWidth: w });
  }

  function setAiPanelWidth(w) {
    updateSettings({ aiPanelWidth: w });
  }

  function submitOnboardingStep(step) {
    up({ onboardingStep: step });
    const { user, questionnaire } = stateRef.current;
    if (user) {
      supabase.from('profiles').update({
        mcq_answers: questionnaire,
        onboarding_status: 'mcq_in_progress',
      }).eq('id', user.id);
    }
  }

  async function finishQuestionnaire() {
    const { user, questionnaire } = stateRef.current;
    const personaLabel = questionnaire.persona || stateRef.current.persona;
    const personaDb = PERSONA_LABEL_TO_DB[personaLabel] || 'salaried_employee';
    up({
      persona: personaLabel,
      page: 'app',
      activeNav: 'dashboard',
      aiMessages: loadCopilotFromSession(personaLabel, stateRef.current.fullName),
    });
    saveCopilotToSession(loadCopilotFromSession(personaLabel, stateRef.current.fullName));
    if (user) {
      await completeOnboarding(user.id, personaLabel);
      await supabase.from('profiles').update({
        mcq_answers: questionnaire,
        persona: personaDb,
        onboarding_status: 'complete',
      }).eq('id', user.id);
    }
    await refreshAppData();
  }

  async function finishOnboarding(persona, answers) {
    finishQuestionnaire();
  }

  async function sendAIMessage(text) {
    const txt = text || stateRef.current.aiInputVal;
    if (!txt?.trim()) return;
    if (stateRef.current.isDemoMode) {
      const msgs = [...stateRef.current.aiMessages, { role:'user', text: txt }];
      up({ aiMessages: msgs, aiInputVal: '', aiTyping: true });
      await new Promise(r => setTimeout(r, 450));
      const { reply, createdTx, tx } = getLocalCopilotResponse(txt, stateRef.current.snapshot);
      const patch = { aiMessages: [...msgs, { role:'ai', text: reply }], aiTyping: false };
      saveCopilotToSession(patch.aiMessages);
      if (createdTx && tx) {
        await recordTransaction({
          isDemoMode: true,
          state: stateRef.current,
          up,
          payload: {
            name: tx.name,
            amount: tx.amount,
            category: tx.category,
            emoji: tx.emoji,
            isRecurring: tx.isRecurring,
            source: 'chat',
          },
        });
        const msgs2 = [...msgs, { role: 'ai', text: reply }];
        up({ aiMessages: msgs2, aiTyping: false });
        saveCopilotToSession(msgs2);
        return;
      }
      up(patch);
      return;
    }
    const msgs = [...stateRef.current.aiMessages, { role:'user', text: txt }];
    up({ aiMessages: msgs, aiInputVal: '', aiTyping: true });
    try {
      const { reply, snapshot, createdTx } = await sendCopilotMessage(txt, stateRef.current.snapshot);
      up({ aiMessages: [...msgs, { role:'ai', text: reply }], aiTyping: false, snapshot: snapshot || stateRef.current.snapshot });
      saveCopilotToSession([...msgs, { role:'ai', text: reply }]);
      if (createdTx) await refreshAppData();
    } catch (err) {
      up({ aiMessages: [...msgs, { role:'ai', text: 'Sorry, something went wrong. Try again.' }], aiTyping: false });
      saveCopilotToSession([...msgs, { role:'ai', text: 'Sorry, something went wrong. Try again.' }]);
    }
  }

  async function tryDemo() {
    if (stateRef.current.user) {
      signingOutRef.current = true;
      try { await signOut(); } catch { /* ok */ }
      signingOutRef.current = false;
    }
    demoModeRef.current = true;
    clearDemoSession();
    const demo = demoAppState();
    up({ ...demo, budgets: [], transactions: [], snapshot: null });
    up({ page: 'app' });
    setTimeout(() => refreshAppData(), 0);
  }

  async function submitAuth(e) {
    e.preventDefault();
    const { authMode, authEmail, authPassword, authName } = stateRef.current;
    demoModeRef.current = false;
    up({ authLoading: true, authError: '' });
    try {
      if (authMode === 'signup') {
        const data = await signUpWithEmail({ email: authEmail, password: authPassword, fullName: authName });
        if (!data.session) {
          up({ authLoading: false, authError: 'Account created! Check your email to confirm, then sign in.' });
          return;
        }
      } else {
        await signInWithEmail({ email: authEmail, password: authPassword });
      }
    } catch (err) {
      up({ authError: formatAuthError(err), authLoading: false });
    }
  }

  async function handleSignOut() {
    if (stateRef.current.isDemoMode) {
      demoModeRef.current = false;
      clearDemoSession();
      up({ ...emptyAuthState('landing'), transactions: [], budgets: [], snapshot: null });
      return;
    }
    signingOutRef.current = true;
    demoModeRef.current = false;
    try { await signOut(); } catch (err) { console.error(err); }
    finally { signingOutRef.current = false; }
    setState(s => ({ ...s, ...emptyAuthState('landing'), authInitializing: false, transactions: [], budgets: [], snapshot: null }));
  }

  async function addTransaction(payload) {
    return recordTransaction({
      isDemoMode: stateRef.current.isDemoMode,
      state: stateRef.current,
      up,
      refreshAppData,
      payload,
    });
  }

  async function removeTransaction(id) {
    const tx = stateRef.current.transactions.find(t => t.id === id);
    await undoTransaction({
      isDemoMode: stateRef.current.isDemoMode,
      state: stateRef.current,
      up,
      refreshAppData,
      tx,
    });
  }

  const value = {
    state, up, goTo, submitOnboardingStep, finishQuestionnaire, sendAIMessage,
    tryDemo, submitAuth, handleSignOut, refreshAppData, addTransaction, removeTransaction,
    updateSettings, setSidebarWidth, setAiPanelWidth,
    getTxGroups: (search) => groupTransactions(stateRef.current.transactions, search),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
