import { Hono } from "hono";
import { checkDatabaseConnection } from "../config/database.js";

const app = new Hono();

// Basic health check
app.get("/", async (c) => {
  console.log(`🚀 HONO ROUTE HIT: ${c.req.method} ${c.req.url}`);
  console.log(`🌐 Health check origin: ${c.req.header("origin")}`);
  
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
  });
});

// Detailed health check with database
app.get("/detailed", async (c) => {
  const dbHealthy = await checkDatabaseConnection();

  if (!dbHealthy) {
    return c.json({
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    }, 503);
  }

  return c.json({
    status: "healthy",
    database: "connected",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

export default app;