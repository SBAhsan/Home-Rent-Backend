import type { Landmark } from "../../generated/prisma/client.js";

export type LandmarkItem = Pick<Landmark, "id" | "name" | "nameBn" | "areaId">;