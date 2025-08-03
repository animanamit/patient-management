#!/bin/bash

echo "🚀 Setting up local PostgreSQL database..."

# Start Docker containers
echo "📦 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Copy .env.local to .env for Prisma
echo "📋 Setting up environment..."
cp .env.local .env

# Run Prisma migrations
echo "🔄 Running database migrations..."
npm run db:push

# Seed the database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Local database setup complete!"
echo ""
echo "📊 You can view your database with: npm run db:studio"
echo "🖥️  Start the server with: npm run dev"