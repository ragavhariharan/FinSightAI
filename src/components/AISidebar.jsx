import { useEffect, useRef } from 'react';
import { useApp } from '../context';
import Icon from './ui/Icon';

function Avatar({ size = 26, icon = 15 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: 'var(--fs-brand-soft)', border: '1px solid var(--fs-brand-border)', color: 'var(--fs-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="sparkle" size={icon} />
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <Avatar />
      <div className="fs-chat-bubble fs-chat-bubble-ai" style={{ display: 'flex', gap: 5, padding: '13px 16px' }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} className="fs-dot-bounce" style={{ width: 6, height: 6, background: 'var(--fs-text-muted)', animationDelay: `${delay}s` }} />
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
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [aiMessages, aiTyping]);

  return (
    <aside className="fs-ai-panel fs-panel-enter">
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--fs-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Avatar size={36} icon={19} />
          <div>
            <div className="fs-h3" style={{ marginBottom: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              AI Copilot
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--fs-success)' }} />
            </div>
            <div className="fs-subtitle" style={{ fontSize: '0.68rem' }}>Log transactions · Ask anything</div>
          </div>
        </div>
        <button className="fs-btn fs-btn-ghost fs-btn-icon" onClick={() => up({ showAI: false })} aria-label="Close" style={{ width: 34, height: 34 }}>
          <Icon name="close" size={16} />
        </button>
      </div>

      <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {aiMessages.length === 0 && (
          <p className="fs-subtitle" style={{ fontSize: '0.8125rem', textAlign: 'center', marginTop: 24 }}>
            Ask about your budget, log a spend, or get savings tips.
          </p>
        )}
        {aiMessages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: msg.role === 'ai' ? 'flex-start' : 'flex-end' }}>
            {msg.role === 'ai' && <Avatar />}
            <div className={`fs-chat-bubble ${msg.role === 'ai' ? 'fs-chat-bubble-ai' : 'fs-chat-bubble-user'}`}>{msg.text}</div>
          </div>
        ))}
        {aiTyping && <TypingDots />}
      </div>

      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--fs-border)', display: 'flex', gap: 8 }}>
        <input
          className="fs-input fs-input-sm"
          value={aiInputVal}
          onChange={e => up({ aiInputVal: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') sendAIMessage(); }}
          placeholder="Ask or log a transaction…"
        />
        <button className="fs-btn fs-btn-primary fs-btn-icon" onClick={() => sendAIMessage()} aria-label="Send" style={{ width: 38, height: 38, flexShrink: 0 }}>
          <Icon name="send" size={16} stroke={1.8} />
        </button>
      </div>
    </aside>
  );
}
