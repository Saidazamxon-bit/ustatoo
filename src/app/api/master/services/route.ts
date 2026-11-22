import { db } from "@/server/db";
import { route, ok, readJson, badRequest } from "@/server/errors";
import { requireMaster } from "@/server/auth";
import { serviceSchema } from "@/lib/validators";
import { refreshMasterIndex } from "@/server/services/masters";

export const GET = route(async () => {
  const { masterId } = await requireMaster();
  return ok(await db.service.findMany({ where: { masterId }, orderBy: { createdAt: "desc" } }));
});

export const POST = route(async (req) => {
  const { masterId } = await requireMaster();
  const input = serviceSchema.parse(await readJson(req));
  const count = await db.service.count({ where: { masterId } });
  if (count >= 30) throw badRequest("Ko‘pi bilan 30 ta xizmat qo‘shish mumkin");
  const master = await db.masterProfile.findUniqueOrThrow({ where: { id: masterId }, select: { categoryId: true } });
  const categoryId = input.categoryId && (await db.category.findUnique({ where: { id: input.categoryId } })) ? input.categoryId : master.categoryId;
  const service = await db.service.create({ data: { ...input, categoryId, masterId } });
  await refreshMasterIndex(masterId);
  return ok(service, { status: 201 });
});
