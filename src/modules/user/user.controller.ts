import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send-response.js";
import { userService } from "./user.service.js";

export async function getMe(req: Request, res: Response) {
  const user = await userService.getMeFromDB(req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile fetched",
    data: user,
  });
}

export async function updateMe(req: Request, res: Response) {
  const user = await userService.updateMeInDB(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Profile updated",
    data: user,
  });
}

export async function changePassword(req: Request, res: Response) {
  await userService.changePasswordInDB(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Password changed",
    data: null,
  });
}