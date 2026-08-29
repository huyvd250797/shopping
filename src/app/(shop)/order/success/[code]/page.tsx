/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { OrderSuccessLocal } from "@/components/shop/order-success-local";
import { getOrderReceipt } from "@/features/checkout/queries";
import { formatVnd } from "@/lib/catalog/format";

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ code }, query] = await Promise.all([params, searchParams]);
  const token = typeof query.token === "string" ? query.token : "";
  const rows = await getOrderReceipt(code, token);

  if (rows.length === 0) {
    return (
      <div className="container-app checkout-page">
        <div className="checkout-unavailable-card">
          <span className="route-chip">Bảo vệ thông tin đơn hàng</span>
          <h1>Không thể mở chi tiết đơn</h1>
          <p>Liên kết thiếu hoặc sai mã xác thực. Với đơn Guest, hãy mở lại từ mục “Đơn hàng” trên đúng trình duyệt đã đặt.</p>
          <div className="checkout-success-actions"><Link className="secondary-link-button" href="/orders">Xem đơn trên thiết bị</Link><Link className="secondary-link-button" href="/">Về trang chủ</Link></div>
        </div>
      </div>
    );
  }

  const order = rows[0];
  return (
    <div className="container-app checkout-page">
      <OrderSuccessLocal order={{ orderCode: order.order_code, accessToken: token, createdAt: order.created_at, productName: rows.map((item) => item.product_name).join(", "), total: order.total }} />
      <section className="checkout-success-card">
        <div className="checkout-success-icon">✓</div>
        <span className="route-chip">Đặt hàng thành công</span>
        <h1>Cảm ơn bạn đã đặt hàng!</h1>
        <p>Đơn đã được lưu vào database với trạng thái <strong>Mới</strong>. Admin có thể tiếp nhận đơn ở phiên bản quản lý đơn tiếp theo.</p>
        <div className="checkout-order-code"><span>Mã đơn</span><strong>{order.order_code}</strong></div>

        <div className="checkout-success-grid">
          <div><span>Người nhận</span><strong>{order.customer_name}</strong></div>
          <div><span>Số điện thoại</span><strong>{order.phone}</strong></div>
          <div className="checkout-success-full"><span>Địa chỉ giao hàng</span><strong>{order.address_line}, {order.ward}, {order.district}, {order.province}</strong></div>
        </div>

        <div className="checkout-receipt-items">
          {rows.map((item, index) => (
            <div className="checkout-receipt-item" key={`${item.order_id}-${index}`}>
              <div>{item.image_url ? <img src={item.image_url} alt={item.product_name} /> : <span>🛍️</span>}</div>
              <div><strong>{item.product_name}</strong>{item.sku && <small>SKU: {item.sku}</small>}<small>{formatVnd(item.unit_price)} × {item.quantity}</small></div>
              <strong>{formatVnd(item.line_total)}</strong>
            </div>
          ))}
        </div>

        <div className="checkout-receipt-total"><span>Tạm tính</span><strong>{formatVnd(order.subtotal)}</strong><span>Phí vận chuyển</span><strong>{formatVnd(order.shipping_fee)}</strong><span className="total-label">Tổng cộng</span><strong className="total-value">{formatVnd(order.total)}</strong></div>
        <p className="checkout-local-note">Mã đơn và token xem đơn đã được lưu trên trình duyệt này. Database vẫn là nguồn dữ liệu chính.</p>
        <div className="checkout-success-actions"><Link className="checkout-primary-link" href="/">Tiếp tục mua sắm</Link><Link className="secondary-link-button" href="/orders">Xem lịch sử mua</Link></div>
      </section>
    </div>
  );
}
