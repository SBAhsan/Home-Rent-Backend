import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { LISTING_VALID_DAYS, MAX_LISTING_IMAGES } from "../../config/constants.js";
import { areaService } from "../area/area.service.js";
import { storageService, UploadedFile } from "../../services/storage.service.js";
import type { Prisma, ListingStatus } from "../../generated/prisma/client.js";
import type { PageMeta } from "./listing.interface.js";
import type {
  CreateListingInput,
  UpdateListingInput,
  ListListingsQuery,
  MyListingsQuery,
} from "./listing.validation.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// the phone is only selected when the request comes from a logged in user
const listingSelect = (showPhone: boolean) => ({
  id: true,
  title: true,
  description: true,
  rent: true,
  advance: true,
  roomType: true,
  acceptedTenants: true,
  furnished: true,
  address: true,
  availableFrom: true,
  status: true,
  lastConfirmedAt: true,
  expiresAt: true,
  createdAt: true,
  area: { select: { id: true, name: true, nameBn: true } },
  landmark: { select: { id: true, name: true, nameBn: true } },
  images: { select: { id: true, url: true }, orderBy: { createdAt: "asc" as const } },
  landlord: { select: { id: true, name: true, phone: showPhone } },
});

const findOwnListing = async (id: string, userId: string) => {
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  if (listing.landlordId !== userId) {
    throw new AppError("You can only change your own listings", 403);
  }

  return listing;
};

const checkLandmarkExists = async (id: string) => {
  const landmark = await prisma.landmark.findUnique({ where: { id }, select: { id: true } });

  if (!landmark) {
    throw new AppError("Landmark not found", 404);
  }
};

// TODO: when an admin approves a landlord's verification (verification module),
// move that landlord's PENDING listings to ACTIVE
const getStatusForNewListing = async (landlordId: string): Promise<ListingStatus> => {
  const approved = await prisma.verification.findFirst({
    where: { userId: landlordId, status: "APPROVED" },
    select: { id: true },
  });

  return approved ? "ACTIVE" : "PENDING";
};

const createListingInDB = async (landlordId: string, input: CreateListingInput) => {
  await areaService.checkAreaExists(input.areaId);

  if (input.landmarkId) {
    await checkLandmarkExists(input.landmarkId);
  }

  const status = await getStatusForNewListing(landlordId);
  const now = new Date();

  return prisma.listing.create({
    data: {
      ...input,
      landlordId,
      status,
      lastConfirmedAt: now,
      expiresAt: new Date(now.getTime() + LISTING_VALID_DAYS * DAY_MS),
    },
    select: listingSelect(true),
  });
};

const updateListingInDB = async (id: string, userId: string, input: UpdateListingInput) => {
  await findOwnListing(id, userId);

  if (input.areaId) {
    await areaService.checkAreaExists(input.areaId);
  }

  if (input.landmarkId) {
    await checkLandmarkExists(input.landmarkId);
  }

  return prisma.listing.update({
    where: { id },
    data: input,
    select: listingSelect(true),
  });
};

const deleteListingFromDB = async (id: string, userId: string) => {
  await findOwnListing(id, userId);

  const images = await prisma.listingImage.findMany({
    where: { listingId: id },
    select: { url: true },
  });

  // image rows, inquiries, saves, reports and tokens are removed by cascade
  await prisma.listing.delete({ where: { id } });

  await Promise.all(images.map((image) => storageService.deleteImage(image.url)));
};

const markRentedInDB = async (id: string, userId: string) => {
  const listing = await findOwnListing(id, userId);

  if (listing.status !== "ACTIVE" && listing.status !== "EXPIRED") {
    throw new AppError("Only active or expired listings can be marked as rented", 400);
  }

  return prisma.listing.update({
    where: { id },
    data: { status: "RENTED" },
    select: listingSelect(true),
  });
};

const getMyListingsFromDB = async (userId: string, query: MyListingsQuery) => {
  const where: Prisma.ListingWhereInput = { landlordId: userId, status: query.status };
  const skip = (query.page - 1) * query.limit;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: listingSelect(true),
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.listing.count({ where }),
  ]);

  const meta: PageMeta = { page: query.page, limit: query.limit, total };
  return { listings, meta };
};

const getListingsFromDB = async (query: ListListingsQuery, isLoggedIn: boolean) => {
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    // keeps stale listings out even if the expiry job is late
    expiresAt: { gt: new Date() },
    landmarkId: query.landmarkId,
    roomType: query.roomType,
    furnished: query.furnished,
    rent: { gte: query.minRent, lte: query.maxRent },
    // someone looking for "bachelor" should also see listings open to any tenant
    acceptedTenants: query.acceptedTenants
      ? { hasSome: [query.acceptedTenants, "ANY"] }
      : undefined,
    // picking an area also matches its sub-areas and blocks
    area: query.areaId
      ? {
          OR: [
            { id: query.areaId },
            { parentId: query.areaId },
            { parent: { parentId: query.areaId } },
          ],
        }
      : undefined,
  };

  const orderBy =
    query.sort === "rent_asc"
      ? { rent: "asc" as const }
      : query.sort === "rent_desc"
        ? { rent: "desc" as const }
        : { createdAt: "desc" as const };

  const skip = (query.page - 1) * query.limit;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      select: listingSelect(isLoggedIn),
      orderBy,
      skip,
      take: query.limit,
    }),
    prisma.listing.count({ where }),
  ]);

  const meta: PageMeta = { page: query.page, limit: query.limit, total };
  return { listings, meta };
};

const getListingByIdFromDB = async (id: string, isLoggedIn: boolean) => {
  const listing = await prisma.listing.findFirst({
    where: { id, status: "ACTIVE", expiresAt: { gt: new Date() } },
    select: listingSelect(isLoggedIn),
  });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  return listing;
};

const addImagesInDB = async (id: string, userId: string, files: UploadedFile[]) => {
  await findOwnListing(id, userId);

  if (files.length === 0) {
    throw new AppError("Please upload at least one image", 400);
  }

  const existing = await prisma.listingImage.count({ where: { listingId: id } });

  if (existing + files.length > MAX_LISTING_IMAGES) {
    throw new AppError(`A listing can have at most ${MAX_LISTING_IMAGES} images`, 400);
  }

  const urls = await Promise.all(files.map((file) => storageService.saveImage(file, "listings")));

  await prisma.listingImage.createMany({
    data: urls.map((url) => ({ listingId: id, url })),
  });

  return prisma.listingImage.findMany({
    where: { listingId: id },
    select: { id: true, url: true },
    orderBy: { createdAt: "asc" },
  });
};

export const listingService = {
  createListingInDB,
  updateListingInDB,
  deleteListingFromDB,
  markRentedInDB,
  getMyListingsFromDB,
  getListingsFromDB,
  getListingByIdFromDB,
  addImagesInDB,
};