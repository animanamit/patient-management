/**
 * BETTER AUTH CLIENT CONFIGURATION
 * 
 * This sets up the authentication client for our frontend.
 * The client provides hooks and methods for all auth operations:
 * - Sign up/sign in with email/password
 * - Phone number verification with OTP
 * - Google OAuth signin
 * - Session management
 * 
 * The client automatically handles:
 * - Secure cookie-based sessions
 * - CSRF protection
 * - Automatic session refresh
 * - Cross-tab session sync
 */

import { createAuthClient } from "better-auth/client";
import { phoneNumberClient } from "better-auth/client/plugins";

/**
 * Initialize the Better Auth client
 * 
 * This client will communicate with our backend auth endpoints
 * at /api/auth/* and handle all authentication flows
 */
export const authClient = createAuthClient({
  /**
   * Base URL must match your backend server
   * In production, this would be your API domain
   * 
   * Better Auth expects /api/auth/* endpoints by default
   * Our backend serves these at /api/auth/* so baseURL should be the root
   */
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  
  /**
   * Plugins extend the client with additional features
   * We're using the phone number plugin for OTP authentication
   */
  plugins: [
    phoneNumberClient({
      /**
       * This tells the client to use our custom phone number endpoints
       * The plugin adds methods like:
       * - authClient.phoneNumber.sendOtp()
       * - authClient.phoneNumber.verify()
       */
    })
  ],

  /**
   * Advanced options for better debugging in development
   */
  fetchOptions: {
    // Log all auth requests in development
    onRequest: (method, url, options) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auth Client] ${method} ${url}`);
        if (options?.body) {
          const body = JSON.parse(options.body as string);
          // Don't log sensitive data
          if (body.password) body.password = '[REDACTED]';
          console.log('[Auth Client] Request body:', body);
        }
      }
    },
    
    // Log auth responses
    onResponse: (response) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auth Client] Response status: ${response.status}`);
      }
    },

    // Handle auth errors globally
    onError: (error) => {
      console.error('[Auth Client] Error:', error);
      // You could show a toast notification here
    }
  }
});

/**
 * TypeScript types for Better Auth
 * These are automatically inferred from your auth configuration
 */
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

/**
 * Convenience exports for common auth operations
 * These methods can be used throughout your app
 */
export const {
  // Email/Password methods
  signUp,
  signIn,
  signOut,
  
  // Session management
  // useSession,  // React hook for session state - TODO: Fix endpoint issue
  getSession,  // Get session imperatively
  
  // Phone number methods (from plugin)
  phoneNumber,
  
  // OAuth sign in
  social,
} = authClient;

/**
 * Helper function to check if a user has a specific role
 * Useful for protecting UI elements
 */
export const hasRole = (user: User | null, role: string): boolean => {
  return user?.role === role;
};

/**
 * Helper to format phone numbers for display
 * Converts +6591234567 to +65 9123 4567
 */
export const formatPhoneDisplay = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format Singapore numbers
  if (digits.startsWith('65') && digits.length === 10) {
    return `+65 ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  
  return phone;
};