import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import type { MasterCardData } from "@/server/services/masters";
import { Avatar, Rating, SmartImage, VerifiedBadge } from "@/components/ui/misc";
import { FavoriteButton } from "./favorite-button";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";

function AvailableDot({ on, className }: { on: boolean; className?: string }) {
  if (!on) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-green-700 backdrop-blur", className)}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      Hozir ishlayapti
    </span>
  );
}

/** Katta rasmli usta kartasi (referensdagi "Specialty services" uslubida) */
export function MasterCard({ m, favorite = false, className, priority }: { m: MasterCardData; favorite?: boolean; className?: string; priority?: boolean }) {
  const cover = m.coverImage ?? `/img/categories/${m.category.slug}.jpg`;
  return (
    <Link
      href={`/ustalar/${m.id}`}
      className={cn("group relative block overflow-hidden rounded-[1.75rem] bg-surface shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]", className)}
    >
      <div className="relative aspect-[4/3.4] overflow-hidden">
        <SmartImage src={cover} alt={`${m.user.name} — ${m.specialty}`} sizes="(max-width: 640px) 80vw, 320px" priority={priority} className="transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute left-3 top-3">
          <AvailableDot on={m.isAvailable} />
        </div>
        <FavoriteButton masterId={m.id} initial={favorite} size="sm" className="absolute right-3 top-3" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 text-white">
          <Avatar src={m.user.avatar} name={m.user.name} size={38} ring />
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-[15px] font-bold leading-tight">
              <span className="truncate">{m.user.name}</span>
              {m.verification === "APPROVED" && <VerifiedBadge className="text-white" />}
            </p>
            <p className="truncate text-xs text-white/85">{m.specialty}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <Rating value={m.rating} count={m.reviewCount} />
        <span className="text-sm text-muted">
          dan <b className="font-bold text-ink">{money(m.priceFrom)}</b>
        </span>
      </div>
    </Link>
  );
}

/** Ixcham gorizontal karta: qidiruv natijalari va ro‘yxatlar uchun */
export function MasterRow({ m, favorite = false }: { m: MasterCardData; favorite?: boolean }) {
  const cover = m.coverImage ?? `/img/categories/${m.category.slug}.jpg`;
  return (
    <Link href={`/ustalar/${m.id}`} className="card group flex gap-3.5 p-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] animate-fade-up">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-36">
        <SmartImage src={cover} alt={m.user.name} sizes="160px" className="transition duration-500 group-hover:scale-105" />
        {m.isAvailable && <span className="absolute left-2 top-2 h-3 w-3 rounded-full bg-green-500 ring-2 ring-surface" title="Hozir ishlayapti" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[16px] font-bold leading-tight">
              <span className="truncate">{m.user.name}</span>
              {m.verification === "APPROVED" && <VerifiedBadge />}
            </p>
            <p className="truncate text-sm text-muted">{m.specialty}</p>
          </div>
          <FavoriteButton masterId={m.id} initial={favorite} size="sm" />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-2">
          <Rating value={m.rating} count={m.reviewCount} className="text-[13px]" />
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-muted" /> {m.experienceYears} yil
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate">
              {m.district}
              {m.distanceKm !== undefined && ` · ${m.distanceKm < 1 ? "<1" : Math.round(m.distanceKm)} km`}
            </span>
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <span className="text-sm text-muted">
            dan <b className="text-[17px] font-extrabold text-ink">{money(m.priceFrom)}</b>
          </span>
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition group-hover:bg-brand-500 group-hover:text-white">Ko‘rish</span>
        </div>
      </div>
    </Link>
  );
}

/** Referensning chap ekranidagi kabi avatar "pill" kartasi */
export function MasterPill({ m, active }: { m: MasterCardData; active?: boolean }) {
  return (
    <Link
      href={`/ustalar/${m.id}`}
      className={cn(
        "flex w-[92px] shrink-0 flex-col items-center rounded-full px-2 pb-4 pt-2 text-center transition hover:-translate-y-0.5",
        active ? "bg-brand-50 ring-2 ring-brand-300" : "bg-surface shadow-[var(--shadow-soft)]",
      )}
    >
      <Avatar src={m.user.avatar ?? m.coverImage} name={m.user.name} size={64} />
      <span className="mt-2 w-full truncate text-[13px] font-bold">{m.user.name.split(" ")[0]}</span>
      <span className="w-full truncate text-[10.5px] text-muted">{m.specialty}</span>
      <Rating value={m.rating} className="mt-0.5 text-[11px] [&_svg]:h-3 [&_svg]:w-3" />
    </Link>
  );
}
