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
  emergencyContact?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
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
    dateOfBirth?: string;
    address?: string;
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
  doctorId?: DoctorId;
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
  appointments: AppointmentWithDetails[];
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
  appointment: AppointmentWithDetails;
}

// Document Types (for future implementation)
export type DocumentId = string;
export type DocumentType = "LAB" | "IMG" | "RX" | "REPORT" | "OTHER";
export type DocumentStatus = "PENDING" | "COMPLETE" | "ACTIVE" | "EXPIRED";

export interface MedicalDocument {
  id: DocumentId;
  patientId: PatientId;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  patientId: PatientId;
  name: string;
  type: DocumentType;
  file?: File;
}

export interface DocumentQueryParams {
  patientId?: PatientId;
  type?: DocumentType;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}

export interface DocumentsResponse {
  documents: MedicalDocument[];
  totalCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface DocumentApiResponse {
  document: MedicalDocument;
}