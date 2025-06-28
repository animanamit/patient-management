/**
 * SEED DATA - Realistic Healthcare Demo Scenarios
 * 
 * Creates realistic demo data for testing and development:
 * - 3 doctors with different specializations
 * - 8-10 patients with varied profiles
 * - 15-20 appointments across different states
 * - Realistic time distributions (past, today, future)
 */

import {
  createPatientId,
  createDoctorId,
  createAppointmentId,
  createUserId,
  AppointmentStatus,
  AppointmentType,
  UserRole,
} from './entities/shared-types';

import { Patient } from './entities/patient';
import { Doctor } from './entities/doctor';
import { Appointment, createAppointment } from './entities/appointment';
import { EmailAddress, PhoneNumber, AppointmentDuration } from './entities/shared-types';

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

// Pre-generate IDs for consistent references
const userIds = {
  doctor1: createUserId(),
  doctor2: createUserId(), 
  doctor3: createUserId(),
  patient1: createUserId(),
  patient2: createUserId(),
  patient3: createUserId(),
  patient4: createUserId(),
  patient5: createUserId(),
};

const doctorIds = {
  doctor1: createDoctorId(),
  doctor2: createDoctorId(),
  doctor3: createDoctorId(),
};

const patientIds = {
  patient1: createPatientId(),
  patient2: createPatientId(),
  patient3: createPatientId(),
  patient4: createPatientId(),
  patient5: createPatientId(),
};

// Sample users (combined for doctors and patients) - Using random IDs for security
export const seedUsers = [
  // Doctor users
  {
    id: userIds.doctor1,
    clerkUserId: "user_2abc123def456",
    role: UserRole.DOCTOR,
    firstName: "Sarah",
    lastName: "Chen",
    email: "dr.sarah.chen@carepulse.com",
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-5),
  },
  {
    id: userIds.doctor2,
    clerkUserId: "user_2def456ghi789",
    role: UserRole.DOCTOR,
    firstName: "James",
    lastName: "Wilson",
    email: "dr.james.wilson@carepulse.com",
    createdAt: daysFromNow(-25),
    updatedAt: daysFromNow(-10),
  },
  {
    id: userIds.doctor3,
    clerkUserId: "user_2ghi789jkl012",
    role: UserRole.DOCTOR,
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "dr.maria.rodriguez@carepulse.com",
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-3),
  },
  // Patient users
  {
    id: userIds.patient1,
    clerkUserId: "user_2mno345pqr678",
    role: UserRole.PATIENT,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-2),
  },
  {
    id: userIds.patient2,
    clerkUserId: "user_2stu901vwx234",
    role: UserRole.PATIENT,
    firstName: "Emily",
    lastName: "Tan",
    email: "emily.tan@gmail.com",
    createdAt: daysFromNow(-12),
    updatedAt: daysFromNow(-1),
  },
  {
    id: userIds.patient3,
    clerkUserId: "user_2yza567bcd890",
    role: UserRole.PATIENT,
    firstName: "Michael",
    lastName: "Lee",
    email: "michael.lee@hotmail.com",
    createdAt: daysFromNow(-8),
    updatedAt: daysFromNow(-4),
  },
  {
    id: userIds.patient4,
    clerkUserId: "user_2efg123hij456",
    role: UserRole.PATIENT,
    firstName: "Lisa",
    lastName: "Wong",
    email: "lisa.wong@yahoo.com",
    createdAt: daysFromNow(-6),
    updatedAt: daysFromNow(-1),
  },
  {
    id: userIds.patient5,
    clerkUserId: "user_2klm789nop012",
    role: UserRole.PATIENT,
    firstName: "David",
    lastName: "Kumar",
    email: "david.kumar@live.com",
    createdAt: daysFromNow(-4),
    updatedAt: hoursFromNow(-6),
  }
];

// Sample doctors for the clinic - using random IDs for security
export const seedDoctors: Array<Doctor & { id: string; userId: string }> = [
  {
    id: doctorIds.doctor1,
    userId: userIds.doctor1,
    clerkUserId: "user_2abc123def456", // Mock Clerk ID
    firstName: "Sarah",
    lastName: "Chen",
    email: new EmailAddress("dr.sarah.chen@carepulse.com"),
    specialization: "General Physiotherapy",
    isActive: true,
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-5),
  },
  {
    id: doctorIds.doctor2,
    userId: userIds.doctor2,
    clerkUserId: "user_2def456ghi789",
    firstName: "James",
    lastName: "Wilson", 
    email: new EmailAddress("dr.james.wilson@carepulse.com"),
    specialization: "Sports Physiotherapy",
    isActive: true,
    createdAt: daysFromNow(-25),
    updatedAt: daysFromNow(-10),
  },
  {
    id: doctorIds.doctor3,
    userId: userIds.doctor3,
    clerkUserId: "user_2ghi789jkl012",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: new EmailAddress("dr.maria.rodriguez@carepulse.com"), 
    specialization: "Pediatric Physiotherapy",
    isActive: true,
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-3),
  }
];

