import { TopBar } from '../components/layout/TopBar';
import { useTheme } from '../context/ThemeContext';
import './Me.css';

export function MePage() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <TopBar title="Me" />
      <div className="page__content">
        {/* Profile Card */}
        <div className="me-profile">
          <div className="avatar avatar--lg">JM</div>
          <div className="me-profile__info">
            <h2>John Mwangi</h2>
            <p className="text-muted" style={{ fontSize: 14 }}>MD Year 2 · MUHAS</p>
          </div>
        </div>

        {/* SARIS Button */}
        <button
          className="btn btn--primary btn--lg me-saris-btn"
          onClick={() => window.open('https://saris.muhas.ac.tz', '_blank')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open SARIS
        </button>
        <p className="text-faint me-saris-note">
          Opens in your browser. Yuni never sees your SARIS credentials.
        </p>

        {/* Settings */}
        <section className="me-section">
          <h3>Settings</h3>
          <div className="me-settings">
            {/* Theme */}
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Theme</p>
                <p className="text-faint" style={{ fontSize: 13 }}>
                  {theme === 'system' ? 'Follow system' : theme === 'dark' ? 'Dark' : 'Light'}
                </p>
              </div>
              <div className="me-theme-toggle">
                {(['light', 'system', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    className={`chip ${theme === t ? 'chip--active' : ''}`}
                    onClick={() => setTheme(t)}
                    aria-pressed={theme === t}
                    style={{ minHeight: 32, fontSize: 12 }}
                  >
                    {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '⚙️'} {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Language</p>
                <p className="text-faint" style={{ fontSize: 13 }}>English</p>
              </div>
              <button className="chip" style={{ minHeight: 32, fontSize: 12 }}>
                EN / SW
              </button>
            </div>

            {/* Notifications */}
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Notifications</p>
                <p className="text-faint" style={{ fontSize: 13 }}>Enabled</p>
              </div>
              <span className="badge badge--synced">On</span>
            </div>
          </div>
        </section>

        {/* Sync Status */}
        <section className="me-section">
          <h3>Sync</h3>
          <div className="me-settings">
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Data bundles</p>
                <p className="text-faint" style={{ fontSize: 13 }}>Last synced: just now</p>
              </div>
              <span className="badge badge--synced">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Synced
              </span>
            </div>
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Offline pack</p>
                <p className="text-faint" style={{ fontSize: 13 }}>12.4 MB cached</p>
              </div>
              <button className="btn btn--ghost btn--sm" style={{ fontSize: 12 }}>
                Clear cache
              </button>
            </div>
          </div>
        </section>

        {/* AI & Model Routing */}
        <section className="me-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>AI Companion</h3>
            <span className="badge badge--nemotron">NVIDIA Nemotron</span>
          </div>
          <div className="me-settings">
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Active Cloud Model</p>
                <p className="text-faint" style={{ fontSize: 13 }}>
                  NVIDIA Nemotron 3.5 Lightning (:free)
                </p>
              </div>
              <span className="badge badge--synced">Active</span>
            </div>
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Context Window</p>
                <p className="text-faint" style={{ fontSize: 13 }}>
                  1,000,000 tokens · High yield
                </p>
              </div>
              <span className="badge badge--blue">1M</span>
            </div>
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Fallback Route</p>
                <p className="text-faint" style={{ fontSize: 13 }}>
                  Nemotron 3 Super & Ultra
                </p>
              </div>
              <span className="text-muted" style={{ fontSize: 12 }}>Auto failover</span>
            </div>
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Daily Free Allowance</p>
                <p className="text-faint" style={{ fontSize: 13 }}>
                  1,000 requests / day
                </p>
              </div>
              <span className="badge badge--synced">Generous</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="me-footer">
          <p className="text-faint" style={{ fontSize: 12 }}>yuni v0.1.0 · Made for MUHAS students</p>
          <button className="btn btn--ghost btn--sm" style={{ marginTop: 8, color: 'var(--yuni-alert)', fontSize: 12 }}>
            Delete account
          </button>
        </div>
      </div>
    </>
  );
}
