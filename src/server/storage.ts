import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { badRequest } from "./errors";

/**
 * Fayl saqlash abstraksiyasi:
 *  - BLOB_READ_WRITE_TOKEN bo‘lsa — Vercel Blob (production, serverless uchun)
 *  - aks holda — lokal disk (UPLOAD_DIR), fayllar /api/files/* orqali beriladi.
 * S3/MinIO kabi xizmat uchun StorageDriver interfeysini amalga oshirish kifoya.
 */
export interface StorageDriver {
  save(data: Buffer, ext: string, mime: string): Promise<string>; // public URL qaytaradi
  read(key: string): Promise<Buffer | null>;
}

const ROOT = path.resolve(process.env.UPLOAD_DIR || "./storage/uploads");

class LocalStorage implements StorageDriver {
  async save(data: Buffer, ext: string) {
    const now = new Date();
    const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    await fs.mkdir(path.join(ROOT, dir), { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(ROOT, dir, name), data);
    return `/api/files/${dir}/${name}`;
  }
  async read(key: string) {
    const full = path.resolve(ROOT, key);
    if (!full.startsWith(ROOT + path.sep)) return null; // path traversal himoyasi
    try {
      return await fs.readFile(full);
    } catch {
      return null;
    }
  }
}

class BlobStorage implements StorageDriver {
  async save(data: Buffer, ext: string, mime: string) {
    const blob = await put(`uploads/${randomUUID()}.${ext}`, data, { access: "public", contentType: mime, addRandomSuffix: false });
    return blob.url;
  }
  async read() {
    return null; // Blob fayllari to‘g‘ridan-to‘g‘ri CDN URL orqali beriladi
  }
}

export const storage: StorageDriver = process.env.BLOB_READ_WRITE_TOKEN ? new BlobStorage() : new LocalStorage();

/** Fayl turini kengaytmaga emas, "magic bytes"ga qarab aniqlaydi. */
export function detectImage(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: "png", mime: "image/png" };
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP")
    return { ext: "webp", mime: "image/webp" };
  return null;
}

export const MIME_BY_EXT: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function saveImage(file: File): Promise<string> {
  if (file.size === 0) throw badRequest("Fayl bo‘sh");
  if (file.size > MAX_UPLOAD_BYTES) throw badRequest("Rasm hajmi 5 MB dan oshmasligi kerak");
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = detectImage(buf);
  if (!kind) throw badRequest("Faqat JPG, PNG yoki WEBP rasmlar qabul qilinadi");
  return storage.save(buf, kind.ext, kind.mime);
}
