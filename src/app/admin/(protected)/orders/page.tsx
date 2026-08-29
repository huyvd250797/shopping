import Link from "next/link";
import { getAdminOrders, getOrderAdminKpis } from "@/features/orders/admin";
import { ORDER_STATUSES, orderStatusClass, orderStatusLabel } from "@/features/orders/status";
import { formatVnd } from "@/lib/catalog/format";

function buildPageHref(current: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) if (value) params.set(key, value);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const first = (key: string) => (Array.isArray(raw[key]) ? raw[key]?.[0] : raw[key]) || "";
  const filters = {
    q: first("q"),
    status: first("status"),
    customerType: first("customer_type") as "guest" | "customer" | "",
    dateFrom: first("date_from"),
    dateTo: first("date_to"),
    page: Math.max(1, Number(first("page") || 1)),
  };

  const [result, kpis] = await Promise.all([getAdminOrders(filters), getOrderAdminKpis()]);
  const hrefParams = {
    q: filters.q || undefined,
    status: filters.status || undefined,
    customer_type: filters.customerType || undefined,
    date_from: filters.dateFrom || undefined,
    date_to: filters.dateTo || undefined,
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Đơn hàng</h1>
          <p>V0.6.0 • Tìm kiếm, lọc, xử lý workflow, ghi chú nội bộ, timeline và audit.</p>
        </div>
        <span className="route-chip">{result.total} đơn</span>
      </div>

      <section className="kpi-grid order-kpi-grid">
        <div className="kpi-card"><span>Đơn mới</span><strong>{kpis.newCount}</strong></div>
        <div className="kpi-card"><span>Đang xử lý</span><strong>{kpis.activeCount}</strong></div>
        <div className="kpi-card"><span>Hoàn tất</span><strong>{kpis.completedCount}</strong></div>
        <div className="kpi-card"><span>Đã hủy</span><strong>{kpis.cancelledCount}</strong></div>
      </section>

      <section className="panel order-filter-panel">
        <form method="get" className="order-filter-form">
          <label className="order-filter-search">
            <span>Tìm đơn</span>
            <input name="q" defaultValue={filters.q} placeholder="Mã đơn, tên khách, số điện thoại" />
          </label>
          <label>
            <span>Trạng thái</span>
            <select name="status" defaultValue={filters.status}>
              <option value="">Tất cả</option>
              {ORDER_STATUSES.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}
            </select>
          </label>
          <label>
            <span>Loại khách</span>
            <select name="customer_type" defaultValue={filters.customerType}>
              <option value="">Tất cả</option>
              <option value="guest">Guest</option>
              <option value="customer">Có tài khoản</option>
            </select>
          </label>
          <label>
            <span>Từ ngày</span>
            <input type="date" name="date_from" defaultValue={filters.dateFrom} />
          </label>
          <label>
            <span>Đến ngày</span>
            <input type="date" name="date_to" defaultValue={filters.dateTo} />
          </label>
          <div className="order-filter-actions">
            <button className="admin-primary-button" type="submit">Lọc</button>
            <Link className="admin-small-button" href="/admin/orders">Đặt lại</Link>
          </div>
        </form>
      </section>

      <section className="panel admin-table-scroll">
        {"error" in result && result.error ? (
          <div className="catalog-empty-admin">Không tải được đơn hàng: {result.error}</div>
        ) : result.rows.length === 0 ? (
          <div className="catalog-empty-admin">Không có đơn phù hợp bộ lọc.</div>
        ) : (
          <table className="admin-table-placeholder admin-orders-table">
            <thead>
              <tr><th>Mã đơn</th><th>Khách hàng</th><th>SĐT</th><th>Loại</th><th>Trạng thái</th><th>Tổng</th><th>Thời gian</th><th></th></tr>
            </thead>
            <tbody>
              {result.rows.map((order) => (
                <tr key={order.id}>
                  <td><strong className="order-code-cell">{order.order_code}</strong></td>
                  <td><div>{order.customer_name}</div>{order.internal_note && <small className="order-table-note">Có ghi chú nội bộ</small>}</td>
                  <td>{order.phone}</td>
                  <td>{order.user_id ? "Customer" : "Guest"}</td>
                  <td><span className={`order-status-badge ${orderStatusClass(order.status)}`}>{orderStatusLabel(order.status)}</span></td>
                  <td><strong>{formatVnd(order.total)}</strong></td>
                  <td>{new Date(order.created_at).toLocaleString("vi-VN")}</td>
                  <td><Link className="admin-small-button" href={`/admin/orders/${order.id}`}>Xử lý</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {result.totalPages > 1 && (
        <nav className="order-pagination" aria-label="Phân trang đơn hàng">
          <Link className={`admin-small-button ${result.page <= 1 ? "is-disabled" : ""}`} href={buildPageHref(hrefParams, Math.max(1, result.page - 1))}>← Trước</Link>
          <span>Trang <strong>{result.page}</strong> / {result.totalPages}</span>
          <Link className={`admin-small-button ${result.page >= result.totalPages ? "is-disabled" : ""}`} href={buildPageHref(hrefParams, Math.min(result.totalPages, result.page + 1))}>Sau →</Link>
        </nav>
      )}
    </>
  );
}
