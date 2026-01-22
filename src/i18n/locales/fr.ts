import type { TranslationKeys } from './en';

export const fr: TranslationKeys = {
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
};
