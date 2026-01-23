import { useTranslation } from 'react-i18next';
import { Plus, Gift, MoreHorizontal, Eye, Ban } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GiftCardStatus } from '@/types/entities';
import type { GiftCard } from '@/types/entities';
import { cn } from '@/lib/utils';

// TODO: Replace with real API data
const giftCards: GiftCard[] = [];

const statusColors: Record<GiftCardStatus, 'default' | 'success' | 'warning' | 'error'> = {
  [GiftCardStatus.ACTIVE]: 'success',
  [GiftCardStatus.REDEEMED]: 'default',
  [GiftCardStatus.EXPIRED]: 'error',
  [GiftCardStatus.CANCELLED]: 'error',
};

export function GiftCardsPage() {
  const { t } = useTranslation();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  // Stats
  const totalValue = giftCards
    .filter((gc) => gc.status === GiftCardStatus.ACTIVE)
    .reduce((sum, gc) => sum + gc.currentValue, 0);
  const activeCount = giftCards.filter((gc) => gc.status === GiftCardStatus.ACTIVE).length;
  const redeemedCount = giftCards.filter((gc) => gc.status === GiftCardStatus.REDEEMED).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.giftCards')}
        description={t('giftCards.description')}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('giftCards.createCard')}
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('giftCards.outstandingValue')}</p>
          <p className="text-2xl font-bold text-accent-pink">{formatCurrency(totalValue)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('giftCards.activeCards')}</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{t('giftCards.redeemedCards')}</p>
          <p className="text-2xl font-bold">{redeemedCount}</p>
        </Card>
      </div>

      {/* Gift Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {giftCards.map((giftCard) => {
          const percentUsed =
            ((giftCard.initialValue - giftCard.currentValue) / giftCard.initialValue) * 100;

          return (
            <Card
              key={giftCard.id}
              className={cn(
                'overflow-hidden transition-shadow hover:shadow-md',
                giftCard.status !== GiftCardStatus.ACTIVE && 'opacity-60'
              )}
            >
              {/* Card Header with gradient */}
              <div className="bg-gradient-to-r from-accent-pink to-accent-blue p-4 text-white">
                <div className="flex items-center justify-between">
                  <Gift className="h-6 w-6" />
                  <Badge
                    variant={statusColors[giftCard.status]}
                    className="bg-white/20 text-white border-none"
                  >
                    {giftCard.status}
                  </Badge>
                </div>
                <p className="mt-4 font-mono text-lg tracking-wider">{giftCard.code}</p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                {/* Value */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('giftCards.balance')}</p>
                    <p className="text-2xl font-bold">{formatCurrency(giftCard.currentValue)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    / {formatCurrency(giftCard.initialValue)}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-pink transition-all"
                    style={{ width: `${100 - percentUsed}%` }}
                  />
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  {giftCard.purchasedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('giftCards.purchasedBy')}</span>
                      <span>
                        {giftCard.purchasedBy.firstName} {giftCard.purchasedBy.lastName}
                      </span>
                    </div>
                  )}
                  {giftCard.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('giftCards.expires')}</span>
                      <span>{new Date(giftCard.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 me-2" />
                        {t('giftCards.viewHistory')}
                      </DropdownMenuItem>
                      {giftCard.status === GiftCardStatus.ACTIVE && (
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="h-4 w-4 me-2" />
                          {t('giftCards.deactivate')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
