import { SORT_OPTIONS, type SortOption } from "@/lib/constants";
import type { MasterFilters } from "./services/masters";

const num = (v?: string) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** URL parametrlari (o‘zbekcha nomlar) -> qidiruv filtrlari. Sahifa va API bir xil ishlatadi. */
export function parseMasterFilters(sp: Record<string, string | string[] | undefined>): MasterFilters {
  const get = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const sort = get("saralash") as SortOption | undefined;
  return {
    q: get("q")?.slice(0, 100),
    category: get("kategoriya"),
    region: get("hudud"),
    district: get("tuman"),
    priceMin: num(get("narxMin")),
    priceMax: num(get("narxMax")),
    rating: num(get("reyting")),
    experience: num(get("tajriba")),
    available: get("hozir") === "1",
    verified: get("tasdiqlangan") === "1",
    sort: SORT_OPTIONS.some((s) => s.value === sort) ? sort : "popular",
    lat: num(get("lat")),
    lng: num(get("lng")),
    page: num(get("sahifa")),
  };
}
