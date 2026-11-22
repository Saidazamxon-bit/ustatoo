"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Minus, Plus, CalendarDays, MapPin, FileText, ListChecks, CreditCard } from "lucide-react";
import { Avatar, Rating, SmartImage } from "@/components/ui/misc";
import { Button, IconCircle } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/form";
import { ImageUploader } from "@/components/forms/image-uploader";
import { PaymentMethods } from "@/components/orders/payment-methods";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { REGION_NAMES, getDistricts } from "@/lib/regions";
import { money, priceWithUnit, weekdayShort } from "@/lib/format";
import { PRICE_UNIT_LABELS, type PaymentMethod, type PriceUnit } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { store } from "@/lib/client-storage";

type WizardDraft = {
  qty: Record<string, number>;
  description: string;
  images: string[];
  region: string;
  district: string;
  address: string;
  day: number;
  slot: string;
  method: PaymentMethod;
  step: number;
};
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

type Master = {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string;
  rating: number;
  reviewCount: number;
  cover: string;
  workStart: string;
  workEnd: string;
  workDays: number[];
  region: string;
};
type Svc = { id: string; title: string; price: number; priceUnit: string; durationText: string; image: string };

const STEPS = [
  { title: "Xizmatlar", icon: ListChecks },
  { title: "Muammo", icon: FileText },
  { title: "Manzil", icon: MapPin },
  { title: "Vaqt", icon: CalendarDays },
  { title: "Tasdiqlash", icon: CreditCard },
];

function buildDays(workDays: number[]) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  for (let i = 0; out.length < 14 && i < 30; i++) {
    const x = new Date(d.getTime() + i * 86_400_000);
    const wd = x.getDay() === 0 ? 7 : x.getDay();
    if (workDays.includes(wd)) out.push(x);
  }
  return out;
}

function buildSlots(start: string, end: string) {
  const [sh] = start.split(":").map(Number);
  const [eh] = end.split(":").map(Number);
  const slots: string[] = [];
  for (let h = sh; h < eh; h++) slots.push(`${String(h).padStart(2, "0")}:00`);
  return slots;
}

