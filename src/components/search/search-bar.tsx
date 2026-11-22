"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/providers/toast";

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

/** Qidiruv maydoni: matn, ovozli qidiruv (brauzer qo‘llasa) va filtr tugmasi */
export function SearchBar({
  defaultValue = "",
  onFilter,
  autoFocus,
  className,
  onSubmit,
}: {
  defaultValue?: string;
  onFilter?: () => void;
  autoFocus?: boolean;
  className?: string;
  onSubmit?: (q: string) => void;
}) {
  const [q, setQ] = useState(defaultValue);
  const [listening, setListening] = useState(false);
  const [voice, setVoice] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => setQ(defaultValue), [defaultValue]);
  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    setVoice(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const submit = (value: string) => {
    const v = value.trim();
    if (onSubmit) onSubmit(v);
    else router.push(v ? `/qidiruv?q=${encodeURIComponent(v)}` : "/qidiruv");
  };

  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = "uz-UZ";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setQ(text);
      submit(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      toast.error("Ovozni aniqlab bo‘lmadi", "Mikrofonga ruxsat berilganini tekshiring");
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <form
        role="search"
        className="flex h-[52px] flex-1 items-center gap-2.5 rounded-full bg-white pl-4 pr-2 shadow-[var(--shadow-soft)] ring-brand-200 transition focus-within:ring-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
      >
        <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Usta yoki xizmat qidiring"
          aria-label="Qidiruv"
          autoFocus={autoFocus}
          enterKeyHint="search"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        {voice && (
          <button
            type="button"
            onClick={startVoice}
            aria-label="Ovozli qidiruv"
            className={cn("flex h-9 w-9 items-center justify-center rounded-full transition", listening ? "bg-brand-500 text-white animate-pulse" : "text-muted hover:bg-cream")}
          >
            <Mic className="h-[18px] w-[18px]" />
          </button>
        )}
      </form>
      <button
        type="button"
        aria-label="Filtrlar"
        onClick={() => (onFilter ? onFilter() : router.push(`/qidiruv?filtr=1${q ? `&q=${encodeURIComponent(q)}` : ""}`))}
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white shadow-[var(--shadow-soft)] transition hover:bg-brand-50 active:scale-95"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}
