import fp from "fastify-plugin";
import { FastifyError } from "fastify";

export default fp(async function errorHandler(fastify) {
  fastify.setErrorHandler(async (error: FastifyError, _request, reply) => {
    fastify.log.error(error);

    // Handle different error types
    if (error.validation) {
      reply.code(400).send({
        error: "Validation Error",
        message: "Invalid request data",
        details: error.validation,
      });
      return;
    }

    if (error.statusCode === 404) {
      reply.code(404).send({
        error: "Not Found",
        message: "The requested resource was not found",
      });
      return;
    }

    // Generic server error
    const statusCode = error.statusCode || 500;
    const message =
      process.env.NODE_ENV === "development"
        ? error.message
        : "Internal Server Error";

    reply.code(statusCode).send({
      error: "Server Error",
      message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  });

  // Handle 404 for undefined routes
  fastify.setNotFoundHandler(async (request, reply) => {
    console.log(`❌ Route not found: ${request.method} ${request.url}`);
    console.log(`   Headers: ${JSON.stringify(request.headers)}`);
    reply.code(404).send({
      error: "Not Found",
      message: `Route ${request.method} ${request.url} not found`,
      timestamp: new Date().toISOString()
    });
  });
});
