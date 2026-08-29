import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/admin/copy-button";
import { getAdminOrderDetail } from "@/features/orders/admin";
import { ORDER_STATUS_TRANSITIONS, isOrderStatus, orderStatusClass, orderStatusLabel, type OrderStatus } from "@/features/orders/status";
import { formatVnd } from "@/lib/catalog/format";
import { transitionOrderAction, updateOrderInternalNoteAction } from "../../order-actions";

const errors: Record<string, string> = {
  INVALID_ORDER_STATUS: "Trạng thái không hợp lệ.",
  ORDER_NOT_FOUND: "Không tìm thấy đơn hàng.",
  STATUS_NOT_CHANGED: "Trạng thái mới trùng trạng thái hiện tại.",
  INVALID_STATUS_TRANSITION: "Không được phép chuyển trạng thái theo hướng này.",
  CANCEL_REASON_REQUIRED: "Khi hủy đơn, cần nhập lý do ít nhất 3 ký tự.",
  STATUS_NOTE_TOO_LONG: "Ghi chú trạng thái quá dài.",
  INTERNAL_NOTE_TOO_LONG: "Ghi chú nội bộ quá dài.",
  ORDER_UPDATE_FAILED: "Không thể cập nhật đơn hàng. Vui lòng kiểm tra migration V0.6.0.",
};

