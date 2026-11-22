import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { masterCardSelect } from "@/server/services/masters";
import { PageHeader } from "@/components/layout/page-header";
import { MasterRow } from "@/components/masters/master-cards";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sevimli ustalar", robots: { index: false } };

export default async function FavoritesPage() {
  const user = await requirePageUser("/profil/sevimlilar");
  const favs = await db.favorite.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { master: { select: masterCardSelect } } });
  return (
    <div>
      <PageHeader title="Sevimli ustalar" subtitle={`${favs.length} ta usta`} backHref="/profil" />
      {favs.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {favs.map(({ master }) => (
            <MasterRow key={master.id} m={master} favorite />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Heart className="h-7 w-7" />} title="Sevimlilar ro‘yxati bo‘sh" description="Yoqqan ustalarni ♥ belgisi orqali saqlab qo‘ying — keyin tez topasiz." action={<ButtonLink href="/kategoriyalar">Ustalarni ko‘rish</ButtonLink>} />
      )}
    </div>
  );
}
