import "server-only";
import { db } from "./db";
import { publish } from "./events";

type NotifyInput = {
  userId: string;
  type: "ORDER" | "MESSAGE" | "REVIEW" | "SYSTEM" | "PAYMENT";
  title: string;
  body: string;
  link?: string;
};

/** Bildirishnoma yaratadi va foydalanuvchiga real vaqtda yuboradi. */
export async function notify(input: NotifyInput) {
  const user = await db.user.findUnique({
    where: { id: input.userId },
    select: { notifyOrders: true, notifyMessages: true },
  });
  if (!user) return;
  // Foydalanuvchi sozlamalariga rioya qilamiz (tizim xabarlari doim yuboriladi)
  if ((input.type === "ORDER" || input.type === "PAYMENT") && !user.notifyOrders) return;
  if (input.type === "MESSAGE" && !user.notifyMessages) return;

  const n = await db.notification.create({
    data: { userId: input.userId, type: input.type, title: input.title, body: input.body, link: input.link },
  });
  publish(input.userId, {
    type: "notification",
    notification: { id: n.id, title: n.title, body: n.body, link: n.link, type: n.type },
  });
}
