import { z } from "zod";
import { db } from "@/server/db";
import { route, ok, readJson, badRequest } from "@/server/errors";
import { requireMaster } from "@/server/auth";
import { masterProfileSchema } from "@/lib/validators";
import { isValidLocation, locate } from "@/lib/regions";
import { refreshMasterIndex } from "@/server/services/masters";
import { isAllowedImageUrl } from "@/lib/utils";

export const PATCH = route(async (req) => {
  const { masterId, user } = await requireMaster();
  const body = (await readJson(req)) as Record<string, unknown>;
  const input = masterProfileSchema.parse(body);
  const avatar = z.string().nullable().optional().parse(body.avatar);
  if (!isValidLocation(input.region, input.district)) throw badRequest("Hudud yoki tuman noto‘g‘ri", { district: "Tumanni tanlang" });
  const cat = await db.category.findUnique({ where: { id: input.categoryId } });
  if (!cat) throw badRequest("Kategoriya topilmadi", { categoryId: "Kategoriyani tanlang" });
  const { workDays, telegram, ...rest } = input;
  await db.masterProfile.update({
    where: { id: masterId },
    data: {
      ...rest,
      workDays: [...new Set(workDays)].sort().join(","),
      telegram: telegram ? telegram.replace(/^@/, "") : null,
      ...locate(input.region, input.district),
    },
  });
  if (avatar !== undefined && (avatar === null || isAllowedImageUrl(avatar))) {
    await db.user.update({ where: { id: user.id }, data: { avatar } });
  }
  await refreshMasterIndex(masterId);
  return ok({ success: true });
});

/** Faqat "Hozir ishlayapman" holatini tez almashtirish */
export const POST = route(async (req) => {
  const { masterId } = await requireMaster();
  const { isAvailable } = z.object({ isAvailable: z.boolean() }).parse(await readJson(req));
  await db.masterProfile.update({ where: { id: masterId }, data: { isAvailable } });
  return ok({ isAvailable });
});
