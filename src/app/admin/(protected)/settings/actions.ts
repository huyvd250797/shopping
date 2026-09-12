"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function updateCheckoutPolicyAction(formData: FormData) {
  const { user } = await requireAdmin();
  const raw = String(formData.get("require_login_for_checkout") ?? "false");
  const requireLogin = raw === "true";
  const supabase = await createClient();

  const { error } = await supabase.from("site_settings").upsert({
    key: "require_login_for_checkout",
    value: requireLogin,
    is_public: true,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (error) redirect("/admin/settings?error=checkout_setting_failed");

  await supabase.from("admin_audit_logs").insert({
    actor_id: user.id,
    action: "setting_changed",
    entity_type: "site_setting",
    entity_id: "require_login_for_checkout",
    payload: { require_login_for_checkout: requireLogin },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout/[product]", "page");
  redirect("/admin/settings?message=checkout_setting_saved");
}
