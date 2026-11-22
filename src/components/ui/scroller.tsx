import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Gorizontal aylantiriladigan qator (mobil) — ekran chetigacha cho‘ziladi */
export function Scroller({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-px-4 px-4 pb-3 pt-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0", className)}>
      {children}
    </div>
  );
}
