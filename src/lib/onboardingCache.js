/**
 * onboardingCache.js
 *
 * Client-side localStorage backup for onboarding progress.
 * Used as a fallback when the Supabase profiles row is missing
 * (e.g. signup trigger not yet deployed) or when DB updates fail silently.
 *
 * Data is keyed by user ID so multiple accounts on the same browser are isolated.
 */

const KEY = (uid) => `finsight_ob_${uid}`;

/**
 * Save onboarding checkpoint.
 * @param {string} uid
 * @param {{ page: string, mcqStep: number, mcqAnswers: object, persona: string, chatQuestionIndex: number }} data
 */
export function saveOnboardingCache(uid, data) {
  try {
    localStorage.setItem(KEY(uid), JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch { /* storage might be unavailable in private browsing */ }
}

/**
 * Read onboarding checkpoint.
 * @param {string} uid
 * @returns {{ page, mcqStep, mcqAnswers, persona, chatQuestionIndex } | null}
 */
export function loadOnboardingCache(uid) {
  try {
    const raw = localStorage.getItem(KEY(uid));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear onboarding checkpoint — call when onboarding is complete.
 * @param {string} uid
 */
export function clearOnboardingCache(uid) {
  try {
    localStorage.removeItem(KEY(uid));
  } catch { /* ignore */ }
}

/**
 * Merge a DB-resolved route with the local cache.
 * Rules:
 *  - If DB says "app" (onboarding_status=complete), trust DB — clear cache.
 *  - If DB has no profile (newUserOnboardingState → page:'onboarding-mcq', mcqStep:0)
 *    AND the cache shows the user was further along, use the cache route instead.
 *  - If DB has a valid profile row (page is not step-0 MCQ), always trust DB.
 *
 * @param {string} uid
 * @param {object} dbRoute  — result of resolveSessionState / buildAppStateFromProfile
 * @param {boolean} profileMissing — true when the catch block ran in resolveSessionState
 * @returns {object} merged route patch
 */
export function mergeWithCache(uid, dbRoute, profileMissing) {
  // Onboarding complete → clear cache and trust DB
  if (dbRoute.page === 'app') {
    clearOnboardingCache(uid);
    return dbRoute;
  }

  const cached = loadOnboardingCache(uid);
  if (!cached) return dbRoute;

  // Only override when DB gave us the default "step 0" fallback due to missing profile
  if (profileMissing) {
    return {
      ...dbRoute,
      page: cached.page || dbRoute.page,
      mcqStep: cached.mcqStep ?? dbRoute.mcqStep,
      mcqAnswers: cached.mcqAnswers || dbRoute.mcqAnswers,
      persona: cached.persona || dbRoute.persona,
      chatQuestionIndex: cached.chatQuestionIndex ?? dbRoute.chatQuestionIndex,
    };
  }

  return dbRoute;
}
