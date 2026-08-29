import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getOrderCaptureKpis() {
  if (!isSupabaseConfigured()) return { total: 0, fresh: 0 };
  const supabase = await createClient();
  const [{ count: total }, { count: fresh }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "NEW"),
  ]);
  return { total: total ?? 0, fresh: fresh ?? 0 };
}
