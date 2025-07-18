/**
 * PRISMA APPOINTMENT REPOSITORY IMPLEMENTATION
 * 
 * This class implements the IAppointmentRepository interface using Prisma ORM.
 * Handles appointment scheduling, conflict checking, and status management.
 */

import { prisma } from '@config/database';
import { Appointment } from '@domain/entities/appointment';
import { 
  AppointmentId, 
  PatientId, 
  DoctorId, 
  AppointmentStatus,
  AppointmentDuration,
  createAppointmentId,
  createPatientId,
  createDoctorId
} from '@domain/entities/shared-types';
import { 
  IAppointmentRepository, 
  RepositoryResult, 
  AppointmentFilters,
  AppointmentUpdateData 
} from '@domain/repositories/interfaces';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  private prisma = prisma;

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

      const appointmentId = createAppointmentId();
      const createdAppointment = await this.prisma.appointment.create({
        data: {
          id: appointmentId as string,
          patientId: appointmentData.patientId as string,
          doctorId: appointmentData.doctorId as string,
          type: appointmentData.type,
          status: appointmentData.status,
          scheduledDateTime: appointmentData.scheduledDateTime,
          durationMinutes: appointmentData.duration.getMinutes(),
          reasonForVisit: appointmentData.reasonForVisit || null,
          notes: appointmentData.notes || null,
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
        where: { id: id as string },
        include: {
          doctor: {
            include: { user: true }
          },
          patient: {
            include: { user: true }
          }
        }
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

      const appointment = this.transformPrismaToAppointmentWithDetails(prismaAppointment);
      return { success: true, data: appointment };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByPatientId(id: PatientId): Promise<RepositoryResult<Appointment[]>> {
    try {
      const prismaAppointments = await this.prisma.appointment.findMany({
        where: { patientId: id as string },
        include: {
          doctor: {
            include: { user: true }
          },
          patient: {
            include: { user: true }
          }
        },
        orderBy: { scheduledDateTime: 'desc' }
      });

      const appointments = prismaAppointments.map(this.transformPrismaToAppointmentWithDetails.bind(this));
      return { success: true, data: appointments };

    } catch (error) {
      return this.handleError(error);
    }
  }

  async findByDoctorId(id: DoctorId): Promise<RepositoryResult<Appointment[]>> {
    try {
      const prismaAppointments = await this.prisma.appointment.findMany({
        where: { doctorId: id as string },
        include: {
          doctor: {
            include: { user: true }
          },
          patient: {
            include: { user: true }
          }
        },
        orderBy: { scheduledDateTime: 'asc' }
      });

      const appointments = prismaAppointments.map(this.transformPrismaToAppointmentWithDetails.bind(this));
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
        const existingEnd = new Date(existing.scheduledDateTime.getTime() + existing.durationMinutes * 60000);
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
      if (updateData.duration) prismaUpdateData.durationMinutes = updateData.duration.getMinutes();
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

  async findWithFilters(filters?: any): Promise<RepositoryResult<Appointment[]>> {
    try {
      const where: any = {};
      
      if (filters?.patientId) where.patientId = filters.patientId as string;
      if (filters?.doctorId) where.doctorId = filters.doctorId as string;
      if (filters?.status) where.status = filters.status;
      if (filters?.type) where.type = filters.type;
      if (filters?.dateFrom) {
        where.scheduledDateTime = { gte: filters.dateFrom };
      }
      if (filters?.dateTo) {
        where.scheduledDateTime = { 
          ...where.scheduledDateTime, 
          lte: filters.dateTo 
        };
      }

      const prismaAppointments = await this.prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            include: { user: true }
          },
          patient: {
            include: { user: true }
          }
        },
        orderBy: { scheduledDateTime: 'asc' }
      });

      const appointments = prismaAppointments.map(this.transformPrismaToAppointmentWithDetails.bind(this));
      return { success: true, data: appointments };

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
  private ensureValidAppointmentId(id: string): AppointmentId {
    // If the ID already follows the correct format, use it
    if (id.match(/^appt_[a-zA-Z0-9_]+$/)) {
      return id as AppointmentId;
    }
    
    // For legacy IDs, convert them to the proper format
    return `appt_${id}` as AppointmentId;
  }

  private ensureValidPatientId(id: string): PatientId {
    // If the ID already follows the correct format, use it
    if (id.match(/^patient_[a-zA-Z0-9_]+$/)) {
      return id as PatientId;
    }
    
    // For legacy IDs, convert them to the proper format
    return `patient_${id}` as PatientId;
  }

  private ensureValidDoctorId(id: string): DoctorId {
    // If the ID already follows the correct format, use it
    if (id.match(/^doctor_[a-zA-Z0-9_]+$/)) {
      return id as DoctorId;
    }
    
    // For legacy IDs, convert them to the proper format
    return `doctor_${id}` as DoctorId;
  }

  private transformPrismaToAppointment(prismaAppointment: any): Appointment {
    return {
      id: this.ensureValidAppointmentId(prismaAppointment.id),
      patientId: this.ensureValidPatientId(prismaAppointment.patientId),
      doctorId: this.ensureValidDoctorId(prismaAppointment.doctorId),
      type: prismaAppointment.type,
      status: prismaAppointment.status,
      scheduledDateTime: prismaAppointment.scheduledDateTime,
      duration: new AppointmentDuration(prismaAppointment.durationMinutes),
      reasonForVisit: prismaAppointment.reasonForVisit,
      notes: prismaAppointment.notes,
      createdAt: prismaAppointment.createdAt,
      updatedAt: prismaAppointment.updatedAt,
    };
  }

  private transformPrismaToAppointmentWithDetails(prismaAppointment: any): Appointment {
    const baseAppointment = this.transformPrismaToAppointment(prismaAppointment);
    
    // Add doctor and patient details if they exist
    const appointmentWithDetails: any = { ...baseAppointment };
    
    if (prismaAppointment.doctor) {
      appointmentWithDetails.doctor = {
        id: createDoctorId(prismaAppointment.doctor.id),
        firstName: prismaAppointment.doctor.user.firstName,
        lastName: prismaAppointment.doctor.user.lastName,
        email: prismaAppointment.doctor.user.email,
        specialization: prismaAppointment.doctor.specialization,
      };
    }
    
    if (prismaAppointment.patient) {
      appointmentWithDetails.patient = {
        id: createPatientId(prismaAppointment.patient.id),
        firstName: prismaAppointment.patient.user.firstName,
        lastName: prismaAppointment.patient.user.lastName,
        email: prismaAppointment.patient.user.email,
        phone: prismaAppointment.patient.phone, // Phone is on patient table, not user table
      };
    }
    
    return appointmentWithDetails;
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