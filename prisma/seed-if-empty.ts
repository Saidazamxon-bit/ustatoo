// Deploy paytida ishlaydi: baza bo‘sh bo‘lsa (yangi Neon baza), demo ma'lumotlarni yuklaydi.
// Mavjud ma'lumotlarga tegmaydi.
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const count = await db.category.count();
  await db.$disconnect();
  if (count > 0) {
    console.log(`ℹ️  Bazada ${count} ta kategoriya bor — seed o‘tkazib yuborildi.`);
    return;
  }
  console.log("🌱 Baza bo‘sh — demo ma'lumotlar yuklanmoqda...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
