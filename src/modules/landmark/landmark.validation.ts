import { z } from "zod";

export const landmarkIdParamSchema = z.object({
  id: z.string().min(1),
});

export const createLandmarkSchema = z.object({
  name: z.string().trim().min(2).max(80),
  nameBn: z.string().trim().min(2).max(80),
  areaId: z.string().min(1),
});

export const updateLandmarkSchema = createLandmarkSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Send at least one field to update",
  });

export type CreateLandmarkInput = z.infer<typeof createLandmarkSchema>;
export type UpdateLandmarkInput = z.infer<typeof updateLandmarkSchema>;