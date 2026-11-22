"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { clearUserDrafts } from "@/lib/client-storage";

/** Chiqish/kirishda boshqa foydalanuvchi ko‘rmasligi kerak bo‘lgan lokal ma'lumotlarni tozalash */
export function clearPrivateClientData() {
  clearUserDrafts();
  try {
    navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_USER_CACHE" });
  } catch {}
}

export function LogoutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await api.post("/api/auth/logout").catch(() => {});
        clearPrivateClientData();
        router.replace("/");
        router.refresh();
      }}
      className={cn("flex w-full items-center justify-center gap-2 rounded-full bg-red-50 py-3.5 font-bold text-danger transition hover:bg-red-100 disabled:opacity-50", className)}
    >
      <LogOut className="h-5 w-5" /> Chiqish
    </button>
  );
}
