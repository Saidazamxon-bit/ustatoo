import { z } from "zod";
import { db } from "@/server/db";
import { route, ok, readJson, notFound } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { refreshMasterIndex } from "@/server/services/masters";

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const { isActive } = z.object({ isActive: z.boolean() }).parse(await readJson(req));
  const s = await db.service.update({ where: { id }, data: { isActive } }).catch(() => null);
  if (!s) throw notFound("Xizmat topilmadi");
  await refreshMasterIndex(s.masterId);
  return ok(s);
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const s = await db.service.findUnique({ where: { id } });
  if (!s) throw notFound("Xizmat topilmadi");
  await db.service.delete({ where: { id } });
  await refreshMasterIndex(s.masterId);
  return ok({ success: true });
});
