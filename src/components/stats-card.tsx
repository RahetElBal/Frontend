import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/spinner';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  change?: number;
  changeText?: string;
  changeIsPositive?: boolean;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  loading = false,
  change,
  changeText,
  changeIsPositive,
  changeLabel,
  icon: Icon,
  iconColor = 'text-accent-pink',
  iconBgColor = 'bg-accent-pink/10',
}: StatsCardProps) {
  const safeChange = Number.isFinite(change) ? change : undefined;
  const hasChange = !loading && (changeText !== undefined || safeChange !== undefined);
  const isPositive =
    changeIsPositive ?? (safeChange !== undefined && safeChange >= 0);
  const formatPercent = (value: number) =>
    Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="flex items-center h-8">
              <Spinner size="sm" />
            </div>
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
          {hasChange && (
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(isPositive ? 'text-green-500' : 'text-red-500')}>
                {changeText ??
                  `${isPositive ? '+' : ''}${formatPercent(safeChange ?? 0)}%`}
              </span>
              {changeLabel && (
                <span className="text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconBgColor)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </Card>
  );
}