const auditLabels: Record<string, string> = {
  order_status_changed: "Đổi trạng thái đơn",
  order_internal_note_updated: "Cập nhật ghi chú nội bộ",
};

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const qs = await searchParams;
  const detail = await getAdminOrderDetail(id);
  if (!detail) notFound();
  const { order, items, history, audit } = detail;
  const currentStatus: OrderStatus = isOrderStatus(order.status) ? order.status : "NEW";
  const nextStatuses: OrderStatus[] = ORDER_STATUS_TRANSITIONS[currentStatus];
  const errorCode = Array.isArray(qs.error) ? qs.error[0] : qs.error;
  const updated = Array.isArray(qs.updated) ? qs.updated[0] : qs.updated;
  const fullAddress = [order.address_line, order.ward, order.district, order.province].filter(Boolean).join(", ");

  return (
    <>
      <div className="admin-page-head order-detail-head">
        <div>
          <div className="catalog-breadcrumb"><Link href="/admin/orders">Đơn hàng</Link><span>/</span><span>{order.order_code}</span></div>
          <div className="order-detail-title-row">
            <h1>{order.order_code}</h1>
            <CopyButton value={order.order_code} label="Copy mã" />
          </div>
          <p>{order.user_id ? "Customer đã đăng nhập" : "Guest Checkout"} • tạo {new Date(order.created_at).toLocaleString("vi-VN")}</p>
        </div>
        <span className={`order-status-badge order-status-large ${orderStatusClass(currentStatus)}`}>{orderStatusLabel(currentStatus)}</span>
      </div>

      {updated === "status" && <div className="admin-inline-message success">Đã cập nhật trạng thái và ghi timeline/audit.</div>}
      {updated === "note" && <div className="admin-inline-message success">Đã lưu ghi chú nội bộ.</div>}
      {errorCode && <div className="admin-inline-message error">{errors[errorCode] || "Cập nhật không thành công."}</div>}

      <div className="admin-order-detail-grid order-detail-top-grid">
        <section className="panel">
          <div className="panel-title-row"><h2>Thông tin nhận hàng</h2><span>{order.user_id ? "Customer" : "Guest"}</span></div>
          <dl className="admin-order-dl">
            <div><dt>Khách hàng</dt><dd>{order.customer_name}</dd></div>
            <div><dt>SĐT</dt><dd className="order-value-actions"><a href={`tel:${order.phone}`}>{order.phone}</a><CopyButton value={order.phone} label="Copy" /></dd></div>
            {order.email && <div><dt>Email</dt><dd><a href={`mailto:${order.email}`}>{order.email}</a></dd></div>}
            <div><dt>Địa chỉ</dt><dd className="order-address-value"><span>{fullAddress}</span><CopyButton value={fullAddress} label="Copy địa chỉ" /></dd></div>
            {order.note && <div><dt>Ghi chú khách</dt><dd>{order.note}</dd></div>}
          </dl>
        </section>

        <section className="panel">
          <h2>Tổng tiền</h2>
          <dl className="admin-order-dl">
            <div><dt>Tạm tính</dt><dd>{formatVnd(order.subtotal)}</dd></div>
            <div><dt>Phí vận chuyển</dt><dd>{formatVnd(order.shipping_fee)}</dd></div>
            {order.discount > 0 && <div><dt>Giảm giá</dt><dd>-{formatVnd(order.discount)}</dd></div>}
            <div><dt>Tổng</dt><dd><strong className="order-total-value">{formatVnd(order.total)}</strong></dd></div>
            <div><dt>Cập nhật gần nhất</dt><dd>{new Date(order.updated_at).toLocaleString("vi-VN")}</dd></div>
          </dl>
        </section>
      </div>

      <div className="order-management-grid">
        <section className="panel order-workflow-panel">
          <div className="panel-title-row"><h2>Xử lý trạng thái</h2><span>Workflow có kiểm soát</span></div>
          {nextStatuses.length === 0 ? (
            <div className="order-terminal-state">Đơn đang ở trạng thái kết thúc <strong>{orderStatusLabel(currentStatus)}</strong>, không còn bước chuyển tiếp.</div>
          ) : (
            <form action={transitionOrderAction} className="order-admin-form">
              <input type="hidden" name="order_id" value={order.id} />
              <label>
                <span>Chuyển sang</span>
                <select name="to_status" required defaultValue={nextStatuses[0]}>
                  {nextStatuses.map((status) => <option key={status} value={status}>{orderStatusLabel(status)}</option>)}
                </select>
              </label>
              <label>
                <span>Ghi chú xử lý / lý do hủy</span>
                <textarea name="note" maxLength={500} rows={4} placeholder="Bắt buộc khi chọn Đã hủy; các trạng thái khác có thể để trống." />
              </label>
              <div className="order-transition-hint">
                Từ <strong>{orderStatusLabel(currentStatus)}</strong> có thể chuyển tới: {nextStatuses.map(orderStatusLabel).join(" • ")}.
              </div>
              <button className="admin-primary-button" type="submit">Cập nhật trạng thái</button>
            </form>
          )}
        </section>

        <section className="panel">
          <div className="panel-title-row"><h2>Ghi chú nội bộ</h2><span>Chỉ Admin thấy</span></div>
          <form action={updateOrderInternalNoteAction} className="order-admin-form">
            <input type="hidden" name="order_id" value={order.id} />
            <label>
              <span>Nội dung</span>
              <textarea name="internal_note" maxLength={2000} rows={7} defaultValue={order.internal_note || ""} placeholder="Ví dụ: Đã gọi xác nhận, khách muốn giao sau 18h..." />
            </label>
            <small className="order-form-help">Không hiển thị cho khách hàng. Có thể xóa nội dung và lưu để bỏ ghi chú.</small>
            <button className="admin-small-button order-note-save" type="submit">Lưu ghi chú</button>
          </form>
        </section>
      </div>

      <section className="panel admin-table-scroll">
        <h2>Sản phẩm</h2>
        <table className="admin-table-placeholder order-items-table">
          <thead><tr><th>Sản phẩm</th><th>SKU</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.product_name_snapshot}</strong></td>
                <td>{item.sku_snapshot || "—"}</td>
                <td>{formatVnd(item.unit_price_snapshot)}</td>
                <td>{item.quantity}</td>
                <td><strong>{formatVnd(item.line_total)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="order-history-grid">
        <section className="panel">
          <div className="panel-title-row"><h2>Timeline trạng thái</h2><span>{history.length} sự kiện</span></div>
          {history.length === 0 ? <p>Chưa có lịch sử trạng thái.</p> : (
            <div className="admin-order-timeline enhanced-timeline">
              {history.map((row) => (
                <div key={row.id}>
                  <span>{new Date(row.created_at).toLocaleString("vi-VN")} • {row.actor_label || (row.changed_by ? "Admin" : "Hệ thống")}</span>
                  <strong>{row.from_status ? orderStatusLabel(row.from_status) : "Khởi tạo"} → {orderStatusLabel(row.to_status)}</strong>
                  {row.note && <small>{row.note}</small>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-title-row"><h2>Audit vận hành</h2><Link href="/admin/audit">Xem tất cả</Link></div>
          {audit.length === 0 ? <p>Chưa có audit thao tác Admin cho đơn này.</p> : (
            <div className="order-audit-list">
              {audit.map((row) => (
                <div key={row.id}>
                  <strong>{auditLabels[row.action] || row.action}</strong>
                  <span>{new Date(row.created_at).toLocaleString("vi-VN")} • {row.actor_label || "Admin"}</span>
                  {row.action === "order_status_changed" && row.payload && (
                    <small>{String(row.payload.from_status || "—")} → {String(row.payload.to_status || "—")}</small>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
