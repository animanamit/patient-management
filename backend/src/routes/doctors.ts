import { FastifyPluginAsync } from "fastify";
import { PrismaDoctorRepository } from "@domain/repositories/implementations/prisma-doctor-repository";

import {
  EmailAddress,
  PhoneNumber,
  createDoctorId,
} from "../domain/entities/shared-types";

import {
  validateRequest,
  validateParams,
  validateQuery,
} from "../utils/validation";

const doctorRoutes: FastifyPluginAsync = async function (fastify) {
  // Initialize repository
  const doctorRepository = new PrismaDoctorRepository();
};
