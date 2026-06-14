import { useApp } from '../../context';
import { THEME_OPTIONS } from '../../lib/settings';
import Icon from './Icon';

const THEME_ICONS = { light: 'sun', dark: 'moon', system: 'monitor' };

export default function ThemeSwitcher({ variant = 'tabs', className = '' }) {
  const { state, updateSettings } = useApp();
  const theme = state.settings?.theme || 'system';

  function setTheme(next) {
    updateSettings({ theme: next });
  }

  if (variant === 'icons') {
    return (
      <div className={`fs-theme-switcher fs-theme-switcher-icons ${className}`.trim()} role="group" aria-label="Theme">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`fs-theme-btn ${theme === opt.id ? 'active' : ''}`}
            onClick={() => setTheme(opt.id)}
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={theme === opt.id}
          >
            <Icon name={THEME_ICONS[opt.id]} size={15} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`fs-tab-group fs-theme-switcher-tabs ${className}`.trim()} role="group" aria-label="Theme">
      {THEME_OPTIONS.map(opt => (
        <button
          key={opt.id}
          type="button"
          className={`fs-tab ${theme === opt.id ? 'active' : ''}`}
          onClick={() => setTheme(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
