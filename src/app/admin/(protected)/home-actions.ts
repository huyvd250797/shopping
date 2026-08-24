"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { isHttpUrl, slugify } from "@/lib/catalog/format";
import { createClient } from "@/lib/supabase/server";
import type { HomeSectionType } from "@/types/home";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}
function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}
function integer(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) ? value : fallback;
}
function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function vietnamDateTime(formData: FormData, key: string) {
  const value = nullableText(formData, key);
  if (!value) return null;
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}:00+07:00`;
}
function optionalUrl(formData: FormData, key: string) {
  const value = nullableText(formData, key);
  if (!value) return null;
  return isHttpUrl(value) || (value.startsWith("/") && !value.startsWith("//")) ? value : "__INVALID__";
}
function bannerDates(formData: FormData) {
  const startsAt = vietnamDateTime(formData, "starts_at");
  const endsAt = vietnamDateTime(formData, "ends_at");
  if (startsAt && endsAt && new Date(endsAt).getTime() < new Date(startsAt).getTime()) return { invalid: true as const, startsAt, endsAt };
  return { invalid: false as const, startsAt, endsAt };
}
function redirectWith(code: string, type: "error" | "message"): never {
  redirect(`/admin/banners?${type}=${encodeURIComponent(code)}`);
}
function refreshHomeCms() {
  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function createBanner(formData: FormData) {
  const { user } = await requireAdmin();
  const title = nullableText(formData, "title");
  const linkUrl = optionalUrl(formData, "link_url");
  const dates = bannerDates(formData);
  if (linkUrl === "__INVALID__") redirectWith("invalid_banner_link", "error");
  if (dates.invalid) redirectWith("invalid_banner_dates", "error");

  const supabase = await createClient();
  const { data, error } = await supabase.from("banners").insert({
    title,
    subtitle: nullableText(formData, "subtitle"),
    link_url: linkUrl,
    button_label: nullableText(formData, "button_label"),
    sort_order: integer(formData, "sort_order"),
    is_active: checked(formData, "is_active"),
    starts_at: dates.startsAt,
    ends_at: dates.endsAt,
  }).select("id").single();

  if (error || !data) redirectWith("banner_create_failed", "error");
  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "banner_created", entity_type: "banner", entity_id: data.id, payload: { title } });
  refreshHomeCms();
  redirectWith("banner_created", "message");
}

export async function updateBanner(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  const linkUrl = optionalUrl(formData, "link_url");
  const dates = bannerDates(formData);
  if (!id) redirectWith("banner_missing", "error");
  if (linkUrl === "__INVALID__") redirectWith("invalid_banner_link", "error");
  if (dates.invalid) redirectWith("invalid_banner_dates", "error");

  const supabase = await createClient();
  const { error } = await supabase.from("banners").update({
    title: nullableText(formData, "title"),
    subtitle: nullableText(formData, "subtitle"),
    link_url: linkUrl,
    button_label: nullableText(formData, "button_label"),
    sort_order: integer(formData, "sort_order"),
    is_active: checked(formData, "is_active"),
    starts_at: dates.startsAt,
    ends_at: dates.endsAt,
  }).eq("id", id);

  if (error) redirectWith("banner_update_failed", "error");
  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "banner_updated", entity_type: "banner", entity_id: id });
  refreshHomeCms();
  redirectWith("banner_updated", "message");
}

export async function deleteBanner(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) redirectWith("banner_missing", "error");
  const supabase = await createClient();
  const { data: banner } = await supabase.from("banners").select("storage_path").eq("id", id).maybeSingle();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) redirectWith("banner_delete_failed", "error");
  if (banner?.storage_path) await supabase.storage.from("site-media").remove([banner.storage_path]);
  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "banner_deleted", entity_type: "banner", entity_id: id });
  refreshHomeCms();
  redirectWith("banner_deleted", "message");
}

export async function createHomeSection(formData: FormData) {
  const { user } = await requireAdmin();
  const title = text(formData, "title");
  const sectionType = text(formData, "section_type") as HomeSectionType;
  const allowed: HomeSectionType[] = ["FEATURED", "NEWEST", "BEST_PRICE", "RECOMMENDED"];
  if (!title || !allowed.includes(sectionType)) redirectWith("invalid_home_section", "error");
  const key = slugify(text(formData, "section_key") || title);
  if (!key) redirectWith("invalid_home_section", "error");
  const itemLimit = Math.min(24, Math.max(1, integer(formData, "item_limit", 10)));

  const supabase = await createClient();
  const { data, error } = await supabase.from("home_sections").insert({
    section_key: key,
    title,
    subtitle: nullableText(formData, "subtitle"),
    section_type: sectionType,
    item_limit: itemLimit,
    is_active: checked(formData, "is_active"),
    sort_order: integer(formData, "sort_order"),
  }).select("id").single();
  if (error || !data) redirectWith(error?.code === "23505" ? "home_section_key_exists" : "home_section_create_failed", "error");
  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "home_section_created", entity_type: "home_section", entity_id: data.id, payload: { title, sectionType } });
  refreshHomeCms();
  redirectWith("home_section_created", "message");
}

export async function updateHomeSection(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  const title = text(formData, "title");
  const sectionType = text(formData, "section_type") as HomeSectionType;
  const allowed: HomeSectionType[] = ["FEATURED", "NEWEST", "BEST_PRICE", "RECOMMENDED"];
  if (!id || !title || !allowed.includes(sectionType)) redirectWith("invalid_home_section", "error");

  const supabase = await createClient();
  const { error } = await supabase.from("home_sections").update({
    title,
    subtitle: nullableText(formData, "subtitle"),
    section_type: sectionType,
    item_limit: Math.min(24, Math.max(1, integer(formData, "item_limit", 10))),
    is_active: checked(formData, "is_active"),
    sort_order: integer(formData, "sort_order"),
  }).eq("id", id);
  if (error) redirectWith("home_section_update_failed", "error");
  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "home_section_updated", entity_type: "home_section", entity_id: id });
  refreshHomeCms();
  redirectWith("home_section_updated", "message");
}

export async function deleteHomeSection(formData: FormData) {
  const { user } = await requireAdmin();
  const id = text(formData, "id");
  if (!id) redirectWith("invalid_home_section", "error");
  const supabase = await createClient();
  const { error } = await supabase.from("home_sections").delete().eq("id", id);
  if (error) redirectWith("home_section_delete_failed", "error");
  await supabase.from("admin_audit_logs").insert({ actor_id: user.id, action: "home_section_deleted", entity_type: "home_section", entity_id: id });
  refreshHomeCms();
  redirectWith("home_section_deleted", "message");
}
