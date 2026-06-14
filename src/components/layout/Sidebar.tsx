import { NavLink } from 'react-router-dom';
import { LayoutList, Ticket, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/',        icon: LayoutList,    label: 'Regulations' },
  { to: '/tickets', icon: Ticket,        label: 'IT Tickets'  },
  { to: '/chat',    icon: MessageSquare, label: 'Ask AI'      },
] as const;

interface SidebarProps {
  unreviewedCount: number;
  openTicketsCount: number;
}

export function Sidebar({ unreviewedCount, openTicketsCount }: SidebarProps) {
  return (
    <aside
      className="w-[240px] shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{ backgroundColor: '#1e5438' }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <p className="text-[12px] font-bold uppercase tracking-widest mb-2" style={{ color: '#f59e0b' }}>
          Swedish Mortgage Bank
        </p>
        <h1 className="text-[19px] font-bold leading-snug tracking-tight text-white">
          Regulatory Intelligence
        </h1>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const badge =
            to === '/'        ? unreviewedCount  :
            to === '/tickets' ? openTicketsCount :
            0;

          return (
            <NavLink key={to} to={to} end={to === '/'}>
              {({ isActive }) => (
                <span
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-[15px] font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: isActive ? 'rgba(245,158,11,0.12)' : undefined,
                    color: isActive ? '#ffffff' : '#86efac',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2 : 1.75}
                    style={{ color: isActive ? '#f59e0b' : '#4ade80' }}
                  />
                  <span className="flex-1 leading-none">{label}</span>
                  {badge > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                      style={{ backgroundColor: '#d97706', color: '#ffffff' }}
                    >
                      {badge}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: '#4ade80' }} />
          <p className="text-[11px]" style={{ color: '#86efac' }}>Live · Supabase</p>
        </div>
      </div>
    </aside>
  );
}
