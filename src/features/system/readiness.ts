import { createClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { siteConfig } from "@/config/site";

export type ReadinessCheck = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ProductionReadiness = {
  ready: boolean;
  checks: ReadinessCheck[];
  releaseMarker: string | null;
};

function siteUrlCheck() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  let ok = false;
  try {
    const url = new URL(raw);
    ok = url.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    ok = false;
  }
  return { raw, ok };
}

export async function getProductionReadiness(): Promise<ProductionReadiness> {
  const checks: ReadinessCheck[] = [];
  const supabaseEnv = getSupabasePublicEnv();
  const site = siteUrlCheck();

  checks.push({
    key: "site_url",
    label: "Production URL",
    ok: site.ok,
    detail: site.ok ? site.raw : "NEXT_PUBLIC_SITE_URL phải là HTTPS production URL.",
  });

  checks.push({
    key: "supabase_env",
    label: "Supabase public environment",
    ok: Boolean(supabaseEnv),
    detail: supabaseEnv ? "Đã cấu hình URL + publishable/anon key." : "Thiếu Supabase public environment variables.",
  });

  let databaseOk = false;
  let releaseMarker: string | null = null;
  if (supabaseEnv) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", ["app_release", "require_login_for_checkout"]);

      databaseOk = !error;
      const marker = data?.find((row) => row.key === "app_release")?.value;
      releaseMarker = typeof marker === "string" ? marker : null;
    } catch {
      databaseOk = false;
    }
  }

  checks.push({
    key: "database",
    label: "Database connectivity",
    ok: databaseOk,
    detail: databaseOk ? "Data API/RLS query thành công." : "Không truy vấn được site_settings.",
  });

  checks.push({
    key: "release_marker",
    label: "Database release marker",
    ok: releaseMarker === siteConfig.version,
    detail: releaseMarker ? `DB: V${releaseMarker} • App: V${siteConfig.version}` : "Chưa có app_release; cần chạy migration 010.",
  });

  checks.push({
    key: "node_env",
    label: "Runtime mode",
    ok: process.env.NODE_ENV === "production",
    detail: `NODE_ENV=${process.env.NODE_ENV || "unset"}`,
  });

  return {
    ready: checks.every((check) => check.ok),
    checks,
    releaseMarker,
  };
}
