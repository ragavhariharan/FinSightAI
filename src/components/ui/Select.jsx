import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  className = '',
  size = 'md',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div
      className={`fs-custom-select ${size === 'sm' ? 'fs-custom-select-sm' : ''} ${className}`}
      ref={ref}
    >
      <button
        type="button"
        className={`fs-custom-select-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'fs-custom-select-placeholder'}>
          {selected?.label ?? placeholder}
        </span>
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className="fs-custom-select-menu" role="listbox">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={String(opt.value) === String(value)}
              className={`fs-custom-select-option ${String(opt.value) === String(value) ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
