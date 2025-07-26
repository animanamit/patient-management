/**
 * ENVIRONMENT CONFIGURATION
 * 
 * Type-safe environment variable validation and configuration.
 * Validates all required environment variables at startup.
 */

import { config } from 'dotenv';

// Load environment variables
config();

// Environment variable validation schema
interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;
  
  // Server
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // External Services (for future use)
  CLERK_SECRET_KEY: string | undefined;
  FRONTEND_URL: string;
  
  // Auth
  AUTH_SECRET: string | undefined;
  GOOGLE_CLIENT_ID: string | undefined;
  GOOGLE_CLIENT_SECRET: string | undefined;
  
  // AWS S3 Configuration
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_S3_BUCKET_NAME: string;
}

// Validate required environment variables
const validateEnvironment = (): EnvironmentConfig => {
  const requiredVars = ['DATABASE_URL', 'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'] as const;
  const missingVars: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate DATABASE_URL format
  const databaseUrl = process.env.DATABASE_URL!;
  if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
    throw new Error(
      'DATABASE_URL must be a valid PostgreSQL connection string starting with postgres:// or postgresql://'
    );
  }

  return {
    DATABASE_URL: databaseUrl,
    PORT: parseInt(process.env.PORT || '8000', 10),
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    AWS_REGION: process.env.AWS_REGION!,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME!,
  };
};

// Export validated configuration
export const env = validateEnvironment();

// Log configuration (excluding sensitive data) - always log in production for debugging
console.log('🔧 Environment Configuration:');
console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
console.log(`  - PORT: ${env.PORT}`);
console.log(`  - Raw process.env.PORT: ${process.env.PORT}`);
console.log(`  - Raw process.env.API_PORT: ${process.env.API_PORT}`);
console.log(`  - DATABASE_URL: ${env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`); // Hide password
console.log(`  - FRONTEND_URL: ${env.FRONTEND_URL}`);