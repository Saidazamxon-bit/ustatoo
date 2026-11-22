import { route, ok, badRequest } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { saveImage } from "@/server/storage";
import { rateLimit } from "@/server/rate-limit";

export const POST = route(async (req) => {
  const user = await requireUser();
  rateLimit(`upload:${user.id}`, 40, 10 * 60_000);
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) throw badRequest("Fayl tanlanmagan");
  const url = await saveImage(file);
  return ok({ url }, { status: 201 });
});
