// ============================================
// TRANSLATION KEYS TYPE STRUCTURE
// ============================================

export interface TranslationKeys {
  common: {
    loading: string;
    error: string;
    retry: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    clear: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    close: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    all: string;
    none: string;
    select: string;
    selected: string;
    noResults: string;
    required: string;
    optional: string;
    selectAll: string;
    selectRow: string;
    selectedCount: string;
    showingCount: string;
    pageOf: string;
    actions: string;
    create: string;
    update: string;
    view: string;
    archive: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      googleButton: string;
      contactUs: string;
      phoneLabel: string;
      loading: string;
      error: {
        generic: string;
        cancelled: string;
        popup: string;
      };
    };
    logout: string;
    roles: {
      user: string;
      admin: string;
    };
  };
  fields: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    dateOfBirth: string;
    gender: string;
    password: string;
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
    companyName: string;
    businessName: string;
    salonName: string;
    description: string;
    notes: string;
    date: string;
    time: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    duration: string;
    price: string;
    amount: string;
    total: string;
    subtotal: string;
    tax: string;
    discount: string;
    status: string;
    active: string;
    inactive: string;
    pending: string;
    completed: string;
    cancelled: string;
    placeholders: {
      email: string;
      phone: string;
      search: string;
      select: string;
    };
  };
  validation: {
    required: string;
    requiredField: string;
    string: {
      min: string;
      max: string;
      length: string;
      email: string;
      url: string;
      uuid: string;
      regex: string;
      startsWith: string;
      endsWith: string;
      trim: string;
      lowercase: string;
      uppercase: string;
    };
    number: {
      min: string;
      max: string;
      positive: string;
      negative: string;
      integer: string;
      multipleOf: string;
    };
    date: {
      min: string;
      max: string;
      invalid: string;
    };
    array: {
      min: string;
      max: string;
      length: string;
      nonempty: string;
    };
    custom: {
      passwordMismatch: string;
      passwordWeak: string;
      phoneInvalid: string;
      postalCodeInvalid: string;
      invalidSelection: string;
      futureDate: string;
      pastDate: string;
      fileSize: string;
      fileType: string;
    };
  };
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    serverError: string;
    timeout: string;
    validation: string;
    somethingWentWrong: string;
    unexpectedError: string;
    pageError: string;
    pageErrorDescription: string;
  };
  confirm: {
    title: string;
    description: string;
    delete: string;
    deleteDescription: string;
  };
  success: {
    saved: string;
    created: string;
    updated: string;
    deleted: string;
    copied: string;
  };
  confirmations: {
    delete: string;
    unsavedChanges: string;
    logout: string;
  };
  dateTime: {
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    lastWeek: string;
    thisMonth: string;
    lastMonth: string;
    thisYear: string;
    days: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    daysShort: {
      monday: string;
      tuesday: string;
      wednesday: string;
      thursday: string;
      friday: string;
      saturday: string;
      sunday: string;
    };
    months: {
      january: string;
      february: string;
      march: string;
      april: string;
      may: string;
      june: string;
      july: string;
      august: string;
      september: string;
      october: string;
      november: string;
      december: string;
    };
    monthsShort: {
      january: string;
      february: string;
      march: string;
      april: string;
      may: string;
      june: string;
      july: string;
      august: string;
      september: string;
      october: string;
      november: string;
      december: string;
    };
  };
  languages: {
    en: string;
    fr: string;
    es: string;
    ar: string;
    selectLanguage: string;
  };
  nav: {
    dashboard: string;
    clients: string;
    agenda: string;
    services: string;
    products: string;
    sales: string;
    loyalty: string;
    giftCards: string;
    marketing: string;
    analytics: string;
    settings: string;
    sections: {
      management: string;
      inventory: string;
      engagement: string;
      insights: string;
      account: string;
      administration: string;
      system: string;
    };
    admin: {
      dashboard: string;
      users: string;
      salons: string;
      tags: string;
      templates: string;
      permissions: string;
      settings: string;
    };
    user: {
      profile: string;
      settings: string;
      logout: string;
    };
  };
}

