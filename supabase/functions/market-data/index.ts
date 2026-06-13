import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function yahooQuote(symbol: string, exchange = 'NSE') {
  const suffix = exchange === 'BSE' ? '.BO' : '.NS';
  const sym = symbol.includes('.') ? symbol : `${symbol}${suffix}`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) return null;
  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta;
  const closes = result.indicators?.quote?.[0]?.close?.filter((n: number | null) => n != null) || [];
  const prevClose = closes.length > 1 ? closes[closes.length - 2] : meta.chartPreviousClose;
  const price = meta.regularMarketPrice ?? closes[closes.length - 1];
  const changePct = prevClose ? Math.round(((price - prevClose) / prevClose) * 1000) / 10 : 0;
  return { symbol: symbol.toUpperCase(), price, changePct, currency: meta.currency || 'INR' };
}

async function fetchAmfiNavMap(): Promise<Map<string, { nav: number; name: string; benchmark?: string }>> {
  const res = await fetch('https://www.amfiindia.com/spages/NAVAll.txt');
  const text = await res.text();
  const map = new Map<string, { nav: number; name: string }>();
  for (const line of text.split('\n')) {
    const parts = line.split(';');
    if (parts.length < 5) continue;
    const isin = parts[2]?.trim();
    const nav = parseFloat(parts[4]);
    const name = parts[3]?.trim();
    if (isin && !Number.isNaN(nav) && nav > 0) {
      map.set(isin, { nav, name });
    }
  }
  return map;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing auth');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const body = await req.json();
    const { action, symbols = [], isins = [] } = body;

    if (action === 'quotes') {
      const quotes = await Promise.all(
        (symbols as string[]).map(async (s: { symbol?: string; exchange?: string } | string) => {
          const sym = typeof s === 'string' ? s : s.symbol;
          const ex = typeof s === 'string' ? 'NSE' : (s.exchange || 'NSE');
          return yahooQuote(sym!, ex);
        }),
      );
      return new Response(JSON.stringify({ quotes: quotes.filter(Boolean) }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'nav') {
      const navMap = await fetchAmfiNavMap();
      const results = (isins as string[]).map((isin) => {
        const hit = navMap.get(isin);
        return hit ? { isin, nav: hit.nav, name: hit.name } : { isin, error: 'Not found' };
      });
      return new Response(JSON.stringify({ nav: results }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'search_mf') {
      const q = (body.query || '').toLowerCase();
      const navMap = await fetchAmfiNavMap();
      const matches: { isin: string; name: string; nav: number }[] = [];
      for (const [isin, data] of navMap.entries()) {
        if (data.name.toLowerCase().includes(q) && matches.length < 15) {
          matches.push({ isin, name: data.name, nav: data.nav });
        }
      }
      return new Response(JSON.stringify({ matches }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Unknown action');
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
