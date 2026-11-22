import "server-only";
import { db } from "../db";
import { conflict, forbidden, notFound } from "../errors";
import { notify } from "../notify";
import type { CurrentUser } from "../auth";
import { recomputeRating } from "./masters";

export async function createReview(user: CurrentUser, orderId: string, rating: number, comment: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { review: true, master: { select: { userId: true } } } });
  if (!order) throw notFound("Buyurtma topilmadi");
  if (order.clientId !== user.id) throw forbidden();
  if (order.status !== "COMPLETED") throw conflict("Sharhni faqat yakunlangan buyurtma uchun qoldirish mumkin");
  if (order.review) throw conflict("Bu buyurtma uchun sharh allaqachon qoldirilgan");

  const review = await db.review.create({ data: { orderId, masterId: order.masterId, clientId: user.id, rating, comment } });
  await recomputeRating(order.masterId);
  await db.masterProfile.update({ where: { id: order.masterId }, data: { popularity: { increment: rating } } });
  await notify({
    userId: order.master.userId,
    type: "REVIEW",
    title: `Yangi sharh: ${"★".repeat(rating)}`,
    body: `${user.name}: ${comment.slice(0, 80)}`,
    link: "/usta/sharhlar",
  });
  return review;
}

export async function replyToReview(user: CurrentUser, reviewId: string, reply: string) {
  const review = await db.review.findUnique({ where: { id: reviewId }, include: { master: { select: { userId: true } } } });
  if (!review) throw notFound("Sharh topilmadi");
  if (review.master.userId !== user.id) throw forbidden();
  await db.review.update({ where: { id: reviewId }, data: { reply } });
  await notify({
    userId: review.clientId,
    type: "REVIEW",
    title: "Usta sharhingizga javob berdi",
    body: reply.slice(0, 80),
    link: `/ustalar/${review.masterId}#sharhlar`,
  });
}
