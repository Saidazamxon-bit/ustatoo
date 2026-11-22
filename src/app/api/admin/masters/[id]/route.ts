import { db } from "@/server/db";
import { route, ok, readJson, notFound } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { verificationDecisionSchema } from "@/lib/validators";
import { notify } from "@/server/notify";

export const POST = route<{ id: string }>(async (req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const { decision, note } = verificationDecisionSchema.parse(await readJson(req));
  const m = await db.masterProfile.findUnique({ where: { id } });
  if (!m) throw notFound("Usta topilmadi");
  await db.masterProfile.update({ where: { id }, data: { verification: decision, verificationNote: note ?? null } });
  await notify({
    userId: m.userId,
    type: "SYSTEM",
    title: decision === "APPROVED" ? "Profilingiz tasdiqlandi ✓" : "Tasdiqlash arizasi rad etildi",
    body: decision === "APPROVED" ? "Endi profilingizda “Tasdiqlangan usta” belgisi ko‘rinadi." : note || "Profilingizni to‘ldirib, qayta ariza yuboring.",
    link: "/usta/profil",
  });
  return ok({ success: true });
});
