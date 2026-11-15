import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { UpdateMeInput, ChangePasswordInput } from "./user.validation.js";

// fields we are allowed to send back to the client
export const publicUserSelect = {
  id: true,
  name: true,
  phone: true,
  role: true,
  isPhoneVerified: true,
  status: true,
  createdAt: true,
} as const;

const getMeFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const updateMeInDB = async (userId: string, input: UpdateMeInput) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name },
    select: publicUserSelect,
  });
};

const changePasswordInDB = async (userId: string, input: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Current password is wrong", 400);
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

export const userService = {
  getMeFromDB,
  updateMeInDB,
  changePasswordInDB,
};