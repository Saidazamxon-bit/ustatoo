import type { Metadata } from "next";
import { Star } from "lucide-react";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { EmptyState } from "@/components/ui/states";
import { Avatar, Stars, Badge } from "@/components/ui/misc";
import { ReplyForm } from "./reply-form";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Reyting va sharhlar", robots: { index: false } };

export default async function MasterReviewsPage() {
  const user = await requirePageUser("/usta/sharhlar", ["MASTER"]);
  const masterId = user.master!.id;
  const [m, reviews] = await Promise.all([
    db.masterProfile.findUniqueOrThrow({ where: { id: masterId }, select: { rating: true, reviewCount: true } }),
    db.review.findMany({ where: { masterId }, orderBy: { createdAt: "desc" }, include: { client: { select: { name: true, avatar: true } }, order: { select: { code: true } } } }),
  ]);
  return (
    <div className="space-y-5 pt-4 lg:pt-0">
      <h1 className="text-[26px] font-bold tracking-tight">Reyting va sharhlar</h1>
      <div className="card flex items-center gap-5 p-5">
        <p className="text-5xl font-extrabold">{m.rating ? m.rating.toFixed(1) : "—"}</p>
        <div>
          <Stars value={m.rating} size={20} />
          <p className="mt-1 text-sm text-muted">{m.reviewCount} ta ko‘rinadigan sharh</p>
        </div>
      </div>
      {reviews.length ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <article key={r.id} className="card p-4">
              <div className="flex items-center gap-3">
                <Avatar src={r.client.avatar} name={r.client.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.client.name}</p>
                  <p className="text-xs text-muted">{timeAgo(r.createdAt)} {r.order && `· ${r.order.code}`}</p>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              {r.status === "HIDDEN" && <Badge tone="warn" className="mt-2">Moderator tomonidan yashirilgan</Badge>}
              <p className="mt-2.5 text-[15px] text-ink-2">{r.comment}</p>
              <ReplyForm reviewId={r.id} initial={r.reply} />
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Star className="h-7 w-7" />} title="Hali sharhlar yo‘q" description="Ishlarni sifatli bajaring — mijozlar baholashadi." />
      )}
    </div>
  );
}
