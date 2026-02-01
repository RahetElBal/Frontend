import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-accent-pink',
  iconBgColor = 'bg-accent-pink/10',
}: StatsCardProps) {
  const safeChange = Number.isFinite(change) ? change : undefined;
  const isPositive = safeChange !== undefined && safeChange >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {safeChange !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(isPositive ? 'text-green-500' : 'text-red-500')}>
                {isPositive ? '+' : ''}{safeChange.toFixed(1)}%
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
