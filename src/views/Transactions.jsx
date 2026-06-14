import { useMemo, useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { formatRupee, groupTransactions, filterTransactions } from '../lib/format';
import { txSummary } from '../lib/api/transactions';
import { detectRecurring } from '../lib/recurring';
import { categoryList } from '../lib/categories';
import { useFeatureData } from '../hooks/useFeatureData';
import { fetchAccounts, defaultAccount } from '../lib/accounts';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import Icon from '../components/ui/Icon';
import CategoryIcon from '../components/ui/CategoryIcon';
import EmptyState from '../components/ui/EmptyState';
import Select from '../components/ui/Select';

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Today' },
  { value: '10d', label: 'Last 10 days' },
  { value: 'month', label: 'Last month' },
  { value: '2month', label: 'Last 2 months' },
  { value: 'all', label: 'All time' },
];

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest first' },
  { value: 'amount_desc', label: 'Amount: high to low' },
  { value: 'amount_asc', label: 'Amount: low to high' },
];

const loadAcc = (isDemo) => fetchAccounts(isDemo);

export default function Transactions() {
  const { state, up, removeTransaction } = useApp();
  const { txSearch, transactions, dataLoading, isDemoMode } = state;
  const { data: accounts } = useFeatureData(loadAcc, [transactions.length]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [period, setPeriod] = useState('month');
  const [category, setCategory] = useState('');
  const [recurringOnly, setRecurringOnly] = useState(false);
  const [sort, setSort] = useState('date_desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const filterRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFiltersOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const recurringNames = useMemo(() => {
    const names = detectRecurring(transactions).map(r => r.name.toLowerCase());
    return new Set(names);
  }, [transactions]);

  const filtered = useMemo(() => filterTransactions(transactions, {
    search: txSearch,
    type: typeFilter,
    period,
    category,
    recurringOnly,
    recurringNames,
    sort,
  }), [transactions, txSearch, typeFilter, period, category, recurringOnly, recurringNames, sort]);

  const groups = useMemo(() => groupTransactions(filtered), [filtered]);
  const summary = txSummary(filtered);
  const def = defaultAccount(accounts || []);
  const accountBalance = def?.balance ?? 0;

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await removeTransaction(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  }

  const cards = [
    { label: 'Account balance', value: accountBalance, format: (n) => formatRupee(n), color: 'var(--fs-success)', icon: 'wallet', sub: def?.name || 'Add an account' },
    { label: 'Income', value: summary.income, format: (n) => formatRupee(n, { signed: true }), color: 'var(--fs-success)', icon: 'income' },
    { label: 'Spending', value: summary.spend, format: (n) => formatRupee(n), color: 'var(--fs-text)', icon: 'transactions' },
    { label: 'Largest expense', value: summary.largest, format: (n) => formatRupee(n), color: 'var(--fs-text)', icon: 'alert' },
  ];

  const activeFilterCount = [period !== 'month', category, recurringOnly, sort !== 'date_desc'].filter(Boolean).length;

  return (
    <div className="fs-content-inner fs-view-enter">
      <div className="fs-tx-sticky">
        <div className="fs-stat-grid" style={{ marginBottom: 16 }}>
          {cards.map(({ label, value, format, color, icon, sub }, i) => (
            <div key={label} className={`fs-card fs-stat-card fs-card-hover fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="fs-label">{label}</div>
                <span style={{ color: 'var(--fs-text-muted)' }}><Icon name={icon} size={16} /></span>
              </div>
              <div className="fs-stat-value" style={{ color }}><AnimatedNumber value={value} format={format} /></div>
              {sub && <div className="fs-subtitle" style={{ marginTop: 6, fontSize: '0.75rem' }}>{sub}</div>}
            </div>
          ))}
        </div>

        <div
          className="fs-card"
          ref={filterRef}
          style={{ marginBottom: 12, padding: '10px 10px 10px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}
        >
          <span style={{ color: 'var(--fs-text-muted)', flexShrink: 0 }}><Icon name="search" size={18} /></span>
          <input
            className="fs-input fs-input-sm"
            value={txSearch}
            onChange={e => up({ txSearch: e.target.value })}
            placeholder="Search by name or category…"
            style={{ border: 'none', background: 'transparent', padding: '8px 0', flex: 1, minWidth: 0 }}
          />
          <button
            type="button"
            className={`fs-btn fs-btn-ghost fs-btn-icon ${activeFilterCount ? 'fs-filter-active' : ''}`}
            onClick={() => setFiltersOpen(o => !o)}
            title="Filters"
            aria-expanded={filtersOpen}
            style={{ width: 36, height: 36, flexShrink: 0, position: 'relative' }}
          >
            <Icon name="filter" size={18} />
            {activeFilterCount > 0 && <span className="fs-filter-dot" />}
          </button>
          {filtersOpen && (
            <div className="fs-filter-dropdown">
              <div className="fs-label" style={{ marginBottom: 10 }}>Filters</div>
              <label className="fs-field-label">Period</label>
              <Select size="sm" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} className="fs-filter-select" />
              <label className="fs-field-label" style={{ marginTop: 10 }}>Category</label>
              <Select
                size="sm"
                value={category}
                onChange={setCategory}
                placeholder="All categories"
                options={[{ value: '', label: 'All categories' }, ...categoryList().map(c => ({ value: c, label: c }))]}
                className="fs-filter-select"
              />
              <label className="fs-field-label" style={{ marginTop: 10 }}>Sort</label>
              <Select size="sm" value={sort} onChange={setSort} options={SORT_OPTIONS} className="fs-filter-select" />
              <label className="fs-settings-row">
                <span style={{ fontSize: '0.8125rem' }}>Recurring only</span>
                <button type="button" className={`fs-toggle ${recurringOnly ? 'on' : ''}`} onClick={() => setRecurringOnly(v => !v)} aria-pressed={recurringOnly} />
              </label>
            </div>
          )}
        </div>

        <div className="fs-tab-group fs-tab-group-full" style={{ marginBottom: 14 }}>
          {['all', 'income', 'expense'].map(t => (
            <button
              key={t}
              className={`fs-tab ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
              style={{ flex: 1, textTransform: 'capitalize' }}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="fs-card" style={{ overflow: 'hidden' }}>
        {dataLoading ? (
          <div className="fs-empty"><div className="fs-skeleton" style={{ height: 20, width: 120, margin: '0 auto' }} /></div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon="transactions"
            title="No transactions match"
            description="Adjust filters or log a new transaction."
          />
        ) : groups.map(group => (
          <div key={group.date}>
            <div className="fs-tx-group-header">
              <span>{group.date}</span>
              <span className="fs-money">{group.totalStr}</span>
            </div>
            {group.items.map(tx => (
              <div key={tx.id} className="fs-tx-row">
                <CategoryIcon category={tx.category} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{tx.name}</div>
                  <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{tx.category} · {tx.account}</div>
                </div>
                <div className="fs-money" style={{ fontSize: '0.9rem', fontWeight: 600, color: tx.amountColor, marginRight: 8 }}>{tx.amountStr}</div>
                <button
                  className="fs-btn fs-btn-ghost fs-btn-icon"
                  style={{ width: 32, height: 32, color: 'var(--fs-text-muted)' }}
                  onClick={() => handleDelete(tx.id)}
                  disabled={deleting === tx.id}
                  title="Delete"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
