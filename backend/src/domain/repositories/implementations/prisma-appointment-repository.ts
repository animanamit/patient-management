/**
 * PRISMA APPOINTMENT REPOSITORY IMPLEMENTATION
 * 
 * This class implements the IAppointmentRepository interface using Prisma ORM.
 * Handles appointment scheduling, conflict checking, and status management.
 */

import { PrismaClient } from '@prisma/client';
import { Appointment } from '@domain/entities/appointment';
import { 
  AppointmentId, 
  PatientId, 
  DoctorId, 
  AppointmentStatus,
  AppointmentType,
  AppointmentDuration,
  createAppointmentId,
  createPatientId,
  createDoctorId
} from '@domain/entities/shared-types';
import { 
  IAppointmentRepository, 
  RepositoryResult, 
  RepositoryError,
  AppointmentFilters,
  AppointmentUpdateData 
} from '@domain/repositories/interfaces';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RepositoryResult<Appointment>> {
    try {
      // Check for schedule conflicts before creating
      const hasConflict = await this.checkScheduleConflict(
        appointmentData.doctorId,
        appointmentData.scheduledDateTime,
        appointmentData.duration
      );

      if (hasConflict) {
        return {
          success: false,
          error: {
            type: 'ConflictError',
            message: 'Doctor is not available at the requested time',
            details: { 
              doctorId: appointmentData.doctorId as string,
              scheduledDateTime: appointmentData.scheduledDateTime 
            }
          }
        };
      }

      const createdAppointment = await this.prisma.appointment.create({
        data: {
          patientId: appointmentData.patientId as string,
          doctorId: appointmentData.doctorId as string,
          type: appointmentData.type,
          status: appointmentData.status,
          scheduledDateTime: appointmentData.scheduledDateTime,
          duration: appointmentData.duration.getMinutes(),
          reasonForVisit: appointmentData.reasonForVisit,
          notes: appointmentData.notes,
        }
      });

      const appointment = this.transformPrismaToAppointment(createdAppointment);
      return { success: true, data: appointment };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findById(id: AppointmentId): Promise<RepositoryResult<Appointment>> {
    try {
      const prismaAppointment = await this.prisma.appointment.findUnique({
        where: { id: id as string }
      });

      if (!prismaAppointment) {
        return {
          success: false,
          error: {
            type: 'NotFound',
            message: `Appointment with ID ${id} not found`
          }
        };
      }

      const appointment = this.transformPrismaToAppointment(prismaAppointment);
      return { success: true, data: appointment };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByPatientId(id: PatientId): Promise<RepositoryResult<Appointment[]>> {
    try {
      const prismaAppointments = await this.prisma.appointment.findMany({
        where: { patientId: id as string },
        orderBy: { scheduledDateTime: 'desc' }
      });

      const appointments = prismaAppointments.map(this.transformPrismaToAppointment.bind(this));
      return { success: true, data: appointments };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByDoctorId(id: DoctorId): Promise<RepositoryResult<Appointment[]>> {
    try {
      const prismaAppointments = await this.prisma.appointment.findMany({
        where: { doctorId: id as string },
        orderBy: { scheduledDateTime: 'asc' }
      });

      const appointments = prismaAppointments.map(this.transformPrismaToAppointment.bind(this));
      return { success: true, data: appointments };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async checkScheduleConflict(
    doctorId: DoctorId,
    scheduledDateTime: Date,
    duration: AppointmentDuration
  ): Promise<boolean> {
    try {
      const endTime = new Date(scheduledDateTime.getTime() + duration.getMilliseconds());

      // Simple conflict check: find appointments that overlap with the new time slot
      const conflictingAppointments = await this.prisma.appointment.findMany({
        where: {
          doctorId: doctorId as string,
          status: {
            not: AppointmentStatus.CANCELLED
          },
          scheduledDateTime: {
            lt: endTime // Appointment starts before our new appointment ends
          },
          // We would need to add an endDateTime column to properly check this
          // For now, assume 60-minute default duration for existing appointments
        }
      });

      // Filter for actual conflicts (this is simplified)
      const actualConflicts = conflictingAppointments.filter(existing => {
        const existingEnd = new Date(existing.scheduledDateTime.getTime() + existing.duration * 60000);
        return existingEnd > scheduledDateTime; // Existing appointment ends after new one starts
      });

      return actualConflicts.length > 0;

    } catch (error) {
      console.error('Error checking schedule conflict:', error);
      return true; // Err on the side of caution
    }
  }

  async updateStatus(id: AppointmentId, newStatus: AppointmentStatus): Promise<RepositoryResult<Appointment>> {
    try {
      const updatedAppointment = await this.prisma.appointment.update({
        where: { id: id as string },
        data: { 
          status: newStatus,
          updatedAt: new Date()
        }
      });

      const appointment = this.transformPrismaToAppointment(updatedAppointment);
      return { success: true, data: appointment };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: AppointmentId, updateData: AppointmentUpdateData): Promise<RepositoryResult<Appointment>> {
    try {
      // Prepare update data
      const prismaUpdateData: any = { updatedAt: new Date() };
      
      if (updateData.status) prismaUpdateData.status = updateData.status;
      if (updateData.scheduledDateTime) prismaUpdateData.scheduledDateTime = updateData.scheduledDateTime;
      if (updateData.duration) prismaUpdateData.duration = updateData.duration.getMinutes();
      if (updateData.reasonForVisit) prismaUpdateData.reasonForVisit = updateData.reasonForVisit;

      const updatedAppointment = await this.prisma.appointment.update({
        where: { id: id as string },
        data: prismaUpdateData
      });

      const appointment = this.transformPrismaToAppointment(updatedAppointment);
      return { success: true, data: appointment };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: AppointmentId): Promise<RepositoryResult<void>> {
    try {
      await this.prisma.appointment.delete({
        where: { id: id as string }
      });

      return { success: true, data: undefined };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async count(filters?: AppointmentFilters): Promise<RepositoryResult<number>> {
    try {
      const where: any = {};
      
      if (filters?.patientId) where.patientId = filters.patientId as string;
      if (filters?.doctorId) where.doctorId = filters.doctorId as string;
      if (filters?.status) where.status = filters.status;
      if (filters?.type) where.type = filters.type;
      if (filters?.scheduledAfter) where.scheduledDateTime = { gte: filters.scheduledAfter };
      if (filters?.scheduledBefore) {
        where.scheduledDateTime = { 
          ...where.scheduledDateTime, 
          lte: filters.scheduledBefore 
        };
      }

      const count = await this.prisma.appointment.count({ where });
      return { success: true, data: count };

    } catch (error) {
      return this.handleError(error);
    }
  }

  // Private helper methods
  private transformPrismaToAppointment(prismaAppointment: any): Appointment {
    return {
      id: createAppointmentId(prismaAppointment.id),
      patientId: createPatientId(prismaAppointment.patientId),
      doctorId: createDoctorId(prismaAppointment.doctorId),
      type: prismaAppointment.type,
      status: prismaAppointment.status,
      scheduledDateTime: prismaAppointment.scheduledDateTime,
      duration: new AppointmentDuration(prismaAppointment.duration),
      reasonForVisit: prismaAppointment.reasonForVisit,
      notes: prismaAppointment.notes,
      createdAt: prismaAppointment.createdAt,
      updatedAt: prismaAppointment.updatedAt,
    };
  }

  private handleError(error: any): RepositoryResult<any> {
    console.error('Appointment repository error:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return {
        success: false,
        error: {
          type: 'ConflictError',
          message: 'Appointment conflict detected',
          details: { originalError: error.message }
        }
      };
    }

    if (error.code === 'P2025') {
      return {
        success: false,
        error: {
          type: 'NotFound',
          message: 'Appointment not found',
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