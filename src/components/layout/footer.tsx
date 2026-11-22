import Link from "next/link";
import { Logo } from "./logo";
import type { Settings } from "@/server/settings";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-10 hidden border-t border-line bg-white/60 lg:block">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-8 px-8 py-12 text-sm">
        <div className="space-y-3">
          <Logo />
          <p className="text-muted">Ishonchli ustalar va xizmatlar — bir joyda. Toping, solishtiring, buyurtma bering.</p>
        </div>
        <div className="space-y-2">
          <p className="font-bold">Mijozlar uchun</p>
          <Link className="block text-muted hover:text-brand-600" href="/kategoriyalar">Kategoriyalar</Link>
          <Link className="block text-muted hover:text-brand-600" href="/qidiruv?saralash=rating">Eng yaxshi ustalar</Link>
          <Link className="block text-muted hover:text-brand-600" href="/buyurtmalar">Buyurtmalarim</Link>
        </div>
        <div className="space-y-2">
          <p className="font-bold">Ustalar uchun</p>
          <Link className="block text-muted hover:text-brand-600" href="/royxatdan-otish?rol=usta">Usta bo‘lib qo‘shilish</Link>
          <Link className="block text-muted hover:text-brand-600" href="/usta/panel">Usta paneli</Link>
        </div>
        <div className="space-y-2">
          <p className="font-bold">Aloqa</p>
          <a className="block text-muted hover:text-brand-600" href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}>{settings.supportPhone}</a>
          <a className="block text-muted hover:text-brand-600" href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
          <p className="pt-2 text-xs text-muted">© {new Date().getFullYear()} {settings.platformName}</p>
        </div>
      </div>
    </footer>
  );
}
