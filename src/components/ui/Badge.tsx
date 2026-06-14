import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'impact-high' | 'impact-medium' | 'impact-low' | 'impact-na'
  | 'status-open' | 'status-progress' | 'status-done' | 'status-blocked'
  | 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'purple';

const variantClasses: Record<BadgeVariant, string> = {
  'impact-high':    'bg-red-50    text-red-800    border-red-200',
  'impact-medium':  'bg-amber-50  text-amber-900  border-amber-200',
  'impact-low':     'bg-green-50  text-green-800  border-green-200',
  'impact-na':      'bg-slate-50  text-slate-500  border-slate-200',
  'status-open':    'bg-slate-100 text-slate-600  border-slate-200',
  'status-progress':'bg-blue-50   text-blue-700   border-blue-200',
  'status-done':    'bg-green-50  text-green-700  border-green-200',
  'status-blocked': 'bg-red-50    text-red-700    border-red-200',
  'neutral':        'bg-slate-100 text-slate-600  border-slate-200',
  'info':           'bg-blue-50   text-blue-800   border-blue-200',
  'success':        'bg-green-50  text-green-800  border-green-200',
  'warning':        'bg-amber-50  text-amber-900  border-amber-200',
  'error':          'bg-red-50    text-red-800    border-red-200',
  'purple':         'bg-purple-50 text-purple-800 border-purple-200',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  uppercase?: boolean;
}

export function Badge({ variant = 'neutral', children, className, uppercase = true }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border leading-none',
      uppercase && 'uppercase tracking-wide',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  );
}
