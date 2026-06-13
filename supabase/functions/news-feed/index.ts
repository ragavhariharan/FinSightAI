import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RSS_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=india+stock+market+finance&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=india+mutual+funds+SIP&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=petrol+diesel+price+india&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=income+tax+india+budget&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=india+startup+business&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=cryptocurrency+bitcoin+india&hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News' },
];

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(s: string) {
  return decodeEntities(
    s
      .replace(/<!\[CDATA\[/g, '')
      .replace(/\]\]>/g, '')
      .replace(/<a[^>]*>/gi, '')
      .replace(/<\/a>/gi, '')
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function parseRss(xml: string, source: string) {
  const items: {
    id: string;
    title: string;
    summary: string;
    source: string;
    date: string;
    tags: string[];
    link: string;
    image: string;
  }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < 40) {
    const block = match[1];
    const rawTitle = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/))?.[1] || '';
    const title = stripHtml(rawTitle).replace(/ - Google News$/, '');
    const rawDesc = (block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || block.match(/<description>(.*?)<\/description>/))?.[1] || '';
    const desc = stripHtml(rawDesc).slice(0, 280);
    const link = (block.match(/<link>(.*?)<\/link>/) || [])[1]?.trim() || '';
    const image =
      rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
      || block.match(/<media:content[^>]+url="([^"]+)"/)?.[1]
      || block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1]
      || block.match(/<enclosure[^>]+url="([^"]+\.(jpg|jpeg|png|webp))"/i)?.[1]
      || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    if (!title) continue;
    const tags = inferTags(title + ' ' + desc);
    items.push({
      id: `rss-${items.length}-${title.slice(0, 20).replace(/\W/g, '')}`,
      title,
      summary: desc || title,
      source,
      date,
      tags,
      link,
      image: image ? decodeEntities(image) : '',
    });
  }
  return items;
}

function topicImage(tags: string[], title: string): string {
  const t = `${title} ${tags.join(' ')}`.toLowerCase();
  if (/petrol|diesel|fuel|crude/.test(t)) return 'https://images.unsplash.com/photo-1633945274309-2c16c9682a8e?w=600&h=600&fit=crop';
  if (/stock|nifty|sensex|market/.test(t)) return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=600&fit=crop';
  if (/mutual|sip|nav|amfi/.test(t)) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=600&fit=crop';
  if (/tax|budget|itr/.test(t)) return 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=600&fit=crop';
  if (/startup|unicorn|funding/.test(t)) return 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=600&fit=crop';
  if (/crypto|bitcoin/.test(t)) return 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=600&fit=crop';
  if (/bank|hdfc|sbi/.test(t)) return 'https://images.unsplash.com/photo-1541354328608-1b8a2f0c81c8?w=600&h=600&fit=crop';
  return 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=600&fit=crop';
}

function attachImages(items: ReturnType<typeof parseRss>) {
  return items.map((item) => ({
    ...item,
    image: item.image || topicImage(item.tags, item.title),
  }));
}

function inferTags(text: string): string[] {
  const t = text.toLowerCase();
  const tags: string[] = [];
  if (/petrol|diesel|fuel|crude/.test(t)) tags.push('fuel', 'transport');
  if (/hdfc|sbi|icici|axis|bank/.test(t)) tags.push('banking', 'Indian Markets');
  if (/sbin|hdfcbank|reliance|tcs|infy|stock|nifty|sensex/.test(t)) tags.push('investing', 'Indian Markets');
  if (/mutual fund|sip|nav|amfi|sebi/.test(t)) tags.push('mutualfunds', 'Mutual Funds');
  if (/tax|80c|budget|itr/.test(t)) tags.push('tax', 'Tax Updates');
  if (/food|swiggy|zomato|delivery/.test(t)) tags.push('food', 'Personal Finance');
  if (/home loan|emi|housing|real estate/.test(t)) tags.push('housing', 'Personal Finance');
  if (/startup|unicorn|funding/.test(t)) tags.push('Startup News');
  if (/business|economy|gdp/.test(t)) tags.push('Business News');
  if (/bitcoin|crypto|ethereum/.test(t)) tags.push('Crypto');
  if (/us market|fed|dow|nasdaq/.test(t)) tags.push('Global Markets');
  if (!tags.length) tags.push('investing', 'Personal Finance');
  return tags;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing auth');

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const forceRefresh = !!body.refresh;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: cache } = await supabase.from('news_cache').select('items, fetched_at').eq('id', 1).maybeSingle();
    const cacheAge = cache?.fetched_at ? Date.now() - new Date(cache.fetched_at).getTime() : Infinity;

    if (!forceRefresh && cacheAge < 30 * 60 * 1000 && cache?.items?.length) {
      return new Response(JSON.stringify({ items: cache.items, cached: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const feedResults = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(8000),
        });
        const xml = await res.text();
        return parseRss(xml, feed.source);
      }),
    );

    const allItems: ReturnType<typeof parseRss> = [];
    for (const result of feedResults) {
      if (result.status === 'fulfilled') allItems.push(...result.value);
    }

    const seen = new Set<string>();
    const unique = allItems.filter((item) => {
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 36);

    const enriched = attachImages(unique);

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    await serviceClient.from('news_cache').upsert({
      id: 1,
      items: enriched,
      fetched_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ items: enriched, cached: false }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
