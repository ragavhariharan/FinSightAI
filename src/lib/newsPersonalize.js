import { DEMO_NEWS_POOL } from './demoData';

export function getPersonalizedNews(transactions = [], stocks = [], pool = DEMO_NEWS_POOL, questionnaire = {}) {
  const tags = new Set(['salaried', 'investing', 'tax']);
  const interests = questionnaire.news_interests || [];
  interests.forEach(i => tags.add(i));

  const cats = new Set(transactions.map(t => t.category));
  if (cats.has('Transport') || transactions.some(t => /petrol|fuel|uber|ola/i.test(t.name))) tags.add('fuel').add('transport');
  if (cats.has('Food & Dining') || cats.has('Groceries')) tags.add('food').add('Personal Finance');
  if (cats.has('Housing')) tags.add('housing');
  stocks.forEach(s => tags.add(s.symbol));
  if (stocks.length) tags.add('banking').add('Indian Markets');

  const scored = pool.map(item => ({
    ...item,
    score: (item.tags || []).filter(t => tags.has(t)).length + (item.imageFromFeed ? 3 : 0),
  }));

  return scored.sort((a, b) => b.score - a.score || (b.date || '').localeCompare(a.date || ''));
}
