import { db } from "@/server/db";
import { route, ok } from "@/server/errors";

export const GET = route(async () => {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true, image: true, description: true, _count: { select: { masters: true } } },
  });
  return ok(categories);
});
