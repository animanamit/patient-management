import {
  AppointmentDuration,
  AppointmentId,
  AppointmentStatus,
  AppointmentType,
  DoctorId,
  PatientId,
} from "@domain/entities/shared-types";
import { Appointment } from "@domain/entities/appointment";

export type RepositoryError = {
  type: "NotFound" | "ValidationError" | "ConflictError" | "DatabaseError";
  message: string;
  details?: Record<string, any>;
};

// Result types for error handling (Session 2 requirement)
export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: RepositoryError };

export interface AppointmentFilters {
  patientId?: PatientId;
  doctorId?: DoctorId;
  status?: AppointmentStatus;
  type?: AppointmentType;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
}

export type AppointmentUpdateData = Partial<
  Pick<
    Appointment,
    "status" | "scheduledDateTime" | "duration" | "reasonForVisit"
  >
>;

export interface IAppointmentRepository {
  create(
    appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">
  ): Promise<RepositoryResult<Appointment>>;
  findById(id: AppointmentId): Promise<RepositoryResult<Appointment>>;
  update(
    id: AppointmentId,
    updateData: AppointmentUpdateData
  ): Promise<RepositoryResult<Appointment>>;
  delete(id: AppointmentId): Promise<RepositoryResult<void>>;
  findByDoctorId(id: DoctorId): Promise<RepositoryResult<Appointment[]>>;
  findByPatientId(id: PatientId): Promise<RepositoryResult<Appointment[]>>;
  checkScheduleConflict(
    doctorId: DoctorId,
    scheduledDateTime: Date,
    duration: AppointmentDuration
  ): Promise<boolean>;
  updateStatus(
    id: AppointmentId,
    newStatus: AppointmentStatus
  ): Promise<RepositoryResult<Appointment>>;
  count(filters?: AppointmentFilters): Promise<RepositoryResult<number>>;
}
