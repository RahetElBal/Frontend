import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  User,
  Globe,
  Palette,
  Moon,
  Sun,
  Monitor,
  Coins,
} from 'lucide-react';
import { requiredString } from '@/common/validator/zodI18n';

import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/hooks/useUser';
import { useLanguage } from '@/hooks/useLanguage';
import { useForm } from '@/hooks/useForm';
import { toast } from '@/lib/toast';

type Theme = 'light' | 'dark' | 'system';

// Modal state type
type SettingsModalState = {
  type: 'editProfile';
} | null;

// Zod schema for profile form
const profileFormSchema = z.object({
  firstName: requiredString('Prénom'),
  lastName: requiredString('Nom'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { currentLanguage, languages, changeLanguage, currency, availableCurrencies, changeCurrency } = useLanguage();
  
  // Unified modal state
  const [modalState, setModalState] = useState<SettingsModalState>(null);
  const [theme, setTheme] = useState<Theme>('light');

  const isEditProfileOpen = modalState?.type === 'editProfile';

  // Form setup
  const form = useForm<ProfileFormData>({
    schema: profileFormSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isEditProfileOpen && user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditProfileOpen, user]);

  const currentLanguageName = languages.find(l => l.code === currentLanguage)?.name || currentLanguage;

  const handleSaveProfile = async (data: ProfileFormData) => {
    // TODO: Call API to update profile
    console.log('Saving profile:', data);
    toast.success(t('settings.profileUpdated'));
    setModalState(null);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

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
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground capitalize mt-1">
              {user?.role} {t('settings.account')}
            </p>
          </div>
          <Button variant="outline" onClick={() => setModalState({ type: 'editProfile' })}>
            {t('common.edit')}
          </Button>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">{t('settings.preferences')}</h2>
        <div className="space-y-4">
          {/* Language */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">{t('settings.language')}</h3>
                <p className="text-sm text-muted-foreground">{t('settings.languageDescription')}</p>
              </div>
            </div>
            <Select value={currentLanguage} onValueChange={(value) => changeLanguage(value as 'en' | 'fr' | 'es' | 'ar')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>{currentLanguageName}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Selection */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Coins className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">{t('settings.currency')}</h3>
                <p className="text-sm text-muted-foreground">{t('settings.currencyDescription')}</p>
              </div>
            </div>
            <Select value={currency.code} onValueChange={(value) => changeCurrency(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  {currency.flag} {currency.symbol} - {currency.code}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <span className="flex items-center gap-2">
                      <span>{curr.flag}</span>
                      <span>{curr.symbol}</span>
                      <span className="text-muted-foreground">- {curr.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Palette className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">{t('settings.appearance')}</h3>
                <p className="text-sm text-muted-foreground">{t('settings.appearanceDescription')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
              >
                <Sun className="h-4 w-4 me-1" />
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
              >
                <Moon className="h-4 w-4 me-1" />
                {t('settings.dark')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('system')}
              >
                <Monitor className="h-4 w-4 me-1" />
                Auto
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onOpenChange={(open) => !open && setModalState(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('settings.editProfile')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSaveProfile)}>
            <div className="grid gap-4 py-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-accent-pink/20 flex items-center justify-center">
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.firstName}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-accent-pink" />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('fields.firstName')} *</Label>
                  <Input
                    id="firstName"
                    {...form.register('firstName')}
                  />
                  {form.hasError('firstName') && (
                    <p className="text-sm text-destructive">{form.getError('firstName')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('fields.lastName')} *</Label>
                  <Input
                    id="lastName"
                    {...form.register('lastName')}
                  />
                  {form.hasError('lastName') && (
                    <p className="text-sm text-destructive">{form.getError('lastName')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('fields.email')}</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  {t('settings.emailCannotChange')}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalState(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting ? t('common.loading') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
