import { Router } from "express";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import { publicAreaRoutes, adminAreaRoutes } from "./modules/area/area.route.js";
import adminLandmarkRoutes from "./modules/landmark/landmark.route.js";
import listingRoutes from "./modules/listing/listing.route.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/areas", publicAreaRoutes);
router.use("/admin/areas", adminAreaRoutes);
router.use("/admin/landmarks", adminLandmarkRoutes);
router.use("/listings", listingRoutes);

export default router;