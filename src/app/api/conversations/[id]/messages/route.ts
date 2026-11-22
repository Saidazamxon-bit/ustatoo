import { route, ok, readJson } from "@/server/errors";
import { requireUser } from "@/server/auth";
import { messageSchema } from "@/lib/validators";
import { getMessages, sendMessage } from "@/server/services/chat";
import { rateLimit } from "@/server/rate-limit";

export const GET = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  return ok(await getMessages(user, id, req.nextUrl.searchParams.get("before") ?? undefined));
});

export const POST = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  rateLimit(`msg:${user.id}`, 60, 60_000);
  const input = messageSchema.parse(await readJson(req));
  return ok(await sendMessage(user, id, input), { status: 201 });
});
