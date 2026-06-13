import { useApp } from '../context';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';

function MiniSpark() {
  return (
    <svg viewBox="0 0 200 48" style={{ width: '100%', height: 44 }} preserveAspectRatio="none">
      <path d="M0 40 L24 34 L48 36 L72 26 L96 28 L120 16 L144 18 L168 8 L200 4 L200 48 L0 48 Z" fill="var(--fs-brand-soft)" />
      <path d="M0 40 L24 34 L48 36 L72 26 L96 28 L120 16 L144 18 L168 8 L200 4"
        fill="none" stroke="var(--fs-brand)" strokeWidth="2" strokeLinecap="round"
        style={{ strokeDasharray: 320, strokeDashoffset: 320, animation: 'fs-draw 1.5s var(--fs-ease) 0.3s forwards' }} />
    </svg>
  );
}

export default function Landing() {
  const { goTo, tryDemo } = useApp();

  return (
    <div className="fs-page">
      <nav className="fs-landing-nav">
        <Logo showText size={30} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="fs-btn fs-btn-ghost" onClick={() => goTo('auth', { authMode: 'login' })}>Sign in</button>
          <button className="fs-btn fs-btn-primary" onClick={() => goTo('auth', { authMode: 'signup' })}>Get started</button>
        </div>
      </nav>

      <section className="fs-hero-grid">
        <div className="fs-animate-in">
          <span className="fs-badge fs-badge-brand" style={{ marginBottom: 24 }}>
            <span className="fs-badge-dot" />
            AI-powered · Built for India
          </span>
          <h1 className="fs-hero-title">The modern way<br />to manage money.</h1>
          <p className="fs-subtitle" style={{ fontSize: '1.125rem', marginBottom: 32, maxWidth: 460 }}>
            Track budgets, log spending by chat, and get insights tailored to how you actually
            earn and spend — all in one clear, calm dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            <button className="fs-btn fs-btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={() => goTo('auth', { authMode: 'signup' })}>
              Get started free
            </button>
            <button className="fs-btn fs-btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={tryDemo}>
              Try live demo
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="fs-subtitle" style={{ fontSize: '0.8125rem', marginRight: 4 }}>Built for</span>
            {['Students', 'Salaried', 'Gig earners', 'Business'].map(t => (
              <span key={t} className="fs-badge fs-badge-muted">{t}</span>
            ))}
          </div>
        </div>

        <div className="fs-animate-in fs-animate-in-delay-2">
          <div className="fs-mockup">
            <div style={{ height: 42, background: 'var(--fs-surface-2)', borderBottom: '1px solid var(--fs-border)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 7 }}>
              {['#D0D5DD', '#D0D5DD', '#D0D5DD'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span className="fs-subtitle" style={{ fontSize: '0.72rem', marginLeft: 'auto' }}>app.finsight.in</span>
            </div>
            <div style={{ padding: 20 }}>
              <div className="fs-card fs-card-padded fs-card-accent" style={{ marginBottom: 14, padding: 16 }}>
                <div className="fs-label" style={{ color: 'var(--fs-brand)', marginBottom: 8 }}>Monthly briefing</div>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--fs-text-secondary)' }}>
                  On track to save <b style={{ color: 'var(--fs-text)' }}>₹18,664</b> this month — 28.7% of take-home. 2 spending leaks spotted.
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { l: 'Health', v: '72' },
                  { l: 'Spend', v: '₹46.3k' },
                  { l: 'Saved', v: '28.7%' },
                ].map(s => (
                  <div key={s.l} className="fs-card" style={{ padding: '12px 14px' }}>
                    <div className="fs-label" style={{ fontSize: '0.6rem' }}>{s.l}</div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.05rem', fontWeight: 700, marginTop: 4 }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="fs-card fs-card-padded" style={{ padding: 16 }}>
                <div className="fs-label" style={{ marginBottom: 8 }}>Savings forecast</div>
                <MiniSpark />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 48px 8px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
          {[
            { v: '4', l: 'Finance personas' },
            { v: '< 3 min', l: 'To set up' },
            { v: '100%', l: 'Chat-first logging' },
            { v: '₹0', l: 'To get started' },
          ].map((s, i) => (
            <div key={s.l} className={`fs-animate-in fs-animate-in-delay-${Math.min(i + 1, 4)}`}>
              <div className="fs-h1" style={{ fontSize: '2rem', color: 'var(--fs-brand)' }}>{s.v}</div>
              <div className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '64px 48px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }} className="fs-animate-in">
            <span className="fs-label" style={{ color: 'var(--fs-brand)' }}>Why FinSight</span>
            <h2 className="fs-h1" style={{ fontSize: '2.2rem', margin: '12px 0' }}>Everything you need to stay on budget</h2>
            <p className="fs-subtitle" style={{ fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>Simple tracking, smart categories, and an AI that actually understands your money.</p>
          </div>
          <div className="fs-feature-grid">
            {[
              { icon: 'users', title: 'Persona-aware setup', desc: 'Onboarding adapts to students, salaried workers, gig earners, and business owners — for advice that fits your reality.' },
              { icon: 'message', title: 'Chat to log spending', desc: 'Say "I spent ₹500 on groceries" — FinSight categorizes it and updates your dashboard instantly. No forms.' },
              { icon: 'trendUp', title: 'Live budget tracking', desc: 'Dashboard, reports, and category budgets stay in perfect sync with every transaction you add.' },
            ].map((f, i) => (
              <div key={f.title} className={`fs-card fs-feature-card fs-animate-in fs-animate-in-delay-${i + 1}`}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--fs-brand-soft)', border: '1px solid var(--fs-brand-border)', color: 'var(--fs-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Icon name={f.icon} size={22} />
                </div>
                <h3 className="fs-h3" style={{ marginBottom: 10 }}>{f.title}</h3>
                <p className="fs-subtitle">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 48px 80px' }}>
        <div className="fs-card fs-animate-in" style={{ maxWidth: 920, margin: '0 auto', padding: '56px 48px', textAlign: 'center' }}>
          <h2 className="fs-h1" style={{ fontSize: '2rem', marginBottom: 14 }}>Start tracking in 3 minutes</h2>
          <p className="fs-subtitle" style={{ fontSize: '1.05rem', marginBottom: 30, maxWidth: 460, margin: '0 auto 30px' }}>
            No bank login required. Set up your profile, add a few transactions, and let the copilot do the rest.
          </p>
          <button className="fs-btn fs-btn-primary" style={{ padding: '15px 36px', fontSize: '1rem' }} onClick={() => goTo('auth', { authMode: 'signup' })}>
            Create free account
          </button>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--fs-border)', padding: '26px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Logo showText size={22} />
        <span className="fs-subtitle" style={{ fontSize: '0.8125rem' }}>© 2025 FinSight AI · Built for India</span>
      </footer>
    </div>
  );
}
