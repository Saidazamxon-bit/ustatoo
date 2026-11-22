import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Shaxsiy ma’lumotlar", robots: { index: false } };

export default async function EditProfilePage() {
  const user = await requirePageUser("/profil/tahrirlash");
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Shaxsiy ma’lumotlar" backHref="/profil" />
      <ProfileForm
        initial={{ name: user.name, email: user.email ?? "", avatar: user.avatar, region: user.region ?? "", district: user.district ?? "", address: user.address ?? "" }}
        phone={user.phone}
      />
    </div>
  );
}
