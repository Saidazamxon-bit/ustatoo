"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { ErrorState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md items-center px-4">
      <ErrorState
        title="Nimadir noto‘g‘ri ketdi"
        description="Sahifani yuklashda xatolik yuz berdi. Internet aloqasini tekshirib, qayta urinib ko‘ring."
        action={
          <Button onClick={reset} icon={<RotateCcw className="h-4 w-4" />}>
            Qayta urinish
          </Button>
        }
      />
    </div>
  );
}
