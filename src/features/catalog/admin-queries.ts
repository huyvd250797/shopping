import { createClient } from "@/lib/supabase/server";
import type { CatalogProduct, Category, ProductImage } from "@/types/catalog";

const adminProductSelect = `
  id, category_id, sku, name, slug, short_description, description,
  price, compare_at_price, currency, thumbnail_url, purchase_mode,
  affiliate_url, button_label, secondary_button_label, status,
  is_featured, sort_order, track_stock, stock_qty, deleted_at,
  badge, tags, specifications, meta_title, meta_description,
  created_at, updated_at,
  category:categories(id,name,slug),
  product_images(id,product_id,image_url,storage_path,alt_text,sort_order,created_at)
`;

function normalize(row: Record<string, unknown>): CatalogProduct {
  const rawCategory = Array.isArray(row.category) ? row.category[0] : row.category;
  const images = Array.isArray(row.product_images) ? row.product_images : [];
  return {
    ...(row as unknown as CatalogProduct),
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    compare_at_price: row.compare_at_price === null || row.compare_at_price === undefined ? null : Number(row.compare_at_price),
    stock_qty: row.stock_qty === null || row.stock_qty === undefined ? null : Number(row.stock_qty),
    sort_order: Number(row.sort_order ?? 0),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    specifications: (row.specifications && typeof row.specifications === "object" ? row.specifications : {}) as Record<string, unknown>,
    category: (rawCategory ?? null) as CatalogProduct["category"],
    product_images: (images as ProductImage[]).sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id,name,slug,icon_url,sort_order,is_active,created_at,updated_at").order("sort_order").order("name");
  return (data ?? []) as Category[];
}

export async function getAdminProducts(filters?: { q?: string; status?: string; mode?: string; category?: string }): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select(adminProductSelect).order("created_at", { ascending: false });

  if (filters?.q?.trim()) {
    const safe = filters.q.trim().replace(/[(),.%]/g, " ").replace(/["'`\\]/g, " ");
    query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%,slug.ilike.%${safe}%`);
  }
  if (filters?.status && ["draft", "active", "archived"].includes(filters.status)) query = query.eq("status", filters.status);
  if (filters?.mode && ["DIRECT", "AFFILIATE", "HYBRID"].includes(filters.mode)) query = query.eq("purchase_mode", filters.mode);
  if (filters?.category) query = query.eq("category_id", filters.category);

  const { data } = await query;
  return (data ?? []).map((row) => normalize(row as Record<string, unknown>));
}

export async function getAdminProductById(id: string): Promise<CatalogProduct | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(adminProductSelect).eq("id", id).maybeSingle();
  return data ? normalize(data as Record<string, unknown>) : null;
}

export async function getCatalogKpis() {
  const supabase = await createClient();
  const [{ count: active }, { count: total }, { count: categories }, { count: missingImage }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active").is("deleted_at", null),
    supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).is("thumbnail_url", null).is("deleted_at", null),
  ]);
  return { active: active ?? 0, total: total ?? 0, categories: categories ?? 0, missingImage: missingImage ?? 0 };
}
