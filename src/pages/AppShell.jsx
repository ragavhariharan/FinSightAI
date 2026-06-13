import { useApp } from '../context';
import { HoverEl } from '../utils';
import Dashboard from '../views/Dashboard';
import Transactions from '../views/Transactions';
import Reports from '../views/Reports';
import Budget from '../views/Budget';
import OtherView from '../views/OtherView';
import AISidebar from '../components/AISidebar';

const NAV_ITEMS = [
  {
    id:'dashboard', label:'Dashboard',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><rect x="0" y="0" width="6.5" height="6.5" rx="1.5" /><rect x="8.5" y="0" width="6.5" height="6.5" rx="1.5" /><rect x="0" y="8.5" width="6.5" height="6.5" rx="1.5" /><rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1.5" /></svg>,
  },
  {
    id:'transactions', label:'Transactions',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 3.5h13M1 7.5h8.5M1 11.5h10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    id:'reports', label:'Reports',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="9" width="3" height="5" rx="1" fill="currentColor" /><rect x="6" y="5" width="3" height="9" rx="1" fill="currentColor" /><rect x="11" y="1" width="3" height="13" rx="1" fill="currentColor" /></svg>,
  },
  {
    id:'budget', label:'Budget',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M7.5 1.5A6 6 0 0 1 13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  },
  {
    id:'recurring', label:'Recurring',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 5A6 6 0 1 0 13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M10 3L13 5L10 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    id:'goals', label:'Goals',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" /><circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5" /><circle cx="7.5" cy="7.5" r="1" fill="currentColor" /></svg>,
  },
  {
    id:'copilot', label:'AI Copilot',
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1L9.2 5.6H14.1L10.3 8.2L11.9 12.9L7.5 10.3L3.1 12.9L4.7 8.2L.9 5.6H5.8Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" /></svg>,
  },
];

const PAGE_TITLES = { dashboard:'Dashboard', transactions:'Transactions', reports:'Reports', budget:'Budget', recurring:'Recurring', goals:'Goals', copilot:'AI Copilot' };

function NavItem({ item, active, onClick }) {
  return (
    <HoverEl
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:8,
        cursor:'pointer', fontSize:14, fontWeight:active ? 600 : 500,
        background:active ? '#FFF2EC' : 'transparent', color:active ? '#E8570A' : '#4B4B4F',
        marginBottom:2,
      }}
      hoverStyle={{ background:active ? '#FFF2EC' : '#F5F5F3' }}
    >
      <span style={{ flexShrink:0 }}>{item.icon}</span>
      {item.label}
    </HoverEl>
  );
}

function ViewContent({ nav }) {
  switch (nav) {
    case 'dashboard':    return <Dashboard />;
    case 'transactions': return <Transactions />;
    case 'reports':      return <Reports />;
    case 'budget':       return <Budget />;
    default:             return <OtherView />;
  }
}

export default function AppShell() {
  const { state, up, handleSignOut } = useApp();
  const { activeNav, showAI, persona, fullName, avatarInitials, isDemoMode } = state;
  const pageTitle = PAGE_TITLES[activeNav] || 'Dashboard';
  const isTransactionsView = activeNav === 'transactions';

  function handleNav(id) {
    if (id === 'copilot') {
      up({ showAI:true, activeNav:'dashboard' });
    } else {
      up({ activeNav:id });
    }
  }

  return (
    <div style={{ display:'flex', height:'100vh', background:'#F7F5F2', overflow:'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width:210, background:'white', borderRight:'1px solid #E8E8E2', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #E8E8E2' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" rx="7" fill="#E8570A" /><path d="M6 20L11 13L16 16.5L22 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
            <span style={{ fontSize:16, fontWeight:700, letterSpacing:'-0.3px' }}>FinSight</span>
          </div>
        </div>

        <div style={{ padding:'10px 10px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, background:'#F5F5F3', borderRadius:8, padding:'8px 11px' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#9B9B9F" strokeWidth="1.3" /><path d="M9.5 9.5L12 12" stroke="#9B9B9F" strokeWidth="1.3" strokeLinecap="round" /></svg>
            <span style={{ fontSize:13, color:'#9B9B9F' }}>Search</span>
          </div>
        </div>

        <nav style={{ flex:1, padding:'4px 8px', overflowY:'auto', display:'flex', flexDirection:'column' }}>
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={activeNav === item.id || (item.id === 'copilot' && showAI && activeNav === 'dashboard')}
              onClick={() => handleNav(item.id)}
            />
          ))}
        </nav>

        <div style={{ borderTop:'1px solid #E8E8E2' }}>
          <HoverEl
            style={{ padding:'9px 14px', display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#6E6E73' }}
            hoverStyle={{ background:'#F5F5F3', color:'#1A1A1A' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" /><path d="M5.5 5.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="7" cy="10.5" r="0.6" fill="currentColor" /></svg>
            <span style={{ fontSize:13, fontWeight:500 }}>Help &amp; Support</span>
          </HoverEl>
          <div style={{ padding:'11px 14px', display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'#E8570A', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:700, flexShrink:0 }}>{avatarInitials || 'U'}</div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{fullName || 'User'}</div>
              <div style={{ fontSize:11, color:'#9B9B9F' }}>{persona}</div>
            </div>
            <HoverEl
              as="button"
              onClick={handleSignOut}
              title={isDemoMode ? 'Exit demo' : 'Sign out'}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#9B9B9F', padding:4, fontFamily:'inherit', fontSize:11, fontWeight:600 }}
              hoverStyle={{ color:'#D63B2F' }}
            >{isDemoMode ? 'Exit' : 'Out'}</HoverEl>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {/* Topbar */}
        <div style={{ height:56, background:'white', borderBottom:'1px solid #E8E8E2', display:'flex', alignItems:'center', padding:'0 24px', justifyContent:'space-between', flexShrink:0 }}>
          <h1 style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.3px' }}>{pageTitle}</h1>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {isTransactionsView && (
              <HoverEl
                as="button"
                style={{ background:'#E8570A', color:'white', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit' }}
                hoverStyle={{ background:'#C94A06' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
                Add transaction
              </HoverEl>
            )}
            <HoverEl
              as="button"
              onClick={() => up({ showAI:!showAI })}
              style={{
                background:showAI ? '#FFF2EC' : 'white',
                color:showAI ? '#E8570A' : '#4B4B4F',
                border:showAI ? '1.5px solid #FDDACC' : '1.5px solid #E8E8E2',
                padding:'7px 14px', borderRadius:8, fontSize:13, fontWeight:600,
                cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit',
              }}
              hoverStyle={{ background:showAI ? '#FFF2EC' : '#F5F5F3' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.6 5.4H13.5L9.7 7.9L11.2 12.4L7 9.8L2.8 12.4L4.3 7.9L.5 5.4H5.4Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" /></svg>
              AI
            </HoverEl>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflow:'auto', padding:24 }}>
          <ViewContent nav={activeNav} />
        </div>
      </div>

      {/* AI Sidebar */}
      {showAI && <AISidebar />}
    </div>
  );
}
