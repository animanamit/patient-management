/**
 * AUTHENTICATION HOOK
 * 
 * This custom hook provides a clean interface for authentication
 * throughout our application. It wraps Better Auth's functionality
 * and adds our business logic and error handling.
 * 
 * Key features:
 * - Centralized authentication state management
 * - Error handling with user-friendly messages
 * - Loading states for all auth operations
 * - TypeScript safety for user data
 * - Integration with our domain models
 */

import { useState } from 'react';
import { authClient, type User, formatPhoneDisplay /*, useSession */ } from '@/lib/auth-client';
import { toast } from '@/hooks/use-toast';

/**
 * Authentication error types
 * These help us provide specific error messages to users
 */
type AuthError = {
  code: string;
  message: string;
};

/**
 * Custom authentication hook
 * 
 * This hook manages all authentication state and operations
 * It provides a clean interface that hides Better Auth's complexity
 */
export const useAuth = () => {
  // Loading states for different operations
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // Get session data using Better Auth's hook
  // TODO: Fix useSession endpoint issue before re-enabling
  // const { data: session, isPending, error: sessionError } = useSession();
  const session = null;
  const isPending = false;
  const sessionError = null;

  /**
   * EMAIL/PASSWORD AUTHENTICATION
   */
  
  /**
   * Sign up with email and password
   * Creates a new user account and automatically signs them in
   */
  const signUpWithEmail = async ({
    email,
    password,
    name,
    role = 'PATIENT'
  }: {
    email: string;
    password: string;
    name: string;
    role?: 'PATIENT' | 'DOCTOR' | 'STAFF';
  }) => {
    setIsSigningUp(true);
    
    try {
      console.log('[Auth] Starting email signup process');
      
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        // Additional fields for our user model
        callbackURL: '/dashboard',
      });

      if (error) {
        console.error('[Auth] Signup error:', error);
        
        // Provide user-friendly error messages
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage, {
          title: "Sign Up Failed",
        });
        
        return { success: false, error: errorMessage };
      }

      console.log('[Auth] Signup successful:', data);
      
      toast.success("Account created successfully!", {
        title: "Welcome to CarePulse!",
      });

      return { success: true, data };
      
    } catch (error: any) {
      console.error('[Auth] Unexpected signup error:', error);
      
      // Check for CORS/origin errors
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        errorMessage = 'Unable to connect to the authentication server. Please check your connection and try again.';
      } else if (error?.status === 403) {
        errorMessage = 'Authentication request blocked. The server may need to restart to apply configuration changes.';
      }
      
      toast.error(errorMessage, {
        title: "Sign Up Failed",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSigningUp(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const signInWithEmail = async ({
    email,
    password,
    rememberMe = true
  }: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }) => {
    setIsSigningIn(true);
    
    try {
      console.log('[Auth] Starting email signin process');
      
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: '/dashboard',
      });

      if (error) {
        console.error('[Auth] Signin error:', error);
        
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage, {
          title: "Sign In Failed",
        });
        
        return { success: false, error: errorMessage };
      }

      console.log('[Auth] Signin successful');
      
      toast.success("You have been signed in successfully.", {
        title: "Welcome back!",
      });

      return { success: true, data };
      
    } catch (error) {
      console.error('[Auth] Unexpected signin error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      
      toast.error(errorMessage, {
        title: "Sign In Failed",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSigningIn(false);
    }
  };

  /**
   * PHONE NUMBER AUTHENTICATION
   */
  
  /**
   * Send OTP to phone number
   * This initiates the phone verification process
   */
  const sendPhoneOTP = async (phoneNumber: string) => {
    setIsSendingOTP(true);
    
    try {
      console.log('[Auth] Sending OTP to:', phoneNumber);
      
      const { data, error } = await authClient.phoneNumber.sendOtp({
        phoneNumber,
      });

      if (error) {
        console.error('[Auth] OTP send error:', error);
        
        const errorMessage = getErrorMessage(error);
        toast({
          title: "Failed to Send Code",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { success: false, error: errorMessage };
      }

      console.log('[Auth] OTP sent successfully');
      
      toast({
        title: "Verification Code Sent",
        description: `Check your SMS for the verification code sent to ${formatPhoneDisplay(phoneNumber)}`,
      });

      return { success: true, data };
      
    } catch (error) {
      console.error('[Auth] Unexpected OTP error:', error);
      const errorMessage = 'Failed to send verification code. Please try again.';
      
      toast({
        title: "Failed to Send Code",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsSendingOTP(false);
    }
  };

  /**
   * Verify phone number with OTP
   * This completes the phone authentication process
   */
  const verifyPhoneOTP = async ({
    phoneNumber,
    code,
    createSession = true
  }: {
    phoneNumber: string;
    code: string;
    createSession?: boolean;
  }) => {
    setIsVerifyingPhone(true);
    
    try {
      console.log('[Auth] Verifying OTP for:', phoneNumber);
      
      const { data, error } = await authClient.phoneNumber.verify({
        phoneNumber,
        code,
        disableSession: !createSession,
      });

      if (error) {
        console.error('[Auth] OTP verification error:', error);
        
        const errorMessage = getErrorMessage(error);
        toast({
          title: "Verification Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { success: false, error: errorMessage };
      }

      console.log('[Auth] Phone verification successful');
      
      toast({
        title: createSession ? "Welcome to CarePulse!" : "Phone Verified",
        description: createSession 
          ? "Your phone number has been verified and you're now signed in."
          : "Your phone number has been verified successfully.",
      });

      return { success: true, data };
      
    } catch (error) {
      console.error('[Auth] Unexpected verification error:', error);
      const errorMessage = 'Verification failed. Please try again.';
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  /**
   * GOOGLE OAUTH AUTHENTICATION
   */
  
  /**
   * Sign in with Google
   * This initiates the OAuth flow
   */
  const signInWithGoogle = async () => {
    try {
      console.log('[Auth] Starting Google OAuth flow');
      
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
        errorCallbackURL: '/auth/error',
      });
      
      // Note: This will redirect the browser, so code after this won't execute
      
    } catch (error) {
      console.error('[Auth] Google OAuth error:', error);
      
      toast({
        title: "Google Sign In Failed",
        description: "Unable to connect to Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * SIGN OUT
   */
  const signOut = async () => {
    setIsSigningOut(true);
    
    try {
      console.log('[Auth] Signing out user');
      
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("You have been signed out successfully.", {
              title: "Signed Out",
            });
          },
        },
      });
      
    } catch (error) {
      console.error('[Auth] Signout error:', error);
      
      toast.error("There was an issue signing you out. Please try again.", {
        title: "Sign Out Error",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  /**
   * UTILITY FUNCTIONS
   */
  
  /**
   * Convert API errors to user-friendly messages
   */
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    
    // Common authentication error codes
    const errorMessages: Record<string, string> = {
      'INVALID_EMAIL': 'Please enter a valid email address.',
      'INVALID_PASSWORD': 'Password must be at least 8 characters long.',
      'EMAIL_ALREADY_EXISTS': 'An account with this email already exists.',
      'INVALID_CREDENTIALS': 'Invalid email or password.',
      'PHONE_NUMBER_ALREADY_EXISTS': 'This phone number is already registered.',
      'INVALID_PHONE_NUMBER': 'Please enter a valid Singapore phone number.',
      'INVALID_OTP': 'Invalid verification code. Please try again.',
      'OTP_EXPIRED': 'Verification code has expired. Please request a new one.',
      'TOO_MANY_ATTEMPTS': 'Too many attempts. Please request a new verification code.',
      'USER_NOT_FOUND': 'No account found with this information.',
    };

    return errorMessages[error.code] || error.message || 'An unexpected error occurred.';
  };

  /**
   * RETURN HOOK INTERFACE
   */
  return {
    // Session state
    user: session?.user || null,
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    
    // Authentication methods
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    
    // Phone authentication
    sendPhoneOTP,
    verifyPhoneOTP,
    
    // Loading states
    isSigningIn,
    isSigningUp,
    isSigningOut,
    isSendingOTP,
    isVerifyingPhone,
    
    // Utility functions
    formatPhoneDisplay,
    
    // Role checking
    hasRole: (role: string) => session?.user?.role === role,
    isPatient: session?.user?.role === 'PATIENT',
    isDoctor: session?.user?.role === 'DOCTOR',
    isStaff: session?.user?.role === 'STAFF',
  };
};