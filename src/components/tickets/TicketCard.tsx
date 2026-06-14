import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { CopyButton } from '@/components/ui/CopyButton';
import { TKT_S, IMP } from '@/constants';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ITTicket, Regulation, TicketStatus } from '@/types';

interface TicketCardProps {
  ticket: ITTicket;
  regulation?: Regulation;
  onStatusChange: (id: string, status: TicketStatus) => void;
}

export function TicketCard({ ticket, regulation, onStatusChange }: TicketCardProps) {
  const [open, setOpen] = useState(false);
  const s = TKT_S[ticket.status] ?? TKT_S.open;
  const imp = regulation ? (IMP[regulation.impact_level] ?? IMP.low) : IMP.low;

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const order: TicketStatus[] = ['open', 'in_progress', 'done'];
    const next = order[(order.indexOf(ticket.status) + 1) % order.length];
    onStatusChange(ticket.id, next);
  };

  const impactVariantMap: Record<string, BadgeVariant> = {
    high: 'impact-high', medium: 'impact-medium', low: 'impact-low',
  };
  const impactVariant: BadgeVariant = impactVariantMap[regulation?.impact_level ?? 'low'] ?? 'impact-low';

  return (
    <div className={cn(
      'bg-white border border-border rounded-xl mb-3.5 overflow-hidden',
      'hover:-translate-y-px transition-transform duration-150',
    )}>
      <div className="px-5 py-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="neutral">IT Ticket</Badge>
              {regulation && <Badge variant={impactVariant}>{imp.label} Impact</Badge>}
              {regulation && (
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-semibold">
                  {regulation.source}
                </span>
              )}
              {regulation?.deadline && (
                <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {regulation.deadline}
                </span>
              )}
              <span className="ml-auto text-[11px] text-slate-400">{fmtDate(ticket.created_at)}</span>
            </div>

            <h3 className="m-0 mb-2.5 text-[14px] font-semibold text-slate-900 leading-snug">
              {regulation?.title ?? `IT Ticket — ${ticket.regulation_id}`}
            </h3>

            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={cycleStatus}
                className="px-3 py-1 rounded-full text-[11px] font-bold uppercase cursor-pointer transition-colors"
                style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}25` }}
              >
                {s.label}
              </button>
              <span className="text-[11px] text-slate-400">Click to advance</span>
            </div>
          </div>

          <ChevronDown
            size={16}
            strokeWidth={1.75}
            className={cn('text-slate-400 mt-1 shrink-0 transition-transform duration-150', open && 'rotate-180')}
          />
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
          {/* Technical spec */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-3.5 bg-blue-600 rounded" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Technical Specification</span>
              </div>
              <CopyButton text={ticket.technical_spec} />
            </div>
            <div className="bg-white border border-border rounded-lg px-4 py-3.5 text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {ticket.technical_spec ?? 'No specification available.'}
            </div>
          </div>

          {ticket.csharp_code && (
            <CodeBlock title="C# Skeleton Code" content={ticket.csharp_code} lang="C#" accent="#7e22ce" />
          )}

          {ticket.ai_prompt && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-3.5 bg-orange-500 rounded" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI Coding Prompt</span>
                  <span className="bg-amber-50 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    Paste into Cursor / Copilot
                  </span>
                </div>
                <CopyButton text={ticket.ai_prompt} label="Copy Prompt" />
              </div>
              <div className="bg-white border border-dashed border-amber-200 rounded-lg px-4 py-3.5 text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap italic">
                {ticket.ai_prompt}
              </div>
            </div>
          )}

          {regulation && (
            <div className="bg-slate-100 border border-border rounded-lg px-3.5 py-3 mt-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Linked Regulation</div>
              <div className="text-[13px] font-semibold text-slate-900 mb-1">{regulation.title}</div>
              <div className="text-[12px] text-slate-500 leading-relaxed">{regulation.summary_sv}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
