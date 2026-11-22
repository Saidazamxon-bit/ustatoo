"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadImage } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Bir yoki bir nechta rasm yuklash. Rasmlar serverga darhol yuklanadi, URL lar qaytariladi. */
export function ImageUploader({
  value,
  onChange,
  max = 6,
  label = "Rasm qo‘shish",
  className,
  tileClassName,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
  className?: string;
  tileClassName?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const toast = useToast();

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, max - value.length);
    const urls: string[] = [];
    setUploading(list.length);
    for (const f of list) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
        toast.error(`${f.name}: faqat JPG, PNG yoki WEBP`);
        continue;
      }
      if (f.size > MAX_UPLOAD_BYTES) {
        toast.error(`${f.name}: 5 MB dan katta`);
        continue;
      }
      try {
        urls.push(await uploadImage(f));
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    setUploading(0);
    if (urls.length) onChange([...value, ...urls].slice(0, max));
    if (input.current) input.current.value = "";
  };

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {value.map((url) => (
        <div key={url} className={cn("relative h-24 w-24 overflow-hidden rounded-2xl bg-cream-2 shadow-[var(--shadow-soft)] animate-pop", tileClassName)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="Rasmni o‘chirish"
            onClick={() => onChange(value.filter((v) => v !== url))}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      {Array.from({ length: uploading }).map((_, i) => (
        <div key={`u${i}`} className={cn("flex h-24 w-24 items-center justify-center rounded-2xl bg-surface", tileClassName)}>
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ))}
      {value.length + uploading < max && (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn(
            "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 text-brand-600 transition hover:bg-brand-50",
            tileClassName,
          )}
        >
          <ImagePlus className="h-6 w-6" />
          <span className="px-1 text-center text-[11px] font-semibold leading-tight">{label}</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={max > 1} hidden onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
