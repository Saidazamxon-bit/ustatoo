import { db } from "@/server/db";
import { route, ok, readJson, badRequest } from "@/server/errors";
import { requireMaster } from "@/server/auth";
import { portfolioSchema } from "@/lib/validators";

export const POST = route(async (req) => {
  const { masterId } = await requireMaster();
  const input = portfolioSchema.parse(await readJson(req));
  if ((await db.portfolioItem.count({ where: { masterId } })) >= 40) throw badRequest("Ko‘pi bilan 40 ta ish namunasi");
  return ok(await db.portfolioItem.create({ data: { ...input, masterId } }), { status: 201 });
});
