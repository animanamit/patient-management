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
}

// Validate required environment variables
const validateEnvironment = (): EnvironmentConfig => {
  const requiredVars = ['DATABASE_URL'] as const;
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
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  };
};

// Export validated configuration
export const env = validateEnvironment();

// Log configuration (excluding sensitive data)
if (env.NODE_ENV === 'development') {
  console.log('🔧 Environment Configuration:');
  console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
  console.log(`  - PORT: ${env.PORT}`);
  console.log(`  - DATABASE_URL: ${env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`); // Hide password
  console.log(`  - FRONTEND_URL: ${env.FRONTEND_URL}`);
}