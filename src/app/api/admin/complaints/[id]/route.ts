import { db } from "@/server/db";
import { route, ok, readJson, notFound } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { complaintDecisionSchema } from "@/lib/validators";
import { notify } from "@/server/notify";

export const PATCH = route<{ id: string }>(async (req, { params }) => {
  await requireUser(["ADMIN"]);
  const { id } = await params;
  const input = complaintDecisionSchema.parse(await readJson(req));
  const c = await db.complaint.findUnique({ where: { id } });
  if (!c) throw notFound("Shikoyat topilmadi");
  await db.complaint.update({ where: { id }, data: input });
  await notify({
    userId: c.reporterId,
    type: "SYSTEM",
    title: input.status === "RESOLVED" ? "Shikoyatingiz hal qilindi" : "Shikoyatingiz ko‘rib chiqildi",
    body: input.adminNote || (input.status === "RESOLVED" ? "Murojaatingiz uchun rahmat. Choralar ko‘rildi." : "Qoidabuzarlik aniqlanmadi."),
  });
  return ok({ success: true });
});
