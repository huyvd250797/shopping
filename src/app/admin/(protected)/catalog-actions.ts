"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { isHttpUrl, slugify } from "@/lib/catalog/format";
import { createClient } from "@/lib/supabase/server";
import type { ProductStatus, PurchaseMode } from "@/types/catalog";

type ProductWritePayload = {
  category_id: string | null;
  sku: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  thumbnail_url: string | null;
  purchase_mode: PurchaseMode;
  affiliate_url: string | null;
  button_label: string | null;
  secondary_button_label: string | null;
  status: ProductStatus;
  is_featured: boolean;
  sort_order: number;
  track_stock: boolean;
  stock_qty: number | null;
  badge: string | null;
  tags: string[];
};

type ProductPayloadResult =
  | { ok: false; error: string }
  | { ok: true; data: ProductWritePayload };

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function integer(formData: FormData, key: string, fallback = 0) {
  const raw = text(formData, key);
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

function nullableNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function urlOrNull(formData: FormData, key: string) {
  const value = nullableText(formData, key);
  if (!value) return null;
  return isHttpUrl(value) ? value : "__INVALID__";
}

function errorRedirect(path: string, code: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}error=${encodeURIComponent(code)}`);
}

function messageRedirect(path: string, code: string): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}message=${encodeURIComponent(code)}`);
}

function revalidateCatalog() {
  revalidatePath("/", "layout");
  revalidatePath("/search");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
}

export async function createCategory(formData: FormData) {
  const { user } = await requireAdmin();
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const iconUrl = urlOrNull(formData, "icon_url");

  if (!name || name.length > 120 || !slug) errorRedirect("/admin/categories", "invalid_category");
  if (iconUrl === "__INVALID__") errorRedirect("/admin/categories", "invalid_icon_url");

  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").insert({
    name,
    slug,
    icon_url: iconUrl,
    sort_order: integer(formData, "sort_order"),
    is_active: checked(formData, "is_active"),
  }).select("id").single();

  if (error || !data) {
    if (error?.code === "23505") errorRedirect("/admin/categories", "category_slug_exists");
    errorRedirect("/admin/categories", "category_create_failed");
  }

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "category_created", entity_type: "category", entity_id: data.id, payload: { name, slug } });
  revalidateCatalog();
  messageRedirect("/admin/categories", "category_created");
}

export async function updateCategory(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const iconUrl = urlOrNull(formData, "icon_url");

  if (!id || !name || name.length > 120 || !slug) errorRedirect("/admin/categories", "invalid_category");
  if (iconUrl === "__INVALID__") errorRedirect("/admin/categories", "invalid_icon_url");

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({
    name,
    slug,
    icon_url: iconUrl,
    sort_order: integer(formData, "sort_order"),
    is_active: checked(formData, "is_active"),
  }).eq("id", id);

  if (error) {
    if (error.code === "23505") errorRedirect("/admin/categories", "category_slug_exists");
    errorRedirect("/admin/categories", "category_update_failed");
  }

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "category_updated", entity_type: "category", entity_id: id, payload: { name, slug } });
  revalidateCatalog();
  messageRedirect("/admin/categories", "category_updated");
}

export async function deleteCategory(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) errorRedirect("/admin/categories", "category_missing");

  const supabase = await createClient();
  const { count, error: countError } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id).is("deleted_at", null);
  if (countError) errorRedirect("/admin/categories", "category_delete_failed");
  if ((count ?? 0) > 0) errorRedirect("/admin/categories", "category_in_use");

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) errorRedirect("/admin/categories", "category_delete_failed");

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "category_deleted", entity_type: "category", entity_id: id, payload: {} });
  revalidateCatalog();
  messageRedirect("/admin/categories", "category_deleted");
}

