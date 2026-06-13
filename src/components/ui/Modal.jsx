export default function Modal({ open, onClose, title, subtitle, children, footer }) {
  if (!open) return null;

  return (
    <div className="fs-overlay fs-overlay-enter" onClick={onClose}>
      <div className="fs-modal fs-modal-enter" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        {title && (
          <div style={{ marginBottom: 22 }}>
            <h2 className="fs-h2" style={{ marginBottom: subtitle ? 4 : 0 }}>{title}</h2>
            {subtitle && <p className="fs-subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
        {footer}
      </div>
    </div>
  );
}
