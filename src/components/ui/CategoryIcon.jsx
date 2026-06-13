import Icon from './Icon';
import { categoryMeta, tint } from '../../lib/categories';

export default function CategoryIcon({ category, size = 40, iconSize = 19 }) {
  const meta = categoryMeta(category);
  return (
    <div
      className="fs-tx-icon"
      style={{ width: size, height: size, background: tint(meta.color, 0.1), color: meta.color }}
    >
      <Icon name={meta.icon} size={iconSize} />
    </div>
  );
}
