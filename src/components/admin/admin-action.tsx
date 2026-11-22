"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/form";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "dark";

/**
 * Admin amallari uchun universal tugma: API chaqiradi, kerak bo‘lsa tasdiqlash
 * yoki izoh so‘raydi va sahifani yangilaydi.
 */
export function AdminAction({
  url,
  method = "PATCH",
  body,
  label,
  variant = "secondary",
  confirm,
  noteField,
  noteLabel = "Izoh",
  success = "Bajarildi",
  icon,
}: {
  url: string;
  method?: "POST" | "PATCH" | "DELETE" | "PUT";
  body?: Record<string, unknown>;
  label: string;
  variant?: Variant;
  confirm?: string;
  noteField?: string;
  noteLabel?: string;
  success?: string;
  icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const run = async () => {
    setBusy(true);
    try {
      const payload = { ...body, ...(noteField ? { [noteField]: note || undefined } : {}) };
      if (method === "DELETE") await api.delete(url);
      else if (method === "POST") await api.post(url, payload);
      else if (method === "PUT") await api.put(url, payload);
      else await api.patch(url, payload);
      toast.success(success);
      setOpen(false);
      setNote("");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="sm" variant={variant} loading={busy && !open} icon={icon} onClick={() => (confirm || noteField ? setOpen(true) : run())}>
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant={variant === "danger" ? "danger" : "dark"} className="flex-1" loading={busy} onClick={run}>
              Tasdiqlash
            </Button>
          </div>
        }
      >
        {confirm && <p className="mb-3 text-ink-2">{confirm}</p>}
        {noteField && <Textarea label={noteLabel} value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={500} />}
      </Modal>
    </>
  );
}
