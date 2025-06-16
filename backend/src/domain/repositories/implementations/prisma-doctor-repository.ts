/**
 * PRISMA DOCTOR REPOSITORY IMPLEMENTATION
 * 
 * This class implements the IDoctorRepository interface using Prisma ORM.
 * Handles doctor management, specialization filtering, and active status tracking.
 */

import { PrismaClient } from '@prisma/client';
import { Doctor } from '@domain/entities/doctor';
import { 
  DoctorId, 
  EmailAddress,
  createDoctorId
} from '@domain/entities/shared-types';
import { 
  IDoctorRepository, 
  RepositoryResult, 
  RepositoryError,
  DoctorFilters,
  DoctorUpdateData 
} from '@domain/repositories/interfaces';

export class PrismaDoctorRepository implements IDoctorRepository {
  constructor(private prisma: PrismaClient) {}

  async create(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResult<Doctor>> {
    try {
      // Check for existing email or clerkUserId
      const existingDoctor = await this.prisma.doctor.findFirst({
        where: {
          OR: [
            { email: doctorData.email.getValue() },
            { clerkUserId: doctorData.clerkUserId }
          ]
        }
      });

      if (existingDoctor) {
        return {
          success: false,
          error: {
            type: 'ConflictError',
            message: 'Doctor with this email or Clerk user ID already exists',
            details: { 
              email: doctorData.email.getValue(), 
              clerkUserId: doctorData.clerkUserId 
            }
          }
        };
      }

      const createdDoctor = await this.prisma.doctor.create({
        data: {
          clerkUserId: doctorData.clerkUserId,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email.getValue(),
          specialization: doctorData.specialization,
          isActive: doctorData.isActive,
        }
      });

      const doctor = this.transformPrismaToDoctor(createdDoctor);
      return { success: true, data: doctor };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findById(id: DoctorId): Promise<RepositoryResult<Doctor>> {
    try {
      const prismaDoctor = await this.prisma.doctor.findUnique({
        where: { id: id as string }
      });

      if (!prismaDoctor) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Doctor with ID ${id} not found`
          }
        };
      }

      const doctor = this.transformPrismaToDoctor(prismaDoctor);
      return { success: true, data: doctor };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByClerkUserId(clerkUserId: string): Promise<RepositoryResult<Doctor>> {
    try {
      const prismaDoctor = await this.prisma.doctor.findUnique({
        where: { clerkUserId }
      });

      if (!prismaDoctor) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Doctor with Clerk user ID ${clerkUserId} not found`
          }
        };
      }

      const doctor = this.transformPrismaToDoctor(prismaDoctor);
      return { success: true, data: doctor };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findActiveDoctors(): Promise<RepositoryResult<Doctor[]>> {
    try {
      const prismaDoctors = await this.prisma.doctor.findMany({
        where: { isActive: true },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      const doctors = prismaDoctors.map(this.transformPrismaToDoctor.bind(this));
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
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      const doctors = prismaDoctors.map(this.transformPrismaToDoctor.bind(this));
      return { success: true, data: doctors };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: DoctorId, updateData: DoctorUpdateData): Promise<RepositoryResult<Doctor>> {
    try {
      // Check if doctor exists
      const existingDoctor = await this.prisma.doctor.findUnique({
        where: { id: id as string }
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

      // Prepare update data
      const prismaUpdateData: any = { updatedAt: new Date() };
      
      if (updateData.firstName) prismaUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) prismaUpdateData.lastName = updateData.lastName;
      if (updateData.email) prismaUpdateData.email = updateData.email.getValue();
      if (updateData.specialization !== undefined) prismaUpdateData.specialization = updateData.specialization;
      if (updateData.isActive !== undefined) prismaUpdateData.isActive = updateData.isActive;

      const updatedDoctor = await this.prisma.doctor.update({
        where: { id: id as string },
        data: prismaUpdateData
      });

      const doctor = this.transformPrismaToDoctor(updatedDoctor);
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

      await this.prisma.doctor.delete({
        where: { id: id as string }
      });

      return { success: true, data: undefined };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async count(filters?: DoctorFilters): Promise<RepositoryResult<number>> {
    try {
      const where: any = {};
      
      if (filters?.specialization) {
        where.specialization = {
          contains: filters.specialization,
          mode: 'insensitive'
        };
      }
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;
      if (filters?.email) where.email = filters.email.getValue();

      const count = await this.prisma.doctor.count({ where });
      return { success: true, data: count };

    } catch (error) {
      return this.handleError(error);
    }
  }

  // Private helper methods
  private transformPrismaToDoctor(prismaDoctor: any): Doctor {
    return {
      id: createDoctorId(prismaDoctor.id),
      clerkUserId: prismaDoctor.clerkUserId,
      firstName: prismaDoctor.firstName,
      lastName: prismaDoctor.lastName,
      email: new EmailAddress(prismaDoctor.email),
      specialization: prismaDoctor.specialization,
      isActive: prismaDoctor.isActive,
      createdAt: prismaDoctor.createdAt,
      updatedAt: prismaDoctor.updatedAt,
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