import Link from "next/link";
import { getRecentAdminOrders } from "@/features/checkout/admin-orders";
import { formatVnd } from "@/lib/catalog/format";

export default async function AdminOrdersPage() {
  const orders = await getRecentAdminOrders(50);
  return (
    <>
      <div className="admin-page-head"><div><h1>Đơn hàng</h1><p>V0.5.0 hiển thị read-only các đơn Direct đã nhận. Workflow xử lý đầy đủ được nâng ở V0.6.0.</p></div><span className="route-chip">{orders.length} đơn gần nhất</span></div>
      <section className="panel admin-table-scroll">
        {orders.length === 0 ? <div className="catalog-empty-admin">Chưa có đơn Direct nào.</div> : (
          <table className="admin-table-placeholder admin-orders-table">
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>SĐT</th><th>Loại</th><th>Trạng thái</th><th>Tổng</th><th>Thời gian</th><th></th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.order_code}</strong></td><td>{order.customer_name}</td><td>{order.phone}</td><td>{order.user_id ? "Customer" : "Guest"}</td><td><span className="order-status-badge">{order.status}</span></td><td>{formatVnd(order.total)}</td><td>{new Date(order.created_at).toLocaleString("vi-VN")}</td><td><Link className="admin-small-button" href={`/admin/orders/${order.id}`}>Xem</Link></td></tr>)}</tbody>
          </table>
        )}
      </section>
      <div className="foundation-callout"><strong>Ranh giới V0.5.0:</strong> màn hình này chỉ đọc dữ liệu. Search/filter nâng cao, đổi status, internal note, cancel/archive và audit thao tác thuộc V0.6.0.</div>
    </>
  );
}
