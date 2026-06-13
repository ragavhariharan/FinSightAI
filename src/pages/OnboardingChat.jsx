import { useEffect, useRef } from 'react';
import { useApp, PERSONA_SCRIPTS } from '../context';
import { HoverEl } from '../utils';

function TypingDots() {
  return (
    <div style={{ display:'flex', justifyContent:'flex-start' }}>
      <div style={{ background:'#EDEDEA', borderRadius:'4px 16px 16px 16px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} className="dot-bounce" style={{ width:7, height:7, background:'#9B9B9F', animationDelay:`${delay}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function OnboardingChat() {
  const { state, up, sendChatMessage } = useApp();
  const { chatMessages, chatInputVal, chatTyping, chatQuestionIndex, persona } = state;
  const scripts = PERSONA_SCRIPTS[persona] || PERSONA_SCRIPTS['Salaried employee'];
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatMessages, chatTyping]);

  return (
    <div style={{ height:'100vh', background:'#F7F5F2', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid #E8E8E2', padding:'16px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28"><rect width="28" height="28" rx="7" fill="#E8570A" /><path d="M6 20L11 13L16 16.5L22 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          <span style={{ fontSize:16, fontWeight:700 }}>FinSight</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#FFF2EC', borderRadius:20, padding:'5px 14px' }}>
            <span style={{ width:6, height:6, background:'#E8570A', borderRadius:'50%', display:'inline-block' }} />
            <span style={{ fontSize:12, fontWeight:600, color:'#E8570A' }}>{persona}</span>
          </div>
          <span style={{ fontSize:12, color:'#9B9B9F' }}>Question {Math.min(chatQuestionIndex + 1, scripts.length)} of {scripts.length}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', maxWidth:700, width:'100%', margin:'0 auto', padding:'24px 28px', overflow:'hidden' }}>
        <div ref={messagesRef} style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, paddingBottom:8 }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ display:'flex', justifyContent:msg.role === 'ai' ? 'flex-start' : 'flex-end', animation:'fadeUp 0.25s ease' }}>
              <div style={{
                background:msg.role === 'ai' ? '#EDEDEA' : '#E8570A',
                color:msg.role === 'ai' ? '#1A1A1A' : 'white',
                borderRadius:msg.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                padding:'12px 16px', maxWidth:'90%', fontSize:14, lineHeight:1.6,
              }}>{msg.text}</div>
            </div>
          ))}
          {chatTyping && <TypingDots />}
        </div>

        {/* Input */}
        <div style={{ display:'flex', gap:8, paddingTop:16, borderTop:'1px solid #E8E8E2', flexShrink:0 }}>
          <input
            value={chatInputVal}
            onChange={e => up({ chatInputVal:e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(); }}
            placeholder="Type your answer..."
            style={{ flex:1, padding:'12px 16px', border:'1.5px solid #E8E8E2', borderRadius:12, fontSize:15, color:'#1A1A1A', background:'white', fontFamily:'inherit' }}
          />
          <HoverEl
            as="button"
            onClick={sendChatMessage}
            style={{ background:'#E8570A', color:'white', border:'none', width:46, height:46, borderRadius:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
            hoverStyle={{ background:'#C94A06' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16.5 1.5L2 8L9 10.5M16.5 1.5L11.5 16.5L9 10.5M16.5 1.5L9 10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </HoverEl>
        </div>
      </div>
    </div>
  );
}
