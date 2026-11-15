import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  listAreasQuerySchema,
  areaIdParamSchema,
  createAreaSchema,
  updateAreaSchema,
} from "./area.validation.js";
import * as areaController from "./area.controller.js";

// mounted at /areas
export const publicAreaRoutes = Router();

publicAreaRoutes.get("/", validate({ query: listAreasQuerySchema }), areaController.getAreas);
publicAreaRoutes.get(
  "/:id/landmarks",
  validate({ params: areaIdParamSchema }),
  areaController.getAreaLandmarks,
);

// mounted at /admin/areas
export const adminAreaRoutes = Router();

adminAreaRoutes.use(auth("ADMIN"));

adminAreaRoutes.post("/", validate({ body: createAreaSchema }), areaController.createArea);
adminAreaRoutes.patch(
  "/:id",
  validate({ params: areaIdParamSchema, body: updateAreaSchema }),
  areaController.updateArea,
);
adminAreaRoutes.delete("/:id", validate({ params: areaIdParamSchema }), areaController.deleteArea);