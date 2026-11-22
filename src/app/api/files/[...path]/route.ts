import { NextResponse, type NextRequest } from "next/server";
import { storage, MIME_BY_EXT } from "@/server/storage";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const key = path.join("/");
  if (!/^[\w/.-]+$/.test(key) || key.includes("..")) return new NextResponse("Not found", { status: 404 });
  const data = await storage.read(key);
  if (!data) return new NextResponse("Not found", { status: 404 });
  const ext = key.split(".").pop() ?? "";
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
