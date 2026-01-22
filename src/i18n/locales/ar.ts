import type { TranslationKeys } from './en';

export const ar: TranslationKeys = {
  auth: {
    login: {
      title: 'مرحباً',
      subtitle: 'سجّل الدخول لإدارة صالون التجميل الخاص بك',
      googleButton: 'المتابعة باستخدام Google',
      contactUs: 'اتصل بنا',
      phoneLabel: 'الهاتف',
      loading: 'جارٍ تسجيل الدخول...',
      error: {
        generic: 'حدث خطأ أثناء تسجيل الدخول',
        cancelled: 'تم إلغاء تسجيل الدخول',
        popup: 'تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى',
      },
    },
    logout: 'تسجيل الخروج',
    roles: {
      user: 'مستخدم',
      admin: 'مدير',
    },
  },
  common: {
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
  },
};
