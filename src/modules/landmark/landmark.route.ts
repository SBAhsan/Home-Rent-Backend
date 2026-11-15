import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  landmarkIdParamSchema,
  createLandmarkSchema,
  updateLandmarkSchema,
} from "./landmark.validation.js";
import * as landmarkController from "./landmark.controller.js";

// mounted at /admin/landmarks
const router = Router();

router.use(auth("ADMIN"));

router.post("/", validate({ body: createLandmarkSchema }), landmarkController.createLandmark);
router.patch(
  "/:id",
  validate({ params: landmarkIdParamSchema, body: updateLandmarkSchema }),
  landmarkController.updateLandmark,
);
router.delete(
  "/:id",
  validate({ params: landmarkIdParamSchema }),
  landmarkController.deleteLandmark,
);

export default router;