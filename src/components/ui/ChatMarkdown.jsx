import Markdown from 'react-markdown';

const components = {
  p: ({ children }) => <p className="fs-chat-md-p">{children}</p>,
  ul: ({ children }) => <ul className="fs-chat-md-ul">{children}</ul>,
  ol: ({ children }) => <ol className="fs-chat-md-ol">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => <strong className="fs-chat-md-strong">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  h1: ({ children }) => <p className="fs-chat-md-heading">{children}</p>,
  h2: ({ children }) => <p className="fs-chat-md-heading">{children}</p>,
  h3: ({ children }) => <p className="fs-chat-md-subheading">{children}</p>,
  h4: ({ children }) => <p className="fs-chat-md-subheading">{children}</p>,
  blockquote: ({ children }) => <blockquote className="fs-chat-md-quote">{children}</blockquote>,
  hr: () => <hr className="fs-chat-md-hr" />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="fs-chat-md-link">{children}</a>
  ),
  code: ({ className, children }) => {
    const text = String(children).replace(/\n$/, '');
    const isBlock = className || text.includes('\n');
    if (isBlock) {
      return (
        <pre className="fs-chat-md-pre">
          <code>{text}</code>
        </pre>
      );
    }
    return <code className="fs-chat-md-code">{text}</code>;
  },
  pre: ({ children }) => <>{children}</>,
};

export default function ChatMarkdown({ children }) {
  if (!children) return null;
  return (
    <div className="fs-chat-md">
      <Markdown components={components}>{children}</Markdown>
    </div>
  );
}
