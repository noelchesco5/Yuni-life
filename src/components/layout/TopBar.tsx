import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  actions?: ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  const isYuniBrand = title.toLowerCase() === 'yuni';

  return (
    <header className="top-bar">
      {isYuniBrand ? (
        <div className="top-bar__brand-lockup" aria-label="yuni — your campus companion">
          <svg width="86" height="30" viewBox="0 0 100 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wordmark: yuni in custom Plus Jakarta Sans styling */}
            <text
              x="2"
              y="25"
              fill="var(--ink)"
              fontSize="27"
              fontWeight="900"
              fontFamily="var(--font-display)"
              letterSpacing="-0.04em"
            >
              yun
            </text>
            {/* The 'i' stem */}
            <rect x="58" y="11" width="6.5" height="14" rx="3" fill="var(--ink)" />
            {/* The 'i' dot: Yuni Blue Compass Pin */}
            <circle cx="61.2" cy="5" r="4.2" fill="var(--yuni-blue)" />
            <circle cx="61.2" cy="5" r="1.8" fill="#FFFFFF" />
            {/* The Signature Sunshine Smile "Hop" */}
            <path
              d="M74 12C78 18 86 18 90 12"
              stroke="var(--yuni-sun)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : (
        <h1 className="top-bar__title">{title}</h1>
      )}

      {actions && <div className="top-bar__actions">{actions}</div>}
    </header>
  );
}