function productPayload(formData: FormData): ProductPayloadResult {
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const purchaseMode = text(formData, "purchase_mode") as PurchaseMode;
  const status = text(formData, "status") as ProductStatus;
  const affiliateUrl = urlOrNull(formData, "affiliate_url");
  const thumbnailUrl = urlOrNull(formData, "thumbnail_url");
  const price = nullableNumber(formData, "price");
  const compareAtPrice = nullableNumber(formData, "compare_at_price");
  const tags = text(formData, "tags").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20);
  const trackStock = checked(formData, "track_stock");
  const stockQty = trackStock ? nullableNumber(formData, "stock_qty") : null;

  if (!name || name.length > 180 || !slug) return { ok: false, error: "invalid_product" };
  if (!(["DIRECT", "AFFILIATE", "HYBRID"] as string[]).includes(purchaseMode)) return { ok: false, error: "invalid_purchase_mode" };
  if (!(["draft", "active", "archived"] as string[]).includes(status)) return { ok: false, error: "invalid_status" };
  if (affiliateUrl === "__INVALID__" || thumbnailUrl === "__INVALID__") return { ok: false, error: "invalid_url" };
  if (purchaseMode === "AFFILIATE" && !affiliateUrl) return { ok: false, error: "affiliate_url_required" };
  if ((purchaseMode === "DIRECT" || purchaseMode === "HYBRID") && (price === null || price < 0)) return { ok: false, error: "price_required" };
  if (price !== null && price < 0) return { ok: false, error: "invalid_price" };
  if (compareAtPrice !== null && compareAtPrice < 0) return { ok: false, error: "invalid_compare_price" };
  if (stockQty !== null && stockQty < 0) return { ok: false, error: "invalid_stock" };

  return {
    ok: true,
    data: {
      category_id: nullableText(formData, "category_id"),
      sku: nullableText(formData, "sku"),
      name,
      slug,
      short_description: nullableText(formData, "short_description"),
      description: nullableText(formData, "description"),
      price,
      compare_at_price: compareAtPrice,
      currency: "VND",
      thumbnail_url: thumbnailUrl,
      purchase_mode: purchaseMode,
      affiliate_url: affiliateUrl,
      button_label: nullableText(formData, "button_label"),
      secondary_button_label: nullableText(formData, "secondary_button_label"),
      status,
      is_featured: checked(formData, "is_featured"),
      sort_order: integer(formData, "sort_order"),
      track_stock: trackStock,
      stock_qty: stockQty,
      badge: nullableText(formData, "badge"),
      tags,
    },
  };
}

export async function createProduct(formData: FormData) {
  const { user } = await requireAdmin();
  const parsed = productPayload(formData);
  if (!parsed.ok) errorRedirect("/admin/products/new", parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert({
    ...parsed.data,
    created_by: user.id,
    updated_by: user.id,
  }).select("id").single();

  if (error || !data) {
    if (error?.code === "23505") errorRedirect("/admin/products/new", "product_slug_or_sku_exists");
    errorRedirect("/admin/products/new", "product_create_failed");
  }

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "product_created", entity_type: "product", entity_id: data.id, payload: { name: parsed.data.name, status: parsed.data.status, purchase_mode: parsed.data.purchase_mode } });
  revalidateCatalog();
  messageRedirect(`/admin/products/${data.id}`, "product_created");
}

export async function updateProduct(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) errorRedirect("/admin/products", "product_missing");

  const parsed = productPayload(formData);
  if (!parsed.ok) errorRedirect(`/admin/products/${id}`, parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({
    ...parsed.data,
    updated_by: user.id,
  }).eq("id", id);

  if (error) {
    if (error.code === "23505") errorRedirect(`/admin/products/${id}`, "product_slug_or_sku_exists");
    errorRedirect(`/admin/products/${id}`, "product_update_failed");
  }

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "product_updated", entity_type: "product", entity_id: id, payload: { name: parsed.data.name, status: parsed.data.status, purchase_mode: parsed.data.purchase_mode } });
  revalidateCatalog();
  revalidatePath(`/product/${parsed.data.slug}`);
  messageRedirect(`/admin/products/${id}`, "product_updated");
}

export async function archiveProduct(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) errorRedirect("/admin/products", "product_missing");

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status: "archived", deleted_at: new Date().toISOString(), updated_by: user.id }).eq("id", id);
  if (error) errorRedirect("/admin/products", "product_archive_failed");

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "product_archived", entity_type: "product", entity_id: id, payload: {} });
  revalidateCatalog();
  messageRedirect("/admin/products", "product_archived");
}

