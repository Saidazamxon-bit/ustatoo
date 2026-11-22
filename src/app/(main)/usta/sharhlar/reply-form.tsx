"use client";

import { useState } from "react";
import { Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";

export function ReplyForm({ reviewId, initial }: { reviewId: string; initial: string | null }) {
  const [reply, setReply] = useState(initial ?? "");
  const [saved, setSaved] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  if (saved && !editing)
    return (
      <div className="mt-3 rounded-2xl bg-cream p-3 text-sm">
        <p className="mb-0.5 font-semibold">Sizning javobingiz</p>
        <p className="text-ink-2">{saved}</p>
        <button onClick={() => setEditing(true)} className="mt-1 text-xs font-bold text-brand-600">Tahrirlash</button>
      </div>
    );
  if (!editing)
    return (
      <button onClick={() => setEditing(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
        <Reply className="h-4 w-4" /> Javob berish
      </button>
    );
  return (
    <div className="mt-3 space-y-2">
      <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} maxLength={1000} placeholder="Mijozga minnatdorchilik yoki izoh…" />
      <div className="flex gap-2">
        <Button size="sm" loading={busy} disabled={reply.trim().length < 2} onClick={async () => {
          setBusy(true);
          try {
            await api.post(`/api/master/reviews/${reviewId}`, { reply });
            setSaved(reply);
            setEditing(false);
            toast.success("Javob saqlandi");
          } catch (e) {
            toast.error((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}>Yuborish</Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Bekor qilish</Button>
      </div>
    </div>
  );
}
