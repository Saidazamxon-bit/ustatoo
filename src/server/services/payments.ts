import "server-only";
import { db } from "../db";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import { notify } from "../notify";
import { publish } from "../events";
import type { CurrentUser } from "../auth";
import { getProvider, DEMO_SMS_CODE } from "../payments";
import { getSettings } from "../settings";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";
import { money } from "@/lib/format";
import { siteUrl } from "@/lib/utils";

export async function startPayment(user: CurrentUser, orderId: string, method: PaymentMethod) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { master: { select: { userId: true } } } });
  if (!order) throw notFound("Buyurtma topilmadi");
  if (order.clientId !== user.id) throw forbidden();
  if (order.status === "CANCELLED") throw conflict("Bekor qilingan buyurtmani to‘lab bo‘lmaydi");
  if (order.paymentStatus === "PAID") throw conflict("Buyurtma allaqachon to‘langan");

  if (method === "CASH") {
    await db.$transaction([
      db.payment.updateMany({ where: { orderId, status: "PENDING" }, data: { status: "CANCELLED" } }),
      db.order.update({ where: { id: orderId }, data: { paymentMethod: "CASH", paymentStatus: "UNPAID" } }),
    ]);
    publish(order.master.userId, { type: "order", orderId, status: order.status });
    return { redirectUrl: `/buyurtmalar/${orderId}?tolov=naqd` };
  }

  const settings = await getSettings();
  const provider = getProvider(method, settings.paymentsDemo === "true");
  const payment = await db.$transaction(async (tx) => {
    await tx.payment.updateMany({ where: { orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
    await tx.order.update({ where: { id: orderId }, data: { paymentMethod: method, paymentStatus: "PENDING" } });
    return tx.payment.create({ data: { orderId, provider: method, amount: order.totalAmount, mode: provider.mode } });
  });
  const { redirectUrl } = await provider.createCheckout({
    paymentId: payment.id,
    orderId,
    orderCode: order.code,
    amount: order.totalAmount,
    returnUrl: siteUrl(`/buyurtmalar/${orderId}`),
  });
  return { redirectUrl, paymentId: payment.id };
}

async function loadDemoPayment(user: CurrentUser, paymentId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { master: { select: { userId: true } } } } },
  });
  if (!payment) throw notFound("To‘lov topilmadi");
  if (payment.order.clientId !== user.id) throw forbidden();
  if (payment.mode !== "demo") throw badRequest("Bu to‘lov demo rejimda emas");
  if (payment.status !== "PENDING") throw conflict("To‘lov allaqachon yakunlangan");
  return payment;
}

/** Demo to‘lovni tasdiqlash: haqiqiy provayderdagi SMS-tasdiqlashni simulyatsiya qiladi */
export async function confirmDemoPayment(user: CurrentUser, paymentId: string, account: string, code: string) {
  const payment = await loadDemoPayment(user, paymentId);
  if (code !== DEMO_SMS_CODE) throw badRequest("SMS kod noto‘g‘ri", { code: "Kod noto‘g‘ri. Demo kod: 123456" });

  const digits = account.replace(/\D/g, "");
  const mask = digits.length >= 16 ? `${digits.slice(0, 4)} **** **** ${digits.slice(-4)}` : `+998 ** *** ${digits.slice(-4, -2)} ${digits.slice(-2)}`;
  const tx = `DEMO-${Date.now().toString(36).toUpperCase()}`;

  await db.$transaction([
    db.payment.update({ where: { id: paymentId }, data: { status: "SUCCESS", transactionId: tx, cardMask: mask } }),
    db.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "PAID" } }),
    db.orderEvent.create({
      data: {
        orderId: payment.orderId,
        status: payment.order.status,
        actorId: user.id,
        note: `${PAYMENT_METHOD_LABELS[payment.provider as PaymentMethod]} orqali ${money(payment.amount)} to‘landi`,
      },
    }),
  ]);

  await notify({
    userId: payment.order.master.userId,
    type: "PAYMENT",
    title: "To‘lov qabul qilindi",
    body: `${payment.order.code} buyurtmasi uchun ${money(payment.amount)} to‘landi.`,
    link: `/buyurtmalar/${payment.orderId}`,
  });
  await notify({
    userId: user.id,
    type: "PAYMENT",
    title: "To‘lov muvaffaqiyatli",
    body: `${payment.order.code} uchun ${money(payment.amount)} to‘lovingiz qabul qilindi.`,
    link: `/buyurtmalar/${payment.orderId}`,
  });
  for (const id of [user.id, payment.order.master.userId]) publish(id, { type: "order", orderId: payment.orderId, status: payment.order.status });
  return { orderId: payment.orderId, transactionId: tx };
}

export async function cancelDemoPayment(user: CurrentUser, paymentId: string) {
  const payment = await loadDemoPayment(user, paymentId);
  await db.$transaction([
    db.payment.update({ where: { id: paymentId }, data: { status: "CANCELLED" } }),
    db.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "UNPAID" } }),
  ]);
  return { orderId: payment.orderId };
}
