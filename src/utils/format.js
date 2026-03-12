// Formatting and date utility functions

export function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("sv-SE", { year: "numeric", month: "short", day: "numeric" });
}

export function daysUntil(d) {
  if (!d) return "";
  const now = new Date();
  const target = new Date(d);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} days` : diff === 0 ? "Today" : `${-diff} days ago`;
}
