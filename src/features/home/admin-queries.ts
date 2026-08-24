import { createClient } from "@/lib/supabase/server";
import type { Banner, HomeSection } from "@/types/home";

export async function getAdminBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("id,title,subtitle,image_url,storage_path,link_url,button_label,sort_order,is_active,starts_at,ends_at,created_at,updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as Banner[];
}

export async function getAdminHomeSections(): Promise<HomeSection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("home_sections")
    .select("id,section_key,title,subtitle,section_type,item_limit,is_active,sort_order,created_at,updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as HomeSection[];
}
