import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, Inbox, Star, Wallet, Eye } from "lucide-react";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { masterDashboard } from "@/server/services/stats";
import { AvailabilityToggle } from "@/components/cabinet/availability-toggle";
import { VerificationCard } from "@/components/cabinet/verification-card";
import { OrderCard } from "@/components/orders/order-card";
import { LiveRefresh } from "@/components/orders/live-refresh";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { money } from "@/lib/format";

export const metadata: Metadata = { title: "Usta paneli", robots: { index: false } };

export default async function MasterPanelPage() {
  const user = await requirePageUser("/usta/panel", ["MASTER"]);
  const masterId = user.master!.id;
  const [d, profile] = await Promise.all([
    masterDashboard(masterId),
    db.masterProfile.findUniqueOrThrow({ where: { id: masterId }, select: { isAvailable: true, verification: true, verificationNote: true, bio: true, _count: { select: { services: true, portfolio: true } } } }),
  ]);
  const checklist = [
    { ok: profile.bio.length >= 30, label: "“Usta haqida” bo‘limini to‘ldiring", href: "/usta/profil" },
    { ok: profile._count.services > 0, label: "Kamida bitta xizmat qo‘shing", href: "/usta/xizmatlar" },
    { ok: profile._count.portfolio >= 3, label: "3 ta ish namunasini yuklang", href: "/usta/portfolio" },
    { ok: !!user.avatar, label: "Profil rasmini yuklang", href: "/usta/profil" },
  ];
  const progress = Math.round((checklist.filter((c) => c.ok).length / checklist.length) * 100);

  return (
    <div className="space-y-5 pt-4 lg:pt-0">
      <LiveRefresh />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted">Xush kelibsiz,</p>
          <h1 className="text-[26px] font-bold tracking-tight">{user.name}</h1>
        </div>
        <ButtonLink href={`/ustalar/${masterId}`} variant="secondary" size="sm" icon={<Eye className="h-4 w-4" />}>
          Ommaviy profil
        </ButtonLink>
      </div>
      <div className="card p-5">
        <AvailabilityToggle initial={profile.isAvailable} />
      </div>
      <VerificationCard status={profile.verification} note={profile.verificationNote} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Inbox, v: d.newCount, l: "Yangi buyurtma", href: "/buyurtmalar?tab=active", tone: "bg-blue-50 text-blue-600" },
          { icon: CalendarCheck, v: d.todayJobs, l: "Bugungi ishlar", href: "/usta/jadval", tone: "bg-brand-50 text-brand-600" },
          { icon: CheckCircle2, v: d.completedCount, l: "Yakunlangan", href: "/buyurtmalar?tab=history", tone: "bg-green-50 text-green-600" },
          { icon: Star, v: d.profile?.rating ? d.profile.rating.toFixed(1) : "—", l: `${d.profile?.reviewCount ?? 0} ta sharh`, href: "/usta/sharhlar", tone: "bg-amber-50 text-amber-600" },
        ].map(({ icon: Icon, v, l, href, tone }) => (
          <Link key={l} href={href} className="card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
            <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-2xl font-extrabold">{v}</p>
            <p className="text-sm text-muted">{l}</p>
          </Link>
        ))}
      </div>

      <Link href="/usta/daromad" className="relative block overflow-hidden rounded-[1.75rem] bg-brand-500 p-5 text-white shadow-[var(--shadow-brand)]">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/15" />
        <p className="flex items-center gap-2 text-sm text-white/85">
          <Wallet className="h-4 w-4" /> Shu oydagi sof daromad
        </p>
        <p className="mt-1 text-3xl font-extrabold">{money(d.earnings.thisMonth)}</p>
        <p className="mt-1 text-sm text-white/85">
          Jami: {money(d.earnings.total)} · Kutilmoqda: {money(d.earnings.expected)}
        </p>
        <ArrowRight className="absolute bottom-5 right-5 h-5 w-5" />
      </Link>

      {progress < 100 && (
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold">Profil to‘liqligi</p>
            <span className="text-sm font-bold text-brand-600">{progress}%</span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-cream-2">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <ul className="space-y-2">
            {checklist.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="flex items-center gap-2.5 text-[15px]">
                  <CheckCircle2 className={c.ok ? "h-5 w-5 text-success" : "h-5 w-5 text-line"} />
                  <span className={c.ok ? "text-muted line-through" : "font-semibold"}>{c.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Yaqin buyurtmalar</h2>
          <Link href="/buyurtmalar" className="text-sm font-semibold text-muted hover:text-brand-600">
            Barchasi
          </Link>
        </div>
        {d.upcoming.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {d.upcoming.map((o) => (
              <OrderCard key={o.id} o={o} scope="master" />
            ))}
          </div>
        ) : (
          <EmptyState title="Faol buyurtmalar yo‘q" description="“Hozir ishlayapman” holatini yoqing va profilingizni to‘ldiring — mijozlar sizni tezroq topadi." />
        )}
      </section>
    </div>
  );
}
