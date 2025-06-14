/**
 * PATIENT REPOSITORY INTERFACE
 *
 * This interface defines the application will interact with patient data,
 * without being tied to any specific database technology (Prisma, MongoDB, etc.).
 *
 * Following Session 2 requirements:
 * - Returns domain entities, not database records
 * - Uses branded types for all IDs
 * - Returns meaningful errors for business rule violations
 * - Supports the core operations from your PRD
 */

import { Patient } from "@domain/entities/patient";
import {
  PatientId,
  EmailAddress,
  PhoneNumber,
} from "@domain/entities/shared-types";

// Result types for error handling (Session 2 requirement)
export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: RepositoryError };

export type RepositoryError = {
  type: "NotFound" | "ValidationError" | "ConflictError" | "DatabaseError";
  message: string;
  details?: Record<string, any>;
};

// Patient-specific query filters
export interface PatientFilters {
  email?: EmailAddress;
  phone?: PhoneNumber;
  clerkUserId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Update data type (partial patient data)
export type PatientUpdateData = Partial<
  Pick<Patient, "firstName" | "lastName" | "email" | "phone" | "address">
>;

/**
 * Patient Repository Interface - EXAMPLE IMPLEMENTATION
 *
 * This interface abstracts all patient data operations.
 * Your business logic will depend on this interface, not on Prisma directly.
 *
 * TODO: After studying this example, create similar interfaces for:
 * - appointment-repository.ts (handles appointment CRUD + scheduling logic)
 * - doctor-repository.ts (handles doctor CRUD + availability checking)
 * - index.ts (exports all interfaces cleanly)
 */
export interface IPatientRepository {
  // Basic CRUD Operations

  /**
   * Create a new patient
   * Returns ConflictError if email or phone already exists
   */
  create(
    patientData: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ): Promise<RepositoryResult<Patient>>;

  /**
   * Find patient by ID
   * Returns NotFound if patient doesn't exist
   */
  findById(id: PatientId): Promise<RepositoryResult<Patient>>;

  /**
   * Update patient information
   * Returns NotFound if patient doesn't exist
   * Returns ConflictError if email/phone conflicts with another patient
   */
  update(
    id: PatientId,
    updateData: PatientUpdateData
  ): Promise<RepositoryResult<Patient>>;

  /**
   * Delete a patient (soft delete recommended for healthcare data)
   * Returns NotFound if patient doesn't exist
   */
  delete(id: PatientId): Promise<RepositoryResult<void>>;

  // Domain-Specific Queries (supporting your PRD requirements)

  /**
   * Find patient by Clerk user ID (for authentication integration)
   * Returns NotFound if no patient is linked to this Clerk user
   */
  findByClerkUserId(clerkUserId: string): Promise<RepositoryResult<Patient>>;

  /**
   * Find patient by email address
   * Returns NotFound if no patient has this email
   */
  findByEmail(email: EmailAddress): Promise<RepositoryResult<Patient>>;

  /**
   * Find patient by phone number
   * Returns NotFound if no patient has this phone
   */
  findByPhone(phone: PhoneNumber): Promise<RepositoryResult<Patient>>;

  /**
   * Check if email is already registered
   * Useful for validation before creating new patients
   */
  emailExists(email: EmailAddress): Promise<boolean>;

  /**
   * Check if phone number is already registered
   * Useful for validation before creating new patients
   */
  phoneExists(phone: PhoneNumber): Promise<boolean>;

  /**
   * Find multiple patients with filtering
   * Supports pagination for performance
   */
  findMany(
    filters?: PatientFilters,
    pagination?: {
      limit: number;
      offset: number;
    }
  ): Promise<
    RepositoryResult<{
      patients: Patient[];
      totalCount: number;
    }>
  >;

  /**
   * Get total count of patients (for dashboard statistics)
   */
  count(filters?: PatientFilters): Promise<RepositoryResult<number>>;
}
