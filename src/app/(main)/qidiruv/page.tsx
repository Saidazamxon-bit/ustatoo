import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { searchMasters, searchServices } from "@/server/services/masters";
import { getFavoriteIds } from "@/server/favorites";
import { parseMasterFilters } from "@/server/filters";
import { PageHeader } from "@/components/layout/page-header";
import { MasterRow } from "@/components/masters/master-cards";
import { ServiceCard } from "@/components/masters/service-card";
import { EmptyState } from "@/components/ui/states";
import { Scroller } from "@/components/ui/scroller";
import { SortChips } from "@/components/search/sort-chips";
import { SearchControls } from "./search-controls";
import { buttonClass } from "@/components/ui/button";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `“${q}” bo‘yicha ustalar` : "Ustalarni qidirish",
    description: "Kategoriya, hudud, narx, reyting va tajriba bo‘yicha ustalarni qidiring va solishtiring.",
    robots: q ? { index: false } : undefined,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const filters = parseMasterFilters(sp);
  if (filters.sort === "near" && !filters.region && !filters.lat && user?.region) {
    filters.region = user.region;
  }
  const [result, services, favs, categories] = await Promise.all([
    searchMasters(filters),
    filters.q ? searchServices(filters.q, 8) : Promise.resolve([]),
    getFavoriteIds(user?.id),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
  ]);
  const { items, total, page, pageSize } = result;
  const hasMore = page * pageSize < total;
  const nextParams = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
  nextParams.set("sahifa", String(page + 1));

  return (
    <div>
      <PageHeader title="Qidiruv" subtitle={`${total} ta usta topildi`} />
      <Suspense>
        <SearchControls categories={categories} defaultQuery={filters.q ?? ""} openFilters={sp.filtr === "1"} />
        <SortChips />
      </Suspense>

      {services.length > 0 && (
        <section className="mb-6">
          <h2 className="section-title mb-3">Mos xizmatlar</h2>
          <Scroller className="lg:grid lg:grid-cols-4 lg:overflow-visible">
            {services.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </Scroller>
        </section>
      )}

      {items.length ? (
        <>
          <h2 className="section-title mb-3">Ustalar</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <MasterRow key={m.id} m={m} favorite={favs.has(m.id)} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link scroll={false} className={buttonClass("secondary")} href={`/qidiruv?${new URLSearchParams({ ...Object.fromEntries(nextParams), sahifa: String(page - 1) })}`}>
                Oldingi
              </Link>
            )}
            {hasMore && (
              <Link className={buttonClass("primary")} href={`/qidiruv?${nextParams.toString()}`}>
                Keyingi sahifa
              </Link>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<SearchX className="h-7 w-7" />}
          title="Hech narsa topilmadi"
          description="Qidiruv so‘zini o‘zgartiring yoki filtrlarni kamaytiring."
          action={
            <Link href="/qidiruv" className={buttonClass("primary")}>
              Filtrlarni tozalash
            </Link>
          }
        />
      )}
    </div>
  );
}
