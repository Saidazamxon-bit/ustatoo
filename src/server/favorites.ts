import "server-only";
import { db } from "./db";

export async function getFavoriteIds(userId?: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.favorite.findMany({ where: { userId }, select: { masterId: true } });
  return new Set(rows.map((r) => r.masterId));
}
