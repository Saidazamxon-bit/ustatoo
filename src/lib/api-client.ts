"use client";

// Brauzer tomonidagi API chaqiruvlari uchun yagona qatlam.
// Server javobi: { data } yoki { error: { message, fields? } }

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(message: string, status: number, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError("Internet aloqasi yo‘q. Qayta urinib ko‘ring.", 0);
  }
  let json: { data?: T; error?: { message: string; fields?: Record<string, string> } } = {};
  try {
    json = await res.json();
  } catch {
    /* bo‘sh javob */
  }
  if (!res.ok) {
    throw new ApiError(json.error?.message || "Kutilmagan xatolik yuz berdi", res.status, json.error?.fields);
  }
  return json.data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  patch: <T>(url: string, body?: unknown) => request<T>("PATCH", url, body ?? {}),
  put: <T>(url: string, body?: unknown) => request<T>("PUT", url, body ?? {}),
  delete: <T>(url: string) => request<T>("DELETE", url),
};

/** Rasmni yuklaydi va uning URL manzilini qaytaradi */
export async function uploadImage(file: File, kind = "general"): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await api.post<{ url: string }>("/api/uploads", fd);
  return res.url;
}
