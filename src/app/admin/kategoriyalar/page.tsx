import { db } from "@/server/db";
import { CategoryManager } from "./category-manager";

export const metadata = { title: "Kategoriyalar" };

export default async function AdminCategoriesPage() {
  const cats = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { masters: true, services: true } } } });
  return <CategoryManager initial={cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? "", image: c.image, icon: c.icon, sortOrder: c.sortOrder, isActive: c.isActive, masters: c._count.masters, services: c._count.services }))} />;
}
