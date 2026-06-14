import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { signUpWithEmail, signInWithEmail, signOut, resolveSessionState } from './lib/auth';
import { supabase, PERSONA_LABEL_TO_DB } from './lib/supabase';
import { PUBLIC_PAGES, emptyAuthState } from './lib/routing';
import { loadAppData } from './lib/data';
import { sendCopilotMessage } from './lib/api/copilot';
import { completeOnboarding } from './lib/api/onboarding';
import { formatAuthError } from './lib/formatAuthError';
import { loadSettings, saveSettings, resetSettings, applyTheme, applyLayoutWidths, watchSystemTheme, initialsFromName } from './lib/settings';
import { ASSISTANT_NAME } from './lib/assistant';
import { viewFromPathname, syncUrl, readStoredShowAI, storeShowAI, APP_VIEWS } from './lib/appRoute';
import { groupTransactions } from './lib/format';
import { recordTransaction, undoTransaction } from './lib/transactionFlow';

const COPILOT_SESSION_KEY = 'finsight_copilot_msgs';
const COPILOT_OWNER_KEY = 'finsight_copilot_owner';

function copilotWelcome(persona, fullName) {
  const first = (fullName || '').split(' ')[0];
  return `Hi${first ? ` ${first}` : ''}! I'm ${ASSISTANT_NAME}. Log a transaction or ask me anything about your ${persona || 'finances'}.`;
}

function copilotOwnerId(user) {
  return user?.id || null;
}

function freshCopilotMessages(persona, fullName) {
  return [{ role: 'ai', text: copilotWelcome(persona, fullName) }];
}

