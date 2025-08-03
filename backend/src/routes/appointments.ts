import { Hono } from "hono";
import { z } from "zod";
import { PrismaAppointmentRepository } from "../domain/repositories/implementations/prisma-appointment-repository.js";
import {
  createAppointmentId,
  AppointmentDuration,
  AppointmentType,
  AppointmentStatus,
  PatientId,
  DoctorId,
} from "../domain/entities/shared-types.js";
import {
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  UpdateAppointmentStatusSchema,
  AppointmentQuerySchema,
  AppointmentIdParamSchema,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  AppointmentQueryParams,
  AppointmentIdParam,
} from "../schemas/appointment-schemas.js";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation.js";

const app = new Hono();

// Initialize repository
const appointmentRepository = new PrismaAppointmentRepository();

// GET /appointments - List appointments with filtering
app.get(
  "/",
  validateQuery(AppointmentQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid("query");

      // Build filters
      const filters: any = {};
      
      if (query.patientId) {
        filters.patientId = query.patientId as PatientId;
      }
      
      if (query.doctorId) {
        filters.doctorId = query.doctorId as DoctorId;
      }
      
      if (query.status) {
        filters.status = query.status as AppointmentStatus;
      }
      
      if (query.type) {
        filters.type = query.type as AppointmentType;
      }
      
      if (query.dateFrom) {
        filters.scheduledAfter = new Date(query.dateFrom);
      }
      
      if (query.dateTo) {
        filters.scheduledBefore = new Date(query.dateTo);
      }

      // Handle pagination
      const limit = query.limit ? parseInt(query.limit) : 50;
      const offset = query.offset ? parseInt(query.offset) : 0;

      // Get appointments based on specific filters
      let appointments: any[] = [];
      
      if (query.patientId) {
        const result = await appointmentRepository.findByPatientId(query.patientId as PatientId);
        if (!result.success) {
          return c.json({ error: "Failed to fetch appointments", details: result.error }, 500);
        }
        appointments = result.data;
      } else if (query.doctorId) {
        const result = await appointmentRepository.findByDoctorId(query.doctorId as DoctorId);
        if (!result.success) {
          return c.json({ error: "Failed to fetch appointments", details: result.error }, 500);
        }
        appointments = result.data;
      } else {
        // For now, return empty array if no specific filter is provided
        // In a real implementation, you'd want a findMany method with filters
        appointments = [];
      }

      // Apply additional filters
      if (query.status) {
        appointments = appointments.filter(appt => appt.status === query.status);
      }
      
      if (query.type) {
        appointments = appointments.filter(appt => appt.type === query.type);
      }
      
      if (query.dateFrom) {
        const fromDate = new Date(query.dateFrom);
        appointments = appointments.filter(appt => appt.scheduledDateTime >= fromDate);
      }
      
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        appointments = appointments.filter(appt => appt.scheduledDateTime <= toDate);
      }

      // Apply pagination
      const totalCount = appointments.length;
      const paginatedAppointments = appointments.slice(offset, offset + limit);

      return c.json({
        appointments: paginatedAppointments,
        pagination: {
          limit,
          offset,
          totalCount,
          hasMore: offset + limit < totalCount,
        },
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET /appointments/:id - Get single appointment
app.get(
  "/:id",
  validateParams(AppointmentIdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const appointmentId = createAppointmentId(id);

      const result = await appointmentRepository.findById(appointmentId);

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Appointment not found" }, 404);
        }
        return c.json({ error: "Failed to fetch appointment", details: result.error }, 500);
      }

      return c.json({ appointment: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// POST /appointments - Create new appointment
app.post(
  "/",
  validateRequest(CreateAppointmentSchema),
  async (c) => {
    try {
      const appointmentData = c.req.valid("json");

      // Check for schedule conflicts
      const hasConflict = await appointmentRepository.checkScheduleConflict(
        appointmentData.doctorId as DoctorId,
        new Date(appointmentData.scheduledDateTime),
        new AppointmentDuration(appointmentData.durationMinutes)
      );

      if (hasConflict) {
        return c.json({ 
          error: "Schedule conflict",
          message: "Doctor already has an appointment at this time"
        }, 409);
      }

      // Convert to domain objects
      const domainAppointmentData = {
        patientId: appointmentData.patientId as PatientId,
        doctorId: appointmentData.doctorId as DoctorId,
        type: appointmentData.type as AppointmentType,
        status: "SCHEDULED" as AppointmentStatus,
        scheduledDateTime: new Date(appointmentData.scheduledDateTime),
        duration: new AppointmentDuration(appointmentData.durationMinutes),
        reasonForVisit: appointmentData.reasonForVisit || null,
        notes: appointmentData.notes || null,
      };

      const result = await appointmentRepository.create(domainAppointmentData);

      if (!result.success) {
        if (result.error.type === "ConflictError") {
          return c.json({ error: "Appointment conflict", details: result.error }, 409);
        }
        return c.json({ error: "Failed to create appointment", details: result.error }, 500);
      }

      return c.json({ appointment: result.data }, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// PUT /appointments/:id - Update appointment
app.put(
  "/:id",
  validateParams(AppointmentIdParamSchema),
  validateRequest(UpdateAppointmentSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const updateData = c.req.valid("json");
      const appointmentId = createAppointmentId(id);

      // Convert to domain objects where needed
      const domainUpdateData: any = {};
      
      if (updateData.type !== undefined) {
        domainUpdateData.type = updateData.type as AppointmentType;
      }
      
      if (updateData.scheduledDateTime !== undefined) {
        domainUpdateData.scheduledDateTime = new Date(updateData.scheduledDateTime);
      }
      
      if (updateData.durationMinutes !== undefined) {
        domainUpdateData.duration = new AppointmentDuration(updateData.durationMinutes);
      }
      
      if (updateData.reasonForVisit !== undefined) {
        domainUpdateData.reasonForVisit = updateData.reasonForVisit;
      }
      
      if (updateData.notes !== undefined) {
        domainUpdateData.notes = updateData.notes;
      }

      const result = await appointmentRepository.update(
        appointmentId,
        domainUpdateData
      );

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Appointment not found" }, 404);
        }
        return c.json({ error: "Failed to update appointment", details: result.error }, 500);
      }

      return c.json({ appointment: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// PATCH /appointments/:id/status - Update appointment status only
app.patch(
  "/:id/status",
  validateParams(AppointmentIdParamSchema),
  validateRequest(UpdateAppointmentStatusSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { status } = c.req.valid("json");
      const appointmentId = createAppointmentId(id);

      const result = await appointmentRepository.updateStatus(
        appointmentId,
        status as AppointmentStatus
      );

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Appointment not found" }, 404);
        }
        return c.json({ error: "Failed to update appointment status", details: result.error }, 500);
      }

      return c.json({ appointment: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// DELETE /appointments/:id - Delete appointment
app.delete(
  "/:id",
  validateParams(AppointmentIdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const appointmentId = createAppointmentId(id);

      const result = await appointmentRepository.delete(appointmentId);

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Appointment not found" }, 404);
        }
        return c.json({ error: "Failed to delete appointment", details: result.error }, 500);
      }

      return c.body(null, 204);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET /appointments/doctor/:doctorId - Get appointments for a specific doctor
app.get(
  "/doctor/:doctorId",
  async (c) => {
    try {
      const doctorId = c.req.param("doctorId");

      const result = await appointmentRepository.findByDoctorId(doctorId as DoctorId);

      if (!result.success) {
        return c.json({ error: "Failed to fetch doctor appointments", details: result.error }, 500);
      }

      return c.json({ 
        appointments: result.data,
        doctorId,
        totalCount: result.data.length
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET /appointments/patient/:patientId - Get appointments for a specific patient
app.get(
  "/patient/:patientId",
  async (c) => {
    try {
      const patientId = c.req.param("patientId");

      const result = await appointmentRepository.findByPatientId(patientId as PatientId);

      if (!result.success) {
        return c.json({ error: "Failed to fetch patient appointments", details: result.error }, 500);
      }

      return c.json({ 
        appointments: result.data,
        patientId,
        totalCount: result.data.length
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// POST /appointments/:id/reschedule - Reschedule appointment
app.post(
  "/:id/reschedule",
  validateParams(AppointmentIdParamSchema),
  validateRequest(z.object({
    newDateTime: z.string().datetime("Invalid date format"),
    durationMinutes: z.number().min(30).max(180).optional(),
  })),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { newDateTime, durationMinutes } = c.req.valid("json");
      const appointmentId = createAppointmentId(id);

      // First get the current appointment to check doctor
      const currentResult = await appointmentRepository.findById(appointmentId);
      if (!currentResult.success) {
        if (currentResult.error.type === "NotFound") {
          return c.json({ error: "Appointment not found" }, 404);
        }
        return c.json({ error: "Failed to fetch appointment", details: currentResult.error }, 500);
      }

      const appointment = currentResult.data;
      const newDuration = durationMinutes ? new AppointmentDuration(durationMinutes) : appointment.duration;

      // Check for schedule conflicts at new time
      const hasConflict = await appointmentRepository.checkScheduleConflict(
        appointment.doctorId,
        new Date(newDateTime),
        newDuration
      );

      if (hasConflict) {
        return c.json({ 
          error: "Schedule conflict",
          message: "Doctor already has an appointment at the requested time"
        }, 409);
      }

      // Update the appointment
      const updateData: any = {
        scheduledDateTime: new Date(newDateTime),
        status: "SCHEDULED" as AppointmentStatus, // Reset to scheduled if it was cancelled
      };

      if (durationMinutes) {
        updateData.duration = newDuration;
      }

      const result = await appointmentRepository.update(appointmentId, updateData);

      if (!result.success) {
        return c.json({ error: "Failed to reschedule appointment", details: result.error }, 500);
      }

      return c.json({ 
        appointment: result.data,
        message: "Appointment rescheduled successfully"
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

export default app;