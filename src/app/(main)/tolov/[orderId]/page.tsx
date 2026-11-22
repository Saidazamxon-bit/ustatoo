import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/server/auth";
import { getOrderForUser } from "@/server/services/orders";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { PaymentView } from "./payment-view";

export const metadata: Metadata = { title: "To‘lov", robots: { index: false } };

export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await requirePageUser(`/tolov/${orderId}`);
  let data;
  try {
    data = await getOrderForUser(user, orderId);
  } catch (e) {
    if (e instanceof HttpError) notFound();
    throw e;
  }
  const { order, role } = data;
  if (role !== "client") notFound();
  const settings = await getSettings();
  return (
    <PaymentView
      demo={settings.paymentsDemo === "true" || process.env.PAYMENTS_MODE !== "live"}
      order={{
        id: order.id,
        code: order.code,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        items: order.items.map((i) => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity, serviceId: i.serviceId })),
      }}
      master={{
        id: order.master.id,
        name: order.master.user.name,
        avatar: order.master.user.avatar,
        cover: order.master.coverImage,
        specialty: order.master.specialty,
        rating: order.master.rating,
        reviewCount: order.master.reviewCount,
      }}
    />
  );
}
