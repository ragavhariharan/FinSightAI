/** Compile 80C / 80D eligible amounts from transactions */
export function buildDeclaration(transactions, taxProfile = {}) {
  const rows = [];
  let total80C = 0;
  let total80D = 0;

  transactions.forEach(tx => {
    if (tx.amount >= 0) return;
    const amt = Math.abs(tx.amount);
    const n = tx.name.toLowerCase();
    if (/ppf|elss|nps|lic|mutual|sip|epf/i.test(n) || tx.category === 'Other' && /ppf|invest/i.test(n)) {
      rows.push({ section: '80C', label: tx.name, amount: amt, date: tx.txn_date });
      total80C += amt;
    }
    if (/health|insurance|mediclaim/i.test(n) || tx.category === 'Insurance' || tx.category === 'Health') {
      rows.push({ section: '80D', label: tx.name, amount: amt, date: tx.txn_date });
      total80D += amt;
    }
  });

  total80C += taxProfile.investments80C || 0;
  total80D += taxProfile.healthInsurance80D || 0;
  total80C = Math.min(total80C, 150000);
  total80D = Math.min(total80D, 25000);

  return {
    rows,
    summary: { '80C': total80C, '80D': total80D },
    exportText: [
      'FinSight Investment Declaration Summary',
      `80C eligible: ₹${total80C.toLocaleString('en-IN')}`,
      `80D eligible: ₹${total80D.toLocaleString('en-IN')}`,
      '',
      ...rows.map(r => `${r.section} | ${r.date} | ${r.label} | ₹${r.amount.toLocaleString('en-IN')}`),
    ].join('\n'),
  };
}
