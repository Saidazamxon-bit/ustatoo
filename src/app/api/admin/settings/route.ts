import { z } from "zod";
import { db } from "@/server/db";
import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { getSettings } from "@/server/settings";

const schema = z.object({
  platformName: z.string().trim().min(2).max(40),
  commissionPercent: z.coerce.number().min(0).max(50).transform(String),
  supportPhone: z.string().trim().min(5).max(30),
  supportEmail: z.string().trim().email("Email noto‘g‘ri"),
  allowMasterSignup: z.boolean().transform(String),
  paymentsDemo: z.boolean().transform(String),
  maintenanceMessage: z.string().trim().max(200),
});

export const GET = route(async () => {
  await requireUser(["ADMIN"]);
  return ok(await getSettings());
});

export const PUT = route(async (req) => {
  await requireUser(["ADMIN"]);
  const input = schema.parse(await readJson(req));
  await db.$transaction(
    Object.entries(input).map(([key, value]) => db.setting.upsert({ where: { key }, update: { value }, create: { key, value } })),
  );
  return ok(await getSettings());
});
