import { Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ZodSchema } from "zod";

// Hono's zValidator already handles validation errors nicely
// These are wrapper functions to maintain consistency with existing code

export const validateRequest = <T>(schema: ZodSchema<T>) => {
  return zValidator("json", schema);
};

export const validateParams = <T>(schema: ZodSchema<T>) => {
  return zValidator("param", schema);
};

export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return zValidator("query", schema);
};