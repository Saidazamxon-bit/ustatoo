import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark size={48} />
      <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-500">
        <SearchX className="h-9 w-9" />
      </div>
      <h1 className="mt-5 text-3xl font-bold">Sahifa topilmadi</h1>
      <p className="mt-2 max-w-sm text-muted">Siz qidirgan sahifa mavjud emas yoki o‘chirilgan bo‘lishi mumkin.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className={buttonClass("primary")}>Bosh sahifa</Link>
        <Link href="/kategoriyalar" className={buttonClass("secondary")}>Kategoriyalar</Link>
      </div>
    </div>
  );
}
