import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { authLimiter } from "../../middlewares/rate-limit.js";
import { updateMeSchema, changePasswordSchema } from "./user.validation.js";
import * as userController from "./user.controller.js";

const router = Router();

router.get("/me", auth(), userController.getMe);
router.patch("/me", auth(), validate({ body: updateMeSchema }), userController.updateMe);
router.patch(
  "/me/password",
  auth(),
  authLimiter,
  validate({ body: changePasswordSchema }),
  userController.changePassword,
);

export default router;