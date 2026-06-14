interface ChipColors {
  bg: string;
  text: string;
  border: string;
}

interface ChipProps {
  label: string;
  c?: ChipColors;
}

export function Chip({ label, c }: ChipProps) {
  const col = c ?? { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
  return (
    <span
      style={{
        background: col.bg,
        color: col.text,
        border: `1px solid ${col.border}`,
        padding: '2px 9px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap' as const,
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
}
