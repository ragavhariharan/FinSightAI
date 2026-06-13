import { DEMO_BILL_SPLITS } from './demoData';
import { loadFeature, saveFeature } from './featureStore';
import * as api from './api/features';

export async function loadBillSplits(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'bill_splits', DEMO_BILL_SPLITS);
  if (!userId) return [];
  return api.fetchBillSplits();
}

export async function saveBillSplitMembers(isDemoMode, userId, billId, members) {
  if (isDemoMode) {
    const splits = loadFeature('demo', 'bill_splits', DEMO_BILL_SPLITS);
    const next = splits.map(b => b.id === billId ? { ...b, members } : b);
    saveFeature('demo', 'bill_splits', next);
    return next;
  }
  await api.updateBillSplit(billId, members);
  return loadBillSplits(isDemoMode, userId);
}

export function totalOwedToYou(splits, yourName = 'You') {
  return splits.reduce((sum, bill) => {
    if (bill.paidBy !== yourName) return sum;
    return sum + bill.members.filter(m => m.name !== yourName && m.owes).reduce((s, m) => s + m.owes, 0);
  }, 0);
}
