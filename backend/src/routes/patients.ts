import { Hono } from "hono";
import { PrismaPatientRepository } from "../domain/repositories/implementations/prisma-patient-repository.js";
import {
  EmailAddress,
  PhoneNumber,
  createPatientId,
} from "../domain/entities/shared-types.js";
import {
  CreatePatientSchema,
  UpdatePatientSchema,
  PatientQuerySchema,
  PatientIdParamSchema,
  CreatePatientRequest,
  PatientQueryParams,
  PatientIdParam,
  UpdatePatientRequest,
} from "../schemas/patient-schemas.js";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation.js";

const app = new Hono();

// Initialize repository
const patientRepository = new PrismaPatientRepository();

// GET /patients - List patients with filtering
app.get(
  "/",
  validateQuery(PatientQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid("query");

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
        return c.json({ error: "Failed to fetch patients", details: result.error }, 500);
      }

      return c.json({
        patients: result.data.patients,
        totalCount: result.data.totalCount,
        pagination: {
          limit: query.limit,
          offset: query.offset,
          hasMore: result.data.totalCount > query.offset + query.limit,
        },
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET /patients/:id - Get single patient
app.get(
  "/:id",
  validateParams(PatientIdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const patientId = createPatientId(id);

      const result = await patientRepository.findById(patientId);

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Patient not found" }, 404);
        }
        return c.json({ error: "Failed to fetch patient", details: result.error }, 500);
      }

      return c.json({ patient: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// POST /patients - Create new patient
app.post(
  "/",
  validateRequest(CreatePatientSchema),
  async (c) => {
    try {
      const patientData = c.req.valid("json");

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
          return c.json({ error: "Patient already exists", details: result.error }, 409);
        }
        return c.json({ error: "Failed to create patient", details: result.error }, 500);
      }

      return c.json({ patient: result.data }, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// PUT /patients/:id - Update patient
app.put(
  "/:id",
  validateParams(PatientIdParamSchema),
  validateRequest(UpdatePatientSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const updateData = c.req.valid("json");
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
          return c.json({ error: "Patient not found" }, 404);
        }
        return c.json({ error: "Failed to update patient", details: result.error }, 500);
      }

      return c.json({ patient: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// DELETE /patients/:id - Delete patient
app.delete(
  "/:id",
  validateParams(PatientIdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const patientId = createPatientId(id);

      const result = await patientRepository.delete(patientId);

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Patient not found" }, 404);
        }
        return c.json({ error: "Failed to delete patient", details: result.error }, 500);
      }

      return c.body(null, 204);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

export default app;