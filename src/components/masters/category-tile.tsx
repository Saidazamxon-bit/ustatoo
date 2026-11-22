import Link from "next/link";
import { SmartImage } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

/** Rasmli kategoriya bloki: rasm ustida shisha effektli nom (referensdagi kabi) */
export function CategoryTile({
  c,
  className,
  showCount,
}: {
  c: { slug: string; name: string; image: string; _count?: { masters: number } };
  className?: string;
  showCount?: boolean;
}) {
  return (
    <Link
      href={`/kategoriyalar/${c.slug}`}
      className={cn("group relative block aspect-[1/0.92] overflow-hidden rounded-[1.4rem] bg-cream-2 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]", className)}
    >
      <SmartImage src={c.image} alt={c.name} sizes="(max-width: 640px) 33vw, 200px" className="transition duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      <div className="absolute inset-x-1.5 bottom-1.5 rounded-xl bg-surface/25 px-2 py-1.5 text-center backdrop-blur-md ring-1 ring-white/30">
        <p className="truncate text-[11.5px] font-bold leading-tight text-white drop-shadow sm:text-[13px]">{c.name}</p>
        {showCount && c._count && <p className="text-[10.5px] text-white/85">{c._count.masters} usta</p>}
      </div>
    </Link>
  );
}
