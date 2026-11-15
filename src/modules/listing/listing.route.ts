import { Router } from "express";
import { auth, optionalAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { upload } from "../../middlewares/upload.js";
import { MAX_LISTING_IMAGES } from "../../config/constants.js";
import {
  idParamSchema,
  createListingSchema,
  updateListingSchema,
  listListingsQuerySchema,
  myListingsQuerySchema,
} from "./listing.validation.js";
import * as listingController from "./listing.controller.js";

const router = Router();

// public
router.get(
  "/",
  optionalAuth,
  validate({ query: listListingsQuerySchema }),
  listingController.getListings,
);

// must stay above "/:id", otherwise "mine" is read as an id
router.get(
  "/mine",
  auth("LANDLORD"),
  validate({ query: myListingsQuerySchema }),
  listingController.getMyListings,
);

router.get(
  "/:id",
  optionalAuth,
  validate({ params: idParamSchema }),
  listingController.getListing,
);

// landlord only
router.post(
  "/",
  auth("LANDLORD"),
  validate({ body: createListingSchema }),
  listingController.createListing,
);

router.patch(
  "/:id",
  auth("LANDLORD"),
  validate({ params: idParamSchema, body: updateListingSchema }),
  listingController.updateListing,
);

router.patch(
  "/:id/rented",
  auth("LANDLORD"),
  validate({ params: idParamSchema }),
  listingController.markRented,
);

router.delete(
  "/:id",
  auth("LANDLORD"),
  validate({ params: idParamSchema }),
  listingController.deleteListing,
);

router.post(
  "/:id/images",
  auth("LANDLORD"),
  validate({ params: idParamSchema }),
  upload.array("images", MAX_LISTING_IMAGES),
  listingController.uploadImages,
);

export default router;