import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { orderCreateSchema } from "@/lib/validators";
import { createOrder, listOrders } from "@/server/services/orders";
import { rateLimit } from "@/server/rate-limit";

export const GET = route(async (req) => {
  const user = await requireUser();
  const scope = req.nextUrl.searchParams.get("scope") === "master" && user.master ? "master" : "client";
  const tab = (req.nextUrl.searchParams.get("tab") as "active" | "history" | "all") || "all";
  return ok(await listOrders(user, scope, tab));
});

export const POST = route(async (req) => {
  const user = await requireUser();
  rateLimit(`order:${user.id}`, 15, 60 * 60_000);
  const input = orderCreateSchema.parse(await readJson(req));
  const order = await createOrder(user, input);
  return ok({ id: order.id, code: order.code }, { status: 201 });
});