// Sample patients with realistic profiles - using random IDs for security
export const seedPatients: Array<Patient & { id: string; userId: string }> = [
  {
    id: patientIds.patient1,
    userId: userIds.patient1,
    clerkUserId: "user_2mno345pqr678",
    firstName: "John",
    lastName: "Doe",
    email: new EmailAddress("john.doe@email.com"),
    phone: new PhoneNumber("+65 9123 4567"),
    dateOfBirth: new Date("1985-03-15"),
    address: "123 Orchard Road, Singapore 238863",
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-2),
  },
  {
    id: patientIds.patient2,
    userId: userIds.patient2,
    clerkUserId: "user_2stu901vwx234", 
    firstName: "Emily",
    lastName: "Tan",
    email: new EmailAddress("emily.tan@gmail.com"),
    phone: new PhoneNumber("+65 8234 5678"),
    dateOfBirth: new Date("1992-07-22"),
    address: "456 Marina Bay, Singapore 018956",
    createdAt: daysFromNow(-12),
    updatedAt: daysFromNow(-1),
  },
  {
    id: patientIds.patient3,
    userId: userIds.patient3,
    clerkUserId: "user_2yza567bcd890",
    firstName: "Michael", 
    lastName: "Lee",
    email: new EmailAddress("michael.lee@hotmail.com"),
    phone: new PhoneNumber("+65 9345 6789"),
    dateOfBirth: new Date("1978-11-08"),
    address: "789 Sentosa Cove, Singapore 098234",
    createdAt: daysFromNow(-8),
    updatedAt: daysFromNow(-4),
  },
  {
    id: patientIds.patient4,
    userId: userIds.patient4,
    clerkUserId: "user_2efg123hij456",
    firstName: "Lisa",
    lastName: "Wong",
    email: new EmailAddress("lisa.wong@yahoo.com"), 
    phone: new PhoneNumber("+65 8456 7890"),
    dateOfBirth: new Date("1995-01-30"),
    address: "321 Clarke Quay, Singapore 179024",
    createdAt: daysFromNow(-6),
    updatedAt: daysFromNow(-1),
  },
  {
    id: patientIds.patient5,
    userId: userIds.patient5,
    clerkUserId: "user_2klm789nop012",
    firstName: "David",
    lastName: "Kumar", 
    email: new EmailAddress("david.kumar@live.com"),
    phone: new PhoneNumber("+65 9567 8901"),
    dateOfBirth: new Date("1988-09-12"),
    address: "654 Tanjong Pagar, Singapore 088537",
    createdAt: daysFromNow(-4),
    updatedAt: hoursFromNow(-6),
  }
];

// Pre-generate appointment IDs for consistent references
const appointmentIds = {
  appt1: createAppointmentId(),
  appt2: createAppointmentId(),
  appt3: createAppointmentId(),
  appt4: createAppointmentId(),
  appt5: createAppointmentId(),
  appt6: createAppointmentId(),
  appt7: createAppointmentId(),
};

