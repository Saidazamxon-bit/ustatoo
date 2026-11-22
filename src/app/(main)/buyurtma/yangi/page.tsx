import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { requirePageUser } from "@/server/auth";
import { OrderWizard } from "./order-wizard";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Buyurtma berish", robots: { index: false } };

type Props = { searchParams: Promise<{ usta?: string; xizmatlar?: string }> };

export default async function NewOrderPage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await requirePageUser(`/buyurtma/yangi?usta=${sp.usta ?? ""}&xizmatlar=${sp.xizmatlar ?? ""}`);
  if (!sp.usta) notFound();
  const master = await db.masterProfile.findFirst({
    where: { id: sp.usta, user: { status: "ACTIVE" } },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      category: { select: { image: true } },
      services: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
  });
  if (!master) notFound();
  if (master.userId === user.id) {
    return (
      <div>
        <PageHeader title="Buyurtma berish" />
        <EmptyState title="O‘zingizga buyurtma bera olmaysiz" description="Bu sizning usta profilingiz." action={<ButtonLink href="/usta/panel">Usta paneli</ButtonLink>} />
      </div>
    );
  }
  const preselected = (sp.xizmatlar ?? "").split(",").filter((id) => master.services.some((s) => s.id === id));
  return (
    <OrderWizard
      master={{
        id: master.id,
        name: master.user.name,
        avatar: master.user.avatar,
        specialty: master.specialty,
        rating: master.rating,
        reviewCount: master.reviewCount,
        cover: master.coverImage ?? master.category.image,
        workStart: master.workStart,
        workEnd: master.workEnd,
        workDays: master.workDays.split(",").map(Number),
        region: master.region,
      }}
      services={master.services.map((s) => ({ id: s.id, title: s.title, price: s.price, priceUnit: s.priceUnit, durationText: s.durationText, image: s.image ?? master.category.image }))}
      preselected={preselected}
      defaults={{ region: user.region ?? master.region, district: user.district ?? "", address: user.address ?? "" }}
    />
  );
}
