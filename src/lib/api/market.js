import { supabase } from '../supabase';

export async function fetchStockQuotes(symbols) {
  const { data, error } = await supabase.functions.invoke('market-data', {
    body: { action: 'quotes', symbols },
  });
  if (error) throw error;
  return data?.quotes || [];
}

export async function fetchNavByIsin(isins) {
  const { data, error } = await supabase.functions.invoke('market-data', {
    body: { action: 'nav', isins },
  });
  if (error) throw error;
  return data?.nav || [];
}

export async function searchMutualFunds(query) {
  const { data, error } = await supabase.functions.invoke('market-data', {
    body: { action: 'search_mf', query },
  });
  if (error) throw error;
  return data?.matches || [];
}

export async function refreshNewsFeed(force = false) {
  const { data, error } = await supabase.functions.invoke('news-feed', { body: { refresh: force } });
  if (error) throw error;
  return data?.items || [];
}
