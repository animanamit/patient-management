import { FastifyRequest, FastifyReply } from "fastify";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = <T>(schema: ZodSchema<T>) => {
  return (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    try {
      const result = schema.parse(request.body);
      (request as any).validatedBody = result;
      done();
    } catch (error) {
      if (error instanceof ZodError) {
        reply.code(400).send({
          error: "Validation Error",
          message: "Invalid request data",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      } else {
        done(error);
      }
    }
  };
};

export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    try {
      const result = schema.parse(request.params);
      (request as any).validatedParams = result;
      done();
    } catch (error) {
      if (error instanceof ZodError) {
        reply.code(400).send({
          error: "Invalid Parameters",
          details: error.errors,
        });
      } else {
        done(error);
      }
    }
  };
};

export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    try {
      const result = schema.parse(request.query);
      (request as any).validatedQuery = result;
      done();
    } catch (error) {
      if (error instanceof ZodError) {
        reply.code(400).send({
          error: "Invalid Query Parameters",
          details: error.errors,
        });
      } else {
        done(error);
      }
    }
  };
};
