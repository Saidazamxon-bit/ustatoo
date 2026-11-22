"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CheckCheck, ChevronLeft, ImagePlus, Loader2, Phone, SendHorizontal, ShoppingBag } from "lucide-react";
import { Avatar } from "@/components/ui/misc";
import { IconCircle } from "@/components/ui/button";
import { api, uploadImage } from "@/lib/api-client";
import { useRealtime, useSession } from "@/components/providers/session";
import { useDraft } from "@/lib/client-storage";
import { useToast } from "@/components/providers/toast";
import { dateLong, time } from "@/lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Msg = { id: string; senderId: string; text: string | null; image: string | null; readAt: string | null; createdAt: string; pending?: boolean };

export function ChatWindow({
  conversationId,
  me,
  other,
  order,
  initial,
}: {
  conversationId: string;
  me: string;
  other: { id: string; name: string; avatar: string | null; subtitle: string; masterId: string | null; lastSeenAt: string; phone?: string | null };
  order: { id: string; code: string; status: string } | null;
  initial: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  // Yozilayotgan xabar qoralama sifatida saqlanadi (yangilanish yoki qayta yuklashda yo‘qolmaydi)
  const [text, setText] = useDraft(`chat:${conversationId}`, "");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasMore, setHasMore] = useState(initial.length >= 50);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const toast = useToast();
  const { refreshCounts } = useSession();
  const online = Date.now() - new Date(other.lastSeenAt).getTime() < 5 * 60_000;

  const scrollToBottom = (smooth = false) => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };
  useLayoutEffect(() => scrollToBottom(), []);
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  useRealtime((e) => {
    if (e.conversationId !== conversationId) return;
    if (e.type === "message" && e.message) {
      const m = e.message as Msg;
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev.filter((x) => !(x.pending && x.senderId === m.senderId && x.text === m.text && x.image === m.image)), m]));
      requestAnimationFrame(() => scrollToBottom(true));
      if (m.senderId !== me) api.post(`/api/conversations/${conversationId}/read`).catch(() => {});
    }
    if (e.type === "message_read" && e.readerId !== me) {
      setMessages((prev) => prev.map((m) => (m.senderId === me && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m)));
    }
  });

  const send = async (payload: { text?: string; image?: string }) => {
    const temp: Msg = { id: `tmp-${Date.now()}`, senderId: me, text: payload.text ?? null, image: payload.image ?? null, readAt: null, createdAt: new Date().toISOString(), pending: true };
    setMessages((prev) => [...prev, temp]);
    requestAnimationFrame(() => scrollToBottom(true));
    try {
      const saved = await api.post<Msg>(`/api/conversations/${conversationId}/messages`, payload);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== temp.id);
        return withoutTemp.some((m) => m.id === saved.id) ? withoutTemp : [...withoutTemp, saved];
      });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      toast.error("Xabar yuborilmadi", (e as Error).message);
      if (payload.text) setText(payload.text);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setText("");
    setSending(true);
    await send({ text: t });
    setSending(false);
  };

  const onImage = async (f?: File) => {
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadImage(f);
      await send({ image: url });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const loadOlder = async () => {
    const first = messages.find((m) => !m.pending);
    if (!first) return;
    const el = listRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const older = await api.get<Msg[]>(`/api/conversations/${conversationId}/messages?before=${encodeURIComponent(first.createdAt)}`);
    setHasMore(older.length >= 50);
    setMessages((prev) => [...older, ...prev]);
    requestAnimationFrame(() => el && (el.scrollTop = el.scrollHeight - prevHeight));
  };

  let lastDay = "";

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-cream lg:static lg:z-auto lg:h-[calc(100dvh-72px-2rem)] lg:rounded-[2rem] lg:bg-white/60 lg:shadow-[var(--shadow-soft)]">
      <header className="flex items-center gap-3 border-b border-line/70 bg-cream/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur lg:rounded-t-[2rem] lg:bg-white/80 lg:pt-3">
        <IconCircle label="Orqaga" onClick={() => router.push("/xabarlar")} className="lg:hidden">
          <ChevronLeft className="h-5 w-5" />
        </IconCircle>
        <Link href={other.masterId ? `/ustalar/${other.masterId}` : "#"} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="relative">
            <Avatar src={other.avatar} name={other.name} size={44} />
            {online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-bold">{other.name}</span>
            <span className="block truncate text-xs text-muted">{online ? "onlayn" : other.subtitle}</span>
          </span>
        </Link>
        {other.phone && (
          <a href={`tel:${other.phone}`} aria-label="Qo‘ng‘iroq qilish" className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)]">
            <Phone className="h-5 w-5" />
          </a>
        )}
      </header>

      {order && (
        <Link href={`/buyurtmalar/${order.id}`} className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm shadow-[var(--shadow-soft)]">
          <ShoppingBag className="h-4 w-4 text-brand-500" />
          <span className="font-semibold">Buyurtma {order.code}</span>
          <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</span>
        </Link>
      )}

      <div ref={listRef} className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4" aria-live="polite">
        {hasMore && (
          <button onClick={loadOlder} className="mx-auto mb-2 block rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-muted shadow-sm">
            Oldingi xabarlar
          </button>
        )}
        {!messages.length && <p className="pt-10 text-center text-sm text-muted">Suhbatni boshlang — ustaga savolingizni yozing 👋</p>}
        {messages.map((m) => {
          const mine = m.senderId === me;
          const day = dateLong(m.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          return (
            <div key={m.id}>
              {showDay && <p className="my-3 text-center text-xs font-semibold text-muted">{day}</p>}
              <div className={cn("flex animate-fade-up", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] overflow-hidden rounded-[1.25rem] text-[15px] leading-snug shadow-sm",
                    mine ? "rounded-br-md bg-brand-500 text-white" : "rounded-bl-md bg-white text-ink",
                    m.pending && "opacity-70",
                  )}
                >
                  {m.image && (
                    <a href={m.image} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.image} alt="Yuborilgan rasm" className="max-h-72 w-full object-cover" />
                    </a>
                  )}
                  {m.text && <p className="whitespace-pre-wrap break-words px-3.5 pt-2">{m.text}</p>}
                  <p className={cn("flex items-center justify-end gap-1 px-3.5 pb-1.5 pt-0.5 text-[11px]", mine ? "text-white/75" : "text-muted", !m.text && "pt-1.5")}>
                    {time(m.createdAt)}
                    {mine && (m.pending ? <Loader2 className="h-3 w-3 animate-spin" /> : m.readAt ? <CheckCheck className="h-3.5 w-3.5" aria-label="O‘qildi" /> : <Check className="h-3.5 w-3.5" aria-label="Yuborildi" />)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-line/70 bg-cream/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:rounded-b-[2rem] lg:bg-white/80">
        <button
          type="button"
          aria-label="Rasm yuborish"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink-2 shadow-[var(--shadow-soft)] transition hover:text-brand-600"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onImage(e.target.files?.[0])} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Xabar yozing…"
          aria-label="Xabar"
          className="max-h-32 min-h-12 flex-1 resize-none rounded-3xl bg-white px-4 py-3 text-[15px] shadow-[var(--shadow-soft)] outline-none focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          aria-label="Yuborish"
          disabled={!text.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-brand)] transition active:scale-90 disabled:opacity-40"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
