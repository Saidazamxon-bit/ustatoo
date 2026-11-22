import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import type { OrderListItem } from "@/server/services/orders";
import { Avatar, SmartImage } from "@/components/ui/misc";
import { StatusBadge } from "./status-badge";
import { dateTime, money } from "@/lib/format";

export function OrderCard({ o, scope }: { o: OrderListItem; scope: "client" | "master" }) {
  const title = o.items.map((i) => i.title).join(", ");
  return (
    <Link href={`/buyurtmalar/${o.id}`} className="card group flex gap-3.5 p-3.5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] animate-fade-up">
      {scope === "client" ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream-2">
          {o.master.coverImage ? <SmartImage src={o.master.coverImage} alt={o.master.user.name} sizes="80px" /> : <Avatar src={o.master.user.avatar} name={o.master.user.name} size={80} />}
        </div>
      ) : (
        <Avatar src={o.client.avatar} name={o.client.name} size={56} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-bold">{scope === "client" ? o.master.user.name : o.client.name}</p>
          <StatusBadge status={o.status} className="shrink-0" />
        </div>
        <p className="truncate text-sm text-muted">{title}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-[13px]">
          <span className="inline-flex items-center gap-1 text-ink-2">
            <CalendarDays className="h-3.5 w-3.5 text-brand-500" /> {dateTime(o.scheduledAt)}
          </span>
          <span className="font-extrabold">{money(o.totalAmount)}</span>
        </div>
        <p className="mt-1 flex items-center justify-between text-xs text-muted">
          <span>{o.code}</span>
          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}
