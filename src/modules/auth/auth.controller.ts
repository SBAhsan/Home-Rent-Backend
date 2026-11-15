import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send-response.js";
import { authService } from "./auth.service.js";

export async function register(req: Request, res: Response) {
  const result = await authService.registerInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Account created",
    data: result,
  });
}

export async function login(req: Request, res: Response) {
  const result = await authService.loginFromDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Login successful",
    data: result,
  });
}

export async function sendOtp(req: Request, res: Response) {
  await authService.sendOtp(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Verification code sent",
    data: null,
  });
}

export async function verifyOtp(req: Request, res: Response) {
  await authService.verifyOtp(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Phone number verified",
    data: null,
  });
}