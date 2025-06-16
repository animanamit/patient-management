/**
 * DATABASE CONNECTION TEST
 * 
 * Simple script to test Prisma setup and database connectivity.
 * Run with: npm run test:db or tsx src/test-db-connection.ts
 */

import { prisma, checkDatabaseConnection } from './config/database';
import { env } from './config/environment';

async function testDatabaseSetup() {
  console.log('🧪 Testing CarePulse Database Setup...\n');
  
  // Test 1: Environment Configuration
  console.log('1️⃣ Environment Configuration:');
  console.log(`   ✅ NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   ✅ DATABASE_URL: ${env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')}`);
  console.log(`   ✅ PORT: ${env.PORT}\n`);
  
  // Test 2: Database Connection
  console.log('2️⃣ Database Connection:');
  const isConnected = await checkDatabaseConnection();
  
  if (!isConnected) {
    console.log('❌ Database connection failed. Check your DATABASE_URL and PostgreSQL server.');
    process.exit(1);
  }
  
  // Test 3: Prisma Client Functionality
  console.log('\n3️⃣ Prisma Client Tests:');
  
  try {
    // Test table existence by counting records
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const appointmentCount = await prisma.appointment.count();
    
    console.log(`   ✅ Users table: ${userCount} records`);
    console.log(`   ✅ Patients table: ${patientCount} records`);
    console.log(`   ✅ Doctors table: ${doctorCount} records`);
    console.log(`   ✅ Appointments table: ${appointmentCount} records`);
    
    console.log('\n✅ All database tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. If tables are empty, run: npm run db:seed');
    console.log('   2. Start building your Fastify API routes');
    console.log('   3. Test repository implementations');
    
  } catch (error) {
    console.error('\n❌ Prisma client error:', error);
    console.log('\n🔧 Possible fixes:');
    console.log('   1. Run: npx prisma db push (to create tables)');
    console.log('   2. Run: npx prisma generate (to regenerate client)');
    console.log('   3. Check your DATABASE_URL in .env file');
    process.exit(1);
  }
  
  // Clean up
  await prisma.$disconnect();
  console.log('\n🎉 Database setup test completed successfully!');
}

// Run the test
testDatabaseSetup().catch(console.error);