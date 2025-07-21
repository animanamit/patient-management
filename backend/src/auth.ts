/**
 * BETTER AUTH CONFIGURATION
 * 
 * This file configures our authentication system using Better Auth.
 * We'll implement three authentication methods:
 * 1. Email/Password - Traditional authentication with secure password hashing
 * 2. Phone/OTP - SMS-based authentication using time-limited codes
 * 3. Google OAuth - Social login using OAuth 2.0 protocol
 * 
 * Each method teaches different security concepts and patterns.
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { prisma } from "./config/database.js";
import { smsService } from "./services/sms.service.js";
import { env } from "./config/environment.js";

/**
 * Core authentication configuration
 * 
 * Better Auth handles:
 * - Password hashing with bcrypt (cost factor 12 by default)
 * - Secure session management with HTTP-only cookies
 * - CSRF protection with double-submit cookies
 * - Automatic session rotation for security
 */
export const auth = betterAuth({
  /**
   * Database adapter configuration
   * This tells Better Auth how to store users, sessions, and tokens
   * in our existing PostgreSQL database via Prisma
   */
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    // Map Better Auth's internal fields to our Prisma schema
    schema: {
      account: {
        fields: {
          providerId: "provider", // Map providerId to provider field
        }
      }
    }
  }),

  /**
   * Base URL configuration
   * Used for OAuth callbacks and email verification links
   */
  baseURL: env.NODE_ENV === "production" 
    ? "https://your-domain.com" 
    : "http://localhost:8000",

  /**
   * Trusted origins for CORS
   * This allows your frontend to communicate with the auth endpoints
   */
  trustedOrigins: env.NODE_ENV === "production"
    ? ["https://patient-management-kohl.vercel.app", "https://your-domain.com"]
    : ["http://localhost:3000", "http://localhost:8000"],

  /**
   * Email/Password Authentication
   * 
   * Security features:
   * - Passwords are hashed with bcrypt (one-way, salted)
   * - Minimum 8 characters enforced
   * - Auto sign-in after registration for better UX
   * - Email verification available (we'll implement later)
   */
  emailAndPassword: {
    enabled: true,
    
    // Users are automatically signed in after registration
    // This is a UX decision - you can disable for extra security
    autoSignIn: true,
    
    // Password requirements (Better Auth enforces 8 char minimum)
    // You can add custom validation in your signup flow
  },

  /**
   * Session configuration
   * 
   * Sessions are the heart of authentication:
   * - Server-side sessions (stateful) for better security
   * - HTTP-only cookies prevent XSS attacks
   * - 30-day expiration with sliding window
   * - Automatic cleanup of expired sessions
   */
  session: {
    // How long until a session expires (30 days)
    expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
    
    // Update session activity on each request
    // This implements a "sliding window" - active users stay logged in
    updateAge: 60 * 60 * 24, // Update if last activity > 24 hours ago
    
    // Cookie configuration for security
    cookieName: "physioflow-auth", // Custom cookie name
  },

  /**
   * Social Authentication Providers
   * 
   * OAuth 2.0 flow with Google:
   * 1. User clicks "Sign in with Google"
   * 2. Redirect to Google for authentication
   * 3. Google redirects back with authorization code
   * 4. Exchange code for user info (server-side)
   * 5. Create/update user account
   * 6. Create session
   */
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "your-google-client-id",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
      
      // Scopes determine what data we can access
      // Default: email, profile (name, picture)
      // You can request additional scopes if needed
    }
  },

  /**
   * Plugins extend Better Auth with additional features
   */
  plugins: [
    /**
     * Phone Number Authentication Plugin
     * 
     * Implements OTP-based authentication:
     * - Generates cryptographically secure 6-digit codes
     * - Time-limited validity (5 minutes)
     * - Rate limiting (3 attempts per code)
     * - Integrates with your existing Twilio service
     */
    phoneNumber({
      /**
       * This is where Better Auth integrates with YOUR SMS service
       * Better Auth generates the OTP, you send it
       */
      sendOTP: async ({ phoneNumber, code }, request) => {
        console.log(`[AUTH] Sending OTP ${code} to ${phoneNumber}`);
        
        try {
          // Use your existing Twilio service!
          await smsService.sendSMS({
            to: phoneNumber,
            body: `Your CarePulse verification code is: ${code}\n\nThis code expires in 5 minutes.`
          });
          
          console.log(`[AUTH] OTP sent successfully to ${phoneNumber}`);
        } catch (error) {
          console.error(`[AUTH] Failed to send OTP:`, error);
          throw new Error("Failed to send verification code");
        }
      },

      /**
       * OTP Security Configuration
       */
      otpLength: 6,        // 6-digit codes (1 million possibilities)
      expiresIn: 300,      // 5 minutes in seconds
      allowedAttempts: 3,  // Prevent brute force attacks
      
      /**
       * Phone validation using your existing value object!
       * This ensures only valid Singapore numbers are accepted
       */
      phoneNumberValidator: (phone) => {
        try {
          // Reuse your PhoneNumber value object validation
          const phoneRegex = /^\+65\s?[689]\d{3}\s?\d{4}$/;
          return phoneRegex.test(phone);
        } catch {
          return false;
        }
      },

      /**
       * Allow users to sign up with just phone number
       * This creates a minimal user account that can be enhanced later
       */
      signUpOnVerification: {
        // Generate temporary email for phone-only signups
        // User can add real email later
        getTempEmail: (phoneNumber) => {
          // Remove spaces and special characters
          const cleaned = phoneNumber.replace(/\D/g, '');
          return `${cleaned}@physioflow-temp.com`;
        },
        
        // Use phone number as temporary name
        getTempName: (phoneNumber) => phoneNumber
      },

      /**
       * Callback after successful phone verification
       * Use this for analytics or user onboarding
       */
      callbackOnVerification: async ({ phoneNumber, user }, request) => {
        console.log(`[AUTH] Phone verified for user ${user.id}: ${phoneNumber}`);
        // You could trigger welcome SMS, analytics events, etc.
      }
    })
  ],

  /**
   * Advanced Security Configuration
   */
  rateLimit: {
    // Prevent brute force attacks on authentication endpoints
    // Better Auth implements sliding window rate limiting
    enabled: true,
  },

  /**
   * User account configuration
   */
  user: {
    /**
     * Additional fields on the user model
     * These are stored in the user table alongside Better Auth's fields
     */
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "PATIENT", // Default role for new users
      },
      // We'll map firstName/lastName from your domain model
      // during user creation
    }
  },

  /**
   * Development helpers
   */
  logger: env.NODE_ENV === "development",

  /**
   * Secret key for signing sessions
   * In production, this should come from environment variables
   */
  secret: env.AUTH_SECRET || "your-secret-key-at-least-32-characters-long-for-security",
});