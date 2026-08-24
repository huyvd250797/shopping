"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function updateMyProfile(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName) redirect("/account?error=full_name_required");
  if (fullName.length > 120 || phone.length > 30) redirect("/account?error=invalid_profile");
  if (!isSupabaseConfigured()) redirect("/account?error=supabase_not_configured");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=session_required&next=/account");

  const { error } = await supabase.rpc("update_my_profile", {
    p_full_name: fullName,
    p_phone: phone || null,
  });

  if (error) redirect("/account?error=profile_update_failed");
  redirect("/account?message=profile_updated");
}
