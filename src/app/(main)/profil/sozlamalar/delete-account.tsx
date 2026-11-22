"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/form";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { clearPrivateClientData } from "@/components/forms/logout-button";

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      await api.post("/api/me/delete", { password, confirm: confirm.trim().toUpperCase().replace(/['`’ʻ]/g, "‘") });
      clearPrivateClientData();
      toast.success("Hisobingiz o‘chirildi", "UstaTop’dan foydalanganingiz uchun rahmat");
      router.replace("/");
      router.refresh();
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <section className="card mt-5 p-5">
        <p className="font-bold text-danger">Hisobni o‘chirish</p>
        <p className="mt-1 text-sm text-muted">
          Shaxsiy ma’lumotlaringiz (ism, telefon, rasm, sevimlilar, bildirishnomalar) o‘chiriladi, faol buyurtmalar bekor qilinadi. Bu amalni ortga qaytarib bo‘lmaydi.
        </p>
        <Button variant="danger" className="mt-4" icon={<Trash2 className="h-4 w-4" />} onClick={() => setOpen(true)}>
          Hisobni o‘chirish
        </Button>
      </section>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Hisobni o‘chirish"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="danger" className="flex-1" loading={busy} disabled={!password || !confirm} onClick={submit}>
              O‘chirish
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="rounded-2xl bg-red-50 p-3.5 text-sm text-red-700">
            Yakunlangan buyurtmalar ikkinchi tomon (usta/mijoz) hisobotlari uchun “O‘chirilgan foydalanuvchi” nomi bilan saqlanadi — ularda sizning shaxsiy ma’lumotlaringiz qolmaydi.
          </p>
          <Input label="Parolingiz" type="password" autoComplete="current-password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <Input label="Tasdiqlash uchun O‘CHIRISH deb yozing" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} placeholder="O‘CHIRISH" />
        </div>
      </Modal>
    </>
  );
}
