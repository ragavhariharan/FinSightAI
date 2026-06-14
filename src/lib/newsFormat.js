const ENTITY_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
  '&#8217;': "'",
  '&#8220;': '"',
  '&#8221;': '"',
};

export function normalizeImageUrl(url = '') {
  if (!url) return '';
  let u = String(url).trim();
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

export function decodeEntities(text = '') {
  let out = String(text);
  for (let pass = 0; pass < 3; pass++) {
    const next = out.replace(/&(?:#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity) => {
      if (ENTITY_MAP[entity]) return ENTITY_MAP[entity];
      if (entity.startsWith('&#x')) return String.fromCharCode(parseInt(entity.slice(3, -1), 16));
      if (entity.startsWith('&#')) return String.fromCharCode(parseInt(entity.slice(2, -1), 10));
      return entity;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

export function stripHtml(text = '') {
  let s = decodeEntities(String(text));
  s = s
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
  return s;
}

export function looksLikeRawMarkup(text = '') {
  const s = String(text);
  return (
    /<\/?[a-z][\s\S]*?>/i.test(s)
    || /&lt;\/?[a-z]/i.test(s)
    || /\bhref\s*=/i.test(s)
    || /news\.google\.com\/rss\/articles/i.test(s)
  );
}

export function formatNewsDate(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return String(isoOrDate);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function teaserFromTitle(title) {
  const headline = title.replace(/\s+[-–|]\s+[^-–|]+$/, '').trim() || title;
  return `Latest coverage on ${headline}.`;
}

function cleanSummaryText(summary, title) {
  const text = stripHtml(summary);
  if (!text || looksLikeRawMarkup(text)) return teaserFromTitle(title);
  if (text.toLowerCase() === title.toLowerCase()) return teaserFromTitle(title);
  if (text.length < 20) return teaserFromTitle(title);
  return text.slice(0, 240);
}

export function normalizeNewsItem(item = {}) {
  const title = stripHtml(item.title || '');
  const cleanSummary = cleanSummaryText(item.summary || item.description || '', title);
  const rawImage = normalizeImageUrl(item.image || '');

  return {
    id: item.id || item.link || title,
    title,
    summary: cleanSummary,
    source: stripHtml(item.source || 'News'),
    date: item.date || '',
    dateLabel: formatNewsDate(item.date),
    tags: Array.isArray(item.tags) ? item.tags : [],
    link: item.link || '',
    image: rawImage,
    imageFromFeed: Boolean(item.imageFromFeed && rawImage),
  };
}

export function normalizeNewsItems(items = []) {
  return items.map(normalizeNewsItem).filter((item) => item.title);
}
