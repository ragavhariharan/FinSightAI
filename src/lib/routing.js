import { PERSONA_DB_TO_LABEL } from './supabase';
import { ASSISTANT_NAME } from './assistant';

/** Pages allowed when logged out */
export const PUBLIC_PAGES = ['landing', 'auth'];

/** Map DB onboarding_status → app page */
export function pageFromOnboardingStatus(status) {
  if (status === 'complete') return 'app';
  if (['chat_in_progress', 'chat_complete', 'mcq_complete', 'data_choice_pending', 'upload_complete'].includes(status)) {
    return 'app';
  }
  return 'onboarding';
}

/** Reset all user-specific state when logged out */
export function emptyAuthState(page = 'landing') {
  return {
    page,
    user: null,
    isDemoMode: false,
    fullName: '',
    avatarInitials: 'U',
    onboardingStep: 0,
    questionnaire: {},
    persona: 'Salaried employee',
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
  const questionnaire = profile.mcq_answers?.persona ? profile.mcq_answers : (profile.mcq_answers || {});

  return {
    page,
    persona,
    questionnaire,
    onboardingStep: page === 'onboarding' ? 0 : 0,
    mcqAnswers: questionnaire,
    fullName: profile.full_name || 'User',
    avatarInitials: profile.avatar_initials || 'U',
    isDemoMode: false,
    aiMessages: [],
  };
}

/** Default state for authenticated user still setting up profile */
export function newUserOnboardingState() {
  return {
    page: 'onboarding',
    onboardingStep: 0,
    questionnaire: {},
    isDemoMode: false,
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
    aiMessages: [{
      role: 'ai',
      text: `Welcome to FinSight demo! Your Salaried employee profile is loaded. Ask ${ASSISTANT_NAME} 'what can I cut?' or type 'I spent ₹500 on groceries' to see Kash in action.`,
    }],
  };
}
