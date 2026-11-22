// O‘zbekiston hududlari va tumanlari (taxminiy markaz koordinatalari bilan).
// "Eng yaqin" saralash va "Yaqin atrofdagi ustalar" uchun ishlatiladi.

export type District = { name: string; lat: number; lng: number };
export type Region = { name: string; lat: number; lng: number; districts: District[] };

export const REGIONS: Region[] = [
  {
    name: "Toshkent shahri",
    lat: 41.3111,
    lng: 69.2797,
    districts: [
      { name: "Yunusobod", lat: 41.3667, lng: 69.2883 },
      { name: "Chilonzor", lat: 41.2756, lng: 69.2034 },
      { name: "Mirzo Ulug‘bek", lat: 41.3383, lng: 69.3347 },
      { name: "Yakkasaroy", lat: 41.2861, lng: 69.2617 },
      { name: "Shayxontohur", lat: 41.3256, lng: 69.2394 },
      { name: "Olmazor", lat: 41.3506, lng: 69.2183 },
      { name: "Mirobod", lat: 41.2917, lng: 69.2869 },
      { name: "Sergeli", lat: 41.2256, lng: 69.2203 },
      { name: "Uchtepa", lat: 41.2917, lng: 69.1747 },
      { name: "Yashnobod", lat: 41.3006, lng: 69.3506 },
      { name: "Bektemir", lat: 41.2394, lng: 69.3361 },
      { name: "Yangihayot", lat: 41.2006, lng: 69.2425 },
    ],
  },
  {
    name: "Toshkent viloyati",
    lat: 41.0,
    lng: 69.6,
    districts: [
      { name: "Chirchiq", lat: 41.4689, lng: 69.5822 },
      { name: "Olmaliq", lat: 40.8447, lng: 69.5981 },
      { name: "Angren", lat: 41.0167, lng: 70.1436 },
      { name: "Zangiota", lat: 41.1944, lng: 69.1472 },
      { name: "Qibray", lat: 41.3897, lng: 69.4650 },
    ],
  },
  {
    name: "Samarqand viloyati",
    lat: 39.6542,
    lng: 66.9597,
    districts: [
      { name: "Samarqand shahri", lat: 39.6542, lng: 66.9597 },
      { name: "Kattaqo‘rg‘on", lat: 39.8989, lng: 66.2561 },
      { name: "Urgut", lat: 39.4022, lng: 67.2431 },
      { name: "Pastdarg‘om", lat: 39.7100, lng: 66.6800 },
    ],
  },
  {
    name: "Buxoro viloyati",
    lat: 39.7747,
    lng: 64.4286,
    districts: [
      { name: "Buxoro shahri", lat: 39.7747, lng: 64.4286 },
      { name: "Kogon", lat: 39.7228, lng: 64.5517 },
      { name: "G‘ijduvon", lat: 40.1000, lng: 64.6833 },
    ],
  },
  {
    name: "Andijon viloyati",
    lat: 40.7821,
    lng: 72.3442,
    districts: [
      { name: "Andijon shahri", lat: 40.7821, lng: 72.3442 },
      { name: "Asaka", lat: 40.6414, lng: 72.2389 },
      { name: "Xonobod", lat: 40.8044, lng: 73.0050 },
    ],
  },
  {
    name: "Farg‘ona viloyati",
    lat: 40.3864,
    lng: 71.7864,
    districts: [
      { name: "Farg‘ona shahri", lat: 40.3864, lng: 71.7864 },
      { name: "Marg‘ilon", lat: 40.4711, lng: 71.7247 },
      { name: "Qo‘qon", lat: 40.5286, lng: 70.9425 },
    ],
  },
  {
    name: "Namangan viloyati",
    lat: 40.9983,
    lng: 71.6726,
    districts: [
      { name: "Namangan shahri", lat: 40.9983, lng: 71.6726 },
      { name: "Chust", lat: 41.0036, lng: 71.2372 },
      { name: "Kosonsoy", lat: 41.2550, lng: 71.5461 },
    ],
  },
  {
    name: "Qashqadaryo viloyati",
    lat: 38.8606,
    lng: 65.7891,
    districts: [
      { name: "Qarshi shahri", lat: 38.8606, lng: 65.7891 },
      { name: "Shahrisabz", lat: 39.0578, lng: 66.8342 },
    ],
  },
  {
    name: "Surxondaryo viloyati",
    lat: 37.2242,
    lng: 67.2783,
    districts: [
      { name: "Termiz shahri", lat: 37.2242, lng: 67.2783 },
      { name: "Denov", lat: 38.2667, lng: 67.9000 },
    ],
  },
  {
    name: "Xorazm viloyati",
    lat: 41.5500,
    lng: 60.6333,
    districts: [
      { name: "Urganch shahri", lat: 41.5500, lng: 60.6333 },
      { name: "Xiva", lat: 41.3783, lng: 60.3639 },
    ],
  },
  {
    name: "Navoiy viloyati",
    lat: 40.0844,
    lng: 65.3792,
    districts: [
      { name: "Navoiy shahri", lat: 40.0844, lng: 65.3792 },
      { name: "Zarafshon", lat: 41.5744, lng: 64.2003 },
    ],
  },
  {
    name: "Jizzax viloyati",
    lat: 40.1158,
    lng: 67.8422,
    districts: [{ name: "Jizzax shahri", lat: 40.1158, lng: 67.8422 }],
  },
  {
    name: "Sirdaryo viloyati",
    lat: 40.4897,
    lng: 68.7842,
    districts: [
      { name: "Guliston shahri", lat: 40.4897, lng: 68.7842 },
      { name: "Yangiyer", lat: 40.2750, lng: 68.8225 },
    ],
  },
  {
    name: "Qoraqalpog‘iston Respublikasi",
    lat: 42.4600,
    lng: 59.6100,
    districts: [
      { name: "Nukus shahri", lat: 42.4600, lng: 59.6100 },
      { name: "Xo‘jayli", lat: 42.4042, lng: 59.4517 },
    ],
  },
];

export const REGION_NAMES = REGIONS.map((r) => r.name);

export function getDistricts(region?: string | null): District[] {
  return REGIONS.find((r) => r.name === region)?.districts ?? [];
}

export function isValidLocation(region: string, district: string): boolean {
  return getDistricts(region).some((d) => d.name === district);
}

/** Hudud/tuman bo‘yicha taxminiy koordinata */
export function locate(region?: string | null, district?: string | null): { lat: number; lng: number } {
  const r = REGIONS.find((x) => x.name === region) ?? REGIONS[0];
  const d = r.districts.find((x) => x.name === district);
  return d ? { lat: d.lat, lng: d.lng } : { lat: r.lat, lng: r.lng };
}

/** Ikki nuqta orasidagi masofa (km), Haversine formulasi */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
