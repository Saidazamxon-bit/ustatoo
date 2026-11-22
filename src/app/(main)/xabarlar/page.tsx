import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { listConversations } from "@/server/services/chat";
import { PageHeader } from "@/components/layout/page-header";
import { ConversationList } from "@/components/chat/conversation-list";

export const metadata: Metadata = { title: "Xabarlar", robots: { index: false } };

export default async function MessagesPage() {
  const user = await requirePageUser("/xabarlar");
  const items = await listConversations(user);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Xabarlar" back={false} />
      <ConversationList initial={items} />
    </div>
  );
}
