import { useState } from 'react';
import { IMP } from '@/constants';
import type { Regulation, ImpactLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RiskInfo {
  level: 'done' | 'none' | 'overdue' | 'critical' | 'atrisk' | 'watch' | 'ontrack';
  label: string;
  bg: string;
  text: string;
  border: string;
  bar: string;
  dot: string;
  days?: number;
}

function getRisk(item: Regulation): RiskInfo {
  const isApproved = ['approved', 'approved_it'].includes(item.review_status);
  if (isApproved) return { level: 'done',     label: 'Done',     bg: '#f0fdf4', text: '#15803d', border: '#86efac', bar: '#22c55e', dot: '#22c55e' };
  if (!item.deadline) return { level: 'none',  label: 'No date', bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0', bar: '#cbd5e1', dot: '#cbd5e1' };
  const days = Math.ceil((new Date(item.deadline).getTime() - Date.now()) / 86_400_000);
  if (isNaN(days))  return { level: 'none',    label: 'No date',  bg: '#f8fafc', text: '#94a3b8', border: '#e2e8f0', bar: '#cbd5e1', dot: '#cbd5e1' };
  if (days < 0)     return { level: 'overdue', label: 'Overdue',  bg: '#fef2f2', text: '#991b1b', border: '#fca5a5', bar: '#ef4444', dot: '#ef4444', days };
  if (days <= 30)   return { level: 'critical',label: 'Critical', bg: '#fef2f2', text: '#991b1b', border: '#fca5a5', bar: '#ef4444', dot: '#ef4444', days };
  if (days <= 60)   return { level: 'atrisk',  label: 'At Risk',  bg: '#fffbeb', text: '#92400e', border: '#fcd34d', bar: '#f59e0b', dot: '#f59e0b', days };
  if (days <= 90)   return { level: 'watch',   label: 'Watch',    bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', bar: '#fb923c', dot: '#fb923c', days };
  return             { level: 'ontrack',        label: 'On Track', bg: '#f0fdf4', text: '#15803d', border: '#86efac', bar: '#22c55e', dot: '#22c55e', days };
}

interface DeadlineCalendarProps {
  items: Regulation[];
}

export function DeadlineCalendar({ items }: DeadlineCalendarProps) {
  const [filter, setFilter] = useState('all');

  const withDeadline = items
    .map(i => ({ ...i, _risk: getRisk(i) }))
    .filter(i => i._risk.level !== 'none')
    .sort((a, b) => {
      const order: Record<string, number> = { overdue: 0, critical: 1, atrisk: 2, watch: 3, ontrack: 4, done: 5 };
      return (order[a._risk.level] ?? 6) - (order[b._risk.level] ?? 6);
    });

  const noDate = items.filter(i => getRisk(i).level === 'none');
  const filtered = filter === 'all' ? withDeadline : withDeadline.filter(i => i._risk.level === filter);

  const counts = {
    overdue:  withDeadline.filter(i => i._risk.level === 'overdue').length,
    critical: withDeadline.filter(i => i._risk.level === 'critical').length,
    atrisk:   withDeadline.filter(i => i._risk.level === 'atrisk').length,
    watch:    withDeadline.filter(i => i._risk.level === 'watch').length,
    ontrack:  withDeadline.filter(i => i._risk.level === 'ontrack').length,
    done:     withDeadline.filter(i => i._risk.level === 'done').length,
  };

  const today = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    return {
      label: d.toLocaleDateString('sv-SE', { month: 'short', year: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });

  const TOTAL_DAYS = 180;
  function barProps(deadline: string | null) {
    if (!deadline) return null;
    const diffDays = Math.ceil((new Date(deadline).getTime() - today.getTime()) / 86_400_000);
    const pct = Math.min(Math.max(diffDays / TOTAL_DAYS, 0), 1);
    return { pct, diffDays };
  }

  const FILTER_OPTS = [
    { key: 'all',      label: 'All',      value: withDeadline.length, color: '#475569' },
    { key: 'overdue',  label: 'Overdue',  value: counts.overdue,      color: '#ef4444' },
    { key: 'critical', label: 'Critical', value: counts.critical,     color: '#ef4444' },
    { key: 'atrisk',   label: 'At Risk',  value: counts.atrisk,       color: '#f59e0b' },
    { key: 'watch',    label: 'Watch',    value: counts.watch,        color: '#fb923c' },
    { key: 'ontrack',  label: 'On Track', value: counts.ontrack,      color: '#22c55e' },
    { key: 'done',     label: 'Done',     value: counts.done,         color: '#22c55e' },
  ];

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap items-center">
        {FILTER_OPTS.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            style={{
              background: filter === s.key ? s.color : '#fff',
              color: filter === s.key ? '#fff' : s.color,
              border: `1.5px solid ${s.color}`,
              boxShadow: filter === s.key ? `0 2px 8px ${s.color}40` : 'none',
            }}
            className="flex flex-col items-center min-w-[60px] px-3.5 py-2 rounded-lg cursor-pointer transition-all text-center"
          >
            <span className="text-[18px] font-black leading-none">{s.value}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</span>
          </button>
        ))}
        {noDate.length > 0 && (
          <div className="ml-auto bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2 flex items-center gap-1.5">
            <span className="text-[11px] text-amber-700 font-semibold">
              {noDate.length} without deadline
            </span>
          </div>
        )}
      </div>

      {/* Gantt table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-4">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-2.5 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-[200px] shrink-0">
            Regulation
          </span>
          <div className="flex-1 flex">
            {months.map((m, i) => (
              <div key={i} className="flex-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider text-center">
                {m.label}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 w-[80px] text-right shrink-0">Days left</span>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-[14px]">
            No regulations match this filter.
          </div>
        )}

        {filtered.map((item, idx) => {
          const risk = item._risk;
          const bp = barProps(item.deadline);
          const imp = IMP[item.impact_level as ImpactLevel] ?? IMP.low;

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 border-b border-slate-50',
                idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50',
              )}
            >
              {/* Label */}
              <div className="w-[200px] shrink-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: imp.dot }} />
                  <span
                    className="text-[10px] font-bold uppercase px-1.5 py-px rounded"
                    style={{ background: imp.bg, color: imp.text, border: `1px solid ${imp.border}` }}
                  >
                    {imp.label}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-800 leading-snug line-clamp-2">{item.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.source}</div>
              </div>

              {/* Bar track */}
              <div className="flex-1 relative h-7 flex items-center">
                {months.map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-px bg-slate-100"
                    style={{ left: `${(i / months.length) * 100}%` }}
                  />
                ))}
                {/* Today line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 z-10" />

                {bp && (
                  <div
                    className="absolute left-0 h-2 rounded-full z-10 min-w-[4px]"
                    style={{
                      width: `${bp.pct * 100}%`,
                      background: risk.bar,
                      boxShadow: (risk.level === 'critical' || risk.level === 'overdue')
                        ? `0 0 6px ${risk.bar}80`
                        : 'none',
                    }}
                  />
                )}

                {bp && bp.pct > 0 && bp.pct <= 1 && (
                  <div
                    className="absolute z-20"
                    style={{ left: `calc(${bp.pct * 100}% - 6px)` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full border-2 border-white"
                      style={{ background: risk.dot, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
                    />
                  </div>
                )}

                {bp && bp.diffDays < 0 && (
                  <div className="absolute left-0.5 z-20 bg-red-500 text-white text-[8px] font-bold px-1 py-px rounded">
                    OVERDUE
                  </div>
                )}
              </div>

              {/* Days badge */}
              <div className="w-[80px] shrink-0 text-right">
                <div
                  className="inline-block px-2 py-px rounded-full text-[10px] font-bold whitespace-nowrap"
                  style={{
                    background: risk.bg,
                    color: risk.text,
                    border: `1px solid ${risk.border}`,
                  }}
                >
                  {risk.level === 'done' ? 'Done' :
                   risk.level === 'overdue' ? `${Math.abs(risk.days ?? 0)}d ago` :
                   risk.days != null ? `${risk.days}d` : '—'}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  {item.deadline
                    ? new Date(item.deadline).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
                    : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 items-center flex-wrap text-[11px] text-slate-500">
        <span className="font-bold text-slate-600">Legend:</span>
        {[
          { color: '#3b82f6', label: 'Today' },
          { color: '#ef4444', label: 'Critical / Overdue (≤30d)' },
          { color: '#f59e0b', label: 'At Risk (31–60d)' },
          { color: '#fb923c', label: 'Watch (61–90d)' },
          { color: '#22c55e', label: 'On Track (>90d)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
