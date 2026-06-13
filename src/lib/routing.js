import { PERSONA_DB_TO_LABEL } from './supabase';

/** Pages allowed when logged out */
export const PUBLIC_PAGES = ['landing', 'auth'];

/** Map DB onboarding_status → app page */
export function pageFromOnboardingStatus(status) {
  switch (status) {
    case 'complete':
      return 'app';
    case 'chat_in_progress':
    case 'chat_complete':
    case 'upload_complete':
      return 'onboarding-chat';
    case 'mcq_complete':
    case 'data_choice_pending':
      return 'onboarding-data-choice';
    case 'not_started':
    case 'mcq_in_progress':
    default:
      return 'onboarding-mcq';
  }
}


/** Reset all user-specific state when logged out */
export function emptyAuthState(page = 'landing') {
  return {
    page,
    user: null,
    isDemoMode: false,
    fullName: '',
    avatarInitials: 'U',
    mcqStep: 0,
    mcqAnswers: {},
    persona: 'Salaried employee',
    chatMessages: [],
    chatInputVal: '',
    chatTyping: false,
    chatQuestionIndex: 0,
    aiMessages: [],
    aiInputVal: '',
    aiTyping: false,
    authError: '',
    authLoading: false,
  };
}

/** Build context state patch from a profiles row */
export function buildAppStateFromProfile(profile) {
  const persona = profile.persona
    ? (PERSONA_DB_TO_LABEL[profile.persona] || 'Salaried employee')
    : 'Salaried employee';

  const page = pageFromOnboardingStatus(profile.onboarding_status);
  const mcqAnswers = profile.mcq_answers || {};
  const answered = Object.keys(mcqAnswers).length;

  return {
    page,
    persona,
    mcqAnswers,
    mcqStep: page === 'onboarding-mcq' ? Math.min(answered, 4) : answered,
    fullName: profile.full_name || 'User',
    avatarInitials: profile.avatar_initials || 'U',
    activeNav: 'dashboard',
    isDemoMode: false,
    aiMessages: page === 'app'
      ? [{ role: 'ai', text: `Welcome${profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! Ask me anything about your finances, or log a transaction.` }]
      : [],
    chatMessages: [],
    chatQuestionIndex: 0,
  };
}

/** Default state for authenticated user still setting up profile */
export function newUserOnboardingState() {
  return {
    page: 'onboarding-mcq',
    mcqStep: 0,
    mcqAnswers: {},
    isDemoMode: false,
    chatMessages: [],
    chatQuestionIndex: 0,
    aiMessages: [],
  };
}

/** Demo mode — local only, no Supabase session */
export function demoAppState() {
  return {
    ...emptyAuthState('app'),
    isDemoMode: true,
    page: 'app',
    persona: 'Salaried employee',
    fullName: 'Demo User',
    avatarInitials: 'DU',
    activeNav: 'dashboard',
    aiMessages: [{
      role: 'ai',
      text: "Welcome to FinSight demo! Your Salaried employee profile is loaded. Try asking 'what can I cut?' or type 'I spent ₹500 on groceries' to see the AI in action.",
    }],
  };
}
