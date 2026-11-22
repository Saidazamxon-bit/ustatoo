import { z } from "zod";
import { COMPLAINT_REASONS, PAYMENT_METHODS, PRICE_UNITS, ROLES } from "./constants";
import { normalizePhone } from "./format";

// Barcha validatsiya xabarlari o‘zbek tilida bo‘lsin
z.setErrorMap((issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === "undefined" || issue.received === "null") return { message: "Bu maydon to‘ldirilishi shart" };
    return { message: "Qiymat turi noto‘g‘ri" };
  }
  if (issue.code === z.ZodIssueCode.invalid_date) return { message: "Sana noto‘g‘ri" };
  if (issue.code === z.ZodIssueCode.invalid_enum_value) return { message: "Ro‘yxatdan tanlang" };
  if (issue.code === z.ZodIssueCode.too_small && issue.type === "string") return { message: `Kamida ${issue.minimum} belgi kiriting` };
  if (issue.code === z.ZodIssueCode.too_big && issue.type === "string") return { message: `Ko‘pi bilan ${issue.maximum} belgi` };
  if (issue.code === z.ZodIssueCode.too_small && issue.type === "number") return { message: `Qiymat kamida ${issue.minimum}` };
  if (issue.code === z.ZodIssueCode.too_big && issue.type === "number") return { message: `Qiymat ko‘pi bilan ${issue.maximum}` };
  return { message: ctx.defaultError };
});

const phoneField = z
  .string({ required_error: "Telefon raqamni kiriting" })
  .transform((v, ctx) => {
    const p = normalizePhone(v);
    if (!p) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefon raqam noto‘g‘ri (+998 XX XXX XX XX)" });
      return z.NEVER;
    }
    return p;
  });

const password = z.string().min(6, "Parol kamida 6 belgidan iborat bo‘lsin").max(100);
const name = z.string().trim().min(2, "Ism kamida 2 harf").max(80, "Ism juda uzun");
const imageUrl = z
  .string()
  .max(500)
  .refine((v) => v.startsWith("/img/") || v.startsWith("/api/files/"), "Rasm manzili noto‘g‘ri");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Vaqt formati HH:MM");

export const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, "Parolni kiriting"),
});

export const registerSchema = z
  .object({
    name,
    phone: phoneField,
    password,
    role: z.enum(["CLIENT", "MASTER"]).default("CLIENT"),
    region: z.string().min(1, "Hududni tanlang"),
    district: z.string().min(1, "Tumanni tanlang"),
    categoryId: z.string().optional(),
    specialty: z.string().trim().max(80).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.role === "MASTER") {
      if (!v.categoryId) ctx.addIssue({ path: ["categoryId"], code: "custom", message: "Kategoriyani tanlang" });
      if (!v.specialty || v.specialty.length < 3)
        ctx.addIssue({ path: ["specialty"], code: "custom", message: "Mutaxassislikni kiriting" });
    }
  });

export const profileSchema = z.object({
  name,
  email: z.string().trim().email("Email noto‘g‘ri").max(120).optional().or(z.literal("")),
  avatar: imageUrl.nullable().optional(),
  region: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
  address: z.string().trim().max(200).optional(),
});

export const settingsSchema = z.object({
  notifyOrders: z.boolean().optional(),
  notifyMessages: z.boolean().optional(),
  notifyPromos: z.boolean().optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parolni kiriting"),
  newPassword: password,
});

export const masterProfileSchema = z
  .object({
    categoryId: z.string().min(1, "Kategoriyani tanlang"),
    specialty: z.string().trim().min(3, "Mutaxassislikni kiriting").max(80),
    bio: z.string().trim().max(2000, "Matn juda uzun"),
    coverImage: imageUrl.nullable().optional(),
    experienceYears: z.coerce.number().int().min(0).max(60),
    hourlyRate: z.coerce.number().int().min(0).max(100_000_000),
    workStart: time,
    workEnd: time,
    workDays: z.array(z.number().int().min(1).max(7)).min(1, "Kamida bitta ish kunini tanlang"),
    isAvailable: z.boolean(),
    region: z.string().min(1, "Hududni tanlang"),
    district: z.string().min(1, "Tumanni tanlang"),
    address: z.string().trim().max(200).optional(),
    publicPhone: z.string().trim().max(30).optional(),
    telegram: z
      .string()
      .trim()
      .max(40)
      .regex(/^@?[a-zA-Z0-9_]{0,32}$/, "Telegram username noto‘g‘ri")
      .optional(),
  })
  .refine((v) => v.workStart < v.workEnd, { path: ["workEnd"], message: "Tugash vaqti boshlanishdan keyin bo‘lsin" });

