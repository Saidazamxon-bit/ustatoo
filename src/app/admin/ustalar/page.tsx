import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminAction } from "@/components/admin/admin-action";
import { Avatar, Badge, Rating } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { VERIFICATION_LABELS } from "@/lib/constants";
import { dateShort, phone } from "@/lib/format";

export const metadata = { title: "Ustalarni tekshirish" };

const TONE: Record<string, "warn" | "success" | "danger" | "neutral"> = { PENDING: "warn", APPROVED: "success", REJECTED: "danger", NONE: "neutral" };

export default async function AdminMastersPage({ searchParams }: { searchParams: Promise<{ q?: string; holat?: string }> }) {
  const { q, holat } = await searchParams;
  const where: Prisma.MasterProfileWhereInput = {
    ...(holat ? { verification: holat } : {}),
    ...(q ? { OR: [{ user: { name: { contains: q } } }, { specialty: { contains: q } }] } : {}),
  };
  const masters = await db.masterProfile.findMany({
    where,
    orderBy: [{ verification: "desc" }, { updatedAt: "desc" }],
    take: 100,
    include: { user: { select: { name: true, avatar: true, phone: true, status: true } }, category: { select: { name: true } }, _count: { select: { services: true, portfolio: true, orders: true } } },
  });
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">Ustalarni tekshirish</h1>
      <AdminFilters placeholder="Ism yoki mutaxassislik" statuses={[{ v: "PENDING", l: "Tekshiruvda" }, { v: "APPROVED", l: "Tasdiqlangan" }, { v: "REJECTED", l: "Rad etilgan" }, { v: "NONE", l: "Ariza bermagan" }]} />
      {masters.length ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {masters.map((m) => (
            <div key={m.id} className="card p-4">
              <div className="flex items-start gap-3">
                <Avatar src={m.user.avatar} name={m.user.name} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{m.user.name}</p>
                  <p className="truncate text-sm text-muted">{m.specialty} · {m.category.name}</p>
                  <p className="text-xs text-muted">{phone(m.user.phone)} · {m.district}, {m.region} · {dateShort(m.createdAt)}</p>
                </div>
                <Badge tone={TONE[m.verification]}>{VERIFICATION_LABELS[m.verification]}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
                <Rating value={m.rating} count={m.reviewCount} />
                <span>{m.experienceYears} yil tajriba</span>
                <span>{m._count.services} xizmat</span>
                <span>{m._count.portfolio} ish namunasi</span>
                <span>{m._count.orders} buyurtma</span>
              </div>
              {m.bio && <p className="mt-2 line-clamp-2 text-sm text-muted">{m.bio}</p>}
              {m.verificationNote && <p className="mt-2 rounded-xl bg-cream p-2 text-xs">Izoh: {m.verificationNote}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`/ustalar/${m.id}`} target="_blank" className="inline-flex h-9 items-center rounded-full bg-cream px-4 text-sm font-semibold">Profilni ko‘rish ↗</a>
                {m.verification !== "APPROVED" && (
                  <AdminAction url={`/api/admin/masters/${m.id}`} method="POST" body={{ decision: "APPROVED" }} label="Tasdiqlash" variant="primary" success="Usta tasdiqlandi" />
                )}
                {m.verification !== "REJECTED" && (
                  <AdminAction url={`/api/admin/masters/${m.id}`} method="POST" body={{ decision: "REJECTED" }} label={m.verification === "APPROVED" ? "Tasdiqni bekor qilish" : "Rad etish"} variant="danger" noteField="note" noteLabel="Sabab (ustaga yuboriladi)" success="Ariza rad etildi" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Ustalar topilmadi" description={holat === "PENDING" ? "Tekshiruvni kutayotgan arizalar yo‘q." : undefined} />
      )}
    </div>
  );
}
