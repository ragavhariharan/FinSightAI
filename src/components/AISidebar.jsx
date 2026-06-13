import { useEffect, useRef } from 'react';
import { useApp } from '../context';
import { HoverEl } from '../utils';

function TypingDots() {
  return (
    <div style={{ display:'flex', justifyContent:'flex-start' }}>
      <div style={{ background:'#EDEDEA', borderRadius:'4px 14px 14px 14px', padding:'10px 14px', display:'flex', gap:4, alignItems:'center' }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} className="dot-bounce" style={{ width:6, height:6, background:'#9B9B9F', animationDelay:`${delay}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function AISidebar() {
  const { state, up, sendAIMessage } = useApp();
  const { aiMessages, aiInputVal, aiTyping } = state;
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [aiMessages, aiTyping]);

  const QUICK_PROMPTS = [
    'Why am I overspending?',
    'What can I cut?',
    'Savings forecast',
  ];

  return (
    <div style={{ width:284, background:'white', borderLeft:'1px solid #E8E8E2', display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden' }}>
      <div style={{ padding:'16px 18px', borderBottom:'1px solid #E8E8E2', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>AI Copilot</div>
          <div style={{ fontSize:11, color:'#9B9B9F' }}>Powered by FinSight AI</div>
        </div>
        <HoverEl
          as="button"
          onClick={() => up({ showAI:false })}
          style={{ background:'none', border:'none', cursor:'pointer', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, color:'#9B9B9F' }}
          hoverStyle={{ background:'#F5F5F3', color:'#1A1A1A' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </HoverEl>
      </div>

      <div ref={messagesRef} style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
        {aiMessages.map((msg, i) => (
          <div key={i} style={{ display:'flex', justifyContent:msg.role === 'ai' ? 'flex-start' : 'flex-end', animation:'fadeUp 0.25s ease' }}>
            <div style={{
              background:msg.role === 'ai' ? '#F5F5F3' : '#E8570A',
              color:msg.role === 'ai' ? '#1A1A1A' : 'white',
              borderRadius:msg.role === 'ai' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
              padding:'10px 13px', maxWidth:'90%', fontSize:13, lineHeight:1.6,
            }}>{msg.text}</div>
          </div>
        ))}
        {aiTyping && <TypingDots />}
      </div>

      {/* Quick prompts */}
      <div style={{ padding:'10px 14px', borderTop:'1px solid #EEEEEA', display:'flex', flexWrap:'wrap', gap:6 }}>
        {QUICK_PROMPTS.map(p => (
          <HoverEl
            key={p}
            as="button"
            onClick={() => sendAIMessage(p)}
            style={{ background:'#F5F5F3', border:'none', borderRadius:16, padding:'5px 11px', fontSize:12, color:'#4B4B4F', cursor:'pointer', fontFamily:'inherit' }}
            hoverStyle={{ background:'#E8E8E2' }}
          >{p}</HoverEl>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'12px 14px', borderTop:'1px solid #E8E8E2', display:'flex', gap:8, alignItems:'center' }}>
        <input
          value={aiInputVal}
          onChange={e => up({ aiInputVal:e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') sendAIMessage(); }}
          placeholder="Ask anything or log a transaction..."
          style={{ flex:1, padding:'10px 13px', border:'1.5px solid #E8E8E2', borderRadius:10, fontSize:13, color:'#1A1A1A', background:'#FAFAF8', fontFamily:'inherit' }}
        />
        <HoverEl
          as="button"
          onClick={() => sendAIMessage()}
          style={{ background:'#E8570A', color:'white', border:'none', width:36, height:36, borderRadius:9, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
          hoverStyle={{ background:'#C94A06' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14.5 1.5L1.5 7L8 9M14.5 1.5L10.5 14.5L8 9M14.5 1.5L8 9" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </HoverEl>
      </div>
    </div>
  );
}
