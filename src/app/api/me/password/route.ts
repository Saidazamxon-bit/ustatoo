import { db } from "@/server/db";
import { route, ok, readJson, badRequest } from "@/server/errors";
import { hashPassword, requireUser, verifyPassword } from "@/server/auth";
import { passwordChangeSchema } from "@/lib/validators";
import { rateLimit } from "@/server/rate-limit";

export const POST = route(async (req) => {
  const user = await requireUser();
  rateLimit(`pw:${user.id}`, 5, 15 * 60_000);
  const input = passwordChangeSchema.parse(await readJson(req));
  const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(input.currentPassword, row.passwordHash))) {
    throw badRequest("Joriy parol noto‘g‘ri", { currentPassword: "Joriy parol noto‘g‘ri" });
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(input.newPassword) } });
  return ok({ success: true });
});
