/** Persist per-user feature data in localStorage */
export function userKey(userId) {
  return userId || 'local';
}

export function loadFeature(userId, key, fallback) {
  try {
    const raw = localStorage.getItem(`finsight_${userKey(userId)}_${key}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

export function saveFeature(userId, key, value) {
  try {
    localStorage.setItem(`finsight_${userKey(userId)}_${key}`, JSON.stringify(value));
  } catch { /* ignore */ }
}
