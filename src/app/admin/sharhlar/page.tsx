import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminAction } from "@/components/admin/admin-action";
import { Avatar, Badge, Stars } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Sharhlar" };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ q?: string; holat?: string }> }) {
  const { q, holat } = await searchParams;
  const where: Prisma.ReviewWhereInput = {
    ...(holat === "HIDDEN" || holat === "VISIBLE" ? { status: holat } : holat === "low" ? { rating: { lte: 3 } } : {}),
    ...(q ? { OR: [{ comment: { contains: q } }, { client: { name: { contains: q } } }, { master: { user: { name: { contains: q } } } }] } : {}),
  };
  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { client: { select: { name: true, avatar: true } }, master: { select: { id: true, user: { select: { name: true } } } }, _count: { select: { complaints: true } } },
  });
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">Sharhlar moderatsiyasi</h1>
      <AdminFilters placeholder="Matn, mijoz yoki usta" statuses={[{ v: "VISIBLE", l: "Ko‘rinadigan" }, { v: "HIDDEN", l: "Yashirilgan" }, { v: "low", l: "Past baho (≤3)" }]} />
      {reviews.length ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center gap-3">
                <Avatar src={r.client.avatar} name={r.client.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.client.name} → <a href={`/ustalar/${r.master.id}`} target="_blank" className="text-brand-600">{r.master.user.name}</a></p>
                  <p className="text-xs text-muted">{timeAgo(r.createdAt)}</p>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              <p className="mt-2 text-[15px] text-ink-2">{r.comment}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {r.status === "HIDDEN" && <Badge tone="warn">Yashirilgan</Badge>}
                {r._count.complaints > 0 && <Badge tone="danger">{r._count.complaints} shikoyat</Badge>}
                <span className="flex-1" />
                <AdminAction url={`/api/admin/reviews/${r.id}`} body={{ status: r.status === "VISIBLE" ? "HIDDEN" : "VISIBLE" }} label={r.status === "VISIBLE" ? "Yashirish" : "Ko‘rsatish"} variant="secondary" success="Holat o‘zgardi" />
                <AdminAction url={`/api/admin/reviews/${r.id}`} method="DELETE" label="O‘chirish" variant="danger" confirm="Sharhni butunlay o‘chirasizmi? Ustaning reytingi qayta hisoblanadi." success="Sharh o‘chirildi" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Sharhlar topilmadi" />
      )}
    </div>
  );
}
