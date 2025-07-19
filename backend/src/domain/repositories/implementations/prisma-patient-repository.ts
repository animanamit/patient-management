/**
 * PRISMA PATIENT REPOSITORY IMPLEMENTATION
 * 
 * This class implements the IPatientRepository interface using Prisma ORM.
 * It translates the domain operations into actual database queries.
 * Works with the User/Patient relational schema.
 */

import { prisma } from '../../../config/database.js';
import { Patient } from '../../entities/patient.js';
import { 
  PatientId, 
  EmailAddress, 
  PhoneNumber,
  createPatientId,
  createUserId
} from '../../entities/shared-types.js';
import { 
  IPatientRepository, 
  RepositoryResult, 
  PatientFilters,
  PatientUpdateData 
} from '../interfaces/index.js';

export class PrismaPatientRepository implements IPatientRepository {
  private prisma = prisma;

  async create(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResult<Patient>> {
    try {
      // Check for existing email or phone in User table
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: patientData.email.getValue() },
            { clerkUserId: patientData.clerkUserId }
          ]
        }
      });

      if (existingUser) {
        return {
          success: false,
          error: {
            type: 'ConflictError',
            message: 'User with this email or clerk ID already exists',
            details: { 
              email: patientData.email.getValue(), 
              clerkUserId: patientData.clerkUserId 
            }
          }
        };
      }

      // Create user with patient in a transaction
      const userId = createUserId();
      const patientId = createPatientId();
      const result = await this.prisma.user.create({
        data: {
          id: userId as string,
          clerkUserId: patientData.clerkUserId,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email.getValue(),
          role: 'PATIENT',
          patient: {
            create: {
              id: patientId as string,
              phone: patientData.phone.getValue(),
              dateOfBirth: patientData.dateOfBirth,
              address: patientData.address || null,
            }
          }
        },
        include: {
          patient: true
        }
      }) as any; // Type assertion to handle complex Prisma types

      if (!result.patient) {
        throw new Error('Failed to create patient record');
      }

      const patient = this.transformPrismaToPatient(result, result.patient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findById(id: PatientId): Promise<RepositoryResult<Patient>> {
    try {
      const prismaRecord = await this.prisma.patient.findUnique({
        where: { id: id as string },
        include: {
          user: true
        }
      });

      if (!prismaRecord) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with ID ${id} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaRecord.user, prismaRecord);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByEmail(email: EmailAddress): Promise<RepositoryResult<Patient>> {
    try {
      const prismaRecord = await this.prisma.user.findUnique({
        where: { email: email.getValue() },
        include: {
          patient: true
        }
      });

      if (!prismaRecord || !prismaRecord.patient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with email ${email.getValue()} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaRecord, prismaRecord.patient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: PatientId, updateData: PatientUpdateData): Promise<RepositoryResult<Patient>> {
    try {
      // Check if patient exists
      const existingPatient = await this.prisma.patient.findUnique({
        where: { id: id as string },
        include: { user: true }
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

      // Check for email conflicts before updating
      if (updateData.email) {
        const emailValue = updateData.email.getValue();
        const existingUserWithEmail = await this.prisma.user.findFirst({
          where: { 
            email: emailValue,
            id: { not: existingPatient.userId } // Exclude current user
          }
        });
        
        if (existingUserWithEmail) {
          return {
            success: false,
            error: {
              type: 'ValidationError',
              message: `A patient with email ${emailValue} already exists`
            }
          };
        }
      }

      // Prepare update data for User and Patient
      const userUpdateData: any = {};
      const patientUpdateData: any = {};

      if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
      if (updateData.email) userUpdateData.email = updateData.email.getValue();
      if (updateData.phone) patientUpdateData.phone = updateData.phone.getValue();
      if (updateData.address !== undefined) patientUpdateData.address = updateData.address;

      // Update both user and patient records
      await this.prisma.$transaction(async (tx) => {
        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: existingPatient.userId },
            data: userUpdateData
          });
        }
        if (Object.keys(patientUpdateData).length > 0) {
          await tx.patient.update({
            where: { id: id as string },
            data: patientUpdateData
          });
        }
      });

      // Fetch updated record
      const updatedRecord = await this.prisma.patient.findUnique({
        where: { id: id as string },
        include: { user: true }
      });

      if (!updatedRecord) {
        throw new Error('Failed to fetch updated patient');
      }

      const patient = this.transformPrismaToPatient(updatedRecord.user, updatedRecord);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: PatientId): Promise<RepositoryResult<void>> {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id: id as string }
      });

      if (!patient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with ID ${id} not found`
          }
        };
      }

      // Delete user (cascades to patient)
      await this.prisma.user.delete({
        where: { id: patient.userId }
      });

      return { success: true, data: undefined };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByClerkUserId(clerkUserId: string): Promise<RepositoryResult<Patient>> {
    try {
      const prismaRecord = await this.prisma.user.findUnique({
        where: { clerkUserId },
        include: {
          patient: true
        }
      });

      if (!prismaRecord || !prismaRecord.patient) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with Clerk user ID ${clerkUserId} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaRecord, prismaRecord.patient);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByPhone(phone: PhoneNumber): Promise<RepositoryResult<Patient>> {
    try {
      const prismaRecord = await this.prisma.patient.findFirst({
        where: { phone: phone.getValue() },
        include: {
          user: true
        }
      });

      if (!prismaRecord) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Patient with phone ${phone.getValue()} not found`
          }
        };
      }

      const patient = this.transformPrismaToPatient(prismaRecord.user, prismaRecord);
      return { success: true, data: patient };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async emailExists(email: EmailAddress): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
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
      // Build where clause for patient query
      const patientWhere: any = {};
      const userWhere: any = { role: 'PATIENT' };
      
      if (filters?.email) userWhere.email = filters.email.getValue();
      if (filters?.phone) patientWhere.phone = filters.phone.getValue();
      if (filters?.clerkUserId) userWhere.clerkUserId = filters.clerkUserId;
      if (filters?.createdAfter) patientWhere.createdAt = { gte: filters.createdAfter };
      if (filters?.createdBefore) {
        patientWhere.createdAt = { 
          ...patientWhere.createdAt, 
          lte: filters.createdBefore 
        };
      }

      const where = {
        ...patientWhere,
        user: userWhere
      };

      const queryOptions: any = {
        where,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      };
      
      if (pagination?.offset) queryOptions.skip = pagination.offset;
      if (pagination?.limit) queryOptions.take = pagination.limit;

      const [patients, totalCount] = await Promise.all([
        this.prisma.patient.findMany(queryOptions) as any, // Type assertion for complex Prisma types
        this.prisma.patient.count({ where })
      ]);

      const transformedPatients = patients.map((p: any) => this.transformPrismaToPatient(p.user, p));

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
      const patientWhere: any = {};
      const userWhere: any = { role: 'PATIENT' };
      
      if (filters?.email) userWhere.email = filters.email.getValue();
      if (filters?.phone) patientWhere.phone = filters.phone.getValue();
      if (filters?.clerkUserId) userWhere.clerkUserId = filters.clerkUserId;

      const where = {
        ...patientWhere,
        user: userWhere
      };

      const count = await this.prisma.patient.count({ where });
      return { success: true, data: count };

    } catch (error) {
      return this.handleError(error);
    }
  }

  // Private helper methods
  private ensureValidPatientId(id: string): PatientId {
    // If the ID already follows the correct format, use it
    if (id.match(/^patient_[a-zA-Z0-9_]+$/)) {
      return id as PatientId;
    }
    
    // For legacy IDs, convert them to the proper format
    return `patient_${id}` as PatientId;
  }

  private transformPrismaToPatient(user: any, patient: any): Patient {
    return {
      id: this.ensureValidPatientId(patient.id),
      clerkUserId: user.clerkUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: new EmailAddress(user.email),
      phone: new PhoneNumber(patient.phone),
      address: patient.address || undefined,
      dateOfBirth: patient.dateOfBirth,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
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