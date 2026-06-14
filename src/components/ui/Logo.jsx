export default function Logo({ size = 28, showText = false, className = '', style = {} }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <path
          d="M16 2.5 27 8.5v15L16 29.5 5 23.5v-15L16 2.5z"
          fill="var(--fs-primary)"
        />
        <path
          d="M10.5 20.5 14 14.5 17.5 16.5 21.5 11"
          stroke="var(--fs-on-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span style={{ fontFamily: 'var(--fs-font-sans)', fontSize: size * 0.56, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--fs-text)' }}>
          FinSight
        </span>
      )}
    </div>
  );
}
