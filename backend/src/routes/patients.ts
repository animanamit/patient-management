import { FastifyPluginAsync } from "fastify";
import { PrismaPatientRepository } from "../domain/repositories/implementations/prisma-patient-repository";
import {
  EmailAddress,
  PhoneNumber,
  createPatientId,
} from "../domain/entities/shared-types";
import {
  CreatePatientSchema,
  UpdatePatientSchema,
  PatientQuerySchema,
  PatientIdParamSchema,
  CreatePatientRequest,
  PatientQueryParams,
  PatientIdParam,
  UpdatePatientRequest,
} from "../schemas/patient-schemas";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation";

const patientRoutes: FastifyPluginAsync = async function (fastify) {
  // Initialize repository
  const patientRepository = new PrismaPatientRepository();

  // GET /patients - List patients with filtering
  fastify.get<{
    Querystring: PatientQueryParams;
  }>(
    "/patients",
    {
      preHandler: validateQuery(PatientQuerySchema),
    },
    async (request, reply) => {
      try {
        const query = (request as any).validatedQuery;

        // Build filters
        const filters: any = {};
        if (query.email) filters.email = new EmailAddress(query.email);
        if (query.phone) filters.phone = new PhoneNumber(query.phone);

        // Call repository
        const result = await patientRepository.findMany(filters, {
          limit: query.limit,
          offset: query.offset,
        });

        if (!result.success) {
          reply.code(500);
          return { error: "Failed to fetch patients", details: result.error };
        }

        return {
          patients: result.data.patients,
          totalCount: result.data.totalCount,
          pagination: {
            limit: query.limit,
            offset: query.offset,
            hasMore: result.data.totalCount > query.offset + query.limit,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // GET /patients/:id - Get single patient
  fastify.get<{
    Params: PatientIdParam;
  }>(
    "/patients/:id",
    {
      preHandler: validateParams(PatientIdParamSchema),
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const patientId = createPatientId(id);

        const result = await patientRepository.findById(patientId);

        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Patient not found" };
          }
          reply.code(500);
          return { error: "Failed to fetch patient", details: result.error };
        }

        return { patient: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // POST /patients - Create new patient
  fastify.post<{
    Body: CreatePatientRequest;
  }>(
    "/patients",
    {
      preHandler: validateRequest(CreatePatientSchema),
    },
    async (request, reply) => {
      try {
        const patientData = (request as any).validatedBody;

        // Convert to domain objects
        const domainPatientData = {
          clerkUserId: patientData.clerkUserId,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: new EmailAddress(patientData.email),
          phone: new PhoneNumber(patientData.phone),
          dateOfBirth: new Date(patientData.dateOfBirth),
          address: patientData.address,
        };

        const result = await patientRepository.create(domainPatientData);

        if (!result.success) {
          if (result.error.type === "ConflictError") {
            reply.code(409);
            return { error: "Patient already exists", details: result.error };
          }
          reply.code(500);
          return { error: "Failed to create patient", details: result.error };
        }

        reply.code(201);
        return { patient: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // PUT /patients/:id - Update patient
  fastify.put<{
    Params: PatientIdParam;
    Body: UpdatePatientRequest;
  }>(
    "/patients/:id",
    {
      preHandler: [
        validateParams(PatientIdParamSchema),
        validateRequest(UpdatePatientSchema),
      ],
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const updateData = (request as any).validatedBody;
        const patientId = createPatientId(id);

        // Convert to domain objects where needed
        const domainUpdateData: any = {};
        if (updateData.firstName)
          domainUpdateData.firstName = updateData.firstName;
        if (updateData.lastName)
          domainUpdateData.lastName = updateData.lastName;
        if (updateData.email)
          domainUpdateData.email = new EmailAddress(updateData.email);
        if (updateData.phone)
          domainUpdateData.phone = new PhoneNumber(updateData.phone);
        if (updateData.address !== undefined)
          domainUpdateData.address = updateData.address;

        const result = await patientRepository.update(
          patientId,
          domainUpdateData
        );

        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Patient not found" };
          }
          reply.code(500);
          return { error: "Failed to update patient", details: result.error };
        }

        return { patient: result.data };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return { error: "Internal server error" };
      }
    }
  );

  // DELETE /patients/:id - Delete patient
  fastify.delete<{
    Params: PatientIdParam;
  }>(
    "/patients/:id",
    {
      preHandler: validateParams(PatientIdParamSchema),
    },
    async (request, reply) => {
      try {
        const { id } = (request as any).validatedParams;
        const patientId = createPatientId(id);

        const result = await patientRepository.delete(patientId);

        if (!result.success) {
          if (result.error.type === "NotFound") {
            reply.code(404);
            return { error: "Patient not found" };
          }
          reply.code(500);
          return { error: "Failed to delete patient", details: result.error };
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

export default patientRoutes;
