import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { env } from "../config/environment.js";

export default fp(async function corsPlugin(fastify) {
  await fastify.register(cors, {
    origin: true, // Allow all origins for now to debug
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Length", "Date", "X-Request-Id"],
  });
  
  console.log("🌐 CORS configured to allow all origins temporarily for debugging");
});
