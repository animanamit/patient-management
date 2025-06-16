import { FastifyPluginAsync } from "fastify";
import { checkDatabaseConnection } from "../config/database";

const healthRoutes: FastifyPluginAsync = async function (fastify) {
  // Basic health check
  fastify.get("/health", async (request, reply) => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Detailed health check with database
  fastify.get("/health/detailed", async (request, reply) => {
    const dbHealthy = await checkDatabaseConnection();

    if (!dbHealthy) {
      reply.code(503);
      return {
        status: "unhealthy",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  });
};

export default healthRoutes;
