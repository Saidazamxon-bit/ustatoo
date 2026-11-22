import { NextResponse } from "next/server";
import { APP_VERSION, BUILD_ID, BUILD_TIME } from "@/lib/version";

export const dynamic = "force-dynamic";

/** Serverdagi joriy versiya — "Yangilanishlar markazi" mijozdagi versiya bilan solishtiradi */
export function GET() {
  return NextResponse.json(
    { data: { version: APP_VERSION, buildId: BUILD_ID, builtAt: BUILD_TIME } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
