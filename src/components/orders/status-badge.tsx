import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  NEW: "bg-blue-50 text-blue-700",
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-brand-100 text-brand-700",
  IN_PROGRESS: "bg-violet-50 text-violet-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const DOT: Record<OrderStatus, string> = {
  NEW: "bg-blue-500",
  PENDING: "bg-amber-500",
  ACCEPTED: "bg-brand-500",
  IN_PROGRESS: "bg-violet-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = status as OrderStatus;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", STYLES[s], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[s])} />
      {ORDER_STATUS_LABELS[s] ?? status}
    </span>
  );
}
