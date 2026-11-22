import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Wallet, Clock3, Percent } from "lucide-react";
import { requirePageUser } from "@/server/auth";
import { masterEarnings } from "@/server/services/stats";
import { EmptyState } from "@/components/ui/states";
import { Badge } from "@/components/ui/misc";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";
import { dateShort, money, moneyShort } from "@/lib/format";

export const metadata: Metadata = { title: "Daromadlar", robots: { index: false } };

export default async function EarningsPage() {
  const user = await requirePageUser("/usta/daromad", ["MASTER"]);
  const e = await masterEarnings(user.master!.id);
  const max = Math.max(...e.months.map((m) => m.net), 1);
  return (
    <div className="space-y-5 pt-4 lg:pt-0">
      <h1 className="text-[26px] font-bold tracking-tight">Daromadlar</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Wallet, l: "Jami sof daromad", v: money(e.total), tone: "bg-brand-500 text-white shadow-[var(--shadow-brand)]", sub: "text-white/80" },
          { icon: TrendingUp, l: "Shu oy", v: money(e.thisMonth), tone: "bg-surface", sub: "text-muted" },
          { icon: Clock3, l: "Kutilayotgan", v: money(e.expected), tone: "bg-surface", sub: "text-muted" },
          { icon: Percent, l: "Platforma komissiyasi", v: `${e.commission}%`, tone: "bg-surface", sub: "text-muted" },
        ].map(({ icon: Icon, l, v, tone, sub }) => (
          <div key={l} className={`rounded-[1.5rem] p-4 shadow-[var(--shadow-soft)] ${tone}`}>
            <Icon className="mb-3 h-5 w-5" />
            <p className="text-lg font-extrabold leading-tight sm:text-xl">{v}</p>
            <p className={`text-sm ${sub}`}>{l}</p>
          </div>
        ))}
      </div>

      <section className="card p-5">
        <p className="mb-4 font-bold">So‘nggi 6 oy (sof daromad)</p>
        <div className="flex h-48 items-end gap-3" role="img" aria-label="Oylik daromad grafigi">
          {e.months.map((m, i) => (
            <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[11px] font-semibold text-ink-2">{m.net ? moneyShort(m.net) : ""}</span>
              <div
                title={money(m.net)}
                className={`w-full max-w-12 rounded-t-xl transition-all ${i === e.months.length - 1 ? "bg-brand-500" : "bg-brand-200"}`}
                style={{ height: `${Math.max((m.net / max) * 100, m.net ? 6 : 2)}%` }}
              />
              <span className="text-xs text-muted">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">To‘lovlar tarixi</h2>
        {e.transactions.length ? (
          <div className="card divide-y divide-line">
            {e.transactions.map((t) => (
              <Link key={t.id} href={`/buyurtmalar/${t.id}`} className="flex items-center gap-3 p-4 transition hover:bg-cream/60">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.client.name}</p>
                  <p className="text-sm text-muted">
                    {t.code} · {dateShort(t.completedAt ?? t.updatedAt)} · <Badge>{PAYMENT_METHOD_LABELS[t.paymentMethod as PaymentMethod]}</Badge>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-success">+{money(t.net)}</p>
                  <p className="text-xs text-muted">{money(t.totalAmount)} dan</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Wallet className="h-7 w-7" />} title="Hali to‘lovlar yo‘q" description="Yakunlangan va to‘langan buyurtmalar shu yerda ko‘rinadi." />
        )}
      </section>
    </div>
  );
}
