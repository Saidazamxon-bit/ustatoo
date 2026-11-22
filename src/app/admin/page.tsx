import Link from "next/link";
import { BadgeCheck, Flag, ShoppingBag, Users, Wallet, Wrench } from "lucide-react";
import { adminStats } from "@/server/services/stats";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await adminStats();
  const maxDay = Math.max(...s.days.map((d) => Math.max(d.orders, d.users)), 1);
  const maxCat = Math.max(...s.categories.map((c) => c.masters), 1);
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-bold tracking-tight">Statistika</h1>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { icon: Users, l: "Foydalanuvchilar", v: s.users, sub: `${s.clients} mijoz · ${s.masters} usta`, href: "/admin/foydalanuvchilar" },
          { icon: ShoppingBag, l: "Buyurtmalar", v: s.orders, sub: `${s.ordersByStatus.COMPLETED ?? 0} ta yakunlangan`, href: "/admin/buyurtmalar" },
          { icon: Wallet, l: "To‘langan aylanma", v: money(s.gross), sub: `Platforma: ${money(s.platformIncome)}`, href: "/admin/buyurtmalar?holat=COMPLETED" },
          { icon: BadgeCheck, l: "Tekshiruvda", v: s.pendingVerification, sub: `${s.openComplaints} ta ochiq shikoyat`, href: "/admin/ustalar?holat=PENDING" },
        ].map(({ icon: Icon, l, v, sub, href }) => (
          <Link key={l} href={href} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-2xl font-extrabold">{v}</p>
            <p className="font-semibold">{l}</p>
            <p className="text-sm text-muted">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-bold">So‘nggi 14 kun</p>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> Buyurtmalar</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ink" /> Yangi foydalanuvchilar</span>
            </div>
          </div>
          <div className="flex h-52 items-end gap-1.5" role="img" aria-label="Kunlik buyurtmalar va ro‘yxatdan o‘tishlar">
            {s.days.map((d) => (
              <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div className="flex h-full w-full items-end justify-center gap-0.5">
                  <div title={`${d.orders} buyurtma`} className="w-1/2 max-w-3 rounded-t bg-brand-500" style={{ height: `${(d.orders / maxDay) * 100}%`, minHeight: d.orders ? 4 : 1 }} />
                  <div title={`${d.users} foydalanuvchi`} className="w-1/2 max-w-3 rounded-t bg-ink" style={{ height: `${(d.users / maxDay) * 100}%`, minHeight: d.users ? 4 : 1 }} />
                </div>
                <span className="text-[9px] text-muted sm:text-[10px]">{d.label.split(".")[0]}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-5">
          <p className="mb-4 font-bold">Buyurtmalar holati</p>
          <ul className="space-y-2.5">
            {ORDER_STATUSES.map((st) => (
              <li key={st}>
                <Link href={`/admin/buyurtmalar?holat=${st}`} className="flex items-center justify-between text-[15px] hover:text-brand-600">
                  <span>{ORDER_STATUS_LABELS[st]}</span>
                  <span className="font-bold">{s.ordersByStatus[st] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5">
        <p className="mb-4 flex items-center gap-2 font-bold"><Wrench className="h-4 w-4 text-brand-500" /> Kategoriyalar bo‘yicha ustalar</p>
        <div className="grid gap-x-8 gap-y-2.5 md:grid-cols-2">
          {s.categories.map((c) => (
            <div key={c.name} className="flex items-center gap-3 text-sm">
              <span className="w-44 truncate">{c.name}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-cream-2">
                <span className="block h-full rounded-full bg-brand-400" style={{ width: `${(c.masters / maxCat) * 100}%` }} />
              </span>
              <span className="w-16 text-right text-muted">{c.masters} / {c.services}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">usta / xizmat soni</p>
      </section>
      {s.openComplaints > 0 && (
        <Link href="/admin/shikoyatlar?holat=OPEN" className="flex items-center gap-3 rounded-[1.5rem] bg-red-50 p-4 font-semibold text-red-700">
          <Flag className="h-5 w-5" /> {s.openComplaints} ta shikoyat ko‘rib chiqilishini kutmoqda
        </Link>
      )}
    </div>
  );
}
