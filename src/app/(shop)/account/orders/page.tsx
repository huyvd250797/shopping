import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { getMyOrders } from "@/features/account/queries";
import { ORDER_STATUSES, isOrderStatus, orderStatusClass, orderStatusLabel } from "@/features/orders/status";
import { formatVnd } from "@/lib/catalog/format";
import { SyncRecentOrders } from "@/components/shop/sync-recent-orders";

function pageHref(status: string, page: number) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/account/orders?${query}` : "/account/orders";
}

export default async function MyOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const first = (key: string) => (Array.isArray(raw[key]) ? raw[key]?.[0] : raw[key]) || "";
  const status = isOrderStatus(first("status")) ? first("status") : "";
  const page = Math.max(1, Number(first("page") || 1));
  const { user } = await requireUser("/account/orders");
  const result = await getMyOrders(user.id, { status, page });

  return (
    <div className="container-app account-page">
      <div className="account-head customer-orders-head">
        <div>
          <span className="route-chip">V0.8.0 • Synced Orders</span>
          <h1>Đơn hàng của tôi</h1>
          <p>Danh sách này đọc trực tiếp từ database theo tài khoản. Các đơn guest còn token trên thiết bị sẽ được đồng bộ an toàn khi bạn mở trang.</p>
        </div>
        <Link className="secondary-link-button" href="/account">← Hồ sơ</Link>
      </div>

      <SyncRecentOrders userId={user.id} />

      <form className="customer-order-filter" method="get">
        <label>
          <span>Trạng thái</span>
          <select name="status" defaultValue={status}>
            <option value="">Tất cả đơn</option>
            {ORDER_STATUSES.map((item) => <option key={item} value={item}>{orderStatusLabel(item)}</option>)}
          </select>
        </label>
        <button className="secondary-button" type="submit">Lọc</button>
        {status && <Link href="/account/orders">Đặt lại</Link>}
      </form>

      {"error" in result && result.error ? (
        <div className="account-empty-state">Không tải được đơn hàng. Hãy kiểm tra migration V0.8.0 và thử lại.</div>
      ) : result.rows.length === 0 ? (
        <div className="account-empty-state">
          <strong>Chưa có đơn phù hợp.</strong>
          <span>Đơn Direct Order khi đăng nhập sẽ tự xuất hiện ở đây. Đơn guest có token trên trình duyệt cũng được đồng bộ khi có thể.</span>
          <Link className="primary-link-button" href="/">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div className="customer-order-list">
          {result.rows.map((order) => (
            <article className="customer-order-card" key={order.id}>
              <div className="customer-order-card-top">
                <div><small>Mã đơn</small><strong className="mono-text">{order.order_code}</strong></div>
                <span className={`order-status-badge ${orderStatusClass(order.status)}`}>{orderStatusLabel(order.status)}</span>
              </div>
              <div className="customer-order-card-body">
                <div><span>Ngày đặt</span><strong>{new Date(order.created_at).toLocaleString("vi-VN")}</strong></div>
                <div><span>Người nhận</span><strong>{order.customer_name}</strong></div>
                <div><span>Tổng tiền</span><strong className="customer-order-total">{formatVnd(order.total)}</strong></div>
                <div className="customer-order-address"><span>Giao đến</span><strong>{[order.address_line, order.ward, order.district, order.province].filter(Boolean).join(", ")}</strong></div>
              </div>
              <Link className="primary-link-button" href={`/account/orders/${order.id}`}>Xem chi tiết</Link>
            </article>
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <nav className="customer-order-pagination" aria-label="Phân trang đơn hàng">
          <Link className={result.page <= 1 ? "is-disabled" : ""} href={pageHref(status, Math.max(1, result.page - 1))}>← Trước</Link>
          <span>Trang <strong>{result.page}</strong> / {result.totalPages}</span>
          <Link className={result.page >= result.totalPages ? "is-disabled" : ""} href={pageHref(status, Math.min(result.totalPages, result.page + 1))}>Sau →</Link>
        </nav>
      )}
    </div>
  );
}
