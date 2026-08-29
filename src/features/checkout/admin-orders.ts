import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminOrderRow = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  status: string;
  total: number;
  created_at: string;
  user_id: string | null;
};

export async function getRecentAdminOrders(limit = 50): Promise<AdminOrderRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id,order_code,customer_name,phone,status,total,created_at,user_id")
    .order("created_at", { ascending: false })
    .limit(Math.min(100, Math.max(1, limit)));
  return (data ?? []).map((row) => ({ ...row, total: Number(row.total ?? 0) })) as AdminOrderRow[];
}

export async function getAdminOrderDetail(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const [{ data: order }, { data: items }, { data: history }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id).order("created_at", { ascending: true }),
    supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: true }),
  ]);
  if (!order) return null;
  return {
    order: { ...order, subtotal: Number(order.subtotal ?? 0), shipping_fee: Number(order.shipping_fee ?? 0), total: Number(order.total ?? 0) },
    items: (items ?? []).map((item) => ({ ...item, unit_price_snapshot: Number(item.unit_price_snapshot ?? 0), line_total: Number(item.line_total ?? 0) })),
    history: history ?? [],
  };
}