// ============================================
// ENGLISH TRANSLATIONS
// ============================================

export const en = {
  // ============================================
  // COMMON
  // ============================================
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    or: 'or',
    and: 'and',
    all: 'All',
    none: 'None',
    select: 'Select',
    selected: 'Selected',
    noResults: 'No results found',
    required: 'Required',
    optional: 'Optional',
    selectAll: 'Select all',
    selectRow: 'Select row',
    selectedCount: '{{count}} selected',
    showingCount: 'Showing {{from}} to {{to}} of {{total}}',
    pageOf: 'Page {{page}} of {{total}}',
    actions: 'Actions',
    create: 'Create',
    update: 'Update',
    view: 'View',
    archive: 'Archive',
    viewAll: 'View all',
    welcome: 'Welcome, {{name}}',
    item: 'item',
    items: 'items',
    inactive: 'Inactive',
    active: 'Active',
    deactivate: 'Deactivate',
    activate: 'Activate',
    hour: 'hour',
    hours: 'hours',
    day: 'day',
    days: 'days',
    before: 'before',
    other: 'Other',
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
  auth: {
    login: {
      title: 'Welcome',
      subtitle: 'Sign in to manage your beauty salon',
      googleButton: 'Continue with Google',
      contactUs: 'Contact us',
      phoneLabel: 'Phone',
      loading: 'Signing in...',
      error: {
        generic: 'An error occurred during sign in',
        cancelled: 'Sign in was cancelled',
        popup: 'Popup was blocked. Please allow popups and try again',
      },
    },
    logout: 'Sign out',
    roles: {
      user: 'User',
      admin: 'Administrator',
    },
  },

  // ============================================
  // FORM FIELDS
  // ============================================
  fields: {
    // Personal info
    firstName: 'First name',
    lastName: 'Last name',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone number',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal code',
    country: 'Country',
    dateOfBirth: 'Date of birth',
    gender: 'Gender',
    
    // Account
    password: 'Password',
    confirmPassword: 'Confirm password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    
    // Business
    companyName: 'Company name',
    businessName: 'Business name',
    salonName: 'Salon name',
    description: 'Description',
    notes: 'Notes',
    
    // Date/Time
    date: 'Date',
    time: 'Time',
    startDate: 'Start date',
    endDate: 'End date',
    startTime: 'Start time',
    endTime: 'End time',
    duration: 'Duration',
    
    // Financial
    price: 'Price',
    amount: 'Amount',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    
    // Status
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // Table columns
    name: 'Name',
    loyaltyPoints: 'Loyalty Points',
    totalSpent: 'Total Spent',
    visits: 'Visits',
    lastVisit: 'Last Visit',
    product: 'Product',
    category: 'Category',
    stock: 'Stock',
    receipt: 'Receipt',
    client: 'Client',
    items: 'Items',
    payment: 'Payment',
    salon: 'Salon',
    role: 'Role',
    createdAt: 'Created At',
    service: 'Service',
    minStock: 'Min stock',
    
    // Placeholders
    placeholders: {
      email: 'example@email.com',
      phone: '+33 6 12 34 56 78',
      search: 'Search...',
      select: 'Select an option',
    },
  },

  // ============================================
  // VALIDATION MESSAGES
  // ============================================
  validation: {
    // Required
    required: '{{field}} is required',
    requiredField: 'This field is required',
    
    // String validations
    string: {
      min: '{{field}} must be at least {{min}} characters',
      max: '{{field}} must be at most {{max}} characters',
      length: '{{field}} must be exactly {{length}} characters',
      email: 'Please enter a valid email address',
      url: 'Please enter a valid URL',
      uuid: 'Please enter a valid UUID',
      regex: '{{field}} format is invalid',
      startsWith: '{{field}} must start with "{{value}}"',
      endsWith: '{{field}} must end with "{{value}}"',
      trim: '{{field}} cannot have leading or trailing spaces',
      lowercase: '{{field}} must be lowercase',
      uppercase: '{{field}} must be uppercase',
    },
    
    // Number validations
    number: {
      min: '{{field}} must be at least {{min}}',
      max: '{{field}} must be at most {{max}}',
      positive: '{{field}} must be a positive number',
      negative: '{{field}} must be a negative number',
      integer: '{{field}} must be an integer',
      multipleOf: '{{field}} must be a multiple of {{value}}',
    },
    
    // Date validations
    date: {
      min: '{{field}} must be after {{min}}',
      max: '{{field}} must be before {{max}}',
      invalid: 'Please enter a valid date',
    },
    
    // Array validations
    array: {
      min: 'Please select at least {{min}} item(s)',
      max: 'Please select at most {{max}} item(s)',
      length: 'Please select exactly {{length}} item(s)',
      nonempty: 'Please select at least one item',
    },
    
    // Custom validations
    custom: {
      passwordMismatch: 'Passwords do not match',
      passwordWeak: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      phoneInvalid: 'Please enter a valid phone number',
      postalCodeInvalid: 'Please enter a valid postal code',
      invalidSelection: 'Please select a valid option',
      futureDate: 'Date must be in the future',
      pastDate: 'Date must be in the past',
      fileSize: 'File size must be less than {{size}}',
      fileType: 'File type must be {{types}}',
    },
  },

  // ============================================
  // ERRORS
  // ============================================
  errors: {
    generic: 'An error occurred. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access denied.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
    timeout: 'Request timed out. Please try again.',
    validation: 'Please check the form for errors.',
    somethingWentWrong: 'Something went wrong',
    unexpectedError: 'An unexpected error occurred. Please try again.',
    pageError: 'Page Error',
    pageErrorDescription: 'There was a problem loading this page.',
  },

  confirm: {
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    delete: 'Delete',
    deleteDescription: 'Are you sure you want to delete this item? This action cannot be undone.',
  },

  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  success: {
    saved: 'Changes saved successfully',
    created: '{{item}} created successfully',
    updated: '{{item}} updated successfully',
    deleted: '{{item}} deleted successfully',
    copied: 'Copied to clipboard',
  },

  // ============================================
  // CONFIRMATIONS
  // ============================================
  confirmations: {
    delete: 'Are you sure you want to delete this {{item}}?',
    unsavedChanges: 'You have unsaved changes. Are you sure you want to leave?',
    logout: 'Are you sure you want to sign out?',
  },

  // ============================================
  // DATE & TIME
  // ============================================
  dateTime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisYear: 'This year',
    
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },
    daysShort: {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    },
    
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
    monthsShort: {
      january: 'Jan',
      february: 'Feb',
      march: 'Mar',
      april: 'Apr',
      may: 'May',
      june: 'Jun',
      july: 'Jul',
      august: 'Aug',
      september: 'Sep',
      october: 'Oct',
      november: 'Nov',
      december: 'Dec',
    },
  },

  // ============================================
  // LANGUAGES
  // ============================================
  languages: {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    ar: 'Arabic',
    selectLanguage: 'Select language',
  },

  // ============================================
  // NAVIGATION
  // ============================================
  nav: {
    dashboard: 'Dashboard',
    clients: 'Clients',
    agenda: 'Agenda',
    services: 'Services',
    staff: 'Staff',
    products: 'Products',
    sales: 'Sales',
    promotions: 'Promotions',
    loyalty: 'Loyalty',
    giftCards: 'Gift Cards',
    marketing: 'Marketing',
    analytics: 'Analytics',
    salonSettings: 'Salon Settings',
    settings: 'Settings',
    sections: {
      management: 'Management',
      inventory: 'Inventory',
      engagement: 'Engagement',
      insights: 'Insights',
      account: 'Account',
      administration: 'Administration',
      system: 'System',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      users: 'Users',
      salons: 'Salons',
      tags: 'Tags',
      templates: 'Templates',
      permissions: 'Permissions',
      settings: 'Settings',
    },
    user: {
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Sign out',
    },
  },

  // ============================================
  // DASHBOARD
  // ============================================
  dashboard: {
    todayRevenue: "Today's Revenue",
    todayAppointments: "Today's Appointments",
    newClients: 'New Clients',
    averageTicket: 'Average Ticket',
    vsLastWeek: 'vs last week',
    todaysAppointments: "Today's Appointments",
    topServices: 'Top Services',
    bookings: 'bookings',
  },

  // ============================================
  // CLIENTS
  // ============================================
  clients: {
    description: '{{count}} clients in your database',
    addClient: 'Add Client',
    searchPlaceholder: 'Search clients by name, email or phone...',
    noClients: 'No clients found',
  },

  // ============================================
  // AGENDA
  // ============================================
  agenda: {
    description: 'Manage your appointments',
    newAppointment: 'New Appointment',
    today: 'Today',
    confirmed: 'confirmed',
    pending: 'pending',
    appointments: 'appointments',
    noAppointments: 'No appointments',
    noAppointmentsDescription: 'You have no appointments scheduled for this day.',
    addSlot: 'Add',
    selectClient: 'Select a client',
    selectService: 'Select a service',
    reminderTitle: 'Upcoming Appointment',
    upcomingAppointment: 'Upcoming appointment',
    notificationsEnabled: 'Notifications enabled',
    notificationsOn: 'Notifications are on',
    enableNotifications: 'Enable notifications',
  },

  // ============================================
  // SERVICES
  // ============================================
  services: {
    description: '{{count}} services available',
    addService: 'Add Service',
    services: 'services',
  },

  // ============================================
  // PRODUCTS
  // ============================================
  products: {
    description: '{{count}} products in inventory',
    addProduct: 'Add Product',
    searchPlaceholder: 'Search products by name or SKU...',
    noProducts: 'No products found',
    cost: 'Cost',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    stockAlerts: 'Stock Alerts',
    minStock: 'Min stock',
  },

  // ============================================
  // SALES
  // ============================================
  sales: {
    description: 'View and manage sales',
    newSale: 'New Sale',
    searchPlaceholder: 'Search sales...',
    noSales: 'No sales found',
    walkIn: 'Walk-in customer',
    discount: 'discount',
    todayTotal: "Today's Total",
    transactions: 'Transactions',
    averageTicket: 'Average Ticket',
    printReceipt: 'Print Receipt',
    selectClient: 'Select a client',
    selectProduct: 'Add a product or service',
    addItem: 'Add item',
    removeItem: 'Remove',
    paymentMethod: 'Payment method',
    card: 'Credit card',
    cash: 'Cash',
    bankTransfer: 'Bank transfer',
    other: 'Other',
    quantity: 'Qty',
    unitPrice: 'Unit price',
  },

  // ============================================
  // GIFT CARDS
  // ============================================
  giftCards: {
    description: 'Manage gift cards',
    createCard: 'Create Gift Card',
    outstandingValue: 'Outstanding Value',
    activeCards: 'Active Cards',
    redeemedCards: 'Redeemed Cards',
    balance: 'Balance',
    purchasedBy: 'Purchased by',
    expires: 'Expires',
    viewHistory: 'View History',
    deactivate: 'Deactivate',
    noCards: 'No gift cards',
    noCardsDescription: 'Create your first gift card to get started.',
    value: 'Value',
    recipientName: 'Recipient name',
    recipientEmail: 'Recipient email',
  },

  // ============================================
  // LOYALTY
  // ============================================
  loyalty: {
    programSettings: 'Program Settings',
    activeMembers: 'Active Members',
    pointsIssued: 'Points Issued',
    pointsRedeemed: 'Points Redeemed',
    redemptionValue: 'Redemption Value',
    tiers: 'Loyalty Tiers',
    multiplier: 'multiplier',
    points: 'points',
    topMembers: 'Top Members',
    spent: 'spent',
    recentActivity: 'Recent Activity',
  },

  // ============================================
  // ANALYTICS
  // ============================================
  analytics: {
    description: 'View business insights and reports',
    last7Days: 'Last 7 days',
    last30Days: 'Last 30 days',
    thisMonth: 'This month',
    totalRevenue: 'Total Revenue',
    totalAppointments: 'Total Appointments',
    newClients: 'New Clients',
    averageTicket: 'Average Ticket',
    revenueOverTime: 'Revenue Over Time',
    revenue: 'Revenue',
    appointments: 'Appointments',
    topServices: 'Top Services',
    topProducts: 'Top Products',
    bookings: 'bookings',
    sold: 'sold',
    kpis: 'Key Performance Indicators',
    conversionRate: 'Conversion Rate',
    clientRetention: 'Client Retention',
    noShowRate: 'No-Show Rate',
    productSalesRatio: 'Product Sales Ratio',
    vsLastMonth: 'vs last month',
    noData: 'No data to display',
    noDataDescription: 'Start recording sales and appointments to see your analytics.',
  },

  // ============================================
  // MARKETING
  // ============================================
  marketing: {
    description: 'Create and manage marketing campaigns',
    newCampaign: 'New Campaign',
    campaignsSent: 'Campaigns Sent',
    totalRecipients: 'Total Recipients',
    avgOpenRate: 'Avg. Open Rate',
    scheduled: 'Scheduled',
    campaigns: 'Campaigns',
    sentOn: 'Sent on',
    scheduledFor: 'Scheduled for',
    sent: 'Sent',
    opened: 'Opened',
    clicked: 'Clicked',
    recipients: 'recipients',
    sendEmail: 'Send Email Campaign',
    sendEmailDescription: 'Create and send email campaigns to your clients',
    sendWhatsApp: 'Send WhatsApp Message',
    sendWhatsAppDescription: 'Send promotional messages via WhatsApp',
  },

  // ============================================
  // SETTINGS
  // ============================================
  settings: {
    description: 'Manage your account and preferences',
    profile: 'Profile',
    account: 'account',
    editProfile: 'Edit Profile',
    accountSettings: 'Account Settings',
    personalInfo: 'Personal Information',
    personalInfoDescription: 'Update your name, email, and profile picture',
    security: 'Security',
    securityDescription: 'Manage password and security settings',
    notifications: 'Notifications',
    notificationsDescription: 'Configure notification preferences',
    preferences: 'Preferences',
    language: 'Language',
    languageDescription: 'Choose your preferred language',
    currency: 'Currency',
    currencyDescription: 'Currency is set automatically based on language',
    appearance: 'Appearance',
    appearanceDescription: 'Customize the app appearance',
    light: 'Light',
    dark: 'Dark',
    businessSettings: 'Business Settings',
    salonInfo: 'Salon Information',
    salonInfoDescription: 'Update your salon details and business hours',
    billing: 'Billing & Subscription',
    billingDescription: 'Manage payment methods and subscription',
  },

  // ============================================
  // SALON SELECTION
  // ============================================
  salon: {
    selectSalon: 'Select your salon',
    selectSalonDescription: 'Choose the salon you want to work in',
    noSalons: 'No salons available',
    noSalonsDescription: 'You don\'t have access to any salon. Contact your administrator.',
    currentSalon: 'Current salon',
    switchSalon: 'Switch salon',
    allSalons: 'All salons',
  },

  // ============================================
  // STAFF
  // ============================================
  staff: {
    description: 'Manage staff schedules and time off',
    schedules: 'Schedules',
    timeOff: 'Time Off',
    addSchedule: 'Add Schedule',
    editSchedule: 'Edit Schedule',
    requestTimeOff: 'Request Time Off',
    selectStaff: 'Select a staff member',
    isWorking: 'Is working',
    dayOff: 'Day off',
    break: 'Break',
    breakStart: 'Break start',
    breakEnd: 'Break end',
    noStaff: 'No staff members',
    noStaffDescription: 'Add staff members from the admin panel to manage their schedules.',
    noTimeOffRequests: 'No time off requests',
    noTimeOffRequestsDescription: 'No pending time off requests.',
    scheduleUpdated: 'Schedule updated successfully',
    timeOffRequested: 'Time off request submitted',
    timeOffApproved: 'Time off request approved',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    halfDay: 'Half day',
    period: 'Period',
    selectPeriod: 'Select period',
    morning: 'Morning',
    afternoon: 'Afternoon',
    reasonPlaceholder: 'Reason for time off request...',
    submitRequest: 'Submit Request',
    timeOffTypes: {
      vacation: 'Vacation',
      sick_leave: 'Sick Leave',
      personal: 'Personal',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      bereavement: 'Bereavement',
      unpaid: 'Unpaid Leave',
      other: 'Other',
    },
  },

  // ============================================
  // PROMOTIONS
  // ============================================
  promotions: {
    description: 'Create and manage discount codes and promotions',
    create: 'Create Promotion',
    created: 'Promotion created successfully',
    statusUpdated: 'Status updated',
    codeCopied: 'Code copied to clipboard',
    activePromos: 'Active Promotions',
    totalUsage: 'Total Usage',
    drafts: 'Drafts',
    allStatuses: 'All',
    active: 'Active',
    draft: 'Draft',
    paused: 'Paused',
    expired: 'Expired',
    cancelled: 'Cancelled',
    noPromotions: 'No promotions',
    noPromotionsDescription: 'Create your first promotion to attract more customers.',
    pause: 'Pause',
    activate: 'Activate',
    promoCode: 'Promo Code',
    generate: 'Generate',
    type: 'Type',
    percentage: 'Percentage',
    amount: 'Amount',
    namePlaceholder: 'Summer Sale, Birthday Special...',
    descriptionPlaceholder: 'Describe your promotion...',
    appliesTo: 'Applies To',
    'appliesTo.all': 'All items',
    'appliesTo.services': 'Services only',
    'appliesTo.products': 'Products only',
    'appliesTo.specific_items': 'Specific items',
    'appliesTo.categories': 'Categories',
    startDate: 'Start Date',
    endDate: 'End Date',
    minimumPurchase: 'Minimum Purchase',
    maxDiscount: 'Maximum Discount',
    usageLimit: 'Usage Limit',
    conditions: 'Conditions',
    firstTimeOnly: 'First-time customers only',
    firstTimeOnlyDescription: 'Only new customers can use this promotion',
    birthdayOnly: 'Birthday month only',
    birthdayOnlyDescription: 'Only customers with birthday this month',
    validFrom: 'Valid from',
    validUntil: 'Valid until',
    used: 'Used',
    min: 'Min',
    types: {
      percentage: 'Percentage discount',
      fixed_amount: 'Fixed amount discount',
      buy_x_get_y: 'Buy X Get Y',
      free_service: 'Free service',
      free_product: 'Free product',
      bundle: 'Bundle deal',
    },
  },

  // ============================================
  // SALON SETTINGS
  // ============================================
  salonSettings: {
    description: 'Configure settings for {{salon}}',
    saved: 'Settings saved successfully',
    tabs: {
      general: 'General',
      hours: 'Working Hours',
      booking: 'Booking',
      notifications: 'Notifications',
      tax: 'Tax',
      loyalty: 'Loyalty',
      receipt: 'Receipts',
    },
    currency: 'Currency',
    timezone: 'Timezone',
    dateFormat: 'Date Format',
    timeFormat: 'Time Format',
    break: 'Break',
    closed: 'Closed',
    // Booking
    allowOnlineBooking: 'Allow online booking',
    allowOnlineBookingDescription: 'Clients can book appointments online',
    slotDuration: 'Slot duration',
    leadTime: 'Lead time',
    noLeadTime: 'No lead time',
    bookingWindow: 'Booking window',
    cancellationDeadline: 'Cancellation deadline',
    anytime: 'Anytime',
    requireDeposit: 'Require deposit',
    requireDepositDescription: 'Require a deposit for bookings',
    depositAmount: 'Deposit amount',
    depositPercentage: 'Deposit percentage',
    // Notifications
    appointmentConfirmation: 'Appointment confirmation',
    appointmentConfirmationDescription: 'Send confirmation when appointment is booked',
    appointmentReminder: 'Appointment reminder',
    appointmentReminderDescription: 'Send reminder before appointment',
    reminderTiming: 'Send reminder',
    birthdayGreeting: 'Birthday greeting',
    birthdayGreetingDescription: 'Send birthday wishes to clients',
    reviewRequest: 'Review request',
    reviewRequestDescription: 'Request review after appointment',
    // Tax
    taxEnabled: 'Enable taxes',
    taxEnabledDescription: 'Apply taxes to sales',
    taxRate: 'Tax rate',
    taxNumber: 'Tax number (VAT)',
    pricesIncludeTax: 'Prices include tax',
    pricesIncludeTaxDescription: 'Display prices with tax included',
    // Loyalty
    loyaltyEnabled: 'Enable loyalty program',
    loyaltyEnabledDescription: 'Reward clients with points',
    pointsPerCurrency: 'Points per currency unit',
    pointsPerCurrencyDescription: 'Points earned per euro spent',
    pointValue: 'Point value',
    pointValueDescription: 'Value in currency per point',
    minimumRedemption: 'Minimum redemption',
    minimumRedemptionDescription: 'Minimum points to redeem',
    // Receipt
    receiptHeader: 'Receipt header',
    receiptHeaderPlaceholder: 'Thank you for visiting...',
    receiptFooter: 'Receipt footer',
    receiptFooterPlaceholder: 'See you soon!',
    showStaffOnReceipt: 'Show staff on receipt',
    showStaffOnReceiptDescription: 'Display staff name on receipts',
    invoicePrefix: 'Invoice prefix',
    nextInvoiceNumber: 'Next invoice number',
  },

  // ============================================
  // DAYS
  // ============================================
  days: {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },

  // ============================================
  // ADMIN
  // ============================================
  admin: {
    dashboard: {
      title: 'Admin Dashboard',
      welcome: 'Welcome, {{name}}',
      recentSalons: 'Recent Salons',
      recentUsers: 'Recent Users',
      users: 'users',
      systemStatus: 'System Status',
    },
    stats: {
      totalSalons: 'Total Salons',
      totalUsers: 'Total Users',
      totalRevenue: 'Total Revenue',
      activeSubscriptions: 'Active Subscriptions',
    },
    status: {
      apiOnline: 'API Online',
      allSystemsOperational: 'All systems operational',
      databaseOnline: 'Database Online',
      storageOnline: 'Storage Online',
      used: 'used',
    },
    users: {
      description: '{{count}} users in the system',
      addUser: 'Add User',
      searchPlaceholder: 'Search users...',
      noUsers: 'No users found',
    },
    salons: {
      description: 'Manage all salons in the system',
      addSalon: 'Add Salon',
      totalSalons: 'Total Salons',
      activeSalons: 'Active Salons',
      totalUsers: 'Total Users',
      monthlyRevenue: 'Monthly Revenue',
      users: 'users',
    },
  },
} as const;
