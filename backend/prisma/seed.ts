/**
 * SIMPLE SEED DATA - Realistic CarePulse Demo Scenarios
 * Creates realistic demo data matching our simplified domain entities
 */

import { PrismaClient } from '@prisma/client';
import { seedUsers, seedPatients, seedDoctors, seedAppointments } from '../src/domain/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CarePulse database seeding...');

  // Clear existing data in correct order (respecting foreign keys)
  await clearDatabase();

  // Create data using our domain seed data
  await createUsers();
  await createPatients();
  await createDoctors();
  await createAppointments();
  
  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Seed data summary:');
  console.log(`   - ${seedUsers.length} users created`);
  console.log(`   - ${seedPatients.length} patients created`);
  console.log(`   - ${seedDoctors.length} doctors created`);
  console.log(`   - ${seedAppointments.length} appointments created`);
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  // Clear in correct order (child tables first)
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('✨ Database cleared');
}

async function createUsers() {
  console.log('👥 Creating users...');

  for (const user of seedUsers) {
    await prisma.user.create({
      data: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }
}

async function createPatients() {
  console.log('🏥 Creating patients...');

  for (const patient of seedPatients) {
    await prisma.patient.create({
      data: {
        id: patient.id,
        userId: patient.userId,
        phone: patient.phone.formatForDisplay(),
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    });
  }
}

async function createDoctors() {
  console.log('👨‍⚕️ Creating doctors...');

  for (const doctor of seedDoctors) {
    await prisma.doctor.create({
      data: {
        id: doctor.id,
        userId: doctor.userId,
        specialization: doctor.specialization,
        isActive: doctor.isActive,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      },
    });
  }
}

async function createAppointments() {
  console.log('📅 Creating appointments...');

  for (const appointment of seedAppointments) {
    await prisma.appointment.create({
      data: {
        id: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        type: appointment.type,
        status: appointment.status,
        scheduledDateTime: appointment.scheduledDateTime,
        durationMinutes: appointment.duration.getMinutes(),
        reasonForVisit: appointment.reasonForVisit,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      },
    });
  }
}

// Error handling
main()
  .catch((e) => {
    console.error('❌ Seed data creation failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });