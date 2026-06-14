import { useApp } from '../context';
import { ASSISTANT_NAME } from '../lib/assistant';
import Logo from '../components/ui/Logo';
import ThemeSwitcher from '../components/ui/ThemeSwitcher';
import ScrollReveal from '../components/ui/ScrollReveal';

const FEATURES = [
  { title: 'Persona-aware onboarding', desc: 'Setup adapts to students, salaried professionals, gig workers, and business owners — categories and advice match how you actually earn.' },
  { title: 'Chat-first transaction logging', desc: 'Type "spent ₹450 on Swiggy" and FinSight categorizes it, updates your budget, and reflects it across every view instantly.' },
  { title: 'Live financial health score', desc: 'A single health gauge tracks savings rate, budget adherence, and spending patterns — updated with every transaction you log.' },
  { title: 'Category budgets with alerts', desc: 'Set monthly limits per category. See progress bars, over-budget warnings, and where your money actually goes each month.' },
  { title: 'Savings goals & challenges', desc: 'Define targets with timelines, track progress visually, and take on spending challenges to build better habits over time.' },
  { title: ASSISTANT_NAME, desc: 'Ask about your finances, get spending insights, log transactions in natural language, and receive persona-tailored savings tips.' },
];

const STEPS = [
  { title: 'Create your profile', desc: 'Answer a short questionnaire about your income, expenses, and financial goals. FinSight builds a persona profile in under three minutes.' },
  { title: 'Log your spending', desc: `Add transactions manually or tell ${ASSISTANT_NAME} what you spent. Categories, budgets, and reports update automatically.` },
  { title: 'Track and improve', desc: 'Review your dashboard, spot spending leaks, monitor net worth, and adjust budgets based on real data — not guesswork.' },
];

const PERSONAS = [
  { label: 'Student', desc: 'Track allowances, part-time income, and campus expenses with budgets tuned for a lean lifestyle.' },
  { label: 'Salaried', desc: 'Manage monthly salary, EMIs, investments, and recurring bills with a clear picture of take-home savings.' },
  { label: 'Gig earner', desc: 'Handle irregular income, tax planning, and variable expenses across multiple earning streams.' },
  { label: 'Business owner', desc: 'Separate personal and business spending, track cash flow, and monitor operational costs alongside savings.' },
];

