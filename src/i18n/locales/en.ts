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

export const en: TranslationKeys = {
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
    products: 'Products',
    sales: 'Sales',
    loyalty: 'Loyalty',
    giftCards: 'Gift Cards',
    marketing: 'Marketing',
    analytics: 'Analytics',
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
};
