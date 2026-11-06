import rateLimit from "express-rate-limit";

const windowMs = 15 * 60 * 1000;

export const authLimiter = rateLimit({
  windowMs,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again after 15 minutes" },
});

export const otpLimiter = rateLimit({
  windowMs,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests, please try again after 15 minutes" },
});