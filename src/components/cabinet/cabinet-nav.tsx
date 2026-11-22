"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, Images, LayoutDashboard, ShoppingBag, Star, UserRound, Wallet, Wrench, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/usta/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/usta/profil", label: "Profil", icon: UserRound },
  { href: "/usta/xizmatlar", label: "Xizmatlar", icon: Wrench },
  { href: "/buyurtmalar", label: "Buyurtmalar", icon: ShoppingBag },
  { href: "/usta/portfolio", label: "Portfolio", icon: Images },
  { href: "/usta/jadval", label: "Ish jadvali", icon: CalendarClock },
  { href: "/usta/daromad", label: "Daromadlar", icon: Wallet },
  { href: "/usta/sharhlar", label: "Sharhlar", icon: Star },
  { href: "/xabarlar", label: "Yozishmalar", icon: MessageCircle },
];

export function CabinetNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Usta kabineti" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] lg:sticky lg:top-24 lg:mx-0 lg:h-fit lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-[1.75rem] lg:bg-surface lg:p-3 lg:shadow-[var(--shadow-soft)]">
      <p className="hidden px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-muted lg:block">Usta kabineti</p>
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition lg:rounded-2xl",
              active ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "bg-surface text-ink-2 shadow-[var(--shadow-soft)] hover:text-brand-600 lg:bg-transparent lg:shadow-none lg:hover:bg-cream",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
