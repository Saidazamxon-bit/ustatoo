"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, MessageCircle, ShoppingBag, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/components/providers/session";

export const NAV_ITEMS = [
  { href: "/", label: "Bosh sahifa", icon: House, match: (p: string) => p === "/" },
  { href: "/kategoriyalar", label: "Kategoriyalar", icon: LayoutGrid, match: (p: string) => p.startsWith("/kategoriyalar") || p.startsWith("/qidiruv") },
  { href: "/buyurtmalar", label: "Buyurtmalar", icon: ShoppingBag, match: (p: string) => p.startsWith("/buyurtma") || p.startsWith("/tolov") },
  { href: "/xabarlar", label: "Xabarlar", icon: MessageCircle, match: (p: string) => p.startsWith("/xabarlar") },
  { href: "/profil", label: "Profil", icon: UserRound, match: (p: string) => p.startsWith("/profil") || p.startsWith("/usta/") },
];

// Bu sahifalarda o‘zining pastki paneli bor (chat kiritish, buyurtma tugmasi)
const HIDDEN = [/^\/xabarlar\/.+/, /^\/buyurtma\/yangi/, /^\/tolov\//, /^\/ustalar\/.+/];

export function BottomNav() {
  const pathname = usePathname();
  const { unreadMessages } = useSession();
  if (HIDDEN.some((r) => r.test(pathname))) return null;

  return (
    <nav
      aria-label="Asosiy navigatsiya"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="glass flex items-center gap-1 rounded-full p-1.5 shadow-[var(--shadow-lift)] ring-1 ring-black/[0.03]">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          const badge = href === "/xabarlar" && unreadMessages > 0 ? unreadMessages : 0;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-11 items-center justify-center rounded-full transition-all duration-300 sm:h-12",
                active ? "gap-1.5 whitespace-nowrap bg-brand-500 px-3.5 text-white shadow-[var(--shadow-brand)]" : "w-11 bg-white text-ink-2 hover:text-brand-600 sm:w-12",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 1.9} />
              {active && <span className="text-[12.5px] font-semibold animate-fade-in">{label}</span>}
              {badge > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-bold text-white ring-2 ring-white animate-pop">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
