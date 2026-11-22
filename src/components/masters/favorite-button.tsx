"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useSession } from "@/components/providers/session";
import { useToast } from "@/components/providers/toast";

export function FavoriteButton({
  masterId,
  initial,
  className,
  size = "md",
  onChange,
}: {
  masterId: string;
  initial: boolean;
  className?: string;
  size?: "sm" | "md";
  onChange?: (fav: boolean) => void;
}) {
  const [fav, setFav] = useState(initial);
  const [busy, setBusy] = useState(false);
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/kirish?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    setFav((v) => !v); // optimistik yangilash
    try {
      const res = await api.post<{ favorite: boolean }>("/api/favorites", { masterId });
      setFav(res.favorite);
      onChange?.(res.favorite);
      toast.success(res.favorite ? "Sevimlilarga qo‘shildi" : "Sevimlilardan olib tashlandi");
    } catch (err) {
      setFav((v) => !v);
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={fav}
      aria-label={fav ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo‘shish"}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-soft)] backdrop-blur transition active:scale-90",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        className,
      )}
    >
      <Heart key={String(fav)} className={cn("h-[18px] w-[18px] transition", fav ? "fill-brand-500 text-brand-500 animate-pop" : "text-ink-2")} />
    </button>
  );
}
