import Icon from './Icon';
import { categoryMeta } from '../../lib/categories';

export default function CategoryIcon({ category, size = 22 }) {
  const meta = categoryMeta(category);
  return (
    <span className="fs-cat-icon" style={{ color: meta.color }}>
      <Icon name={meta.icon} size={size} />
    </span>
  );
}
