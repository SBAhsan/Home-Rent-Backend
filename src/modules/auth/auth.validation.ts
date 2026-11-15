import { z } from "zod";

const phone = z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  phone,
  password: z.string().min(8).max(64),
  role: z.enum(["RENTER", "LANDLORD"]),
});

export const loginSchema = z.object({
  phone,
  password: z.string().min(1),
});

export const sendOtpSchema = z.object({ phone });

export const verifyOtpSchema = z.object({
  phone,
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;