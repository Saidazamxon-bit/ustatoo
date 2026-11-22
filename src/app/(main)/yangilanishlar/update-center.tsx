"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2, RefreshCw, ShieldCheck, Sparkles, Wrench, Palette, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { usePwa } from "@/components/pwa/pwa-provider";
import { APP_VERSION, BUILD_ID, BUILD_TIME } from "@/lib/version";
import { CHANGELOG } from "@/lib/changelog";
import { dateLong, dateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ServerVersion = { version: string; buildId: string; builtAt: string };
type Status = "checking" | "latest" | "available" | "error" | "offline";

export function UpdateCenter() {
  const { updateReady, applyUpdate, updating, checkForUpdate, swSupported, online, isStandalone } = usePwa();
  const [server, setServer] = useState<ServerVersion | null>(null);
  const [status, setStatus] = useState<Status>("checking");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const check = useCallback(async () => {
    setStatus("checking");
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }
    try {
      const [res, swHasUpdate] = await Promise.all([
        fetch("/api/version", { cache: "no-store" }).then((r) => r.json()),
        swSupported ? checkForUpdate() : Promise.resolve(false),
      ]);
      const sv: ServerVersion = res.data;
      setServer(sv);
      setCheckedAt(new Date());
      setStatus(swHasUpdate || sv.buildId !== BUILD_ID ? "available" : "latest");
    } catch {
      setStatus("error");
    }
  }, [checkForUpdate, swSupported]);

  useEffect(() => {
    check();
  }, [check]);

  const available = updateReady || status === "available";
  const latest = CHANGELOG[0];

  return (
    <div className="space-y-6">
      {/* Joriy holat */}
      <section className="relative overflow-hidden rounded-[2rem] bg-surface p-6 shadow-[var(--shadow-soft)]">
        <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-brand-100 blur-2xl" aria-hidden />
        <div className="relative flex items-start gap-4">
          <span className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", available ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "bg-green-50 text-success")}>
            {status === "checking" ? <Loader2 className="h-7 w-7 animate-spin" /> : available ? <Download className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">Joriy versiya</p>
            <p className="text-3xl font-extrabold tracking-tight">v{APP_VERSION}</p>
            <p className="mt-0.5 text-xs text-muted">
              Build {BUILD_ID}
              {BUILD_TIME && ` · ${dateTime(BUILD_TIME)}`}
              {isStandalone && " · O‘rnatilgan ilova"}
            </p>
          </div>
        </div>

        <div className="relative mt-5 rounded-2xl bg-cream p-4" role="status" aria-live="polite">
          {status === "checking" && <p className="text-[15px] font-semibold">Yangilanishlar tekshirilmoqda…</p>}
          {status === "offline" && (
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-2">
              <AlertTriangle className="h-5 w-5 text-warn" /> Internet yo‘q — yangilanishni tekshirib bo‘lmadi
            </p>
          )}
          {status === "error" && (
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-2">
              <AlertTriangle className="h-5 w-5 text-warn" /> Tekshirishda xatolik. Joriy versiya ishlashda davom etadi.
            </p>
          )}
          {status === "latest" && !updateReady && (
            <p className="flex items-center gap-2 text-[15px] font-semibold text-green-700">
              <CheckCircle2 className="h-5 w-5" /> Siz eng so‘nggi versiyadan foydalanmoqdasiz
            </p>
          )}
          {available && status !== "checking" && (
            <div>
              <p className="flex items-center gap-2 text-[15px] font-bold text-brand-700">
                <Sparkles className="h-5 w-5" /> Yangi versiya mavjud{server && server.version !== APP_VERSION ? `: v${server.version}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted">Yangilanish ma’lumotlaringiz, login va qoralamalaringizni saqlab qoladi.</p>
            </div>
          )}
          {checkedAt && <p className="mt-1 text-xs text-muted">Oxirgi tekshiruv: {dateTime(checkedAt)}</p>}
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2.5">
          {available ? (
            <Button size="lg" className="flex-1" loading={updating} onClick={applyUpdate} icon={<Download className="h-5 w-5" />}>
              Yangilash
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" disabled={status === "checking" || !online} onClick={check} icon={<RefreshCw className={cn("h-4 w-4", status === "checking" && "animate-spin")} />}>
              Yangilanishni tekshirish
            </Button>
          )}
        </div>
        <p className="relative mt-4 flex items-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-success" /> Yangilanish xato bo‘lsa, ishlayotgan versiya saqlanib qoladi.
        </p>
      </section>

      {/* Oxirgi yangilanish */}
      <section>
        <h2 className="section-title mb-3">Oxirgi yangilanish</h2>
        <ReleaseCard entry={latest} highlight />
      </section>

      {/* Tarix */}
      {CHANGELOG.length > 1 && (
        <section>
          <h2 className="section-title mb-3">Yangilanishlar tarixi</h2>
          <div className="space-y-3">
            {CHANGELOG.slice(1).map((e) => (
              <ReleaseCard key={e.version} entry={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReleaseCard({ entry, highlight }: { entry: (typeof CHANGELOG)[number]; highlight?: boolean }) {
  const groups = [
    { key: "features", title: "Yangi funksiyalar", icon: Sparkles, items: entry.features, tone: "text-brand-500" },
    { key: "design", title: "Dizayn yaxshilanishlari", icon: Palette, items: entry.design, tone: "text-violet-500" },
    { key: "fixes", title: "Xatoliklar tuzatildi", icon: Wrench, items: entry.fixes, tone: "text-green-600" },
  ].filter((g) => g.items.length);
  return (
    <article className={cn("card p-5", highlight && "ring-2 ring-brand-200")}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-lg font-extrabold">v{entry.version}</span>
        {entry.version === APP_VERSION && <Badge tone="brand">Joriy</Badge>}
        <span className="text-sm text-muted">{dateLong(entry.date)}</span>
      </div>
      <p className="mb-4 font-semibold">{entry.title}</p>
      <div className="space-y-4">
        {groups.map(({ key, title, icon: Icon, items, tone }) => (
          <div key={key}>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-bold">
              <Icon className={cn("h-4 w-4", tone)} /> {title}
            </p>
            <ul className="space-y-1 pl-6 text-[15px] text-ink-2">
              {items.map((i) => (
                <li key={i} className="list-disc marker:text-line">
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
