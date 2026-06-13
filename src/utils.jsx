import { useState } from 'react';

export function HoverEl({ as: Tag = 'div', style, hoverStyle, children, ...props }) {
  const [h, setH] = useState(false);
  const enter = props.onMouseEnter;
  const leave = props.onMouseLeave;
  const rest = { ...props };
  delete rest.onMouseEnter;
  delete rest.onMouseLeave;
  return (
    <Tag
      {...rest}
      style={{ ...style, ...(h ? hoverStyle : {}) }}
      onMouseEnter={(e) => { setH(true); enter?.(e); }}
      onMouseLeave={(e) => { setH(false); leave?.(e); }}
    >
      {children}
    </Tag>
  );
}
