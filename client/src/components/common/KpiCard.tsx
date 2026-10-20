import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = 'text-sky-600 dark:text-sky-400',
  iconBg = 'bg-sky-50 dark:bg-sky-950/50 border-sky-100 dark:border-sky-800',
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:-translate-y-0.5 shadow-sm hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-sm',
              iconBg
            )}
          >
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {trend && (
            <span
              className={cn(
                'font-bold px-1.5 py-0.5 rounded',
                trend.isPositive
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60'
                  : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/60'
              )}
            >
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
