import { db } from "@/server/db";
import { route, ok, notFound } from "@/server/errors";
import { requireMaster } from "@/server/auth";

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  const { masterId } = await requireMaster();
  const { id } = await params;
  const res = await db.portfolioItem.deleteMany({ where: { id, masterId } });
  if (!res.count) throw notFound("Ish namunasi topilmadi");
  return ok({ success: true });
});
