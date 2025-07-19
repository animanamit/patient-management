import { FastifyPluginAsync } from "fastify";
import { PrismaDoctorRepository } from "../domain/repositories/implementations/prisma-doctor-repository.js";
import { EmailAddress, createDoctorId } from "../domain/entities/shared-types.js";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation.js";

// ✅ Fix the import path
import {
  CreateDoctorRequest,
  CreateDoctorSchema,
  UpdateDoctorRequest,
  UpdateDoctorSchema,
  DoctorIdParam,
  DoctorIdParamSchema,
  DoctorQueryParams,
  DoctorQuerySchema,
} from "../schemas/doctor-schemas.js";

export const doctorRoutes: FastifyPluginAsync = async function (fastify) {
  const doctorRepository = new PrismaDoctorRepository();

  fastify.post<{ Body: CreateDoctorRequest }>(
    "/doctors",
    {
      preHandler: validateRequest(CreateDoctorSchema),
    },
    async (request, reply) => {
      try {
        const doctorData = (request as any).validatedBody;

        const domainDoctorData = {
          clerkUserId: doctorData.clerkUserId,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: new EmailAddress(doctorData.email),
          specialization: doctorData.specialization,
          isActive: doctorData.isActive,
        };

        const result = await doctorRepository.create(domainDoctorData);

        if (!result.success) {
          if (result.error.type === "ConflictError") {
            reply.code(409); // Conflict (doctor already exists)
            return { error: "Doctor already exists", details: result.error };
          }
          reply.code(500);
          return { error: "Failed to create doctor", details: result.error };
        }

        reply.code(201);
        return { 
          doctor: {
            ...result.data,
            email: result.data.email.getValue()
          }
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  fastify.get<{ Params: { id: DoctorIdParam } }>(
    "/doctors/:id",
    {
      preHandler: validateParams(DoctorIdParamSchema),
    },
    async (request, reply) => {
      try {
        const params = (request as any).validatedParams;
        const doctorId = createDoctorId(params.id);
        const result = await doctorRepository.findById(doctorId);
        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Doctor not found" };
          }
          reply.code(500);
          return { error: "Failed to fetch doctor", details: result.error };
        }
        return { 
          doctor: {
            ...result.data,
            email: result.data.email.getValue()
          }
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  fastify.get<{ Querystring: DoctorQueryParams }>(
    "/doctors",
    {
      preHandler: validateQuery(DoctorQuerySchema),
    },
    async (request, reply) => {
      try {
        // Get the validated query parameters
        const query = (request as any).validatedQuery;

        // If they want active doctors only
        if (query.isActive === "true") {
          const result = await doctorRepository.findActiveDoctors();
          if (!result.success) {
            reply.code(500);
            return { error: "Failed to fetch doctors" };
          }
          return { 
            doctors: result.data.map(doctor => ({
              ...doctor,
              email: doctor.email.getValue()
            }))
          };
        }

        // If they want doctors by specialization
        if (query.specialization) {
          const result = await doctorRepository.findBySpecialization(
            query.specialization
          );
          if (!result.success) {
            reply.code(500);
            return { error: "Failed to fetch doctors" };
          }
          return { 
            doctors: result.data.map(doctor => ({
              ...doctor,
              email: doctor.email.getValue()
            }))
          };
        }

        // Default: get active doctors
        const result = await doctorRepository.findActiveDoctors();
        if (!result.success) {
          reply.code(500);
          return { error: "Failed to fetch doctors" };
        }
        return { doctors: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // ✏️ PATCH /doctors/:id - Update doctor
  fastify.patch<{ 
    Params: DoctorIdParam, 
    Body: UpdateDoctorRequest 
  }>(
    "/doctors/:id",
    {
      preHandler: [
        validateParams(DoctorIdParamSchema),
        validateRequest(UpdateDoctorSchema)
      ]
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const updateData = (request as any).validatedBody;
        const doctorId = createDoctorId(id);

        // Convert to domain objects where needed
        const domainUpdateData: any = {};
        if (updateData.firstName) domainUpdateData.firstName = updateData.firstName;
        if (updateData.lastName) domainUpdateData.lastName = updateData.lastName;
        if (updateData.email) domainUpdateData.email = new EmailAddress(updateData.email);
        if (updateData.specialization !== undefined) domainUpdateData.specialization = updateData.specialization;
        if (updateData.isActive !== undefined) domainUpdateData.isActive = updateData.isActive;

        const result = await doctorRepository.update(doctorId, domainUpdateData);

        if (!result.success) {
          if (result.error.type === 'NotFound') {
            reply.code(404);
            return { error: "Doctor not found" };
          }
          reply.code(500);
          return { error: "Failed to update doctor", details: result.error };
        }

        return { 
          doctor: {
            ...result.data,
            email: result.data.email.getValue()
          }
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // 🗑️ DELETE /doctors/:id - Delete doctor
  fastify.delete<{ Params: DoctorIdParam }>(
    "/doctors/:id",
    {
      preHandler: validateParams(DoctorIdParamSchema),
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const doctorId = createDoctorId(id);

        const result = await doctorRepository.delete(doctorId);

        if (!result.success) {
          if (result.error.type === 'NotFound') {
            reply.code(404);
            return { error: "Doctor not found" };
          }
          if (result.error.type === 'ConflictError') {
            reply.code(409);
            return { error: "Cannot delete doctor with existing appointments", details: result.error };
          }
          reply.code(500);
          return { error: "Failed to delete doctor", details: result.error };
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

export default doctorRoutes;
