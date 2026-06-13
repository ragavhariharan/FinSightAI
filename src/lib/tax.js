import { DEMO_TAX_PROFILE } from './demoData';
import { loadFeature, saveFeature } from './featureStore';
import * as api from './api/features';

export async function loadTaxProfile(isDemoMode, userId) {
  if (isDemoMode) return loadFeature('demo', 'tax_profile', DEMO_TAX_PROFILE);
  if (!userId) return { annualIncome: 0, investments80C: 0, healthInsurance80D: 0, homeLoanInterest: 0, nps80CCD: 0 };
  return api.fetchTaxProfile();
}

export async function saveTaxProfileData(isDemoMode, userId, profile) {
  if (isDemoMode) {
    saveFeature('demo', 'tax_profile', profile);
    return;
  }
  await api.saveTaxProfile(profile);
}

function slabTax(income, slabs) {
  let tax = 0;
  let prev = 0;
  for (const [upto, rate] of slabs) {
    const taxable = Math.min(income, upto) - prev;
    if (taxable > 0) tax += taxable * rate;
    prev = upto;
    if (income <= upto) break;
  }
  return tax;
}

export function estimateTax(profile) {
  const income = profile.annualIncome || 0;
  const ded80C = Math.min(profile.investments80C || 0, 150000);
  const ded80D = Math.min(profile.healthInsurance80D || 0, 25000);
  const dedHousing = profile.homeLoanInterest || 0;
  const dedNps = Math.min(profile.nps80CCD || 0, 50000);

  const oldTaxable = Math.max(0, income - ded80C - ded80D - dedHousing - dedNps - 50000);
  const oldSlabs = [[250000, 0], [500000, 0.05], [1000000, 0.2], [Infinity, 0.3]];
  const oldTax = slabTax(oldTaxable, oldSlabs);
  const oldRebate = oldTaxable <= 500000 ? Math.min(oldTax, 12500) : 0;

  const newSlabs = [[300000, 0], [700000, 0.05], [1000000, 0.1], [1200000, 0.15], [1500000, 0.2], [Infinity, 0.3]];
  const newTax = slabTax(income, newSlabs);
  const newRebate = income <= 700000 ? Math.min(newTax, 25000) : 0;

  const oldFinal = Math.max(0, oldTax - oldRebate);
  const newFinal = Math.max(0, newTax - newRebate);
  const room80C = Math.max(0, 150000 - ded80C);

  return {
    oldRegime: Math.round(oldFinal),
    newRegime: Math.round(newFinal),
    recommended: oldFinal <= newFinal ? 'old' : 'new',
    savingsIfSwitch: Math.round(Math.abs(oldFinal - newFinal)),
    room80C,
    additional80CToSave: Math.round(room80C * 0.3),
  };
}
