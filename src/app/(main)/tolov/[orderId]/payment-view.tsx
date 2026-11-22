"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, SmartImage, Rating, Badge } from "@/components/ui/misc";
import { Button, ButtonLink } from "@/components/ui/button";
import { PaymentMethods } from "@/components/orders/payment-methods";
import { RemoveItemButton } from "@/components/orders/order-actions";
import { LiveRefresh } from "@/components/orders/live-refresh";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { money } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";

type Props = {
  demo: boolean;
  order: { id: string; code: string; status: string; totalAmount: number; paymentMethod: string; paymentStatus: string; items: { id: string; title: string; price: number; quantity: number; serviceId: string | null }[] };
  master: { id: string; name: string; avatar: string | null; cover: string | null; specialty: string; rating: number; reviewCount: number };
};

export function PaymentView({ order, master, demo }: Props) {
  const [method, setMethod] = useState<PaymentMethod>(order.paymentMethod === "CASH" ? "CLICK" : (order.paymentMethod as PaymentMethod));
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const paid = order.paymentStatus === "PAID";
  const cancelled = order.status === "CANCELLED";
  const editable = ["NEW", "PENDING"].includes(order.status) && order.paymentStatus === "UNPAID" && order.items.length > 1;

  const pay = async () => {
    setBusy(true);
    try {
      const res = await api.post<{ redirectUrl: string }>("/api/payments", { orderId: order.id, method });
      if (res.redirectUrl.startsWith("http")) window.location.href = res.redirectUrl;
      else router.push(res.redirectUrl);
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl pb-36">
      <LiveRefresh orderId={order.id} />
      <PageHeader title="To‘lov" subtitle={order.code} backHref={`/buyurtmalar/${order.id}`} />

      {/* Tanlangan usta */}
      <section className="card mb-6 flex items-center gap-3.5 p-3">
        <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl bg-brand-100">
          {master.cover ? <SmartImage src={master.cover} alt={master.name} sizes="84px" /> : <Avatar src={master.avatar} name={master.name} size={84} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-bold">{master.name}</p>
            <Link href={`/ustalar/${master.id}`} className="shrink-0 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white">
              Profil
            </Link>
          </div>
          <p className="truncate text-sm text-muted">{master.specialty}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[17px] font-extrabold">
              {money(order.totalAmount)} <span className="text-xs font-medium text-muted">(jami)</span>
            </span>
            <Rating value={master.rating} count={master.reviewCount} className="text-xs" />
          </div>
        </div>
      </section>

      <h2 className="section-title mb-3">Xizmatlar</h2>
      <section className="card mb-6 divide-y divide-line">
        {order.items.map((i) => (
          <div key={i.id} className="flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{i.title}</p>
              <p className="text-sm text-muted">
                {i.quantity > 1 ? `${i.quantity} × ${money(i.price)} = ` : ""}
                <b className="text-ink">{money(i.price * i.quantity)}</b>
              </p>
            </div>
            {editable && <RemoveItemButton orderId={order.id} itemId={i.id} />}
          </div>
        ))}
      </section>

      {paid ? (
        <div className="card flex flex-col items-center p-8 text-center animate-pop">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <p className="mt-3 text-xl font-bold">Buyurtma to‘langan</p>
          <p className="mt-1 text-muted">{PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]} orqali {money(order.totalAmount)} to‘landi.</p>
          <ButtonLink href={`/buyurtmalar/${order.id}`} className="mt-5">
            Buyurtmaga qaytish
          </ButtonLink>
        </div>
      ) : cancelled ? (
        <div className="card p-6 text-center">
          <p className="font-bold">Buyurtma bekor qilingan</p>
          <p className="text-muted">Bekor qilingan buyurtmani to‘lab bo‘lmaydi.</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">To‘lov usuli</h2>
            {demo && <Badge tone="warn">Demo rejim</Badge>}
          </div>
          <PaymentMethods value={method} onChange={setMethod} />
          <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
            <ShieldCheck className="h-4 w-4 text-success" />
            {demo ? "Demo rejim: haqiqiy pul yechilmaydi. To‘lov jarayoni to‘liq simulyatsiya qilinadi." : "To‘lov provayderning himoyalangan sahifasida amalga oshiriladi."}
          </p>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
            <div className="mx-auto flex max-w-xl items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted">To‘lanadi</p>
                <p className="truncate text-xl font-extrabold">{money(order.totalAmount)}</p>
              </div>
              <Button size="lg" loading={busy} onClick={pay} icon={<Lock className="h-4 w-4" />}>
                {method === "CASH" ? "Naqd to‘layman" : `${PAYMENT_METHOD_LABELS[method]} orqali to‘lash`}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
