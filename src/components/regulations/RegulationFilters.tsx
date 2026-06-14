import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { useRegulationFilters } from '@/hooks/useFilters';

type FiltersState = ReturnType<typeof useRegulationFilters>;

const IMPACT_FILTERS = [
  { value: 'all',    label: 'All',    activeClass: 'bg-slate-900 text-white' },
  { value: 'high',   label: 'High',   activeClass: 'bg-red-500 text-white' },
  { value: 'medium', label: 'Medium', activeClass: 'bg-amber-400 text-amber-900' },
  { value: 'low',    label: 'Low',    activeClass: 'bg-green-500 text-white' },
];

const STATUS_FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'unreviewed',  label: 'Unreviewed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'approved',    label: 'Approved' },
  { value: 'approved_it', label: 'IT Created' },
];

export function RegulationFilters({
  impact, setImpact,
  status, setStatus,
  dept, setDept,
  search, setSearch,
  allDepts,
}: FiltersState) {
  return (
    <div className="bg-white border border-border rounded-xl p-3 mb-4 flex gap-2.5 flex-wrap items-center shadow-sm">
      {/* Search */}
      <div className="relative flex-1 min-w-40">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search regulations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-[13px] border border-border rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
        />
      </div>

      {/* Impact pills */}
      <div className="flex gap-1">
        {IMPACT_FILTERS.map(({ value, label, activeClass }) => (
          <PillButton key={value} active={impact === value} onClick={() => setImpact(value)} activeClass={activeClass}>
            {label}
          </PillButton>
        ))}
      </div>

      {/* Status pills */}
      <div className="flex gap-1">
        {STATUS_FILTERS.map(({ value, label }) => (
          <PillButton key={value} active={status === value} onClick={() => setStatus(value)}>
            {label}
          </PillButton>
        ))}
      </div>

      {/* Department dropdown */}
      {allDepts.length > 0 && (
        <select
          value={dept}
          onChange={e => setDept(e.target.value)}
          className="px-2.5 py-1.5 border border-border rounded-lg text-[12px] bg-slate-50 text-slate-600 font-semibold outline-none cursor-pointer focus:border-accent"
        >
          <option value="all">All Departments</option>
          {allDepts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
    </div>
  );
}

function PillButton({ active, onClick, children, activeClass = 'bg-slate-900 text-white' }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors',
        active ? activeClass : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
      )}
    >
      {children}
    </button>
  );
}
