import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { Prisma } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import { MAX_LISTING_IMAGES } from "../config/constants.js";
import { AppError } from "../utils/app-error.js";

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  // our own errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  // zod validation errors
  if (error instanceof ZodError) {
    const errors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  // prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "This record already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  }

  // file upload errors
  if (error instanceof multer.MulterError) {
    let message = error.message;

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File is too large (max 5 MB)";
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Too many files or wrong field name (use "images", max ${MAX_LISTING_IMAGES})`;
    }

    return res.status(400).json({ success: false, message });
  }

  // bad JSON in the request body
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }

  // anything else
  console.error(error);

  const isProduction = env.NODE_ENV === "production";
  const message = !isProduction && error instanceof Error ? error.message : "Something went wrong";

  res.status(500).json({
    success: false,
    message,
    ...(!isProduction && error instanceof Error && { stack: error.stack }),
  });
}