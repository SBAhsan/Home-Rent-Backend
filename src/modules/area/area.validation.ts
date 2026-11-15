import { z } from "zod";

export const listAreasQuerySchema = z.object({
  parentId: z.string().min(1).optional(),
});

export const areaIdParamSchema = z.object({
  id: z.string().min(1),
});

export const createAreaSchema = z.object({
  name: z.string().trim().min(2).max(60),
  nameBn: z.string().trim().min(2).max(60),
  parentId: z.string().min(1).nullable().optional(),
});

export const updateAreaSchema = createAreaSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Send at least one field to update",
  });

export type ListAreasQuery = z.infer<typeof listAreasQuerySchema>;
export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;