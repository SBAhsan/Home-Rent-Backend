import type { Area } from "../../generated/prisma/client.js";

export type AreaItem = Pick<Area, "id" | "name" | "nameBn" | "parentId">;