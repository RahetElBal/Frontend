import { toast as sonnerToast } from 'sonner';
import i18n from '@/i18n';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast utility with i18n support
 * 
 * @example
 * toast.success('Client created successfully');
 * toast.error('Failed to save');
 * toast.success('success.clientCreated'); // Uses i18n key
 */
function createToast(type: ToastType, message: string, options?: ToastOptions) {
  // Translate message if it's a translation key
  const translatedMessage = message.startsWith('success.') || 
    message.startsWith('errors.') || 
    message.startsWith('common.')
      ? i18n.t(message)
      : message;

  const translatedDescription = options?.description && (
    options.description.startsWith('success.') || 
    options.description.startsWith('errors.') || 
    options.description.startsWith('common.')
  )
    ? i18n.t(options.description)
    : options?.description;

  const toastOptions = {
    description: translatedDescription,
    duration: options?.duration || 4000,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  };

  switch (type) {
    case 'success':
      return sonnerToast.success(translatedMessage, toastOptions);
    case 'error':
      return sonnerToast.error(translatedMessage, toastOptions);
    case 'warning':
      return sonnerToast.warning(translatedMessage, toastOptions);
    case 'info':
      return sonnerToast.info(translatedMessage, toastOptions);
  }
}

export const toast = {
  success: (message: string, options?: ToastOptions) => createToast('success', message, options),
  error: (message: string, options?: ToastOptions) => createToast('error', message, options),
  warning: (message: string, options?: ToastOptions) => createToast('warning', message, options),
  info: (message: string, options?: ToastOptions) => createToast('info', message, options),
  
  // Promise toast for async operations
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: i18n.t(messages.loading) || messages.loading,
      success: i18n.t(messages.success) || messages.success,
      error: i18n.t(messages.error) || messages.error,
    });
  },

  // Dismiss toast
  dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
};
