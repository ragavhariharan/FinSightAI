export default function LoadingSpinner({ message = 'Loading…', size = 36 }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 36 36" style={{ marginBottom: 12, animation: 'spin 0.9s linear infinite' }}>
        <rect width="36" height="36" rx="9" fill="#E8570A" opacity="0.15" />
        <path d="M18 4a14 14 0 0 1 14 14" stroke="#E8570A" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      <p style={{ fontSize: 14, color: '#6E6E73', margin: 0 }}>{message}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
