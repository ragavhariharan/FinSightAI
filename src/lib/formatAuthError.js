/** Map Supabase auth errors to user-friendly messages */
export function formatAuthError(err) {
  const msg = err?.message || String(err);
  const lower = msg.toLowerCase();

  if (lower.includes('rate limit') || lower.includes('email rate') || lower.includes('too many requests')) {
    return 'Too many sign-up attempts. Wait a few minutes, use Google sign-in, or disable email confirmation in Supabase Auth settings for development.';
  }
  if (lower.includes('already registered') || lower.includes('user already registered')) {
    return 'This email is already registered. Try signing in instead.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in. Check your inbox (and spam).';
  }
  if (lower.includes('requested path is invalid') || lower.includes('redirect')) {
    return `Google sign-in redirect URL is not allowed. In Supabase → Authentication → URL Configuration, add: ${typeof window !== 'undefined' ? window.location.origin : 'your app URL'} (and http://127.0.0.1:5173 if you use that locally).`;
  }
  return msg;
}
