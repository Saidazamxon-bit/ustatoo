"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, MessageCircle, Phone, Share2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useSession } from "@/components/providers/session";
import { useToast } from "@/components/providers/toast";
import { IconCircle } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <IconCircle label="Orqaga" className={className} onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}>
      <ChevronLeft className="h-5 w-5" />
    </IconCircle>
  );
}

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const toast = useToast();
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Havola nusxalandi");
      }
    } catch {
      /* foydalanuvchi bekor qildi */
    }
  };
  return (
    <IconCircle label="Ulashish" className={className} onClick={share}>
      <Share2 className="h-[18px] w-[18px]" />
    </IconCircle>
  );
}

/** Usta bilan suhbatni ochadi (kerak bo‘lsa yaratadi) */
export function useOpenChat() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSession();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const open = async (body: { masterId?: string; orderId?: string }) => {
    if (!user) return router.push(`/kirish?next=${encodeURIComponent(pathname)}`);
    setBusy(true);
    try {
      const conv = await api.post<{ id: string }>("/api/conversations", body);
      router.push(`/xabarlar/${conv.id}`);
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };
  return { open, busy };
}

export function ContactButtons({ masterId, phone, isSelf }: { masterId: string; phone?: string | null; isSelf: boolean }) {
  const { open, busy } = useOpenChat();
  const toast = useToast();
  const circle = "flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-soft)] ring-1 ring-line transition hover:bg-brand-50 active:scale-95";
  return (
    <div className="flex gap-2.5">
      {phone ? (
        <a href={`tel:${phone}`} aria-label="Qo‘ng‘iroq qilish" title="Qo‘ng‘iroq qilish" className={circle}>
          <Phone className="h-5 w-5" />
        </a>
      ) : (
        <button className={circle} aria-label="Qo‘ng‘iroq qilish" onClick={() => toast.info("Usta telefon raqamini yashirgan", "Xabar orqali bog‘laning")}>
          <Phone className="h-5 w-5" />
        </button>
      )}
      <button
        aria-label="Xabar yozish"
        title="Xabar yozish"
        disabled={busy || isSelf}
        onClick={() => open({ masterId })}
        className={cn(circle, (busy || isSelf) && "opacity-50")}
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
