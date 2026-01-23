import { useTranslation } from 'react-i18next';
import {
  User,
  Building2,
  Bell,
  Globe,
  Palette,
  Shield,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { useLanguage } from '@/hooks/useLanguage';

interface SettingsItemProps {
  icon: typeof User;
  title: string;
  description: string;
  onClick?: () => void;
  badge?: string;
}

function SettingsItem({ icon: Icon, title, description, onClick, badge }: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-4 text-start rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-sm text-muted-foreground">{badge}</span>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { currentLanguage, languages } = useLanguage();
  
  // Get the current language name from the languages array
  const currentLanguageName = languages.find(l => l.code === currentLanguage)?.name || currentLanguage;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.settings')}
        description={t('settings.description')}
      />

      {/* Profile Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('settings.profile')}</h2>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className="h-16 w-16 rounded-full bg-accent-pink/20 flex items-center justify-center">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.firstName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-accent-pink">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {user?.role} {t('settings.account')}
            </p>
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('settings.accountSettings')}</h2>
        <div className="space-y-2">
          <SettingsItem
            icon={User}
            title={t('settings.personalInfo')}
            description={t('settings.personalInfoDescription')}
          />
          <SettingsItem
            icon={Shield}
            title={t('settings.security')}
            description={t('settings.securityDescription')}
          />
          <SettingsItem
            icon={Bell}
            title={t('settings.notifications')}
            description={t('settings.notificationsDescription')}
          />
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('settings.preferences')}</h2>
        <div className="space-y-2">
          <SettingsItem
            icon={Globe}
            title={t('settings.language')}
            description={t('settings.languageDescription')}
            badge={currentLanguageName}
          />
          <SettingsItem
            icon={Palette}
            title={t('settings.appearance')}
            description={t('settings.appearanceDescription')}
            badge={t('settings.light')}
          />
        </div>
      </Card>

      {/* Business Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('settings.businessSettings')}</h2>
        <div className="space-y-2">
          <SettingsItem
            icon={Building2}
            title={t('settings.salonInfo')}
            description={t('settings.salonInfoDescription')}
          />
          <SettingsItem
            icon={CreditCard}
            title={t('settings.billing')}
            description={t('settings.billingDescription')}
          />
        </div>
      </Card>
    </div>
  );
}
