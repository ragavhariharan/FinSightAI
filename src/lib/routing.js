import { PERSONA_DB_TO_LABEL } from './supabase';

export const PUBLIC_PAGES = ['landing', 'auth'];

export function pageFromOnboardingStatus(status) {
  if (status === 'complete') return 'app';
  return 'onboarding';
}

export function emptyAuthState(page = 'landing') {
  return {
    page,
    user: null,
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
    onboardingStep: 0,
    mcqAnswers: questionnaire,
    fullName: profile.full_name || 'User',
    avatarInitials: profile.avatar_initials || 'U',
    aiMessages: [],
  };
}

export function newUserOnboardingState() {
  return {
    page: 'onboarding',
    onboardingStep: 0,
    questionnaire: {},
    aiMessages: [],
  };
}
