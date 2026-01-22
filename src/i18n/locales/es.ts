import type { TranslationKeys } from './en';

export const es: TranslationKeys = {
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
        popup: 'La ventana emergente fue bloqueada. Por favor, permita las ventanas emergentes e intente de nuevo',
      },
    },
    logout: 'Cerrar sesión',
    roles: {
      user: 'Usuario',
      admin: 'Administrador',
    },
  },
  common: {
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
  },
};
