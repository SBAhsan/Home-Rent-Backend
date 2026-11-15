import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}