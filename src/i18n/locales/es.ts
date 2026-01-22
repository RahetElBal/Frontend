import type { TranslationKeys } from './en';

export const es: TranslationKeys = {
  // ============================================
  // COMMON
  // ============================================
  common: {
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Añadir',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    reset: 'Restablecer',
    close: 'Cerrar',
    yes: 'Sí',
    no: 'No',
    or: 'o',
    and: 'y',
    all: 'Todo',
    none: 'Ninguno',
    select: 'Seleccionar',
    selected: 'Seleccionado',
    noResults: 'No se encontraron resultados',
    required: 'Obligatorio',
    optional: 'Opcional',
    selectAll: 'Seleccionar todo',
    selectRow: 'Seleccionar fila',
    selectedCount: '{{count}} seleccionado(s)',
    showingCount: 'Mostrando {{from}} a {{to}} de {{total}}',
    pageOf: 'Página {{page}} de {{total}}',
    actions: 'Acciones',
    create: 'Crear',
    update: 'Actualizar',
    view: 'Ver',
    archive: 'Archivar',
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
  auth: {
    login: {
      title: 'Bienvenido',
      subtitle: 'Inicia sesión para gestionar tu salón de belleza',
      googleButton: 'Continuar con Google',
      contactUs: 'Contáctanos',
      phoneLabel: 'Teléfono',
      loading: 'Iniciando sesión...',
      error: {
        generic: 'Ocurrió un error durante el inicio de sesión',
        cancelled: 'El inicio de sesión fue cancelado',
        popup: 'La ventana emergente fue bloqueada. Por favor, permite las ventanas emergentes e intenta de nuevo',
      },
    },
    logout: 'Cerrar sesión',
    roles: {
      user: 'Usuario',
      admin: 'Administrador',
    },
  },

  // ============================================
  // FORM FIELDS
  // ============================================
  fields: {
    // Personal info
    firstName: 'Nombre',
    lastName: 'Apellido',
    fullName: 'Nombre completo',
    email: 'Correo electrónico',
    phone: 'Número de teléfono',
    address: 'Dirección',
    city: 'Ciudad',
    postalCode: 'Código postal',
    country: 'País',
    dateOfBirth: 'Fecha de nacimiento',
    gender: 'Género',
    
    // Account
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    
    // Business
    companyName: 'Nombre de la empresa',
    businessName: 'Razón social',
    salonName: 'Nombre del salón',
    description: 'Descripción',
    notes: 'Notas',
    
    // Date/Time
    date: 'Fecha',
    time: 'Hora',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    duration: 'Duración',
    
    // Financial
    price: 'Precio',
    amount: 'Cantidad',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    discount: 'Descuento',
    
    // Status
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    
    // Placeholders
    placeholders: {
      email: 'ejemplo@email.com',
      phone: '+34 612 345 678',
      search: 'Buscar...',
      select: 'Selecciona una opción',
    },
  },

  // ============================================
  // VALIDATION MESSAGES
  // ============================================
  validation: {
    // Required
    required: '{{field}} es obligatorio',
    requiredField: 'Este campo es obligatorio',
    
    // String validations
    string: {
      min: '{{field}} debe tener al menos {{min}} caracteres',
      max: '{{field}} debe tener como máximo {{max}} caracteres',
      length: '{{field}} debe tener exactamente {{length}} caracteres',
      email: 'Por favor, introduce una dirección de correo válida',
      url: 'Por favor, introduce una URL válida',
      uuid: 'Por favor, introduce un UUID válido',
      regex: 'El formato de {{field}} es inválido',
      startsWith: '{{field}} debe comenzar con "{{value}}"',
      endsWith: '{{field}} debe terminar con "{{value}}"',
      trim: '{{field}} no puede tener espacios al principio o al final',
      lowercase: '{{field}} debe estar en minúsculas',
      uppercase: '{{field}} debe estar en mayúsculas',
    },
    
    // Number validations
    number: {
      min: '{{field}} debe ser al menos {{min}}',
      max: '{{field}} debe ser como máximo {{max}}',
      positive: '{{field}} debe ser un número positivo',
      negative: '{{field}} debe ser un número negativo',
      integer: '{{field}} debe ser un número entero',
      multipleOf: '{{field}} debe ser múltiplo de {{value}}',
    },
    
    // Date validations
    date: {
      min: '{{field}} debe ser posterior a {{min}}',
      max: '{{field}} debe ser anterior a {{max}}',
      invalid: 'Por favor, introduce una fecha válida',
    },
    
    // Array validations
    array: {
      min: 'Por favor, selecciona al menos {{min}} elemento(s)',
      max: 'Por favor, selecciona como máximo {{max}} elemento(s)',
      length: 'Por favor, selecciona exactamente {{length}} elemento(s)',
      nonempty: 'Por favor, selecciona al menos un elemento',
    },
    
    // Custom validations
    custom: {
      passwordMismatch: 'Las contraseñas no coinciden',
      passwordWeak: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
      phoneInvalid: 'Por favor, introduce un número de teléfono válido',
      postalCodeInvalid: 'Por favor, introduce un código postal válido',
      invalidSelection: 'Por favor, selecciona una opción válida',
      futureDate: 'La fecha debe ser en el futuro',
      pastDate: 'La fecha debe ser en el pasado',
      fileSize: 'El tamaño del archivo debe ser menor a {{size}}',
      fileType: 'El tipo de archivo debe ser {{types}}',
    },
  },

  // ============================================
  // ERRORS
  // ============================================
  errors: {
    generic: 'Ocurrió un error. Por favor, inténtalo de nuevo.',
    network: 'Error de red. Por favor, verifica tu conexión.',
    unauthorized: 'No estás autorizado para realizar esta acción.',
    forbidden: 'Acceso denegado.',
    notFound: 'El recurso solicitado no fue encontrado.',
    serverError: 'Error del servidor. Por favor, inténtalo más tarde.',
    timeout: 'La solicitud expiró. Por favor, inténtalo de nuevo.',
    validation: 'Por favor, verifica los errores en el formulario.',
    somethingWentWrong: 'Algo salió mal',
    unexpectedError: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
    pageError: 'Error de página',
    pageErrorDescription: 'Hubo un problema al cargar esta página.',
  },

  confirm: {
    title: '¿Estás seguro?',
    description: 'Esta acción no se puede deshacer.',
    delete: 'Eliminar',
    deleteDescription: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  },

  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  success: {
    saved: 'Cambios guardados con éxito',
    created: '{{item}} creado con éxito',
    updated: '{{item}} actualizado con éxito',
    deleted: '{{item}} eliminado con éxito',
    copied: 'Copiado al portapapeles',
  },

  // ============================================
  // CONFIRMATIONS
  // ============================================
  confirmations: {
    delete: '¿Estás seguro de que quieres eliminar este/a {{item}}?',
    unsavedChanges: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
    logout: '¿Estás seguro de que quieres cerrar sesión?',
  },

  // ============================================
  // DATE & TIME
  // ============================================
  dateTime: {
    today: 'Hoy',
    yesterday: 'Ayer',
    tomorrow: 'Mañana',
    thisWeek: 'Esta semana',
    lastWeek: 'La semana pasada',
    thisMonth: 'Este mes',
    lastMonth: 'El mes pasado',
    thisYear: 'Este año',
    
    days: {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
    },
    daysShort: {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom',
    },
    
    months: {
      january: 'Enero',
      february: 'Febrero',
      march: 'Marzo',
      april: 'Abril',
      may: 'Mayo',
      june: 'Junio',
      july: 'Julio',
      august: 'Agosto',
      september: 'Septiembre',
      october: 'Octubre',
      november: 'Noviembre',
      december: 'Diciembre',
    },
    monthsShort: {
      january: 'Ene',
      february: 'Feb',
      march: 'Mar',
      april: 'Abr',
      may: 'May',
      june: 'Jun',
      july: 'Jul',
      august: 'Ago',
      september: 'Sep',
      october: 'Oct',
      november: 'Nov',
      december: 'Dic',
    },
  },

  // ============================================
  // LANGUAGES
  // ============================================
  languages: {
    en: 'Inglés',
    fr: 'Francés',
    es: 'Español',
    ar: 'Árabe',
    selectLanguage: 'Seleccionar idioma',
  },

  // ============================================
  // NAVIGATION
  // ============================================
  nav: {
    dashboard: 'Panel',
    clients: 'Clientes',
    agenda: 'Agenda',
    services: 'Servicios',
    products: 'Productos',
    sales: 'Ventas',
    loyalty: 'Fidelidad',
    giftCards: 'Tarjetas regalo',
    marketing: 'Marketing',
    analytics: 'Analíticas',
    settings: 'Configuración',
    sections: {
      management: 'Gestión',
      inventory: 'Inventario',
      engagement: 'Compromiso',
      insights: 'Perspectivas',
      account: 'Cuenta',
      administration: 'Administración',
      system: 'Sistema',
    },
    admin: {
      dashboard: 'Panel de administración',
      users: 'Usuarios',
      salons: 'Salones',
      tags: 'Etiquetas',
      templates: 'Plantillas',
      permissions: 'Permisos',
      settings: 'Configuración',
    },
    user: {
      profile: 'Perfil',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
    },
  },
};
