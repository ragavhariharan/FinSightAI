import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { visibleNav, PAGE_META } from '../lib/nav';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';
import ResizeHandle from '../components/ResizeHandle';
import AddTransactionModal from '../components/AddTransactionModal';
import AISidebar from '../components/AISidebar';
import Dashboard from '../views/Dashboard';
import Transactions from '../views/Transactions';
import Reports from '../views/Reports';
import Budget from '../views/Budget';
import Accounts from '../views/Accounts';
import Goals from '../views/Goals';
import Recurring from '../views/Recurring';
import NewsFeed from '../views/NewsFeed';
import Stocks from '../views/Stocks';
import MutualFunds from '../views/MutualFunds';
import NetWorth from '../views/NetWorth';
import SpendingChallenges from '../views/SpendingChallenges';
import Settings from '../views/Settings';

function ViewContent({ nav }) {
  switch (nav) {
    case 'dashboard': return <Dashboard />;
    case 'netWorth': return <NetWorth />;
    case 'transactions': return <Transactions />;
    case 'reports': return <Reports />;
    case 'budget': return <Budget />;
    case 'accounts': return <Accounts />;
    case 'stocks': return <Stocks />;
    case 'mutualFunds': return <MutualFunds />;
    case 'news': return <NewsFeed />;
    case 'recurring': return <Recurring />;
    case 'goals': return <Goals />;
    case 'challenges': return <SpendingChallenges />;
    case 'settings': return <Settings />;
    default: return <Dashboard />;
  }
}

export default function AppShell() {
  const { state, up, handleSignOut, refreshAppData, setSidebarWidth, setAiPanelWidth, updateSettings } = useApp();
  const { activeNav, showAI, persona, fullName, avatarInitials, isDemoMode, settings } = state;
  const [showAddTx, setShowAddTx] = useState(false);
  const collapsed = settings.sidebarCollapsed;
  const sections = visibleNav(settings);
  const meta = PAGE_META[activeNav] || PAGE_META.dashboard;

  useEffect(() => {
    const allowed = sections.flatMap(s => s.items.map(i => i.id));
    if (!allowed.includes(activeNav)) up({ activeNav: 'dashboard' });
  }, [sections, activeNav, up]);

  function toggleSidebar() {
    updateSettings({ sidebarCollapsed: !collapsed });
  }

  return (
    <div className={`fs-app ${collapsed ? 'fs-sidebar-is-collapsed' : ''}`}>
      <AddTransactionModal open={showAddTx} onClose={() => setShowAddTx(false)} onSaved={refreshAppData} />

      <aside className={`fs-sidebar fs-sidebar-resizable ${collapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: collapsed ? '20px 12px 14px' : '20px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8 }}>
          {!collapsed && <Logo showText size={28} />}
          <button className="fs-btn fs-btn-ghost fs-btn-icon" onClick={toggleSidebar} title="Toggle menu" style={{ width: 34, height: 34 }}>
            <Icon name="menu" size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: collapsed ? '6px 8px' : '6px 14px', overflowY: 'auto' }}>
          {sections.map(section => (
            <div key={section.label}>
              {!collapsed && <div className="fs-label" style={{ padding: '8px 12px 6px' }}>{section.label}</div>}
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`fs-nav-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => up({ activeNav: item.id })}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon name={item.icon} size={18} stroke={activeNav === item.id ? 2 : 1.7} />
                  {!collapsed && item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div style={{ borderTop: '1px solid var(--fs-border)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--fs-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{avatarInitials || 'U'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName || 'User'}</div>
                <div className="fs-subtitle" style={{ fontSize: '0.6875rem' }}>{persona}</div>
              </div>
              <button className="fs-btn fs-btn-ghost fs-btn-icon" onClick={handleSignOut} title={isDemoMode ? 'Exit demo' : 'Sign out'} style={{ width: 34, height: 34 }}>
                <Icon name="logout" size={17} />
              </button>
            </div>
          </div>
        )}

        {!collapsed && (
          <ResizeHandle edge="right" width={settings.sidebarWidth} onResize={setSidebarWidth} min={200} max={360} />
        )}
      </aside>

      <div className="fs-main">
        <header className="fs-topbar">
          <div>
            <h1 className="fs-page-title">{meta.title}</h1>
            <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{meta.subtitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isDemoMode && <span className="fs-badge fs-badge-muted">Demo mode</span>}
            <button className={`fs-btn fs-btn-ai fs-btn-sm ${showAI ? 'active' : ''}`} onClick={() => up({ showAI: !showAI })}>
              <Icon name="sparkle" size={15} />
              AI Copilot
            </button>
          </div>
        </header>

        <main className="fs-content" key={activeNav}>
          <ViewContent nav={activeNav} />
        </main>
      </div>

      {showAI && (
        <div className="fs-ai-wrap">
          <ResizeHandle edge="left" width={settings.aiPanelWidth} onResize={setAiPanelWidth} min={280} max={520} />
          <AISidebar />
        </div>
      )}

      <button className={`fs-fab ${showAI ? 'with-ai' : ''}`} onClick={() => setShowAddTx(true)} title="Add transaction" aria-label="Add transaction">
        <Icon name="plus" size={22} stroke={2.2} />
      </button>
    </div>
  );
}
