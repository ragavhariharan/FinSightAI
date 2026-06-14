import { useEffect, useRef } from 'react';
import { useApp } from '../context';
import { ASSISTANT_NAME } from '../lib/assistant';
import ChatMarkdown from './ui/ChatMarkdown';
import Icon from './ui/Icon';

const SUGGESTIONS = [
  'How much did I spend on food this month?',
  'Log ₹500 spent on groceries',
  'Am I on track with my savings goal?',
  'Where are my biggest spending leaks?',
];

function TypingDots() {
  return (
    <div className="fs-chat-row fs-chat-row-ai">
      <div className="fs-chat-typing">
        {[0, 0.2, 0.4].map((delay, i) => (
          <span key={i} className="fs-dot-bounce" style={{ width: 5, height: 5, background: 'var(--fs-text-muted)', animationDelay: `${delay}s` }} />
        ))}
      </div>
    </div>
  );
}

export default function AISidebar() {
  const { state, up, sendAIMessage } = useApp();
  const { aiMessages, aiInputVal, aiTyping } = state;
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [aiMessages, aiTyping]);

  function sendSuggestion(text) {
    sendAIMessage(text);
  }

  function handleSend() {
    sendAIMessage();
    inputRef.current?.focus();
  }

  const hasUserMessages = aiMessages.some(m => m.role === 'user');

  return (
    <aside className="fs-ai-panel fs-panel-enter">
      <header className="fs-ai-header">
        <div>
          <div className="fs-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {ASSISTANT_NAME}
            <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--fs-brand)' }} />
          </div>
          <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>Always available · Knows your finances</div>
        </div>
        <button className="fs-btn fs-btn-ghost fs-btn-icon" onClick={() => up({ showAI: false })} aria-label="Close" style={{ width: 34, height: 34 }}>
          <Icon name="close" size={16} />
        </button>
      </header>

      <div ref={messagesRef} className="fs-ai-messages">
        {!hasUserMessages && aiMessages.length === 0 && (
          <div className="fs-ai-welcome">
            <div className="fs-ai-welcome-icon">
              <Icon name="message" size={22} />
            </div>
            <div className="fs-ai-welcome-title">How can I help?</div>
            <p className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>
              Log transactions, check budgets, or ask for spending insights.
            </p>
          </div>
        )}
        {aiMessages.map((msg, i) => {
          const isUser = msg.role === 'user';

          if (isUser) {
            return (
              <div key={i} className="fs-chat-row fs-chat-row-user">
                <div className="fs-chat-bubble fs-chat-bubble-user">{msg.text}</div>
              </div>
            );
          }

          return (
            <div key={i} className="fs-chat-row fs-chat-row-ai">
              <div className="fs-chat-ai-content">
                <ChatMarkdown>{msg.text}</ChatMarkdown>
              </div>
            </div>
          );
        })}
        {!hasUserMessages && (
          <div className="fs-ai-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="fs-ai-suggestion" onClick={() => sendSuggestion(s)}>{s}</button>
            ))}
          </div>
        )}
        {aiTyping && <TypingDots />}
      </div>

      <div className="fs-ai-input-wrap">
        <input
          ref={inputRef}
          className="fs-input fs-input-sm"
          value={aiInputVal}
          onChange={e => up({ aiInputVal: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask or log a transaction…"
        />
        <button
          className="fs-btn fs-btn-primary fs-btn-icon"
          onClick={handleSend}
          aria-label="Send"
          style={{ width: 40, height: 40, flexShrink: 0 }}
          disabled={!aiInputVal.trim() && !aiTyping}
        >
          <Icon name="send" size={16} stroke={1.8} />
        </button>
      </div>
    </aside>
  );
}
