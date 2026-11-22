import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { requirePageUser } from "@/server/auth";
import { listOrders } from "@/server/services/orders";
import { PageHeader } from "@/components/layout/page-header";
import { OrderCard } from "@/components/orders/order-card";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { LiveRefresh } from "@/components/orders/live-refresh";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Buyurtmalar", robots: { index: false } };

type Props = { searchParams: Promise<{ tab?: string; rol?: string }> };

const TABS = [
  { v: "active", l: "Faol" },
  { v: "history", l: "Tarix" },
  { v: "all", l: "Barchasi" },
] as const;

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await requirePageUser("/buyurtmalar");
  const isMaster = !!user.master;
  const scope = isMaster && sp.rol !== "mijoz" ? "master" : "client";
  const tab = (TABS.find((t) => t.v === sp.tab)?.v ?? "active") as "active" | "history" | "all";
  const orders = await listOrders(user, scope, tab);
  const href = (p: Record<string, string>) => `/buyurtmalar?${new URLSearchParams({ tab, ...(scope === "client" && isMaster ? { rol: "mijoz" } : {}), ...p })}`;

  return (
    <div>
      <LiveRefresh />
      <PageHeader title="Buyurtmalar" back={false} />
      {isMaster && (
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-surface p-1 shadow-[var(--shadow-soft)] lg:max-w-md">
          <Link href={`/buyurtmalar?tab=${tab}`} className={cn("rounded-full py-2.5 text-center text-sm font-bold transition", scope === "master" ? "bg-ink text-cream" : "text-ink-2")}>
            Kelgan buyurtmalar
          </Link>
          <Link href={`/buyurtmalar?tab=${tab}&rol=mijoz`} className={cn("rounded-full py-2.5 text-center text-sm font-bold transition", scope === "client" ? "bg-ink text-cream" : "text-ink-2")}>
            Mening buyurtmalarim
          </Link>
        </div>
      )}
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <Link key={t.v} href={href({ tab: t.v })} className={cn("chip", tab === t.v ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "hover:text-brand-600")}>
            {t.l}
          </Link>
        ))}
      </div>
      {orders.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => (
            <OrderCard key={o.id} o={o} scope={scope} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title={tab === "active" ? "Faol buyurtmalar yo‘q" : "Buyurtmalar topilmadi"}
          description={scope === "master" ? "Yangi buyurtmalar shu yerda paydo bo‘ladi. Profilingizni to‘ldirib, ko‘proq mijoz jalb qiling." : "Kerakli ustani toping va bir necha daqiqada buyurtma bering."}
          action={scope === "master" ? <ButtonLink href="/usta/profil">Profilni to‘ldirish</ButtonLink> : <ButtonLink href="/kategoriyalar">Usta topish</ButtonLink>}
        />
      )}
    </div>
  );
}
