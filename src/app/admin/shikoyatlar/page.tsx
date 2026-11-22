import Link from "next/link";
import { db } from "@/server/db";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminAction } from "@/components/admin/admin-action";
import { Badge } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { COMPLAINT_STATUS_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Shikoyatlar" };

export default async function AdminComplaintsPage({ searchParams }: { searchParams: Promise<{ holat?: string }> }) {
  const { holat } = await searchParams;
  const complaints = await db.complaint.findMany({
    where: holat ? { status: holat } : {},
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      reporter: { select: { name: true } },
      targetUser: { select: { id: true, name: true, status: true, master: { select: { id: true } } } },
      order: { select: { id: true, code: true } },
      review: { select: { id: true, comment: true, rating: true, status: true } },
    },
  });
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">Shikoyatlar</h1>
      <AdminFilters search={false} statuses={[{ v: "OPEN", l: "Ochiq" }, { v: "RESOLVED", l: "Hal qilingan" }, { v: "REJECTED", l: "Rad etilgan" }]} />
      {complaints.length ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {complaints.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{c.reason}</p>
                  <p className="text-sm text-muted">{c.reporter.name} · {timeAgo(c.createdAt)}</p>
                </div>
                <Badge tone={c.status === "OPEN" ? "warn" : c.status === "RESOLVED" ? "success" : "neutral"}>{COMPLAINT_STATUS_LABELS[c.status]}</Badge>
              </div>
              {c.details && <p className="mt-2 text-[15px] text-ink-2">{c.details}</p>}
              <div className="mt-3 space-y-1 rounded-2xl bg-cream p-3 text-sm">
                {c.targetUser && (
                  <p>
                    Kimga: <b>{c.targetUser.name}</b> {c.targetUser.status === "BLOCKED" && <Badge tone="danger">Bloklangan</Badge>}{" "}
                    {c.targetUser.master && <a className="font-semibold text-brand-600" href={`/ustalar/${c.targetUser.master.id}`} target="_blank">profil ↗</a>}
                  </p>
                )}
                {c.order && <p>Buyurtma: <Link className="font-semibold text-brand-600" href={`/buyurtmalar/${c.order.id}`}>{c.order.code}</Link></p>}
                {c.review && <p>Sharh ({c.review.rating}★{c.review.status === "HIDDEN" ? ", yashirilgan" : ""}): “{c.review.comment}”</p>}
              </div>
              {c.adminNote && <p className="mt-2 text-sm text-muted">Admin izohi: {c.adminNote}</p>}
              {c.status === "OPEN" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminAction url={`/api/admin/complaints/${c.id}`} body={{ status: "RESOLVED" }} label="Hal qilindi" variant="primary" noteField="adminNote" noteLabel="Ko‘rilgan chora (shikoyatchiga yuboriladi)" success="Shikoyat yopildi" />
                  <AdminAction url={`/api/admin/complaints/${c.id}`} body={{ status: "REJECTED" }} label="Rad etish" variant="secondary" noteField="adminNote" noteLabel="Sabab" success="Shikoyat rad etildi" />
                  {c.targetUser && c.targetUser.status === "ACTIVE" && (
                    <AdminAction url={`/api/admin/users/${c.targetUser.id}`} body={{ status: "BLOCKED" }} label="Foydalanuvchini bloklash" variant="danger" confirm={`${c.targetUser.name} hisobini bloklaysizmi?`} success="Bloklandi" />
                  )}
                  {c.review && c.review.status === "VISIBLE" && (
                    <AdminAction url={`/api/admin/reviews/${c.review.id}`} body={{ status: "HIDDEN" }} label="Sharhni yashirish" variant="outline" success="Sharh yashirildi" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Shikoyatlar yo‘q" description="Hammasi joyida!" />
      )}
    </div>
  );
}
