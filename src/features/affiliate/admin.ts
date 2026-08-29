import { createClient } from "@/lib/supabase/server";
import type { AffiliateKpis, AffiliateProductStat, AffiliateRecentClick } from "@/types/affiliate";
import type { ProductStatus, PurchaseMode } from "@/types/catalog";

function numberValue(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function purchaseMode(value: unknown): PurchaseMode {
  return value === "AFFILIATE" || value === "HYBRID" ? value : "DIRECT";
}

function productStatus(value: unknown): ProductStatus {
  return value === "active" || value === "archived" ? value : "draft";
}

export async function getAffiliateKpis(days = 30): Promise<AffiliateKpis> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_affiliate_kpis", { p_days: days });
  const row = Array.isArray(data) ? (data[0] as Record<string, unknown> | undefined) : undefined;
  return {
    totalClicks: numberValue(row?.total_clicks),
    uniqueVisitors: numberValue(row?.unique_visitors),
    clicksToday: numberValue(row?.clicks_today),
    activeAffiliateProducts: numberValue(row?.active_affiliate_products),
  };
}

export async function getAffiliateProductStats(days = 30): Promise<AffiliateProductStat[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_affiliate_product_stats", { p_days: days });
  if (!Array.isArray(data)) return [];
  return data.map((raw: unknown) => {
    const row = raw as Record<string, unknown>;
    return {
      productId: String(row.product_id ?? ""),
      productName: String(row.product_name ?? ""),
      slug: String(row.slug ?? ""),
      purchaseMode: purchaseMode(row.purchase_mode),
      productStatus: productStatus(row.product_status),
      clicks: numberValue(row.clicks),
      uniqueVisitors: numberValue(row.unique_visitors),
      lastClickedAt: typeof row.last_clicked_at === "string" ? row.last_clicked_at : null,
    };
  }).filter((row: AffiliateProductStat) => Boolean(row.productId && row.slug));
}

export async function getRecentAffiliateClicks(limit = 25): Promise<AffiliateRecentClick[]> {
  const supabase = await createClient();
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const { data } = await supabase
    .from("affiliate_clicks")
    .select("id,product_id,user_id,session_id,source_path,target_url,created_at,product:products(id,name,slug,purchase_mode)")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  return (data ?? []).map((raw: unknown) => {
    const row = raw as unknown as Record<string, unknown>;
    const productRaw = Array.isArray(row.product) ? row.product[0] : row.product;
    const product = (productRaw && typeof productRaw === "object" ? productRaw : {}) as Record<string, unknown>;
    return {
      id: String(row.id ?? ""),
      productId: String(row.product_id ?? ""),
      productName: String(product.name ?? "Sản phẩm"),
      productSlug: String(product.slug ?? ""),
      purchaseMode: purchaseMode(product.purchase_mode),
      userId: typeof row.user_id === "string" ? row.user_id : null,
      sessionId: typeof row.session_id === "string" ? row.session_id : null,
      sourcePath: typeof row.source_path === "string" ? row.source_path : null,
      targetUrl: String(row.target_url ?? ""),
      createdAt: String(row.created_at ?? ""),
    };
  }).filter((row: AffiliateRecentClick) => Boolean(row.id));
}
