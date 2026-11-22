import { z } from "zod";
import { db } from "@/server/db";
import { route, ok, readJson, notFound } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { recomputeRating } from "@/server/services/masters";

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const { status } = z.object({ status: z.enum(["VISIBLE", "HIDDEN"]) }).parse(await readJson(req));
  const r = await db.review.update({ where: { id }, data: { status } }).catch(() => null);
  if (!r) throw notFound("Sharh topilmadi");
  await recomputeRating(r.masterId);
  return ok(r);
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const r = await db.review.findUnique({ where: { id } });
  if (!r) throw notFound("Sharh topilmadi");
  await db.review.delete({ where: { id } });
  await recomputeRating(r.masterId);
  return ok({ success: true });
});
