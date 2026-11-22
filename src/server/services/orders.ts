import "server-only";
import type { z } from "zod";
import { db } from "../db";
import { badRequest, conflict, forbidden, notFound } from "../errors";
import { notify } from "../notify";
import { publish } from "../events";
import type { CurrentUser } from "../auth";
import { isValidLocation } from "@/lib/regions";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import type { orderActionSchema, orderCreateSchema } from "@/lib/validators";
import { money } from "@/lib/format";

type CreateInput = z.output<typeof orderCreateSchema>;
type Action = z.output<typeof orderActionSchema>["action"];

function genCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `UT-${s}`;
}

export async function createOrder(user: CurrentUser, input: CreateInput) {
  const master = await db.masterProfile.findFirst({
    where: { id: input.masterId, user: { status: "ACTIVE" } },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!master) throw notFound("Usta topilmadi");
  if (master.userId === user.id) throw badRequest("O‘zingizga buyurtma bera olmaysiz");
  if (!isValidLocation(input.region, input.district)) throw badRequest("Hudud yoki tuman noto‘g‘ri", { district: "Tumanni tanlang" });

  const now = Date.now();
  const when = input.scheduledAt.getTime();
  if (when < now + 30 * 60_000) throw badRequest("Vaqt kamida 30 daqiqadan keyin bo‘lishi kerak", { scheduledAt: "Kelajakdagi vaqtni tanlang" });
  if (when > now + 60 * 86_400_000) throw badRequest("Ko‘pi bilan 60 kun oldinga buyurtma berish mumkin");

  const serviceIds = [...new Set(input.items.map((i) => i.serviceId))];
  const services = await db.service.findMany({ where: { id: { in: serviceIds }, masterId: master.id, isActive: true } });
  if (services.length !== serviceIds.length) throw badRequest("Tanlangan xizmatlardan biri mavjud emas");

  const items = input.items.map((i) => {
    const s = services.find((x) => x.id === i.serviceId)!;
    return { serviceId: s.id, title: s.title, price: s.price, quantity: i.quantity };
  });
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let code = genCode();
  for (let i = 0; i < 5 && (await db.order.findUnique({ where: { code } })); i++) code = genCode();

  const order = await db.order.create({
    data: {
      code,
      clientId: user.id,
      masterId: master.id,
      status: "NEW",
      description: input.description,
      images: JSON.stringify(input.images),
      region: input.region,
      district: input.district,
      address: input.address,
      scheduledAt: input.scheduledAt,
      totalAmount,
      paymentMethod: input.paymentMethod,
      items: { create: items },
      events: { create: { status: "NEW", actorId: user.id, note: "Buyurtma yaratildi" } },
      conversation: { create: { clientId: user.id, masterId: master.id } },
    },
  });

  await db.masterProfile.update({ where: { id: master.id }, data: { popularity: { increment: 3 } } });
  await notify({
    userId: master.userId,
    type: "ORDER",
    title: "Yangi buyurtma",
    body: `${user.name} sizga ${money(totalAmount)} lik buyurtma yubordi (${order.code}).`,
    link: `/buyurtmalar/${order.id}`,
  });
  publish(master.userId, { type: "order", orderId: order.id, status: order.status });
  return order;
}

export const orderDetailInclude = {
  items: true,
  events: { orderBy: { createdAt: "asc" as const } },
  payments: { orderBy: { createdAt: "desc" as const } },
  review: true,
  conversation: { select: { id: true } },
  client: { select: { id: true, name: true, avatar: true, phone: true } },
  master: {
    select: {
      id: true,
      userId: true,
      specialty: true,
      rating: true,
      reviewCount: true,
      coverImage: true,
      publicPhone: true,
      verification: true,
      user: { select: { name: true, avatar: true, phone: true } },
    },
  },
};

/** Buyurtmani ko‘rish huquqini tekshiradi va rolni qaytaradi */
export async function getOrderForUser(user: CurrentUser, orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: orderDetailInclude });
  if (!order) throw notFound("Buyurtma topilmadi");
  const isClient = order.clientId === user.id;
  const isMaster = order.master.userId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isClient && !isMaster && !isAdmin) throw forbidden();
  return { order, role: isMaster ? ("master" as const) : isClient ? ("client" as const) : ("admin" as const) };
}

/** Usta buyurtmani birinchi marta ochganda "Yangi" -> "Kutilmoqda" */
export async function markViewedByMaster(orderId: string, masterUserId: string, clientId: string) {
  const res = await db.order.updateMany({ where: { id: orderId, status: "NEW" }, data: { status: "PENDING" } });
  if (res.count) {
    await db.orderEvent.create({ data: { orderId, status: "PENDING", actorId: masterUserId, note: "Usta buyurtmani ko‘rib chiqmoqda" } });
    publish(clientId, { type: "order", orderId, status: "PENDING" });
  }
}

const RULES: Record<Action, { by: Array<"client" | "master" | "admin">; from: OrderStatus[]; to?: OrderStatus }> = {
  accept: { by: ["master"], from: ["NEW", "PENDING"], to: "ACCEPTED" },
  decline: { by: ["master"], from: ["NEW", "PENDING"], to: "CANCELLED" },
  start: { by: ["master"], from: ["ACCEPTED"], to: "IN_PROGRESS" },
  complete: { by: ["master"], from: ["IN_PROGRESS"], to: "COMPLETED" },
  cancel: { by: ["client", "admin"], from: ["NEW", "PENDING", "ACCEPTED"], to: "CANCELLED" },
  cash_received: { by: ["master"], from: ["IN_PROGRESS", "COMPLETED"] },
};

