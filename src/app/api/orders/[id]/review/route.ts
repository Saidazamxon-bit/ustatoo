import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { reviewSchema } from "@/lib/validators";
import { createReview } from "@/server/services/reviews";

export const POST = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { rating, comment } = reviewSchema.parse(await readJson(req));
  const review = await createReview(user, id, rating, comment);
  return ok(review, { status: 201 });
});
