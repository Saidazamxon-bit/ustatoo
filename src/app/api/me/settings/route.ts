import { db } from "@/server/db";
import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { settingsSchema } from "@/lib/validators";

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const input = settingsSchema.parse(await readJson(req));
  await db.user.update({ where: { id: user.id }, data: input });
  return ok({ success: true });
});
