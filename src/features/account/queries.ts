import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isOrderStatus, type OrderStatus } from "@/features/orders/status";

export type CustomerOrderFilters = {
  status?: string;
  page?: number;
};

export type CustomerOrderListRow = {
  id: string;
  order_code: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  address_line: string;
};


export type CustomerOrderDetailItem = {
  id: string;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  image_snapshot: string | null;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  created_at: string;
};

export type CustomerOrderHistoryRow = {
  id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  note: string | null;
  created_at: string;
};

export type CustomerOrderDetail = {
  order: {
    id: string;
    order_code: string;
    status: OrderStatus;
    subtotal: number;
    shipping_fee: number;
    discount: number;
    total: number;
    customer_name: string;
    phone: string;
    email: string | null;
    province: string | null;
    district: string | null;
    ward: string | null;
    address_line: string;
    note: string | null;
    created_at: string;
    updated_at: string;
  };
  items: CustomerOrderDetailItem[];
  history: CustomerOrderHistoryRow[];
};

const PAGE_SIZE = 10;

export async function getMyOrderSummary(userId: string) {
  if (!isSupabaseConfigured()) return { total: 0, active: 0, completed: 0 };
  const supabase = await createClient();
  const [{ count: total }, { count: active }, { count: completed }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["NEW", "CONFIRMED", "PROCESSING", "SHIPPING"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "COMPLETED"),
  ]);
  return { total: total ?? 0, active: active ?? 0, completed: completed ?? 0 };
}

export async function getMyOrders(userId: string, filters: CustomerOrderFilters = {}) {
  if (!isSupabaseConfigured()) return { rows: [] as CustomerOrderListRow[], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 };
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page || 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select("id,order_code,status,total,created_at,updated_at,customer_name,province,district,ward,address_line", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status && isOrderStatus(filters.status)) query = query.eq("status", filters.status);

  const { data, count, error } = await query.range(from, to);
  if (error) return { rows: [] as CustomerOrderListRow[], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1, error: error.message };

  const rows = (data ?? []).map((row: any) => ({
    ...row,
    status: row.status as OrderStatus,
    total: Number(row.total ?? 0),
  })) as CustomerOrderListRow[];
  const total = count ?? 0;
  return { rows, total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getMyOrderDetail(userId: string, orderId: string): Promise<CustomerOrderDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id,order_code,status,subtotal,shipping_fee,discount,total,customer_name,phone,email,province,district,ward,address_line,note,created_at,updated_at")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !order) return null;

  const [{ data: items }, { data: history }] = await Promise.all([
    supabase
      .from("order_items")
      .select("id,product_name_snapshot,sku_snapshot,image_snapshot,unit_price_snapshot,quantity,line_total,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_status_history")
      .select("id,from_status,to_status,note,created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    order: {
      ...order,
      status: order.status as OrderStatus,
      subtotal: Number(order.subtotal ?? 0),
      shipping_fee: Number(order.shipping_fee ?? 0),
      discount: Number(order.discount ?? 0),
      total: Number(order.total ?? 0),
    },
    items: (items ?? []).map((item: any): CustomerOrderDetailItem => ({
      id: String(item.id),
      product_name_snapshot: String(item.product_name_snapshot),
      sku_snapshot: item.sku_snapshot ? String(item.sku_snapshot) : null,
      image_snapshot: item.image_snapshot ? String(item.image_snapshot) : null,
      unit_price_snapshot: Number(item.unit_price_snapshot ?? 0),
      quantity: Number(item.quantity ?? 0),
      line_total: Number(item.line_total ?? 0),
      created_at: String(item.created_at),
    })),
    history: (history ?? []).map((row: any): CustomerOrderHistoryRow => ({
      id: String(row.id),
      from_status: row.from_status && isOrderStatus(row.from_status) ? row.from_status : null,
      to_status: isOrderStatus(row.to_status) ? row.to_status : "NEW",
      note: row.note ? String(row.note) : null,
      created_at: String(row.created_at),
    })),
  };
}
