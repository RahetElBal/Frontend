import { useTranslation } from 'react-i18next';
import {
  Mail,
  MessageSquare,
  Users,
  Send,
  Clock,
  CheckCircle,
  Plus,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/badge';
import { cn } from '@/lib/utils';

// Mock campaigns data
const mockCampaigns = [
  {
    id: 'camp-1',
    name: 'January Special Offers',
    type: 'email',
    status: 'sent',
    recipients: 156,
    opened: 89,
    clicked: 34,
    sentAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'camp-2',
    name: 'Loyalty Members - 20% Off',
    type: 'whatsapp',
    status: 'sent',
    recipients: 45,
    opened: 42,
    clicked: 28,
    sentAt: '2024-01-18T14:00:00Z',
  },
  {
    id: 'camp-3',
    name: 'Valentine\'s Day Promo',
    type: 'email',
    status: 'scheduled',
    recipients: 200,
    scheduledAt: '2024-02-10T09:00:00Z',
  },
  {
    id: 'camp-4',
    name: 'New Services Announcement',
    type: 'whatsapp',
    status: 'draft',
    recipients: 0,
  },
];

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  sent: 'success',
  scheduled: 'info',
  draft: 'warning',
};

export function MarketingPage() {
  const { t } = useTranslation();

  // Stats
  const totalSent = mockCampaigns.filter((c) => c.status === 'sent').length;
  const totalRecipients = mockCampaigns
    .filter((c) => c.status === 'sent')
    .reduce((sum, c) => sum + c.recipients, 0);
  const avgOpenRate =
    mockCampaigns
      .filter((c) => c.status === 'sent' && c.opened)
      .reduce((sum, c) => sum + (c.opened! / c.recipients) * 100, 0) / totalSent;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.marketing')}
        description={t('marketing.description')}
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t('marketing.newCampaign')}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent-pink/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-accent-pink" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('marketing.campaignsSent')}</p>
              <p className="text-xl font-bold">{totalSent}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-accent-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('marketing.totalRecipients')}</p>
              <p className="text-xl font-bold">{totalRecipients}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('marketing.avgOpenRate')}</p>
              <p className="text-xl font-bold">{avgOpenRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('marketing.scheduled')}</p>
              <p className="text-xl font-bold">
                {mockCampaigns.filter((c) => c.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('marketing.campaigns')}</h2>
        <div className="space-y-4">
          {mockCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    campaign.type === 'email' ? 'bg-blue-100' : 'bg-green-100'
                  )}
                >
                  {campaign.type === 'email' ? (
                    <Mail className="h-5 w-5 text-blue-600" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="capitalize">{campaign.type}</span>
                    {campaign.status === 'sent' && campaign.sentAt && (
                      <span>
                        {t('marketing.sentOn')} {new Date(campaign.sentAt).toLocaleDateString()}
                      </span>
                    )}
                    {campaign.status === 'scheduled' && campaign.scheduledAt && (
                      <span>
                        {t('marketing.scheduledFor')}{' '}
                        {new Date(campaign.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {campaign.status === 'sent' && (
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{campaign.recipients}</p>
                    <p className="text-muted-foreground">{t('marketing.sent')}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-600">
                      {((campaign.opened! / campaign.recipients) * 100).toFixed(0)}%
                    </p>
                    <p className="text-muted-foreground">{t('marketing.opened')}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-accent-blue">
                      {((campaign.clicked! / campaign.recipients) * 100).toFixed(0)}%
                    </p>
                    <p className="text-muted-foreground">{t('marketing.clicked')}</p>
                  </div>
                </div>
              )}

              {campaign.status === 'scheduled' && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {campaign.recipients} {t('marketing.recipients')}
                  </span>
                </div>
              )}

              {campaign.status === 'draft' && (
                <Button variant="outline" size="sm">
                  {t('common.edit')}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t('marketing.sendEmail')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('marketing.sendEmailDescription')}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">{t('marketing.sendWhatsApp')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('marketing.sendWhatsAppDescription')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
