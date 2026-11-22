import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { MasterProfileForm } from "./master-profile-form";
import { VerificationCard } from "@/components/cabinet/verification-card";

export const metadata: Metadata = { title: "Usta profilini tahrirlash", robots: { index: false } };

export default async function MasterProfileEditPage({ searchParams }: { searchParams: Promise<{ yangi?: string }> }) {
  const { yangi } = await searchParams;
  const user = await requirePageUser("/usta/profil", ["MASTER"]);
  const [m, categories] = await Promise.all([
    db.masterProfile.findUniqueOrThrow({ where: { id: user.master!.id } }),
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div className="space-y-5 pt-4 lg:pt-0">
      <h1 className="text-[26px] font-bold tracking-tight">Profilni tahrirlash</h1>
      {yangi && <div className="rounded-[1.5rem] bg-brand-50 p-4 text-[15px] font-semibold text-brand-800">Xush kelibsiz! Profilingizni to‘ldiring, xizmatlar qo‘shing va tasdiqlash uchun ariza yuboring.</div>}
      <VerificationCard status={m.verification} note={m.verificationNote} />
      <MasterProfileForm
        categories={categories}
        initial={{
          avatar: user.avatar,
          coverImage: m.coverImage,
          categoryId: m.categoryId,
          specialty: m.specialty,
          bio: m.bio,
          experienceYears: m.experienceYears,
          hourlyRate: m.hourlyRate,
          workStart: m.workStart,
          workEnd: m.workEnd,
          workDays: m.workDays.split(",").map(Number),
          isAvailable: m.isAvailable,
          region: m.region,
          district: m.district,
          address: m.address ?? "",
          publicPhone: m.publicPhone ?? "",
          telegram: m.telegram ?? "",
        }}
        name={user.name}
      />
    </div>
  );
}
