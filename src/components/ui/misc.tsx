import type { ReactNode } from "react";
import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

/** /img/* statik rasmlar next/image orqali optimallashtiriladi, yuklanganlar oddiy <img> */
export function SmartImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src.startsWith("/img/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" className={cn("absolute inset-0 h-full w-full object-cover", className)} />;
}

const AVATAR_TINTS = ["from-brand-400 to-brand-600", "from-amber-400 to-orange-500", "from-orange-300 to-rose-400", "from-yellow-400 to-amber-600"];

export function Avatar({ src, name, size = 44, className, ring }: { src?: string | null; name: string; size?: number; className?: string; ring?: boolean }) {
  const tint = AVATAR_TINTS[name.length % AVATAR_TINTS.length];
  return (
    <span
      className={cn("relative inline-flex shrink-0 overflow-hidden rounded-full bg-cream-2", ring && "ring-[3px] ring-surface", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        <SmartImage src={src} alt={name} sizes={`${size * 2}px`} />
      ) : (
        <span className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br font-bold text-white", tint)} style={{ fontSize: size * 0.36 }}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}

export function VerifiedBadge({ className, withText }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-brand-500", className)} title="Tasdiqlangan usta">
      <BadgeCheck className="h-[1.1em] w-[1.1em] fill-brand-500 text-white" aria-label="Tasdiqlangan usta" />
      {withText && <span className="text-xs font-semibold">Tasdiqlangan</span>}
    </span>
  );
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold text-ink", className)}>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
      {value > 0 ? value.toFixed(1) : "Yangi"}
      {count !== undefined && count > 0 && <span className="font-normal text-muted">({count})</span>}
    </span>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} yulduz`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-line text-line"} />
      ))}
    </span>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "brand" | "success" | "danger" | "info" | "warn"; className?: string }) {
  const tones = {
    neutral: "bg-cream-2 text-ink-2",
    brand: "bg-brand-100 text-brand-700",
    success: "bg-green-50 text-green-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-blue-50 text-blue-700",
    warn: "bg-amber-50 text-amber-700",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function SectionHeader({ title, href, action = "Barchasi", className }: { title: string; href?: string; action?: string; className?: string }) {
  return (
    <div className={cn("mb-3.5 flex items-center justify-between", className)}>
      <h2 className="section-title">{title}</h2>
      {href && (
        <a href={href} className="text-sm font-semibold text-muted transition hover:text-brand-600">
          {action}
        </a>
      )}
    </div>
  );
}
