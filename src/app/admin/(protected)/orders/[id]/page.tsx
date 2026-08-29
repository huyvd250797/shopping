import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrderDetail } from "@/features/checkout/admin-orders";
import { formatVnd } from "@/lib/catalog/format";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getAdminOrderDetail(id);
  if (!detail) notFound();
  const { order, items, history } = detail;

  return (
    <>
      <div className="admin-page-head"><div><div className="catalog-breadcrumb"><Link href="/admin/orders">Đơn hàng</Link><span>/</span><span>{order.order_code}</span></div><h1>{order.order_code}</h1><p>Chi tiết read-only V0.5.0 • {order.user_id ? "Customer" : "Guest"}</p></div><span className="order-status-badge">{order.status}</span></div>
      <div className="admin-order-detail-grid">
        <section className="panel"><h2>Thông tin nhận hàng</h2><dl className="admin-order-dl"><div><dt>Khách hàng</dt><dd>{order.customer_name}</dd></div><div><dt>SĐT</dt><dd>{order.phone}</dd></div>{order.email && <div><dt>Email</dt><dd>{order.email}</dd></div>}<div><dt>Địa chỉ</dt><dd>{order.address_line}, {order.ward}, {order.district}, {order.province}</dd></div>{order.note && <div><dt>Ghi chú</dt><dd>{order.note}</dd></div>}</dl></section>
        <section className="panel"><h2>Tổng tiền</h2><dl className="admin-order-dl"><div><dt>Tạm tính</dt><dd>{formatVnd(order.subtotal)}</dd></div><div><dt>Phí vận chuyển</dt><dd>{formatVnd(order.shipping_fee)}</dd></div><div><dt>Tổng</dt><dd><strong>{formatVnd(order.total)}</strong></dd></div><div><dt>Tạo lúc</dt><dd>{new Date(order.created_at).toLocaleString("vi-VN")}</dd></div></dl></section>
      </div>
      <section className="panel admin-table-scroll"><h2>Sản phẩm</h2><table className="admin-table-placeholder"><thead><tr><th>Sản phẩm</th><th>SKU</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.product_name_snapshot}</td><td>{item.sku_snapshot || "—"}</td><td>{formatVnd(item.unit_price_snapshot)}</td><td>{item.quantity}</td><td>{formatVnd(item.line_total)}</td></tr>)}</tbody></table></section>
      <section className="panel"><h2>Timeline hiện tại</h2>{history.length === 0 ? <p>Chưa có lịch sử trạng thái.</p> : <div className="admin-order-timeline">{history.map((row) => <div key={row.id}><span>{new Date(row.created_at).toLocaleString("vi-VN")}</span><strong>{row.from_status || "Khởi tạo"} → {row.to_status}</strong>{row.note && <small>{row.note}</small>}</div>)}</div>}</section>
      <div className="foundation-callout"><strong>V0.6.0:</strong> tại đây sẽ có action đổi trạng thái, ghi chú nội bộ, cancel/archive và audit vận hành.</div>
    </>
  );
}
