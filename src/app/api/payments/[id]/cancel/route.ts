import { route, ok } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { cancelDemoPayment } from "@/server/services/payments";

export const POST = route<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  return ok(await cancelDemoPayment(user, id));
});
