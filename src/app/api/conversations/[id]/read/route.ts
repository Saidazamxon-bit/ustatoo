import { route, ok } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { getConversation, markRead } from "@/server/services/chat";

export const POST = route<{ id: string }>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { other } = await getConversation(user, id);
  await markRead(user, id, other.id);
  return ok({ success: true });
});
