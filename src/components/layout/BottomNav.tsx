import { NavLink, useLocation } from 'react-router-dom';
import { useUserRole } from '../../context/RoleContext';

export function BottomNav() {
  const location = useLocation();
  const { currentProfile } = useUserRole();

  // Navigation per Spec 09 Section 3:
  // Everyone (3 tabs): Chat (left) · Home (centre) · Me (right)
  // Leaders (4 tabs): Chat · Home · Console · Me
  const navItems = [
    {
      path: '/chat',
      label: 'Chat',
      icon: (
        <svg className="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      path: '/',
      label: 'Home',
      icon: (
        <svg className="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    ...(currentProfile.isLeader
      ? [
          {
            path: '/console',
            label: 'Console',
            icon: (
              <svg className="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            ),
          },
        ]
      : []),
    {
      path: '/me',
      label: 'Me',
      icon: (
        <svg className="bottom-nav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="bottom-nav__item"
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon}
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
