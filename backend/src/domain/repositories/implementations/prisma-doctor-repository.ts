/**
 * PRISMA DOCTOR REPOSITORY IMPLEMENTATION
 * 
 * This class implements the IDoctorRepository interface using Prisma ORM.
 * Handles doctor management, specialization filtering, and active status tracking.
 * Works with the User/Doctor relational schema.
 */

import { prisma } from '@config/database';
import { Doctor } from '@domain/entities/doctor';
import { 
  DoctorId, 
  EmailAddress,
  createDoctorId
} from '@domain/entities/shared-types';
import { 
  IDoctorRepository, 
  RepositoryResult, 
  DoctorFilters,
  DoctorUpdateData 
} from '@domain/repositories/interfaces';

export class PrismaDoctorRepository implements IDoctorRepository {
  private prisma = prisma;

  async create(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResult<Doctor>> {
    try {
      // Check for existing email or clerkUserId
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: doctorData.email.getValue() },
            { clerkUserId: doctorData.clerkUserId }
          ]
        }
      });

      if (existingUser) {
        return {
          success: false,
          error: {
            type: 'ConflictError',
            message: 'User with this email or Clerk user ID already exists',
            details: { 
              email: doctorData.email.getValue(), 
              clerkUserId: doctorData.clerkUserId 
            }
          }
        };
      }

      const result = await this.prisma.user.create({
        data: {
          clerkUserId: doctorData.clerkUserId,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email.getValue(),
          role: 'DOCTOR',
          doctor: {
            create: {
              specialization: doctorData.specialization || null,
              isActive: doctorData.isActive,
            }
          }
        },
        include: {
          doctor: true
        }
      }) as any; // Type assertion to handle complex Prisma types

      if (!result.doctor) {
        throw new Error('Failed to create doctor record');
      }

      const doctor = this.transformPrismaToDoctor(result, result.doctor);
      return { success: true, data: doctor };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findById(id: DoctorId): Promise<RepositoryResult<Doctor>> {
    try {
      const prismaRecord = await this.prisma.doctor.findUnique({
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
            message: `Doctor with ID ${id} not found`
          }
        };
      }

      const doctor = this.transformPrismaToDoctor(prismaRecord.user, prismaRecord);
      return { success: true, data: doctor };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByClerkUserId(clerkUserId: string): Promise<RepositoryResult<Doctor>> {
    try {
      const prismaRecord = await this.prisma.user.findUnique({
        where: { clerkUserId },
        include: {
          doctor: true
        }
      });

      if (!prismaRecord || !prismaRecord.doctor) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Doctor with Clerk user ID ${clerkUserId} not found`
          }
        };
      }

      const doctor = this.transformPrismaToDoctor(prismaRecord, prismaRecord.doctor);
      return { success: true, data: doctor };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findActiveDoctors(): Promise<RepositoryResult<Doctor[]>> {
    try {
      const prismaDoctors = await this.prisma.doctor.findMany({
        where: { isActive: true },
        include: {
          user: true
        },
        orderBy: [
          { user: { lastName: 'asc' } },
          { user: { firstName: 'asc' } }
        ]
      });

      const doctors = prismaDoctors.map(d => this.transformPrismaToDoctor(d.user, d));
      return { success: true, data: doctors };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findBySpecialization(specialization: string): Promise<RepositoryResult<Doctor[]>> {
    try {
      const prismaDoctors = await this.prisma.doctor.findMany({
        where: { 
          specialization: {
            contains: specialization,
            mode: 'insensitive' // Case-insensitive search
          },
          isActive: true // Only return active doctors
        },
        include: {
          user: true
        },
        orderBy: [
          { user: { lastName: 'asc' } },
          { user: { firstName: 'asc' } }
        ]
      });

      const doctors = prismaDoctors.map(d => this.transformPrismaToDoctor(d.user, d));
      return { success: true, data: doctors };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: DoctorId, updateData: DoctorUpdateData): Promise<RepositoryResult<Doctor>> {
    try {
      // Check if doctor exists
      const existingDoctor = await this.prisma.doctor.findUnique({
        where: { id: id as string },
        include: { user: true }
      });

      if (!existingDoctor) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Doctor with ID ${id} not found`
          }
        };
      }

      // Prepare update data for User and Doctor
      const userUpdateData: any = {};
      const doctorUpdateData: any = {};
      
      if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
      if (updateData.email) userUpdateData.email = updateData.email.getValue();
      if (updateData.specialization !== undefined) doctorUpdateData.specialization = updateData.specialization;
      if (updateData.isActive !== undefined) doctorUpdateData.isActive = updateData.isActive;

      // Update both user and doctor records
      await this.prisma.$transaction(async (tx) => {
        if (Object.keys(userUpdateData).length > 0) {
          await tx.user.update({
            where: { id: existingDoctor.userId },
            data: userUpdateData
          });
        }
        if (Object.keys(doctorUpdateData).length > 0) {
          await tx.doctor.update({
            where: { id: id as string },
            data: doctorUpdateData
          });
        }
      });

      // Fetch updated record
      const updatedRecord = await this.prisma.doctor.findUnique({
        where: { id: id as string },
        include: { user: true }
      });

      if (!updatedRecord) {
        throw new Error('Failed to fetch updated doctor');
      }

      const doctor = this.transformPrismaToDoctor(updatedRecord.user, updatedRecord);
      return { success: true, data: doctor };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: DoctorId): Promise<RepositoryResult<void>> {
    try {
      // Check if doctor has any appointments before deleting
      const appointmentCount = await this.prisma.appointment.count({
        where: { doctorId: id as string }
      });

      if (appointmentCount > 0) {
        return {
          success: false,
          error: {
            type: 'ConflictError',
            message: 'Cannot delete doctor with existing appointments',
            details: { appointmentCount }
          }
        };
      }

      const doctor = await this.prisma.doctor.findUnique({
        where: { id: id as string }
      });

      if (!doctor) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Doctor with ID ${id} not found`
          }
        };
      }

      // Delete user (cascades to doctor)
      await this.prisma.user.delete({
        where: { id: doctor.userId }
      });

      return { success: true, data: undefined };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async count(filters?: DoctorFilters): Promise<RepositoryResult<number>> {
    try {
      const doctorWhere: any = {};
      const userWhere: any = { role: 'DOCTOR' };
      
      if (filters?.specialization) {
        doctorWhere.specialization = {
          contains: filters.specialization,
          mode: 'insensitive'
        };
      }
      if (filters?.isActive !== undefined) doctorWhere.isActive = filters.isActive;
      if (filters?.email) userWhere.email = filters.email.getValue();

      const where = {
        ...doctorWhere,
        user: userWhere
      };

      const count = await this.prisma.doctor.count({ where });
      return { success: true, data: count };

    } catch (error) {
      return this.handleError(error);
    }
  }

  // Private helper methods
  private transformPrismaToDoctor(user: any, doctor: any): Doctor {
    return {
      id: createDoctorId(doctor.id),
      clerkUserId: user.clerkUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: new EmailAddress(user.email),
      specialization: doctor.specialization,
      isActive: doctor.isActive,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    };
  }

  private handleError(error: any): RepositoryResult<any> {
    console.error('Doctor repository error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return {
        success: false,
        error: {
          type: 'ConflictError',
          message: 'Doctor with this email or Clerk user ID already exists',
          details: { originalError: error.message }
        }
      };
    }

    if (error.code === 'P2025') {
      return {
        success: false,
        error: {
          type: 'NotFound',
          message: 'Doctor not found',
          details: { originalError: error.message }
        }
      };
    }
    
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