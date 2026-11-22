import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { paymentCreateSchema } from "@/lib/validators";
import { startPayment } from "@/server/services/payments";

export const POST = route(async (req) => {
  const user = await requireUser();
  const { orderId, method } = paymentCreateSchema.parse(await readJson(req));
  return ok(await startPayment(user, orderId, method));
});
