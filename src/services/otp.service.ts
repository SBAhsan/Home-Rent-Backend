import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { smsService } from "./sms.service.js";

const OTP_EXPIRY_MINUTES = 5;

const sendOtp = async (phone: string) => {
  // stop people from spamming new codes (SMS costs money)
  const recent = await prisma.otpCode.findFirst({
    where: { phone, createdAt: { gt: new Date(Date.now() - 60 * 1000) } },
  });

  if (recent) {
    throw new AppError(
      "Please wait a minute before asking for a new code",
      429,
    );
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.otpCode.create({
    data: {
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  });

  await smsService.sendSms(
    phone,
    `Your verification code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
  );
};

const verifyOtp = async (phone: string, code: string) => {
  // only the latest unused, unexpired code counts
  const otp = await prisma.otpCode.findFirst({
    where: { phone, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new AppError("Code is invalid or expired", 400);
  }

  const isMatch = await bcrypt.compare(code, otp.codeHash);

  if (!isMatch) {
    throw new AppError("Code is invalid or expired", 400);
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });
};

export const otpService = {
  sendOtp,
  verifyOtp,
};
