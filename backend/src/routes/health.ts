import { FastifyPluginAsync } from "fastify";
import { checkDatabaseConnection } from "../config/database.js";

const healthRoutes: FastifyPluginAsync = async function (fastify) {
  // Basic health check
  fastify.get("/health", async (request, _reply) => {
    console.log(`🚀 FASTIFY ROUTE HIT: ${request.method} ${request.url}`);
    console.log(`🌐 Health check origin: ${request.headers.origin}`);
    
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: process.env.PORT,
      nodeEnv: process.env.NODE_ENV,
    };
  });

  // Detailed health check with database
  fastify.get("/health/detailed", async (_request, reply) => {
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
