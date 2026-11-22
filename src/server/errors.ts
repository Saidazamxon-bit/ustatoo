import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const badRequest = (m: string, f?: Record<string, string>) => new HttpError(400, m, f);
export const unauthorized = (m = "Tizimga kiring") => new HttpError(401, m);
export const forbidden = (m = "Bu amal uchun ruxsat yo‘q") => new HttpError(403, m);
export const notFound = (m = "Ma’lumot topilmadi") => new HttpError(404, m);
export const conflict = (m: string) => new HttpError(409, m);

export function zodFields(err: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

type Ctx<P> = { params: Promise<P> };
type Handler<P> = (req: NextRequest, ctx: Ctx<P>) => Promise<Response>;

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * API route uchun o‘rovchi: xatoliklarni yagona JSON formatga keltiradi
 * va o‘zgartiruvchi so‘rovlarda Origin tekshiruvi (CSRF himoyasi) qiladi.
 */
export function route<P = Record<string, string>>(handler: Handler<P>): Handler<P> {
  return async (req, ctx) => {
    try {
      if (MUTATING.has(req.method)) {
        const origin = req.headers.get("origin");
        const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
        if (origin && host && new URL(origin).host !== host) {
          throw forbidden("So‘rov manbasi tasdiqlanmadi");
        }
      }
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: { message: err.message, fields: err.fields } }, { status: err.status });
      }
      if (err instanceof ZodError) {
        const fields = zodFields(err);
        return NextResponse.json(
          { error: { message: Object.values(fields)[0] ?? "Ma’lumotlar noto‘g‘ri", fields } },
          { status: 422 },
        );
      }
      console.error("[api]", req.method, req.nextUrl.pathname, err);
      return NextResponse.json({ error: { message: "Serverda xatolik yuz berdi. Keyinroq urinib ko‘ring." } }, { status: 500 });
    }
  };
}

export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw badRequest("So‘rov tanasi noto‘g‘ri (JSON kutilgan)");
  }
}
