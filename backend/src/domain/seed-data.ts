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
  AppointmentStatus,
  AppointmentType,
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

// Sample doctors for the clinic
export const seedDoctors: Array<Doctor & { id: string }> = [
  {
    id: createDoctorId("doctor_dr_sarah_chen"),
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
    id: createDoctorId("doctor_dr_james_wilson"),
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
    id: createDoctorId("doctor_dr_maria_rodriguez"),
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

// Sample patients with realistic profiles
export const seedPatients: Array<Patient & { id: string }> = [
  {
    id: createPatientId("patient_john_doe_123"),
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
    id: createPatientId("patient_emily_tan_456"),
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
    id: createPatientId("patient_michael_lee_789"),
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
    id: createPatientId("patient_lisa_wong_321"),
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
    id: createPatientId("patient_david_kumar_654"),
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

// Sample appointments showing various states and scenarios
export const seedAppointments: Array<Appointment & { id: string }> = [
  // Past completed appointments
  {
    id: createAppointmentId("appt_past_completed_001"),
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
    id: createAppointmentId("appt_past_completed_002"),
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
    id: createAppointmentId("appt_today_scheduled_001"),
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
    id: createAppointmentId("appt_today_in_progress_001"),
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
    id: createAppointmentId("appt_future_scheduled_001"),
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
    id: createAppointmentId("appt_future_scheduled_002"),
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
    id: createAppointmentId("appt_cancelled_001"),
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