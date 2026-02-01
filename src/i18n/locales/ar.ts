export const ar = {
  // ============================================
  // COMMON
  // ============================================
  common: {
    loading: "جارٍ التحميل...",
    error: "خطأ",
    retry: "إعادة المحاولة",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    filter: "تصفية",
    clear: "مسح",
    confirm: "تأكيد",
    back: "رجوع",
    next: "التالي",
    previous: "السابق",
    submit: "إرسال",
    reset: "إعادة تعيين",
    close: "إغلاق",
    yes: "نعم",
    no: "لا",
    or: "أو",
    and: "و",
    all: "الكل",
    none: "لا شيء",
    select: "اختيار",
    selected: "محدد",
    noResults: "لم يتم العثور على نتائج",
    required: "مطلوب",
    optional: "اختياري",
    selectAll: "تحديد الكل",
    selectRow: "تحديد الصف",
    selectedCount: "{{count}} محدد",
    showingCount: "عرض {{from}} إلى {{to}} من {{total}}",
    pageOf: "صفحة {{page}} من {{total}}",
    actions: "الإجراءات",
    create: "إنشاء",
    update: "تحديث",
    view: "عرض",
    archive: "أرشفة",
    viewAll: "عرض الكل",
    welcome: "مرحباً، {{name}}",
    item: "عنصر",
    items: "عناصر",
    inactive: "غير نشط",
    active: "نشط",
    deactivate: "تعطيل",
    activate: "تفعيل",
    unknown: "غير معروف",
    unauthorized: "غير مصرح لك بتنفيذ هذا الإجراء",
    success: "نجاح",
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
  auth: {
    login: {
      title: "مرحباً",
      subtitle: "سجّل الدخول لإدارة صالون التجميل الخاص بك",
      googleButton: "المتابعة باستخدام Google",
      contactUs: "اتصل بنا",
      phoneLabel: "الهاتف",
      loading: "جارٍ تسجيل الدخول...",
      error: {
        generic: "حدث خطأ أثناء تسجيل الدخول",
        cancelled: "تم إلغاء تسجيل الدخول",
        popup:
          "تم حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى",
      },
    },
    logout: "تسجيل الخروج",
    roles: {
      user: "مستخدم",
      admin: "مدير",
    },
  },

  // ============================================
  // FORM FIELDS
  // ============================================
  fields: {
    // Personal info
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    address: "العنوان",
    city: "المدينة",
    postalCode: "الرمز البريدي",
    country: "الدولة",
    dateOfBirth: "تاريخ الميلاد",
    gender: "الجنس",

    // Account
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",

    // Business
    companyName: "اسم الشركة",
    businessName: "الاسم التجاري",
    salonName: "اسم الصالون",
    description: "الوصف",
    notes: "ملاحظات",

    // Date/Time
    date: "التاريخ",
    time: "الوقت",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    startTime: "وقت البدء",
    endTime: "وقت الانتهاء",
    duration: "المدة",

    // Financial
    price: "السعر",
    amount: "المبلغ",
    total: "الإجمالي",
    subtotal: "المجموع الفرعي",
    tax: "الضريبة",
    discount: "الخصم",

    // Status
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    pending: "قيد الانتظار",
    completed: "مكتمل",
    cancelled: "ملغي",

    // Table columns
    name: "الاسم",
    loyaltyPoints: "نقاط الولاء",
    totalSpent: "إجمالي الإنفاق",
    visits: "الزيارات",
    lastVisit: "آخر زيارة",
    product: "المنتج",
    category: "الفئة",
    stock: "المخزون",
    receipt: "الإيصال",
    client: "العميل",
    items: "العناصر",
    payment: "الدفع",
    salon: "الصالون",
    role: "الدور",
    createdAt: "تاريخ الإنشاء",
    staff: "الموظفون",
    reference: "المرجع",

    // Placeholders
    placeholders: {
      email: "example@email.com",
      phone: "+966 50 123 4567",
      search: "بحث...",
      select: "اختر خياراً",
    },
  },

  // ============================================
  // VALIDATION MESSAGES
  // ============================================
  validation: {
    // Required
    required: "{{field}} مطلوب",
    requiredField: "هذا الحقل مطلوب",

    // String validations
    string: {
      min: "{{field}} يجب أن يحتوي على {{min}} أحرف على الأقل",
      max: "{{field}} يجب أن يحتوي على {{max}} أحرف كحد أقصى",
      length: "{{field}} يجب أن يحتوي على {{length}} أحرف بالضبط",
      email: "يرجى إدخال عنوان بريد إلكتروني صالح",
      url: "يرجى إدخال رابط صالح",
      uuid: "يرجى إدخال معرف UUID صالح",
      regex: "تنسيق {{field}} غير صالح",
      startsWith: '{{field}} يجب أن يبدأ بـ "{{value}}"',
      endsWith: '{{field}} يجب أن ينتهي بـ "{{value}}"',
      trim: "{{field}} لا يمكن أن يحتوي على مسافات في البداية أو النهاية",
      lowercase: "{{field}} يجب أن يكون بأحرف صغيرة",
      uppercase: "{{field}} يجب أن يكون بأحرف كبيرة",
    },

    // Number validations
    number: {
      min: "{{field}} يجب أن يكون {{min}} على الأقل",
      max: "{{field}} يجب أن يكون {{max}} كحد أقصى",
      positive: "{{field}} يجب أن يكون رقماً موجباً",
      negative: "{{field}} يجب أن يكون رقماً سالباً",
      integer: "{{field}} يجب أن يكون عدداً صحيحاً",
      multipleOf: "{{field}} يجب أن يكون مضاعفاً لـ {{value}}",
    },

    // Date validations
    date: {
      min: "{{field}} يجب أن يكون بعد {{min}}",
      max: "{{field}} يجب أن يكون قبل {{max}}",
      invalid: "يرجى إدخال تاريخ صالح",
    },

    // Array validations
    array: {
      min: "يرجى اختيار {{min}} عنصر/عناصر على الأقل",
      max: "يرجى اختيار {{max}} عنصر/عناصر كحد أقصى",
      length: "يرجى اختيار {{length}} عنصر/عناصر بالضبط",
      nonempty: "يرجى اختيار عنصر واحد على الأقل",
    },

    // Custom validations
    custom: {
      passwordMismatch: "كلمات المرور غير متطابقة",
      passwordWeak:
        "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل، وحرف صغير، ورقم، وحرف خاص",
      phoneInvalid: "يرجى إدخال رقم هاتف صالح",
      postalCodeInvalid: "يرجى إدخال رمز بريدي صالح",
      invalidSelection: "يرجى اختيار خيار صالح",
      futureDate: "يجب أن يكون التاريخ في المستقبل",
      pastDate: "يجب أن يكون التاريخ في الماضي",
      fileSize: "يجب أن يكون حجم الملف أقل من {{size}}",
      fileType: "يجب أن يكون نوع الملف {{types}}",
      salonRequired: "يجب تعيين المستخدمين إلى صالون",
    },
  },

  // ============================================
  // ERRORS
  // ============================================
  errors: {
    generic: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    network: "خطأ في الشبكة. يرجى التحقق من اتصالك.",
    unauthorized: "غير مصرح لك بتنفيذ هذا الإجراء.",
    forbidden: "تم رفض الوصول.",
    notFound: "لم يتم العثور على المورد المطلوب.",
    serverError: "خطأ في الخادم. يرجى المحاولة لاحقاً.",
    timeout: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.",
    validation: "يرجى التحقق من الأخطاء في النموذج.",
    somethingWentWrong: "حدث خطأ ما",
    unexpectedError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    pageError: "خطأ في الصفحة",
    pageErrorDescription: "حدثت مشكلة أثناء تحميل هذه الصفحة.",
  },

  confirm: {
    title: "هل أنت متأكد؟",
    description: "لا يمكن التراجع عن هذا الإجراء.",
    delete: "حذف",
    deleteDescription:
      "هل أنت متأكد من أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",
  },

  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  success: {
    saved: "تم حفظ التغييرات بنجاح",
    created: "تم إنشاء {{item}} بنجاح",
    updated: "تم تحديث {{item}} بنجاح",
    deleted: "تم حذف {{item}} بنجاح",
    copied: "تم النسخ إلى الحافظة",
  },

  // ============================================
  // CONFIRMATIONS
  // ============================================
  confirmations: {
    delete: "هل أنت متأكد من رغبتك في حذف {{item}}؟",
    unsavedChanges:
      "لديك تغييرات غير محفوظة. هل أنت متأكد من رغبتك في المغادرة؟",
    logout: "هل أنت متأكد من رغبتك في تسجيل الخروج؟",
  },

  // ============================================
  // DATE & TIME
  // ============================================
  dateTime: {
    today: "اليوم",
    yesterday: "أمس",
    tomorrow: "غداً",
    thisWeek: "هذا الأسبوع",
    lastWeek: "الأسبوع الماضي",
    thisMonth: "هذا الشهر",
    lastMonth: "الشهر الماضي",
    thisYear: "هذه السنة",

    days: {
      monday: "الإثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
      sunday: "الأحد",
    },
    daysShort: {
      monday: "إث",
      tuesday: "ث",
      wednesday: "أر",
      thursday: "خ",
      friday: "ج",
      saturday: "س",
      sunday: "أح",
    },

    months: {
      january: "يناير",
      february: "فبراير",
      march: "مارس",
      april: "أبريل",
      may: "مايو",
      june: "يونيو",
      july: "يوليو",
      august: "أغسطس",
      september: "سبتمبر",
      october: "أكتوبر",
      november: "نوفمبر",
      december: "ديسمبر",
    },
    monthsShort: {
      january: "ينا",
      february: "فبر",
      march: "مار",
      april: "أبر",
      may: "ماي",
      june: "يون",
      july: "يول",
      august: "أغس",
      september: "سبت",
      october: "أكت",
      november: "نوف",
      december: "ديس",
    },
  },

  // ============================================
  // LANGUAGES
  // ============================================
  languages: {
    en: "الإنجليزية",
    fr: "الفرنسية",
    es: "الإسبانية",
    ar: "العربية",
    selectLanguage: "اختر اللغة",
  },

  // ============================================
  // NAVIGATION
  // ============================================
  nav: {
    dashboard: "لوحة التحكم",
    clients: "العملاء",
    agenda: "جدول المواعيد",
    services: "الخدمات",
    products: "المنتجات",
    sales: "المبيعات",
    loyalty: "الولاء",
    giftCards: "بطاقات الهدايا",
    marketing: "التسويق",
    analytics: "التحليلات",
    settings: "الإعدادات",
    sections: {
      management: "الإدارة",
      inventory: "المخزون",
      engagement: "التفاعل",
      insights: "الرؤى",
      account: "الحساب",
      administration: "الإدارة",
      system: "النظام",
    },
    admin: {
      dashboard: "لوحة تحكم المدير",
      users: "المستخدمون",
      salons: "الصالونات",
      tags: "العلامات",
      templates: "القوالب",
      permissions: "الصلاحيات",
      settings: "الإعدادات",
    },
    user: {
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
    },
  },

  dashboard: {
    todayRevenue: "إيرادات اليوم",
    todayAppointments: "مواعيد اليوم",
    newClients: "عملاء جدد",
    averageTicket: "متوسط الفاتورة",
    vsLastWeek: "مقارنة بالأسبوع الماضي",
    todaysAppointments: "مواعيد اليوم",
    topServices: "الخدمات الأكثر طلباً",
    bookings: "حجز",
  },

  clients: {
    description: "{{count}} عميل في قاعدة البيانات",
    addClient: "إضافة عميل",
    searchPlaceholder: "البحث بالاسم أو البريد أو الهاتف...",
    noClients: "لم يتم العثور على عملاء",
  },

  agenda: {
    description: "إدارة المواعيد",
    newAppointment: "موعد جديد",
    today: "اليوم",
    confirmed: "مؤكد",
    pending: "قيد الانتظار",
    appointments: "مواعيد",
  },

  services: {
    description: "{{count}} خدمة متاحة",
    addService: "إضافة خدمة",
    services: "خدمات",
    selectCategory: "اختر أو اكتب فئة",
    serviceDetails: "تفاصيل الخدمة",
    deleteService: "حذف الخدمة",
    deleteServiceConfirm:
      "هل أنت متأكد من حذف {{name}}؟ لا يمكن التراجع عن هذا الإجراء.",
    categories: {
      nails: "الأظافر",
      makeup: "المكياج",
      hair: "الشعر",
      skincare: "العناية بالبشرة",
    },
    defaults: {
      nails: {
        manicure: "مانيكير",
        pedicure: "باديكير",
        nailArt: "فن الأظافر",
      },
      makeup: {
        casual: "مكياج يومي",
        wedding: "مكياج زفاف",
      },
      hair: {
        casual: "تسريحة يومية",
        wedding: "تسريحة زفاف",
        haircut: "قص شعر",
        hairDye: "صبغة شعر",
        hairstyle: "تصفيف شعر",
      },
      skincare: {
        laser: "ليزر",
        hydrafacial: "هايدرافيشل",
        microneedling: "الميكرونيدلينغ",
      },
    },
  },

  products: {
    description: "{{count}} منتج في المخزون",
    addProduct: "إضافة منتج",
    searchPlaceholder: "البحث بالاسم أو الرمز...",
    noProducts: "لم يتم العثور على منتجات",
    brand: "العلامة التجارية",
    selectCategory: "اختر أو اكتب فئة",
    cost: "التكلفة",
    outOfStock: "نفذ من المخزون",
    lowStock: "مخزون منخفض",
    stockAlerts: "تنبيهات المخزون",
  },

  sales: {
    description: "عرض وإدارة المبيعات",
    newSale: "عملية بيع جديدة",
    searchPlaceholder: "بحث...",
    noSales: "لم يتم العثور على مبيعات",
    walkIn: "عميل بدون موعد",
    discount: "خصم",
    todayTotal: "إجمالي اليوم",
    transactions: "المعاملات",
    averageTicket: "متوسط الفاتورة",
    printReceipt: "طباعة الإيصال",
  },

  giftCards: {
    description: "إدارة بطاقات الهدايا",
    createCard: "إنشاء بطاقة هدية",
    outstandingValue: "القيمة المتبقية",
    activeCards: "البطاقات النشطة",
    redeemedCards: "البطاقات المستخدمة",
    balance: "الرصيد",
    purchasedBy: "تم الشراء بواسطة",
    expires: "تنتهي في",
    viewHistory: "عرض السجل",
    deactivate: "تعطيل",
  },

  loyalty: {
    programSettings: "إعدادات البرنامج",
    activeMembers: "الأعضاء النشطون",
    pointsIssued: "النقاط الممنوحة",
    pointsRedeemed: "النقاط المستخدمة",
    redemptionValue: "قيمة الاستبدال",
    tiers: "مستويات الولاء",
    multiplier: "مضاعف",
    points: "نقاط",
    topMembers: "أفضل الأعضاء",
    spent: "أنفق",
    recentActivity: "النشاط الأخير",
  },

  analytics: {
    description: "عرض التحليلات والتقارير",
    last7Days: "آخر 7 أيام",
    last30Days: "آخر 30 يوم",
    thisMonth: "هذا الشهر",
    totalRevenue: "إجمالي الإيرادات",
    totalAppointments: "إجمالي المواعيد",
    newClients: "عملاء جدد",
    averageTicket: "متوسط الفاتورة",
    revenueOverTime: "تطور الإيرادات",
    revenue: "الإيرادات",
    appointments: "المواعيد",
    topServices: "الخدمات الأكثر طلباً",
    topProducts: "المنتجات الأكثر مبيعاً",
    bookings: "حجوزات",
    sold: "مباع",
    kpis: "مؤشرات الأداء الرئيسية",
    conversionRate: "معدل التحويل",
    clientRetention: "الاحتفاظ بالعملاء",
    noShowRate: "معدل عدم الحضور",
    productSalesRatio: "نسبة مبيعات المنتجات",
    vsLastMonth: "مقارنة بالشهر الماضي",
  },

  marketing: {
    description: "إنشاء وإدارة الحملات التسويقية",
    newCampaign: "حملة جديدة",
    campaignsSent: "الحملات المرسلة",
    totalRecipients: "إجمالي المستلمين",
    avgOpenRate: "متوسط معدل الفتح",
    scheduled: "مجدولة",
    campaigns: "الحملات",
    sentOn: "أرسلت في",
    scheduledFor: "مجدولة لـ",
    sent: "مرسل",
    opened: "مفتوح",
    clicked: "نقرات",
    recipients: "مستلمين",
    sendEmail: "إرسال حملة بريد إلكتروني",
    sendEmailDescription: "إنشاء وإرسال رسائل بريد إلكتروني لعملائك",
    sendWhatsApp: "إرسال رسالة واتساب",
    sendWhatsAppDescription: "إرسال رسائل ترويجية عبر واتساب",
  },

  settings: {
    description: "إدارة حسابك وتفضيلاتك",
    profile: "الملف الشخصي",
    account: "الحساب",
    editProfile: "تعديل الملف الشخصي",
    accountSettings: "إعدادات الحساب",
    personalInfo: "المعلومات الشخصية",
    personalInfoDescription: "تحديث الاسم والبريد والصورة",
    security: "الأمان",
    securityDescription: "إدارة كلمة المرور والأمان",
    notifications: "الإشعارات",
    notificationsDescription: "تكوين تفضيلات الإشعارات",
    preferences: "التفضيلات",
    language: "اللغة",
    languageDescription: "اختر لغتك المفضلة",
    currency: "العملة",
    currencyDescription: "يتم تحديد العملة تلقائياً حسب اللغة",
    appearance: "المظهر",
    appearanceDescription: "تخصيص مظهر التطبيق",
    light: "فاتح",
    dark: "داكن",
    businessSettings: "إعدادات العمل",
    salonInfo: "معلومات الصالون",
    salonInfoDescription: "تحديث تفاصيل الصالون وساعات العمل",
    billing: "الفواتير والاشتراك",
    billingDescription: "إدارة طرق الدفع والاشتراك",
  },

  viewMode: {
    title: "وضع العرض",
    admin: "عرض المدير",
    user: "عرض المستخدم",
    switchedToAdmin: "تم التبديل إلى عرض المدير",
    switchedToUser: "تم التبديل إلى عرض المستخدم",
    description: "معاينة التطبيق كدور مختلف",
  },

  admin: {
    dashboard: {
      title: "لوحة تحكم المدير",
      welcome: "مرحباً، {{name}}",
      recentSalons: "الصالونات الأخيرة",
      recentUsers: "المستخدمون الأخيرون",
      users: "مستخدمين",
      systemStatus: "حالة النظام",
    },
    stats: {
      totalSalons: "إجمالي الصالونات",
      totalUsers: "إجمالي المستخدمين",
      totalRevenue: "إجمالي الإيرادات",
      activeSubscriptions: "الاشتراكات النشطة",
    },
    status: {
      apiOnline: "API متصل",
      allSystemsOperational: "جميع الأنظمة تعمل",
      databaseOnline: "قاعدة البيانات متصلة",
      storageOnline: "التخزين متصل",
      used: "مستخدم",
    },
    users: {
      description: "{{count}} مستخدم في النظام",
      addUser: "إضافة مستخدم",
      searchPlaceholder: "البحث عن مستخدمين...",
      noUsers: "لم يتم العثور على مستخدمين",
    },
    salons: {
      description: "إدارة جميع الصالونات في النظام",
      addSalon: "إضافة صالون",
      totalSalons: "إجمالي الصالونات",
      activeSalons: "الصالونات النشطة",
      totalUsers: "إجمالي المستخدمين",
      monthlyRevenue: "الإيرادات الشهرية",
      users: "مستخدمين",
      noSalons: "لا توجد صالونات",
      addFirstSalon: "أضف أول صالون للبدء",
      salonDetails: "تفاصيل الصالون",
      deleteSalon: "حذف الصالون",
      deleteSalonConfirm:
        "هل أنت متأكد من حذف {{name}}؟ لا يمكن التراجع عن هذا الإجراء.",
      salonOwner: "مالك الصالون",
      selectOwner: "اختر مديراً كمالك",
      selectOwnerRequired: "الرجاء اختيار مالك الصالون",
      searchSalons: "ابحث عن الصالونات...",
      ownerHelp: "اختر المدير الذي سيمتلك ويدير هذا الصالون",
      ownerAutoAssigned: "سيتم تعيينك تلقائياً كمالك لهذا الصالون",
      yourSalon: "صالونك",
      staffCount: "الطاقم",
      name: "اسم الصالون",
      addSalonDescription: "أضف صالونك",
      address: "العنوان",
      phone: "رقم الهاتف",
      email: "البريد الإلكتروني",
    },
  },
} as const;
