import { db } from "@/server/db";
import { route, ok, readJson, HttpError } from "@/server/errors";
import { loginSchema } from "@/lib/validators";
import { createSession, verifyPassword } from "@/server/auth";
import { clientIp, rateLimit } from "@/server/rate-limit";

export const POST = route(async (req) => {
  rateLimit(`login:${clientIp(req)}`, 10, 10 * 60_000);
  const input = loginSchema.parse(await readJson(req));
  const user = await db.user.findUnique({ where: { phone: input.phone } });
  // Foydalanuvchi bor-yo‘qligini oshkor qilmaslik uchun bir xil xabar
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new HttpError(401, "Telefon raqam yoki parol noto‘g‘ri");
  }
  if (user.status !== "ACTIVE") throw new HttpError(403, "Hisobingiz bloklangan. Qo‘llab-quvvatlash xizmatiga murojaat qiling.");
  await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
  await createSession(user);
  return ok({ id: user.id, role: user.role });
});
