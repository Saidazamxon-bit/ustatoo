import { Skeleton } from "@/components/ui/misc";

/** Sahifalar yuklanayotganda ko‘rsatiladigan skeleton */
export default function Loading() {
  return (
    <div className="space-y-6 pt-6 lg:pt-10" aria-busy="true" aria-label="Yuklanmoqda">
      <div className="flex items-center justify-between">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <Skeleton className="h-14 w-full rounded-full" />
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    </div>
  );
}
