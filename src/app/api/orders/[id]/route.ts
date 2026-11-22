import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { orderActionSchema } from "@/lib/validators";
import { applyOrderAction, getOrderForUser } from "@/server/services/orders";

export const GET = route<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  return ok(await getOrderForUser(user, id));
});

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { action, reason } = orderActionSchema.parse(await readJson(req));
  await applyOrderAction(user, id, action, reason);
  return ok({ success: true });
});
