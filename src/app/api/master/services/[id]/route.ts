import { db } from "@/server/db";
import { route, ok, readJson, notFound } from "@/server/errors";
import { requireMaster } from "@/server/auth";
import { serviceSchema } from "@/lib/validators";
import { refreshMasterIndex } from "@/server/services/masters";

async function own(masterId: string, id: string) {
  const s = await db.service.findFirst({ where: { id, masterId } });
  if (!s) throw notFound("Xizmat topilmadi");
  return s;
}

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const { masterId } = await requireMaster();
  const { id } = await params;
  await own(masterId, id);
  const input = serviceSchema.partial().parse(await readJson(req));
  const { categoryId, ...rest } = input;
  const service = await db.service.update({ where: { id }, data: { ...rest, ...(categoryId ? { categoryId } : {}) } });
  await refreshMasterIndex(masterId);
  return ok(service);
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  const { masterId } = await requireMaster();
  const { id } = await params;
  await own(masterId, id);
  await db.service.delete({ where: { id } });
  await refreshMasterIndex(masterId);
  return ok({ success: true });
});
