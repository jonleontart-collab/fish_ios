import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_DIR = path.join(process.cwd(), "storage", "uploads");

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

function sanitizeBaseName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function getImageExtension(mimeType: string, originalName: string) {
  const fromMime = MIME_TO_EXTENSION[mimeType];
  if (fromMime) {
    return fromMime;
  }

  const fromName = originalName.split(".").pop()?.toLowerCase();
  if (fromName && EXTENSION_TO_MIME[fromName]) {
    return fromName;
  }

  return "jpg";
}

export async function saveImageFile(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = getImageExtension(file.type, file.name);
  const stem = sanitizeBaseName(file.name) || "catch";
  const fileName = `${stem}-${crypto.randomUUID()}.${extension}`;

  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(path.join(STORAGE_DIR, fileName), bytes);

  return {
    fileName,
    publicPath: `/api/uploads/${fileName}`,
  };
}

export async function readStoredImage(fileName: string) {
  const safeFileName = path.basename(fileName);
  const extension = safeFileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const contentType = EXTENSION_TO_MIME[extension] ?? "application/octet-stream";
  const buffer = await readFile(path.join(STORAGE_DIR, safeFileName));

  return {
    buffer,
    contentType,
  };
}
