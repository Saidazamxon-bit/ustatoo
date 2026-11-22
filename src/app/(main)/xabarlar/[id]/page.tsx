import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/server/auth";
import { getConversation, getMessages, listConversations } from "@/server/services/chat";
import { HttpError } from "@/server/errors";
import { db } from "@/server/db";
import { ChatWindow } from "@/components/chat/chat-window";
import { ConversationList } from "@/components/chat/conversation-list";

export const metadata: Metadata = { title: "Suhbat", robots: { index: false } };

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePageUser(`/xabarlar/${id}`);
  let conv;
  try {
    conv = await getConversation(user, id);
  } catch (e) {
    if (e instanceof HttpError) notFound();
    throw e;
  }
  const [messages, list] = await Promise.all([getMessages(user, id), listConversations(user)]);
  // Telefon raqami: mijoz uchun ustaning ommaviy raqami, usta uchun mijoz raqami
  const phone =
    conv.side === "client"
      ? (await db.masterProfile.findUnique({ where: { id: conv.conv.masterId }, select: { publicPhone: true } }))?.publicPhone
      : (await db.user.findUnique({ where: { id: conv.other.id }, select: { phone: true } }))?.phone;

  return (
    <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-6 lg:pt-6">
      <aside className="hidden max-h-[calc(100dvh-72px-2rem)] overflow-y-auto pr-1 lg:block">
        <h1 className="mb-4 text-2xl font-bold">Xabarlar</h1>
        <ConversationList initial={list} compact />
      </aside>
      <ChatWindow
        conversationId={id}
        me={user.id}
        other={{ ...conv.other, lastSeenAt: conv.other.lastSeenAt.toISOString(), phone }}
        order={conv.conv.order}
        initial={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString(), readAt: m.readAt?.toISOString() ?? null }))}
      />
    </div>
  );
}
