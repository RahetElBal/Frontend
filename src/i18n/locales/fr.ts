export const fr = {
  // ============================================
  // COMMON
  // ============================================
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    clear: 'Effacer',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    close: 'Fermer',
    yes: 'Oui',
    no: 'Non',
    or: 'ou',
    and: 'et',
    all: 'Tout',
    none: 'Aucun',
    select: 'Sélectionner',
    selected: 'Sélectionné',
    noResults: 'Aucun résultat trouvé',
    required: 'Obligatoire',
    optional: 'Facultatif',
    selectAll: 'Tout sélectionner',
    selectRow: 'Sélectionner la ligne',
    selectedCount: '{{count}} sélectionné(s)',
    showingCount: 'Affichage de {{from}} à {{to}} sur {{total}}',
    pageOf: 'Page {{page}} sur {{total}}',
    actions: 'Actions',
    create: 'Créer',
    update: 'Mettre à jour',
    view: 'Voir',
    archive: 'Archiver',
    viewAll: 'Voir tout',
    welcome: 'Bienvenue, {{name}}',
    item: 'article',
    items: 'articles',
    inactive: 'Inactif',
    active: 'Actif',
    deactivate: 'Désactiver',
    activate: 'Activer',
  },

  // ============================================
  // AUTHENTICATION
  // ============================================
  auth: {
    login: {
      title: 'Bienvenue',
      subtitle: 'Connectez-vous pour gérer votre salon de beauté',
      googleButton: 'Continuer avec Google',
      contactUs: 'Nous contacter',
      phoneLabel: 'Téléphone',
      loading: 'Connexion en cours...',
      error: {
        generic: 'Une erreur est survenue lors de la connexion',
        cancelled: 'La connexion a été annulée',
        popup: 'La popup a été bloquée. Veuillez autoriser les popups et réessayer',
      },
    },
    logout: 'Se déconnecter',
    roles: {
      user: 'Utilisateur',
      admin: 'Administrateur',
    },
  },

  // ============================================
  // FORM FIELDS
  // ============================================
  fields: {
    // Personal info
    firstName: 'Prénom',
    lastName: 'Nom',
    fullName: 'Nom complet',
    email: 'Email',
    phone: 'Numéro de téléphone',
    address: 'Adresse',
    city: 'Ville',
    postalCode: 'Code postal',
    country: 'Pays',
    dateOfBirth: 'Date de naissance',
    gender: 'Genre',
    
    // Account
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    
    // Business
    companyName: 'Nom de l\'entreprise',
    businessName: 'Raison sociale',
    salonName: 'Nom du salon',
    description: 'Description',
    notes: 'Notes',
    
    // Date/Time
    date: 'Date',
    time: 'Heure',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    startTime: 'Heure de début',
    endTime: 'Heure de fin',
    duration: 'Durée',
    
    // Financial
    price: 'Prix',
    amount: 'Montant',
    total: 'Total',
    subtotal: 'Sous-total',
    tax: 'Taxe',
    discount: 'Remise',
    
    // Status
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    
    // Table columns
    name: 'Nom',
    loyaltyPoints: 'Points fidélité',
    totalSpent: 'Total dépensé',
    visits: 'Visites',
    lastVisit: 'Dernière visite',
    product: 'Produit',
    category: 'Catégorie',
    stock: 'Stock',
    receipt: 'Reçu',
    client: 'Client',
    items: 'Articles',
    payment: 'Paiement',
    salon: 'Salon',
    role: 'Rôle',
    createdAt: 'Créé le',
    
    // Placeholders
    placeholders: {
      email: 'exemple@email.com',
      phone: '+33 6 12 34 56 78',
      search: 'Rechercher...',
      select: 'Sélectionner une option',
    },
  },

  // ============================================
  // VALIDATION MESSAGES
  // ============================================
  validation: {
    // Required
    required: '{{field}} est obligatoire',
    requiredField: 'Ce champ est obligatoire',
    
    // String validations
    string: {
      min: '{{field}} doit contenir au moins {{min}} caractères',
      max: '{{field}} doit contenir au maximum {{max}} caractères',
      length: '{{field}} doit contenir exactement {{length}} caractères',
      email: 'Veuillez entrer une adresse email valide',
      url: 'Veuillez entrer une URL valide',
      uuid: 'Veuillez entrer un UUID valide',
      regex: 'Le format de {{field}} est invalide',
      startsWith: '{{field}} doit commencer par "{{value}}"',
      endsWith: '{{field}} doit se terminer par "{{value}}"',
      trim: '{{field}} ne peut pas contenir d\'espaces au début ou à la fin',
      lowercase: '{{field}} doit être en minuscules',
      uppercase: '{{field}} doit être en majuscules',
    },
    
    // Number validations
    number: {
      min: '{{field}} doit être au moins {{min}}',
      max: '{{field}} doit être au maximum {{max}}',
      positive: '{{field}} doit être un nombre positif',
      negative: '{{field}} doit être un nombre négatif',
      integer: '{{field}} doit être un nombre entier',
      multipleOf: '{{field}} doit être un multiple de {{value}}',
    },
    
    // Date validations
    date: {
      min: '{{field}} doit être après le {{min}}',
      max: '{{field}} doit être avant le {{max}}',
      invalid: 'Veuillez entrer une date valide',
    },
    
    // Array validations
    array: {
      min: 'Veuillez sélectionner au moins {{min}} élément(s)',
      max: 'Veuillez sélectionner au maximum {{max}} élément(s)',
      length: 'Veuillez sélectionner exactement {{length}} élément(s)',
      nonempty: 'Veuillez sélectionner au moins un élément',
    },
    
    // Custom validations
    custom: {
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordWeak: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
      phoneInvalid: 'Veuillez entrer un numéro de téléphone valide',
      postalCodeInvalid: 'Veuillez entrer un code postal valide',
      invalidSelection: 'Veuillez sélectionner une option valide',
      futureDate: 'La date doit être dans le futur',
      pastDate: 'La date doit être dans le passé',
      fileSize: 'La taille du fichier doit être inférieure à {{size}}',
      fileType: 'Le type de fichier doit être {{types}}',
    },
  },

  // ============================================
  // ERRORS
  // ============================================
  errors: {
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    network: 'Erreur réseau. Veuillez vérifier votre connexion.',
    unauthorized: 'Vous n\'êtes pas autorisé à effectuer cette action.',
    forbidden: 'Accès refusé.',
    notFound: 'La ressource demandée n\'a pas été trouvée.',
    serverError: 'Erreur serveur. Veuillez réessayer plus tard.',
    timeout: 'La requête a expiré. Veuillez réessayer.',
    validation: 'Veuillez vérifier les erreurs dans le formulaire.',
    somethingWentWrong: 'Une erreur est survenue',
    unexpectedError: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
    pageError: 'Erreur de page',
    pageErrorDescription: 'Un problème est survenu lors du chargement de cette page.',
  },

  confirm: {
    title: 'Êtes-vous sûr ?',
    description: 'Cette action est irréversible.',
    delete: 'Supprimer',
    deleteDescription: 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
  },

  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  success: {
    saved: 'Modifications enregistrées avec succès',
    created: '{{item}} créé avec succès',
    updated: '{{item}} mis à jour avec succès',
    deleted: '{{item}} supprimé avec succès',
    copied: 'Copié dans le presse-papiers',
  },

  // ============================================
  // CONFIRMATIONS
  // ============================================
  confirmations: {
    delete: 'Êtes-vous sûr de vouloir supprimer ce(tte) {{item}} ?',
    unsavedChanges: 'Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter ?',
    logout: 'Êtes-vous sûr de vouloir vous déconnecter ?',
  },

  // ============================================
  // DATE & TIME
  // ============================================
  dateTime: {
    today: 'Aujourd\'hui',
    yesterday: 'Hier',
    tomorrow: 'Demain',
    thisWeek: 'Cette semaine',
    lastWeek: 'La semaine dernière',
    thisMonth: 'Ce mois-ci',
    lastMonth: 'Le mois dernier',
    thisYear: 'Cette année',
    
    days: {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche',
    },
    daysShort: {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Jeu',
      friday: 'Ven',
      saturday: 'Sam',
      sunday: 'Dim',
    },
    
    months: {
      january: 'Janvier',
      february: 'Février',
      march: 'Mars',
      april: 'Avril',
      may: 'Mai',
      june: 'Juin',
      july: 'Juillet',
      august: 'Août',
      september: 'Septembre',
      october: 'Octobre',
      november: 'Novembre',
      december: 'Décembre',
    },
    monthsShort: {
      january: 'Jan',
      february: 'Fév',
      march: 'Mar',
      april: 'Avr',
      may: 'Mai',
      june: 'Juin',
      july: 'Juil',
      august: 'Aoû',
      september: 'Sep',
      october: 'Oct',
      november: 'Nov',
      december: 'Déc',
    },
  },

  // ============================================
  // LANGUAGES
  // ============================================
  languages: {
    en: 'Anglais',
    fr: 'Français',
    es: 'Espagnol',
    ar: 'Arabe',
    selectLanguage: 'Sélectionner la langue',
  },

  // ============================================
  // NAVIGATION
  // ============================================
  nav: {
    dashboard: 'Tableau de bord',
    clients: 'Clients',
    agenda: 'Agenda',
    services: 'Services',
    products: 'Produits',
    sales: 'Ventes',
    loyalty: 'Fidélité',
    giftCards: 'Cartes cadeaux',
    marketing: 'Marketing',
    analytics: 'Analytique',
    settings: 'Paramètres',
    sections: {
      management: 'Gestion',
      inventory: 'Inventaire',
      engagement: 'Engagement',
      insights: 'Analyses',
      account: 'Compte',
      administration: 'Administration',
      system: 'Système',
    },
    admin: {
      dashboard: 'Tableau de bord admin',
      users: 'Utilisateurs',
      salons: 'Salons',
      tags: 'Tags',
      templates: 'Modèles',
      permissions: 'Permissions',
      settings: 'Paramètres',
    },
    user: {
      profile: 'Profil',
      settings: 'Paramètres',
      logout: 'Se déconnecter',
    },
  },

  dashboard: {
    todayRevenue: "Chiffre d'affaires du jour",
    todayAppointments: "Rendez-vous du jour",
    newClients: 'Nouveaux clients',
    averageTicket: 'Ticket moyen',
    vsLastWeek: 'vs semaine dernière',
    todaysAppointments: "Rendez-vous d'aujourd'hui",
    topServices: 'Services populaires',
    bookings: 'réservations',
  },

  clients: {
    description: '{{count}} clients dans votre base',
    addClient: 'Ajouter un client',
    searchPlaceholder: 'Rechercher par nom, email ou téléphone...',
    noClients: 'Aucun client trouvé',
  },

  agenda: {
    description: 'Gérer vos rendez-vous',
    newAppointment: 'Nouveau rendez-vous',
    today: "Aujourd'hui",
    confirmed: 'confirmés',
    pending: 'en attente',
    appointments: 'rendez-vous',
  },

  services: {
    description: '{{count}} services disponibles',
    addService: 'Ajouter un service',
    services: 'services',
  },

  products: {
    description: '{{count}} produits en stock',
    addProduct: 'Ajouter un produit',
    searchPlaceholder: 'Rechercher par nom ou SKU...',
    noProducts: 'Aucun produit trouvé',
    cost: 'Coût',
    outOfStock: 'Rupture de stock',
    lowStock: 'Stock faible',
    stockAlerts: 'Alertes de stock',
  },

  sales: {
    description: 'Voir et gérer les ventes',
    newSale: 'Nouvelle vente',
    searchPlaceholder: 'Rechercher...',
    noSales: 'Aucune vente trouvée',
    walkIn: 'Client de passage',
    discount: 'remise',
    todayTotal: 'Total du jour',
    transactions: 'Transactions',
    averageTicket: 'Ticket moyen',
    printReceipt: 'Imprimer le reçu',
  },

  giftCards: {
    description: 'Gérer les cartes cadeaux',
    createCard: 'Créer une carte cadeau',
    outstandingValue: 'Valeur en circulation',
    activeCards: 'Cartes actives',
    redeemedCards: 'Cartes utilisées',
    balance: 'Solde',
    purchasedBy: 'Achetée par',
    expires: 'Expire le',
    viewHistory: "Voir l'historique",
    deactivate: 'Désactiver',
  },

  loyalty: {
    programSettings: 'Paramètres du programme',
    activeMembers: 'Membres actifs',
    pointsIssued: 'Points attribués',
    pointsRedeemed: 'Points utilisés',
    redemptionValue: 'Valeur de remboursement',
    tiers: 'Niveaux de fidélité',
    multiplier: 'multiplicateur',
    points: 'points',
    topMembers: 'Meilleurs membres',
    spent: 'dépensé',
    recentActivity: 'Activité récente',
  },

  analytics: {
    description: "Voir les analyses et rapports de l'activité",
    last7Days: '7 derniers jours',
    last30Days: '30 derniers jours',
    thisMonth: 'Ce mois-ci',
    totalRevenue: "Chiffre d'affaires total",
    totalAppointments: 'Total rendez-vous',
    newClients: 'Nouveaux clients',
    averageTicket: 'Ticket moyen',
    revenueOverTime: "Évolution du chiffre d'affaires",
    revenue: "Chiffre d'affaires",
    appointments: 'Rendez-vous',
    topServices: 'Services populaires',
    topProducts: 'Produits populaires',
    bookings: 'réservations',
    sold: 'vendus',
    kpis: 'Indicateurs clés',
    conversionRate: 'Taux de conversion',
    clientRetention: 'Rétention client',
    noShowRate: 'Taux de non-présentation',
    productSalesRatio: 'Ratio ventes produits',
    vsLastMonth: 'vs mois dernier',
  },

  marketing: {
    description: 'Créer et gérer les campagnes marketing',
    newCampaign: 'Nouvelle campagne',
    campaignsSent: 'Campagnes envoyées',
    totalRecipients: 'Total destinataires',
    avgOpenRate: "Taux d'ouverture moyen",
    scheduled: 'Programmées',
    campaigns: 'Campagnes',
    sentOn: 'Envoyée le',
    scheduledFor: 'Programmée pour le',
    sent: 'Envoyés',
    opened: 'Ouverts',
    clicked: 'Cliqués',
    recipients: 'destinataires',
    sendEmail: 'Envoyer une campagne email',
    sendEmailDescription: 'Créer et envoyer des emails à vos clients',
    sendWhatsApp: 'Envoyer un message WhatsApp',
    sendWhatsAppDescription: 'Envoyer des messages promotionnels via WhatsApp',
  },

  settings: {
    description: 'Gérer votre compte et préférences',
    profile: 'Profil',
    account: 'compte',
    editProfile: 'Modifier le profil',
    accountSettings: 'Paramètres du compte',
    personalInfo: 'Informations personnelles',
    personalInfoDescription: 'Modifier votre nom, email et photo de profil',
    security: 'Sécurité',
    securityDescription: 'Gérer le mot de passe et les paramètres de sécurité',
    notifications: 'Notifications',
    notificationsDescription: 'Configurer les préférences de notification',
    preferences: 'Préférences',
    language: 'Langue',
    languageDescription: 'Choisir votre langue préférée',
    currency: 'Devise',
    currencyDescription: 'La devise est définie automatiquement selon la langue',
    appearance: 'Apparence',
    appearanceDescription: "Personnaliser l'apparence de l'application",
    light: 'Clair',
    dark: 'Sombre',
    businessSettings: 'Paramètres entreprise',
    salonInfo: 'Informations du salon',
    salonInfoDescription: 'Modifier les détails du salon et les horaires',
    billing: 'Facturation et abonnement',
    billingDescription: 'Gérer les moyens de paiement et abonnement',
  },

  admin: {
    dashboard: {
      title: 'Tableau de bord admin',
      welcome: 'Bienvenue, {{name}}',
      recentSalons: 'Salons récents',
      recentUsers: 'Utilisateurs récents',
      users: 'utilisateurs',
      systemStatus: 'État du système',
    },
    stats: {
      totalSalons: 'Total salons',
      totalUsers: 'Total utilisateurs',
      totalRevenue: "Chiffre d'affaires total",
      activeSubscriptions: 'Abonnements actifs',
    },
    status: {
      apiOnline: 'API en ligne',
      allSystemsOperational: 'Tous les systèmes opérationnels',
      databaseOnline: 'Base de données en ligne',
      storageOnline: 'Stockage en ligne',
      used: 'utilisé',
    },
    users: {
      description: '{{count}} utilisateurs dans le système',
      addUser: 'Ajouter un utilisateur',
      searchPlaceholder: 'Rechercher des utilisateurs...',
      noUsers: 'Aucun utilisateur trouvé',
    },
    salons: {
      description: 'Gérer tous les salons du système',
      addSalon: 'Ajouter un salon',
      totalSalons: 'Total salons',
      activeSalons: 'Salons actifs',
      totalUsers: 'Total utilisateurs',
      monthlyRevenue: 'Revenu mensuel',
      users: 'utilisateurs',
    },
  },
} as const;
