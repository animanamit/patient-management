/**
 * AUTHENTICATION ROUTES
 * 
 * This file sets up the authentication endpoints for Better Auth.
 * Better Auth handles all the complex authentication logic - we just
 * need to route requests to it and let it do its magic.
 * 
 * Key concepts:
 * - Better Auth provides a single handler that manages all auth routes
 * - It automatically handles CORS, CSRF protection, and security headers
 * - All auth routes are prefixed with /api/auth/*
 */

import { FastifyPluginAsync } from 'fastify';
import { auth } from '../auth.js';

const authRoutes: FastifyPluginAsync = async function (fastify) {
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
   * 
   * The beauty of Better Auth is that all these endpoints are
   * automatically created and secured for us!
   */
  fastify.all('/api/auth/*', async (request, reply) => {
    /**
     * Better Auth expects a standard Web Request object
     * Fastify uses its own request format, so we need to convert
     */
    
    // Log auth requests in development for learning
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH] ${request.method} ${request.url}`);
      if (request.body) {
        // Don't log passwords!
        const sanitizedBody = { ...request.body as any };
        if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
        console.log('[AUTH] Body:', sanitizedBody);
      }
    }

    /**
     * Create a proper Web API Request for Better Auth
     * We need to construct the full URL that Better Auth expects
     */
    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const host = request.headers.host || 'localhost:8000';
    const fullUrl = `${protocol}://${host}${request.url}`;
    
    console.log(`[AUTH] Full URL: ${fullUrl}`);

    /**
     * Create a proper Request object for Better Auth
     */
    const webRequest = new Request(fullUrl, {
      method: request.method,
      headers: request.headers as any,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? JSON.stringify(request.body) 
        : undefined,
    });

    try {
      console.log('[AUTH] Passing request to Better Auth handler...');
      const response = await auth.handler(webRequest);
      console.log('[AUTH] Better Auth handler returned response');

      /**
       * Copy Better Auth's response to Fastify's reply
       * This includes headers, status codes, and body
       */
      
      // Set status code
      reply.code(response.status);

      // Copy all headers from Better Auth's response
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });

      // Send the response body
      // Better Auth returns proper JSON responses for all endpoints
      const body = await response.text();
      
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUTH] Response status: ${response.status}`);
        if (body) {
          console.log(`[AUTH] Response body: ${body.substring(0, 200)}...`);
        }
      }
      
      // Return proper response based on content type
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          reply.send(JSON.parse(body));
        } catch {
          reply.send(body);
        }
      } else {
        reply.send(body);
      }
    } catch (error) {
      console.error('[AUTH] Handler error:', error);
      reply.code(500).send({ error: 'Internal server error during authentication' });
    }
  });


  /**
   * WORKAROUND: Handle use-session endpoint
   * 
   * Better Auth React client calls /use-session instead of /session
   * This forwards the request to the correct endpoint
   */
  fastify.get('/api/auth/use-session', async (request, reply) => {
    console.log('[AUTH] WORKAROUND: use-session endpoint called');
    console.log('[AUTH] Original URL:', request.url);
    console.log('[AUTH] Headers:', request.headers);
    
    const protocol = request.headers['x-forwarded-proto'] || 'http';
    const host = request.headers.host || 'localhost:8000';
    const sessionUrl = `${protocol}://${host}/api/auth/session`;
    
    console.log('[AUTH] Redirecting to:', sessionUrl);
    
    const webRequest = new Request(sessionUrl, {
      method: 'GET',
      headers: request.headers as any,
    });

    try {
      const response = await auth.handler(webRequest);
      
      console.log('[AUTH] Session handler response status:', response.status);
      
      reply.code(response.status);
      response.headers.forEach((value, key) => {
        reply.header(key, value);
      });
      
      const body = await response.text();
      const contentType = response.headers.get('content-type');
      
      console.log('[AUTH] Session response body:', body.substring(0, 200));
      
      if (contentType?.includes('application/json')) {
        try {
          reply.send(JSON.parse(body));
        } catch {
          reply.send(body);
        }
      } else {
        reply.send(body);
      }
    } catch (error) {
      console.error('[AUTH] Session handler error:', error);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  /**
   * HEALTH CHECK ENDPOINT
   * 
   * Simple endpoint to verify auth service is running
   * Useful for monitoring and debugging
   */
  fastify.get('/api/auth/health', async (request, reply) => {
    return {
      status: 'healthy',
      service: 'authentication',
      timestamp: new Date().toISOString(),
      features: [
        'email-password',
        'phone-otp',
        'google-oauth'
      ]
    };
  });
};

export default authRoutes;