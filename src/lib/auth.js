import { supabase } from './supabase';
import { buildAppStateFromProfile, emptyAuthState, newUserOnboardingState } from './routing';

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
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return data;
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
