import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { verifyToken } from "../utils/jwt.js";
import type { Role } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        phone: string;
        role: Role;
      };
    }
  }
}

const getToken = (req: Request) => {
  const header = req.headers.authorization;

  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }

  return header?.startsWith("Bearer ") ? header.split(" ")[1] : header;
};

export function auth(...permittedRoles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = getToken(req);

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

// for public routes that show a bit more to logged in users
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getToken(req);

    if (token) {
      const { userId } = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, phone: true, role: true, status: true },
      });

      if (user && user.status === "ACTIVE") {
        req.user = { id: user.id, name: user.name, phone: user.phone, role: user.role };
      }
    }
  } catch {
    // bad or expired token: treat the request as a guest
  }

  next();
}