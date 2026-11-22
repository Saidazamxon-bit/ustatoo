import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/server/db";
import { route, ok, readJson, badRequest } from "@/server/errors";
import { destroySession, hashPassword, requireUser, verifyPassword } from "@/server/auth";
import { rateLimit } from "@/server/rate-limit";

/**
 * Hisobni o‘chirish (Google Play talabi).
 * Shaxsiy ma'lumotlar o‘chiriladi/anonimlashtiriladi; buyurtmalar ikkinchi tomon
 * (usta yoki mijoz) hisoboti uchun "O‘chirilgan foydalanuvchi" nomi bilan saqlanadi.
 */
export const POST = route(async (req) => {
  const user = await requireUser();
  rateLimit(`delete:${user.id}`, 5, 15 * 60_000);
  const { password, confirm } = z
    .object({ password: z.string().min(1, "Parolni kiriting"), confirm: z.literal("O‘CHIRISH", { errorMap: () => ({ message: "Tasdiqlash uchun O‘CHIRISH deb yozing" }) }) })
    .parse(await readJson(req));
  const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(password, row.passwordHash))) throw badRequest("Parol noto‘g‘ri", { password: "Parol noto‘g‘ri" });
  if (row.role === "ADMIN" && (await db.user.count({ where: { role: "ADMIN", status: "ACTIVE" } })) <= 1) {
    throw badRequest("Yagona administrator hisobini o‘chirib bo‘lmaydi");
  }

  const anon = `deleted-${user.id}`;
  await db.$transaction(async (tx) => {
    // Faol buyurtmalar bekor qilinadi (yakunlanganlar tarix sifatida qoladi)
    const active = await tx.order.findMany({
      where: { status: { in: ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS"] }, OR: [{ clientId: user.id }, { master: { userId: user.id } }] },
      select: { id: true, status: true },
    });
    for (const o of active) {
      await tx.order.update({ where: { id: o.id }, data: { status: "CANCELLED", cancelReason: "Hisob o‘chirildi", cancelledBy: "SYSTEM" } });
      await tx.orderEvent.create({ data: { orderId: o.id, status: "CANCELLED", note: "Buyurtma bekor qilindi: hisob o‘chirildi" } });
    }
    await tx.favorite.deleteMany({ where: { userId: user.id } });
    await tx.notification.deleteMany({ where: { userId: user.id } });
    await tx.realtimeEvent.deleteMany({ where: { userId: user.id } });
    await tx.message.updateMany({ where: { senderId: user.id }, data: { image: null } });
    if (row.role === "MASTER") {
      const master = await tx.masterProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
      if (master) {
        await tx.portfolioItem.deleteMany({ where: { masterId: master.id } });
        await tx.service.updateMany({ where: { masterId: master.id }, data: { isActive: false } });
        await tx.masterProfile.update({
          where: { id: master.id },
          data: { bio: "", coverImage: null, publicPhone: null, telegram: null, address: null, isAvailable: false, searchText: "" },
        });
      }
    }
    await tx.user.update({
      where: { id: user.id },
      data: {
        name: "O‘chirilgan foydalanuvchi",
        phone: anon,
        email: null,
        avatar: null,
        address: null,
        passwordHash: await hashPassword(randomUUID()),
        status: "DELETED",
        notifyOrders: false,
        notifyMessages: false,
        notifyPromos: false,
      },
    });
  });
  await destroySession();
  return ok({ deleted: true });
});