export function OrderWizard({
  master,
  services,
  preselected,
  defaults,
}: {
  master: Master;
  services: Svc[];
  preselected: string[];
  defaults: { region: string; district: string; address: string };
}) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries((preselected.length ? preselected : services.slice(0, 1).map((s) => s.id)).map((id) => [id, 1])),
  );
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [region, setRegion] = useState(defaults.region);
  const [district, setDistrict] = useState(defaults.district);
  const [address, setAddress] = useState(defaults.address);
  const days = useMemo(() => buildDays(master.workDays), [master.workDays]);
  const slots = useMemo(() => buildSlots(master.workStart, master.workEnd), [master.workStart, master.workEnd]);
  const [day, setDay] = useState<number>(0);
  const [slot, setSlot] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Qoralama: forma holati avtomatik saqlanadi va qayta ochilganda tiklanadi
  const draftKey = `draft:order:${master.id}`;
  const draftReady = useRef(false);
  useEffect(() => {
    const d = store.get<{ v: WizardDraft; t: number } | null>(draftKey, null);
    if (d && Date.now() - d.t < DRAFT_TTL && (d.v.description || d.v.step > 0)) {
      const validQty = Object.fromEntries(Object.entries(d.v.qty).filter(([id]) => services.some((s) => s.id === id)));
      if (Object.keys(validQty).length) setQty(validQty);
      setDescription(d.v.description);
      setImages(d.v.images);
      setRegion(d.v.region);
      setDistrict(d.v.district);
      setAddress(d.v.address);
      if (d.v.day < days.length) setDay(d.v.day);
      setSlot(d.v.slot);
      setMethod(d.v.method);
      setStep(Math.min(Math.max(d.v.step, 0), STEPS.length - 1));
      toast.info("Qoralama tiklandi", "Avval to‘ldirgan ma’lumotlaringiz saqlangan");
    }
    draftReady.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!draftReady.current) return;
    const id = setTimeout(() => {
      const v: WizardDraft = { qty, description, images, region, district, address, day, slot, method, step };
      store.set(draftKey, { v, t: Date.now() });
    }, 300);
    return () => clearTimeout(id);
  }, [draftKey, qty, description, images, region, district, address, day, slot, method, step]);

  const selected = services.filter((s) => qty[s.id]);
  const total = selected.reduce((sum, s) => sum + s.price * (qty[s.id] ?? 0), 0);

  const scheduledAt = useMemo(() => {
    if (!slot || !days[day]) return null;
    const [h, m] = slot.split(":").map(Number);
    const d = new Date(days[day]);
    d.setHours(h, m, 0, 0);
    return d;
  }, [day, slot, days]);

  const slotDisabled = (s: string) => {
    const [h] = s.split(":").map(Number);
    const d = new Date(days[day]);
    d.setHours(h, 0, 0, 0);
    return d.getTime() < Date.now() + 30 * 60_000;
  };

  const validate = (i: number): boolean => {
    const e: Record<string, string> = {};
    if (i === 0 && !selected.length) e.items = "Kamida bitta xizmatni tanlang";
    if (i === 1 && description.trim().length < 10) e.description = "Muammoni batafsilroq yozing (kamida 10 belgi)";
    if (i === 2) {
      if (!region) e.region = "Hududni tanlang";
      if (!district) e.district = "Tumanni tanlang";
      if (address.trim().length < 5) e.address = "To‘liq manzilni kiriting (ko‘cha, uy, xonadon)";
    }
    if (i === 3 && !scheduledAt) e.slot = "Vaqtni tanlang";
    setErrors(e);
    if (Object.keys(e).length) toast.error(Object.values(e)[0]);
    return !Object.keys(e).length;
  };

  const next = () => validate(step) && setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));

  const submit = async () => {
    for (let i = 0; i < 4; i++) if (!validate(i)) return setStep(i);
    setSubmitting(true);
    try {
      const order = await api.post<{ id: string; code: string }>("/api/orders", {
        masterId: master.id,
        items: selected.map((s) => ({ serviceId: s.id, quantity: qty[s.id] })),
        description,
        images,
        region,
        district,
        address,
        scheduledAt: scheduledAt!.toISOString(),
        paymentMethod: method,
      });
      store.remove(draftKey);
      toast.success("Buyurtma yuborildi!", `${order.code} — usta javobini kuting`);
      router.replace(method === "CASH" ? `/buyurtmalar/${order.id}?yangi=1` : `/tolov/${order.id}`);
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl pb-32">
      <header className="flex items-center gap-3 pb-3 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-8">
        <IconCircle label="Orqaga" onClick={back}>
          <ChevronLeft className="h-5 w-5" />
        </IconCircle>
        <div className="flex-1 text-center">
          <h1 className="text-[22px] font-bold">Buyurtma berish</h1>
          <p className="text-sm text-muted">
            {step + 1}-qadam / {STEPS.length}: {STEPS[step].title}
          </p>
        </div>
        <span className="w-11" />
      </header>

      {/* Qadamlar indikatori */}
      <ol className="mb-5 flex items-center gap-1.5" aria-label="Buyurtma bosqichlari">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex-1">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn("h-1.5 w-full rounded-full transition-colors", i <= step ? "bg-brand-500" : "bg-line")}
              aria-label={s.title}
              aria-current={i === step ? "step" : undefined}
            />
          </li>
        ))}
      </ol>

      {/* Tanlangan usta */}
      <div className="card mb-5 flex items-center gap-3.5 p-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
          <SmartImage src={master.cover} alt={master.name} sizes="64px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{master.name}</p>
          <p className="truncate text-sm text-muted">{master.specialty}</p>
          <Rating value={master.rating} count={master.reviewCount} className="text-xs" />
        </div>
        <Avatar src={master.avatar} name={master.name} size={40} />
      </div>

      <div key={step} className="animate-fade-up">
        {step === 0 && (
          <section className="space-y-3">
            <h2 className="section-title">Qaysi xizmatlar kerak?</h2>
            {services.map((s) => {
              const q = qty[s.id] ?? 0;
              const unit = PRICE_UNIT_LABELS[s.priceUnit as PriceUnit];
              return (
                <div key={s.id} className={cn("card flex items-center gap-3 p-3 transition", q && "ring-2 ring-brand-300")}>
                  <button
                    type="button"
                    onClick={() => setQty((p) => (p[s.id] ? Object.fromEntries(Object.entries(p).filter(([k]) => k !== s.id)) : { ...p, [s.id]: 1 }))}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-pressed={!!q}
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                      <SmartImage src={s.image} alt={s.title} sizes="56px" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{s.title}</span>
                      <span className="block text-sm font-bold text-brand-600">{priceWithUnit(s.price, s.priceUnit)}</span>
                      <span className="block text-xs text-muted">{s.durationText}</span>
                    </span>
                  </button>
                  {q ? (
                    <div className="flex items-center gap-1.5 rounded-full bg-cream p-1">
                      <button type="button" aria-label="Kamaytirish" onClick={() => setQty((p) => (p[s.id] <= 1 ? Object.fromEntries(Object.entries(p).filter(([k]) => k !== s.id)) : { ...p, [s.id]: p[s.id] - 1 }))} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-brand-600 shadow-sm">
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        aria-label={`Miqdor (${unit})`}
                        inputMode="numeric"
                        value={q}
                        onChange={(e) => {
                          const v = Math.max(1, Math.min(1000, Number(e.target.value.replace(/\D/g, "")) || 1));
                          setQty((p) => ({ ...p, [s.id]: v }));
                        }}
                        className="w-9 bg-transparent text-center font-bold outline-none"
                      />
                      <button type="button" aria-label="Ko‘paytirish" onClick={() => setQty((p) => ({ ...p, [s.id]: Math.min(1000, p[s.id] + 1) }))} className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="flex h-6 w-6 rounded-full border-2 border-line" />
                  )}
                </div>
              );
            })}
            {errors.items && <p className="text-sm font-medium text-danger">{errors.items}</p>}
          </section>
        )}

        {step === 1 && (
          <section className="space-y-5">
            <h2 className="section-title">Muammo yoki talabni yozing</h2>
            <Textarea
              label="Tavsif"
              placeholder="Masalan: oshxonadagi 2 ta rozetka ishlamayapti, avtomat tez-tez tushib qolyapti…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              error={errors.description}
              hint={`${description.length}/2000`}
              rows={5}
            />
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-2">Rasmlar (ixtiyoriy, 6 tagacha)</p>
              <ImageUploader value={images} onChange={setImages} max={6} label="Rasm yuklash" />
              <p className="mt-2 text-[13px] text-muted">Rasm ustaga muammoni oldindan tushunishga va aniq narx aytishga yordam beradi.</p>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <h2 className="section-title">Manzilni kiriting</h2>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Hudud" value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }} placeholder="Tanlang" options={REGION_NAMES.map((r) => ({ value: r, label: r }))} error={errors.region} />
              <Select label="Tuman" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Tanlang" options={getDistricts(region).map((d) => ({ value: d.name, label: d.name }))} error={errors.district} disabled={!region} />
            </div>
            <Input label="To‘liq manzil" placeholder="Ko‘cha, uy, xonadon, mo‘ljal" value={address} onChange={(e) => setAddress(e.target.value)} error={errors.address} maxLength={200} icon={<MapPin className="h-4 w-4" />} />
            {region !== master.region && region && (
              <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">Diqqat: usta asosan {master.region} hududida ishlaydi. Yo‘l haqi alohida kelishilishi mumkin.</p>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="space-y-5">
            <h2 className="section-title">Sana va vaqtni tanlang</h2>
            <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
              {days.map((d, i) => (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => { setDay(i); setSlot(""); }}
                  aria-pressed={day === i}
                  className={cn(
                    "flex w-16 shrink-0 flex-col items-center rounded-2xl py-3 transition",
                    day === i ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "bg-surface shadow-[var(--shadow-soft)]",
                  )}
                >
                  <span className={cn("text-xs", day === i ? "text-white/80" : "text-muted")}>{i === 0 && d.toDateString() === new Date().toDateString() ? "Bugun" : weekdayShort(d)}</span>
                  <span className="text-xl font-bold">{d.getDate()}</span>
                  <span className={cn("text-[11px]", day === i ? "text-white/80" : "text-muted")}>{["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"][d.getMonth()]}</span>
                </button>
              ))}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-2">
                Ish vaqti: {master.workStart} – {master.workEnd}
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.map((s) => {
                  const dis = slotDisabled(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={dis}
                      onClick={() => setSlot(s)}
                      aria-pressed={slot === s}
                      className={cn(
                        "rounded-xl py-2.5 text-sm font-semibold transition",
                        slot === s ? "bg-ink text-cream" : "bg-surface shadow-[var(--shadow-soft)]",
                        dis && "cursor-not-allowed opacity-35 line-through",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {slots.every(slotDisabled) && <p className="mt-3 text-sm text-muted">Bu kun uchun bo‘sh vaqt qolmadi — boshqa kunni tanlang.</p>}
              {errors.slot && <p className="mt-2 text-sm font-medium text-danger">{errors.slot}</p>}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-5">
            <h2 className="section-title">Buyurtmani tasdiqlang</h2>
            <div className="card divide-y divide-line">
              {selected.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-4 text-[15px]">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{s.title}</span>
                    <span className="text-sm text-muted">
                      {qty[s.id]} {PRICE_UNIT_LABELS[s.priceUnit as PriceUnit]} × {money(s.price)}
                    </span>
                  </span>
                  <span className="font-bold">{money(s.price * qty[s.id])}</span>
                </div>
              ))}
              <div className="space-y-1 p-4 text-sm">
                <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-500" /> {district}, {address}</p>
                <p className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-brand-500" /> {scheduledAt?.toLocaleDateString("uz-UZ")} · {slot}</p>
                <p className="flex gap-2"><FileText className="h-4 w-4 shrink-0 text-brand-500" /> <span className="line-clamp-2">{description}</span></p>
              </div>
            </div>
            <div>
              <h3 className="mb-2.5 text-[17px] font-bold">To‘lov usuli</h3>
              <PaymentMethods value={method} onChange={setMethod} />
              <p className="mt-2 text-[13px] text-muted">Onlayn to‘lovni usta buyurtmani qabul qilgandan keyin ham amalga oshirishingiz mumkin.</p>
            </div>
          </section>
        )}
      </div>

      {/* Pastki panel: jami va keyingi qadam */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">Taxminiy jami</p>
            <p className="truncate text-xl font-extrabold">{money(total)}</p>
          </div>
          {step < STEPS.length - 1 ? (
            <Button size="lg" onClick={next}>
              Davom etish
            </Button>
          ) : (
            <Button size="lg" onClick={submit} loading={submitting} icon={<Check className="h-5 w-5" />}>
              Buyurtmani yuborish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
