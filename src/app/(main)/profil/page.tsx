import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell, ChevronRight, Heart, History, MessageCircle, Settings, ShoppingBag, UserRound, LayoutDashboard, Wrench, Images, CalendarClock, Wallet, Star, ShieldCheck, Pencil, Smartphone, RefreshCw,
} from "lucide-react";
import { APP_VERSION } from "@/lib/version";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { unreadMessagesCount } from "@/server/services/chat";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, Badge } from "@/components/ui/misc";
import { LogoutButton } from "@/components/forms/logout-button";
import { ROLE_LABELS, VERIFICATION_LABELS, type Role } from "@/lib/constants";
import { phone } from "@/lib/format";

export const metadata: Metadata = { title: "Profil", robots: { index: false } };

function MenuItem({ href, icon: Icon, label, badge, hint }: { href: string; icon: React.ElementType; label: string; badge?: number; hint?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-cream/70">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1 font-semibold">{label}</span>
      {hint && <span className="text-sm text-muted">{hint}</span>}
      {!!badge && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white">{badge}</span>}
      <ChevronRight className="h-4 w-4 text-muted" />
    </Link>
  );
}

export default async function ProfilePage() {
  const user = await requirePageUser("/profil");
  const [active, completed, favorites, unreadMsg, unreadNotif] = await Promise.all([
    db.order.count({ where: { clientId: user.id, status: { in: ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS"] } } }),
    db.order.count({ where: { clientId: user.id, status: "COMPLETED" } }),
    db.favorite.count({ where: { userId: user.id } }),
    unreadMessagesCount(user.id),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profil" back={false} />
      <section className="card relative mb-5 overflow-hidden p-5 animate-fade-up">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-100 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <Avatar src={user.avatar} name={user.name} size={72} ring />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold">{user.name}</p>
            <p className="text-sm text-muted">{phone(user.phone)}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge tone="brand">{ROLE_LABELS[user.role as Role]}</Badge>
              {user.master && <Badge tone={user.master.verification === "APPROVED" ? "success" : "neutral"}>{VERIFICATION_LABELS[user.master.verification]}</Badge>}
            </div>
          </div>
          <Link href="/profil/tahrirlash" aria-label="Tahrirlash" className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)]">
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { v: active, l: "Faol buyurtma", href: "/buyurtmalar?tab=active&rol=mijoz" },
            { v: completed, l: "Yakunlangan", href: "/buyurtmalar?tab=history&rol=mijoz" },
            { v: favorites, l: "Sevimli usta", href: "/profil/sevimlilar" },
          ].map((s) => (
            <Link key={s.l} href={s.href} className="rounded-2xl bg-cream p-3 transition hover:bg-brand-50">
              <p className="text-2xl font-extrabold">{s.v}</p>
              <p className="text-xs text-muted">{s.l}</p>
            </Link>
          ))}
        </div>
      </section>

      {user.role === "ADMIN" && (
        <Link href="/admin" className="mb-5 flex items-center gap-3 rounded-[1.5rem] bg-ink p-4 text-white">
          <ShieldCheck className="h-6 w-6 text-brand-400" />
          <span className="flex-1 font-bold">Administrator paneli</span>
          <ChevronRight className="h-5 w-5" />
        </Link>
      )}

      {user.master && (
        <>
          <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wider text-muted">Usta kabineti</h2>
          <nav className="card mb-5 divide-y divide-line overflow-hidden">
            <MenuItem href="/usta/panel" icon={LayoutDashboard} label="Boshqaruv paneli" />
            <MenuItem href="/usta/profil" icon={UserRound} label="Profilni tahrirlash" />
            <MenuItem href="/usta/xizmatlar" icon={Wrench} label="Xizmatlar" />
            <MenuItem href="/buyurtmalar" icon={ShoppingBag} label="Kelgan buyurtmalar" />
            <MenuItem href="/usta/portfolio" icon={Images} label="Portfolio" />
            <MenuItem href="/usta/jadval" icon={CalendarClock} label="Ish jadvali" />
            <MenuItem href="/usta/daromad" icon={Wallet} label="Daromadlar" />
            <MenuItem href="/usta/sharhlar" icon={Star} label="Reyting va sharhlar" />
          </nav>
        </>
      )}

      <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wider text-muted">Mening hisobim</h2>
      <nav className="card mb-5 divide-y divide-line overflow-hidden">
        <MenuItem href="/profil/tahrirlash" icon={UserRound} label="Shaxsiy ma’lumotlar" />
        <MenuItem href="/buyurtmalar?tab=active&rol=mijoz" icon={ShoppingBag} label="Faol buyurtmalar" badge={active} />
        <MenuItem href="/buyurtmalar?tab=history&rol=mijoz" icon={History} label="Buyurtmalar tarixi" />
        <MenuItem href="/profil/sevimlilar" icon={Heart} label="Sevimli ustalar" hint={String(favorites)} />
        <MenuItem href="/xabarlar" icon={MessageCircle} label="Xabarlar" badge={unreadMsg} />
        <MenuItem href="/profil/bildirishnomalar" icon={Bell} label="Bildirishnomalar" badge={unreadNotif} />
        <MenuItem href="/profil/sozlamalar" icon={Settings} label="Sozlamalar" />
      </nav>

      <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wider text-muted">Ilova</h2>
      <nav className="card mb-5 divide-y divide-line overflow-hidden">
        <MenuItem href="/ilova" icon={Smartphone} label="UstaTop ilovasi" />
        <MenuItem href="/yangilanishlar" icon={RefreshCw} label="Yangilanishlar" hint={`v${APP_VERSION}`} />
      </nav>
      <LogoutButton />
    </div>
  );
}
