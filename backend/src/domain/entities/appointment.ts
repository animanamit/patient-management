/**
 * APPOINTMENT ENTITY
 *
 * - Patients can book appointments
 * - Staff can manage appointments
 * - Doctors can see their schedule
 * - Simple appointment lifecycle (scheduled → in_progress → completed → cancelled)
 */

import {
  AppointmentId,
  PatientId,
  DoctorId,
  AppointmentStatus,
  AppointmentType,
  AppointmentDuration,
} from "./shared-types";

// Simple Appointment entity focused on PRD requirements
export interface Appointment {
  readonly id: AppointmentId;

  // Core relationships
  readonly patientId: PatientId;
  readonly doctorId: DoctorId;

  // Appointment details
  type: AppointmentType;
  status: AppointmentStatus;

  // Scheduling
  scheduledDateTime: Date;
  duration: AppointmentDuration;

  // Optional information
  reasonForVisit?: string;
  notes?: string; // Can be updated by doctor during/after appointment

  // System fields
  createdAt: Date;
  updatedAt: Date;
}

// Simple appointment creation - focused on scheduling needs
export const createAppointment = (
  patientId: PatientId,
  doctorId: DoctorId,
  scheduledDateTime: Date,
  type: AppointmentType,
  reasonForVisit?: string
): Omit<Appointment, "id" | "createdAt" | "updatedAt"> => {
  const result: Omit<Appointment, "id" | "createdAt" | "updatedAt"> = {
    patientId,
    doctorId,
    type,
    status: AppointmentStatus.SCHEDULED,
    scheduledDateTime,
    duration: AppointmentDuration.forAppointmentType(type),
  };
  
  if (reasonForVisit) {
    result.reasonForVisit = reasonForVisit.trim();
  }
  
  return result;
};

// Helper functions for appointment management
export const canTransitionTo = (
  currentStatus: AppointmentStatus,
  newStatus: AppointmentStatus
): boolean => {
  const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    [AppointmentStatus.SCHEDULED]: [
      AppointmentStatus.IN_PROGRESS,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.IN_PROGRESS]: [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.COMPLETED]: [], // Final state
    [AppointmentStatus.CANCELLED]: [], // Final state
    [AppointmentStatus.NO_SHOW]: [], // Final state
  };

  const transitions = validTransitions[currentStatus];
  return transitions ? transitions.includes(newStatus) : false;
};

export const isAppointmentToday = (appointment: Appointment): boolean => {
  const today = new Date();
  const appointmentDate = new Date(appointment.scheduledDateTime);

  return (
    today.getFullYear() === appointmentDate.getFullYear() &&
    today.getMonth() === appointmentDate.getMonth() &&
    today.getDate() === appointmentDate.getDate()
  );
};

export const getAppointmentTimeSlot = (appointment: Appointment): string => {
  const start = new Date(appointment.scheduledDateTime);
  const end = appointment.duration.calculateEndTime(start);

  return `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} - ${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
};