export const serviceSchema = z.object({
  title: z.string().trim().min(3, "Xizmat nomini kiriting").max(100),
  description: z.string().trim().max(1000).default(""),
  image: imageUrl.nullable().optional(),
  price: z.coerce.number().int().min(1000, "Narx kamida 1 000 so‘m").max(1_000_000_000),
  priceUnit: z.enum(PRICE_UNITS),
  durationText: z.string().trim().min(1, "Taxminiy vaqtni kiriting").max(40),
  isActive: z.boolean().default(true),
  categoryId: z.string().optional(),
});

export const portfolioSchema = z.object({
  image: imageUrl,
  title: z.string().trim().min(2, "Sarlavhani kiriting").max(100),
  description: z.string().trim().max(500).optional(),
});

export const orderCreateSchema = z.object({
  masterId: z.string().min(1),
  items: z
    .array(z.object({ serviceId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(1000) }))
    .min(1, "Kamida bitta xizmatni tanlang"),
  description: z.string().trim().min(10, "Muammoni batafsilroq yozing (kamida 10 belgi)").max(2000),
  images: z.array(imageUrl).max(6, "Ko‘pi bilan 6 ta rasm").default([]),
  region: z.string().min(1, "Hududni tanlang"),
  district: z.string().min(1, "Tumanni tanlang"),
  address: z.string().trim().min(5, "To‘liq manzilni kiriting").max(200),
  scheduledAt: z.coerce.date({ invalid_type_error: "Sana va vaqtni tanlang" }),
  paymentMethod: z.enum(PAYMENT_METHODS).default("CASH"),
});

export const orderActionSchema = z.object({
  action: z.enum(["accept", "decline", "start", "complete", "cancel", "cash_received"]),
  reason: z.string().trim().max(300).optional(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Bahoni tanlang").max(5),
  comment: z.string().trim().min(5, "Sharh kamida 5 belgi").max(1000),
});

export const reviewReplySchema = z.object({ reply: z.string().trim().min(2).max(1000) });

export const messageSchema = z
  .object({
    text: z.string().trim().max(2000).optional(),
    image: imageUrl.optional(),
  })
  .refine((v) => (v.text && v.text.length > 0) || v.image, { message: "Xabar bo‘sh" });

export const complaintSchema = z
  .object({
    reason: z.enum(COMPLAINT_REASONS),
    details: z.string().trim().max(1000).default(""),
    targetUserId: z.string().optional(),
    orderId: z.string().optional(),
    reviewId: z.string().optional(),
  })
  .refine((v) => v.targetUserId || v.orderId || v.reviewId, { message: "Shikoyat obyekti ko‘rsatilmagan" });

export const paymentCreateSchema = z.object({
  orderId: z.string().min(1),
  method: z.enum(PAYMENT_METHODS),
});

export const paymentConfirmSchema = z.object({
  account: z.string().trim().min(4, "Ma’lumotni kiriting").max(40),
  code: z.string().trim().regex(/^\d{6}$/, "SMS kod 6 raqamdan iborat"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug faqat lotin kichik harflar, raqam va '-'")
    .max(60),
  description: z.string().trim().max(300).optional(),
  image: imageUrl,
  icon: z.string().trim().max(40).default("wrench"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export const adminUserUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  role: z.enum(ROLES).optional(),
});

export const verificationDecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().trim().max(300).optional(),
});

export const complaintDecisionSchema = z.object({
  status: z.enum(["RESOLVED", "REJECTED"]),
  adminNote: z.string().trim().max(500).optional(),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type OrderCreateInput = z.input<typeof orderCreateSchema>;
