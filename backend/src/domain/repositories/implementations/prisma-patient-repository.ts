/**
 * PRISMA PATIENT REPOSITORY IMPLEMENTATION
 * 
 * This class implements the IPatientRepository interface using Prisma ORM.
 * It translates the domain operations into actual database queries.
 */

import { PrismaClient } from '@prisma/client';
import { Patient } from '@domain/entities/patient';
import { 
  PatientId, 
  EmailAddress, 
  PhoneNumber,
  createPatientId
} from '@domain/entities/shared-types';
import { 
  IPatientRepository, 
  RepositoryResult, 
  RepositoryError,
  PatientFilters,
  PatientUpdateData 
} from '@domain/repositories/interfaces';

export class PrismaPatientRepository implements IPatientRepository {
  constructor(private prisma: PrismaClient) {}

  async create(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResult<Patient>> {
    try {
      // Check for existing email or phone
      const existingPatient = await this.prisma.patient.findFirst({
        where: {
          OR: [
            { email: patientData.email.getValue() },
            { phone: patientData.phone.getValue() }
          ]
        }
      });

      if (existingPatient) {
        return {
          success: false,
          error: {
            type: 'ConflictError',
            message: 'Patient with this email or phone already exists',
            details: { 
              email: patientData.email.getValue(), 
              phone: patientData.phone.getValue() 
            }
          }
        };
      }

      // Create the patient
      const createdPatient = await this.prisma.patient.create({
        data: {
          clerkUserId: patientData.clerkUserId,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email.getValue(),
          phone: patientData.phone.getValue(),
          address: patientData.address,
          dateOfBirth: patientData.dateOfBirth,
          gender: patientData.gender,
          emergencyContactName: patientData.emergencyContactName,
          emergencyContactPhone: patientData.emergencyContactPhone?.getValue(),
        }
      });

      // Transform Prisma result to domain entity
      const patient: Patient = {
        id: createPatientId(createdPatient.id),
        clerkUserId: createdPatient.clerkUserId,
        firstName: createdPatient.firstName,
        lastName: createdPatient.lastName,
        email: new EmailAddress(createdPatient.email),
        phone: new PhoneNumber(createdPatient.phone),
        address: createdPatient.address,
        dateOfBirth: createdPatient.dateOfBirth,
        gender: createdPatient.gender as Patient['gender'],
        emergencyContactName: createdPatient.emergencyContactName,
        emergencyContactPhone: createdPatient.emergencyContactPhone 
          ? new PhoneNumber(createdPatient.emergencyContactPhone) 
          : undefined,
        createdAt: createdPatient.createdAt,
        updatedAt: createdPatient.updatedAt,
      };

      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findById(id: PatientId): Promise<RepositoryResult<Patient>> {
    try {
      const prismaPatient = await this.prisma.patient.findUnique({
        where: { id: id as string }
      });

      if (!prismaPatient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with ID ${id} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaPatient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByEmail(email: EmailAddress): Promise<RepositoryResult<Patient>> {
    try {
      const prismaPatient = await this.prisma.patient.findUnique({
        where: { email: email.getValue() }
      });

      if (!prismaPatient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with email ${email.getValue()} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaPatient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: PatientId, updateData: PatientUpdateData): Promise<RepositoryResult<Patient>> {
    try {
      // Check if patient exists
      const existingPatient = await this.prisma.patient.findUnique({
        where: { id: id as string }
      });

      if (!existingPatient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with ID ${id} not found`
          }
        };
      }

      // Prepare update data
      const prismaUpdateData: any = {};
      if (updateData.firstName) prismaUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) prismaUpdateData.lastName = updateData.lastName;
      if (updateData.email) prismaUpdateData.email = updateData.email.getValue();
      if (updateData.phone) prismaUpdateData.phone = updateData.phone.getValue();
      if (updateData.address) prismaUpdateData.address = updateData.address;

      const updatedPatient = await this.prisma.patient.update({
        where: { id: id as string },
        data: prismaUpdateData
      });

      const patient = this.transformPrismaToPatient(updatedPatient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: PatientId): Promise<RepositoryResult<void>> {
    try {
      await this.prisma.patient.delete({
        where: { id: id as string }
      });

      return { success: true, data: undefined };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByClerkUserId(clerkUserId: string): Promise<RepositoryResult<Patient>> {
    try {
      const prismaPatient = await this.prisma.patient.findUnique({
        where: { clerkUserId }
      });

      if (!prismaPatient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with Clerk user ID ${clerkUserId} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaPatient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByPhone(phone: PhoneNumber): Promise<RepositoryResult<Patient>> {
    try {
      const prismaPatient = await this.prisma.patient.findUnique({
        where: { phone: phone.getValue() }
      });

      if (!prismaPatient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with phone ${phone.getValue()} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaPatient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async emailExists(email: EmailAddress): Promise<boolean> {
    try {
      const count = await this.prisma.patient.count({
        where: { email: email.getValue() }
      });
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  async phoneExists(phone: PhoneNumber): Promise<boolean> {
    try {
      const count = await this.prisma.patient.count({
        where: { phone: phone.getValue() }
      });
      return count > 0;
    } catch (error) {
      return false;
    }
  }

  async findMany(
    filters?: PatientFilters,
    pagination?: { limit: number; offset: number }
  ): Promise<RepositoryResult<{ patients: Patient[]; totalCount: number }>> {
    try {
      // Build where clause
      const where: any = {};
      if (filters?.email) where.email = filters.email.getValue();
      if (filters?.phone) where.phone = filters.phone.getValue();
      if (filters?.clerkUserId) where.clerkUserId = filters.clerkUserId;
      if (filters?.createdAfter) where.createdAt = { gte: filters.createdAfter };
      if (filters?.createdBefore) {
        where.createdAt = { 
          ...where.createdAt, 
          lte: filters.createdBefore 
        };
      }

      const [patients, totalCount] = await Promise.all([
        this.prisma.patient.findMany({
          where,
          skip: pagination?.offset,
          take: pagination?.limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.patient.count({ where })
      ]);

      const transformedPatients = patients.map(this.transformPrismaToPatient.bind(this));

      return {
        success: true,
        data: {
          patients: transformedPatients,
          totalCount
        }
      };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async count(filters?: PatientFilters): Promise<RepositoryResult<number>> {
    try {
      const where: any = {};
      if (filters?.email) where.email = filters.email.getValue();
      if (filters?.phone) where.phone = filters.phone.getValue();
      if (filters?.clerkUserId) where.clerkUserId = filters.clerkUserId;

      const count = await this.prisma.patient.count({ where });
      return { success: true, data: count };

    } catch (error) {
      return this.handleError(error);
    }
  }

  // Private helper methods
  private transformPrismaToPatient(prismaPatient: any): Patient {
    return {
      id: createPatientId(prismaPatient.id),
      clerkUserId: prismaPatient.clerkUserId,
      firstName: prismaPatient.firstName,
      lastName: prismaPatient.lastName,
      email: new EmailAddress(prismaPatient.email),
      phone: new PhoneNumber(prismaPatient.phone),
      address: prismaPatient.address,
      dateOfBirth: prismaPatient.dateOfBirth,
      gender: prismaPatient.gender,
      emergencyContactName: prismaPatient.emergencyContactName,
      emergencyContactPhone: prismaPatient.emergencyContactPhone 
        ? new PhoneNumber(prismaPatient.emergencyContactPhone) 
        : undefined,
      createdAt: prismaPatient.createdAt,
      updatedAt: prismaPatient.updatedAt,
    };
  }

  private handleError(error: any): RepositoryResult<any> {
    console.error('Patient repository error:', error);
    
    return {
      success: false,
      error: {
        type: 'DatabaseError',
        message: 'An unexpected database error occurred',
        details: { originalError: error.message }
      }
    };
  }
}