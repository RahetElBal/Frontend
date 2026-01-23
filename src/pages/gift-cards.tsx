import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    value: 50,
    recipientName: '',
    recipientEmail: '',
    message: '',
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  const totalValue = giftCards
    .filter((gc) => gc.status === GiftCardStatus.ACTIVE)
    .reduce((sum, gc) => sum + gc.currentValue, 0);
  const activeCount = giftCards.filter((gc) => gc.status === GiftCardStatus.ACTIVE).length;
  const redeemedCount = giftCards.filter((gc) => gc.status === GiftCardStatus.REDEEMED).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create gift card
    console.log('Creating gift card:', formData);
    setIsAddModalOpen(false);
    setFormData({ value: 50, recipientName: '', recipientEmail: '', message: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.giftCards')}
        description={t('giftCards.description')}
        actions={
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
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
      {giftCards.length === 0 ? (
        <Card className="p-12 text-center">
          <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('giftCards.noCards')}</h3>
          <p className="text-muted-foreground mb-4">{t('giftCards.noCardsDescription')}</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            {t('giftCards.createCard')}
          </Button>
        </Card>
      ) : (
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

                <div className="p-4 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('giftCards.balance')}</p>
                      <p className="text-2xl font-bold">{formatCurrency(giftCard.currentValue)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      / {formatCurrency(giftCard.initialValue)}
                    </p>
                  </div>

                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-pink transition-all"
                      style={{ width: `${100 - percentUsed}%` }}
                    />
                  </div>

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
      )}

      {/* Create Gift Card Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('giftCards.createCard')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="value">{t('giftCards.value')} (€)</Label>
                <Input
                  id="value"
                  type="number"
                  min="10"
                  step="10"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">{t('giftCards.recipientName')}</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">{t('giftCards.recipientEmail')}</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('giftCards.createCard')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