export async function restoreProduct(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) errorRedirect("/admin/products", "product_missing");

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status: "draft", deleted_at: null, updated_by: user.id }).eq("id", id);
  if (error) errorRedirect("/admin/products", "product_restore_failed");

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "product_restored", entity_type: "product", entity_id: id, payload: {} });
  revalidateCatalog();
  messageRedirect("/admin/products", "product_restored");
}

export async function setProductStatus(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  const status = text(formData, "status") as ProductStatus;
  if (!id || !(["draft", "active", "archived"] as string[]).includes(status)) errorRedirect("/admin/products", "invalid_status");

  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status, updated_by: user.id }).eq("id", id).is("deleted_at", null);
  if (error) errorRedirect("/admin/products", "status_update_failed");

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "product_status_changed", entity_type: "product", entity_id: id, payload: { status } });
  revalidateCatalog();
  messageRedirect("/admin/products", "status_updated");
}

export async function setThumbnailImage(formData: FormData) {
  const { user } = await requireAdmin();
  const productId = text(formData, "product_id");
  const imageId = text(formData, "image_id");
  if (!productId || !imageId) errorRedirect(`/admin/products/${productId || ""}`, "image_missing");

  const supabase = await createClient();
  const { data: image, error: imageError } = await supabase.from("product_images").select("image_url").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (imageError || !image) errorRedirect(`/admin/products/${productId}`, "image_missing");

  const { error } = await supabase.from("products").update({ thumbnail_url: image.image_url, updated_by: user.id }).eq("id", productId);
  if (error) errorRedirect(`/admin/products/${productId}`, "thumbnail_update_failed");

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "product_thumbnail_changed", entity_type: "product", entity_id: productId, payload: { image_id: imageId } });
  revalidateCatalog();
  messageRedirect(`/admin/products/${productId}`, "thumbnail_updated");
}

export async function deleteProductImage(formData: FormData) {
  const { user } = await requireAdmin();
  const productId = text(formData, "product_id");
  const imageId = text(formData, "image_id");
  if (!productId || !imageId) errorRedirect(`/admin/products/${productId || ""}`, "image_missing");

  const supabase = await createClient();
  const { data: image, error: imageError } = await supabase.from("product_images").select("image_url,storage_path").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (imageError || !image) errorRedirect(`/admin/products/${productId}`, "image_missing");

  if (image.storage_path) {
    const { error: storageError } = await supabase.storage.from("product-images").remove([image.storage_path]);
    if (storageError) errorRedirect(`/admin/products/${productId}`, "image_storage_delete_failed");
  }

  const { error } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  if (error) errorRedirect(`/admin/products/${productId}`, "image_delete_failed");

  const { data: product } = await supabase.from("products").select("thumbnail_url").eq("id", productId).maybeSingle();
  if (product?.thumbnail_url === image.image_url) {
    const { data: nextImage } = await supabase.from("product_images").select("image_url").eq("product_id", productId).order("sort_order", { ascending: true }).limit(1).maybeSingle();
    await supabase.from("products").update({ thumbnail_url: nextImage?.image_url ?? null, updated_by: user.id }).eq("id", productId);
  }

  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "product_image_deleted", entity_type: "product", entity_id: productId, payload: { image_id: imageId } });
  revalidateCatalog();
  messageRedirect(`/admin/products/${productId}`, "image_deleted");
}

export async function finalizeProductImageUpload(productId: string, count: number) {
  const { user } = await requireAdmin();
  const safeId = productId.trim();
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.min(6, Math.trunc(count))) : 0;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(safeId)) {
    return { ok: false as const };
  }

  const supabase = await createClient();
  await supabase.from("admin_audit_logs").insert({
    actor_id: user.id,
    action: "product_images_uploaded",
    entity_type: "product",
    entity_id: safeId,
    payload: { count: safeCount, transport: "direct_supabase_storage" },
  });
  revalidateCatalog();
  revalidatePath(`/admin/products/${safeId}`);
  return { ok: true as const };
}
