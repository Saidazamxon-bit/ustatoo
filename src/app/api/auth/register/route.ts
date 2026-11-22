import { db } from "@/server/db";
import { route, ok, readJson, conflict, badRequest } from "@/server/errors";
import { registerSchema } from "@/lib/validators";
import { createSession, hashPassword } from "@/server/auth";
import { clientIp, rateLimit } from "@/server/rate-limit";
import { isValidLocation, locate } from "@/lib/regions";
import { getSettings } from "@/server/settings";
import { refreshMasterIndex } from "@/server/services/masters";
import { notify } from "@/server/notify";

export const POST = route(async (req) => {
  rateLimit(`register:${clientIp(req)}`, 10, 60 * 60_000);
  const input = registerSchema.parse(await readJson(req));
  if (!isValidLocation(input.region, input.district)) throw badRequest("Hudud yoki tuman noto‘g‘ri", { district: "Tumanni tanlang" });
  if (await db.user.findUnique({ where: { phone: input.phone } })) {
    throw conflict("Bu telefon raqam bilan ro‘yxatdan o‘tilgan");
  }
  if (input.role === "MASTER") {
    const settings = await getSettings();
    if (settings.allowMasterSignup !== "true") throw badRequest("Hozircha yangi ustalar ro‘yxatdan o‘tkazilmayapti");
    const cat = await db.category.findFirst({ where: { id: input.categoryId, isActive: true } });
    if (!cat) throw badRequest("Kategoriya topilmadi", { categoryId: "Kategoriyani tanlang" });
  }
  const user = await db.user.create({
    data: {
      name: input.name,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      region: input.region,
      district: input.district,
      ...(input.role === "MASTER"
        ? {
            master: {
              create: {
                categoryId: input.categoryId!,
                specialty: input.specialty!,
                region: input.region,
                district: input.district,
                ...locate(input.region, input.district),
                publicPhone: input.phone,
              },
            },
          }
        : {}),
    },
    include: { master: { select: { id: true } } },
  });
  if (user.master) await refreshMasterIndex(user.master.id);
  await notify({
    userId: user.id,
    type: "SYSTEM",
    title: "UstaTop’ga xush kelibsiz!",
    body: user.role === "MASTER" ? "Profilingizni to‘ldiring, xizmatlar qo‘shing va tasdiqlash uchun ariza yuboring." : "Kerakli ustani toping va bir necha daqiqada buyurtma bering.",
    link: user.role === "MASTER" ? "/usta/profil" : "/",
  });
  await createSession(user);
  return ok({ id: user.id, role: user.role }, { status: 201 });
});
