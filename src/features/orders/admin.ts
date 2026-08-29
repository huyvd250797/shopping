import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isOrderStatus, type OrderStatus } from "@/features/orders/status";

export type AdminOrderFilters = {
  q?: string;
  status?: string;
  customerType?: "guest" | "customer" | "";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
};

export type AdminOrderListRow = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  internal_note: string | null;
};

const PAGE_SIZE = 20;

function safeSearch(value: string) {
  return value.trim().replace(/[(),.%]/g, " ").replace(/["'`\\]/g, " ").replace(/\s+/g, " ").slice(0, 80);
}

function dayStartIso(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00+07:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dayEndIso(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T23:59:59.999+07:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function getAdminOrders(filters: AdminOrderFilters = {}) {
  if (!isSupabaseConfigured()) return { rows: [] as AdminOrderListRow[], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 };
  const supabase = await createClient();
  const page = Math.max(1, Number(filters.page || 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select("id,order_code,customer_name,phone,status,total,created_at,updated_at,user_id,internal_note", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.q?.trim()) {
    const q = safeSearch(filters.q);
    if (q) query = query.or(`order_code.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  if (filters.status && isOrderStatus(filters.status)) query = query.eq("status", filters.status);
  if (filters.customerType === "guest") query = query.is("user_id", null);
  if (filters.customerType === "customer") query = query.not("user_id", "is", null);
  const fromDate = dayStartIso(filters.dateFrom);
  const toDate = dayEndIso(filters.dateTo);
  if (fromDate) query = query.gte("created_at", fromDate);
  if (toDate) query = query.lte("created_at", toDate);

  const { data, count, error } = await query.range(from, to);
  if (error) return { rows: [] as AdminOrderListRow[], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1, error: error.message };

  const rows = (data ?? []).map((row) => ({
    ...row,
    status: row.status as OrderStatus,
    total: Number(row.total ?? 0),
  })) as AdminOrderListRow[];
  const total = count ?? 0;
  return { rows, total, page, pageSize: PAGE_SIZE, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getOrderAdminKpis() {
  if (!isSupabaseConfigured()) return { newCount: 0, activeCount: 0, completedCount: 0, cancelledCount: 0 };
  const supabase = await createClient();
  const [{ count: newCount }, { count: activeCount }, { count: completedCount }, { count: cancelledCount }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "NEW"),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["CONFIRMED", "PROCESSING", "SHIPPING"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "COMPLETED"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "CANCELLED"),
  ]);
  return {
    newCount: newCount ?? 0,
    activeCount: activeCount ?? 0,
    completedCount: completedCount ?? 0,
    cancelledCount: cancelledCount ?? 0,
  };
}

type HistoryRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  changed_by: string | null;
  created_at: string;
  actor_label?: string;
};

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  actor_label?: string;
};

async function resolveActorLabels(ids: (string | null | undefined)[]) {
  const unique = [...new Set(ids.filter(Boolean) as string[])];
  if (unique.length === 0) return new Map<string, string>();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id,full_name,email").in("id", unique);
  return new Map((data ?? []).map((row) => [row.id, row.full_name || row.email || row.id.slice(0, 8)]));
}

export async function getAdminOrderDetail(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const [{ data: order }, { data: items }, { data: history }, { data: audit }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id).order("created_at", { ascending: true }),
    supabase.from("order_status_history").select("*").eq("order_id", id).order("created_at", { ascending: true }),
    supabase.from("admin_audit_logs").select("id,actor_id,action,entity_type,entity_id,payload,created_at").eq("entity_type", "order").eq("entity_id", id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (!order) return null;

  const historyRows = (history ?? []) as HistoryRow[];
  const auditRows = (audit ?? []) as AuditRow[];
  const actors = await resolveActorLabels([
    ...historyRows.map((row) => row.changed_by),
    ...auditRows.map((row) => row.actor_id),
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
    items: (items ?? []).map((item) => ({
      ...item,
      unit_price_snapshot: Number(item.unit_price_snapshot ?? 0),
      line_total: Number(item.line_total ?? 0),
    })),
    history: historyRows.map((row) => ({ ...row, actor_label: row.changed_by ? actors.get(row.changed_by) : undefined })),
    audit: auditRows.map((row) => ({ ...row, actor_label: row.actor_id ? actors.get(row.actor_id) : undefined })),
  };
}

export async function getAdminAuditLogs(limit = 100) {
  if (!isSupabaseConfigured()) return [] as AuditRow[];
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_audit_logs")
    .select("id,actor_id,action,entity_type,entity_id,payload,created_at")
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(200, limit)));
  const rows = (data ?? []) as AuditRow[];
  const actors = await resolveActorLabels(rows.map((row) => row.actor_id));
  return rows.map((row) => ({ ...row, actor_label: row.actor_id ? actors.get(row.actor_id) : undefined }));
}
