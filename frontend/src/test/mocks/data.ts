import { Patient, Doctor, Appointment, AppointmentWithDetails } from '@/lib/api-types'

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'PATIENT' as const,
  phoneNumber: '+6512345678',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockPatient = (overrides = {}): Patient => ({
  id: 'patient_123' as any,
  userId: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'MALE' as const,
  phoneNumber: '+6512345678',
  email: 'john.doe@example.com',
  address: '123 Main St, Singapore 123456',
  nric: 'S1234567A',
  allergies: [],
  emergencyContact: {
    name: 'Jane Doe',
    phoneNumber: '+6587654321',
    relationship: 'Spouse',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockDoctor = (overrides = {}): Doctor => ({
  id: 'doctor_123' as any,
  userId: 'user_456',
  firstName: 'Sarah',
  lastName: 'Smith',
  specialization: 'General Practice',
  licenseNumber: 'M12345',
  phoneNumber: '+6598765432',
  email: 'dr.smith@clinic.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockAppointment = (overrides = {}): Appointment => ({
  id: 'appointment_123' as any,
  patientId: 'patient_123' as any,
  doctorId: 'doctor_123' as any,
  scheduledDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
  durationMinutes: 30,
  type: 'CONSULTATION' as const,
  status: 'SCHEDULED' as const,
  reasonForVisit: 'Regular checkup',
  notes: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockAppointmentWithDetails = (overrides = {}): AppointmentWithDetails => ({
  ...createMockAppointment(),
  patient: createMockPatient(),
  doctor: createMockDoctor(),
  ...overrides,
})

// Mock database collections
export const mockPatients = [
  createMockPatient(),
  createMockPatient({
    id: 'patient_456',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    nric: 'S2345678B',
  }),
  createMockPatient({
    id: 'patient_789',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob.wilson@example.com',
    nric: 'S3456789C',
    gender: 'MALE',
  }),
]

export const mockDoctors = [
  createMockDoctor(),
  createMockDoctor({
    id: 'doctor_456',
    firstName: 'Michael',
    lastName: 'Chen',
    specialization: 'Cardiology',
    licenseNumber: 'M54321',
    email: 'dr.chen@clinic.com',
  }),
  createMockDoctor({
    id: 'doctor_789',
    firstName: 'Lisa',
    lastName: 'Wang',
    specialization: 'Pediatrics',
    licenseNumber: 'M67890',
    email: 'dr.wang@clinic.com',
  }),
]

export const mockAppointments = [
  createMockAppointment(),
  createMockAppointment({
    id: 'appointment_456',
    patientId: 'patient_456',
    doctorId: 'doctor_456',
    status: 'IN_PROGRESS',
    scheduledDateTime: new Date().toISOString(), // Now
  }),
  createMockAppointment({
    id: 'appointment_789',
    patientId: 'patient_789',
    doctorId: 'doctor_123',
    status: 'COMPLETED',
    scheduledDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  }),
]

// Helper to find mock data
export const findMockPatient = (id: string) => mockPatients.find(p => p.id === id)
export const findMockDoctor = (id: string) => mockDoctors.find(d => d.id === id)
export const findMockAppointment = (id: string) => mockAppointments.find(a => a.id === id)