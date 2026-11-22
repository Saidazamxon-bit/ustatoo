import { route, ok, readJson } from "@/server/errors";
import { requireMaster } from "@/server/auth";
import { reviewReplySchema } from "@/lib/validators";
import { replyToReview } from "@/server/services/reviews";

export const POST = route<{ id: string }>(async (req, { params }) => {
  const { user } = await requireMaster();
  const { id } = await params;
  const { reply } = reviewReplySchema.parse(await readJson(req));
  await replyToReview(user, id, reply);
  return ok({ success: true });
});
