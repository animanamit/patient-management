import { Doctor } from "@domain/entities/doctor";
import { DoctorId, EmailAddress } from "@domain/entities/shared-types";

export type RepositoryError = {
  type: "NotFound" | "ValidationError" | "ConflictError" | "DatabaseError";
  message: string;
  details?: Record<string, any>;
};

export type RepositoryResult<T> =
  | { success: true; data: T }
  | { success: false; error: RepositoryError };

export type DoctorUpdateData = Partial<
  Pick<
    Doctor,
    "firstName" | "lastName" | "email" | "specialization" | "isActive"
  >
>;

export interface DoctorFilters {
  specialization?: string;
  isActive?: boolean;
  email?: EmailAddress;
}

export interface IDoctorRepository {
  create(
    doctorData: Omit<Doctor, "id" | "createdAt" | "updatedAt">
  ): Promise<RepositoryResult<Doctor>>;
  findById(id: DoctorId): Promise<RepositoryResult<Doctor>>;
  delete(id: DoctorId): Promise<RepositoryResult<void>>;
  findBySpecialization(
    specialization: string
  ): Promise<RepositoryResult<Doctor[]>>;
  findActiveDoctors(): Promise<RepositoryResult<Doctor[]>>;
  findByClerkUserId(clerkUserId: string): Promise<RepositoryResult<Doctor>>;
  update(
    id: DoctorId,
    updateData: DoctorUpdateData
  ): Promise<RepositoryResult<Doctor>>;
  count(filters?: DoctorFilters): Promise<RepositoryResult<number>>;
}
