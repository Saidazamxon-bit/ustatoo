"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, ShieldCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { NAV_ITEMS } from "./bottom-nav";
import { useSession } from "@/components/providers/session";
import { Avatar } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

/** Kompyuter va planshet uchun yuqori navigatsiya paneli */
export function TopHeader() {
  const pathname = usePathname();
  const { user, unreadNotifications, unreadMessages } = useSession();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-line/70 bg-cream/85 backdrop-blur-lg lg:block">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-8">
        <Logo />
        <nav className="flex items-center gap-1" aria-label="Asosiy navigatsiya">
          {NAV_ITEMS.map(({ href, label, match }) => {
            const active = match(pathname);
            const badge = href === "/xabarlar" ? unreadMessages : 0;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[15px] font-semibold transition",
                  active ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "text-ink-2 hover:bg-white",
                )}
              >
                {label}
                {badge > 0 && <span className="ml-1.5 rounded-full bg-ink px-1.5 py-0.5 text-[11px] text-white">{badge}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/qidiruv" className="flex h-11 w-56 items-center gap-2 rounded-full bg-white px-4 text-sm text-muted shadow-[var(--shadow-soft)] transition hover:text-ink xl:w-72">
            <Search className="h-4 w-4" /> Usta yoki xizmat qidirish…
          </Link>
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <ButtonLink href="/admin" variant="dark" size="sm" icon={<ShieldCheck className="h-4 w-4" />}>
                  Admin
                </ButtonLink>
              )}
              {user.role === "MASTER" && (
                <ButtonLink href="/usta/panel" variant="outline" size="sm" icon={<LayoutDashboard className="h-4 w-4" />}>
                  Usta paneli
                </ButtonLink>
              )}
              <Link href="/profil/bildirishnomalar" aria-label="Bildirishnomalar" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)]">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />}
              </Link>
              <Link href="/profil" aria-label="Profil">
                <Avatar src={user.avatar} name={user.name} size={44} ring />
              </Link>
            </>
          ) : (
            <>
              <ButtonLink href="/kirish" variant="secondary" size="sm">
                Kirish
              </ButtonLink>
              <ButtonLink href="/royxatdan-otish" size="sm">
                Ro‘yxatdan o‘tish
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
