/** Sample transactions inserted by AI during testing — never show or keep these */
const PHANTOM_NAMES = new Set([
  'supermarket groceries',
  'cashback reward',
  'birthday gift for friend',
  'gym membership',
  'metro card top-up',
  'freelance graphic design',
  'bookstore purchase',
  'monthly data pack',
  'lunch at campus canteen',
  'part-time tutoring',
]);

function normName(name = '') {
  return name
    .toLowerCase()
    .replace(/\u2011/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isPhantomTransaction(tx) {
  if (!tx?.name) return false;
  return PHANTOM_NAMES.has(normName(tx.name));
}
