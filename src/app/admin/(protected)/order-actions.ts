"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { isOrderStatus, ORDER_STATUS_TRANSITIONS } from "@/features/orders/status";

function text(formData: FormData, key: string, max = 2000) {
  const value = String(formData.get(key) ?? "").trim();
  return value.slice(0, max);
}

function errorCode(error: { message?: string } | null) {
  const message = error?.message || "UNKNOWN_ERROR";
  const known = [
    "ADMIN_REQUIRED",
    "ORDER_ID_REQUIRED",
    "INVALID_ORDER_STATUS",
    "ORDER_NOT_FOUND",
    "STATUS_NOT_CHANGED",
    "INVALID_STATUS_TRANSITION",
    "CANCEL_REASON_REQUIRED",
    "STATUS_NOTE_TOO_LONG",
    "INTERNAL_NOTE_TOO_LONG",
  ];
  return known.find((code) => message.includes(code)) || "ORDER_UPDATE_FAILED";
}

export async function transitionOrderAction(formData: FormData) {
  await requireAdmin();
  const orderId = text(formData, "order_id", 80);
  const toStatus = text(formData, "to_status", 30);
  const note = text(formData, "note", 500);

  if (!orderId || !isOrderStatus(toStatus)) {
    redirect(`/admin/orders/${encodeURIComponent(orderId || "unknown")}?error=INVALID_ORDER_STATUS`);
  }

  const supabase = await createClient();
  const { data: current } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
  if (!current || !isOrderStatus(current.status)) {
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?error=ORDER_NOT_FOUND`);
  }
  if (!ORDER_STATUS_TRANSITIONS[current.status].includes(toStatus)) {
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?error=INVALID_STATUS_TRANSITION`);
  }
  if (toStatus === "CANCELLED" && note.length < 3) {
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?error=CANCEL_REASON_REQUIRED`);
  }

  const { error } = await supabase.rpc("admin_transition_order", {
    p_order_id: orderId,
    p_to_status: toStatus,
    p_note: note || null,
  });

  if (error) {
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?error=${errorCode(error)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${encodeURIComponent(orderId)}?updated=status`);
}

export async function updateOrderInternalNoteAction(formData: FormData) {
  await requireAdmin();
  const orderId = text(formData, "order_id", 80);
  const internalNote = text(formData, "internal_note", 2000);
  if (!orderId) redirect("/admin/orders?error=ORDER_ID_REQUIRED");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_order_internal_note", {
    p_order_id: orderId,
    p_internal_note: internalNote || null,
  });

  if (error) {
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?error=${errorCode(error)}`);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${encodeURIComponent(orderId)}?updated=note`);
}