// Sample appointments showing various states and scenarios
export const seedAppointments: Array<Appointment & { id: string }> = [
  // Past completed appointments
  {
    id: appointmentIds.appt1,
    patientId: seedPatients[0]!.id,
    doctorId: seedDoctors[0]!.id,
    type: AppointmentType.CHECK_UP,
    status: AppointmentStatus.COMPLETED,
    scheduledDateTime: daysFromNow(-3),
    duration: new AppointmentDuration(30),
    reasonForVisit: "Regular physiotherapy session for lower back pain",
    notes: "Patient showed good improvement. Recommended home exercises.",
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-3),
  },
  {
    id: appointmentIds.appt2,
    patientId: seedPatients[1]!.id,
    doctorId: seedDoctors[1]!.id,
    type: AppointmentType.FIRST_CONSULT,
    status: AppointmentStatus.COMPLETED,
    scheduledDateTime: daysFromNow(-5),
    duration: new AppointmentDuration(90),
    reasonForVisit: "Sports injury assessment - knee pain after running",
    notes: "Initial assessment complete. Prescribed strengthening exercises.",
    createdAt: daysFromNow(-7),
    updatedAt: daysFromNow(-5),
  },

  // Today's appointments
  {
    id: appointmentIds.appt3,
    patientId: seedPatients[2]!.id,
    doctorId: seedDoctors[0]!.id,
    type: AppointmentType.FOLLOW_UP,
    status: AppointmentStatus.SCHEDULED,
    scheduledDateTime: hoursFromNow(2), // 2 hours from now
    duration: new AppointmentDuration(45),
    reasonForVisit: "Follow-up for shoulder rehabilitation",
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-1),
  },
  {
    id: appointmentIds.appt4,
    patientId: seedPatients[3]!.id,
    doctorId: seedDoctors[1]!.id,
    type: AppointmentType.CHECK_UP,
    status: AppointmentStatus.IN_PROGRESS,
    scheduledDateTime: hoursFromNow(-0.5), // Started 30 minutes ago
    duration: new AppointmentDuration(60),
    reasonForVisit: "Regular treatment for chronic pain management",
    createdAt: daysFromNow(-4),
    updatedAt: hoursFromNow(-0.5),
  },

  // Future appointments
  {
    id: appointmentIds.appt5,
    patientId: seedPatients[4]!.id,
    doctorId: seedDoctors[2]!.id,
    type: AppointmentType.FIRST_CONSULT,
    status: AppointmentStatus.SCHEDULED,
    scheduledDateTime: daysFromNow(2),
    duration: new AppointmentDuration(90),
    reasonForVisit: "Initial consultation for pediatric assessment",
    createdAt: hoursFromNow(-12),
    updatedAt: hoursFromNow(-12),
  },
  {
    id: appointmentIds.appt6,
    patientId: seedPatients[0]!.id,
    doctorId: seedDoctors[0]!.id,
    type: AppointmentType.FOLLOW_UP,
    status: AppointmentStatus.SCHEDULED,
    scheduledDateTime: daysFromNow(5),
    duration: new AppointmentDuration(45),
    reasonForVisit: "Continued treatment for lower back recovery",
    createdAt: daysFromNow(-1),
    updatedAt: daysFromNow(-1),
  },

  // Some cancelled appointments (realistic scenarios)
  {
    id: appointmentIds.appt7,
    patientId: seedPatients[1]!.id,
    doctorId: seedDoctors[0]!.id,
    type: AppointmentType.CHECK_UP,
    status: AppointmentStatus.CANCELLED,
    scheduledDateTime: daysFromNow(1),
    duration: new AppointmentDuration(30),
    reasonForVisit: "Regular session - cancelled due to scheduling conflict",
    createdAt: daysFromNow(-2),
    updatedAt: hoursFromNow(-6),
  }
];

// Helper function to generate additional random appointments if needed
export const generateRandomAppointment = (
  patientId: string,
  doctorId: string,
  daysInFuture: number
): Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> => {
  const appointmentTypes = [
    AppointmentType.CHECK_UP,
    AppointmentType.FOLLOW_UP,
    AppointmentType.FIRST_CONSULT
  ];
  
  const reasons = [
    "Regular physiotherapy session",
    "Pain management consultation", 
    "Post-injury rehabilitation",
    "Preventive care assessment",
    "Treatment progress review"
  ];
  
  const randomType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)]!;
  const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
  
  return createAppointment(
    patientId as any, // Type conversion for seed data
    doctorId as any,
    daysFromNow(daysInFuture),
    randomType,
    randomReason
  );
};

// Export IDs for frontend demo usage
export const demoIds = {
  // John Doe - first patient for demo
  johnDoePatientId: patientIds.patient1,
  johnDoeUserId: userIds.patient1,
  
  // Sarah Chen - first doctor for demo
  sarahChenDoctorId: doctorIds.doctor1,
  sarahChenUserId: userIds.doctor1,
  
  // All IDs for reference
  patientIds,
  doctorIds,
  userIds,
  appointmentIds,
};

// Summary for development/testing
export const seedDataSummary = {
  doctors: seedDoctors.length,
  patients: seedPatients.length,
  appointments: seedAppointments.length,
  appointmentsByStatus: {
    scheduled: seedAppointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
    inProgress: seedAppointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS).length,
    completed: seedAppointments.filter(a => a.status === AppointmentStatus.COMPLETED).length,
    cancelled: seedAppointments.filter(a => a.status === AppointmentStatus.CANCELLED).length,
  }
};