import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send-response.js";
import { areaService } from "./area.service.js";
import { landmarkService } from "../landmark/landmark.service.js";
import type { ListAreasQuery } from "./area.validation.js";

export async function getAreas(req: Request, res: Response) {
  const areas = await areaService.getAreasFromDB(req.query as ListAreasQuery);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Areas fetched",
    data: areas,
  });
}

export async function getAreaLandmarks(req: Request, res: Response) {
  const landmarks = await landmarkService.getLandmarksByAreaFromDB(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Landmarks fetched",
    data: landmarks,
  });
}

export async function createArea(req: Request, res: Response) {
  const area = await areaService.createAreaInDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Area created",
    data: area,
  });
}

export async function updateArea(req: Request, res: Response) {
  const area = await areaService.updateAreaInDB(req.params.id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Area updated",
    data: area,
  });
}

export async function deleteArea(req: Request, res: Response) {
  await areaService.deleteAreaFromDB(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Area deleted",
    data: null,
  });
}