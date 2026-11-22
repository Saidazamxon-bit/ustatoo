import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { paymentConfirmSchema } from "@/lib/validators";
import { confirmDemoPayment } from "@/server/services/payments";
import { rateLimit } from "@/server/rate-limit";

export const POST = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  rateLimit(`pay:${user.id}`, 10, 10 * 60_000);
  const { account, code } = paymentConfirmSchema.parse(await readJson(req));
  return ok(await confirmDemoPayment(user, id, account, code));
});
