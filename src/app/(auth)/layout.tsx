import Image from "next/image";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src="/img/covers/gen-electrician.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 p-12 text-white">
          <p className="text-4xl font-bold leading-tight">Ishonchli ustalar —<br />bir necha bosishda</p>
          <p className="mt-3 max-w-md text-white/80">25+ tasdiqlangan usta, 15 yo‘nalish, shaffof narxlar va onlayn to‘lov.</p>
        </div>
      </div>
      <div className="flex flex-col px-5 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">{children}</div>
      </div>
    </div>
  );
}
