import { PRICE_UNIT_LABELS, type PriceUnit } from "./constants";

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"];
const WEEKDAYS_SHORT = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

/** 150000 -> "150 000 so‘m" */
export function money(value: number, withCurrency = true): string {
  const s = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return withCurrency ? `${s} so‘m` : s;
}

/** Qisqa ko‘rinish: 1 500 000 -> "1,5 mln" */
export function moneyShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1).replace(".", ",")} mln`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} ming`;
  return String(value);
}

export function priceWithUnit(price: number, unit: string): string {
  const label = PRICE_UNIT_LABELS[unit as PriceUnit];
  return unit === "FIXED" || !label ? money(price) : `${money(price)} / ${label}`;
}

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

/**
 * Barcha sana/vaqtlar O‘zbekiston vaqtida (Asia/Tashkent, UTC+5, yozgi vaqt yo‘q) ko‘rsatiladi.
 * Server (UTC) va brauzer bir xil natija beradi — hydration xatosi bo‘lmaydi va
 * foydalanuvchi qaysi qurilmada bo‘lmasin, vaqt to‘g‘ri chiqadi.
 */
export const TZ_OFFSET_MIN = 300;

export function tzParts(d: Date | string) {
  const x = new Date(toDate(d).getTime() + TZ_OFFSET_MIN * 60_000);
  return { year: x.getUTCFullYear(), month: x.getUTCMonth(), day: x.getUTCDate(), hours: x.getUTCHours(), minutes: x.getUTCMinutes(), weekday: x.getUTCDay() };
}

/** Toshkent vaqti bo‘yicha kun boshlanishi */
export function startOfDayTz(d: Date | string = new Date()): Date {
  const p = tzParts(d);
  return new Date(Date.UTC(p.year, p.month, p.day) - TZ_OFFSET_MIN * 60_000);
}

/** Toshkent vaqti bo‘yicha oy boshlanishi (offset — necha oy oldin/keyin) */
export function startOfMonthTz(d: Date | string = new Date(), offset = 0): Date {
  const p = tzParts(d);
  return new Date(Date.UTC(p.year, p.month + offset, 1) - TZ_OFFSET_MIN * 60_000);
}

export function dayKeyTz(d: Date | string): string {
  const p = tzParts(d);
  return `${p.year}-${p.month}-${p.day}`;
}

/** 1 = Dushanba ... 7 = Yakshanba */
export function isoWeekdayTz(d: Date | string): number {
  const w = tzParts(d).weekday;
  return w === 0 ? 7 : w;
}

/** "12 noyabr 2026" */
export function dateLong(d: Date | string): string {
  const x = tzParts(d);
  return `${x.day} ${MONTHS[x.month]} ${x.year}`;
}

/** "12 noy" */
export function dateShort(d: Date | string): string {
  const x = tzParts(d);
  return `${x.day} ${MONTHS_SHORT[x.month]}`;
}

export function time(d: Date | string): string {
  const x = tzParts(d);
  return `${String(x.hours).padStart(2, "0")}:${String(x.minutes).padStart(2, "0")}`;
}

export function dateTime(d: Date | string): string {
  return `${dateShort(d)}, ${time(d)}`;
}

export function weekdayShort(d: Date | string): string {
  return WEEKDAYS_SHORT[tzParts(d).weekday];
}

/** "hozirgina", "5 daqiqa oldin", "kecha" ... */
export function timeAgo(d: Date | string, now: Date = new Date()): string {
  const diff = (now.getTime() - toDate(d).getTime()) / 1000;
  if (diff < 60) return "hozirgina";
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 172800) return "kecha";
  if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`;
  return dateShort(d);
}

/** "+998901234567" -> "+998 90 123 45 67" */
export function phone(p: string): string {
  const digits = p.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return p;
}

/** Foydalanuvchi kiritgan raqamni normallashtiradi: "90 123-45-67" -> "+998901234567" */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 9) digits = "998" + digits;
  if (digits.length !== 12 || !digits.startsWith("998")) return null;
  return "+" + digits;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function plural(n: number, word: string): string {
  return `${n} ta ${word}`;
}

export function experienceLabel(years: number): string {
  return years <= 0 ? "1 yildan kam" : `${years} yil`;
}
