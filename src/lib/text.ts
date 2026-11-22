/**
 * Qidiruv uchun matnni normallashtirish: kichik harf, o‘zbekcha apostrof
 * variantlari (‘ ’ ʻ ʼ ` ') yagona belgiga keltiriladi, ortiqcha bo‘shliqlar olinadi.
 * "Bo‘yoqchi" va "bo'yoqchi" bir xil natija beradi.
 */
export function normalizeSearch(input: string): string {
  return input
    .toLowerCase()
    .replace(/[‘’ʻʼ`´']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

export function slugify(s: string): string {
  return normalizeSearch(s)
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
