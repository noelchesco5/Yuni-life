import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  actions?: ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="top-bar">
      <h1 className="top-bar__title">{title}</h1>
      {actions && <div className="top-bar__actions">{actions}</div>}
    </header>
  );
}
