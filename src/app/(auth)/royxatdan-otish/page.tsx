import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/server/auth";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Ro‘yxatdan o‘tish", description: "UstaTop’da mijoz yoki usta sifatida ro‘yxatdan o‘ting." };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");
  const [categories, settings] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    getSettings(),
  ]);
  return (
    <Suspense>
      <RegisterForm categories={categories} allowMaster={settings.allowMasterSignup === "true"} />
    </Suspense>
  );
}
