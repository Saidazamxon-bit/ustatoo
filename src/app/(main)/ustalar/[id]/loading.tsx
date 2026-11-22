import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div aria-busy="true">
      <Skeleton className="-mx-4 h-[52dvh] max-h-[480px] min-h-[340px] rounded-none sm:-mx-6 lg:mx-0 lg:mt-6 lg:rounded-[2rem]" />
      <div className="-mt-6 space-y-4">
        <Skeleton className="relative h-48 rounded-[1.5rem]" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  );
}
