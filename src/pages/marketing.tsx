import { useTranslation } from 'react-i18next';
import {
  Mail,
  MessageSquare,
  Users,
  Send,
  Clock,
  Plus,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function MarketingPage() {
  const { t } = useTranslation();

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

      {/* Stats - Empty state */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent-pink/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-accent-pink" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('marketing.campaignsSent')}</p>
              <p className="text-xl font-bold">0</p>
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
              <p className="text-xl font-bold">0</p>
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
              <p className="text-xl font-bold">0%</p>
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
              <p className="text-xl font-bold">0</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State */}
      <Card className="p-12 text-center">
        <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('marketing.noCampaigns')}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {t('marketing.noCampaignsDescription')}
        </p>
        <Button>
          <Plus className="h-4 w-4 me-2" />
          {t('marketing.newCampaign')}
        </Button>
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
