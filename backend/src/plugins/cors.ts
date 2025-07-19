import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { env } from "../config/environment.js";

export default fp(async function corsPlugin(fastify) {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return cb(null, true);
      
      // Development origins
      const devOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
      
      // Production origins (Vercel)
      const prodOrigins = [
        env.FRONTEND_URL,
        "https://patient-management-kohl.vercel.app",  // Your specific Vercel deployment
        /https:\/\/.*\.vercel\.app$/,  // Allow all Vercel preview deployments
        /https:\/\/patient-management-.*\.vercel\.app$/  // Your app pattern
      ];
      
      const allowedOrigins = env.NODE_ENV === "development" ? devOrigins : prodOrigins;
      
      // Check if origin is allowed
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });
      
      return cb(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
});