const NOTE: Record<Action, string> = {
  accept: "Usta buyurtmani qabul qildi",
  decline: "Usta buyurtmani rad etdi",
  start: "Usta ishni boshladi",
  complete: "Ish yakunlandi",
  cancel: "Buyurtma bekor qilindi",
  cash_received: "Naqd to‘lov qabul qilindi",
};

export async function applyOrderAction(user: CurrentUser, orderId: string, action: Action, reason?: string) {
  const { order, role } = await getOrderForUser(user, orderId);
  const rule = RULES[action];
  if (!rule.by.includes(role)) throw forbidden("Bu amalni bajarishga ruxsatingiz yo‘q");
  if (!rule.from.includes(order.status as OrderStatus)) {
    throw conflict(`Buyurtma holati "${ORDER_STATUS_LABELS[order.status as OrderStatus]}" — bu amal mumkin emas`);
  }
  if ((action === "decline" || action === "cancel") && !reason) throw badRequest("Sababni yozing", { reason: "Sababni yozing" });

  if (action === "cash_received") {
    if (order.paymentStatus === "PAID") throw conflict("Buyurtma allaqachon to‘langan");
    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", paymentMethod: "CASH" } }),
      db.payment.create({ data: { orderId: order.id, provider: "CASH", amount: order.totalAmount, status: "SUCCESS", mode: "cash" } }),
      db.orderEvent.create({ data: { orderId: order.id, status: order.status, actorId: user.id, note: NOTE[action] } }),
    ]);
  } else {
    const to = rule.to!;
    const data: Record<string, unknown> = { status: to };
    if (to === "CANCELLED") {
      data.cancelReason = reason;
      data.cancelledBy = role === "master" ? "MASTER" : role === "admin" ? "ADMIN" : "CLIENT";
      if (order.paymentStatus === "PAID") data.paymentStatus = "REFUNDED";
    }
    if (to === "COMPLETED") data.completedAt = new Date();
    // Optimistik bloklash: holat orada o‘zgarmagan bo‘lsagina yangilanadi
    const res = await db.order.updateMany({ where: { id: order.id, status: order.status }, data });
    if (!res.count) throw conflict("Buyurtma holati o‘zgargan. Sahifani yangilang.");
    await db.orderEvent.create({
      data: { orderId: order.id, status: to, actorId: user.id, note: reason ? `${NOTE[action]}: ${reason}` : NOTE[action] },
    });
    if (to === "COMPLETED") {
      await db.masterProfile.update({ where: { id: order.masterId }, data: { completedJobs: { increment: 1 }, popularity: { increment: 5 } } });
    }
    if (order.paymentStatus === "PAID" && to === "CANCELLED") {
      await db.payment.updateMany({ where: { orderId: order.id, status: "SUCCESS" }, data: { status: "CANCELLED" } });
    }
  }

  const statusText = action === "cash_received" ? "To‘lov qabul qilindi" : ORDER_STATUS_LABELS[RULES[action].to!];
  const targets = [order.clientId, order.master.userId].filter((id) => id !== user.id);
  for (const t of targets) {
    await notify({
      userId: t,
      type: "ORDER",
      title: `${order.code}: ${statusText}`,
      body: reason ? `${NOTE[action]}. Sabab: ${reason}` : `${NOTE[action]}.`,
      link: `/buyurtmalar/${order.id}`,
    });
  }
  for (const id of [order.clientId, order.master.userId]) publish(id, { type: "order", orderId: order.id, status: rule.to ?? order.status });
}

/** Mijoz to‘lovdan oldin buyurtmadan xizmatni olib tashlashi */
export async function removeOrderItem(user: CurrentUser, orderId: string, itemId: string) {
  const { order, role } = await getOrderForUser(user, orderId);
  if (role !== "client") throw forbidden();
  if (!["NEW", "PENDING"].includes(order.status)) throw conflict("Usta qabul qilgan buyurtmani o‘zgartirib bo‘lmaydi");
  if (order.paymentStatus === "PAID" || order.paymentStatus === "PENDING") throw conflict("To‘lov boshlangan buyurtmani o‘zgartirib bo‘lmaydi");
  if (order.items.length <= 1) throw badRequest("Buyurtmada kamida bitta xizmat qolishi kerak");
  const item = order.items.find((i) => i.id === itemId);
  if (!item) throw notFound("Xizmat topilmadi");
  const total = order.totalAmount - item.price * item.quantity;
  await db.$transaction([
    db.orderItem.delete({ where: { id: itemId } }),
    db.order.update({ where: { id: orderId }, data: { totalAmount: total } }),
    db.orderEvent.create({ data: { orderId, status: order.status, actorId: user.id, note: `"${item.title}" xizmati olib tashlandi` } }),
  ]);
  publish(order.master.userId, { type: "order", orderId, status: order.status });
}

export async function listOrders(user: CurrentUser, scope: "client" | "master", tab: "active" | "history" | "all" = "all") {
  const statusFilter =
    tab === "active"
      ? { in: ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS"] }
      : tab === "history"
        ? { in: ["COMPLETED", "CANCELLED"] }
        : undefined;
  return db.order.findMany({
    where: {
      ...(scope === "client" ? { clientId: user.id } : { master: { userId: user.id } }),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
    include: {
      items: { select: { title: true, quantity: true } },
      client: { select: { name: true, avatar: true } },
      master: { select: { id: true, specialty: true, coverImage: true, user: { select: { name: true, avatar: true } } } },
    },
  });
}

export type OrderListItem = Awaited<ReturnType<typeof listOrders>>[number];
