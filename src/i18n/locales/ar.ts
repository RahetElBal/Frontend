import type { TranslationKeys } from './en';

export const ar: TranslationKeys = {
  // ============================================
  // COMMON
  // ============================================
  common: {
    loading: 'جارٍ التحميل...',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    clear: 'مسح',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    reset: 'إعادة تعيين',
    close: 'إغلاق',
    yes: 'نعم',
    no: 'لا',
    or: 'أو',
    and: 'و',
    all: 'الكل',
    none: 'لا شيء',
    select: 'اختيار',
    selected: 'محدد',
    noResults: 'لم يتم العثور على نتائج',
    required: 'مطلوب',
    optional: 'اختياري',
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
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

  // ============================================
  // FORM FIELDS
  // ============================================
  fields: {
    // Personal info
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    address: 'العنوان',
    city: 'المدينة',
    postalCode: 'الرمز البريدي',
    country: 'الدولة',
    dateOfBirth: 'تاريخ الميلاد',
    gender: 'الجنس',
    
    // Account
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    
    // Business
    companyName: 'اسم الشركة',
    businessName: 'الاسم التجاري',
    salonName: 'اسم الصالون',
    description: 'الوصف',
    notes: 'ملاحظات',
    
    // Date/Time
    date: 'التاريخ',
    time: 'الوقت',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    startTime: 'وقت البدء',
    endTime: 'وقت الانتهاء',
    duration: 'المدة',
    
    // Financial
    price: 'السعر',
    amount: 'المبلغ',
    total: 'الإجمالي',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    discount: 'الخصم',
    
    // Status
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    pending: 'قيد الانتظار',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    
    // Placeholders
    placeholders: {
      email: 'example@email.com',
      phone: '+966 50 123 4567',
      search: 'بحث...',
      select: 'اختر خياراً',
    },
  },

  // ============================================
  // VALIDATION MESSAGES
  // ============================================
  validation: {
    // Required
    required: '{{field}} مطلوب',
    requiredField: 'هذا الحقل مطلوب',
    
    // String validations
    string: {
      min: '{{field}} يجب أن يحتوي على {{min}} أحرف على الأقل',
      max: '{{field}} يجب أن يحتوي على {{max}} أحرف كحد أقصى',
      length: '{{field}} يجب أن يحتوي على {{length}} أحرف بالضبط',
      email: 'يرجى إدخال عنوان بريد إلكتروني صالح',
      url: 'يرجى إدخال رابط صالح',
      uuid: 'يرجى إدخال معرف UUID صالح',
      regex: 'تنسيق {{field}} غير صالح',
      startsWith: '{{field}} يجب أن يبدأ بـ "{{value}}"',
      endsWith: '{{field}} يجب أن ينتهي بـ "{{value}}"',
      trim: '{{field}} لا يمكن أن يحتوي على مسافات في البداية أو النهاية',
      lowercase: '{{field}} يجب أن يكون بأحرف صغيرة',
      uppercase: '{{field}} يجب أن يكون بأحرف كبيرة',
    },
    
    // Number validations
    number: {
      min: '{{field}} يجب أن يكون {{min}} على الأقل',
      max: '{{field}} يجب أن يكون {{max}} كحد أقصى',
      positive: '{{field}} يجب أن يكون رقماً موجباً',
      negative: '{{field}} يجب أن يكون رقماً سالباً',
      integer: '{{field}} يجب أن يكون عدداً صحيحاً',
      multipleOf: '{{field}} يجب أن يكون مضاعفاً لـ {{value}}',
    },
    
    // Date validations
    date: {
      min: '{{field}} يجب أن يكون بعد {{min}}',
      max: '{{field}} يجب أن يكون قبل {{max}}',
      invalid: 'يرجى إدخال تاريخ صالح',
    },
    
    // Array validations
    array: {
      min: 'يرجى اختيار {{min}} عنصر/عناصر على الأقل',
      max: 'يرجى اختيار {{max}} عنصر/عناصر كحد أقصى',
      length: 'يرجى اختيار {{length}} عنصر/عناصر بالضبط',
      nonempty: 'يرجى اختيار عنصر واحد على الأقل',
    },
    
    // Custom validations
    custom: {
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordWeak: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل، وحرف صغير، ورقم، وحرف خاص',
      phoneInvalid: 'يرجى إدخال رقم هاتف صالح',
      postalCodeInvalid: 'يرجى إدخال رمز بريدي صالح',
      invalidSelection: 'يرجى اختيار خيار صالح',
      futureDate: 'يجب أن يكون التاريخ في المستقبل',
      pastDate: 'يجب أن يكون التاريخ في الماضي',
      fileSize: 'يجب أن يكون حجم الملف أقل من {{size}}',
      fileType: 'يجب أن يكون نوع الملف {{types}}',
    },
  },

  // ============================================
  // ERRORS
  // ============================================
  errors: {
    generic: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    network: 'خطأ في الشبكة. يرجى التحقق من اتصالك.',
    unauthorized: 'غير مصرح لك بتنفيذ هذا الإجراء.',
    forbidden: 'تم رفض الوصول.',
    notFound: 'لم يتم العثور على المورد المطلوب.',
    serverError: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
    timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
    validation: 'يرجى التحقق من الأخطاء في النموذج.',
  },

  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  success: {
    saved: 'تم حفظ التغييرات بنجاح',
    created: 'تم إنشاء {{item}} بنجاح',
    updated: 'تم تحديث {{item}} بنجاح',
    deleted: 'تم حذف {{item}} بنجاح',
    copied: 'تم النسخ إلى الحافظة',
  },

  // ============================================
  // CONFIRMATIONS
  // ============================================
  confirmations: {
    delete: 'هل أنت متأكد من رغبتك في حذف {{item}}؟',
    unsavedChanges: 'لديك تغييرات غير محفوظة. هل أنت متأكد من رغبتك في المغادرة؟',
    logout: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
  },

  // ============================================
  // DATE & TIME
  // ============================================
  dateTime: {
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    lastWeek: 'الأسبوع الماضي',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    thisYear: 'هذه السنة',
    
    days: {
      monday: 'الإثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
      sunday: 'الأحد',
    },
    daysShort: {
      monday: 'إث',
      tuesday: 'ث',
      wednesday: 'أر',
      thursday: 'خ',
      friday: 'ج',
      saturday: 'س',
      sunday: 'أح',
    },
    
    months: {
      january: 'يناير',
      february: 'فبراير',
      march: 'مارس',
      april: 'أبريل',
      may: 'مايو',
      june: 'يونيو',
      july: 'يوليو',
      august: 'أغسطس',
      september: 'سبتمبر',
      october: 'أكتوبر',
      november: 'نوفمبر',
      december: 'ديسمبر',
    },
    monthsShort: {
      january: 'ينا',
      february: 'فبر',
      march: 'مار',
      april: 'أبر',
      may: 'ماي',
      june: 'يون',
      july: 'يول',
      august: 'أغس',
      september: 'سبت',
      october: 'أكت',
      november: 'نوف',
      december: 'ديس',
    },
  },

  // ============================================
  // LANGUAGES
  // ============================================
  languages: {
    en: 'الإنجليزية',
    fr: 'الفرنسية',
    es: 'الإسبانية',
    ar: 'العربية',
    selectLanguage: 'اختر اللغة',
  },

  // ============================================
  // NAVIGATION
  // ============================================
  nav: {
    dashboard: 'لوحة التحكم',
    clients: 'العملاء',
    agenda: 'جدول المواعيد',
    services: 'الخدمات',
    products: 'المنتجات',
    sales: 'المبيعات',
    loyalty: 'الولاء',
    giftCards: 'بطاقات الهدايا',
    marketing: 'التسويق',
    analytics: 'التحليلات',
    settings: 'الإعدادات',
    sections: {
      management: 'الإدارة',
      inventory: 'المخزون',
      engagement: 'التفاعل',
      insights: 'الرؤى',
      account: 'الحساب',
      administration: 'الإدارة',
      system: 'النظام',
    },
    admin: {
      dashboard: 'لوحة تحكم المدير',
      users: 'المستخدمون',
      salons: 'الصالونات',
      tags: 'العلامات',
      templates: 'القوالب',
      permissions: 'الصلاحيات',
      settings: 'الإعدادات',
    },
    user: {
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
    },
  },
};
