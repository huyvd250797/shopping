import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { getProductionReadiness } from "@/features/system/readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await getProductionReadiness();
  const status = readiness.ready ? 200 : 503;

  return NextResponse.json(
    {
      status: readiness.ready ? "ok" : "degraded",
      app: "myshop",
      version: siteConfig.version,
      timestamp: new Date().toISOString(),
      checks: readiness.checks.map(({ key, ok }) => ({ key, ok })),
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
