import { TopBar } from '../components/layout/TopBar';
import './Home.css';

export function HomePage() {

  // Placeholder time — will be replaced with real timetable data
  const greeting = getGreeting();

  return (
    <>
      <TopBar
        title="yuni"
        actions={
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => window.open('https://saris.muhas.ac.tz', '_blank')}
            aria-label="Open SARIS"
          >
            SARIS ↗
          </button>
        }
      />
      <div className="page__content">
        {/* Greeting */}
        <section className="home-greeting">
          <h2 className="home-greeting__text">
            {greeting} 👋
          </h2>
          <p className="text-muted">Here's your day at a glance</p>
        </section>

        {/* Next Class Card */}
        <section className="home-section">
          <div className="card home-next-class">
            <div className="home-next-class__header">
              <span className="badge badge--blue">Next class</span>
              <span className="num text-muted" style={{ fontSize: 13 }}>in 2h 15m</span>
            </div>
            <h3 style={{ marginTop: 8 }}>Human Anatomy I</h3>
            <p className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>
              LT 3 · 10:00 – 12:00
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn--primary btn--sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                Directions
              </button>
              <button className="btn btn--ghost btn--sm">Full timetable</button>
            </div>
          </div>
        </section>

        {/* Due Soon */}
        <section className="home-section">
          <h3>Due soon</h3>
          <div className="card card--flat" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>Physiology Lab Report</p>
                <p className="text-faint" style={{ fontSize: 13 }}>Due in 2 days</p>
              </div>
              <span className="badge badge--pending">Pending</span>
            </div>
          </div>
        </section>

        {/* Agent Nudge */}
        <section className="home-section">
          <div className="proposal">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar avatar--sm" aria-hidden="true">Y</div>
              <strong>Study suggestion</strong>
            </div>
            <p style={{ marginTop: 8, fontSize: 14 }}>
              Your Anatomy test is in 3 days. Start with cranial nerves — you scored 40% last time.
            </p>
            <div className="proposal__actions">
              <button className="btn btn--primary btn--sm">Start review</button>
              <button className="btn btn--ghost btn--sm">Dismiss</button>
            </div>
          </div>
        </section>

        {/* Sync Status */}
        <section className="home-section home-sync">
          <span className="badge badge--synced">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            All synced
          </span>
          <span className="text-faint" style={{ fontSize: 12 }}>Updated just now</span>
        </section>
      </div>
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
