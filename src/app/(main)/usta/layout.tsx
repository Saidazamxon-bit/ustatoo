import { redirect } from "next/navigation";
import { requirePageUser } from "@/server/auth";
import { CabinetNav } from "@/components/cabinet/cabinet-nav";

export default async function MasterCabinetLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("/usta/panel");
  if (!user.master) redirect("/royxatdan-otish?rol=usta");
  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8 lg:pt-8">
      <CabinetNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
