import { useState } from 'react';
import { List, CalendarDays, Download, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RegulationCard } from '@/components/regulations/RegulationCard';
import { RegulationFilters } from '@/components/regulations/RegulationFilters';
import { DeadlineCalendar } from '@/components/regulations/DeadlineCalendar';
import { Button } from '@/components/ui/Button';
import { useRegulations } from '@/hooks/useRegulations';
import { useRegulationFilters } from '@/hooks/useFilters';
import { exportToExcel } from '@/lib/export';
import { useQueryClient } from '@tanstack/react-query';

type RegView = 'list' | 'calendar';

export function RegulationsPage() {
  const [view, setView] = useState<RegView>('list');
  const [generatingITFor, setGeneratingITFor] = useState<string | null>(null);
  const qc = useQueryClient();
  const { regulations, isLoading, error, updateStatus, approveWithIT } = useRegulations();
  const filters = useRegulationFilters(regulations);
  const { filtered } = filters;

  const unreviewedCount = regulations.filter(
    r => !['approved', 'approved_it'].includes(r.review_status)
  ).length;

  return (
    <>
      <PageHeader
        title="Regulations"
        subtitle={`${filtered.length} of ${regulations.length} · ${unreviewedCount} awaiting review`}
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              className="!text-white/70 hover:!text-white hover:!bg-white/10"
              onClick={() => setView(v => v === 'list' ? 'calendar' : 'list')}
            >
              {view === 'list'
                ? <><CalendarDays size={14} /> Deadline Calendar</>
                : <><List size={14} /> List View</>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!text-white/70 hover:!text-white hover:!bg-white/10 !border !border-white/20"
              onClick={() => exportToExcel(regulations)}
            >
              <Download size={14} /> Export Excel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="!text-white/70 hover:!text-white hover:!bg-white/10"
              loading={isLoading}
              onClick={() => qc.invalidateQueries({ queryKey: ['regulations'] })}
            >
              <RefreshCw size={14} />
            </Button>
          </>
        }
      />

      <div className="p-6 flex-1 overflow-auto">
        {view === 'list' && <RegulationFilters {...filters} />}

        {isLoading && (
          <div className="text-center py-16 text-slate-400 text-[14px]">
            Loading from Supabase…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-[13px] mb-5 flex items-center gap-3">
            <span><strong>Could not load:</strong> {(error as Error).message}</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => qc.invalidateQueries({ queryKey: ['regulations'] })}
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && view === 'calendar' && (
          <DeadlineCalendar items={regulations} />
        )}

        {!isLoading && !error && view === 'list' && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center text-slate-400 py-16 text-[14px]">
                {regulations.length === 0
                  ? 'No data yet — run the n8n workflow to populate.'
                  : 'No regulations match your filters.'}
              </div>
            ) : (
              filtered.map(item => (
                <RegulationCard
                  key={item.id}
                  regulation={item}
                  onUpdate={updateStatus.mutate}
                  isGeneratingIT={generatingITFor === item.id}
                  onApproveIT={async reg => {
                    setGeneratingITFor(reg.id);
                    await approveWithIT.mutateAsync(reg).catch(() => null);
                    setGeneratingITFor(null);
                  }}
                />
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
