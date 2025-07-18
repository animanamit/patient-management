import Fastify from "fastify";
import { env } from "./config/environment";
import { checkDatabaseConnection } from "./config/database";

// Create Fastify instance with logging configuration
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "info" : "warn",
  },
});

// Server startup function
const start = async () => {
  try {
    // 1. Check database connection first
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      throw new Error("Database connection failed");
    }

    // 2. Register plugins (you'll add these in later steps)
    await fastify.register(import("./plugins/cors"));
    await fastify.register(import("./plugins/security"));
    await fastify.register(import("./plugins/error-handler"));
    await fastify.register(import("./routes/health"));
    await fastify.register(import("./routes/patients"), { prefix: "/api" });
    await fastify.register(import("./routes/doctors"), { prefix: "/api" });
    await fastify.register(import("./routes/appointments"), { prefix: "/api" });
    await fastify.register(import("./routes/sms.routes"), { prefix: "/api/sms" });

    // 3. Start server
    await fastify.listen({
      port: env.PORT,
      host: "0.0.0.0", // Allow external connections
    });

    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await fastify.close();
  process.exit(0);
});

// Start the server
start();
