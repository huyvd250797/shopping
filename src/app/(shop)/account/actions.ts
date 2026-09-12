"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "").trim().slice(0, max + 1);
}

export async function updateMyProfile(formData: FormData) {
  const fullName = text(formData, "full_name", 120);
  const phone = text(formData, "phone", 30);
  const province = text(formData, "province", 120);
  const district = text(formData, "district", 120);
  const ward = text(formData, "ward", 120);
  const addressLine = text(formData, "address_line", 250);

  if (!fullName) redirect("/account?error=full_name_required");
  if (fullName.length > 120 || phone.length > 30 || province.length > 120 || district.length > 120 || ward.length > 120 || addressLine.length > 250) {
    redirect("/account?error=invalid_profile");
  }
  if (!isSupabaseConfigured()) redirect("/account?error=supabase_not_configured");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=session_required&next=/account");

  const { error } = await supabase.rpc("update_my_customer_profile", {
    p_full_name: fullName,
    p_phone: phone || null,
    p_province: province || null,
    p_district: district || null,
    p_ward: ward || null,
    p_address_line: addressLine || null,
  });

  if (error) redirect("/account?error=profile_update_failed");
  revalidatePath("/account");
  revalidatePath("/checkout/[product]", "page");
  redirect("/account?message=profile_updated");
}
