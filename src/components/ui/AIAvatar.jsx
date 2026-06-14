/** Distinct mark for Kash — separate from the app logo. */
export default function AIAvatar({ size = 32, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'var(--fs-surface-2)',
        border: '1px solid var(--fs-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="var(--fs-brand)" strokeWidth="1.6" />
        <path
          d="M8 14.5c1.2-2.2 2.6-3.3 4-3.3s2.8 1.1 4 3.3"
          fill="none"
          stroke="var(--fs-brand)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="9.2" cy="10.2" r="1.1" fill="var(--fs-brand)" />
        <circle cx="14.8" cy="10.2" r="1.1" fill="var(--fs-brand)" />
      </svg>
    </div>
  );
}
