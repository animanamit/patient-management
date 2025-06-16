/**
 * DATABASE CONFIGURATION
 * 
 * Prisma client setup with connection management and error handling.
 * Implements singleton pattern for connection reuse.
 */

import { PrismaClient } from '@prisma/client';

// Extend global to include prisma for development hot reloading
declare global {
  var __prisma: PrismaClient | undefined;
}

// Prisma client configuration
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

// Singleton pattern for Prisma client
// In development, store on global to prevent multiple instances during hot reloading
// In production, create a new instance
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown handling
const gracefulShutdown = async () => {
  console.log('Disconnecting from database...');
  await prisma.$disconnect();
  console.log('Database disconnected.');
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

// Database health check function
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(' Database connection successful');
    return true;
  } catch (error) {
    console.error('L Database connection failed:', error);
    return false;
  }
};

// Export types for use in repositories
export type PrismaClientType = typeof prisma;