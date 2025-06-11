/**
 * SIMPLE SEED DATA - Realistic CarePulse Demo Scenarios
 * Creates realistic demo data matching our simplified domain entities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create dates relative to today
const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const hoursFromNow = (hours: number): Date => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
};

async function main() {
  console.log('🌱 Starting CarePulse database seeding...');

  // Clear existing data in correct order (respecting foreign keys)
  await clearDatabase();

  // Create users and role-specific data
  const users = await createUsers();
  const patients = await createPatients(users.patients);
  const doctors = await createDoctors(users.doctors);
  const appointments = await createAppointments(patients, doctors);
  
  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Seed data summary:');
  console.log(`   - ${users.patients.length} patients created`);
  console.log(`   - ${users.doctors.length} doctors created`);
  console.log(`   - ${appointments.length} appointments created`);
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

  // Create patient users
  const patientUsers = await Promise.all([
    prisma.user.create({
      data: {
        clerkUserId: 'user_2mno345pqr678',
        email: 'john.doe@email.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'PATIENT',
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: 'user_2stu901vwx234',
        email: 'emily.tan@gmail.com',
        firstName: 'Emily',
        lastName: 'Tan',
        role: 'PATIENT',
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: 'user_2yza567bcd890',
        email: 'michael.lee@hotmail.com',
        firstName: 'Michael',
        lastName: 'Lee',
        role: 'PATIENT',
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: 'user_2efg123hij456',
        email: 'lisa.wong@yahoo.com',
        firstName: 'Lisa',
        lastName: 'Wong',
        role: 'PATIENT',
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: 'user_2klm789nop012',
        email: 'david.kumar@live.com',
        firstName: 'David',
        lastName: 'Kumar',
        role: 'PATIENT',
      },
    }),
  ]);

  // Create doctor users
  const doctorUsers = await Promise.all([
    prisma.user.create({
      data: {
        clerkUserId: 'user_2abc123def456',
        email: 'dr.sarah.chen@carepulse.com',
        firstName: 'Sarah',
        lastName: 'Chen',
        role: 'DOCTOR',
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: 'user_2def456ghi789',
        email: 'dr.james.wilson@carepulse.com',
        firstName: 'James',
        lastName: 'Wilson',
        role: 'DOCTOR',
      },
    }),
    prisma.user.create({
      data: {
        clerkUserId: 'user_2ghi789jkl012',
        email: 'dr.maria.rodriguez@carepulse.com',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        role: 'DOCTOR',
      },
    }),
  ]);

  return {
    patients: patientUsers,
    doctors: doctorUsers,
  };
}

async function createPatients(patientUsers: any[]) {
  console.log('🏥 Creating patients...');

  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        userId: patientUsers[0].id,
        phone: '+65 9123 4567',
        dateOfBirth: new Date('1985-03-15'),
        address: '123 Orchard Road, Singapore 238863',
      },
    }),
    prisma.patient.create({
      data: {
        userId: patientUsers[1].id,
        phone: '+65 8234 5678',
        dateOfBirth: new Date('1992-07-22'),
        address: '456 Marina Bay, Singapore 018956',
      },
    }),
    prisma.patient.create({
      data: {
        userId: patientUsers[2].id,
        phone: '+65 9345 6789',
        dateOfBirth: new Date('1978-11-08'),
        address: '789 Sentosa Cove, Singapore 098234',
      },
    }),
    prisma.patient.create({
      data: {
        userId: patientUsers[3].id,
        phone: '+65 8456 7890',
        dateOfBirth: new Date('1995-01-30'),
        address: '321 Clarke Quay, Singapore 179024',
      },
    }),
    prisma.patient.create({
      data: {
        userId: patientUsers[4].id,
        phone: '+65 9567 8901',
        dateOfBirth: new Date('1988-09-12'),
        address: '654 Tanjong Pagar, Singapore 088537',
      },
    }),
  ]);

  return patients;
}

async function createDoctors(doctorUsers: any[]) {
  console.log('👨‍⚕️ Creating doctors...');

  const doctors = await Promise.all([
    prisma.doctor.create({
      data: {
        userId: doctorUsers[0].id,
        specialization: 'General Physiotherapy',
        isActive: true,
      },
    }),
    prisma.doctor.create({
      data: {
        userId: doctorUsers[1].id,
        specialization: 'Sports Physiotherapy',
        isActive: true,
      },
    }),
    prisma.doctor.create({
      data: {
        userId: doctorUsers[2].id,
        specialization: 'Pediatric Physiotherapy',
        isActive: true,
      },
    }),
  ]);

  return doctors;
}

async function createAppointments(patients: any[], doctors: any[]) {
  console.log('📅 Creating appointments...');

  const appointments = await Promise.all([
    // Past completed appointment
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        type: 'CHECK_UP',
        status: 'COMPLETED',
        scheduledDateTime: daysFromNow(-3),
        durationMinutes: 30,
        reasonForVisit: 'Regular physiotherapy session for lower back pain',
        notes: 'Patient showed good improvement. Recommended home exercises.',
      },
    }),
    // Past completed first consultation
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        type: 'FIRST_CONSULT',
        status: 'COMPLETED',
        scheduledDateTime: daysFromNow(-5),
        durationMinutes: 90,
        reasonForVisit: 'Sports injury assessment - knee pain after running',
        notes: 'Initial assessment complete. Prescribed strengthening exercises.',
      },
    }),
    // Today's scheduled appointment
    prisma.appointment.create({
      data: {
        patientId: patients[2].id,
        doctorId: doctors[0].id,
        type: 'FOLLOW_UP',
        status: 'SCHEDULED',
        scheduledDateTime: hoursFromNow(2),
        durationMinutes: 45,
        reasonForVisit: 'Follow-up for shoulder rehabilitation',
      },
    }),
    // Today's in-progress appointment
    prisma.appointment.create({
      data: {
        patientId: patients[3].id,
        doctorId: doctors[1].id,
        type: 'CHECK_UP',
        status: 'IN_PROGRESS',
        scheduledDateTime: hoursFromNow(-0.5),
        durationMinutes: 60,
        reasonForVisit: 'Regular treatment for chronic pain management',
      },
    }),
    // Future scheduled appointment
    prisma.appointment.create({
      data: {
        patientId: patients[4].id,
        doctorId: doctors[2].id,
        type: 'FIRST_CONSULT',
        status: 'SCHEDULED',
        scheduledDateTime: daysFromNow(2),
        durationMinutes: 90,
        reasonForVisit: 'Initial consultation for pediatric assessment',
      },
    }),
    // Future follow-up
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        type: 'FOLLOW_UP',
        status: 'SCHEDULED',
        scheduledDateTime: daysFromNow(5),
        durationMinutes: 45,
        reasonForVisit: 'Continued treatment for lower back recovery',
      },
    }),
    // Cancelled appointment
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        doctorId: doctors[0].id,
        type: 'CHECK_UP',
        status: 'CANCELLED',
        scheduledDateTime: daysFromNow(1),
        durationMinutes: 30,
        reasonForVisit: 'Regular session - cancelled due to scheduling conflict',
      },
    }),
  ]);

  return appointments;
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