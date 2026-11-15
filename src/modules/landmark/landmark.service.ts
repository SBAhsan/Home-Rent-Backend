import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { areaService } from "../area/area.service.js";
import type { LandmarkItem } from "./landmark.interface.js";
import type { CreateLandmarkInput, UpdateLandmarkInput } from "./landmark.validation.js";

const landmarkSelect = { id: true, name: true, nameBn: true, areaId: true } as const;

const getLandmarksByAreaFromDB = async (areaId: string): Promise<LandmarkItem[]> => {
  await areaService.checkAreaExists(areaId);

  return prisma.landmark.findMany({
    where: { areaId },
    select: landmarkSelect,
    orderBy: { name: "asc" },
  });
};

const createLandmarkInDB = async (input: CreateLandmarkInput) => {
  await areaService.checkAreaExists(input.areaId);

  return prisma.landmark.create({ data: input, select: landmarkSelect });
};

const updateLandmarkInDB = async (id: string, input: UpdateLandmarkInput) => {
  const landmark = await prisma.landmark.findUnique({ where: { id }, select: { id: true } });

  if (!landmark) {
    throw new AppError("Landmark not found", 404);
  }

  if (input.areaId) {
    await areaService.checkAreaExists(input.areaId);
  }

  return prisma.landmark.update({ where: { id }, data: input, select: landmarkSelect });
};

const deleteLandmarkFromDB = async (id: string) => {
  const landmark = await prisma.landmark.findUnique({
    where: { id },
    select: { _count: { select: { listings: true } } },
  });

  if (!landmark) {
    throw new AppError("Landmark not found", 404);
  }

  if (landmark._count.listings > 0) {
    throw new AppError("This landmark is used by listings, so it cannot be deleted", 400);
  }

  await prisma.landmark.delete({ where: { id } });
};

export const landmarkService = {
  getLandmarksByAreaFromDB,
  createLandmarkInDB,
  updateLandmarkInDB,
  deleteLandmarkFromDB,
};