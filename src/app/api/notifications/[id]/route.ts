import { db } from "@/server/db";
import { route, ok } from "@/server/errors";
import { requireUser } from "@/server/auth";

export const PATCH = route<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await db.notification.updateMany({ where: { id, userId: user.id, readAt: null }, data: { readAt: new Date() } });
  return ok({ success: true });
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await db.notification.deleteMany({ where: { id, userId: user.id } });
  return ok({ success: true });
});
