import { z } from "zod";
import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { listConversations, openConversation } from "@/server/services/chat";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await listConversations(user));
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const input = z.object({ masterId: z.string().optional(), orderId: z.string().optional() }).parse(await readJson(req));
  const conv = await openConversation(user, input);
  return ok({ id: conv.id });
});
