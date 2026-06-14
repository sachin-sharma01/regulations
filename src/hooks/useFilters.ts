import { useState, useMemo } from 'react';
import type { Regulation } from '@/types';

export function useRegulationFilters(regulations: Regulation[]) {
  const [impact, setImpact] = useState('all');
  const [status, setStatus] = useState('all');
  const [dept, setDept] = useState('all');
  const [search, setSearch] = useState('');

  const allDepts = useMemo(
    () => [...new Set(regulations.flatMap(r => r.affected_departments))].sort(),
    [regulations]
  );

  const filtered = useMemo(() => regulations.filter(r => {
    if (impact !== 'all' && r.impact_level !== impact) return false;
    if (status !== 'all' && r.review_status !== status) return false;
    if (dept !== 'all' && !r.affected_departments.includes(dept)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title?.toLowerCase().includes(q) ||
        r.summary_sv?.toLowerCase().includes(q) ||
        r.source?.toLowerCase().includes(q)
      );
    }
    return true;
  }), [regulations, impact, status, dept, search]);

  return {
    filtered, allDepts,
    impact, setImpact,
    status, setStatus,
    dept, setDept,
    search, setSearch,
  };
}
