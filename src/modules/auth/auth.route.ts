import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authLimiter, otpLimiter } from "../../middlewares/rate-limit.js";
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "./auth.validation.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  authController.register,
);
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  authController.login,
);
router.post(
  "/otp/send",
  otpLimiter,
  validate({ body: sendOtpSchema }),
  authController.sendOtp,
);
router.post(
  "/otp/verify",
  otpLimiter,
  validate({ body: verifyOtpSchema }),
  authController.verifyOtp,
);

export default router;
