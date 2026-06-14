import { useMemo } from 'react';
import { useApp } from '../context';
import { useFeatureData } from '../hooks/useFeatureData';
import { loadTaxProfile } from '../lib/tax';
import { buildDeclaration } from '../lib/investmentDeclaration';
import Icon from '../components/ui/Icon';
import { formatRupee } from '../lib/format';

const loadTax = () => loadTaxProfile();

export default function InvestmentDeclaration() {
  const { state } = useApp();
  const { data: taxProfile } = useFeatureData(loadTax, []);
  const decl = useMemo(() => buildDeclaration(state.transactions, taxProfile || {}), [state.transactions, taxProfile]);

  function exportSummary() {
    const blob = new Blob([decl.exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investment-declaration-fy.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  const rows80C = decl.rows.filter(r => r.section === '80C');
  const rows80D = decl.rows.filter(r => r.section === '80D');

  return (
    <div className="fs-content-inner fs-view-enter">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="fs-btn fs-btn-primary fs-btn-sm" onClick={exportSummary}><Icon name="download" size={15} /> Export summary</button>
      </div>

      <div className="fs-grid-2" style={{ marginBottom: 18 }}>
        <div className="fs-card fs-card-padded fs-animate-in">
          <div className="fs-label" style={{ marginBottom: 12 }}>Section 80C</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>{formatRupee(decl.summary['80C'])}</div>
          {rows80C.length === 0 ? <p className="fs-subtitle">No 80C transactions detected yet.</p> : rows80C.map(row => (
            <div key={`${row.date}-${row.label}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--fs-border-light)', fontSize: '0.875rem' }}>
              <span>{row.label}</span>
              <span className="fs-money">{formatRupee(row.amount)}</span>
            </div>
          ))}
        </div>
        <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-1">
          <div className="fs-label" style={{ marginBottom: 12 }}>Section 80D</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>{formatRupee(decl.summary['80D'])}</div>
          {rows80D.length === 0 ? <p className="fs-subtitle">No health insurance premiums detected.</p> : rows80D.map(row => (
            <div key={`${row.date}-${row.label}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--fs-border-light)', fontSize: '0.875rem' }}>
              <span>{row.label}</span>
              <span className="fs-money">{formatRupee(row.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-2">
        <div className="fs-label" style={{ marginBottom: 12 }}>All investment transactions</div>
        {decl.rows.length === 0 ? (
          <p className="fs-subtitle">Log PPF, ELSS, LIC, or health insurance transactions to compile your declaration.</p>
        ) : (
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            {decl.rows.map(row => (
              <div key={`${row.section}-${row.date}-${row.label}`} className="fs-tx-row" style={{ fontSize: '0.8125rem' }}>
                <div style={{ flex: 1 }}>{row.label} · {row.date}</div>
                <span className="fs-badge fs-badge-muted">{row.section}</span>
                <span className="fs-money" style={{ fontWeight: 600, minWidth: 90, textAlign: 'right' }}>{formatRupee(row.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
