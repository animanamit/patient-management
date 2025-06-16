import fp from "fastify-plugin";
import helmet from "@fastify/helmet";

export default fp(async function securityPlugin(fastify) {
  await fastify.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  });
});
