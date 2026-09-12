import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function requireUser(next = "/account") {
  if (!isSupabaseConfigured()) {
    redirect(`/login?error=supabase_not_configured&next=${encodeURIComponent(next)}`);
  }

  const current = await getCurrentUser();
  if (!current) {
    redirect(`/login?error=session_required&next=${encodeURIComponent(next)}`);
    throw new Error("Unreachable after redirect");
  }

  return current;
}
