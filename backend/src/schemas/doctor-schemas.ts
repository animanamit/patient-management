import { z } from "zod";
import { createDoctorId } from "@domain/entities/shared-types";

export const DoctorIdParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .refine(
      (id) => {
        try {
          createDoctorId(id);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Invalid doctor ID format. Expected: doctor_<alphanumeric>",
      }
    ),
});

export const EmailSchema = z.string().email("Invalid email format!");

export const CreateDoctorSchema = z.object({
  clerkUserId: z.string().min(1, "Clerk user ID is required"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required!").max(50),
  isActive: z.boolean(),
  specialization: z.string().optional(),
});

export const UpdateDoctorSchema = CreateDoctorSchema.partial().omit({
  clerkUserId: true,
});

export const DoctorQuerySchema = z.object({
  isActive: z.string().optional(),
  specialization: z.string().optional(),
  search: z.string().optional(), // For searching by name
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type DoctorQueryParams = z.infer<typeof DoctorQuerySchema>;

export const DoctorResponseSchema = z.object({
  id: z.string(),
  clerkUserId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  specialization: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// if including appointments
export const DoctorWithAppointmentsSchema = DoctorResponseSchema.extend({
  appointments: z
    .array(
      z.object({
        id: z.string(),
        scheduledDateTime: z.date(),
        status: z.enum([
          "SCHEDULED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
          "NO_SHOW",
        ]),
        type: z.enum(["FIRST_CONSULT", "CHECK_UP", "FOLLOW_UP"]),
      })
    )
    .optional(),
});

export type CreateDoctorRequest = z.infer<typeof CreateDoctorSchema>;
export type DoctorIdParam = z.infer<typeof DoctorIdParamSchema>;
export type UpdateDoctorRequest = z.infer<typeof UpdateDoctorSchema>;
export type DoctorResponse = z.infer<typeof DoctorResponseSchema>;
export type DoctorWithAppointmentsResponse = z.infer<
  typeof DoctorWithAppointmentsSchema
>;
