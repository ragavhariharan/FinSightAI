import * as api from './api/features';

export async function loadTaxProfile() {
  return api.fetchTaxProfile();
}

export async function saveTaxProfileData(profile) {
  await api.saveTaxProfile(profile);
}
