import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context';

export function useFeatureData(loader, deps = []) {
  const { state } = useApp();
  const { user } = state;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await loader(user.id);
      setData(result);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [loader, user?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setData(null);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    loader(user.id)
      .then((result) => { if (!cancelled) { setData(result); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e); setLoading(false); } });
    return () => { cancelled = true; };
  }, [loader, user?.id, ...deps]);

  return { data, setData, loading, error, reload };
}
