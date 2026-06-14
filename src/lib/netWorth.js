import * as api from './api/features';

export async function loadNetWorth() {
  return api.fetchNetWorthItems();
}

export async function addNetWorthItem(item) {
  await api.insertNetWorthItem(item);
  return api.fetchNetWorthItems();
}
