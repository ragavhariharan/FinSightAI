import { supabase } from './supabase';
import { buildAppStateFromProfile, emptyAuthState, newUserOnboardingState } from './routing';

/** URL Google OAuth returns to — must be listed in Supabase Auth → URL Configuration → Redirect URLs */
export function getOAuthRedirectUrl() {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return window.location.origin;
}

export async function signUpWithEmail({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const redirectTo = getOAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}

/** Parse ?error= from a failed OAuth redirect (e.g. invalid redirect URL). */
export function readOAuthCallbackError() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const msg = search.get('error_description') || hash.get('error_description')
    || search.get('error') || hash.get('error');
  if (!msg) return null;

  const clean = window.location.pathname || '/';
  window.history.replaceState(null, '', clean);
  return msg;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/** Route user after successful login — used by auth listener */
export async function resolveSessionState(session) {
  if (!session) {
    return emptyAuthState('landing');
  }

  try {
    const profile = await getProfile(session.user.id);
    return {
      user: session.user,
      ...buildAppStateFromProfile(profile),
    };
  } catch {
    return {
      user: session.user,
      ...newUserOnboardingState(),
    };
  }
}