function loadCopilotFromSession(persona, fullName, ownerId) {
  if (!ownerId) return freshCopilotMessages(persona, fullName);
  try {
    const storedOwner = sessionStorage.getItem(COPILOT_OWNER_KEY);
    if (storedOwner !== ownerId) return freshCopilotMessages(persona, fullName);
    const raw = sessionStorage.getItem(COPILOT_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return freshCopilotMessages(persona, fullName);
}

function saveCopilotToSession(msgs, ownerId) {
  if (!ownerId) return;
  try {
    sessionStorage.setItem(COPILOT_OWNER_KEY, ownerId);
    sessionStorage.setItem(COPILOT_SESSION_KEY, JSON.stringify(msgs));
  } catch { /* ignore */ }
}

function clearCopilotSession() {
  try {
    sessionStorage.removeItem(COPILOT_SESSION_KEY);
    sessionStorage.removeItem(COPILOT_OWNER_KEY);
  } catch { /* ignore */ }
}

const AppContext = createContext({});

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const settings = loadSettings();
    applyTheme(settings.theme);
    applyLayoutWidths(settings.sidebarWidth, settings.aiPanelWidth);
    const urlRoute = typeof window !== 'undefined' ? viewFromPathname() : { page: 'landing', view: 'dashboard' };
    const storedShowAI = readStoredShowAI();
    return {
      page: urlRoute.page === 'auth' ? 'auth' : 'landing',
      authInitializing: true,
      user: null,
      fullName: '',
      avatarInitials: 'U',
      authMode: 'signup',
      authEmail: '', authPassword: '', authName: '',
      mcqStep: 0, mcqAnswers: {}, persona: 'Salaried employee',
      onboardingStep: 0,
      questionnaire: {},
      activeNav: urlRoute.view || 'dashboard',
      showAI: storedShowAI ?? false,
      aiMessages: [], aiInputVal: '', aiTyping: false,
      txSearch: '',
      transactions: [],
      budgets: [],
      snapshot: null,
      dataLoading: false,
      authLoading: false,
      authError: '',
      settings,
    };
  });

  const up = useCallback((patch) => setState(s => ({ ...s, ...patch })), []);
  const signingOutRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const refreshAppData = useCallback(async () => {
    const s = stateRef.current;
    if (!s.user) return;
    up({ dataLoading: true });
    try {
      const data = await loadAppData();
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
        const path = window.location.pathname || '/dashboard';
        window.history.replaceState(null, '', path);
      }
      if (signingOutRef.current && session) return;
      if (!session) {
        clearCopilotSession();
        const urlRoute = viewFromPathname();
        const page = urlRoute.page === 'auth' ? 'auth' : 'landing';
        setState(s => ({ ...s, ...emptyAuthState(page), authInitializing: false, transactions: [], budgets: [], snapshot: null }));
        syncUrl(page, 'dashboard');
        return;
      }
      const route = await resolveSessionState(session);
      if (!mounted || signingOutRef.current) return;
      const urlRoute = viewFromPathname();
      const activeNav = route.page === 'app' && APP_VIEWS.includes(urlRoute.view)
        ? urlRoute.view
        : 'dashboard';
      const ownerId = session.user.id;
      const aiMessages = route.page === 'app'
        ? loadCopilotFromSession(route.persona || 'Salaried employee', route.fullName || '', ownerId)
        : [];
      setState(s => ({
        ...s,
        ...route,
        activeNav: route.page === 'app' ? activeNav : s.activeNav,
        authInitializing: false,
        authLoading: false,
        transactions: [],
        budgets: [],
        snapshot: null,
        aiMessages,
        aiInputVal: '',
        aiTyping: false,
      }));
      if (route.page) syncUrl(route.page, route.page === 'app' ? activeNav : 'dashboard');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (state.authInitializing) return;
    const urlRoute = viewFromPathname();
    if (state.page !== 'app' && urlRoute.page === 'app') return;
    syncUrl(state.page, state.activeNav);
  }, [state.page, state.activeNav, state.authInitializing]);

  useEffect(() => {
    storeShowAI(state.showAI);
  }, [state.showAI]);

  useEffect(() => {
    function onPopState() {
      const urlRoute = viewFromPathname();
      if (urlRoute.page !== 'app') return;
      const s = stateRef.current;
      if (s.page !== 'app') return;
      up({ activeNav: urlRoute.view || 'dashboard' });
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [up]);

  useEffect(() => {
    return watchSystemTheme(() => {
      if (stateRef.current.settings?.theme === 'system') applyTheme('system');
    });
  }, []);

  useEffect(() => {
    if (state.page === 'app' && state.user) {
      refreshAppData();
      if (!state.aiMessages.length) {
        const ownerId = copilotOwnerId(state.user);
        up({ aiMessages: loadCopilotFromSession(state.persona, state.fullName, ownerId) });
      }
    }
  }, [state.page, state.user, refreshAppData, up]);

  function setActiveNav(activeNav) {
    if (stateRef.current.page === 'app') {
      syncUrl('app', activeNav, { replace: false });
    }
    up({ activeNav });
  }

  function goTo(page, extra = {}) {
    setState(s => {
      if (s.user && PUBLIC_PAGES.includes(page)) return s;
      if (!s.user && !PUBLIC_PAGES.includes(page)) {
        return { ...s, page: 'auth', authMode: 'signup', ...extra };
      }
      return { ...s, page, ...extra };
    });
  }

  function updateSettings(patch) {
    const next = saveSettings(patch);
    const statePatch = { settings: next };
    if ('openAssistant' in patch) statePatch.showAI = next.openAssistant !== false;
    up(statePatch);
  }

  function resetAppSettings() {
    const next = resetSettings();
    up({ settings: next, showAI: next.openAssistant !== false });
  }

  async function updateProfile(patch = {}) {
    const s = stateRef.current;
    const nextQuestionnaire = patch.questionnaire
      ? { ...s.questionnaire, ...patch.questionnaire }
      : s.questionnaire;
    const statePatch = {};

    if (patch.fullName != null) {
      statePatch.fullName = patch.fullName.trim() || s.fullName;
      statePatch.avatarInitials = initialsFromName(statePatch.fullName);
    }
    if (patch.persona != null) statePatch.persona = patch.persona;
    if (patch.questionnaire) statePatch.questionnaire = nextQuestionnaire;

    up(statePatch);
    if (!s.user) return;

    const dbPatch = {};
    if (patch.fullName != null) {
      dbPatch.full_name = statePatch.fullName ?? s.fullName;
      dbPatch.avatar_initials = statePatch.avatarInitials ?? s.avatarInitials;
    }
    if (patch.persona != null) {
      dbPatch.persona = PERSONA_LABEL_TO_DB[patch.persona] || 'salaried_employee';
    }
    if (patch.questionnaire) {
      dbPatch.mcq_answers = nextQuestionnaire;
    }

    if (Object.keys(dbPatch).length) {
      const { error } = await supabase.from('profiles').update(dbPatch).eq('id', s.user.id);
      if (error) throw error;
    }
  }

  function clearAssistantChat() {
    const s = stateRef.current;
    const msgs = freshCopilotMessages(s.persona, s.fullName);
    up({ aiMessages: msgs, aiInputVal: '', aiTyping: false });
    saveCopilotToSession(msgs, copilotOwnerId(s.user));
  }

  function exportUserData() {
    const s = stateRef.current;
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        fullName: s.fullName,
        persona: s.persona,
        email: s.user?.email || null,
      },
      questionnaire: s.questionnaire,
      transactions: s.transactions,
      budgets: s.budgets,
      snapshot: s.snapshot,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finsight-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    const welcome = freshCopilotMessages(personaLabel, stateRef.current.fullName);
    up({
      persona: personaLabel,
      page: 'app',
      activeNav: 'dashboard',
      aiMessages: welcome,
    });
    saveCopilotToSession(welcome, copilotOwnerId(user));
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

  async function finishOnboarding() {
    finishQuestionnaire();
  }

  async function sendAIMessage(text) {
    const txt = text || stateRef.current.aiInputVal;
    if (!txt?.trim()) return;
    const ownerId = copilotOwnerId(stateRef.current.user);
    const msgs = [...stateRef.current.aiMessages, { role: 'user', text: txt }];
    up({ aiMessages: msgs, aiInputVal: '', aiTyping: true });
    try {
      const { reply, snapshot, createdTx } = await sendCopilotMessage(txt, stateRef.current.snapshot);
      const nextMsgs = [...msgs, { role: 'ai', text: reply }];
      up({ aiMessages: nextMsgs, aiTyping: false, snapshot: snapshot || stateRef.current.snapshot });
      saveCopilotToSession(nextMsgs, ownerId);
      if (createdTx) await refreshAppData();
    } catch {
      const nextMsgs = [...msgs, { role: 'ai', text: 'Sorry, something went wrong. Try again.' }];
      up({ aiMessages: nextMsgs, aiTyping: false });
      saveCopilotToSession(nextMsgs, ownerId);
    }
  }

  async function submitAuth(e) {
    e.preventDefault();
    const { authMode, authEmail, authPassword, authName } = stateRef.current;
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
    signingOutRef.current = true;
    clearCopilotSession();
    try { await signOut(); } catch (err) { console.error(err); }
    finally { signingOutRef.current = false; }
    setState(s => ({ ...s, ...emptyAuthState('landing'), authInitializing: false, transactions: [], budgets: [], snapshot: null }));
  }

  async function addTransaction(payload) {
    return recordTransaction({
      state: stateRef.current,
      up,
      refreshAppData,
      payload,
    });
  }

  async function removeTransaction(id) {
    const tx = stateRef.current.transactions.find(t => t.id === id);
    await undoTransaction({
      state: stateRef.current,
      up,
      refreshAppData,
      tx,
    });
  }

  const value = {
    state, up, goTo, setActiveNav, submitOnboardingStep, finishQuestionnaire, sendAIMessage,
    submitAuth, handleSignOut, refreshAppData, addTransaction, removeTransaction,
    updateSettings, setSidebarWidth, setAiPanelWidth, resetAppSettings, updateProfile,
    clearAssistantChat, exportUserData,
    getTxGroups: (search) => groupTransactions(stateRef.current.transactions, search),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
