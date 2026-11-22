import { z } from "zod";
import { db } from "@/server/db";
import { route, ok, readJson } from "@/server/errors";
import { requireMaster } from "@/server/auth";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Vaqt formati HH:MM");
const schema = z
  .object({
    workDays: z.array(z.number().int().min(1).max(7)).min(1, "Kamida bitta ish kunini tanlang"),
    workStart: time,
    workEnd: time,
  })
  .refine((v) => v.workStart < v.workEnd, { path: ["workEnd"], message: "Tugash vaqti boshlanishdan keyin bo‘lsin" });

export const PATCH = route(async (req) => {
  const { masterId } = await requireMaster();
  const input = schema.parse(await readJson(req));
  await db.masterProfile.update({
    where: { id: masterId },
    data: { workStart: input.workStart, workEnd: input.workEnd, workDays: [...new Set(input.workDays)].sort().join(",") },
  });
  return ok({ success: true });
});
