import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminAction } from "@/components/admin/admin-action";
import { Badge, SmartImage } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { priceWithUnit } from "@/lib/format";

export const metadata = { title: "Xizmatlar" };

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ q?: string; holat?: string }> }) {
  const { q, holat } = await searchParams;
  const where: Prisma.ServiceWhereInput = {
    ...(holat === "active" ? { isActive: true } : holat === "hidden" ? { isActive: false } : {}),
    ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { master: { user: { name: { contains: q, mode: "insensitive" } } } }] } : {}),
  };
  const services = await db.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 150,
    include: { category: { select: { name: true, image: true } }, master: { select: { id: true, user: { select: { name: true } } } } },
  });
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">Xizmatlar</h1>
      <AdminFilters placeholder="Xizmat yoki usta nomi" statuses={[{ v: "active", l: "Faol" }, { v: "hidden", l: "Yashirin" }]} />
      {services.length ? (
        <div className="space-y-2.5">
          {services.map((s) => (
            <div key={s.id} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                  <SmartImage src={s.image ?? s.category.image} alt={s.title} sizes="56px" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold">{s.title} {!s.isActive && <Badge>Yashirin</Badge>}</p>
                  <p className="truncate text-sm text-muted">
                    <a href={`/ustalar/${s.master.id}`} target="_blank" className="hover:text-brand-600">{s.master.user.name}</a> · {s.category.name} · {priceWithUnit(s.price, s.priceUnit)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <AdminAction url={`/api/admin/services/${s.id}`} body={{ isActive: !s.isActive }} label={s.isActive ? "Yashirish" : "Faollashtirish"} variant="secondary" success="Holat o‘zgardi" />
                <AdminAction url={`/api/admin/services/${s.id}`} method="DELETE" label="O‘chirish" variant="danger" confirm={`“${s.title}” xizmatini butunlay o‘chirasizmi?`} success="Xizmat o‘chirildi" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Xizmatlar topilmadi" />
      )}
    </div>
  );
}
