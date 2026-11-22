import { db } from "@/server/db";
import { route, ok, readJson, badRequest } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { complaintSchema } from "@/lib/validators";
import { rateLimit } from "@/server/rate-limit";

export const POST = route(async (req) => {
  const user = await requireUser();
  rateLimit(`complaint:${user.id}`, 10, 60 * 60_000);
  const input = complaintSchema.parse(await readJson(req));
  if (input.targetUserId === user.id) throw badRequest("O‘zingizga shikoyat qila olmaysiz");
  const complaint = await db.complaint.create({ data: { ...input, reporterId: user.id } });
  return ok({ id: complaint.id }, { status: 201 });
});
