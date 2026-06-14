import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CORE_RSS_FEEDS = [
  { url: 'https://www.livemint.com/rss/markets', source: 'Mint' },
  { url: 'https://www.livemint.com/rss/money', source: 'Mint' },
  { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', source: 'Economic Times' },
  { url: 'https://economictimes.indiatimes.com/mf/rssfeeds/837555174.cms', source: 'Economic Times' },
  { url: 'https://economictimes.indiatimes.com/industry/banking/finance/rssfeeds/13358259.cms', source: 'Economic Times' },
  { url: 'https://www.moneycontrol.com/rss/latestnews.xml', source: 'Moneycontrol' },
  { url: 'https://www.moneycontrol.com/rss/business.xml', source: 'Moneycontrol' },
];

const ROTATING_GOOGLE_QUERIES = [
  'india stock market finance',
  'india mutual funds SIP',
  'income tax india budget',
  'petrol diesel price india',
  'india startup business funding',
  'cryptocurrency bitcoin india',
  'india real estate home loan EMI',
  'RBI repo rate india economy',
  'india IPO listing share market',
  'india insurance LIC health',
  'india export import trade',
  'india fintech UPI payments',
];

const ITEMS_PER_FEED = 50;
const POOL_TARGET = 48;

const CACHE_TTL_MS = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 7000;

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  tags: string[];
  link: string;
  image: string;
  imageFromFeed?: boolean;
};

function googleNewsFeed(query: string) {
  return {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`,
    source: 'Google News',
  };
}

function feedsForRequest(rotation: number) {
  const feeds = [...CORE_RSS_FEEDS];
  const googleCount = 5;
  const start = Math.abs(rotation) % ROTATING_GOOGLE_QUERIES.length;
  for (let i = 0; i < googleCount; i++) {
    feeds.push(googleNewsFeed(ROTATING_GOOGLE_QUERIES[(start + i) % ROTATING_GOOGLE_QUERIES.length]));
  }
  return feeds;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = Math.abs(seed) % 2147483646 || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dedupeByTitle(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function selectFeedItems(allItems: NewsItem[], rotation: number, excludeTitles: string[]): NewsItem[] {
  const unique = dedupeByTitle(allItems);
  const exclude = new Set(excludeTitles.map((t) => t.toLowerCase()));
  const fresh = unique.filter((item) => !exclude.has(item.title.toLowerCase()));

  let pool = fresh.length >= POOL_TARGET ? fresh : unique;
  if (fresh.length > 0 && fresh.length < POOL_TARGET) {
    const stale = unique.filter((item) => exclude.has(item.title.toLowerCase()));
    pool = [...fresh, ...seededShuffle(stale, rotation + 1)];
  }

  const shuffled = seededShuffle(pool, rotation || Date.now());
  return dedupeByTitle(shuffled).slice(0, POOL_TARGET);
}

function simpleHash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash) + s.charCodeAt(i);
  return Math.abs(hash);
}

/** Moneycontrol thumbs hotlink to grey.gif; ET .cms URLs need thumb rewrite. */
function normalizeImageUrl(url: string): string {
  if (!url) return '';
  let u = url.trim();
  if (u.startsWith('//')) u = `https:${u}`;

  if (/moneycontrol\.com\/news_image_files/i.test(u) || /images\.moneycontrol\.com\/images\/market\/grey\.gif/i.test(u)) {
    return '';
  }

  const etMsid = u.match(/img\.etimg\.com\/(?:photo|thumb)\/msid-(\d+)/i);
  if (etMsid) {
    return `https://img.etimg.com/thumb/msid-${etMsid[1]},width-1200,height-675,resizemode-4.cms`;
  }

  return u;
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
}

