import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send-response.js";
import { landmarkService } from "./landmark.service.js";

export async function createLandmark(req: Request, res: Response) {
  const landmark = await landmarkService.createLandmarkInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Landmark created",
    data: landmark,
  });
}

export async function updateLandmark(req: Request, res: Response) {
  const landmark = await landmarkService.updateLandmarkInDB(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Landmark updated",
    data: landmark,
  });
}

export async function deleteLandmark(req: Request, res: Response) {
  await landmarkService.deleteLandmarkFromDB(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Landmark deleted",
    data: null,
  });
}