"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { IconCircle } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Referensdagi kabi: chapda orqaga tugmasi, markazda sarlavha, o‘ngda amal */
export function PageHeader({
  title,
  back = true,
  backHref,
  action,
  className,
  subtitle,
}: {
  title: string;
  back?: boolean;
  backHref?: string;
  action?: ReactNode;
  className?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const goBack = () => {
    if (backHref) router.push(backHref);
    else if (window.history.length > 1) router.back();
    else router.push("/");
  };
  return (
    <header className={cn("flex items-center gap-3 pb-4 pt-[max(1rem,env(safe-area-inset-top))] lg:pt-8", className)}>
      {back ? (
        <IconCircle label="Orqaga" onClick={goBack}>
          <ChevronLeft className="h-5 w-5" />
        </IconCircle>
      ) : (
        <span className="w-11 lg:hidden" />
      )}
      <div className={cn("min-w-0 flex-1 text-center", !back && "lg:text-left")}>
        <h1 className="truncate text-[22px] font-bold tracking-tight lg:text-[28px]">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex w-11 justify-end">{action}</div>
    </header>
  );
}
