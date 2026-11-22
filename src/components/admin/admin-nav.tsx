"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BadgeCheck, Flag, FolderTree, Home, MessageSquareText, Settings, ShoppingBag, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";

const ITEMS = [
  { href: "/admin", label: "Statistika", icon: BarChart3 },
  { href: "/admin/foydalanuvchilar", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/ustalar", label: "Ustalarni tekshirish", icon: BadgeCheck, badgeKey: "pending" },
  { href: "/admin/kategoriyalar", label: "Kategoriyalar", icon: FolderTree },
  { href: "/admin/xizmatlar", label: "Xizmatlar", icon: Wrench },
  { href: "/admin/buyurtmalar", label: "Buyurtmalar", icon: ShoppingBag },
  { href: "/admin/shikoyatlar", label: "Shikoyatlar", icon: Flag, badgeKey: "complaints" },
  { href: "/admin/sharhlar", label: "Sharhlar", icon: MessageSquareText },
  { href: "/admin/sozlamalar", label: "Sozlamalar", icon: Settings },
] as const;

export function AdminNav({ badges }: { badges: { pending: number; complaints: number } }) {
  const pathname = usePathname();
  return (
    <aside className="lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-line lg:bg-white lg:p-5">
      <div className="hidden items-center justify-between lg:flex">
        <Logo />
      </div>
      <p className="mb-2 mt-6 hidden px-3 text-xs font-bold uppercase tracking-wider text-muted lg:block">Administrator</p>
      <nav className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 lg:flex-col lg:gap-1 lg:p-0" aria-label="Admin navigatsiya">
        {ITEMS.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const badge = "badgeKey" in item ? badges[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold transition lg:rounded-2xl",
                active ? "bg-ink text-white" : "bg-white text-ink-2 shadow-[var(--shadow-soft)] hover:bg-cream lg:shadow-none",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {badge > 0 && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>}
            </Link>
          );
        })}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold text-muted hover:text-brand-600 lg:mt-4 lg:rounded-2xl">
          <Home className="h-4 w-4" /> Saytga qaytish
        </Link>
      </nav>
    </aside>
  );
}
