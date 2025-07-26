import Fastify from "fastify";
import { env } from "./config/environment.js";
import { checkDatabaseConnection } from "./config/database.js";

// Create Fastify instance with logging configuration
const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "info" : "warn",
  },
});

// Add request logging hook
fastify.addHook('onRequest', async (request) => {
  console.log(`📥 Incoming request: ${request.method} ${request.url}`);
  console.log(`   From: ${request.headers['x-forwarded-for'] || request.ip}`);
  console.log(`   Host: ${request.headers.host}`);
});

// Server startup function
const start = async () => {
  try {
    // 1. Check database connection first
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.warn("⚠️  Database connection failed - starting server anyway");
      console.warn("⚠️  Some features may not work properly");
    }

    // 2. Register plugins (you'll add these in later steps)
    console.log("🔌 Registering CORS plugin...");
    await fastify.register(import("./plugins/cors.js"));
    console.log("🔒 Registering security plugin...");
    await fastify.register(import("./plugins/security.js"));
    console.log("❌ Registering error handler plugin...");
    await fastify.register(import("./plugins/error-handler.js"));
    
    // Add root endpoint for debugging
    fastify.get("/", async (request) => {
      console.log(`🚀 Root endpoint hit: ${request.method} ${request.url}`);
      return {
        message: "CarePulse API is running",
        status: "healthy",
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      };
    });
    
    // Add API prefix handler for debugging
    fastify.get("/api", async (request) => {
      console.log(`🚀 API root hit: ${request.method} ${request.url}`);
      return {
        message: "API endpoints available",
        endpoints: [
          "/api/appointments",
          "/api/patients", 
          "/api/doctors",
          "/api/sms/send",
          "/api/documents"
        ]
      };
    });
    
    // Add a simple test endpoint
    fastify.get("/api/test", async (request) => {
      console.log(`🧪 API test endpoint hit: ${request.method} ${request.url}`);
      return {
        message: "API test endpoint working",
        timestamp: new Date().toISOString(),
        headers: request.headers
      };
    });
    
    console.log("🩺 Registering health routes...");
    await fastify.register(import("./routes/health.js"));
    console.log("👥 Registering patient routes at /api prefix...");
    await fastify.register(import("./routes/patients.js"), { prefix: "/api" });
    console.log("👨‍⚕️ Registering doctor routes at /api prefix...");
    await fastify.register(import("./routes/doctors.js"), { prefix: "/api" });
    console.log("📅 Registering appointment routes at /api prefix...");
    await fastify.register(import("./routes/appointments.js"), { prefix: "/api" });
    console.log("📱 Registering SMS routes at /api/sms prefix...");
    await fastify.register(import("./routes/sms.routes.js"), { prefix: "/api/sms" });
    console.log("📄 Registering document routes at /api/documents prefix...");
    await fastify.register(import("./routes/documents.js"), { prefix: "/api/documents" });
    
    // Register authentication routes (no prefix needed - routes include /api/auth)
    console.log("🔐 Registering authentication routes...");
    await fastify.register(import("./routes/auth.routes.js"));
    
    // 3. Start server
    console.log(`⚡ Attempting to start server on port ${env.PORT}...`);
    console.log(`📡 ALL Environment variables:`, JSON.stringify(process.env, null, 2));
    try {
      const address = await fastify.listen({
        port: env.PORT,
        host: "0.0.0.0", // Allow external connections
        listenTextResolver: (address) => `Server listening at ${address}`
      });

      console.log(`🚀 Server running on ${address}`);
      console.log(`📡 Port: ${env.PORT}`);
      console.log(`📡 Raw PORT env: ${process.env.PORT}`);
      console.log(`📡 Raw API_PORT env: ${process.env.API_PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 FRONTEND_URL: ${env.FRONTEND_URL}`);
    } catch (listenError) {
      console.error(`❌ Failed to start server:`, listenError);
      throw listenError;
    }
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

// Start the server
start();
