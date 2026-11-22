"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { Toggle } from "@/components/ui/form";

export function AvailabilityToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const toast = useToast();
  return (
    <Toggle
      label={on ? "Hozir ishlayapman" : "Hozir bandman"}
      description={on ? "Mijozlar sizni “Hozir ishlayotgan” filtrida ko‘radi" : "Profilingiz “Band” deb ko‘rsatiladi"}
      checked={on}
      onChange={async (v) => {
        setOn(v);
        try {
          await api.post("/api/master/profile", { isAvailable: v });
          toast.success(v ? "Siz endi faolsiz" : "Holat: band");
        } catch (e) {
          setOn(!v);
          toast.error((e as Error).message);
        }
      }}
    />
  );
}
