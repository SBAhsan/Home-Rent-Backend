import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.js";
import type { Role } from "../generated/prisma/client.js";

export function auth(...permittedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;

      const token = req.cookies?.accessToken
        ? req.cookies.accessToken
        : header?.startsWith("Bearer ")
          ? header.split(" ")[1]
          : header;

      if (!token) {
        throw new AppError("You are not logged in", 401);
      }

      const { userId } = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, phone: true, role: true, status: true },
      });

      if (!user) {
        throw new AppError("User does not exist. Please register", 401);
      }

      if (user.status === "SUSPENDED") {
        throw new AppError("Your account is suspended", 403);
      }

      if (permittedRoles.length && !permittedRoles.includes(user.role)) {
        throw new AppError("You have no access to this resource", 403);
      }

      req.user = { id: user.id, name: user.name, phone: user.phone, role: user.role };
      next();
    } catch (error) {
      next(error);
    }
  };
}