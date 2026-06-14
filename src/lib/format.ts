export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysUntilNumeric(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
  return isNaN(diff) ? null : diff;
}

export function fmtDaysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  return `${days}d`;
}

export function daysUntil(dateStr: string | null | undefined): number | '' {
  const n = daysUntilNumeric(dateStr);
  return n ?? '';
}
