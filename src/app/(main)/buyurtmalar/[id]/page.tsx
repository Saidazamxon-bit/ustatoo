import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Phone, Hourglass, CircleCheck, XCircle, Wallet } from "lucide-react";
import { requirePageUser } from "@/server/auth";
import { getOrderForUser, markViewedByMaster } from "@/server/services/orders";
import { HttpError } from "@/server/errors";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, Badge, Rating, Stars } from "@/components/ui/misc";
import { StatusBadge } from "@/components/orders/status-badge";
import { OrderActions, RemoveItemButton } from "@/components/orders/order-actions";
import { LiveRefresh } from "@/components/orders/live-refresh";
import { ComplaintButton } from "@/components/forms/complaint-button";
import { ErrorState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { ORDER_STATUS_HINTS, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, type OrderStatus, type PaymentMethod } from "@/lib/constants";
import { dateLong, dateTime, money, phone as fmtPhone, time } from "@/lib/format";
import { parseJsonArray, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Buyurtma", robots: { index: false } };

const FLOW: OrderStatus[] = ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ yangi?: string; tolov?: string }> };

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requirePageUser(`/buyurtmalar/${id}`);
  let data;
  try {
    data = await getOrderForUser(user, id);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    if (e instanceof HttpError && e.status === 403)
      return (
        <div>
          <PageHeader title="Buyurtma" />
          <ErrorState title="Ruxsat yo‘q" description="Bu buyurtma sizga tegishli emas." action={<ButtonLink href="/buyurtmalar">Buyurtmalarim</ButtonLink>} />
        </div>
      );
    throw e;
  }
  let { order } = data;
  const { role } = data;
  if (role === "master" && order.status === "NEW") {
    await markViewedByMaster(order.id, user.id, order.clientId);
    order = { ...order, status: "PENDING" };
  }
  const status = order.status as OrderStatus;
  const images = parseJsonArray(order.images);
  const stepIndex = FLOW.indexOf(status);
  const other =
    role === "client"
      ? { name: order.master.user.name, avatar: order.master.user.avatar, sub: order.master.specialty, phone: order.master.publicPhone ?? order.master.user.phone, href: `/ustalar/${order.master.id}`, userId: order.master.userId }
      : { name: order.client.name, avatar: order.client.avatar, sub: "Mijoz", phone: order.client.phone, href: null, userId: order.client.id };
  const canEditItems = role === "client" && ["NEW", "PENDING"].includes(status) && order.paymentStatus === "UNPAID" && order.items.length > 1;

  return (
    <div className="mx-auto max-w-3xl">
      <LiveRefresh orderId={order.id} />
      <PageHeader title={order.code} subtitle={`${dateLong(order.createdAt)} da yaratilgan`} backHref="/buyurtmalar" />

      {sp.yangi && (status === "NEW" || status === "PENDING") && (
        <div className="mb-4 flex items-center gap-3 rounded-[1.5rem] bg-green-50 p-4 text-green-800 animate-fade-up">
          <CircleCheck className="h-6 w-6 shrink-0" />
          <p className="text-[15px] font-semibold">Buyurtmangiz ustaga yuborildi! Usta javobini shu sahifada real vaqtda ko‘rasiz.</p>
        </div>
      )}
      {sp.tolov === "naqd" && <div className="mb-4 rounded-[1.5rem] bg-blue-50 p-4 text-[15px] font-semibold text-blue-800">To‘lov usuli: naqd pul. Ish yakunida ustaga to‘laysiz.</div>}

      {/* Holat */}
      <section className="card mb-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={status} className="px-3 py-1.5 text-sm" />
          <span className="text-sm text-muted">{dateTime(order.updatedAt)}</span>
        </div>
        <p className="mt-3 text-[15px] text-ink-2">{ORDER_STATUS_HINTS[status]}</p>
        {status === "CANCELLED" ? (
          <div className="mt-3 flex gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>
              {order.cancelledBy === "MASTER" ? "Usta rad etdi" : order.cancelledBy === "ADMIN" ? "Administrator bekor qildi" : order.cancelledBy === "SYSTEM" ? "Avtomatik bekor qilindi" : "Mijoz bekor qildi"}
              {order.cancelReason && `: ${order.cancelReason}`}
            </span>
          </div>
        ) : (
          <ol className="mt-4 grid grid-cols-5 gap-1.5" aria-label="Buyurtma bosqichlari">
            {FLOW.map((s, i) => (
              <li key={s} className="text-center">
                <span className={cn("mx-auto block h-1.5 rounded-full", i <= stepIndex ? "bg-brand-500" : "bg-line")} />
                <span className={cn("mt-1.5 block text-[10.5px] font-semibold leading-tight sm:text-xs", i <= stepIndex ? "text-ink" : "text-muted")}>{ORDER_STATUS_LABELS[s]}</span>
              </li>
            ))}
          </ol>
        )}
        {role === "client" && (status === "NEW" || status === "PENDING") && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-cream p-3 text-sm">
            <Hourglass className="h-5 w-5 shrink-0 animate-pulse text-brand-500" />
            Usta javobini kutilmoqda. Odatda 15–30 daqiqa ichida javob beriladi.
          </div>
        )}
      </section>

      {/* Ikkinchi tomon */}
      <section className="card mb-4 flex items-center gap-3.5 p-4">
        <Avatar src={other.avatar} name={other.name} size={56} />
        <div className="min-w-0 flex-1">
          {other.href ? (
            <Link href={other.href} className="block truncate font-bold hover:text-brand-600">
              {other.name}
            </Link>
          ) : (
            <p className="truncate font-bold">{other.name}</p>
          )}
          <p className="truncate text-sm text-muted">{other.sub}</p>
          {role === "client" && <Rating value={order.master.rating} count={order.master.reviewCount} className="text-xs" />}
        </div>
        {status !== "CANCELLED" && other.phone && (
          <a href={`tel:${other.phone}`} aria-label={`Qo‘ng‘iroq: ${fmtPhone(other.phone)}`} className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-soft)] ring-1 ring-line">
            <Phone className="h-5 w-5" />
          </a>
        )}
      </section>

      {/* Xizmatlar */}
      <section className="mb-4">
        <h2 className="section-title mb-3">Xizmatlar</h2>
        <div className="card divide-y divide-line">
          {order.items.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 p-4">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{i.title}</span>
                <span className="text-sm text-muted">
                  {i.quantity} × {money(i.price)}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-bold">{money(i.price * i.quantity)}</span>
                {canEditItems && <RemoveItemButton orderId={order.id} itemId={i.id} />}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between p-4">
            <span className="font-semibold">Jami</span>
            <span className="text-xl font-extrabold text-brand-600">{money(order.totalAmount)}</span>
          </div>
        </div>
      </section>

      {/* Tafsilotlar */}
      <section className="mb-4">
        <h2 className="section-title mb-3">Tafsilotlar</h2>
        <div className="card space-y-3 p-4 text-[15px]">
          <p className="flex gap-2.5">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" /> {dateLong(order.scheduledAt)}, {time(order.scheduledAt)}
          </p>
          <p className="flex gap-2.5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" /> {order.region}, {order.district}, {order.address}
          </p>
          <p className="flex gap-2.5">
            <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            {PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod]} ·{" "}
            <Badge tone={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "REFUNDED" ? "info" : "warn"}>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Badge>
          </p>
          <div className="rounded-2xl bg-cream p-3.5">
            <p className="mb-1 text-sm font-semibold text-muted">Muammo tavsifi</p>
            <p className="whitespace-pre-line text-ink-2">{order.description}</p>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {images.map((src) => (
                <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="relative h-24 w-24 overflow-hidden rounded-2xl bg-cream-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Buyurtma rasmi" className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Amallar */}
      <section className="mb-4">
        <OrderActions orderId={order.id} role={role} status={status} paymentStatus={order.paymentStatus} paymentMethod={order.paymentMethod} hasReview={!!order.review} />
      </section>

      {order.review && (
        <section className="card mb-4 p-4">
          <p className="mb-1 font-bold">Sharh</p>
          <Stars value={order.review.rating} />
          <p className="mt-1.5 text-ink-2">{order.review.comment}</p>
        </section>
      )}

      {/* Tarix */}
      <section className="mb-4">
        <h2 className="section-title mb-3">Holatlar tarixi</h2>
        <ol className="card relative space-y-4 p-5">
          {order.events.map((e, i) => (
            <li key={e.id} className="relative flex gap-3">
              <span className={cn("relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-4", i === order.events.length - 1 ? "bg-brand-500 ring-brand-100" : "bg-line ring-cream")} />
              {i < order.events.length - 1 && <span className="absolute left-[5px] top-4 h-[calc(100%+0.5rem)] w-0.5 bg-line" />}
              <span>
                <span className="block font-semibold">{e.note ?? ORDER_STATUS_LABELS[e.status as OrderStatus]}</span>
                <span className="text-sm text-muted">{dateTime(e.createdAt)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {order.payments.length > 0 && (
        <section className="mb-4">
          <h2 className="section-title mb-3">To‘lovlar</h2>
          <div className="card divide-y divide-line">
            {order.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                <span>
                  <span className="block font-semibold">{PAYMENT_METHOD_LABELS[p.provider as PaymentMethod]} {p.cardMask && `· ${p.cardMask}`}</span>
                  <span className="text-muted">{dateTime(p.createdAt)} {p.transactionId && `· ${p.transactionId}`}</span>
                </span>
                <span className="text-right">
                  <span className="block font-bold">{money(p.amount)}</span>
                  <Badge tone={p.status === "SUCCESS" ? "success" : p.status === "PENDING" ? "warn" : "neutral"}>
                    {{ SUCCESS: "Muvaffaqiyatli", PENDING: "Kutilmoqda", FAILED: "Xato", CANCELLED: "Bekor qilingan" }[p.status] ?? p.status}
                  </Badge>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {role !== "admin" && (
        <div className="py-2 text-center">
          <ComplaintButton orderId={order.id} targetUserId={other.userId} label="Muammo bo‘ldimi? Shikoyat qilish" />
        </div>
      )}
    </div>
  );
}
