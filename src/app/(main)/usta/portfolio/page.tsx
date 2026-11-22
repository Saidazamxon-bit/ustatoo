import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { PortfolioManager } from "./portfolio-manager";

export const metadata: Metadata = { title: "Portfolio", robots: { index: false } };

export default async function MasterPortfolioPage() {
  const user = await requirePageUser("/usta/portfolio", ["MASTER"]);
  const items = await db.portfolioItem.findMany({ where: { masterId: user.master!.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-5 pt-4 lg:pt-0">
      <PortfolioManager initial={items.map((p) => ({ id: p.id, image: p.image, title: p.title, description: p.description }))} />
    </div>
  );
}
