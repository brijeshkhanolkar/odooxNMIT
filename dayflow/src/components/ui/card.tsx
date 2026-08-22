import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  className,
  iconBg = 'bg-violet-100 text-violet-600',
}: StatCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs font-medium flex items-center gap-1',
                trendUp ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBg)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
