import { useState } from 'react';
import { ExternalLinkIcon, ShieldCheckIcon } from './Icons';
import './InAppBrowserModal.css';

interface InAppBrowserModalProps {
  isOpen: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

export function InAppBrowserModal({ isOpen, url, title, onClose }: InAppBrowserModalProps) {
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  const isSaris = url.includes('saris2.muhas.ac.tz') || url.includes('muhas.ac.tz');
  const displayTitle = title || (url ? new URL(url).hostname : 'Browser');

  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="in-app-browser-overlay" role="dialog" aria-modal="true">
      <div className="in-app-browser">
        {/* Top Header Bar */}
        <header className="in-app-browser__header">
          <button className="in-app-browser__done-btn" onClick={onClose}>
            Done
          </button>

          <div className="in-app-browser__title-group">
            <svg
              className="in-app-browser__lock-icon"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div className="in-app-browser__title-text">
              <span className="in-app-browser__site-title">{displayTitle}</span>
              <span className="in-app-browser__url-faint">{url}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              className="in-app-browser__reload-btn"
              onClick={handleOpenExternal}
              title="Open in device browser"
              aria-label="Open in external browser"
            >
              <ExternalLinkIcon size={16} strokeWidth={2.2} />
            </button>

            {!isSaris && (
              <button
                className="in-app-browser__reload-btn"
                onClick={() => {
                  setLoading(true);
                  const iframe = document.getElementById('in-app-browser-frame') as HTMLIFrameElement;
                  if (iframe) iframe.src = url;
                }}
                aria-label="Reload"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Progress loader */}
        {loading && !isSaris && <div className="in-app-browser__progress-bar" />}

        {/* Viewport */}
        <div className="in-app-browser__viewport">
          {isSaris ? (
            /* Dedicated Security & Portal Interstitial for frame-restricted university servers */
            <div className="saris-interstitial">
              <div className="saris-interstitial__card">
                <div className="saris-interstitial__badge">
                  <ShieldCheckIcon size={24} color="var(--yuni-blue)" strokeWidth={2.2} />
                </div>

                <h3 className="saris-interstitial__title">MUHAS SARIS 2.0</h3>
                <p className="saris-interstitial__subtitle">
                  Student Academic Register Information System
                </p>

                <div className="saris-interstitial__notice">
                  <p>
                    For your data security, university servers enforce strict browser isolation (<code>X-Frame-Options: SAMEORIGIN</code>).
                  </p>
                  <p className="text-faint" style={{ marginTop: 6, fontSize: 12 }}>
                    Yuni connects you directly to the official portal without intercepting your student credentials.
                  </p>
                </div>

                <button
                  className="btn btn--primary btn--lg saris-interstitial__btn"
                  onClick={handleOpenExternal}
                >
                  <span>Launch Official SARIS Portal</span>
                  <ExternalLinkIcon size={16} strokeWidth={2.5} />
                </button>

                <button
                  className="btn btn--ghost btn--sm"
                  onClick={onClose}
                  style={{ marginTop: 12 }}
                >
                  Return to Yuni
                </button>
              </div>
            </div>
          ) : (
            <iframe
              id="in-app-browser-frame"
              src={url}
              title={displayTitle}
              className="in-app-browser__iframe"
              onLoad={() => setLoading(false)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          )}
        </div>
      </div>
    </div>
  );
}
