import { getBestPriceProducts, getPublicProducts } from "@/features/catalog/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { CatalogProduct } from "@/types/catalog";
import type { Banner, HomeSection } from "@/types/home";

export async function getPublicBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banners")
    .select("id,title,subtitle,image_url,storage_path,link_url,button_label,sort_order,is_active,starts_at,ends_at,created_at,updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error("PUBLIC_BANNERS_QUERY_FAILED");
  const now = Date.now();
  return ((data ?? []) as Banner[]).filter((banner) => {
    const startsOk = !banner.starts_at || new Date(banner.starts_at).getTime() <= now;
    const endsOk = !banner.ends_at || new Date(banner.ends_at).getTime() >= now;
    return startsOk && endsOk;
  });
}

export async function getPublicHomeSections(): Promise<HomeSection[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_sections")
    .select("id,section_key,title,subtitle,section_type,item_limit,is_active,sort_order,created_at,updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error("PUBLIC_HOME_SECTIONS_QUERY_FAILED");
  return (data ?? []) as HomeSection[];
}

export async function getProductsForHomeSection(section: HomeSection): Promise<CatalogProduct[]> {
  if (section.section_type === "FEATURED") {
    const featured = await getPublicProducts({ featuredOnly: true, limit: section.item_limit });
    return featured.length ? featured : getPublicProducts({ limit: section.item_limit, sort: "newest" });
  }
  if (section.section_type === "NEWEST") return getPublicProducts({ limit: section.item_limit, sort: "newest" });
  if (section.section_type === "BEST_PRICE") return getBestPriceProducts(section.item_limit);
  return getPublicProducts({ limit: section.item_limit });
}
