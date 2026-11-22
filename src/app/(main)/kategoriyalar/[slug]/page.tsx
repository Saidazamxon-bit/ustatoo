import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { searchMasters } from "@/server/services/masters";
import { getFavoriteIds } from "@/server/favorites";
import { PageHeader } from "@/components/layout/page-header";
import { SmartImage } from "@/components/ui/misc";
import { MasterRow } from "@/components/masters/master-cards";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { SortChips } from "@/components/search/sort-chips";
import { parseMasterFilters } from "@/server/filters";
import { money } from "@/lib/format";
import { siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await db.category.findUnique({ where: { slug } });
  if (!c) return { title: "Kategoriya topilmadi" };
  return {
    title: `${c.name} — ustalar va narxlar`,
    description: `${c.name}: ${c.description}. Reyting, sharhlar va narxlarni solishtiring, onlayn buyurtma bering.`,
    alternates: { canonical: `/kategoriyalar/${c.slug}` },
    openGraph: { images: [c.image] },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await db.category.findFirst({ where: { slug, isActive: true } });
  if (!category) notFound();
  const user = await getCurrentUser();
  const filters = { ...parseMasterFilters(sp), category: slug, pageSize: 48 };
  const [{ items, total }, favs, priceAgg] = await Promise.all([
    searchMasters(filters),
    getFavoriteIds(user?.id),
    db.service.aggregate({ where: { categoryId: category.id, isActive: true }, _min: { price: true } }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    itemListElement: items.slice(0, 20).map((m, i) => ({ "@type": "ListItem", position: i + 1, url: siteUrl(`/ustalar/${m.id}`), name: m.user.name })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title={category.name} subtitle={`${total} ta usta`} backHref="/kategoriyalar" />
      <div className="relative mb-6 overflow-hidden rounded-[2rem]">
        <div className="relative aspect-[16/7] sm:aspect-[16/5]">
          <SmartImage src={category.image} alt={category.name} sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white sm:p-8">
          <p className="max-w-md text-sm text-white/85 sm:text-base">{category.description}</p>
          {priceAgg._min.price && <p className="mt-1 text-lg font-bold sm:text-2xl">{money(priceAgg._min.price)} dan</p>}
        </div>
      </div>
      <SortChips basePath={`/kategoriyalar/${slug}`} />
      {items.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <MasterRow key={m.id} m={m} favorite={favs.has(m.id)} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Bu kategoriyada hozircha usta yo‘q"
          description="Tez orada yangi ustalar qo‘shiladi. Boshqa kategoriyalarni ko‘rib chiqing."
          action={<ButtonLink href="/kategoriyalar">Kategoriyalar</ButtonLink>}
        />
      )}
    </div>
  );
}
