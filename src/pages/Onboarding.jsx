import { useMemo } from 'react';
import { useApp } from '../context';
import Logo from '../components/ui/Logo';
import {
  personaIdFromLabel,
  personaLabelFromId,
  visibleSteps,
  isStepComplete,
} from '../lib/onboardingQuestions';

function CheckboxOption({ label, checked, onChange, disabled }) {
  return (
    <button type="button" className={`fs-mcq-option ${checked ? 'selected' : ''}`} onClick={() => !disabled && onChange()} style={{ opacity: disabled && !checked ? 0.45 : 1 }}>
      <div className="fs-mcq-radio" style={{ borderRadius: 4, width: 20, height: 20 }}>
        {checked && <svg width="11" height="9" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
      </div>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
    </button>
  );
}

export default function Onboarding() {
  const { state, up, submitOnboardingStep, finishQuestionnaire } = useApp();
  const { onboardingStep, questionnaire = {}, persona } = state;

  const personaId = questionnaire.persona
    ? personaIdFromLabel(questionnaire.persona)
    : personaIdFromLabel(persona);

  const steps = useMemo(() => visibleSteps(personaId, questionnaire), [personaId, questionnaire]);
  const step = steps[onboardingStep] || steps[0];
  const progress = steps.length ? ((onboardingStep + 1) / steps.length) * 100 : 0;
  const isLast = onboardingStep >= steps.length - 1;

  function setAnswer(key, value) {
    up({ questionnaire: { ...questionnaire, [key]: value } });
  }

  function toggleCheckbox(key, option, max, exclusive) {
    const current = questionnaire[key] || [];
    if (exclusive && option === exclusive) {
      setAnswer(key, current.includes(exclusive) ? [] : [exclusive]);
      return;
    }
    let next = current.filter(v => v !== exclusive);
    if (next.includes(option)) next = next.filter(v => v !== option);
    else if (!max || next.length < max) next = [...next, option];
    setAnswer(key, next);
  }

  function handleNext() {
    if (!isStepComplete(step, questionnaire)) return;
    if (step.id === 'persona') {
      const pid = personaIdFromLabel(questionnaire.persona);
      up({ persona: personaLabelFromId(pid) });
    }
    if (isLast) finishQuestionnaire();
    else submitOnboardingStep(onboardingStep + 1);
  }

  function handleBack() {
    if (onboardingStep > 0) submitOnboardingStep(onboardingStep - 1);
  }

  const canNext = isStepComplete(step, questionnaire);

  return (
    <div className="fs-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 24px', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 580, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }} className="fs-animate-in">
        <Logo showText />
        <span className="fs-badge fs-badge-muted">Step {onboardingStep + 1} of {steps.length}</span>
      </div>

      <div style={{ width: '100%', maxWidth: 580, height: 6, background: 'var(--fs-surface-3)', borderRadius: 99, marginBottom: 46, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--fs-brand)', borderRadius: 99, transition: 'width 0.45s var(--fs-ease)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 580 }} className="fs-view-enter" key={step?.id}>
        <h2 className="fs-h1" style={{ marginBottom: step.subtitle ? 8 : 28, lineHeight: 1.25 }}>{step.title}</h2>
        {step.subtitle && <p className="fs-subtitle" style={{ marginBottom: 28 }}>{step.subtitle}</p>}

        {step.type === 'radio' && step.options.map((text) => {
          const sel = questionnaire[step.id] === text;
          return (
            <button key={text} className={`fs-mcq-option ${sel ? 'selected' : ''}`} onClick={() => setAnswer(step.id, text)}>
              <div className="fs-mcq-radio">{sel && <svg width="11" height="9" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}</div>
              <span style={{ flex: 1 }}>{text}</span>
            </button>
          );
        })}

        {step.type === 'checkbox' && step.options.map((text) => (
          <CheckboxOption
            key={text}
            label={text}
            checked={(questionnaire[step.id] || []).includes(text)}
            disabled={step.max && (questionnaire[step.id] || []).length >= step.max && !(questionnaire[step.id] || []).includes(text)}
            onChange={() => toggleCheckbox(step.id, text, step.max, step.exclusive)}
          />
        ))}

        {step.type === 'currency' && (
          <div className="fs-field">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--fs-text-secondary)' }}>₹</span>
              <input
                className="fs-input"
                type="number"
                style={{ paddingLeft: 36, fontSize: '1.1rem' }}
                placeholder={step.placeholder || '0'}
                value={questionnaire[step.id] ?? ''}
                onChange={e => setAnswer(step.id, e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          {onboardingStep > 0 && (
            <button className="fs-btn fs-btn-secondary" style={{ flex: 1 }} onClick={handleBack}>Back</button>
          )}
          <button className="fs-btn fs-btn-primary" style={{ flex: 2 }} onClick={handleNext} disabled={!canNext}>
            {isLast ? 'Finish setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
