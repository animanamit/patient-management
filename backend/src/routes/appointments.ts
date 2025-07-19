import { FastifyPluginAsync } from "fastify";
import { PrismaAppointmentRepository } from "../domain/repositories/implementations/prisma-appointment-repository.js";
import {
  createAppointmentId,
  createPatientId,
  createDoctorId,
  AppointmentDuration,
  AppointmentType,
  AppointmentStatus,
} from "../domain/entities/shared-types.js";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation.js";
import {
  CreateAppointmentRequest,
  CreateAppointmentSchema,
  UpdateAppointmentRequest,
  UpdateAppointmentSchema,
  UpdateAppointmentStatusRequest,
  UpdateAppointmentStatusSchema,
  AppointmentQueryParams,
  AppointmentQuerySchema,
  AppointmentIdParam,
  AppointmentIdParamSchema,
} from "../schemas/appointment-schemas.js";

export const appointmentRoutes: FastifyPluginAsync = async function (fastify) {
  const appointmentRepository = new PrismaAppointmentRepository();

  // 📋 GET /appointments - List appointments with filtering
  fastify.get<{ Querystring: AppointmentQueryParams }>(
    "/appointments",
    {
      preHandler: validateQuery(AppointmentQuerySchema),
    },
    async (request, reply) => {
      try {
        const query = (request as any).validatedQuery;

        // Build filters object
        const filters: any = {};
        if (query.patientId)
          filters.patientId = createPatientId(query.patientId);
        if (query.doctorId) filters.doctorId = createDoctorId(query.doctorId);
        if (query.status) filters.status = query.status as AppointmentStatus;
        if (query.type) filters.type = query.type as AppointmentType;
        if (query.dateFrom) filters.dateFrom = new Date(query.dateFrom);
        if (query.dateTo) filters.dateTo = new Date(query.dateTo);

        // Pagination options (convert strings to numbers)
        // const options = {
        //   limit: query.limit ? parseInt(query.limit, 10) : 10,
        //   offset: query.offset ? parseInt(query.offset, 10) : 0,
        // };

        // For now, let's implement basic filtering based on available methods
        if (query.patientId) {
          const result = await appointmentRepository.findByPatientId(
            createPatientId(query.patientId)
          );
          if (!result.success) {
            reply.code(500);
            return {
              error: "Failed to fetch appointments",
              details: result.error,
            };
          }
          return { appointments: result.data };
        }

        if (query.doctorId) {
          const result = await appointmentRepository.findByDoctorId(
            createDoctorId(query.doctorId)
          );
          if (!result.success) {
            reply.code(500);
            return {
              error: "Failed to fetch appointments",
              details: result.error,
            };
          }
          return { appointments: result.data };
        }

        // General appointment listing with date filters
        const appointments = await appointmentRepository.findWithFilters(filters);
        if (!appointments.success) {
          reply.code(500);
          return {
            error: "Failed to fetch appointments",
            details: appointments.error,
          };
        }
        return { appointments: appointments.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // 👤 GET /appointments/:id - Get single appointment
  fastify.get<{ Params: AppointmentIdParam }>(
    "/appointments/:id",
    {
      preHandler: validateParams(AppointmentIdParamSchema),
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const appointmentId = createAppointmentId(id);

        const result = await appointmentRepository.findById(appointmentId);

        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Appointment not found" };
          }
          reply.code(500);
          return {
            error: "Failed to fetch appointment",
            details: result.error,
          };
        }

        return { appointment: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // ➕ POST /appointments - Create new appointment
  fastify.post<{ Body: CreateAppointmentRequest }>(
    "/appointments",
    {
      preHandler: validateRequest(CreateAppointmentSchema),
    },
    async (request, reply) => {
      try {
        const appointmentData = (request as any).validatedBody;

        // Convert to domain objects
        const domainAppointmentData = {
          patientId: createPatientId(appointmentData.patientId),
          doctorId: createDoctorId(appointmentData.doctorId),
          type: appointmentData.type as AppointmentType,
          status: AppointmentStatus.SCHEDULED, // Default status
          scheduledDateTime: new Date(appointmentData.scheduledDateTime),
          duration: new AppointmentDuration(appointmentData.durationMinutes),
          reasonForVisit: appointmentData.reasonForVisit,
          notes: appointmentData.notes,
        };

        const result = await appointmentRepository.create(
          domainAppointmentData
        );

        if (!result.success) {
          if (result.error.type === "ConflictError") {
            reply.code(409);
            return {
              error: "Appointment conflict detected",
              details: result.error,
            };
          }
          reply.code(500);
          return {
            error: "Failed to create appointment",
            details: result.error,
          };
        }

        reply.code(201);
        return { appointment: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // ✏️ PUT /appointments/:id - Update appointment
  fastify.put<{
    Params: AppointmentIdParam;
    Body: UpdateAppointmentRequest;
  }>(
    "/appointments/:id",
    {
      preHandler: [
        validateParams(AppointmentIdParamSchema),
        validateRequest(UpdateAppointmentSchema),
      ],
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const updateData = (request as any).validatedBody;
        const appointmentId = createAppointmentId(id);

        // Convert to domain objects where needed
        const domainUpdateData: any = {};
        if (updateData.type)
          domainUpdateData.type = updateData.type as AppointmentType;
        if (updateData.status)
          domainUpdateData.status = updateData.status as AppointmentStatus;
        if (updateData.scheduledDateTime) {
          domainUpdateData.scheduledDateTime = new Date(
            updateData.scheduledDateTime
          );
        }
        if (updateData.durationMinutes)
          domainUpdateData.duration = new AppointmentDuration(
            updateData.durationMinutes
          );
        if (updateData.reasonForVisit !== undefined)
          domainUpdateData.reasonForVisit = updateData.reasonForVisit;
        if (updateData.notes !== undefined)
          domainUpdateData.notes = updateData.notes;

        const result = await appointmentRepository.update(
          appointmentId,
          domainUpdateData
        );

        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Appointment not found" };
          }
          if (result.error.type === "ConflictError") {
            reply.code(409);
            return {
              error: "Appointment conflict detected",
              details: result.error,
            };
          }
          reply.code(500);
          return {
            error: "Failed to update appointment",
            details: result.error,
          };
        }

        return { appointment: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // 🔄 PATCH /appointments/:id/status - Update appointment status only
  fastify.patch<{
    Params: AppointmentIdParam;
    Body: UpdateAppointmentStatusRequest;
  }>(
    "/appointments/:id/status",
    {
      preHandler: [
        validateParams(AppointmentIdParamSchema),
        validateRequest(UpdateAppointmentStatusSchema),
      ],
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const { status } = (request as any).validatedBody;
        const appointmentId = createAppointmentId(id);

        const result = await appointmentRepository.updateStatus(
          appointmentId,
          status as AppointmentStatus
        );

        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Appointment not found" };
          }
          reply.code(500);
          return {
            error: "Failed to update appointment status",
            details: result.error,
          };
        }

        return { appointment: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // 🗑️ DELETE /appointments/:id - Cancel appointment
  fastify.delete<{ Params: AppointmentIdParam }>(
    "/appointments/:id",
    {
      preHandler: validateParams(AppointmentIdParamSchema),
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const appointmentId = createAppointmentId(id);

        const result = await appointmentRepository.delete(appointmentId);

        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Appointment not found" };
          }
          reply.code(500);
          return {
            error: "Failed to cancel appointment",
            details: result.error,
          };
        }

        reply.code(204);
        return;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );
};

export default appointmentRoutes;
