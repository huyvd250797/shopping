import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { OrderReceiptItem } from "@/types/checkout";

export async function getCheckoutSettings() {
  if (!isSupabaseConfigured()) return { requireLogin: false };
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key,value")
    .eq("key", "require_login_for_checkout")
    .maybeSingle();

  return { requireLogin: data?.value === true };
}

export async function getOrderReceipt(orderCode: string, accessToken: string): Promise<OrderReceiptItem[]> {
  if (!isSupabaseConfigured() || !orderCode || !accessToken) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_receipt", {
    p_order_code: orderCode,
    p_access_token: accessToken,
  });

  if (error || !Array.isArray(data)) return [];
  return data.map((row) => ({
    ...(row as OrderReceiptItem),
    subtotal: Number(row.subtotal ?? 0),
    shipping_fee: Number(row.shipping_fee ?? 0),
    total: Number(row.total ?? 0),
    unit_price: Number(row.unit_price ?? 0),
    quantity: Number(row.quantity ?? 0),
    line_total: Number(row.line_total ?? 0),
  }));
}
