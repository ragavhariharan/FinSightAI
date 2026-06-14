import { useState, useEffect } from 'react';
import { useApp } from '../context';
import { FEATURES } from '../lib/settings';
import { ASSISTANT_NAME } from '../lib/assistant';
import { NAV_SECTIONS } from '../lib/nav';
import { PERSONAS, UNIVERSAL_STEPS } from '../lib/onboardingQuestions';
import Icon from '../components/ui/Icon';
import ThemeSwitcher from '../components/ui/ThemeSwitcher';

const SECTIONS = [
  { id: 'general', label: 'General', icon: 'settings' },
  { id: 'features', label: 'Features', icon: 'dashboard' },
  { id: 'layout', label: 'Layout', icon: 'split' },
  { id: 'account', label: 'Account', icon: 'users' },
  { id: 'privacy', label: 'Privacy', icon: 'shield' },
];

const NEWS_OPTIONS = UNIVERSAL_STEPS.find((s) => s.id === 'news_interests')?.options || [];

function SettingCard({ title, description, children }) {
  return (
    <div className="fs-card fs-card-padded fs-settings-card">
      {title && <div className="fs-settings-card-head">
        <h3 className="fs-settings-card-title">{title}</h3>
        {description && <p className="fs-settings-card-desc">{description}</p>}
      </div>}
      {children}
    </div>
  );
}

