import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CatalogProduct, Category, ProductImage, PurchaseMode } from "@/types/catalog";

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

export type CatalogSort = "relevant" | "newest" | "price_asc" | "price_desc";

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

function sanitizeSearch(value: string) {
  return value.trim().replace(/[(),.%]/g, " ").replace(/["'`\\]/g, " ").replace(/\s+/g, " ").slice(0, 120);
}

async function queryPublicCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,icon_url,sort_order,is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error("PUBLIC_CATEGORIES_QUERY_FAILED");
  return (data ?? []) as Category[];
}

export async function getPublicProducts(options?: {
  categoryId?: string;
  search?: string;
  featuredOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  mode?: PurchaseMode;
  sort?: CatalogSort;
  limit?: number;
  offset?: number;
}): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .is("deleted_at", null);

  if (options?.categoryId) query = query.eq("category_id", options.categoryId);
  if (options?.featuredOnly) query = query.eq("is_featured", true);
  if (options?.mode && ["DIRECT", "AFFILIATE", "HYBRID"].includes(options.mode)) query = query.eq("purchase_mode", options.mode);
  if (typeof options?.minPrice === "number" && Number.isFinite(options.minPrice) && options.minPrice >= 0) query = query.gte("price", options.minPrice);
  if (typeof options?.maxPrice === "number" && Number.isFinite(options.maxPrice) && options.maxPrice >= 0) query = query.lte("price", options.maxPrice);
  if (options?.search?.trim()) {
    const safe = sanitizeSearch(options.search);
    if (safe) query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%,short_description.ilike.%${safe}%`);
  }

  if (options?.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (options?.sort === "price_asc") query = query.order("price", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
  else if (options?.sort === "price_desc") query = query.order("price", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
  else query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (typeof options?.offset === "number" && options.offset > 0 && options?.limit) {
    query = query.range(options.offset, options.offset + options.limit - 1);
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error("PUBLIC_PRODUCTS_QUERY_FAILED");
  return (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>));
}

export async function searchPublicProducts(options: {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  mode?: PurchaseMode;
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
}): Promise<{ products: CatalogProduct[]; total: number }> {
  if (!isSupabaseConfigured()) return { products: [], total: 0 };
  const supabase = await createClient();
  const page = Math.max(1, Math.floor(options.page || 1));
  const pageSize = Math.min(48, Math.max(6, Math.floor(options.pageSize || 24)));
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("products")
    .select(productSelect, { count: "exact" })
    .eq("status", "active")
    .is("deleted_at", null);

  if (options.categoryId) query = query.eq("category_id", options.categoryId);
  if (options.mode && ["DIRECT", "AFFILIATE", "HYBRID"].includes(options.mode)) query = query.eq("purchase_mode", options.mode);
  if (typeof options.minPrice === "number" && Number.isFinite(options.minPrice) && options.minPrice >= 0) query = query.gte("price", options.minPrice);
  if (typeof options.maxPrice === "number" && Number.isFinite(options.maxPrice) && options.maxPrice >= 0) query = query.lte("price", options.maxPrice);
  if (options.search?.trim()) {
    const safe = sanitizeSearch(options.search);
    if (safe) query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%,short_description.ilike.%${safe}%`);
  }

  if (options.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (options.sort === "price_asc") query = query.order("price", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
  else if (options.sort === "price_desc") query = query.order("price", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
  else query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  query = query.range(offset, offset + pageSize - 1);

  const { data, count, error } = await query;
  if (error) throw new Error("PUBLIC_PRODUCT_SEARCH_FAILED");
  return {
    products: (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>)),
    total: count ?? 0,
  };
}

export async function getBestPriceProducts(limit = 10): Promise<CatalogProduct[]> {
  const candidates = await getPublicProducts({ limit: Math.max(30, limit * 3), sort: "newest" });
  return candidates
    .filter((item) => item.price !== null && item.compare_at_price !== null && item.compare_at_price > item.price)
    .sort((a, b) => {
      const ad = a.compare_at_price && a.price !== null ? 1 - a.price / a.compare_at_price : 0;
      const bd = b.compare_at_price && b.price !== null ? 1 - b.price / b.compare_at_price : 0;
      return bd - ad;
    })
    .slice(0, limit);
}

async function queryPublicProductBySlug(slug: string): Promise<CatalogProduct | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error("PUBLIC_PRODUCT_DETAIL_QUERY_FAILED");
  return data ? normalizeProduct(data as Record<string, unknown>) : null;
}

async function queryPublicCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,icon_url,sort_order,is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error("PUBLIC_CATEGORY_DETAIL_QUERY_FAILED");
  return (data as Category | null) ?? null;
}

export const getPublicCategories = cache(queryPublicCategories);
export const getPublicProductBySlug = cache(queryPublicProductBySlug);
export const getPublicCategoryBySlug = cache(queryPublicCategoryBySlug);

export async function getPublicSitemapEntries(): Promise<{
  products: Array<{ slug: string; updated_at: string | null }>;
  categories: Array<{ slug: string; updated_at: string | null }>;
}> {
  if (!isSupabaseConfigured()) return { products: [], categories: [] };
  const supabase = await createClient();
  const [productResult, categoryResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug,updated_at")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(1000),
    supabase
      .from("categories")
      .select("slug,updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(1000),
  ]);

  if (productResult.error || categoryResult.error) throw new Error("PUBLIC_SITEMAP_QUERY_FAILED");
  return {
    products: (productResult.data ?? []).map((row) => ({ slug: String(row.slug), updated_at: row.updated_at ? String(row.updated_at) : null })),
    categories: (categoryResult.data ?? []).map((row) => ({ slug: String(row.slug), updated_at: row.updated_at ? String(row.updated_at) : null })),
  };
}
