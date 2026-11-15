import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { AreaItem } from "./area.interface.js";
import type { ListAreasQuery, CreateAreaInput, UpdateAreaInput } from "./area.validation.js";

const areaSelect = { id: true, name: true, nameBn: true, parentId: true } as const;

// also used by the landmark service
const checkAreaExists = async (id: string) => {
  const area = await prisma.area.findUnique({ where: { id }, select: { id: true } });

  if (!area) {
    throw new AppError("Area not found", 404);
  }
};

const getAreasFromDB = async (query: ListAreasQuery): Promise<AreaItem[]> => {
  const where =
    query.parentId === undefined
      ? {}
      : { parentId: query.parentId === "root" ? null : query.parentId };

  return prisma.area.findMany({
    where,
    select: areaSelect,
    orderBy: { name: "asc" },
  });
};

const createAreaInDB = async (input: CreateAreaInput) => {
  if (input.parentId) {
    await checkAreaExists(input.parentId);
  }

  return prisma.area.create({ data: input, select: areaSelect });
};

const updateAreaInDB = async (id: string, input: UpdateAreaInput) => {
  await checkAreaExists(id);

  if (input.parentId) {
    if (input.parentId === id) {
      throw new AppError("An area cannot be its own parent", 400);
    }
    await checkAreaExists(input.parentId);
  }

  return prisma.area.update({ where: { id }, data: input, select: areaSelect });
};

const deleteAreaFromDB = async (id: string) => {
  const area = await prisma.area.findUnique({
    where: { id },
    select: { _count: { select: { children: true, listings: true, landmarks: true } } },
  });

  if (!area) {
    throw new AppError("Area not found", 404);
  }

  if (area._count.children > 0) {
    throw new AppError("This area has sub-areas. Delete or move them first", 400);
  }

  if (area._count.listings > 0) {
    throw new AppError("This area has listings, so it cannot be deleted", 400);
  }

  if (area._count.landmarks > 0) {
    throw new AppError("This area has landmarks. Delete them first", 400);
  }

  await prisma.area.delete({ where: { id } });
};

export const areaService = {
  checkAreaExists,
  getAreasFromDB,
  createAreaInDB,
  updateAreaInDB,
  deleteAreaFromDB,
};