"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Lock, Smartphone, XCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Badge } from "@/components/ui/misc";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { money, phone as fmtPhone } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BRAND: Record<string, string> = {
  CLICK: "from-[#0096FF] to-[#0060c9]",
  PAYME: "from-[#33CCCC] to-[#1a9a9a]",
  UZCARD: "from-[#1A4FA0] to-[#0d2d63]",
  HUMO: "from-[#00A651] to-[#00703a]",
};

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * Demo to‘lov oynasi: haqiqiy provayder sahifasini simulyatsiya qiladi
 * (karta/telefon → SMS kod → tasdiqlash). Pul yechilmaydi.
 */
export function DemoCheckout({ payment, order, phone }: { payment: { id: string; provider: string; amount: number; status: string }; order: { id: string; code: string }; phone: string }) {
  const isCard = payment.provider === "UZCARD" || payment.provider === "HUMO";
  const [account, setAccount] = useState(isCard ? (payment.provider === "HUMO" ? "9860 " : "8600 ") : fmtPhone(phone));
  const [expiry, setExpiry] = useState("");
  const [stage, setStage] = useState<"form" | "otp" | "done">(payment.status === "SUCCESS" ? "done" : "form");
  const [code, setCode] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const label = PAYMENT_METHOD_LABELS[payment.provider as PaymentMethod];

  if (payment.status !== "PENDING" && stage !== "done") {
    return (
      <div className="mx-auto max-w-md pt-16">
        <div className="card p-8 text-center">
          <XCircle className="mx-auto h-12 w-12 text-muted" />
          <p className="mt-3 text-lg font-bold">Bu to‘lov sessiyasi yopilgan</p>
          <ButtonLink href={`/tolov/${order.id}`} className="mt-5">
            Qayta to‘lash
          </ButtonLink>
        </div>
      </div>
    );
  }

  const requestCode = () => {
    const e: Record<string, string> = {};
    const digits = account.replace(/\D/g, "");
    if (isCard) {
      if (digits.length !== 16) e.account = "Karta raqami 16 raqamdan iborat";
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) e.expiry = "MM/YY formatida";
    } else if (digits.length < 9) e.account = "Telefon raqamni kiriting";
    setError(e);
    if (!Object.keys(e).length) {
      setStage("otp");
      toast.info("SMS kod yuborildi", "Demo rejim: kod 123456");
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await api.post(`/api/payments/${payment.id}/confirm`, { account, code });
      setStage("done");
    } catch (e) {
      const err = e as ApiError;
      setError(err.fields ?? { code: err.message });
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    try {
      await api.post(`/api/payments/${payment.id}/cancel`);
    } catch {
      /* allaqachon yopilgan bo‘lishi mumkin */
    }
    router.replace(`/tolov/${order.id}`);
  };

  return (
    <div className="mx-auto max-w-md py-6 lg:py-12">
      <div className="mb-4 flex justify-center">
        <Badge tone="warn">DEMO — haqiqiy pul yechilmaydi</Badge>
      </div>
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-[var(--shadow-lift)]">
        <div className={cn("bg-gradient-to-br p-6 text-white", BRAND[payment.provider] ?? "from-ink to-ink-2")}>
          <p className="text-2xl font-black tracking-wide">{label}</p>
          <p className="mt-4 text-sm text-white/80">UstaTop · {order.code}</p>
          <p className="text-3xl font-extrabold">{money(payment.amount)}</p>
        </div>

        <div className="p-6">
          {stage === "form" && (
            <div className="space-y-4 animate-fade-up">
              {isCard ? (
                <>
                  <Input label="Karta raqami" inputMode="numeric" icon={<CreditCard className="h-4 w-4" />} value={account} onChange={(e) => setAccount(formatCard(e.target.value))} error={error.account} placeholder="8600 0000 0000 0000" />
                  <Input
                    label="Amal qilish muddati"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                    }}
                    placeholder="MM/YY"
                    error={error.expiry}
                    className="w-32"
                  />
                </>
              ) : (
                <Input label={`${label} ga ulangan telefon`} inputMode="tel" icon={<Smartphone className="h-4 w-4" />} value={account} onChange={(e) => setAccount(e.target.value)} error={error.account} />
              )}
              <Button className="w-full" size="lg" onClick={requestCode}>
                SMS kod olish
              </Button>
            </div>
          )}
          {stage === "otp" && (
            <div className="space-y-4 animate-fade-up">
              <p className="text-[15px] text-ink-2">
                <b>{isCard ? account.replace(/^(\d{4}).*(\d{4})$/, "$1 •••• $2") : account}</b> raqamiga SMS kod yuborildi.
              </p>
              <Input label="SMS kod" inputMode="numeric" autoFocus maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} error={error.code} hint="Demo kod: 123456" className="text-center text-2xl tracking-[0.5em]" />
              <Button className="w-full" size="lg" loading={busy} onClick={confirm} icon={<Lock className="h-4 w-4" />}>
                {money(payment.amount)} to‘lash
              </Button>
              <button type="button" onClick={() => setStage("form")} className="w-full text-sm font-semibold text-muted">
                Ma’lumotlarni o‘zgartirish
              </button>
            </div>
          )}
          {stage === "done" && (
            <div className="py-4 text-center animate-pop">
              <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
              <p className="mt-3 text-xl font-bold">To‘lov muvaffaqiyatli!</p>
              <p className="mt-1 text-muted">Usta to‘lov haqida xabardor qilindi.</p>
              <ButtonLink href={`/buyurtmalar/${order.id}`} className="mt-5 w-full" size="lg">
                Buyurtmaga qaytish
              </ButtonLink>
            </div>
          )}
          {stage !== "done" && (
            <button type="button" onClick={cancel} className="mt-4 w-full text-sm font-semibold text-danger">
              To‘lovni bekor qilish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
