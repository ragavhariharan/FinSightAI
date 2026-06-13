import { useApp } from '../context';

const PAGE_TITLES = { recurring:'Recurring', goals:'Goals' };

export default function OtherView() {
  const { state } = useApp();
  const title = PAGE_TITLES[state.activeNav] || state.activeNav;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:400, textAlign:'center' }}>
      <div style={{ width:56, height:56, borderRadius:16, background:'#F5F5F3', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5Z" stroke="#C8C8C0" strokeWidth="1.5" /></svg>
      </div>
      <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{title} coming soon</h3>
      <p style={{ fontSize:14, color:'#9B9B9F', maxWidth:320, lineHeight:1.6 }}>This feature is under development. Ask your AI Copilot about it in the meantime.</p>
    </div>
  );
}
