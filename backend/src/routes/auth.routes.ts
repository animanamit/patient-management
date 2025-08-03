/**
 * AUTHENTICATION ROUTES FOR HONO
 * 
 * This file sets up the authentication endpoints for Better Auth with Hono.
 * Since Hono already uses Web Standards, the integration is much cleaner
 * than with Fastify - no need to convert request formats!
 */

import { Hono } from 'hono';
import { auth } from '../auth.js';

const app = new Hono();

/**
 * MAIN AUTH ROUTE HANDLER
 * 
 * This single route handles ALL authentication endpoints:
 * 
 * Email/Password endpoints:
 * - POST /api/auth/sign-up/email - Register new user
 * - POST /api/auth/sign-in/email - Login with email/password
 * - POST /api/auth/sign-out - Logout user
 * - GET  /api/auth/session - Get current session
 * 
 * Phone/OTP endpoints:
 * - POST /api/auth/phone-number/send-otp - Send verification code
 * - POST /api/auth/phone-number/verify - Verify phone with OTP
 * - POST /api/auth/sign-in/phone-number - Login with phone/password
 * 
 * OAuth endpoints:
 * - GET  /api/auth/sign-in/google - Initiate Google OAuth
 * - GET  /api/auth/callback/google - Handle Google OAuth callback
 * 
 * Password reset endpoints:
 * - POST /api/auth/forgot-password - Request password reset
 * - POST /api/auth/reset-password - Reset password with token
 */
app.all('/api/auth/*', async (c) => {
  // Log auth requests in development for learning
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] ${c.req.method} ${c.req.url}`);
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      const body = await c.req.json().catch(() => null);
      if (body) {
        // Don't log passwords!
        const sanitizedBody = { ...body };
        if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
        console.log('[AUTH] Body:', sanitizedBody);
      }
    }
  }

  try {
    console.log('[AUTH] Passing request to Better Auth handler...');
    
    // Hono uses Web Standards natively - just pass the request!
    const response = await auth.handler(c.req.raw);
    
    console.log('[AUTH] Better Auth handler returned response');

    // Return the response from Better Auth directly
    return response;
  } catch (error) {
    console.error('[AUTH] Handler error:', error);
    return c.json({ error: 'Internal server error during authentication' }, 500);
  }
});

/**
 * WORKAROUND: Handle use-session endpoint
 * 
 * Better Auth React client calls /use-session instead of /session
 * This forwards the request to the correct endpoint
 */
app.get('/api/auth/use-session', async (c) => {
  console.log('[AUTH] WORKAROUND: use-session endpoint called');
  
  try {
    // Create a new request for the session endpoint
    const sessionUrl = new URL('/api/auth/session', c.req.url);
    const sessionRequest = new Request(sessionUrl, {
      method: 'GET',
      headers: c.req.raw.headers,
    });

    const response = await auth.handler(sessionRequest);
    console.log('[AUTH] Session handler response status:', response.status);
    
    return response;
  } catch (error) {
    console.error('[AUTH] Session handler error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * HEALTH CHECK ENDPOINT
 * 
 * Simple endpoint to verify auth service is running
 * Useful for monitoring and debugging
 */
app.get('/api/auth/health', async (c) => {
  return c.json({
    status: 'healthy',
    service: 'authentication',
    timestamp: new Date().toISOString(),
    features: [
      'email-password',
      'phone-otp',
      'google-oauth'
    ]
  });
});

export default app;