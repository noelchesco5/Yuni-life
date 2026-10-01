import { TopBar } from '../components/layout/TopBar';
import { useTheme } from '../context/ThemeContext';
import { useUserRole, type UserRoleKind } from '../context/RoleContext';
import { useInAppBrowser } from '../context/InAppBrowserContext';
import { Graffiti } from '../components/ui/Graffiti';
import './Me.css';

export function MePage() {
  const { theme, setTheme } = useTheme();
  const { currentProfile, setRoleKind } = useUserRole();
  const { openInAppBrowser } = useInAppBrowser();

  return (
    <>
      <TopBar title="Me" />
      <div className="page__content">
        {/* Profile Card with Spec 09 Badge */}
        <div className="me-profile">
          <div className="avatar avatar--lg">{currentProfile.avatar}</div>
          <div className="me-profile__info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2>{currentProfile.name}</h2>
              <Graffiti type="sparkle" color="var(--yuni-sun)" width={16} height={16} />
            </div>
            <p className="text-muted" style={{ fontSize: 14 }}>{currentProfile.scope}</p>

            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <span className="badge badge--blue" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                {currentProfile.isLeader ? 'Leader' : 'Student'}
              </span>
              <span className="badge badge--synced" style={{ fontSize: 10 }}>Verified</span>
            </div>
          </div>
        </div>

        {/* SARIS Button (Spec 09 Section 3: Opens in In-App Browser) */}
        <button
          className="btn btn--primary btn--lg me-saris-btn"
          onClick={() => openInAppBrowser('https://saris2.muhas.ac.tz/', 'SARIS Student Portal · MUHAS')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open SARIS
        </button>
        <p className="text-faint me-saris-note">
          Opens in the secure in-app browser. Yuni never sees your SARIS credentials.
        </p>

        {/* Role & Tab Switcher (Spec 09 Section 3 & 8) */}
        <section className="me-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3>Cabinet & Role Preview</h3>
            <span className="badge badge--blue">Spec 09 RBAC</span>
          </div>
          <p className="text-faint" style={{ fontSize: 12, marginTop: 2 }}>
            Switch roles to test the 3-tab (Student) vs 4-tab (Leader Console) layout:
          </p>

          <div className="me-role-toggle-row">
            {(
              [
                { kind: 'student', label: 'Student (3 tabs)', desc: 'Chat · Home · Me' },
                { kind: 'cr', label: 'CR (4 tabs)', desc: 'Chat · Home · Console · Me' },
                { kind: 'minister', label: 'Minister (4 tabs)', desc: 'Welfare Cabinet Authority' },
              ] as const
            ).map((r) => (
              <button
                key={r.kind}
                className={`me-role-btn ${currentProfile.kind === r.kind ? 'me-role-btn--active' : ''}`}
                onClick={() => setRoleKind(r.kind as UserRoleKind)}
                type="button"
              >
                <strong>{r.label}</strong>
                <span className="text-faint" style={{ fontSize: 11 }}>{r.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section className="me-section">
          <h3>Settings</h3>
          <div className="me-settings">
            {/* Theme */}
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Theme</p>
                <p className="text-faint" style={{ fontSize: 13 }}>
                  {theme === 'system' ? 'Follow system' : theme === 'dark' ? 'Dark' : 'Light (Recommended)'}
                </p>
              </div>
              <div className="me-theme-toggle">
                {(['light', 'system', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    className={`chip ${theme === t ? 'chip--active' : ''}`}
                    onClick={() => setTheme(t)}
                    aria-pressed={theme === t}
                    style={{ minHeight: 32, fontSize: 12, textTransform: 'capitalize' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Language</p>
                <p className="text-faint" style={{ fontSize: 13 }}>English / Swahili (Bilingual)</p>
              </div>
              <span className="chip" style={{ minHeight: 30, fontSize: 12 }}>
                EN / SW
              </span>
            </div>

            {/* Notifications */}
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Venue Rush Alerts</p>
                <p className="text-faint" style={{ fontSize: 13 }}>Push for claim windows</p>
              </div>
              <span className="badge badge--synced">On</span>
            </div>
          </div>
        </section>

        {/* Sync Status */}
        <section className="me-section">
          <h3>Offline Storage</h3>
          <div className="me-settings">
            <div className="me-setting">
              <div>
                <p style={{ fontWeight: 600 }}>Dexie IndexedDB</p>
                <p className="text-faint" style={{ fontSize: 13 }}>Timetable & Studly cache active</p>
              </div>
              <span className="badge badge--synced">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Synced
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="me-footer">
          <p className="text-faint" style={{ fontSize: 12 }}>yuni v0.1.0 · Spec 09 Architecture</p>
          <div style={{ marginTop: 6 }}>
            <Graffiti type="tag-yuni" color="var(--yuni-blue)" />
          </div>
        </div>
      </div>
    </>
  );
}