function stripHtml(s: string) {
  let out = decodeEntities(s);
  for (let pass = 0; pass < 3; pass++) {
    const next = decodeEntities(out);
    if (next === out) break;
    out = next;
  }
  return out
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<a[^>]*>/gi, ' ')
    .replace(/<\/a>/gi, ' ')
    .replace(/<font[^>]*>/gi, ' ')
    .replace(/<\/font>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeRawMarkup(text: string): boolean {
  return (
    /<\/?[a-z][\s\S]*?>/i.test(text)
    || /&lt;\/?[a-z]/i.test(text)
    || /\bhref\s*=/i.test(text)
    || /news\.google\.com\/rss\/articles/i.test(text)
  );
}

function extractImage(raw: string): string {
  let decoded = decodeEntities(raw);
  for (let pass = 0; pass < 2; pass++) {
    const next = decodeEntities(decoded);
    if (next === decoded) break;
    decoded = next;
  }

  const enclosure =
    decoded.match(/<enclosure\b[^>]*\btype=["']image[^"']*["'][^>]*\burl=["']([^"']+)["']/i)
    || decoded.match(/<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*\btype=["']image/i);
  if (enclosure?.[1]) return normalizeImageUrl(enclosure[1].trim());

  const patterns = [
    /<media:content[^>]*\burl=["']([^"']+)["']/i,
    /<media:thumbnail[^>]*\burl=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
    /src=&quot;([^&]+)&quot;/i,
    /<enclosure[^>]+url=["']([^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match?.[1]) return normalizeImageUrl(match[1].trim());
  }
  return '';
}

function extractPublisher(title: string, block: string, fallback: string): string {
  const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  if (sourceMatch?.[1]) return stripHtml(sourceMatch[1]);
  const parts = title.split(/\s+[-–|]\s+/);
  if (parts.length > 1) return parts[parts.length - 1].trim();
  return fallback;
}

function cleanTitle(rawTitle: string, publisher: string): string {
  let title = stripHtml(rawTitle).replace(/ - Google News$/, '');
  if (publisher && title.endsWith(` - ${publisher}`)) {
    title = title.slice(0, -(publisher.length + 3)).trim();
  }
  return title;
}

function buildSummary(rawDesc: string, title: string): string {
  const text = stripHtml(rawDesc);
  if (!text || looksLikeRawMarkup(text)) return `Latest coverage on ${title}.`;
  let summary = text;
  if (summary.toLowerCase().startsWith(title.toLowerCase().slice(0, Math.min(40, title.length)))) {
    summary = summary.slice(title.length).trim();
  }
  summary = summary.replace(/^[-–|,:]\s*/, '').trim();
  if (!summary || looksLikeRawMarkup(summary) || summary.length < 24) {
    return `Latest coverage on ${title}.`;
  }
  return summary.slice(0, 240);
}

function itemId(link: string, title: string, guid: string): string {
  const base = link || guid || title;
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = ((hash << 5) - hash) + base.charCodeAt(i);
  return `news-${Math.abs(hash)}`;
}

function parseRss(xml: string, defaultSource: string) {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < ITEMS_PER_FEED) {
    const block = match[1];
    const rawTitle = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || block.match(/<title>([\s\S]*?)<\/title>/i))?.[1] || '';
    const publisher = extractPublisher(rawTitle, block, defaultSource);
    const title = cleanTitle(rawTitle, publisher);
    const rawDesc = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || block.match(/<description>([\s\S]*?)<\/description>/i))?.[1] || '';
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1]?.trim() || '';
    const guid = (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i) || [])[1]?.trim() || '';
    const image = extractImage(block) || extractImage(rawDesc);
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '';
    const date = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    if (!title) continue;
    const summary = buildSummary(rawDesc, title);
    const tags = inferTags(title + ' ' + summary);
    items.push({
      id: itemId(link, title, guid),
      title,
      summary,
      source: publisher,
      date,
      tags,
      link,
      image,
      imageFromFeed: !!image,
    });
  }
  return items;
}

