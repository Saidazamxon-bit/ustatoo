import { route, ok } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { removeOrderItem } from "@/server/services/orders";

export const DELETE = route<{ id: string; itemId: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id, itemId } = await params;
  await removeOrderItem(user, id, itemId);
  return ok({ success: true });
});
