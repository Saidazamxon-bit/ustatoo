import { db } from "@/server/db";
import { route, ok, readJson, badRequest, notFound } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { adminUserUpdateSchema } from "@/lib/validators";
import { notify } from "@/server/notify";

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireUser(["ADMIN"]);
  const { id } = await params;
  if (id === admin.id) throw badRequest("O‘z hisobingizni o‘zgartira olmaysiz");
  const input = adminUserUpdateSchema.parse(await readJson(req));
  const target = await db.user.findUnique({ where: { id }, include: { master: { select: { id: true } } } });
  if (!target) throw notFound("Foydalanuvchi topilmadi");
  if (target.status === "DELETED") throw badRequest("O‘chirilgan hisobni o‘zgartirib bo‘lmaydi");
  if (input.role === "MASTER" && !target.master) throw badRequest("Usta profili yo‘q foydalanuvchini usta qilib bo‘lmaydi");
  await db.user.update({ where: { id }, data: input });
  if (input.status === "ACTIVE" && target.status === "BLOCKED") {
    await notify({ userId: id, type: "SYSTEM", title: "Hisobingiz faollashtirildi", body: "Platformadan yana to‘liq foydalanishingiz mumkin." });
  }
  return ok({ success: true });
});