const TOPIC_IMAGE_POOLS: Record<string, string[]> = {
  fuel: ['photo-1633945274309-2c16c9682a8e', 'photo-1578662996442-48f60103fc96'],
  market: ['photo-1611974789855-9c2a0a7236a3', 'photo-1590283603385-17ffb3a7f29f', 'photo-1642790106117-e829e14a42fe'],
  mutual: ['photo-1460925895917-afdab827c52f', 'photo-1551288049-bebda4e38f71'],
  tax: ['photo-1554224155-6726b3ff858f', 'photo-1450101499163-c8848c66ca85'],
  startup: ['photo-1559136555-9303baea8ebd', 'photo-1522071820081-009f0129c71c'],
  crypto: ['photo-1621761191319-c6fb62004040', 'photo-1518546304921-5b4da8ffd0cf'],
  bank: ['photo-1541354328608-1b8a2f0c81c8', 'photo-1563986768609-322da13575f3'],
  default: ['photo-1579621970563-ebec7560ff3e', 'photo-1553729459-efe14ef6055d', 'photo-1507679799987-c73779587ccf'],
};

function topicImage(tags: string[], title: string, id: string): string {
  const t = `${title} ${tags.join(' ')}`.toLowerCase();
  let pool = TOPIC_IMAGE_POOLS.default;
  if (/petrol|diesel|fuel|crude/.test(t)) pool = TOPIC_IMAGE_POOLS.fuel;
  else if (/stock|nifty|sensex|market|share/.test(t)) pool = TOPIC_IMAGE_POOLS.market;
  else if (/mutual|sip|nav|amfi/.test(t)) pool = TOPIC_IMAGE_POOLS.mutual;
  else if (/tax|budget|itr/.test(t)) pool = TOPIC_IMAGE_POOLS.tax;
  else if (/startup|unicorn|funding/.test(t)) pool = TOPIC_IMAGE_POOLS.startup;
  else if (/crypto|bitcoin/.test(t)) pool = TOPIC_IMAGE_POOLS.crypto;
  else if (/bank|hdfc|sbi/.test(t)) pool = TOPIC_IMAGE_POOLS.bank;
  const photo = pool[simpleHash(id || title) % pool.length];
  return `https://images.unsplash.com/${photo}?w=800&h=450&fit=crop`;
}

function attachImages(items: NewsItem[]) {
  return items.map((item) => ({
    ...item,
    image: item.image || topicImage(item.tags, item.title, item.id),
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
    const rotation = Number(body.rotation) || 0;
    const excludeTitles = Array.isArray(body.excludeTitles)
      ? body.excludeTitles.filter((t: unknown) => typeof t === 'string').slice(0, 200)
      : [];

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: cache } = await supabase.from('news_cache').select('items, fetched_at').eq('id', 1).maybeSingle();
    const cacheAge = cache?.fetched_at ? Date.now() - new Date(cache.fetched_at).getTime() : Infinity;

    if (!forceRefresh && cacheAge < CACHE_TTL_MS && cache?.items?.length) {
      return new Response(JSON.stringify({ items: cache.items, cached: true, fetched_at: cache.fetched_at }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const feedList = feedsForRequest(forceRefresh ? rotation : 0);
    const feedResults = await Promise.allSettled(
      feedList.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FinSight/1.0)' },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!res.ok) throw new Error(`Feed failed: ${feed.url}`);
        const xml = await res.text();
        return parseRss(xml, feed.source);
      }),
    );

    const allItems: NewsItem[] = [];
    for (const result of feedResults) {
      if (result.status === 'fulfilled') allItems.push(...result.value);
    }

    allItems.sort((a, b) => {
      const imgDelta = Number(!!b.image) - Number(!!a.image);
      if (imgDelta !== 0) return imgDelta;
      return (b.date || '').localeCompare(a.date || '');
    });

    const pickRotation = forceRefresh ? (rotation || Date.now()) : 0;
    const unique = forceRefresh
      ? selectFeedItems(allItems, pickRotation, excludeTitles)
      : dedupeByTitle(allItems).slice(0, POOL_TARGET);

    const enriched = attachImages(unique);

    if (enriched.length) {
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      await serviceClient.from('news_cache').upsert({
        id: 1,
        items: enriched,
        fetched_at: new Date().toISOString(),
      });
    } else if (cache?.items?.length) {
      return new Response(JSON.stringify({ items: cache.items, cached: true, fetched_at: cache.fetched_at, stale: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      items: enriched,
      cached: false,
      refreshed: forceRefresh,
      fetched_at: new Date().toISOString(),
    }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
