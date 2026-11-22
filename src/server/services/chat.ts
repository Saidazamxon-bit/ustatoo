import "server-only";
import { db } from "../db";
import { badRequest, forbidden, notFound } from "../errors";
import { publish } from "../events";
import { notify } from "../notify";
import type { CurrentUser } from "../auth";
import { truncate } from "@/lib/text";

const convInclude = {
  client: { select: { id: true, name: true, avatar: true, lastSeenAt: true } },
  master: { select: { id: true, userId: true, specialty: true, user: { select: { id: true, name: true, avatar: true, lastSeenAt: true } } } },
  order: { select: { id: true, code: true, status: true } },
};

function sideOf(user: CurrentUser, conv: { clientId: string; master: { userId: string } }) {
  if (conv.clientId === user.id) return "client" as const;
  if (conv.master.userId === user.id) return "master" as const;
  return null;
}

/** Foydalanuvchining barcha suhbatlari (mijoz va usta sifatida) */
export async function listConversations(user: CurrentUser) {
  const convs = await db.conversation.findMany({
    where: { OR: [{ clientId: user.id }, { master: { userId: user.id } }] },
    orderBy: { lastMessageAt: "desc" },
    include: {
      ...convInclude,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 100,
  });
  const unread = await db.message.groupBy({
    by: ["conversationId"],
    where: { conversationId: { in: convs.map((c) => c.id) }, senderId: { not: user.id }, readAt: null },
    _count: { _all: true },
  });
  const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count._all]));
  return convs.map((c) => {
    const side = sideOf(user, c)!;
    const other = side === "client" ? { ...c.master.user, subtitle: c.master.specialty, masterId: c.master.id } : { ...c.client, subtitle: "Mijoz", masterId: null };
    const last = c.messages[0];
    return {
      id: c.id,
      other,
      order: c.order,
      lastMessage: last ? { text: last.text ? truncate(last.text, 60) : "📷 Rasm", createdAt: last.createdAt, mine: last.senderId === user.id, read: !!last.readAt } : null,
      lastMessageAt: c.lastMessageAt,
      unread: unreadMap.get(c.id) ?? 0,
    };
  });
}

export type ConversationListItem = Awaited<ReturnType<typeof listConversations>>[number];

export async function getConversation(user: CurrentUser, id: string) {
  const conv = await db.conversation.findUnique({ where: { id }, include: convInclude });
  if (!conv) throw notFound("Suhbat topilmadi");
  const side = sideOf(user, conv);
  if (!side) throw forbidden();
  const other =
    side === "client"
      ? { id: conv.master.user.id, name: conv.master.user.name, avatar: conv.master.user.avatar, subtitle: conv.master.specialty, masterId: conv.master.id, lastSeenAt: conv.master.user.lastSeenAt }
      : { id: conv.client.id, name: conv.client.name, avatar: conv.client.avatar, subtitle: "Mijoz", masterId: null, lastSeenAt: conv.client.lastSeenAt };
  return { conv, side, other };
}

export async function getMessages(user: CurrentUser, conversationId: string, before?: string) {
  const { other } = await getConversation(user, conversationId);
  const messages = await db.message.findMany({
    where: { conversationId, ...(before ? { createdAt: { lt: new Date(before) } } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  await markRead(user, conversationId, other.id);
  return messages.reverse();
}

export async function markRead(user: CurrentUser, conversationId: string, otherUserId: string) {
  const res = await db.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });
  if (res.count) await publish(otherUserId, { type: "message_read", conversationId, readerId: user.id });
}

export async function sendMessage(user: CurrentUser, conversationId: string, input: { text?: string; image?: string }) {
  const { other } = await getConversation(user, conversationId);
  const text = input.text?.trim() || null;
  if (!text && !input.image) throw badRequest("Xabar bo‘sh");
  const prevUnread = await db.message.count({ where: { conversationId, senderId: user.id, readAt: null } });
  const message = await db.message.create({ data: { conversationId, senderId: user.id, text, image: input.image ?? null } });
  await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: message.createdAt } });
  await publish(other.id, { type: "message", conversationId, message });
  await publish(user.id, { type: "message", conversationId, message });
  // Har bir xabar uchun emas, faqat yangi o‘qilmagan "to‘lqin" boshlanganda bildirishnoma
  if (prevUnread === 0) {
    await notify({
      userId: other.id,
      type: "MESSAGE",
      title: `${user.name} xabar yubordi`,
      body: text ? truncate(text, 80) : "📷 Rasm yubordi",
      link: `/xabarlar/${conversationId}`,
    });
  }
  return message;
}

/** Usta profilidan yoki buyurtmadan suhbatni ochish */
export async function openConversation(user: CurrentUser, opts: { masterId?: string; orderId?: string }) {
  if (opts.orderId) {
    const order = await db.order.findUnique({ where: { id: opts.orderId }, include: { master: { select: { userId: true } }, conversation: true } });
    if (!order) throw notFound("Buyurtma topilmadi");
    if (order.clientId !== user.id && order.master.userId !== user.id) throw forbidden();
    if (order.conversation) return order.conversation;
    return db.conversation.create({ data: { clientId: order.clientId, masterId: order.masterId, orderId: order.id } });
  }
  if (!opts.masterId) throw badRequest("Usta ko‘rsatilmagan");
  const master = await db.masterProfile.findUnique({ where: { id: opts.masterId }, select: { id: true, userId: true } });
  if (!master) throw notFound("Usta topilmadi");
  if (master.userId === user.id) throw badRequest("O‘zingizga xabar yoza olmaysiz");
  const existing = await db.conversation.findFirst({
    where: { clientId: user.id, masterId: master.id, orderId: null },
  });
  return existing ?? db.conversation.create({ data: { clientId: user.id, masterId: master.id } });
}

export async function unreadMessagesCount(userId: string) {
  return db.message.count({
    where: {
      senderId: { not: userId },
      readAt: null,
      conversation: { OR: [{ clientId: userId }, { master: { userId } }] },
    },
  });
}
