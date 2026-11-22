import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" fill="#F47721" />
      {/* Kaska (hard hat) shaklidagi belgi */}
      <path d="M10 24.5c0-6.2 4.5-11 10-11s10 4.8 10 11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 13.5v5" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <rect x="7.5" y="24" width="25" height="4.2" rx="2.1" fill="#fff" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)} aria-label="UstaTop bosh sahifa">
      <LogoMark />
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-ink">
          Usta<span className="text-brand-500">Top</span>
        </span>
      )}
    </Link>
  );
}
