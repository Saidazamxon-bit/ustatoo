import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/server/db";
import { PageHeader } from "@/components/layout/page-header";
import { SmartImage } from "@/components/ui/misc";
import { SearchBar } from "@/components/search/search-bar";

export const metadata: Metadata = {
  title: "Xizmat kategoriyalari",
  description: "Elektrik, santexnik, konditsioner, mebel, kafel va boshqa 15 ta yo‘nalishdagi ustalar.",
  alternates: { canonical: "/kategoriyalar" },
};
export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { masters: true } } },
  });
  return (
    <div>
      <PageHeader title="Kategoriyalar" back={false} />
      <SearchBar className="mb-6 lg:max-w-xl" />
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href={`/kategoriyalar/${c.slug}`}
            style={{ animationDelay: `${i * 30}ms` }}
            className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] animate-fade-up"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <SmartImage src={c.image} alt={c.name} sizes="(max-width: 640px) 50vw, 240px" className="transition duration-500 group-hover:scale-110" />
            </div>
            <div className="p-3.5">
              <p className="truncate font-bold">{c.name}</p>
              <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">{c.description}</p>
              <p className="mt-2 text-xs font-semibold text-brand-600">{c._count.masters} ta usta</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
