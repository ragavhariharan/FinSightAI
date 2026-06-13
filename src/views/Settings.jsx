import { useApp } from '../context';
import { FEATURES, saveSettings } from '../lib/settings';

export default function Settings() {
  const { state, updateSettings } = useApp();
  const { settings } = state;

  function toggleFeature(id) {
    const next = saveSettings({ features: { [id]: !settings.features[id] } });
    updateSettings(next);
  }

  function setTheme(theme) {
    const next = saveSettings({ theme });
    updateSettings(next);
  }

  return (
    <div className="fs-content-inner fs-view-enter">
      <div className="fs-card fs-card-padded fs-animate-in" style={{ marginBottom: 18 }}>
        <div className="fs-label" style={{ marginBottom: 14 }}>Appearance</div>
        <div className="fs-tab-group" style={{ maxWidth: 280 }}>
          <button className={`fs-tab ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>Light</button>
          <button className={`fs-tab ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
        </div>
      </div>

      <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-1">
        <div className="fs-label" style={{ marginBottom: 6 }}>Features</div>
        <p className="fs-subtitle" style={{ marginBottom: 18, fontSize: '0.8125rem' }}>Toggle modules on or off. Disabled features are hidden from the sidebar.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES.map(f => (
            <label key={f.id} className="fs-settings-row">
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{f.label}</div>
                <div className="fs-subtitle" style={{ fontSize: '0.75rem' }}>{f.desc}</div>
              </div>
              <button
                type="button"
                className={`fs-toggle ${settings.features[f.id] !== false ? 'on' : ''}`}
                onClick={() => toggleFeature(f.id)}
                aria-pressed={settings.features[f.id] !== false}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-2" style={{ marginTop: 18 }}>
        <div className="fs-label" style={{ marginBottom: 8 }}>Layout</div>
        <p className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>Drag the edges of the sidebar and AI copilot panel to resize them. Use the menu icon to collapse the sidebar.</p>
      </div>

      <div className="fs-card fs-card-padded fs-animate-in fs-animate-in-delay-3" style={{ marginTop: 18 }}>
        <div className="fs-label" style={{ marginBottom: 8 }}>Data & privacy</div>
        <p className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>
          Your questionnaire answers and transactions are stored securely. News interests from onboarding power your feed.
        </p>
      </div>
    </div>
  );
}
