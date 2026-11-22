import { db } from "@/server/db";
import { route, ok, conflict, badRequest } from "@/server/errors";
import { requireMaster } from "@/server/auth";
import { notify } from "@/server/notify";

/** Usta tasdiqlash uchun ariza yuboradi */
export const POST = route(async () => {
  const { masterId, user } = await requireMaster();
  const m = await db.masterProfile.findUniqueOrThrow({
    where: { id: masterId },
    include: { _count: { select: { services: true } } },
  });
  if (m.verification === "APPROVED") throw conflict("Profilingiz allaqachon tasdiqlangan");
  if (m.verification === "PENDING") throw conflict("Arizangiz ko‘rib chiqilmoqda");
  if (m.bio.length < 30) throw badRequest("Avval “Usta haqida” bo‘limini to‘ldiring (kamida 30 belgi)");
  if (m._count.services < 1) throw badRequest("Kamida bitta xizmat qo‘shing");
  await db.masterProfile.update({ where: { id: masterId }, data: { verification: "PENDING", verificationNote: null } });
  const admins = await db.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" }, select: { id: true } });
  for (const a of admins) {
    await notify({ userId: a.id, type: "SYSTEM", title: "Yangi tasdiqlash arizasi", body: `${user.name} profilini tasdiqlashni so‘radi.`, link: "/admin/ustalar?holat=PENDING" });
  }
  return ok({ verification: "PENDING" });
});
