export default function Logo({ size = 28, showText = false, className = '', style = {} }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="8" fill="var(--fs-brand)" />
        <path d="M6 20L11 13L16 16.5L22 8" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {showText && (
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: size * 0.56, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--fs-text)' }}>
          FinSight
        </span>
      )}
    </div>
  );
}
