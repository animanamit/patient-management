import fp from "fastify-plugin";
import cors from "@fastify/cors";
import { env } from "../config/environment.js";

export default fp(async function corsPlugin(fastify) {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Debug logging
      console.log(`🌐 CORS Check - Origin: ${origin}`);
      console.log(`🌐 CORS Check - FRONTEND_URL: ${env.FRONTEND_URL}`);
      console.log(`🌐 CORS Check - NODE_ENV: ${env.NODE_ENV}`);
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) {
        console.log("✅ CORS: Allowing request with no origin");
        return cb(null, true);
      }
      
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
      
      console.log(`🌐 CORS Check - Allowed origins:`, allowedOrigins);
      
      // Check if origin is allowed
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          const matches = origin === allowed;
          console.log(`🌐 CORS Check - String match "${origin}" === "${allowed}": ${matches}`);
          return matches;
        }
        if (allowed instanceof RegExp) {
          const matches = allowed.test(origin);
          console.log(`🌐 CORS Check - Regex match "${origin}" against ${allowed}: ${matches}`);
          return matches;
        }
        return false;
      });
      
      console.log(`🌐 CORS Decision: ${isAllowed ? "✅ ALLOWED" : "❌ REJECTED"}`);
      return cb(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
});
