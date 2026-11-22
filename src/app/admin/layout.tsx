import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = { title: { default: "Admin panel", template: "%s | UstaTop Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePageUser("/admin", ["ADMIN"]);
  const [pending, complaints] = await Promise.all([
    db.masterProfile.count({ where: { verification: "PENDING" } }),
    db.complaint.count({ where: { status: "OPEN" } }),
  ]);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[270px_1fr]">
      <AdminNav badges={{ pending, complaints }} />
      <main className="min-w-0 px-4 pb-16 pt-2 sm:px-6 lg:px-10 lg:pt-8">
        <Suspense>{children}</Suspense>
      </main>
    </div>
  );
}
