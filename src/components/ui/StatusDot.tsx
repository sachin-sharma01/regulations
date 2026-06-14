import { cn } from '@/lib/utils';

type DotColor = 'red' | 'amber' | 'green' | 'blue' | 'purple' | 'slate';

const colorClasses: Record<DotColor, string> = {
  red:    'bg-red-500',
  amber:  'bg-amber-500',
  green:  'bg-green-500',
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  slate:  'bg-slate-400',
};

interface StatusDotProps {
  color: DotColor;
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusDot({ color, pulse = false, size = 'sm', className }: StatusDotProps) {
  return (
    <span className={cn(
      'inline-block rounded-full flex-shrink-0',
      size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5',
      colorClasses[color],
      pulse && 'animate-pulse',
      className,
    )} />
  );
}
