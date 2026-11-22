import { route, ok } from "@/server/errors";
import { searchMasters } from "@/server/services/masters";
import { parseMasterFilters } from "@/server/filters";

export const GET = route(async (req) => {
  const filters = parseMasterFilters(Object.fromEntries(req.nextUrl.searchParams));
  return ok(await searchMasters(filters));
});
