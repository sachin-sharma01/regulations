import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useTickets } from '@/hooks/useTickets';
import { useRegulations } from '@/hooks/useRegulations';
import { cn } from '@/lib/utils';
import type { TicketStatus } from '@/types';

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All Tickets' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export function TicketsPage() {
  const [fStatus, setFStatus] = useState('all');
  const { tickets, isLoading, cycleStatus } = useTickets();
  const { regulations } = useRegulations();

  const filtered = tickets.filter(t => fStatus === 'all' || t.status === fStatus);
  const stats = {
    open:       tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    done:       tickets.filter(t => t.status === 'done').length,
  };

  const getRegulation = (regId: string) => regulations.find(r => r.id === regId);

  return (
    <>
      <PageHeader
        title="IT Tickets"
        subtitle={`${tickets.length} total · ${stats.open} open`}
      />

      <div className="p-6 flex-1 overflow-auto">
        {/* Stats */}
        <div className="flex gap-2.5 mb-5 flex-wrap">
          {[
            { label: 'Open',        value: stats.open,       color: '#94a3b8' },
            { label: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
            { label: 'Done',        value: stats.done,       color: '#22c55e' },
          ].map(s => (
            <div
              key={s.label}
              className="bg-white border border-border rounded-xl px-5 py-3 text-center flex-1 min-w-[80px]"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <div className="text-[22px] font-black leading-none" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-1 mb-4">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFStatus(value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors',
                fStatus === value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-16 text-slate-400 text-[14px]">Loading tickets…</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center text-slate-400 py-16 text-[14px]">
            {tickets.length === 0
              ? "No IT tickets yet — approve a regulation with 'Needs IT Change' to generate one."
              : 'No tickets match your filter.'}
          </div>
        )}

        {!isLoading && filtered.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            regulation={getRegulation(ticket.regulation_id)}
            onStatusChange={(id, status) => cycleStatus.mutate({ id, status: status as TicketStatus })}
          />
        ))}
      </div>
    </>
  );
}
