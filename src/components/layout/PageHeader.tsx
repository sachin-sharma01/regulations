interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-8 sticky top-0 z-10 shrink-0"
      style={{
        background: 'linear-gradient(135deg, #2d7050 0%, #1e5438 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        minHeight: '72px',
      }}
    >
      <div>
        <h2 className="text-xl font-bold text-white leading-tight tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm mt-0.5 font-medium" style={{ color: '#fcd34d' }}>{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
