import * as api from './api/features';

export async function loadBillSplits() {
  return api.fetchBillSplits();
}

export async function saveBillSplitMembers(billId, members) {
  await api.updateBillSplit(billId, members);
  return loadBillSplits();
}

export function totalOwedToYou(splits, yourName = 'You') {
  return splits.reduce((sum, bill) => {
    if (bill.paidBy !== yourName) return sum;
    return sum + bill.members.filter(m => m.name !== yourName && m.owes).reduce((s, m) => s + m.owes, 0);
  }, 0);
}
