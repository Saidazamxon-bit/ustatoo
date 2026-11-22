import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { requirePageUser } from "@/server/auth";
import { DemoCheckout } from "./demo-checkout";

export const metadata: Metadata = { title: "Demo to‘lov", robots: { index: false } };

export default async function DemoCheckoutPage({ params }: { params: Promise<{ orderId: string; paymentId: string }> }) {
  const { orderId, paymentId } = await params;
  const user = await requirePageUser(`/tolov/${orderId}/demo/${paymentId}`);
  const payment = await db.payment.findUnique({ where: { id: paymentId }, include: { order: { select: { id: true, code: true, clientId: true } } } });
  if (!payment || payment.orderId !== orderId || payment.order.clientId !== user.id || payment.mode !== "demo") notFound();
  return (
    <DemoCheckout
      payment={{ id: payment.id, provider: payment.provider, amount: payment.amount, status: payment.status }}
      order={{ id: payment.order.id, code: payment.order.code }}
      phone={user.phone}
    />
  );
}
