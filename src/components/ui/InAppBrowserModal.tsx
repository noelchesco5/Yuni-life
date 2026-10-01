import { useState } from 'react';
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

  const displayTitle = title || (url ? new URL(url).hostname : 'Browser');

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
        </header>

        {/* Progress loader */}
        {loading && <div className="in-app-browser__progress-bar" />}

        {/* Browser viewport */}
        <div className="in-app-browser__viewport">
          <iframe
            id="in-app-browser-frame"
            src={url}
            title={displayTitle}
            className="in-app-browser__iframe"
            onLoad={() => setLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
