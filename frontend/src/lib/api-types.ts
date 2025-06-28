// API Response Types based on backend schemas

export type PatientId = string;
export type DoctorId = string;
export type AppointmentId = string;

export type AppointmentStatus = 
  | "SCHEDULED" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "NO_SHOW";

export type AppointmentType = 
  | "FIRST_CONSULT" 
  | "CHECK_UP" 
  | "FOLLOW_UP";

// Patient Types
export interface Patient {
  id: PatientId;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string | { normalizedValue: string };
  phone: string | { normalizedValue: string };
  dateOfBirth: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PatientQueryParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  limit?: number;
  offset?: number;
}

export interface PatientsResponse {
  patients: Patient[];
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Doctor Types
export interface Doctor {
  id: DoctorId;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDoctorRequest {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  isActive: boolean;
}

export interface UpdateDoctorRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  specialization?: string;
  isActive?: boolean;
}

export interface DoctorQueryParams {
  isActive?: string;
  specialization?: string;
  search?: string;
  firstName?: string;
  lastName?: string;
}

export interface DoctorsResponse {
  doctors: Doctor[];
}

// Appointment Types
export interface Appointment {
  id: AppointmentId;
  patientId: PatientId;
  doctorId: DoctorId;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledDateTime: string;
  durationMinutes: number;
  reasonForVisit?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient: {
    id: PatientId;
    firstName: string;
    lastName: string;
    email: string | { normalizedValue: string };
    phone: string | { normalizedValue: string };
  };
  doctor: {
    id: DoctorId;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
  };
}

export interface CreateAppointmentRequest {
  patientId: PatientId;
  doctorId: DoctorId;
  type: AppointmentType;
  scheduledDateTime: string;
  durationMinutes?: number;
  reasonForVisit?: string;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  type?: AppointmentType;
  status?: AppointmentStatus;
  scheduledDateTime?: string;
  durationMinutes?: number;
  reasonForVisit?: string;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

export interface AppointmentQueryParams {
  patientId?: PatientId;
  doctorId?: DoctorId;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
  limit?: string;
  offset?: string;
}

export interface AppointmentsResponse {
  appointments: Appointment[] | AppointmentWithDetails[];
  message?: string;
}

// API Error Types
export interface ApiError {
  error: string;
  details?: any;
}

// API Response Wrappers
export interface PatientApiResponse {
  patient: Patient;
}

export interface DoctorApiResponse {
  doctor: Doctor;
}

export interface AppointmentApiResponse {
  appointment: Appointment | AppointmentWithDetails;
}