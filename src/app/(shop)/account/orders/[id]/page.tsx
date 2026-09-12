/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/user";
import { getMyOrderDetail } from "@/features/account/queries";
import { orderStatusClass, orderStatusLabel } from "@/features/orders/status";
import { formatVnd } from "@/lib/catalog/format";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function MyOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { user } = await requireUser(`/account/orders/${id}`);
  const detail = await getMyOrderDetail(user.id, id);
  if (!detail) return notFound();
  const { order, items, history } = detail;
  const address = [order.address_line, order.ward, order.district, order.province].filter(Boolean).join(", ");

  return (
    <div className="container-app account-page customer-order-detail-page">
      <div className="account-head">
        <div>
          <span className={`order-status-badge ${orderStatusClass(order.status)}`}>{orderStatusLabel(order.status)}</span>
          <h1>Đơn {order.order_code}</h1>
          <p>Đặt lúc {new Date(order.created_at).toLocaleString("vi-VN")} • Cập nhật {new Date(order.updated_at).toLocaleString("vi-VN")}</p>
        </div>
        <Link className="secondary-link-button" href="/account/orders">← Danh sách đơn</Link>
      </div>

      <div className="customer-order-detail-grid">
        <section className="account-card">
          <h2>Sản phẩm</h2>
          <div className="customer-order-items">
            {items.map((item) => (
              <div className="customer-order-item" key={item.id}>
                <div className="customer-order-item-image">{item.image_snapshot ? <img src={item.image_snapshot} alt={item.product_name_snapshot} /> : <span>🛍️</span>}</div>
                <div><strong>{item.product_name_snapshot}</strong><small>{item.sku_snapshot ? `SKU: ${item.sku_snapshot} • ` : ""}Số lượng: {item.quantity}</small></div>
                <strong>{formatVnd(item.line_total)}</strong>
              </div>
            ))}
          </div>
          <div className="customer-order-totals">
            <div><span>Tạm tính</span><strong>{formatVnd(order.subtotal)}</strong></div>
            <div><span>Phí vận chuyển</span><strong>{formatVnd(order.shipping_fee)}</strong></div>
            {order.discount > 0 && <div><span>Giảm giá</span><strong>-{formatVnd(order.discount)}</strong></div>}
            <div className="customer-order-grand-total"><span>Tổng cộng</span><strong>{formatVnd(order.total)}</strong></div>
          </div>
        </section>

        <aside className="account-card customer-order-receiver">
          <h2>Thông tin nhận hàng</h2>
          <dl>
            <div><dt>Người nhận</dt><dd>{order.customer_name}</dd></div>
            <div><dt>Số điện thoại</dt><dd>{order.phone}</dd></div>
            {order.email && <div><dt>Email</dt><dd>{order.email}</dd></div>}
            <div><dt>Địa chỉ</dt><dd>{address}</dd></div>
            {order.note && <div><dt>Ghi chú</dt><dd>{order.note}</dd></div>}
          </dl>
        </aside>
      </div>

      <section className="account-card customer-order-timeline-card">
        <h2>Tiến trình đơn hàng</h2>
        <div className="customer-order-timeline">
          {history.length === 0 ? <div className="account-empty-inline">Chưa có lịch sử trạng thái.</div> : history.map((event) => (
            <div className="customer-order-timeline-row" key={event.id}>
              <span className="customer-order-timeline-dot" aria-hidden />
              <div><strong>{orderStatusLabel(event.to_status)}</strong><small>{new Date(event.created_at).toLocaleString("vi-VN")}</small>{event.note && <p>{event.note}</p>}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
