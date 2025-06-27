import { z } from "zod";
import { createAppointmentId } from "@domain/entities/shared-types";

// Appointment ID parameter validation
export const AppointmentIdParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .refine(
      (id) => {
        try {
          createAppointmentId(id);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Invalid appointment ID format. Expected: appt_<alphanumeric>",
      }
    ),
});

// Create appointment schema
export const CreateAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  type: z.enum(["FIRST_CONSULT", "CHECK_UP", "FOLLOW_UP"]),
  scheduledDateTime: z.string().datetime("Invalid date format"),
  durationMinutes: z.number().min(30).max(180).default(60),
  reasonForVisit: z.string().optional(),
  notes: z.string().optional(),
});

// Update appointment schema
export const UpdateAppointmentSchema = CreateAppointmentSchema.partial().omit({
  patientId: true,
  doctorId: true,
});

// Update appointment status only
export const UpdateAppointmentStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

// Query parameters for filtering appointments
export const AppointmentQuerySchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  type: z.enum(["FIRST_CONSULT", "CHECK_UP", "FOLLOW_UP"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

// Response schemas
export const AppointmentResponseSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  type: z.enum(["FIRST_CONSULT", "CHECK_UP", "FOLLOW_UP"]),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  scheduledDateTime: z.date(),
  durationMinutes: z.number(),
  reasonForVisit: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Appointment with patient and doctor details
export const AppointmentWithDetailsSchema = AppointmentResponseSchema.extend({
  patient: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  doctor: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    specialization: z.string().nullable(),
  }),
});

// Type exports
export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentSchema>;
export type UpdateAppointmentStatusRequest = z.infer<typeof UpdateAppointmentStatusSchema>;
export type AppointmentQueryParams = z.infer<typeof AppointmentQuerySchema>;
export type AppointmentIdParam = z.infer<typeof AppointmentIdParamSchema>;
export type AppointmentResponse = z.infer<typeof AppointmentResponseSchema>;
export type AppointmentWithDetailsResponse = z.infer<typeof AppointmentWithDetailsSchema>;