function SettingRow({ label, hint, action, onClick, children }) {
  const clickable = !!onClick;
  const Tag = clickable ? 'button' : 'div';
  return (
    <Tag
      type={clickable ? 'button' : undefined}
      className={`fs-settings-row ${clickable ? 'fs-settings-row-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="fs-settings-row-main">
        <div className="fs-settings-row-label">{label}</div>
        {hint && <div className="fs-settings-row-hint">{hint}</div>}
        {children}
      </div>
      {action}
    </Tag>
  );
}

function Toggle({ on, onToggle, label }) {
  return (
    <button
      type="button"
      className={`fs-toggle ${on ? 'on' : ''}`}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-pressed={on}
      aria-label={label}
    />
  );
}

function GeneralPanel() {
  return (
    <SettingCard title="Appearance" description="Theme and how amounts are displayed across FinSight.">
      <div className="fs-settings-fields">
        <div className="fs-settings-field-block">
          <div className="fs-field-label">Theme</div>
          <p className="fs-settings-row-hint" style={{ marginBottom: 12 }}>Light, dark, or match your system</p>
          <ThemeSwitcher className="fs-settings-theme" />
        </div>
        <SettingRow
          label="Currency"
          hint="All amounts use Indian Rupee formatting (lakhs/crores style)"
          action={<span className="fs-badge fs-badge-muted">INR · ₹</span>}
        />
      </div>
    </SettingCard>
  );
}

function FeaturesPanel({ settings, onToggleFeature }) {
  return (
    <SettingCard title="App modules" description="Turn features on or off. Disabled items disappear from the sidebar immediately.">
      {FEATURES.map((f) => {
        const enabled = settings.features[f.id] !== false;
        return (
          <SettingRow
            key={f.id}
            label={f.label}
            hint={f.desc}
            onClick={() => onToggleFeature(f.id)}
            action={<Toggle on={enabled} onToggle={() => onToggleFeature(f.id)} label={`${enabled ? 'Disable' : 'Enable'} ${f.label}`} />}
          />
        );
      })}
    </SettingCard>
  );
}

function LayoutPanel({ settings, updateSettings, showAI, up }) {
  const openOnLaunch = settings.openAssistant !== false;

  return (
    <>
      <SettingCard title="Navigation" description={`Sidebar and ${ASSISTANT_NAME} layout preferences.`}>
        <SettingRow
          label="Collapse sidebar"
          hint="Icon-only navigation for more workspace"
          onClick={() => updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })}
          action={
            <Toggle
              on={settings.sidebarCollapsed}
              onToggle={() => updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })}
              label="Collapse sidebar"
            />
          }
        />
        <SettingRow
          label={`Open ${ASSISTANT_NAME} on launch`}
          hint={`Automatically open ${ASSISTANT_NAME} the first time you enter the app each session`}
          onClick={() => updateSettings({ openAssistant: !openOnLaunch })}
          action={
            <Toggle
              on={openOnLaunch}
              onToggle={() => updateSettings({ openAssistant: !openOnLaunch })}
              label={`Open ${ASSISTANT_NAME} on launch`}
            />
          }
        />
        <SettingRow
          label={`Show ${ASSISTANT_NAME} now`}
          hint={`Toggle the ${ASSISTANT_NAME} panel in the current session`}
          onClick={() => up({ showAI: !showAI })}
          action={
            <Toggle
              on={showAI}
              onToggle={() => up({ showAI: !showAI })}
              label={`Show ${ASSISTANT_NAME}`}
            />
          }
        />
      </SettingCard>

      <SettingCard title="Panel sizes" description="Adjust widths or drag the panel edges in the app.">
        <div className="fs-settings-slider-block">
          <div className="fs-settings-slider-head">
            <div>
              <div className="fs-settings-row-label">Sidebar width</div>
              <div className="fs-settings-row-hint">200–360px</div>
            </div>
            <span className="fs-badge fs-badge-muted">{settings.sidebarWidth}px</span>
          </div>
          <input
            type="range"
            className="fs-settings-range"
            min={200}
            max={360}
            step={4}
            value={settings.sidebarWidth}
            onChange={(e) => updateSettings({ sidebarWidth: Number(e.target.value) })}
            aria-label="Sidebar width"
          />
        </div>
        <div className="fs-settings-slider-block">
          <div className="fs-settings-slider-head">
            <div>
              <div className="fs-settings-row-label">{ASSISTANT_NAME} panel width</div>
              <div className="fs-settings-row-hint">300–520px</div>
            </div>
            <span className="fs-badge fs-badge-muted">{settings.aiPanelWidth}px</span>
          </div>
          <input
            type="range"
            className="fs-settings-range"
            min={300}
            max={520}
            step={4}
            value={settings.aiPanelWidth}
            onChange={(e) => updateSettings({ aiPanelWidth: Number(e.target.value) })}
            aria-label={`${ASSISTANT_NAME} panel width`}
          />
        </div>
        <SettingRow
          label="Reset layout"
          hint={`Restore default sidebar and ${ASSISTANT_NAME} sizes`}
          action={
            <button
              type="button"
              className="fs-btn fs-btn-secondary fs-btn-sm"
              onClick={() => updateSettings({ sidebarWidth: 248, aiPanelWidth: 350, sidebarCollapsed: false })}
            >
              Reset
            </button>
          }
        />
      </SettingCard>
    </>
  );
}

function AccountPanel({ fullName, email, persona, questionnaire, updateProfile }) {
  const [name, setName] = useState(fullName || '');
  const [personaChoice, setPersonaChoice] = useState(persona || 'Salaried employee');
  const [interests, setInterests] = useState(questionnaire?.news_interests || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(fullName || '');
    setPersonaChoice(persona || 'Salaried employee');
    setInterests(questionnaire?.news_interests || []);
  }, [fullName, persona, questionnaire]);

  function toggleInterest(option) {
    setInterests((prev) => {
      if (prev.includes(option)) return prev.filter((v) => v !== option);
      return [...prev, option];
    });
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateProfile({
        fullName: name,
        persona: personaChoice,
        questionnaire: { news_interests: interests },
      });
      setSaved(true);
    } catch {
      setError('Could not save profile. Try again.');
    } finally {
      setSaving(false);
    }
  }

  const dirty = name !== (fullName || '')
    || personaChoice !== (persona || 'Salaried employee')
    || JSON.stringify(interests) !== JSON.stringify(questionnaire?.news_interests || []);

  return (
    <form className="fs-settings-form-stack" onSubmit={handleSave}>
      <SettingCard title="Profile" description="Your display name and finance persona used across the app.">
        <div className="fs-settings-fields fs-settings-fields-stack">
          <div className="fs-field">
            <label className="fs-field-label" htmlFor="settings-name">Full name</label>
            <input
              id="settings-name"
              className="fs-input"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              placeholder="Your name"
            />
          </div>
          <div className="fs-field">
            <label className="fs-field-label" htmlFor="settings-email">Email</label>
            <input id="settings-email" className="fs-input" value={email || ''} disabled />
          </div>
          <div className="fs-field">
            <label className="fs-field-label" htmlFor="settings-persona">Finance persona</label>
            <select
              id="settings-persona"
              className="fs-input fs-select"
              value={personaChoice}
              onChange={(e) => { setPersonaChoice(e.target.value); setSaved(false); }}
            >
              {PERSONAS.map((p) => (
                <option key={p.id} value={p.label}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </SettingCard>

      <SettingCard title="News interests" description="Topics used to rank your personalised news feed.">
        <div className="fs-settings-chip-grid">
          {NEWS_OPTIONS.map((opt) => {
            const selected = interests.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                className={`fs-settings-chip ${selected ? 'selected' : ''}`}
                onClick={() => toggleInterest(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <div className="fs-settings-card-footer">
          <div className="fs-settings-form-meta">
            {saved && <span className="fs-settings-saved">Changes saved</span>}
            {error && <span className="fs-settings-error">{error}</span>}
          </div>
          <button type="submit" className="fs-btn fs-btn-brand" disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </SettingCard>
    </form>
  );
}

function PrivacyPanel({
  handleSignOut,
  resetAppSettings,
  exportUserData,
  clearAssistantChat,
}) {
  const [resetting, setResetting] = useState(false);

  function handleResetSettings() {
    if (!window.confirm('Reset all layout and feature preferences to defaults?')) return;
    setResetting(true);
    resetAppSettings();
    setResetting(false);
  }

  return (
    <>
      <SettingCard title="Your data" description="How FinSight stores and handles your information.">
        <SettingRow
          label="Secure storage"
          hint="Transactions and profile data use row-level security in Supabase"
        />
        <SettingRow
          label="No bank logins"
          hint="FinSight never asks for or stores bank credentials"
        />
        <SettingRow
          label="News personalisation"
          hint="Interests from your profile shape which headlines are ranked first"
        />
      </SettingCard>

      <SettingCard title="Data actions">
        <SettingRow
          label="Export my data"
          hint="Download transactions, budgets, and profile as JSON"
          action={
            <button type="button" className="fs-btn fs-btn-secondary fs-btn-sm" onClick={exportUserData}>
              <Icon name="download" size={14} /> Export
            </button>
          }
        />
        <SettingRow
          label={`Clear ${ASSISTANT_NAME} chat`}
          hint="Remove current conversation and start a fresh welcome message"
          action={
            <button type="button" className="fs-btn fs-btn-secondary fs-btn-sm" onClick={clearAssistantChat}>
              Clear chat
            </button>
          }
        />
        <SettingRow
          label="Reset app preferences"
          hint="Theme, layout, feature toggles back to defaults"
          action={
            <button type="button" className="fs-btn fs-btn-secondary fs-btn-sm" onClick={handleResetSettings} disabled={resetting}>
              {resetting ? 'Resetting…' : 'Reset'}
            </button>
          }
        />
      </SettingCard>

      <SettingCard>
        <SettingRow
          label="Log out"
          hint="Sign out of your FinSight account"
          action={
            <button type="button" className="fs-btn fs-btn-secondary fs-btn-sm" onClick={handleSignOut} style={{ color: 'var(--fs-danger)' }}>
              <Icon name="logout" size={14} />
              Log out
            </button>
          }
        />
      </SettingCard>
    </>
  );
}

export default function Settings() {
  const {
    state,
    up,
    updateSettings,
    setActiveNav,
    handleSignOut,
    updateProfile,
    resetAppSettings,
    exportUserData,
    clearAssistantChat,
  } = useApp();
  const { settings, fullName, user, persona, questionnaire, activeNav, showAI } = state;
  const email = user?.email || '';
  const [section, setSection] = useState('general');

  function toggleFeature(id) {
    const enabled = settings.features[id] !== false;
    updateSettings({ features: { [id]: !enabled } });
    if (enabled) {
      const navItem = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.feature === id);
      if (navItem && activeNav === navItem.id) setActiveNav('dashboard');
    }
  }

  const panelProps = {
    general: <GeneralPanel />,
    features: <FeaturesPanel settings={settings} onToggleFeature={toggleFeature} />,
    layout: <LayoutPanel settings={settings} updateSettings={updateSettings} showAI={showAI} up={up} />,
    account: (
      <AccountPanel
        fullName={fullName}
        email={email}
        persona={persona}
        questionnaire={questionnaire}
        updateProfile={updateProfile}
      />
    ),
    privacy: (
      <PrivacyPanel
        handleSignOut={handleSignOut}
        resetAppSettings={resetAppSettings}
        exportUserData={exportUserData}
        clearAssistantChat={clearAssistantChat}
      />
    ),
  };

  return (
    <div className="fs-content-inner fs-view-enter fs-settings-page">
      <div className="fs-settings-layout">
        <nav className="fs-card fs-card-padded fs-settings-nav" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`fs-settings-nav-item ${section === s.id ? 'active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              <Icon name={s.icon} size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div className="fs-settings-panels">
          {panelProps[section]}
        </div>
      </div>
    </div>
  );
}
