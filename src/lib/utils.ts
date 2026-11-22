import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const v = JSON.parse(value);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function siteUrl(path = ""): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
  const base = (process.env.NEXT_PUBLIC_SITE_URL || vercel || "http://localhost:3000").replace(/\/$/, "");
  return base + path;
}

/** Ruxsat etilgan rasm manzillari: statik, lokal yuklangan yoki Vercel Blob */
export function isAllowedImageUrl(v: string): boolean {
  return v.startsWith("/img/") || v.startsWith("/api/files/") || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(v);
}

export function toInt(v: unknown, fallback?: number): number | undefined {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
