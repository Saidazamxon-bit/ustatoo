import { db } from "@/server/db";
import { route, ok, readJson, conflict } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { categorySchema } from "@/lib/validators";

export const POST = route(async (req) => {
  await requireUser(["ADMIN"]);
  const input = categorySchema.parse(await readJson(req));
  if (await db.category.findUnique({ where: { slug: input.slug } })) throw conflict("Bu slug band");
  return ok(await db.category.create({ data: input }), { status: 201 });
});
