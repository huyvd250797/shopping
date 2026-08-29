import Link from "next/link";
import { getCatalogKpis } from "@/features/catalog/admin-queries";
import { getOrderCaptureKpis } from "@/features/checkout/admin-queries";
import { getAdminBanners } from "@/features/home/admin-queries";

export default async function AdminDashboardPage() {
  const [kpi, banners, orders] = await Promise.all([getCatalogKpis(), getAdminBanners(), getOrderCaptureKpis()]);
  return (
    <>
      <div className="admin-page-head">
        <div><h1>Dashboard</h1><p>V0.5.0 đã nhận đơn Direct thật; màn hình xử lý workflow đầy đủ sẽ được nâng ở V0.6.0.</p></div>
        <div className="admin-head-actions"><Link className="admin-small-button" href="/admin/orders">Đơn hàng</Link><Link className="admin-primary-button" href="/admin/products/new">+ Thêm sản phẩm</Link></div>
      </div>
      <section className="kpi-grid">
        <div className="kpi-card"><span>Sản phẩm hiển thị</span><strong>{kpi.active}</strong></div>
        <div className="kpi-card"><span>Danh mục active</span><strong>{kpi.categories}</strong></div>
        <div className="kpi-card"><span>Đơn đã nhận</span><strong>{orders.total}</strong></div>
        <div className="kpi-card"><span>Đơn mới</span><strong>{orders.fresh}</strong></div>
      </section>
      <section className="panel">
        <h2>Trạng thái roadmap</h2>
        <table className="admin-table-placeholder">
          <thead><tr><th>Module</th><th>Version</th><th>Trạng thái</th></tr></thead>
          <tbody>
            <tr><td>Foundation + Admin Auth</td><td>V0.1.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Customer Auth + Roles</td><td>V0.2.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Catalog & CMS Core</td><td>V0.3.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Home & Search UX</td><td>V0.4.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Direct Checkout</td><td>V0.5.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Order Admin</td><td>V0.6.0</td><td>Next</td></tr>
          </tbody>
        </table>
      </section>
      <section className="panel"><h2>Home CMS</h2><p>{banners.length} banner đã cấu hình. Catalog/Home/Search vẫn giữ nguyên từ V0.4.0.</p></section>
    </>
  );
}
