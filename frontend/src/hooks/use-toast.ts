/**
 * TOAST HOOK
 * 
 * Simple toast notification system using Sonner.
 * Provides type-safe toast methods with consistent styling.
 */

import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(options?.title || message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(options?.title || message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(options?.title || message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(options?.title || message, {
      description: options?.description,
      duration: options?.duration,
      action: options?.action,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(options?.title || message, {
      description: options?.description,
      duration: options?.duration,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};