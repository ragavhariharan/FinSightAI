/** Persist per-user feature data (demo + authenticated) in localStorage */
export function userKey(isDemoMode, userId) {
  return isDemoMode ? 'demo' : (userId || 'local');
}

export function loadFeature(userKey, key, defaults) {
  try {
    const raw = localStorage.getItem(`finsight_${key}_${userKey}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return typeof defaults === 'function' ? defaults() : JSON.parse(JSON.stringify(defaults));
}

export function saveFeature(userKey, key, data) {
  localStorage.setItem(`finsight_${key}_${userKey}`, JSON.stringify(data));
}
