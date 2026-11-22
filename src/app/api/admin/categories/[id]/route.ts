import { db } from "@/server/db";
import { route, ok, readJson, conflict, notFound } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { categorySchema } from "@/lib/validators";

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const input = categorySchema.partial().parse(await readJson(req));
  if (input.slug && (await db.category.findFirst({ where: { slug: input.slug, id: { not: id } } }))) throw conflict("Bu slug band");
  return ok(await db.category.update({ where: { id }, data: input }));
});

export const DELETE = route<{ id: string }>(async (_req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const cat = await db.category.findUnique({ where: { id }, include: { _count: { select: { masters: true, services: true } } } });
  if (!cat) throw notFound("Kategoriya topilmadi");
  if (cat._count.masters || cat._count.services) {
    throw conflict(`Kategoriyada ${cat._count.masters} usta va ${cat._count.services} xizmat bor. O‘chirish o‘rniga faolsizlantiring.`);
  }
  await db.category.delete({ where: { id } });
  return ok({ success: true });
});
