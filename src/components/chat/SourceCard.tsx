import type { ChatSource } from '@/types';

const IMPACT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high:   { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
  medium: { bg: '#fffbeb', text: '#92400e', border: '#fcd34d' },
  low:    { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
};

function getSimilarityColor(similarity: string): string {
  const val = parseFloat(similarity);
  if (val > 70) return '#22c55e';
  if (val >= 40) return '#f59e0b';
  return '#ef4444';
}

interface SourceCardProps {
  source: ChatSource;
  highlighted: boolean;
  messageId: number;
}

export function SourceCard({ source, highlighted, messageId }: SourceCardProps) {
  const level = (source.impact_level ?? '').toLowerCase();
  const colors = IMPACT_COLORS[level] ?? { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  const simColor = source.similarity ? getSimilarityColor(source.similarity) : '#64748b';

  return (
    <div
      id={`source-${messageId}-${source.number}`}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px] transition-all duration-300"
      style={{
        background: highlighted ? '#eff6ff' : '#fff',
        border: highlighted ? '1px solid #3b82f6' : '1px solid #e2e8f0',
      }}
    >
      <span className="text-slate-800 font-semibold flex-1 mr-2">
        <span className="text-blue-500 font-bold mr-1">[{source.number}]</span>
        {source.title}
      </span>
      <div className="flex gap-1.5 items-center shrink-0">
        {source.similarity && (
          <span className="text-[11px] font-bold" style={{ color: simColor }}>
            {source.similarity}
          </span>
        )}
        {source.impact_level && (
          <span
            className="rounded text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5"
            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
          >
            {source.impact_level}
          </span>
        )}
      </div>
    </div>
  );
}
