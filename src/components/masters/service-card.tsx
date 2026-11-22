import Link from "next/link";
import { Clock } from "lucide-react";
import type { ServiceCardData } from "@/server/services/masters";
import { Avatar, Rating, SmartImage, VerifiedBadge } from "@/components/ui/misc";
import { priceWithUnit } from "@/lib/format";
import { truncate } from "@/lib/text";

/** Tavsiya etilgan xizmat kartasi: rasm, nom, tavsif, narx, taxminiy vaqt va usta */
export function ServiceCard({ s }: { s: ServiceCardData }) {
  return (
    <Link
      href={`/ustalar/${s.master.id}?xizmat=${s.id}#xizmatlar`}
      className="card group flex w-[268px] shrink-0 flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:w-auto"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SmartImage src={s.image ?? s.category.image} alt={s.title} sizes="280px" className="transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink backdrop-blur">{s.category.name}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 text-[15.5px] font-bold">{s.title}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{truncate(s.description, 90)}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-2">
          <Clock className="h-3.5 w-3.5 text-brand-500" /> {s.durationText}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="flex min-w-0 items-center gap-2">
            <Avatar src={s.master.user.avatar} name={s.master.user.name} size={28} />
            <span className="min-w-0">
              <span className="flex items-center gap-1 truncate text-xs font-semibold">
                {s.master.user.name.split(" ")[0]} {s.master.verification === "APPROVED" && <VerifiedBadge />}
              </span>
              <Rating value={s.master.rating} className="text-[11px] [&_svg]:h-3 [&_svg]:w-3" />
            </span>
          </span>
          <span className="text-right text-[15px] font-extrabold text-brand-600">{priceWithUnit(s.price, s.priceUnit)}</span>
        </div>
      </div>
    </Link>
  );
}
