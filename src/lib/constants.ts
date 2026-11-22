// Platformadagi barcha holat va rollar uchun yagona manba.

export const ROLES = ["CLIENT", "MASTER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  CLIENT: "Mijoz",
  MASTER: "Usta",
  ADMIN: "Administrator",
};

export const ORDER_STATUSES = ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Yangi",
  PENDING: "Kutilmoqda",
  ACCEPTED: "Qabul qilindi",
  IN_PROGRESS: "Jarayonda",
  COMPLETED: "Yakunlandi",
  CANCELLED: "Bekor qilindi",
};

export const ORDER_STATUS_HINTS: Record<OrderStatus, string> = {
  NEW: "Buyurtma yuborildi. Usta tez orada ko‘rib chiqadi.",
  PENDING: "Usta buyurtmani ko‘rib chiqmoqda. Javobini kuting.",
  ACCEPTED: "Usta buyurtmani qabul qildi va belgilangan vaqtda keladi.",
  IN_PROGRESS: "Usta ishni bajarmoqda.",
  COMPLETED: "Ish muvaffaqiyatli yakunlandi.",
  CANCELLED: "Buyurtma bekor qilingan.",
};

/** Faol (yakunlanmagan) buyurtma holatlari */
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS"];

export const PAYMENT_METHODS = ["CLICK", "PAYME", "UZCARD", "HUMO", "CASH"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CLICK: "Click",
  PAYME: "Payme",
  UZCARD: "Uzcard",
  HUMO: "Humo",
  CASH: "Naqd pul",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "To‘lanmagan",
  PENDING: "To‘lov kutilmoqda",
  PAID: "To‘langan",
  REFUNDED: "Qaytarilgan",
};

export const PRICE_UNITS = ["FIXED", "HOUR", "M2", "M3", "METER", "UNIT"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  FIXED: "xizmat",
  HOUR: "soat",
  M2: "m²",
  M3: "m³",
  METER: "metr",
  UNIT: "dona",
};

export const VERIFICATION_LABELS: Record<string, string> = {
  NONE: "Tasdiqlanmagan",
  PENDING: "Tekshiruvda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

export const COMPLAINT_REASONS = [
  "Usta kelmadi",
  "Sifatsiz ish",
  "Qo‘pol muomala",
  "Narx kelishilganidan oshirildi",
  "Firibgarlik shubhasi",
  "Haqoratli sharh",
  "Boshqa",
] as const;

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  OPEN: "Ochiq",
  RESOLVED: "Hal qilindi",
  REJECTED: "Rad etildi",
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Eng mashhurlari" },
  { value: "rating", label: "Eng yuqori reyting" },
  { value: "cheap", label: "Eng arzon" },
  { value: "new", label: "Eng yangi" },
  { value: "near", label: "Eng yaqin" },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const WEEKDAYS = [
  { value: 1, short: "Du", label: "Dushanba" },
  { value: 2, short: "Se", label: "Seshanba" },
  { value: 3, short: "Ch", label: "Chorshanba" },
  { value: 4, short: "Pa", label: "Payshanba" },
  { value: 5, short: "Ju", label: "Juma" },
  { value: 6, short: "Sh", label: "Shanba" },
  { value: 7, short: "Ya", label: "Yakshanba" },
] as const;

export const DEFAULT_SETTINGS = {
  platformName: "UstaTop",
  commissionPercent: "10",
  supportPhone: "+998 71 200 00 00",
  supportEmail: "support@ustatop.uz",
  allowMasterSignup: "true",
  paymentsDemo: "true",
  maintenanceMessage: "",
} as const;
export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export const SESSION_COOKIE = "ut_session";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