export default function Landing() {
  const { goTo } = useApp();

  return (
    <div className="fs-page">
      <div className="fs-landing-bg" />
      <div className="fs-landing-wrap">
        <nav className="fs-landing-nav">
          <Logo showText size={30} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeSwitcher variant="icons" />
            <button className="fs-btn fs-btn-ghost" onClick={() => goTo('auth', { authMode: 'login' })}>Sign in</button>
            <button className="fs-btn fs-btn-primary" onClick={() => goTo('auth', { authMode: 'signup' })}>Get started</button>
          </div>
        </nav>

        <section className="fs-hero">
          <div className="fs-hero-inner">
            <div className="fs-hero-head">
              <ScrollReveal>
                <h1 className="fs-hero-display">
                  The modern way<br />
                  <span className="fs-hero-display-accent">to manage money.</span>
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={90}>
                <p className="fs-hero-lead">
                  Track budgets, log spending by chat, and get insights tailored to how you
                  actually earn and spend.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={160}>
                <div className="fs-hero-actions">
                  <button className="fs-btn fs-btn-primary fs-hero-cta" onClick={() => goTo('auth', { authMode: 'signup' })}>
                    Get started free
                  </button>
                  <button className="fs-btn fs-btn-secondary fs-hero-cta" onClick={() => goTo('auth', { authMode: 'login' })}>
                    Sign in
                  </button>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={220}>
                <div className="fs-hero-personas">
                  <span className="fs-subtitle fs-hero-personas-label">Built for</span>
                  {PERSONAS.map(p => (
                    <span key={p.label} className="fs-badge fs-badge-muted">{p.label}</span>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal className="fs-hero-shot" delay={120} scale>
              <img
                className="fs-landing-shot"
                src="/ss.png"
                alt="FinSight dashboard with budgets, savings forecast, and spending breakdown"
                width={3124}
                height={2028}
                loading="eager"
                decoding="async"
              />
            </ScrollReveal>

            <ScrollReveal delay={80}>
              <div className="fs-hero-stats">
                {[
                  { v: '4', l: 'Finance personas' },
                  { v: '< 3 min', l: 'Onboarding time' },
                  { v: '12+', l: 'App modules' },
                  { v: '₹0', l: 'To get started' },
                ].map(s => (
                  <div key={s.l} className="fs-hero-stat">
                    <div className="fs-hero-stat-value">{s.v}</div>
                    <div className="fs-hero-stat-label">{s.l}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="fs-landing-section">
          <div className="fs-landing-section-inner">
            <ScrollReveal>
              <div className="fs-landing-section-header">
                <span className="fs-label" style={{ color: 'var(--fs-brand)' }}>Features</span>
                <h2 className="fs-h1" style={{ fontSize: '2.2rem', margin: '12px 0' }}>Everything you need to stay on budget</h2>
                <p className="fs-subtitle" style={{ fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>
                  From chat-based logging to investment tracking — one app for your entire financial picture.
                </p>
              </div>
            </ScrollReveal>
            <div className="fs-feature-grid">
              {FEATURES.map((f, i) => (
                <ScrollReveal key={f.title} delay={(i % 3) * 70}>
                  <div className="fs-card fs-feature-card fs-card-hover">
                  <h3 className="fs-h3" style={{ marginBottom: 10 }}>{f.title}</h3>
                  <p className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>{f.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="fs-landing-section" style={{ paddingTop: 0 }}>
          <div className="fs-landing-section-inner">
            <ScrollReveal>
              <div className="fs-landing-section-header">
                <span className="fs-label" style={{ color: 'var(--fs-brand)' }}>How it works</span>
                <h2 className="fs-h1" style={{ fontSize: '2rem', margin: '12px 0' }}>Up and running in three steps</h2>
              </div>
            </ScrollReveal>
            <div className="fs-step-grid">
              {STEPS.map((s, i) => (
                <ScrollReveal key={s.title} delay={i * 80}>
                  <div className="fs-card fs-step-card">
                  <h3 className="fs-h3" style={{ marginBottom: 10 }}>{s.title}</h3>
                  <p className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>{s.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="fs-landing-section" style={{ paddingTop: 0 }}>
          <div className="fs-landing-section-inner">
            <ScrollReveal>
              <div className="fs-landing-section-header">
                <span className="fs-label" style={{ color: 'var(--fs-brand)' }}>Personas</span>
                <h2 className="fs-h1" style={{ fontSize: '2rem', margin: '12px 0' }}>Finance that fits your life</h2>
                <p className="fs-subtitle" style={{ fontSize: '1rem', maxWidth: 520, margin: '0 auto' }}>
                  FinSight adjusts categories, budgets, and AI advice based on your earning pattern.
                </p>
              </div>
            </ScrollReveal>
            <div className="fs-persona-grid">
              {PERSONAS.map((p, i) => (
                <ScrollReveal key={p.label} delay={i * 70}>
                  <div className="fs-card fs-persona-card fs-card-hover">
                  <h3 className="fs-h3" style={{ marginBottom: 10 }}>{p.label}</h3>
                  <p className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>{p.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="fs-landing-section" style={{ paddingTop: 0 }}>
          <div className="fs-landing-section-inner">
            <div className="fs-grid-2" style={{ alignItems: 'center' }}>
              <ScrollReveal>
                <div>
                <span className="fs-label" style={{ color: 'var(--fs-brand)' }}>{ASSISTANT_NAME}</span>
                <h2 className="fs-h1" style={{ fontSize: '2rem', margin: '12px 0 16px' }}>Your finances, one conversation away</h2>
                <p className="fs-subtitle" style={{ marginBottom: 24 }}>
                  {ASSISTANT_NAME} lives in a dedicated sidebar panel. Log transactions in plain English,
                  ask how much you spent on food this month, or get personalized savings recommendations
                  based on your persona and spending history.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    'Log spending: "Paid ₹1,200 for electricity bill"',
                    'Query budgets: "Am I over on dining this month?"',
                    'Get insights: "Where can I cut back to save more?"',
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', color: 'var(--fs-text-secondary)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fs-brand)', flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="fs-card fs-card-padded" style={{ background: 'var(--fs-surface-2)' }}>
                <div className="fs-chat-row fs-chat-row-user" style={{ marginBottom: 10 }}>
                  <div className="fs-chat-bubble fs-chat-bubble-user fs-chat-pos-solo">Spent ₹850 on groceries at BigBasket</div>
                </div>
                <div className="fs-chat-row">
                  <div className="fs-chat-bubble fs-chat-bubble-ai fs-chat-pos-solo">
                    Logged ₹850 under Groceries. You have ₹2,150 remaining in your food budget this month.
                  </div>
                </div>
              </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="fs-landing-section" style={{ paddingTop: 0 }}>
          <div className="fs-landing-section-inner">
            <ScrollReveal scale>
              <div className="fs-card-glass" style={{ padding: '56px 48px', textAlign: 'center' }}>
              <h2 className="fs-h1" style={{ fontSize: '2rem', marginBottom: 14 }}>Start tracking in under three minutes</h2>
              <p className="fs-subtitle" style={{ fontSize: '1.05rem', marginBottom: 30, maxWidth: 480, margin: '0 auto 30px' }}>
                No bank login required. Set up your profile, add a few transactions, and let {ASSISTANT_NAME} handle the rest.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="fs-btn fs-btn-primary" style={{ padding: '15px 36px', fontSize: '1rem' }} onClick={() => goTo('auth', { authMode: 'signup' })}>
                  Create free account
                </button>
              </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <footer className="fs-landing-footer">
          <div>
            <Logo showText size={24} />
            <p className="fs-subtitle" style={{ fontSize: '0.8125rem', marginTop: 12, maxWidth: 280 }}>
              AI-powered personal finance built for how Indians earn, spend, and save.
            </p>
          </div>
          <div className="fs-landing-footer-col">
            <h4>Product</h4>
            <button onClick={() => goTo('auth', { authMode: 'signup' })}>Get started</button>
            <button onClick={() => goTo('auth', { authMode: 'login' })}>Sign in</button>
          </div>
          <div className="fs-landing-footer-col">
            <h4>Modules</h4>
            <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--fs-text-secondary)', marginBottom: 8 }}>Dashboard & budgets</span>
            <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--fs-text-secondary)', marginBottom: 8 }}>Transactions & reports</span>
            <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--fs-text-secondary)', marginBottom: 8 }}>Investments & net worth</span>
          </div>
          <div className="fs-landing-footer-col">
            <h4>Security</h4>
            <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--fs-text-secondary)', marginBottom: 8 }}>Encrypted data storage</span>
            <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--fs-text-secondary)', marginBottom: 8 }}>Row-level access control</span>
            <span style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--fs-text-secondary)' }}>No bank credentials required</span>
          </div>
          <div style={{ width: '100%', borderTop: '1px solid var(--fs-border)', paddingTop: 20, marginTop: 8 }}>
            <span className="fs-subtitle" style={{ fontSize: '0.75rem' }}>© 2026 FinSight · Built for India</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
