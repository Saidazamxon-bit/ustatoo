"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, CheckCheck, Banknote, Play, Star, Trash2, MessageCircle, CreditCard } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/form";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { useOpenChat } from "@/components/masters/profile-actions";
import { cn } from "@/lib/utils";

type Role = "client" | "master" | "admin";

export function OrderActions({
  orderId,
  role,
  status,
  paymentStatus,
  paymentMethod,
  hasReview,
}: {
  orderId: string;
  role: Role;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  hasReview: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [reasonFor, setReasonFor] = useState<"cancel" | "decline" | null>(null);
  const [reason, setReason] = useState("");
  const chat = useOpenChat();

  const act = async (action: string, extra?: { reason?: string }) => {
    setBusy(action);
    try {
      await api.patch(`/api/orders/${orderId}`, { action, ...extra });
      const msg: Record<string, string> = {
        accept: "Buyurtma qabul qilindi",
        decline: "Buyurtma rad etildi",
        start: "Ish boshlandi",
        complete: "Ish yakunlandi",
        cancel: "Buyurtma bekor qilindi",
        cash_received: "Naqd to‘lov belgilandi",
      };
      toast.success(msg[action] ?? "Bajarildi");
      setReasonFor(null);
      setReason("");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const unpaid = paymentStatus !== "PAID" && paymentStatus !== "REFUNDED";
  const buttons: React.ReactNode[] = [];

  if (role === "master") {
    if (status === "NEW" || status === "PENDING") {
      buttons.push(
        <Button key="accept" className="flex-1" loading={busy === "accept"} onClick={() => act("accept")} icon={<Check className="h-4 w-4" />}>
          Qabul qilish
        </Button>,
        <Button key="decline" variant="danger" className="flex-1" onClick={() => setReasonFor("decline")} icon={<Ban className="h-4 w-4" />}>
          Rad etish
        </Button>,
      );
    }
    if (status === "ACCEPTED")
      buttons.push(
        <Button key="start" className="flex-1" loading={busy === "start"} onClick={() => act("start")} icon={<Play className="h-4 w-4" />}>
          Ishni boshlash
        </Button>,
      );
    if (status === "IN_PROGRESS")
      buttons.push(
        <Button key="complete" className="flex-1" loading={busy === "complete"} onClick={() => act("complete")} icon={<CheckCheck className="h-4 w-4" />}>
          Ishni yakunlash
        </Button>,
      );
    if ((status === "IN_PROGRESS" || status === "COMPLETED") && unpaid)
      buttons.push(
        <Button key="cash" variant="outline" className="flex-1" loading={busy === "cash_received"} onClick={() => act("cash_received")} icon={<Banknote className="h-4 w-4" />}>
          Naqd pul olindi
        </Button>,
      );
  }

  if (role === "client") {
    if (status !== "CANCELLED" && unpaid && paymentStatus !== "PAID")
      buttons.push(
        <ButtonLink key="pay" href={`/tolov/${orderId}`} className="flex-1" icon={<CreditCard className="h-4 w-4" />}>
          {paymentMethod === "CASH" ? "To‘lov usulini o‘zgartirish" : "To‘lash"}
        </ButtonLink>,
      );
    if (["NEW", "PENDING", "ACCEPTED"].includes(status))
      buttons.push(
        <Button key="cancel" variant="danger" className="flex-1" onClick={() => setReasonFor("cancel")} icon={<Ban className="h-4 w-4" />}>
          Bekor qilish
        </Button>,
      );
  }

  if (role === "admin" && ["NEW", "PENDING", "ACCEPTED"].includes(status)) {
    buttons.push(
      <Button key="cancel" variant="danger" className="flex-1" onClick={() => setReasonFor("cancel")} icon={<Ban className="h-4 w-4" />}>
        Admin: bekor qilish
      </Button>,
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {buttons}
        {role !== "admin" && (
          <Button variant="secondary" className={cn(buttons.length ? "" : "flex-1")} loading={chat.busy} onClick={() => chat.open({ orderId })} icon={<MessageCircle className="h-4 w-4" />}>
            Chat
          </Button>
        )}
      </div>
      {role === "client" && status === "COMPLETED" && !hasReview && <ReviewForm orderId={orderId} />}

      <Modal
        open={!!reasonFor}
        onClose={() => setReasonFor(null)}
        title={reasonFor === "decline" ? "Rad etish sababi" : "Bekor qilish sababi"}
        footer={
          <Button variant="dark" className="w-full" loading={!!busy} onClick={() => reasonFor && act(reasonFor, { reason })} disabled={reason.trim().length < 3}>
            Tasdiqlash
          </Button>
        }
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(reasonFor === "decline"
              ? ["Bu vaqtda bandman", "Hududim emas", "Bu ishni bajarmayman"]
              : ["Rejalar o‘zgardi", "Boshqa usta topdim", "Muammo hal bo‘ldi", "Usta javob bermadi"]
            ).map((r) => (
              <button key={r} type="button" onClick={() => setReason(r)} className={cn("rounded-full px-3.5 py-2 text-sm font-semibold", reason === r ? "bg-ink text-cream" : "bg-surface shadow-[var(--shadow-soft)]")}>
                {r}
              </button>
            ))}
          </div>
          <Textarea label="Sabab" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="Qisqacha yozing" />
          {paymentStatus === "PAID" && reasonFor === "cancel" && <p className="rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">To‘langan summa qaytariladi.</p>}
        </div>
      </Modal>
    </>
  );
}

function ReviewForm({ orderId }: { orderId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const submit = async () => {
    if (!rating) return toast.error("Bahoni tanlang");
    setBusy(true);
    try {
      await api.post(`/api/orders/${orderId}/review`, { rating, comment });
      toast.success("Rahmat! Sharhingiz qabul qilindi");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <div className="card mt-4 space-y-3 p-5 animate-fade-up">
      <p className="text-lg font-bold">Ustani baholang</p>
      <div className="flex gap-2" role="radiogroup" aria-label="Baho">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} yulduz`} onClick={() => setRating(i)} className="transition active:scale-90">
            <Star className={cn("h-9 w-9", i <= rating ? "fill-amber-400 text-amber-400" : "fill-cream-2 text-line")} />
          </button>
        ))}
      </div>
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ish sifati, muomala, vaqtga rioya…" maxLength={1000} />
      <Button className="w-full" loading={busy} onClick={submit}>
        Sharh qoldirish
      </Button>
    </div>
  );
}

export function RemoveItemButton({ orderId, itemId }: { orderId: string; itemId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api.delete(`/api/orders/${orderId}/items/${itemId}`);
          toast.success("Xizmat olib tashlandi");
          router.refresh();
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-600 disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" /> Olib tashlash
    </button>
  );
}
