import { db } from "@/server/db";
import { route, ok } from "@/server/errors";
import { requireUser } from "@/server/auth";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 }));
});

/** Barchasini o‘qilgan deb belgilash */
export const POST = route(async () => {
  const user = await requireUser();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  return ok({ success: true });
});
