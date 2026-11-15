import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { signToken } from "../../utils/jwt.js";
import { otpService } from "../../services/otp.service.js";
import { publicUserSelect } from "../user/user.service.js";
import type { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput } from "./auth.validation.js";
import type { AuthResult } from "./auth.interface.js";

const registerInDB = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await prisma.user.findUnique({ where: { phone: input.phone } });

  if (existing) {
    throw new AppError("This phone number is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      phone: input.phone,
      passwordHash,
      role: input.role,
    },
    select: publicUserSelect,
  });

  const token = signToken({ userId: user.id, role: user.role });
  return { user, token };
};

const loginFromDB = async (input: LoginInput): Promise<AuthResult> => {
  const found = await prisma.user.findUnique({
    where: { phone: input.phone },
    select: { ...publicUserSelect, passwordHash: true },
  });

  // same message for both cases so nobody can guess which phones exist
  if (!found) {
    throw new AppError("Invalid phone or password", 401);
  }

  const isMatch = await bcrypt.compare(input.password, found.passwordHash);

  if (!isMatch) {
    throw new AppError("Invalid phone or password", 401);
  }

  if (found.status === "SUSPENDED") {
    throw new AppError("Your account is suspended", 403);
  }

  const { passwordHash, ...user } = found;
  const token = signToken({ userId: user.id, role: user.role });
  return { user, token };
};

const sendOtp = async (input: SendOtpInput) => {
  const user = await prisma.user.findUnique({ where: { phone: input.phone } });

  if (!user) {
    throw new AppError("No account found with this phone number", 404);
  }

  await otpService.sendOtp(input.phone);
};

const verifyOtp = async (input: VerifyOtpInput) => {
  await otpService.verifyOtp(input.phone, input.code);

  await prisma.user.update({
    where: { phone: input.phone },
    data: { isPhoneVerified: true },
  });
};

export const authService = {
  registerInDB,
  loginFromDB,
  sendOtp,
  verifyOtp,
};