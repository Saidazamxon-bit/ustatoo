import { route, ok } from "@/server/errors";
import { destroySession } from "@/server/auth";

export const POST = route(async () => {
  await destroySession();
  return ok({ success: true });
});
