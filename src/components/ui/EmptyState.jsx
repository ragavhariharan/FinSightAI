import Icon from './Icon';

export default function EmptyState({ icon = 'reports', title, description, action }) {
  return (
    <div className="fs-empty fs-card fs-card-padded fs-animate-in">
      <div className="fs-empty-icon"><Icon name={icon} size={24} /></div>
      <h3 className="fs-h3" style={{ marginBottom: 8 }}>{title}</h3>
      <p className="fs-subtitle" style={{ maxWidth: 380, margin: '0 auto 22px' }}>{description}</p>
      {action}
    </div>
  );
}
