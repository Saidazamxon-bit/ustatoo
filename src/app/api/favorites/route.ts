import { db } from "@/server/db";
import { route, ok, readJson, notFound } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { z } from "zod";
import { masterCardSelect } from "@/server/services/masters";

export const GET = route(async () => {
  const user = await requireUser();
  const favs = await db.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { master: { select: masterCardSelect } },
  });
  return ok(favs.map((f) => f.master));
});

/** Sevimlilarga qo‘shish / olib tashlash (toggle) */
export const POST = route(async (req) => {
  const user = await requireUser();
  const { masterId } = z.object({ masterId: z.string().min(1) }).parse(await readJson(req));
  const master = await db.masterProfile.findUnique({ where: { id: masterId }, select: { id: true } });
  if (!master) throw notFound("Usta topilmadi");
  const key = { userId_masterId: { userId: user.id, masterId } };
  const existing = await db.favorite.findUnique({ where: key });
  if (existing) {
    await db.favorite.delete({ where: key });
    return ok({ favorite: false });
  }
  await db.favorite.create({ data: { userId: user.id, masterId } });
  await db.masterProfile.update({ where: { id: masterId }, data: { popularity: { increment: 1 } } });
  return ok({ favorite: true });
});
