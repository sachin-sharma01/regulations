import type { ImpactLevel, ReviewStatus, TicketStatus } from '@/types';

type ColorToken = { bg: string; text: string; border: string };
type DotColorToken = ColorToken & { dot: string; glow: string; label: string };
type StatusToken = ColorToken & { dot: string; label: string; next?: ReviewStatus };

export const DEPT_C: Record<string, ColorToken> = {
  HR:         { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  Compliance: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  Legal:      { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
  Risk:       { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  Finance:    { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  IT:         { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
  Credit:     { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
};

export const IMP = {
  high:           { label: 'High',   bg: '#fef2f2', text: '#991b1b', border: '#fca5a5', dot: '#ef4444', glow: 'rgba(239,68,68,0.10)' },
  medium:         { label: 'Medium', bg: '#fffbeb', text: '#92400e', border: '#fcd34d', dot: '#f59e0b', glow: 'rgba(245,158,11,0.10)' },
  low:            { label: 'Low',    bg: '#f0fdf4', text: '#166534', border: '#86efac', dot: '#22c55e', glow: 'rgba(34,197,94,0.08)' },
  not_applicable: { label: 'N/A',    bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', dot: '#94a3b8', glow: 'transparent' },
} satisfies Record<ImpactLevel, DotColorToken>;

export const REV_S = {
  unreviewed:  { label: 'Unreviewed',        bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8', border: '#e2e8f0', next: 'in_progress' as ReviewStatus },
  in_progress: { label: 'In Progress',       bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe', next: 'done' as ReviewStatus },
  done:        { label: 'Done',              bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', border: '#86efac', next: 'unreviewed' as ReviewStatus },
  approved:    { label: 'Approved',          bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', border: '#86efac' },
  approved_it: { label: 'IT Ticket Created', bg: '#fdf4ff', text: '#7e22ce', dot: '#a855f7', border: '#e9d5ff' },
} satisfies Record<ReviewStatus, StatusToken>;

type StatusToken2 = ColorToken & { dot: string; label: string };

export const TKT_S = {
  open:        { label: 'Open',        bg: '#f1f5f9', text: '#475569', dot: '#94a3b8', border: '#e2e8f0' },
  in_progress: { label: 'In Progress', bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6', border: '#bfdbfe' },
  done:        { label: 'Done',        bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', border: '#86efac' },
} satisfies Record<TicketStatus, StatusToken2>;


export const REGULATORY_CATEGORY = [
  'AML', 'Consumer protection', 'Credit', 'Credit Risk', 'Funding',
  'Governance', 'HR', 'IT', 'Market access', 'Market Risk',
  'NPL', 'Operational Risk', 'Sanctions', 'Stress test', 'Sustainability',
];

export const EFFORT_LEVELS = ['Low', 'Medium', 'High', 'Pre-assess'];
