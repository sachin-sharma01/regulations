import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useRegulations } from '@/hooks/useRegulations';
import { useTickets } from '@/hooks/useTickets';

export function AppShell() {
  const { unreviewed } = useRegulations();
  const { openCount } = useTickets();

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar unreviewedCount={unreviewed} openTicketsCount={openCount} />
      <main className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
