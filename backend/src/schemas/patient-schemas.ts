import { createPatientId } from "@domain/entities/shared-types";
import { z } from "zod";

export const PatientIdParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .refine(
      (id) => {
        try {
          createPatientId(id); // Use the actual domain validation
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Invalid patient ID format. Expected: patient_<alphanumeric>",
      }
    ),
});

export const EmailSchema = z.string().email("Invalid email format!");
export const PhoneSchema = z
  .string()
  .regex(
    /^(?:\+65[\s-]?)?[689]\d{3}[\s-]?\d{4}$/,
    "Invalid Singapore phone number"
  );

export const CreatePatientSchema = z.object({
  clerkUserId: z.string().min(1, "Clerk user ID is required"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required!").max(50),
  email: EmailSchema,
  phone: PhoneSchema,
  dateOfBirth: z.string().datetime("Invalid date format"),
  address: z.string().optional(),
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const PatientQuerySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export type CreatePatientRequest = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientRequest = z.infer<typeof UpdatePatientSchema>;
export type PatientQueryParams = z.infer<typeof PatientQuerySchema>;
export type PatientIdParam = z.infer<typeof PatientIdParamSchema>;
