import { useTranslation } from 'react-i18next';
import { Heart, Star, Trophy, Crown, Gift, TrendingUp } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils';
import type { LoyaltyProgram, LoyaltyTransaction, Client } from '@/types/entities';

// TODO: Replace with real API data
const loyaltyProgram: LoyaltyProgram = {
  id: '',
  name: 'Loyalty Program',
  pointsPerCurrency: 1,
  redemptionRate: 0.05,
  minimumPoints: 100,
  isActive: false,
  salonId: '',
  tiers: [],
  createdAt: '',
  updatedAt: '',
};

const loyaltyTransactions: LoyaltyTransaction[] = [];
const clients: Client[] = [];

const tierIcons = [Star, Trophy, Crown, Gift];
const tierColors = ['text-orange-500', 'text-gray-400', 'text-yellow-500', 'text-purple-500'];

export function LoyaltyPage() {
  const { t } = useTranslation();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

  // Calculate stats
  const totalPointsIssued = loyaltyTransactions
    .filter((tx) => tx.type === 'earn')
    .reduce((sum, tx) => sum + tx.points, 0);
  const totalPointsRedeemed = Math.abs(
    loyaltyTransactions
      .filter((tx) => tx.type === 'redeem')
      .reduce((sum, tx) => sum + tx.points, 0)
  );

  // Get top clients by points
  const topClients = [...clients]
    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
    .slice(0, 5);

  // Get tier for points
  const getTier = (points: number) => {
    if (!loyaltyProgram.tiers) return null;
    return [...loyaltyProgram.tiers]
      .reverse()
      .find((tier) => points >= tier.minPoints);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.loyalty')}
        description={loyaltyProgram.name}
        actions={
          <Button variant="outline" className="gap-2">
            {t('loyalty.programSettings')}
          </Button>
        }
      />

      {/* Program Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent-pink/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-accent-pink" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('loyalty.activeMembers')}</p>
              <p className="text-xl font-bold">{clients.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('loyalty.pointsIssued')}</p>
              <p className="text-xl font-bold">{totalPointsIssued.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('loyalty.pointsRedeemed')}</p>
              <p className="text-xl font-bold">{totalPointsRedeemed.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('loyalty.redemptionValue')}</p>
              <p className="text-xl font-bold">
                {formatCurrency(totalPointsRedeemed * loyaltyProgram.redemptionRate)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Loyalty Tiers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('loyalty.tiers')}</h2>
          <div className="space-y-4">
            {loyaltyProgram.tiers?.map((tier, index) => {
              const Icon = tierIcons[index] || Star;
              const colorClass = tierColors[index] || 'text-muted-foreground';

              return (
                <div
                  key={tier.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                >
                  <div
                    className={cn(
                      'h-12 w-12 rounded-full flex items-center justify-center',
                      index === 0
                        ? 'bg-orange-100'
                        : index === 1
                        ? 'bg-gray-200'
                        : index === 2
                        ? 'bg-yellow-100'
                        : 'bg-purple-100'
                    )}
                  >
                    <Icon className={cn('h-6 w-6', colorClass)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{tier.name}</h3>
                      <Badge variant="default">
                        {tier.multiplier}x {t('loyalty.multiplier')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tier.minPoints.toLocaleString()}+ {t('loyalty.points')}
                    </p>
                    {tier.benefits && tier.benefits.length > 0 && (
                      <ul className="mt-2 text-sm space-y-1">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent-pink" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Loyalty Members */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t('loyalty.topMembers')}</h2>
          <div className="space-y-3">
            {topClients.map((client, index) => {
              const tier = getTier(client.loyaltyPoints);
              const Icon = tierIcons[loyaltyProgram.tiers?.indexOf(tier!) ?? 0] || Star;

              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold',
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                          ? 'bg-gray-200 text-gray-700'
                          : index === 2
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">
                        {client.firstName} {client.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon className="h-3 w-3" />
                        {tier?.name || 'Member'}
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-accent-pink">
                      {client.loyaltyPoints.toLocaleString()} pts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(client.totalSpent)} {t('loyalty.spent')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('loyalty.recentActivity')}</h2>
        <div className="space-y-3">
          {loyaltyTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center',
                    tx.type === 'earn'
                      ? 'bg-green-100'
                      : tx.type === 'redeem'
                      ? 'bg-blue-100'
                      : 'bg-muted'
                  )}
                >
                  {tx.type === 'earn' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <Gift className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {tx.client?.firstName} {tx.client?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{tx.description}</p>
                </div>
              </div>
              <div className="text-end">
                <p
                  className={cn(
                    'font-bold',
                    tx.points > 0 ? 'text-green-600' : 'text-blue-600'
                  )}
                >
                  {tx.points > 0 ? '+' : ''}
                  {tx.points} pts
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
