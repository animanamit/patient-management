import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { env } from "../config/environment";

export default fp(async function corsPlugin(fastify) {
  await fastify.register(cors, {
    origin:
      env.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://127.0.0.1:3000"]
        : [env.FRONTEND_URL || "https://yourdomain.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});
