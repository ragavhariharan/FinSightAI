import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context';

/** Load async feature data for demo or authenticated user */
export function useFeatureData(loader, deps = []) {
  const { state } = useApp();
  const { isDemoMode, user } = state;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loader(isDemoMode, user?.id);
      setData(result);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [loader, isDemoMode, user?.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loader(isDemoMode, user?.id)
      .then((result) => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [loader, isDemoMode, user?.id, ...deps]);

  return { data, setData, loading, error, reload };
}
