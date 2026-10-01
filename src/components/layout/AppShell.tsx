import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <>
      <main className="page">
        <Outlet />
      </main>
      <BottomNav />
    </>
  );
}
