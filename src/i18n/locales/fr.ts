import type { TranslationKeys } from './en';

export const fr: TranslationKeys = {
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
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
  },
};
