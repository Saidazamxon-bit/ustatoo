import { db } from "@/server/db";
import { route, ok, readJson, conflict } from "@/server/errors";
import { getCurrentUser, requireUser } from "@/server/auth";
import { profileSchema } from "@/lib/validators";
import { unreadMessagesCount } from "@/server/services/chat";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const user = await getCurrentUser();
  if (!user) return ok({ user: null });
  const [unreadMessages, unreadNotifications] = await Promise.all([
    unreadMessagesCount(user.id),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return ok({ user, unreadMessages, unreadNotifications });
});

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const input = profileSchema.parse(await readJson(req));
  if (input.email) {
    const other = await db.user.findFirst({ where: { email: input.email, id: { not: user.id } } });
    if (other) throw conflict("Bu email boshqa hisobga biriktirilgan");
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: { ...input, email: input.email || null },
    select: { id: true, name: true, email: true, avatar: true, region: true, district: true, address: true },
  });
  return ok(updated);
});
