export const en = {
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
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
  },
} as const;

export type TranslationKeys = typeof en;
