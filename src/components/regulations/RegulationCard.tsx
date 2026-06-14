import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IMP, DEPT_C, EFFORT_LEVELS } from '@/constants';
import { fmtDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Regulation } from '@/types';

interface RegulationCardProps {
  regulation: Regulation;
  onUpdate: (args: { id: string; fields: Partial<Regulation> }) => void;
  onApproveIT: (regulation: Regulation) => void;
  isGeneratingIT?: boolean;
}

export function RegulationCard({ regulation: item, onUpdate, onApproveIT, isGeneratingIT = false }: RegulationCardProps) {
  const [open, setOpen] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [noteText, setNoteText] = useState(item.reviewer_note ?? '');
  const [saving, setSaving] = useState(false);

  const imp = IMP[item.impact_level] ?? IMP.low;
  const isApproved = ['approved', 'approved_it'].includes(item.review_status);
  const hasITTicket = item.review_status === 'approved_it';

  const impactBorderColor: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
    not_applicable: '#e2e8f0',
  };
  const leftBorderColor = impactBorderColor[item.impact_level] ?? '#e2e8f0';

  const impactVariantMap: Record<string, BadgeVariant> = {
    high: 'impact-high', medium: 'impact-medium', low: 'impact-low', not_applicable: 'impact-na',
  };
  const impactVariant: BadgeVariant = impactVariantMap[item.impact_level] ?? 'impact-na';

  return (
    <div
      className={cn(
        'bg-white border border-border rounded-xl mb-3 overflow-hidden',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
      )}
      style={{ borderLeftColor: leftBorderColor, borderLeftWidth: '4px' }}
    >
      {/* Card header — clickable */}
      <div
        className="px-5 py-4 cursor-pointer"
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${open ? 'Collapse' : 'Expand'} regulation: ${item.title}`}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant={impactVariant}>{imp.label} Impact</Badge>
              <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-semibold">{item.source}</span>
              <span className="text-[11px] text-slate-400 italic">{item.category}</span>
              {item.deadline && (
                <span className="ml-auto text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {item.deadline}
                </span>
              )}
              {!item.deadline && (
                <span className="ml-auto text-[11px] text-slate-400">{fmtDate(item.processed_at)}</span>
              )}
            </div>

            {/* Title */}
            <h3 className="m-0 mb-2 text-[14px] font-semibold text-slate-900 leading-snug">{item.title}</h3>

            {/* Summary */}
            <p className="m-0 mb-2.5 text-[13px] text-slate-500 leading-relaxed">{item.summary_sv}</p>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {item.affected_departments?.map(d => (
                <Chip key={d} label={d} c={DEPT_C[d]} />
              ))}
              {hasITTicket && (
                <Badge variant="purple" className="ml-auto">IT Ticket Created</Badge>
              )}
              {item.review_status === 'approved' && (
                <Badge variant="success" className={hasITTicket ? '' : 'ml-auto'}>Approved</Badge>
              )}
            </div>
          </div>

          <ChevronDown
            size={16}
            strokeWidth={1.75}
            className={cn('text-slate-400 mt-1 shrink-0 transition-transform duration-150', open && 'rotate-180')}
          />
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 pl-8">
          {/* Why relevant */}
          {item.relevance_reason && (
            <div className="mb-4">
              <SectionLabel>Why Relevant</SectionLabel>
              <p className="m-0 text-[13px] text-slate-600 leading-relaxed italic">{item.relevance_reason}</p>
            </div>
          )}

          {/* Required actions */}
          {item.required_actions?.length > 0 && (
            <div className="mb-4">
              <SectionLabel>Required Actions</SectionLabel>
              {item.required_actions.map((a, i) => (
                <div key={i} className="flex gap-2.5 items-start mb-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: imp.bg, color: imp.text }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[13px] text-slate-700 leading-relaxed">{a}</span>
                </div>
              ))}
            </div>
          )}

          {/* Ownership & Assessment */}
          <div className="mb-4">
            <SectionLabel>Ownership & Assessment</SectionLabel>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Effort
                </label>
                <select
                  value={item.effort_level ?? ''}
                  onChange={e => onUpdate({ id: item.id, fields: { effort_level: e.target.value } })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-[13px] bg-white text-slate-700 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 cursor-pointer"
                >
                  <option value="">— select —</option>
                  {EFFORT_LEVELS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Impact When In Place
                </label>
                <select
                  value={item.impact_when_in_place ?? ''}
                  onChange={e => onUpdate({ id: item.id, fields: { impact_when_in_place: e.target.value } })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-[13px] bg-white text-slate-700 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 cursor-pointer"
                >
                  <option value="">— select —</option>
                  {EFFORT_LEVELS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Reviewer note */}
          <div className="mb-5">
            <SectionLabel>Reviewer Note</SectionLabel>
            {editNote ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Add your notes…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] resize-y outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={saving}
                    onClick={async () => {
                      setSaving(true);
                      await onUpdate({ id: item.id, fields: { reviewer_note: noteText } });
                      setSaving(false);
                      setEditNote(false);
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditNote(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setEditNote(true)}
                className="min-h-9 px-3 py-2 border border-dashed border-slate-300 rounded-lg text-[13px] cursor-pointer bg-white hover:border-slate-400 transition-colors"
                style={{ color: item.reviewer_note ? '#1e293b' : '#94a3b8' }}
              >
                {item.reviewer_note ?? 'Click to add a note…'}
              </div>
            )}
          </div>

          {/* Compliance decision */}
          {!isApproved && (
            <div className="border-t border-slate-200 pt-4 flex gap-2.5 flex-wrap items-center">
              <span className="text-[11px] font-semibold text-slate-500">Compliance Decision:</span>
              <Button
                variant="success"
                size="sm"
                onClick={() => onUpdate({ id: item.id, fields: { review_status: 'approved' } })}
              >
                Approve — No IT Change
              </Button>
              <Button
                variant="outline"
                size="sm"
                loading={isGeneratingIT}
                onClick={() => !isGeneratingIT && onApproveIT(item)}
              >
                {isGeneratingIT ? 'Generating…' : 'Approve + Needs IT Change'}
              </Button>
              {isGeneratingIT && (
                <span className="text-[11px] text-slate-400 italic">
                  Claude is analysing and writing C# code…
                </span>
              )}
            </div>
          )}

          {isApproved && (
            <div className="border-t border-slate-200 pt-4">
              <Badge variant={hasITTicket ? 'purple' : 'success'} uppercase={false} className="text-[12px] px-3 py-1.5">
                {hasITTicket
                  ? 'Approved — IT ticket created, see IT Tickets tab'
                  : 'Approved — No IT change required'}
              </Badge>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
      {children}
    </div>
  );
}
