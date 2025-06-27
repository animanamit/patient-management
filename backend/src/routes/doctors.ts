import { FastifyPluginAsync } from "fastify";
import { PrismaDoctorRepository } from "@domain/repositories/implementations/prisma-doctor-repository";
import { EmailAddress, createDoctorId } from "../domain/entities/shared-types";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation";

// ✅ Fix the import path
import {
  CreateDoctorRequest,
  CreateDoctorSchema,
  DoctorQueryParams,
  DoctorQuerySchema,
} from "../schemas/doctor-schemas";

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
        return { doctor: result.data };
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
          return { doctors: result.data };
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
          return { doctors: result.data };
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
};
