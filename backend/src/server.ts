import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { env } from "./config/environment.js";
import { checkDatabaseConnection } from "./config/database.js";
import { logger } from "hono/logger";

// Import routes
import patientRoutes from "./routes/patients.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import authRoutes from "./routes/auth.routes.js";
import smsRoutes from "./routes/sms.routes.js";
import documentRoutes from "./routes/documents.js";
import healthRoutes from "./routes/health.js";

// Create Hono app
const app = new Hono();

// Global middleware
app.use("*", logger());

// Server startup function
const start = async () => {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection();
    if (!dbConnected) {
      console.warn("⚠️  Database connection failed - starting server anyway");
      console.warn("⚠️  Some features may not work properly");
    }

    // Root endpoint
    app.get("/", (c) => {
      return c.json({
        message: "CarePulse API is running",
        status: "healthy",
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });

    // API root endpoint
    app.get("/api", (c) => {
      return c.json({
        message: "API endpoints available",
        endpoints: [
          "/api/appointments",
          "/api/patients",
          "/api/doctors",
          "/api/sms/send",
          "/api/documents",
        ],
      });
    });

    // API test endpoint
    app.get("/api/test", (c) => {
      return c.json({
        message: "API test endpoint working",
        timestamp: new Date().toISOString(),
      });
    });

    // Mount routes
    app.route("/api/health", healthRoutes);
    app.route("/api/patients", patientRoutes);
    app.route("/api/doctors", doctorRoutes);
    app.route("/api/appointments", appointmentRoutes);
    app.route("/api/sms", smsRoutes);
    app.route("/api/documents", documentRoutes);
    
    // Auth routes are special - they handle their own /api/auth prefix
    app.route("/", authRoutes);

    // Start server
    console.log(`⚡ Starting server on port ${env.PORT}...`);
    
    serve({
      fetch: app.fetch,
      port: env.PORT,
    }, (info) => {
      console.log(`🚀 Server running on http://localhost:${info.port}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 FRONTEND_URL: ${env.FRONTEND_URL}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

// Start the server
start();