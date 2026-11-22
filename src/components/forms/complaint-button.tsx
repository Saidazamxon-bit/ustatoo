"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { COMPLAINT_REASONS } from "@/lib/constants";
import { api } from "@/lib/api-client";
import { useSession } from "@/components/providers/session";
import { useToast } from "@/components/providers/toast";
import { cn } from "@/lib/utils";

export function ComplaintButton({
  targetUserId,
  orderId,
  reviewId,
  label = "Shikoyat qilish",
  className,
}: {
  targetUserId?: string;
  orderId?: string;
  reviewId?: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const submit = async () => {
    if (!reason) return toast.error("Sababni tanlang");
    setBusy(true);
    try {
      await api.post("/api/complaints", { reason, details, targetUserId, orderId, reviewId });
      toast.success("Shikoyat yuborildi", "Administrator 24 soat ichida ko‘rib chiqadi");
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => (user ? setOpen(true) : router.push(`/kirish?next=${encodeURIComponent(pathname)}`))}
        className={cn("inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-danger", className)}
      >
        <Flag className="h-4 w-4" /> {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Shikoyat yuborish"
        footer={
          <Button className="w-full" variant="dark" loading={busy} onClick={submit}>
            Yuborish
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMPLAINT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn("rounded-full px-3.5 py-2 text-sm font-semibold transition", reason === r ? "bg-ink text-cream" : "bg-surface text-ink-2 shadow-[var(--shadow-soft)]")}
              >
                {r}
              </button>
            ))}
          </div>
          <Textarea label="Batafsil (ixtiyoriy)" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} placeholder="Nima bo‘lganini qisqacha yozing" />
        </div>
      </Modal>
    </>
  );
}
