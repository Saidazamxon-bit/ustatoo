import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { UpdateCenter } from "./update-center";

export const metadata: Metadata = {
  title: "Yangilanishlar",
  description: "UstaTop ilovasining joriy versiyasi, yangi imkoniyatlar va yangilanishlar tarixi.",
};

export default function UpdatesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Yangilanishlar" />
      <UpdateCenter />
    </div>
  );
}
