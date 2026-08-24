import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";

export function createClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error("Supabase chưa được cấu hình. Hãy kiểm tra .env.local.");
  }
  return createBrowserClient(env.url, env.key);
}
