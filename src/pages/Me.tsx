import { useState, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { useTheme } from '../context/ThemeContext';
import { useUserRole, type UserRoleKind } from '../context/RoleContext';
import { useInAppBrowser } from '../context/InAppBrowserContext';
import { Graffiti } from '../components/ui/Graffiti';
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from '../components/ui/Icons';
import './Me.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function MePage() {
  const { theme, setTheme } = useTheme();
  const { currentProfile, setRoleKind } = useUserRole();
  const { openInAppBrowser } = useInAppBrowser();

  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showRoleDrawer, setShowRoleDrawer] = useState(false);

  // PWA Install & Local Network Share
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Yuni PWA:\n• On iOS Safari: Tap Share ⎋ → "Add to Home Screen ⊞"\n• On Chrome/Android: Tap Menu ⋮ → "Install app"');
    }
  };

  const localShareUrl = `http://10.10.15.186:5173/`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(localShareUrl);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  return (
    <>
      <TopBar
        title="Me"
        actions={
          <button
            className="topbar-dev-badge"
            onClick={() => setShowRoleDrawer(!showRoleDrawer)}
            title="Toggle Role Delegation Simulator"
            type="button"
          >
            <span>{currentProfile.isLeader ? currentProfile.title.split(',')[0] : 'Student'}</span>
            <span className="topbar-dev-chip">Role ▾</span>
          </button>
        }
      />

      <div className="me-canvas">
        {/* 1. TACTILE MUHAS DIGITAL STUDENT PASS */}
        <section className="me-pass-section" aria-label="Digital Student Pass">
          <div
            className={`me-digital-pass ${isCardFlipped ? 'me-digital-pass--flipped' : ''}`}
            onClick={() => setIsCardFlipped(!isCardFlipped)}
            role="button"
            tabIndex={0}
            aria-label="Tap to flip student pass"
          >
            <div className="me-pass-inner">
              {/* Front of Pass */}
              <div className="me-pass-face me-pass-face--front">
                <div className="me-pass-header">
                  <div>
                    <span className="me-pass-univ">MUHIMBILI UNIVERSITY</span>
                    <span className="me-pass-type">STUDENT IDENTITY PASS</span>
                  </div>
                  <div className="me-pass-seal">
                    <ShieldCheckIcon size={20} color="var(--yuni-sun)" strokeWidth={2.2} />
                  </div>
                </div>

                <div className="me-pass-body">
                  <div className="me-pass-avatar-box">
                    <span className="me-pass-initials">{currentProfile.avatar}</span>
                  </div>
                  <div className="me-pass-details">
                    <h2 className="me-pass-name">{currentProfile.name}</h2>
                    <p className="me-pass-regno">REG NO: 2024-04-01928</p>
                    <p className="me-pass-prog">MD · Doctor of Medicine · Year 2</p>
                  </div>
                </div>

                <div className="me-pass-footer">
                  <div className="me-pass-status">
                    <CheckCircleIcon size={12} color="var(--yuni-teal)" strokeWidth={2.5} />
                    <span>Dexie Offline Synced</span>
                  </div>
                  <span className="me-pass-flip-hint">Tap to view barcode ↻</span>
                </div>
              </div>

              {/* Back of Pass (Library & Exam Barcode) */}
              <div className="me-pass-face me-pass-face--back">
                <div className="me-pass-header">
                  <span className="me-pass-univ">CAMPUS ACCESS BARCODE</span>
                  <span className="me-pass-type">VALID 2025/2026</span>
                </div>

                {/* Simulated Laser Barcode */}
                <div className="me-pass-barcode-container">
                  <div className="me-pass-barcode-bars" aria-hidden="true" />
                  <span className="me-pass-barcode-num">20240401928001</span>
                </div>

                <p className="me-pass-back-notice">
                  Official digital identification for MUHAS library entry, clinical laboratory access, and examination hall roll call.
                </p>

                <div className="me-pass-footer">
                  <span className="me-pass-flip-hint">Tap to view pass front ↻</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SARIS 2.0 DIRECT PORTAL TILE */}
        <section className="me-saris-card">
          <div className="me-saris-header">
            <div>
              <span className="me-saris-tag">OFFICIAL PORTAL</span>
              <h3 className="me-saris-title">MUHAS SARIS 2.0</h3>
              <p className="me-saris-sub">
                Course registration, continuous assessment (CA) & semester examination results.
              </p>
            </div>
            <button
              className="btn btn--primary btn--sm me-saris-launch-btn"
              onClick={() => openInAppBrowser('https://saris2.muhas.ac.tz/', 'SARIS Portal · MUHAS')}
              type="button"
            >
              <span>Launch</span>
              <ExternalLinkIcon size={14} strokeWidth={2.2} />
            </button>
          </div>
        </section>

        {/* 3. ENROLLED CLINICAL COURSES */}
        <section className="me-courses-section">
          <div className="me-section-subhead">
            <span className="me-subhead-text">ENROLLED COURSES · SEMESTER II</span>
            <span className="badge badge--blue" style={{ fontSize: 10 }}>15 Credits</span>
          </div>

          <div className="me-course-list">
            {[
              { code: 'AN 201', name: 'Gross Anatomy & Embryology', credits: '5 Cr', lab: 'Histology Lab B' },
              { code: 'PH 202', name: 'Systemic Human Physiology', credits: '4 Cr', lab: 'Clinical Wing LT 3' },
              { code: 'BC 203', name: 'Medical Biochemistry & Genetics', credits: '4 Cr', lab: 'Main Science Lab' },
              { code: 'BE 204', name: 'Behavioral Sciences & Medical Ethics', credits: '2 Cr', lab: 'Lecture Theatre 1' },
            ].map((c) => (
              <div key={c.code} className="me-course-row">
                <div>
                  <strong className="me-course-name">{c.name}</strong>
                  <p className="me-course-meta">
                    {c.code} · {c.lab}
                  </p>
                </div>
                <span className="badge badge--surface" style={{ fontSize: 11 }}>
                  {c.credits}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. DISCREET ROLE SWITCHER DRAWER (Dev / Test) */}
        {showRoleDrawer && (
          <section className="me-role-drawer">
            <div className="me-section-subhead">
              <span className="me-subhead-text">CABINET ROLE DELEGATION SIMULATOR</span>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setShowRoleDrawer(false)}
                style={{ fontSize: 11 }}
              >
                Close ✕
              </button>
            </div>
            <p className="text-faint" style={{ fontSize: 12, marginBottom: 10 }}>
              Test the Spec 10 RBAC permissions and 3-tab vs 4-tab (Console) experience:
            </p>

            <div className="me-role-options-grid">
              {(
                [
                  {
                    kind: 'student',
                    title: 'Student (Verified)',
                    desc: 'Standard 3 tabs: Chat · Home · Me. View-only access.',
                  },
                  {
                    kind: 'cr',
                    title: 'Class Representative (CR)',
                    desc: '4 tabs: Chat · Home · Console · Me. Cohort desk, claim requests.',
                  },
                  {
                    kind: 'minister',
                    title: 'Minister of Welfare',
                    desc: 'Cabinet Authority: Venue Rush window manager, emergency broadcast.',
                  },
                ] as const
              ).map((r) => (
                <button
                  key={r.kind}
                  className={`me-role-pill-btn ${currentProfile.kind === r.kind ? 'me-role-pill-btn--active' : ''}`}
                  onClick={() => setRoleKind(r.kind as UserRoleKind)}
                  type="button"
                >
                  <strong style={{ fontSize: 13 }}>{r.title}</strong>
                  <span className="text-faint" style={{ fontSize: 11 }}>
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 5. APP SETTINGS & OFFLINE HEALTH */}
        <section className="me-settings-section">
          <div className="me-section-subhead">
            <span className="me-subhead-text">SYSTEM & STORAGE</span>
          </div>

          <div className="me-settings-card">
            {/* Theme Toggle */}
            <div className="me-setting-item">
              <div>
                <strong style={{ fontSize: 13.5 }}>Interface Theme</strong>
                <p className="text-faint" style={{ fontSize: 12 }}>
                  {theme === 'system' ? 'Follow system appearance' : theme === 'dark' ? 'Dark Mode' : 'Light (Recommended)'}
                </p>
              </div>
              <div className="me-theme-chips">
                {(['light', 'system', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    className={`chip chip--sm ${theme === t ? 'chip--active' : ''}`}
                    onClick={() => setTheme(t)}
                    type="button"
                    style={{ textTransform: 'capitalize' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Offline IndexedDB Status */}
            <div className="me-setting-item">
              <div>
                <strong style={{ fontSize: 13.5 }}>Dexie IndexedDB Engine</strong>
                <p className="text-faint" style={{ fontSize: 12 }}>
                  Offline cache active for timetable, campus venues & flashcard mastery
                </p>
              </div>
              <span className="badge badge--synced">
                <CheckCircleIcon size={11} strokeWidth={2.5} />
                <span>Active</span>
              </span>
            </div>

            {/* Install PWA Item */}
            <div className="me-setting-item">
              <div>
                <strong style={{ fontSize: 13.5 }}>Install Yuni App (PWA)</strong>
                <p className="text-faint" style={{ fontSize: 12 }}>
                  {isInstalled
                    ? 'Installed as standalone app on device'
                    : 'Add to home screen for offline clinical access'}
                </p>
              </div>
              {isInstalled ? (
                <span className="badge badge--synced">Installed ✓</span>
              ) : (
                <button
                  className="btn btn--primary btn--sm btn-hop"
                  onClick={handleInstallClick}
                  type="button"
                  style={{ fontSize: 12 }}
                >
                  Install App
                </button>
              )}
            </div>

            {/* Test With Friends (Local Wi-Fi Network) */}
            <div className="me-setting-item">
              <div>
                <strong style={{ fontSize: 13.5 }}>Share With Friends (Local Wi-Fi)</strong>
                <p className="text-faint" style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  <code>{localShareUrl}</code>
                </p>
              </div>
              <button
                className="btn btn--ghost btn--sm btn-hop"
                onClick={handleCopyLink}
                type="button"
                style={{ fontSize: 12, minWidth: 95 }}
              >
                {copyFeedback ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="me-footer">
          <p className="text-faint" style={{ fontSize: 12 }}>
            Yuni Life v0.1.0 · Muhimbili University of Health & Allied Sciences
          </p>
          <div style={{ marginTop: 6 }}>
            <Graffiti type="tag-yuni" color="var(--yuni-blue)" />
          </div>
        </footer>
      </div>
    </>
  );
}
