import { Hono } from "hono";
import { PrismaDoctorRepository } from "../domain/repositories/implementations/prisma-doctor-repository.js";
import { EmailAddress, createDoctorId } from "../domain/entities/shared-types.js";
import {
  CreateDoctorSchema,
  UpdateDoctorSchema,
  DoctorQuerySchema,
  DoctorIdParamSchema,
  CreateDoctorRequest,
  DoctorQueryParams,
  DoctorIdParam,
  UpdateDoctorRequest,
} from "../schemas/doctor-schemas.js";
import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation.js";

const app = new Hono();

// Initialize repository
const doctorRepository = new PrismaDoctorRepository();

// GET /doctors - List doctors with filtering
app.get(
  "/",
  validateQuery(DoctorQuerySchema),
  async (c) => {
    try {
      const query = c.req.valid("query");

      // Build filters
      const filters: any = {};
      
      // Handle isActive filter
      if (query.isActive !== undefined) {
        filters.isActive = query.isActive === "true";
      }
      
      if (query.specialization) {
        filters.specialization = query.specialization;
      }

      // If search is provided, we'll need to filter results manually
      let doctors;
      if (filters.specialization) {
        const result = await doctorRepository.findBySpecialization(filters.specialization);
        if (!result.success) {
          return c.json({ error: "Failed to fetch doctors", details: result.error }, 500);
        }
        doctors = result.data;
      } else if (filters.isActive === true) {
        const result = await doctorRepository.findActiveDoctors();
        if (!result.success) {
          return c.json({ error: "Failed to fetch doctors", details: result.error }, 500);
        }
        doctors = result.data;
      } else {
        // For now, get all active doctors and filter
        const result = await doctorRepository.findActiveDoctors();
        if (!result.success) {
          return c.json({ error: "Failed to fetch doctors", details: result.error }, 500);
        }
        doctors = result.data;
        
        // Apply isActive=false filter if needed
        if (filters.isActive === false) {
          doctors = doctors.filter(d => !d.isActive);
        }
      }

      // Apply search filter if provided
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        doctors = doctors.filter(
          d => 
            d.firstName.toLowerCase().includes(searchLower) ||
            d.lastName.toLowerCase().includes(searchLower)
        );
      }

      // Apply name filters if provided
      if (query.firstName) {
        doctors = doctors.filter(
          d => d.firstName.toLowerCase().includes(query.firstName!.toLowerCase())
        );
      }
      
      if (query.lastName) {
        doctors = doctors.filter(
          d => d.lastName.toLowerCase().includes(query.lastName!.toLowerCase())
        );
      }

      return c.json({
        doctors,
        totalCount: doctors.length,
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET /doctors/:id - Get single doctor
app.get(
  "/:id",
  validateParams(DoctorIdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const doctorId = createDoctorId(id);

      const result = await doctorRepository.findById(doctorId);

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Doctor not found" }, 404);
        }
        return c.json({ error: "Failed to fetch doctor", details: result.error }, 500);
      }

      return c.json({ doctor: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET /doctors/by-clerk-id/:clerkUserId - Get doctor by Clerk user ID
app.get(
  "/by-clerk-id/:clerkUserId",
  async (c) => {
    try {
      const clerkUserId = c.req.param("clerkUserId");

      const result = await doctorRepository.findByClerkUserId(clerkUserId);

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Doctor not found" }, 404);
        }
        return c.json({ error: "Failed to fetch doctor", details: result.error }, 500);
      }

      return c.json({ doctor: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// POST /doctors - Create new doctor
app.post(
  "/",
  validateRequest(CreateDoctorSchema),
  async (c) => {
    try {
      const doctorData = c.req.valid("json");

      // Convert to domain objects
      const domainDoctorData = {
        clerkUserId: doctorData.clerkUserId,
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: new EmailAddress("doctor@example.com"), // This should come from Clerk/Auth
        specialization: doctorData.specialization || null,
        isActive: doctorData.isActive,
      };

      const result = await doctorRepository.create(domainDoctorData);

      if (!result.success) {
        if (result.error.type === "ConflictError") {
          return c.json({ error: "Doctor already exists", details: result.error }, 409);
        }
        return c.json({ error: "Failed to create doctor", details: result.error }, 500);
      }

      return c.json({ doctor: result.data }, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// PUT /doctors/:id - Update doctor
app.put(
  "/:id",
  validateParams(DoctorIdParamSchema),
  validateRequest(UpdateDoctorSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const updateData = c.req.valid("json");
      const doctorId = createDoctorId(id);

      // Convert to domain objects where needed
      const domainUpdateData: any = {};
      if (updateData.firstName !== undefined)
        domainUpdateData.firstName = updateData.firstName;
      if (updateData.lastName !== undefined)
        domainUpdateData.lastName = updateData.lastName;
      if (updateData.specialization !== undefined)
        domainUpdateData.specialization = updateData.specialization;
      if (updateData.isActive !== undefined)
        domainUpdateData.isActive = updateData.isActive;

      const result = await doctorRepository.update(
        doctorId,
        domainUpdateData
      );

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Doctor not found" }, 404);
        }
        return c.json({ error: "Failed to update doctor", details: result.error }, 500);
      }

      return c.json({ doctor: result.data });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// DELETE /doctors/:id - Delete doctor
app.delete(
  "/:id",
  validateParams(DoctorIdParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const doctorId = createDoctorId(id);

      const result = await doctorRepository.delete(doctorId);

      if (!result.success) {
        if (result.error.type === "NotFound") {
          return c.json({ error: "Doctor not found" }, 404);
        }
        return c.json({ error: "Failed to delete doctor", details: result.error }, 500);
      }

      return c.body(null, 204);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Internal server error" }, 500);
    }
  }
);

// GET /doctors/specializations/list - Get list of unique specializations
app.get("/specializations/list", async (c) => {
  try {
    // For now, return a predefined list
    const specializations = [
      "Cardiology",
      "Dermatology",
      "Endocrinology",
      "Gastroenterology",
      "General Practice",
      "Neurology",
      "Oncology",
      "Orthopedics",
      "Pediatrics",
      "Psychiatry",
      "Radiology",
      "Surgery"
    ];

    return c.json({ specializations });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;