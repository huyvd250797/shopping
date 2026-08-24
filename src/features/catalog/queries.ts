import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CatalogProduct, Category, ProductImage } from "@/types/catalog";

const productSelect = `
  id, category_id, sku, name, slug, short_description, description,
  price, compare_at_price, currency, thumbnail_url, purchase_mode,
  affiliate_url, button_label, secondary_button_label, status,
  is_featured, sort_order, track_stock, stock_qty, deleted_at,
  badge, tags, specifications, meta_title, meta_description,
  created_at, updated_at,
  category:categories(id,name,slug),
  product_images(id,product_id,image_url,storage_path,alt_text,sort_order,created_at)
`;

function normalizeProduct(row: Record<string, unknown>): CatalogProduct {
  const rawCategory = Array.isArray(row.category) ? row.category[0] : row.category;
  const rawImages = Array.isArray(row.product_images) ? row.product_images : [];

  return {
    ...(row as unknown as CatalogProduct),
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    compare_at_price: row.compare_at_price === null || row.compare_at_price === undefined ? null : Number(row.compare_at_price),
    stock_qty: row.stock_qty === null || row.stock_qty === undefined ? null : Number(row.stock_qty),
    sort_order: Number(row.sort_order ?? 0),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    specifications: (row.specifications && typeof row.specifications === "object" ? row.specifications : {}) as Record<string, unknown>,
    category: (rawCategory ?? null) as CatalogProduct["category"],
    product_images: (rawImages as ProductImage[]).sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getPublicCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id,name,slug,icon_url,sort_order,is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (data ?? []) as Category[];
}

export async function getPublicProducts(options?: {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (options?.categoryId) query = query.eq("category_id", options.categoryId);
  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (options?.search?.trim()) {
    const safe = options.search.trim().replace(/[(),.%]/g, " ").replace(/["'`\\]/g, " ");
    query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%,short_description.ilike.%${safe}%`);
  }
  if (options?.limit) query = query.limit(options.limit);

  const { data } = await query;
  return (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>));
}

export async function getPublicProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  return data ? normalizeProduct(data as Record<string, unknown>) : null;
}

export async function getPublicCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id,name,slug,icon_url,sort_order,is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (data as Category | null) ?? null;
}
