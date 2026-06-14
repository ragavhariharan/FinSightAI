import { useState } from 'react';
import Icon from './Icon';

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  className = '',
  id,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="fs-password-wrap">
      <input
        id={id}
        className={`fs-input fs-password-input ${className}`.trim()}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="fs-password-toggle"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={17} />
      </button>
    </div>
  );
}
