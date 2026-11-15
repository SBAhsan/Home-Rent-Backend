import type { Request, Response } from "express";
import { sendResponse } from "../../utils/send-response.js";
import { listingService } from "./listing.service.js";
import type { ListListingsQuery, MyListingsQuery } from "./listing.validation.js";
import { UploadedFile } from "../../services/storage.service.js";

export async function getListings(req: Request, res: Response) {
  const query = req.query as unknown as ListListingsQuery;
  const { listings, meta } = await listingService.getListingsFromDB(query, Boolean(req.user));

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listings fetched",
    data: listings,
    meta,
  });
}

export async function getListing(req: Request, res: Response) {
  const listing = await listingService.getListingByIdFromDB(
    req.params.id as string,
    Boolean(req.user),
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing fetched",
    data: listing,
  });
}

export async function getMyListings(req: Request, res: Response) {
  const query = req.query as unknown as MyListingsQuery;
  const { listings, meta } = await listingService.getMyListingsFromDB(req.user!.id, query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Your listings fetched",
    data: listings,
    meta,
  });
}

export async function createListing(req: Request, res: Response) {
  const listing = await listingService.createListingInDB(req.user!.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Listing created",
    data: listing,
  });
}

export async function updateListing(req: Request, res: Response) {
  const listing = await listingService.updateListingInDB(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing updated",
    data: listing,
  });
}

export async function deleteListing(req: Request, res: Response) {
  await listingService.deleteListingFromDB(req.params.id as string, req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing deleted",
    data: null,
  });
}

export async function markRented(req: Request, res: Response) {
  const listing = await listingService.markRentedInDB(req.params.id as string, req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Listing marked as rented",
    data: listing,
  });
}

export async function uploadImages(req: Request, res: Response) {
  const files = (req as Request & { files?: UploadedFile[] }).files ?? [];
  const images = await listingService.addImagesInDB(req.params.id as string, req.user!.id, files);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Images uploaded",
    data: images,
  });
}