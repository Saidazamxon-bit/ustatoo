import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { normalizeSearch } from "@/lib/text";
import { distanceKm, locate } from "@/lib/regions";
import type { SortOption } from "@/lib/constants";

/** Usta kartalari uchun minimal ma'lumotlar to‘plami */
export const masterCardSelect = {
  id: true,
  specialty: true,
  coverImage: true,
  experienceYears: true,
  hourlyRate: true,
  priceFrom: true,
  isAvailable: true,
  verification: true,
  region: true,
  district: true,
  lat: true,
  lng: true,
  rating: true,
  reviewCount: true,
  completedJobs: true,
  createdAt: true,
  user: { select: { id: true, name: true, avatar: true } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.MasterProfileSelect;

export type MasterCardData = Prisma.MasterProfileGetPayload<{ select: typeof masterCardSelect }> & {
  distanceKm?: number;
};

const activeMaster: Prisma.MasterProfileWhereInput = {
  user: { status: "ACTIVE" },
};

export type MasterFilters = {
  q?: string;
  category?: string;
  region?: string;
  district?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  experience?: number;
  available?: boolean;
  verified?: boolean;
  sort?: SortOption;
  lat?: number;
  lng?: number;
  page?: number;
  pageSize?: number;
};

export function buildMasterWhere(f: MasterFilters): Prisma.MasterProfileWhereInput {
  const and: Prisma.MasterProfileWhereInput[] = [activeMaster];
  if (f.q) {
    for (const token of normalizeSearch(f.q).split(" ").filter((t) => t.length > 1).slice(0, 5)) {
      and.push({ searchText: { contains: token } });
    }
  }
  if (f.category) and.push({ category: { slug: f.category } });
  if (f.region) and.push({ region: f.region });
  if (f.district) and.push({ district: f.district });
  if (f.priceMin) and.push({ priceFrom: { gte: f.priceMin } });
  if (f.priceMax) and.push({ priceFrom: { lte: f.priceMax } });
  if (f.rating) and.push({ rating: { gte: f.rating } });
  if (f.experience) and.push({ experienceYears: { gte: f.experience } });
  if (f.available) and.push({ isAvailable: true });
  if (f.verified) and.push({ verification: "APPROVED" });
  return { AND: and };
}

const ORDER_BY: Record<Exclude<SortOption, "near">, Prisma.MasterProfileOrderByWithRelationInput[]> = {
  popular: [{ popularity: "desc" }, { rating: "desc" }],
  rating: [{ rating: "desc" }, { reviewCount: "desc" }],
  cheap: [{ priceFrom: "asc" }, { rating: "desc" }],
  new: [{ createdAt: "desc" }],
};

export async function searchMasters(f: MasterFilters) {
  const where = buildMasterWhere(f);
  const pageSize = Math.min(f.pageSize ?? 12, 48);
  const page = Math.max(1, f.page ?? 1);
  const sort = f.sort ?? "popular";

  if (sort === "near") {
    const origin = f.lat && f.lng ? { lat: f.lat, lng: f.lng } : locate(f.region, f.district);
    const all = await db.masterProfile.findMany({ where, select: masterCardSelect, take: 500 });
    const withDist = all
      .map((m) => ({
        ...m,
        distanceKm: distanceKm(origin, m.lat && m.lng ? { lat: m.lat, lng: m.lng } : locate(m.region, m.district)),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
    return {
      items: withDist.slice((page - 1) * pageSize, page * pageSize) as MasterCardData[],
      total: withDist.length,
      page,
      pageSize,
    };
  }

  const [items, total] = await Promise.all([
    db.masterProfile.findMany({
      where,
      select: masterCardSelect,
      orderBy: ORDER_BY[sort],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.masterProfile.count({ where }),
  ]);
  return { items: items as MasterCardData[], total, page, pageSize };
}

export async function searchServices(q: string, take = 6) {
  const tokens = normalizeSearch(q).split(" ").filter((t) => t.length > 1).slice(0, 5);
  if (!tokens.length) return [];
  const services = await db.service.findMany({
    where: { isActive: true, master: activeMaster },
    select: serviceCardSelect,
    take: 200,
  });
  return services
    .filter((s) => {
      const hay = normalizeSearch(`${s.title} ${s.description} ${s.category.name}`);
      return tokens.every((t) => hay.includes(t));
    })
    .slice(0, take);
}

export const serviceCardSelect = {
  id: true,
  title: true,
  description: true,
  image: true,
  price: true,
  priceUnit: true,
  durationText: true,
  isActive: true,
  category: { select: { name: true, slug: true, image: true } },
  master: {
    select: { id: true, rating: true, reviewCount: true, verification: true, user: { select: { name: true, avatar: true } } },
  },
} satisfies Prisma.ServiceSelect;

export type ServiceCardData = Prisma.ServiceGetPayload<{ select: typeof serviceCardSelect }>;

export async function getHomeData(user?: { region: string | null; district: string | null } | null) {
  const region = user?.region || "Toshkent shahri";
  const district = user?.district || undefined;
  const near = locate(region, district);

  const [categories, popular, topRated, newest, services, nearbyPool] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true, image: true, _count: { select: { masters: true } } },
    }),
    db.masterProfile.findMany({ where: activeMaster, select: masterCardSelect, orderBy: ORDER_BY.popular, take: 8 }),
    db.masterProfile.findMany({
      where: { ...activeMaster, reviewCount: { gte: 1 } },
      select: masterCardSelect,
      orderBy: ORDER_BY.rating,
      take: 8,
    }),
    db.masterProfile.findMany({ where: activeMaster, select: masterCardSelect, orderBy: ORDER_BY.new, take: 8 }),
    db.service.findMany({
      where: { isActive: true, master: { ...activeMaster, verification: "APPROVED" } },
      select: serviceCardSelect,
      orderBy: [{ master: { rating: "desc" } }, { createdAt: "desc" }],
      take: 24,
    }),
    db.masterProfile.findMany({ where: { ...activeMaster, region }, select: masterCardSelect, take: 100 }),
  ]);

  // Har bir ustadan bittadan xizmat — tavsiyalar xilma-xil bo‘lsin
  const seen = new Set<string>();
  const recommended = services.filter((s) => (seen.has(s.master.id) ? false : (seen.add(s.master.id), true))).slice(0, 8);

  const nearby = nearbyPool
    .map((m) => ({ ...m, distanceKm: distanceKm(near, m.lat && m.lng ? { lat: m.lat, lng: m.lng } : locate(m.region, m.district)) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 8);

  return { categories, popular, topRated, newest, recommended, nearby, region };
}

export async function getMasterProfile(id: string) {
  return db.masterProfile.findFirst({
    where: { id, user: { status: "ACTIVE" } },
    include: {
      user: { select: { id: true, name: true, avatar: true, phone: true, createdAt: true, lastSeenAt: true } },
      category: true,
      services: { where: { isActive: true }, orderBy: { price: "asc" } },
      portfolio: { orderBy: { createdAt: "desc" } },
      reviews: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { client: { select: { id: true, name: true, avatar: true } } },
      },
    },
  });
}

export async function getSimilarMasters(categoryId: string, excludeId: string) {
  return db.masterProfile.findMany({
    where: { ...activeMaster, categoryId, id: { not: excludeId } },
    select: masterCardSelect,
    orderBy: ORDER_BY.rating,
    take: 8,
  });
}

/** Qidiruv indeksi va "narx dan" qiymatini yangilaydi. Profil yoki xizmatlar o‘zgarganda chaqiriladi. */
export async function refreshMasterIndex(masterId: string) {
  const m = await db.masterProfile.findUnique({
    where: { id: masterId },
    include: {
      user: { select: { name: true } },
      category: { select: { name: true } },
      services: { where: { isActive: true }, select: { title: true, price: true } },
    },
  });
  if (!m) return;
  const searchText = normalizeSearch(
    [m.user.name, m.specialty, m.category.name, m.region, m.district, ...m.services.map((s) => s.title), m.bio.slice(0, 300)].join(" "),
  );
  const prices = m.services.map((s) => s.price);
  const priceFrom = prices.length ? Math.min(...prices) : m.hourlyRate;
  await db.masterProfile.update({ where: { id: masterId }, data: { searchText, priceFrom } });
}

export async function recomputeRating(masterId: string) {
  const agg = await db.review.aggregate({
    where: { masterId, status: "VISIBLE" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await db.masterProfile.update({
    where: { id: masterId },
    data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10, reviewCount: agg._count._all },
  });
}
