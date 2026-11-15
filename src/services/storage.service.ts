import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// everything in this folder is served publicly at /uploads
export const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "uploads", "public");

const extensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export type UploadedFile = {
  buffer: Buffer;
  mimetype: string;
};

// returns the public url, e.g. /uploads/listings/abc.jpg
const saveImage = async (file: UploadedFile, folder: string) => {
  const dir = path.join(PUBLIC_UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });

  const fileName = `${crypto.randomUUID()}${extensions[file.mimetype] ?? ".jpg"}`;
  await fs.writeFile(path.join(dir, fileName), file.buffer);

  return `/uploads/${folder}/${fileName}`;
};

const deleteImage = async (url: string) => {
  const filePath = path.join(PUBLIC_UPLOAD_DIR, url.replace("/uploads/", ""));
  await fs.rm(filePath, { force: true });
};

export const storageService = {
  saveImage,
  deleteImage,
};