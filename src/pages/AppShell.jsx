import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { ASSISTANT_NAME } from '../lib/assistant';
import { visibleNav, PAGE_META } from '../lib/nav';
import { readStoredShowAI } from '../lib/appRoute';
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

function formatDate() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function AppShell() {
  const { state, up, setActiveNav, handleSignOut, refreshAppData, setSidebarWidth, setAiPanelWidth, updateSettings } = useApp();
  const { activeNav, showAI, persona, fullName, settings } = state;
  const [showAddTx, setShowAddTx] = useState(false);
  const collapsed = settings.sidebarCollapsed;
  const sections = visibleNav(settings);
  const meta = PAGE_META[activeNav] || PAGE_META.dashboard;

  useEffect(() => {
    if (readStoredShowAI() !== null) return;
    if (settings.openAssistant !== false) up({ showAI: true });
  }, [settings.openAssistant, up]);

  useEffect(() => {
    const allowed = sections.flatMap(s => s.items.map(i => i.id));
    if (!allowed.includes(activeNav)) setActiveNav('dashboard');
  }, [sections, activeNav, setActiveNav]);

  function toggleSidebar() {
    updateSettings({ sidebarCollapsed: !collapsed });
  }

  return (
    <div className={`fs-app ${collapsed ? 'fs-sidebar-is-collapsed' : ''}`}>
      <AddTransactionModal open={showAddTx} onClose={() => setShowAddTx(false)} onSaved={refreshAppData} />

      <aside className={`fs-sidebar fs-sidebar-resizable ${collapsed ? 'collapsed' : ''}`}>
        <div style={{ padding: collapsed ? '20px 12px 14px' : '20px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8 }}>
          {!collapsed && <Logo showText size={26} />}
          <button className="fs-btn fs-btn-ghost fs-btn-icon" onClick={toggleSidebar} title="Toggle menu" style={{ width: 34, height: 34 }}>
            <Icon name="menu" size={18} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: collapsed ? '6px 8px' : '6px 12px', overflowY: 'auto' }}>
          {sections.map(section => (
            <div key={section.label}>
              {!collapsed && <div className="fs-label" style={{ padding: '10px 12px 6px' }}>{section.label}</div>}
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`fs-nav-item ${activeNav === item.id ? 'active' : ''}`}
                  onClick={() => setActiveNav(item.id)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon name={item.icon} size={18} stroke={activeNav === item.id ? 2 : 1.7} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName || 'User'}</div>
                <div className="fs-subtitle" style={{ fontSize: '0.6875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{persona}</div>
              </div>
              <button className="fs-btn fs-btn-ghost fs-btn-icon" onClick={() => setActiveNav('settings')} title="Settings" style={{ width: 34, height: 34, flexShrink: 0 }}>
                <Icon name="settings" size={17} />
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
            <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{activeNav === 'dashboard' ? formatDate() : meta.subtitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className={`fs-btn fs-btn-ai fs-btn-sm ${showAI ? 'active' : ''}`} onClick={() => up({ showAI: !showAI })}>
              <Icon name="message" size={15} />
              {ASSISTANT_NAME}
            </button>
          </div>
        </header>

        <main className="fs-content" key={activeNav}>
          <ViewContent nav={activeNav} />
        </main>
      </div>

      {showAI && (
        <div className="fs-ai-wrap">
          <ResizeHandle edge="left" width={settings.aiPanelWidth} onResize={setAiPanelWidth} min={300} max={520} />
          <AISidebar />
        </div>
      )}

      <button className={`fs-fab ${showAI ? 'with-ai' : ''}`} onClick={() => setShowAddTx(true)} title="Add transaction" aria-label="Add transaction">
        <Icon name="plus" size={22} stroke={2.2} />
      </button>
    </div>
  );
}
