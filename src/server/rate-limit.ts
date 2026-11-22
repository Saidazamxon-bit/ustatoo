import "server-only";
import type { NextRequest } from "next/server";
import { HttpError } from "./errors";

// Oddiy "sliding window" cheklovchi (bitta instance uchun xotirada).
const g = globalThis as unknown as { __utRate?: Map<string, number[]> };
const hits = g.__utRate ?? new Map<string, number[]>();
g.__utRate = hits;

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    const retry = Math.ceil((windowMs - (now - arr[0])) / 1000);
    throw new HttpError(429, `Juda ko‘p urinish. ${retry} soniyadan keyin qayta urinib ko‘ring.`);
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.every((t) => now - t > windowMs)) hits.delete(k);
  }
}
