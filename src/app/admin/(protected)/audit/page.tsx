import Link from "next/link";
import { getAdminAuditLogs } from "@/features/orders/admin";

const actionLabels: Record<string, string> = {
  order_status_changed: "Đổi trạng thái đơn",
  order_internal_note_updated: "Cập nhật ghi chú nội bộ",
  product_created: "Tạo sản phẩm",
  product_updated: "Cập nhật sản phẩm",
  product_deleted: "Xóa mềm sản phẩm",
  product_restored: "Khôi phục sản phẩm",
  category_created: "Tạo danh mục",
  category_updated: "Cập nhật danh mục",
  category_deleted: "Xóa danh mục",
  banner_created: "Tạo banner",
  banner_updated: "Cập nhật banner",
  banner_deleted: "Xóa banner",
};

export default async function AdminAuditPage() {
  const rows = await getAdminAuditLogs(100);
  return (
    <>
      <div className="admin-page-head">
        <div><h1>Audit Log</h1><p>V0.6.0 hiển thị log vận hành gần nhất; trọng tâm là truy vết thao tác xử lý đơn.</p></div>
        <span className="route-chip">{rows.length} log gần nhất</span>
      </div>
      <section className="panel admin-table-scroll">
        {rows.length === 0 ? <div className="catalog-empty-admin">Chưa có audit log.</div> : (
          <table className="admin-table-placeholder audit-table">
            <thead><tr><th>Thời gian</th><th>Người thao tác</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead>
            <tbody>
              {rows.map((row) => {
                const orderCode = row.payload && typeof row.payload.order_code === "string" ? row.payload.order_code : null;
                return (
                  <tr key={row.id}>
                    <td>{new Date(row.created_at).toLocaleString("vi-VN")}</td>
                    <td>{row.actor_label || (row.actor_id ? row.actor_id.slice(0, 8) : "Hệ thống")}</td>
                    <td><strong>{actionLabels[row.action] || row.action}</strong></td>
                    <td>
                      {row.entity_type === "order" && row.entity_id ? <Link href={`/admin/orders/${row.entity_id}`}>{orderCode || "Order"}</Link> : `${row.entity_type}${row.entity_id ? ` • ${row.entity_id.slice(0, 8)}` : ""}`}
                    </td>
                    <td className="audit-payload-cell">
                      {row.action === "order_status_changed" && row.payload ? `${String(row.payload.from_status || "—")} → ${String(row.payload.to_status || "—")}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
      <div className="foundation-callout"><strong>V0.6.0:</strong> Audit Log đã dùng được để truy vết Order Admin. Search/export/audit chuyên sâu toàn hệ thống vẫn để cho Hardening/Production Ready.</div>
    </>
  );
}
